import type { BookProgress, UserStats } from './UserProgressContext';
import type { PersonalNote, Highlight, PersonalNotesData } from '../types';

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface UserScopedHydrationToken {
  userId: string;
  version: number;
}

/**
 * Tracks the identity associated with an in-memory user-scoped store.
 * React providers use it to make hydration cancellable and to gate writes
 * until the captured user's record has been loaded.
 */
export class UserScopedIdentity {
  private currentUserId: string | null = null;
  private version = 0;
  private readyUserId: string | null = null;

  observe(userId: string | null) {
    if (userId === this.currentUserId) return;
    this.currentUserId = userId;
    this.version += 1;
    this.readyUserId = null;
  }

  capture(userId: string): UserScopedHydrationToken {
    return { userId, version: this.version };
  }

  isCurrent(token: UserScopedHydrationToken) {
    return token.userId === this.currentUserId && token.version === this.version;
  }

  async hydrate<T>(userId: string, load: (capturedUserId: string) => T | Promise<T>): Promise<T | undefined> {
    const token = this.capture(userId);
    if (!this.isCurrent(token)) return undefined;

    const value = await Promise.resolve().then(() => load(token.userId));
    if (!this.isCurrent(token)) return undefined;
    this.readyUserId = token.userId;
    return value;
  }

  isReady(userId: string | null) {
    return userId !== null && userId === this.currentUserId && userId === this.readyUserId;
  }

  canWrite(userId: string | null) {
    return this.isReady(userId);
  }
}

export const emptyUserStats = (): UserStats => ({
  booksRead: 0,
  dayStreak: 0,
  totalReadingTime: 0,
  readingHistory: [],
});

export const emptyPersonalNotesData = (): PersonalNotesData => ({
  notes: [],
  highlights: [],
});

export const getBrowserStorage = (): StorageLike | null => {
  try {
    if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

const safeGetItem = (storage: StorageLike | null, key: string): { ok: boolean; value: string | null } => {
  if (!storage) return { ok: false, value: null };
  try {
    return { ok: true, value: storage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
};

const safeRemoveItem = (storage: StorageLike | null, key: string) => {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Storage may be disabled or unavailable. In-memory state remains usable.
  }
};

export const safeWriteItem = (storage: StorageLike | null, key: string, value: string) => {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // Storage may be disabled or full. In-memory state remains usable.
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const asFiniteNumber = (value: unknown, fallback: number) => (
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
);

const parseDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : new Date(value.getTime());
  }
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeStats = (value: unknown): UserStats | null => {
  if (!isRecord(value) || !Array.isArray(value.readingHistory)) return null;

  const readingHistory = value.readingHistory
    .map(parseDate)
    .filter((date): date is Date => date !== undefined);

  return {
    booksRead: asFiniteNumber(value.booksRead, 0),
    dayStreak: asFiniteNumber(value.dayStreak, 0),
    totalReadingTime: asFiniteNumber(value.totalReadingTime, 0),
    readingHistory,
  };
};

const normalizeProgress = (value: unknown): BookProgress | null => {
  if (!isRecord(value) || typeof value.bookId !== 'string' || value.bookId.length === 0) return null;

  const startedAt = parseDate(value.startedAt);
  const lastReadAt = parseDate(value.lastReadAt);
  if (!startedAt || !lastReadAt) return null;

  const progress = asFiniteNumber(value.progress, 0);
  const isCompleted = typeof value.isCompleted === 'boolean'
    ? value.isCompleted
    : progress >= 100;
  const completedAt = value.completedAt === undefined ? undefined : parseDate(value.completedAt);

  return {
    bookId: value.bookId,
    progress,
    startedAt,
    lastReadAt,
    completedAt,
    isCompleted,
  };
};

const normalizeNote = (value: unknown): PersonalNote | null => {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.bookId !== 'string'
    || typeof value.content !== 'string') {
    return null;
  }

  const createdAt = parseDate(value.createdAt);
  const updatedAt = parseDate(value.updatedAt);
  if (!createdAt || !updatedAt) return null;

  return { id: value.id, bookId: value.bookId, content: value.content, createdAt, updatedAt };
};

const normalizeHighlight = (value: unknown): Highlight | null => {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.bookId !== 'string'
    || typeof value.text !== 'string') {
    return null;
  }

  const createdAt = parseDate(value.createdAt);
  const updatedAt = parseDate(value.updatedAt);
  if (!createdAt || !updatedAt) return null;

  return {
    id: value.id,
    bookId: value.bookId,
    text: value.text,
    context: typeof value.context === 'string' ? value.context : undefined,
    createdAt,
    updatedAt,
  };
};

const readScopedValue = <T>(
  storage: StorageLike | null,
  key: string,
  normalize: (value: unknown) => T | null,
): T | undefined => {
  const result = safeGetItem(storage, key);
  if (!result.ok || result.value === null) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.value);
  } catch {
    safeRemoveItem(storage, key);
    return undefined;
  }

  const normalized = normalize(parsed);
  if (normalized === null) safeRemoveItem(storage, key);
  return normalized ?? undefined;
};

export const readUserProgress = (storage: StorageLike | null, userId: string) => {
  const stats = readScopedValue(
    storage,
    `bookbriefs_user_stats_${userId}`,
    normalizeStats,
  ) ?? emptyUserStats();
  const progress = readScopedValue<unknown[]>(
    storage,
    `bookbriefs_book_progress_${userId}`,
    (value) => Array.isArray(value)
      ? value.map(normalizeProgress).filter((item): item is BookProgress => item !== null)
      : null,
  ) as BookProgress[] | undefined ?? [];

  return { stats, progress };
};

export const readPersonalNotes = (storage: StorageLike | null, userId: string): PersonalNotesData => {
  const value = readScopedValue(storage, `bookbriefs_personal_notes_${userId}`, (raw) => {
    if (!isRecord(raw) || !Array.isArray(raw.notes) || !Array.isArray(raw.highlights)) return null;
    return {
      notes: raw.notes.map(normalizeNote).filter((item): item is PersonalNote => item !== null),
      highlights: raw.highlights
        .map(normalizeHighlight)
        .filter((item): item is Highlight => item !== null),
    };
  });

  return value ?? emptyPersonalNotesData();
};
