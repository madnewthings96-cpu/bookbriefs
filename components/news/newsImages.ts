import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../firebase';

export type NewsRepositoryErrorCode = 'permission' | 'offline' | 'validation' | 'conflict' | 'unknown';

export class NewsRepositoryError extends Error {
  constructor(
    public readonly code: NewsRepositoryErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'NewsRepositoryError';
  }
}

export interface NewsImageUpload {
  imagePath: string;
  imageUrl: string;
}

const isRepositoryError = (error: unknown): error is NewsRepositoryError => error instanceof NewsRepositoryError;

export function mapNewsRepositoryError(error: unknown): NewsRepositoryError {
  if (isRepositoryError(error)) return error;
  const firebaseCode = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
    ? error.code.replace(/^storage\//, '')
    : '';
  const message = error instanceof Error ? error.message : 'The news service encountered an unexpected error.';

  if (firebaseCode === 'permission-denied' || firebaseCode === 'unauthorized') {
    return new NewsRepositoryError('permission', message, error);
  }
  if (['unavailable', 'deadline-exceeded', 'network-request-failed', 'retry-limit-exceeded'].includes(firebaseCode)) {
    return new NewsRepositoryError('offline', message, error);
  }
  if (['invalid-argument', 'invalid-format', 'invalid-url', 'invalid-checksum'].includes(firebaseCode)) {
    return new NewsRepositoryError('validation', message, error);
  }
  if (['already-exists', 'aborted'].includes(firebaseCode)) {
    return new NewsRepositoryError('conflict', message, error);
  }
  return new NewsRepositoryError('unknown', message, error);
}

async function imageOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapNewsRepositoryError(error);
  }
}

const safeFileName = (name: string): string => {
  const normalized = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'image';
};

export async function uploadNewsImage(
  articleId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<NewsImageUpload> {
  return imageOperation(async () => {
    if (!articleId || !file) throw new NewsRepositoryError('validation', 'An article id and image file are required.');
    const articleRef = doc(db, 'newsArticles', articleId);
    const existing = await getDoc(articleRef);
    if (!existing.exists()) throw new NewsRepositoryError('validation', 'Upload an image after creating the news article.');
    const imagePath = `news/${articleId}/${Date.now()}-${safeFileName(file.name)}`;
    const imageRef = ref(storage, imagePath);
    const task = uploadBytesResumable(imageRef, file, { contentType: file.type || 'application/octet-stream' });
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed', (snapshot) => {
        if (snapshot.totalBytes > 0) onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes);
      }, reject, resolve);
    });
    const imageUrl = await getDownloadURL(imageRef);
    const oldImagePath = typeof existing.data().imagePath === 'string' ? existing.data().imagePath : '';
    await updateDoc(articleRef, { imagePath, imageUrl, updatedAt: serverTimestamp() });
    if (oldImagePath && oldImagePath !== imagePath) await deleteNewsImage(oldImagePath);
    return { imagePath, imageUrl };
  });
}

export async function deleteNewsImage(path: string): Promise<void> {
  return imageOperation(async () => {
    if (!path) return;
    await deleteObject(ref(storage, path));
  });
}
