import type { Book } from '../types';

export const BOOKS_CACHE_KEY = 'books_cache';
export const BOOKS_CACHE_TIMESTAMP_KEY = 'books_cache_timestamp';
export const BOOKS_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

export interface BooksCacheStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface BooksCacheRead {
  books: Book[];
  fresh: boolean;
}

const isNonEmptyString = (value: unknown): value is string => (
  typeof value === 'string' && value.trim().length > 0
);

export const isValidBook = (value: unknown): value is Book => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const book = value as Record<string, unknown>;
  const optionalStrings = ['arabicSlug', 'amazonUrl', 'kindleUrl', 'audibleUrl', 'arabicPdfUrl', 'arabicCoverImageUrl'];
  const optionalNumbers = ['rating', 'publicationYear', 'pageCount'];
  const optionalStringsValid = optionalStrings.every((key) => book[key] === undefined || typeof book[key] === 'string');
  const optionalNumbersValid = optionalNumbers.every((key) => book[key] === undefined || (typeof book[key] === 'number' && Number.isFinite(book[key])));
  const ratingsCountValid = book.ratingsCount === undefined
    || typeof book.ratingsCount === 'string'
    || (typeof book.ratingsCount === 'number' && Number.isFinite(book.ratingsCount));

  return isNonEmptyString(book.id)
    && isNonEmptyString(book.title)
    && isNonEmptyString(book.author)
    && isNonEmptyString(book.coverImageUrl)
    && isNonEmptyString(book.category)
    && optionalStringsValid
    && optionalNumbersValid
    && ratingsCountValid;
};

export const parseBooksCache = (raw: string | null): Book[] | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isValidBook) ? parsed as Book[] : null;
  } catch {
    return null;
  }
};

const safeRead = (storage: BooksCacheStorage, key: string) => {
  try {
    return { ok: true, value: storage.getItem(key) } as const;
  } catch {
    return { ok: false, value: null } as const;
  }
};

const safeRemove = (storage: BooksCacheStorage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // Session storage can be unavailable in private browsing or sandboxed frames.
  }
};

const parseCacheTimestamp = (raw: string | null): number | null => {
  if (raw === null || raw.length === 0 || raw.trim() !== raw || !/^(0|[1-9]\d*)$/.test(raw)) return null;
  const timestamp = Number(raw);
  return Number.isSafeInteger(timestamp) ? timestamp : null;
};

export const readBooksCache = (
  storage: BooksCacheStorage | null,
  now = Date.now(),
  maxAge = BOOKS_CACHE_MAX_AGE_MS,
): BooksCacheRead | null => {
  if (!storage) return null;
  const raw = safeRead(storage, BOOKS_CACHE_KEY);
  const timestampRaw = safeRead(storage, BOOKS_CACHE_TIMESTAMP_KEY);
  if (!raw.ok || !timestampRaw.ok) return null;
  if (raw.value === null && timestampRaw.value === null) return null;

  const books = parseBooksCache(raw.value);
  const timestamp = parseCacheTimestamp(timestampRaw.value);
  if (!books || timestamp === null) {
    safeRemove(storage, BOOKS_CACHE_KEY);
    safeRemove(storage, BOOKS_CACHE_TIMESTAMP_KEY);
    return null;
  }

  const age = now - timestamp;
  return { books, fresh: age >= 0 && age < maxAge };
};

export const writeBooksCache = (storage: BooksCacheStorage | null, books: Book[], now = Date.now()) => {
  if (!storage) return;
  try {
    storage.setItem(BOOKS_CACHE_KEY, JSON.stringify(books));
    storage.setItem(BOOKS_CACHE_TIMESTAMP_KEY, String(now));
  } catch {
    // Caching is an optimization; Firestore remains the source of truth.
  }
};
