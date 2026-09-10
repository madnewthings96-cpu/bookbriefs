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
    if (userId === this.currentUserId) return false;
    this.currentUserId = userId;
    this.version += 1;
    this.readyUserId = null;
    return true;
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

/**
 * The state/effect orchestration shared by the user-scoped providers. Keeping
 * reset, hydration publication, mutation, and persistence eligibility here
 * makes those transitions directly testable without a DOM renderer.
 */
export class UserScopedStore<T> {
  private readonly emptyState: () => T;
  private readonly identity = new UserScopedIdentity();
  private state: T;

  constructor(emptyState: () => T) {
    this.emptyState = emptyState;
    this.state = emptyState();
  }

  observe(userId: string | null) {
    const changed = this.identity.observe(userId);
    if (changed) this.state = this.emptyState();
    return changed;
  }

  async hydrate(userId: string, load: (capturedUserId: string) => T | Promise<T>) {
    const loaded = await this.identity.hydrate(userId, load);
    if (loaded === undefined) return undefined;
    this.state = loaded;
    return loaded;
  }

  canWrite(userId: string | null) {
    return this.identity.canWrite(userId);
  }

  getExposedState(userId: string | null) {
    return this.identity.isReady(userId) ? this.state : this.emptyState();
  }

  getPersistableState(userId: string | null) {
    return this.identity.canWrite(userId) ? this.state : undefined;
  }

  persist(userId: string | null, writer: (state: T) => void) {
    const persistableState = this.getPersistableState(userId);
    if (!persistableState) return false;
    writer(persistableState);
    return true;
  }

  update(userId: string | null, updater: (state: T) => T) {
    if (!this.identity.canWrite(userId)) return false;
    const next = updater(this.state);
    if (!this.identity.canWrite(userId)) return false;
    this.state = next;
    return true;
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

export const safeReadItem = (storage: StorageLike | null, key: string): string | null => (
  safeGetItem(storage, key).value
);

export const safeRemoveItem = (storage: StorageLike | null, key: string) => {
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

const readOptionalFiniteNumber = (
  value: unknown,
  fallback: number,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY,
): number | null => {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < minimum || value > maximum) return null;
  return value;
};

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

  const parsedHistory = value.readingHistory.map(parseDate);
  if (parsedHistory.some((date) => date === undefined)) return null;

  const booksRead = readOptionalFiniteNumber(value.booksRead, 0);
  const dayStreak = readOptionalFiniteNumber(value.dayStreak, 0);
  const totalReadingTime = readOptionalFiniteNumber(value.totalReadingTime, 0);
  if (booksRead === null || dayStreak === null || totalReadingTime === null) return null;

  return {
    booksRead,
    dayStreak,
    totalReadingTime,
    readingHistory: parsedHistory as Date[],
  };
};

const normalizeProgress = (value: unknown): BookProgress | null => {
  if (!isRecord(value) || typeof value.bookId !== 'string' || value.bookId.length === 0) return null;

  const startedAt = parseDate(value.startedAt);
  const lastReadAt = parseDate(value.lastReadAt);
  if (!startedAt || !lastReadAt) return null;

  const progress = readOptionalFiniteNumber(value.progress, 0, 0, 100);
  if (progress === null) return null;
  if (value.isCompleted !== undefined && typeof value.isCompleted !== 'boolean') return null;

  const isCompleted = typeof value.isCompleted === 'boolean'
    ? value.isCompleted
    : progress >= 100;
  const completedAt = value.completedAt === undefined ? undefined : parseDate(value.completedAt);
  if (value.completedAt !== undefined && completedAt === undefined) return null;

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
    || value.id.length === 0
    || typeof value.bookId !== 'string'
    || value.bookId.length === 0
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
    || value.id.length === 0
    || typeof value.bookId !== 'string'
    || value.bookId.length === 0
    || typeof value.text !== 'string') {
    return null;
  }

  const createdAt = parseDate(value.createdAt);
  const updatedAt = parseDate(value.updatedAt);
  if (!createdAt || !updatedAt) return null;
  if (value.context !== undefined && typeof value.context !== 'string') return null;

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
  const progress = readScopedValue<BookProgress[]>(
    storage,
    `bookbriefs_book_progress_${userId}`,
    (value) => {
      if (!Array.isArray(value)) return null;
      const normalized = value.map(normalizeProgress);
      return normalized.every((item): item is BookProgress => item !== null)
        ? normalized
        : null;
    },
  ) ?? [];

  return { stats, progress };
};

export const readPersonalNotes = (storage: StorageLike | null, userId: string): PersonalNotesData => {
  const value = readScopedValue(storage, `bookbriefs_personal_notes_${userId}`, (raw) => {
    if (!isRecord(raw) || !Array.isArray(raw.notes) || !Array.isArray(raw.highlights)) return null;
    const notes = raw.notes.map(normalizeNote);
    const highlights = raw.highlights.map(normalizeHighlight);
    if (!notes.every((item): item is PersonalNote => item !== null)
      || !highlights.every((item): item is Highlight => item !== null)) return null;
    return { notes, highlights };
  });

  return value ?? emptyPersonalNotesData();
};
