import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  NEWS_CATEGORIES,
  NEWS_PAGE_SIZE,
  type NewsArticle,
  type NewsArticleDraft,
  type NewsCategory,
  type NewsSource,
  type NewsStatus,
  validateNewsDraft,
} from './newsModel';
import {
  deleteNewsImage,
  mapNewsRepositoryError as mapRepositoryError,
  NewsRepositoryError,
} from './newsImages';

export { deleteNewsImage, getNewsImageUrl, loadNewsImageBlob, uploadNewsImage, NewsRepositoryError } from './newsImages';
export type { NewsImageUpload, NewsRepositoryErrorCode } from './newsImages';

const ARTICLES_COLLECTION = 'newsArticles';
const SLUGS_COLLECTION = 'newsArticleSlugs';
const CONFIG_DOCUMENT = 'newsConfig/editorial';

export interface NewsCursor {
  id: string;
  publishedAt: Date;
}

export interface NewsPageResult {
  articles: NewsArticle[];
  nextCursor: NewsCursor | null;
}

type DraftNewsArticle = NewsArticleDraft & { status: 'draft' };
type NormalizedNewsArticle = NewsArticle | DraftNewsArticle;
type StoredNewsArticleTransition = { status?: unknown; slug?: unknown; publishedAt?: unknown } | null;

export type NewsArticleTransitionOperation = 'save' | 'publish';

const asDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getTime());
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  return null;
};

const isNewsCategory = (value: unknown): value is NewsCategory => (
  typeof value === 'string' && (NEWS_CATEGORIES as readonly string[]).includes(value)
);

const isNewsSource = (value: unknown): value is NewsSource => (
  !!value && typeof value === 'object'
  && typeof (value as NewsSource).label === 'string'
  && typeof (value as NewsSource).url === 'string'
);

async function repositoryOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapRepositoryError(error);
  }
}

function requireValidDraft(draft: NewsArticleDraft, mode: 'draft' | 'publish'): void {
  if (!draft || typeof draft !== 'object') {
    throw new NewsRepositoryError('validation', 'A news draft is required.');
  }
  const errors = validateNewsDraft(draft, mode);
  if (Object.keys(errors).length > 0) {
    throw new NewsRepositoryError('validation', 'The news draft contains invalid fields.');
  }
}

export function assertNewsArticleTransition(
  existing: StoredNewsArticleTransition,
  draft: Pick<NewsArticleDraft, 'slug'>,
  operation: NewsArticleTransitionOperation,
): void {
  if (!existing) return;
  const hasPublishedAt = existing.publishedAt !== null && existing.publishedAt !== undefined;
  if (hasPublishedAt && existing.slug !== draft.slug) {
    throw new NewsRepositoryError('validation', 'A news article slug cannot change after first publication.');
  }
  if (operation === 'save' && existing.status === 'published') {
    throw new NewsRepositoryError('conflict', 'Published news articles must be edited through publication.');
  }
}

function articleFields(draft: NewsArticleDraft): Omit<NewsArticleDraft, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'> {
  return {
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    body: draft.body,
    category: draft.category,
    language: 'en',
    authorName: draft.authorName,
    imageUrl: draft.imageUrl,
    imagePath: draft.imagePath,
    imageAlt: draft.imageAlt,
    sources: draft.sources.map((source) => ({ label: source.label, url: source.url })),
  };
}

export function normalizeNewsDocument(id: string, data: unknown): NormalizedNewsArticle | null {
  if (!id || !data || typeof data !== 'object') return null;
  const document = data as Record<string, unknown>;
  if (
    typeof document.title !== 'string'
    || typeof document.slug !== 'string'
    || typeof document.excerpt !== 'string'
    || typeof document.body !== 'string'
    || !isNewsCategory(document.category)
    || document.language !== 'en'
    || typeof document.authorName !== 'string'
    || typeof document.imageUrl !== 'string'
    || typeof document.imagePath !== 'string'
    || typeof document.imageAlt !== 'string'
    || !Array.isArray(document.sources)
    || !document.sources.every(isNewsSource)
    || (document.status !== 'draft' && document.status !== 'published')
  ) return null;

  const createdAt = asDate(document.createdAt);
  const updatedAt = asDate(document.updatedAt);
  const publishedAt = document.publishedAt === null || document.publishedAt === undefined ? null : asDate(document.publishedAt);
  if (!createdAt || !updatedAt || (document.publishedAt !== null && document.publishedAt !== undefined && !publishedAt)) return null;
  if (document.status === 'published' && !publishedAt) return null;

  const base = {
    id,
    title: document.title,
    slug: document.slug,
    excerpt: document.excerpt,
    body: document.body,
    category: document.category,
    language: 'en' as const,
    authorName: document.authorName,
    imageUrl: document.imageUrl,
    imagePath: document.imagePath,
    imageAlt: document.imageAlt,
    sources: document.sources.map((source) => ({ label: source.label, url: source.url })),
    createdAt,
    updatedAt,
    publishedAt,
  };
  return document.status === 'published'
    ? { ...base, status: 'published', publishedAt: publishedAt as Date }
    : { ...base, status: 'draft' };
}

export function createNewsCursor(article: NewsArticle): NewsCursor {
  return { id: article.id, publishedAt: new Date(article.publishedAt.getTime()) };
}

export async function listPublishedNews({
  category,
  cursor,
}: { category?: NewsCategory; cursor?: NewsCursor | null } = {}): Promise<NewsPageResult> {
  return repositoryOperation(async () => {
    const constraints: QueryConstraint[] = [where('status', '==', 'published')];
    if (category) constraints.push(where('category', '==', category));
    constraints.push(orderBy('publishedAt', 'desc'), orderBy(documentId(), 'desc'));
    if (cursor) constraints.push(startAfter(cursor.publishedAt, cursor.id));
    constraints.push(limit(NEWS_PAGE_SIZE));
    const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), ...constraints));
    const articles = snapshot.docs
      .map((entry) => normalizeNewsDocument(entry.id, entry.data()))
      .filter((article): article is NewsArticle => article?.status === 'published');
    return {
      articles,
      nextCursor: snapshot.docs.length === NEWS_PAGE_SIZE && articles.length > 0
        ? createNewsCursor(articles[articles.length - 1])
        : null,
    };
  });
}

export async function getPublishedNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  return repositoryOperation(async () => {
    if (!slug) return null;
    const mapping = await getDoc(doc(db, SLUGS_COLLECTION, slug));
    const articleId = mapping.exists() && typeof mapping.data().articleId === 'string' ? mapping.data().articleId : null;
    if (!articleId) return null;
    const snapshot = await getDoc(doc(db, ARTICLES_COLLECTION, articleId));
    const article = snapshot.exists() ? normalizeNewsDocument(snapshot.id, snapshot.data()) : null;
    return article?.status === 'published' ? article : null;
  });
}

export async function getFeaturedNewsArticleId(): Promise<string | null> {
  return repositoryOperation(async () => {
    const snapshot = await getDoc(doc(db, CONFIG_DOCUMENT));
    const featuredArticleId = snapshot.exists() ? snapshot.data().featuredArticleId : null;
    return typeof featuredArticleId === 'string' && featuredArticleId ? featuredArticleId : null;
  });
}

export async function listAdminNews(status?: NewsStatus): Promise<NormalizedNewsArticle[]> {
  return repositoryOperation(async () => {
    const constraints: QueryConstraint[] = [orderBy('updatedAt', 'desc'), orderBy(documentId(), 'desc')];
    if (status) constraints.unshift(where('status', '==', status));
    const snapshot = await getDocs(query(collection(db, ARTICLES_COLLECTION), ...constraints));
    return snapshot.docs
      .map((entry) => normalizeNewsDocument(entry.id, entry.data()))
      .filter((article): article is NormalizedNewsArticle => article !== null);
  });
}

export async function getAdminNewsArticle(id: string): Promise<NormalizedNewsArticle | null> {
  return repositoryOperation(async () => {
    if (!id) return null;
    const snapshot = await getDoc(doc(db, ARTICLES_COLLECTION, id));
    return snapshot.exists() ? normalizeNewsDocument(snapshot.id, snapshot.data()) : null;
  });
}

export async function saveNewsDraft(draft: NewsArticleDraft): Promise<NormalizedNewsArticle> {
  return repositoryOperation(async () => {
    requireValidDraft(draft, 'draft');
    const articleRef = draft.id ? doc(db, ARTICLES_COLLECTION, draft.id) : doc(collection(db, ARTICLES_COLLECTION));
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(articleRef);
      const existingData = existing.exists() ? existing.data() : null;
      assertNewsArticleTransition(existingData, draft, 'save');
      transaction.set(articleRef, {
        ...articleFields(draft),
        status: 'draft',
        createdAt: existingData?.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: existingData?.publishedAt ?? null,
      });
    });
    const saved = await getAdminNewsArticle(articleRef.id);
    if (!saved) throw new NewsRepositoryError('unknown', 'The saved news draft could not be read.');
    return saved;
  });
}

export async function publishNewsArticle(draft: NewsArticleDraft, makeFeatured: boolean): Promise<NewsArticle> {
  return repositoryOperation(async () => {
    requireValidDraft(draft, 'publish');
    const articleRef = draft.id ? doc(db, ARTICLES_COLLECTION, draft.id) : doc(collection(db, ARTICLES_COLLECTION));
    const slugRef = doc(db, SLUGS_COLLECTION, draft.slug);
    const configRef = doc(db, CONFIG_DOCUMENT);
    await runTransaction(db, async (transaction) => {
      const [existing, slugMapping] = await Promise.all([transaction.get(articleRef), transaction.get(slugRef)]);
      const existingData = existing.exists() ? existing.data() : null;
      assertNewsArticleTransition(existingData, draft, 'publish');
      if (slugMapping.exists() && slugMapping.data().articleId !== articleRef.id) {
        throw new NewsRepositoryError('conflict', 'This slug is permanently reserved by another news article.');
      }
      const publishedAt = existingData && asDate(existingData.publishedAt)
        ? existingData.publishedAt
        : serverTimestamp();
      transaction.set(articleRef, {
        ...articleFields(draft),
        status: 'published',
        createdAt: existingData?.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt,
      }, { merge: true });
      if (!slugMapping.exists()) {
        transaction.set(slugRef, { articleId: articleRef.id, createdAt: serverTimestamp() });
      }
      if (makeFeatured) {
        transaction.set(configRef, { featuredArticleId: articleRef.id, updatedAt: serverTimestamp() }, { merge: true });
      }
    });
    const published = await getAdminNewsArticle(articleRef.id);
    if (!published || published.status !== 'published') {
      throw new NewsRepositoryError('unknown', 'The published news article could not be read.');
    }
    return published;
  });
}

export async function unpublishNewsArticle(id: string): Promise<void> {
  return repositoryOperation(async () => {
    if (!id) throw new NewsRepositoryError('validation', 'A news article id is required.');
    const articleRef = doc(db, ARTICLES_COLLECTION, id);
    const configRef = doc(db, CONFIG_DOCUMENT);
    await runTransaction(db, async (transaction) => {
      const [article, config] = await Promise.all([transaction.get(articleRef), transaction.get(configRef)]);
      if (!article.exists()) throw new NewsRepositoryError('unknown', 'The news article does not exist.');
      transaction.update(articleRef, { status: 'draft', updatedAt: serverTimestamp() });
      if (config.exists() && config.data().featuredArticleId === id) {
        transaction.update(configRef, { featuredArticleId: null, updatedAt: serverTimestamp() });
      }
    });
  });
}

export async function setFeaturedNewsArticle(id: string | null): Promise<void> {
  return repositoryOperation(async () => {
    const configRef = doc(db, CONFIG_DOCUMENT);
    await runTransaction(db, async (transaction) => {
      if (id) {
        const article = await transaction.get(doc(db, ARTICLES_COLLECTION, id));
        const normalized = article.exists() ? normalizeNewsDocument(article.id, article.data()) : null;
        if (!normalized || normalized.status !== 'published') {
          throw new NewsRepositoryError('validation', 'Only a published news article can be featured.');
        }
      }
      transaction.set(configRef, { featuredArticleId: id, updatedAt: serverTimestamp() }, { merge: true });
    });
  });
}

export async function deleteNewsArticle(article: Pick<NewsArticleDraft, 'id' | 'imagePath'>): Promise<void> {
  return repositoryOperation(async () => {
    if (!article?.id) throw new NewsRepositoryError('validation', 'A news article id is required.');
    const articleRef = doc(db, ARTICLES_COLLECTION, article.id);
    const configRef = doc(db, CONFIG_DOCUMENT);
    await runTransaction(db, async (transaction) => {
      const [existing, config] = await Promise.all([transaction.get(articleRef), transaction.get(configRef)]);
      if (!existing.exists()) throw new NewsRepositoryError('unknown', 'The news article does not exist.');
      transaction.delete(articleRef);
      if (config.exists() && config.data().featuredArticleId === article.id) {
        transaction.update(configRef, { featuredArticleId: null, updatedAt: serverTimestamp() });
      }
    });
    if (article.imagePath) await deleteNewsImage(article.imagePath);
  });
}
