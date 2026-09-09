import type { Book, PersonalNotesData } from '../../types';
import type { BookProgress } from '../../contexts/UserProgressContext';
import { RECOMMENDED_BOOK_IDS } from '../profile/profilePageModel';

export type DashboardReadingStatus = 'saved' | 'in-progress' | 'completed' | 'not-started';
export type DashboardLibraryFilter = 'all' | 'saved' | 'in-progress' | 'completed';

export interface DashboardShelfBook {
  book: Book;
  progress: number;
  saved: boolean;
  status: DashboardReadingStatus;
  lastReadAt?: Date;
}

export interface DashboardKnowledgeItem {
  id: string;
  kind: 'note' | 'highlight';
  bookId: string;
  book?: Book;
  content: string;
  updatedAt: Date;
}

export interface WeeklyReadingInsight {
  readingDays: number;
  currentStreak: number;
}

const clampProgress = (progress: number) => Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));

const validDate = (value: unknown): Date | undefined => {
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const dateOrEpoch = (value: unknown) => validDate(value) ?? new Date(0);

const timestamp = (value: unknown) => validDate(value)?.getTime() ?? Number.NEGATIVE_INFINITY;

const isCompleted = (record: BookProgress) => record.isCompleted || clampProgress(record.progress) >= 100;

const progressByBookId = (progress: BookProgress[]) => {
  const byBookId = new Map<string, BookProgress>();
  progress.forEach((record) => {
    const existing = byBookId.get(record.bookId);
    if (!existing || timestamp(record.lastReadAt) > timestamp(existing.lastReadAt)) {
      byBookId.set(record.bookId, record);
    }
  });
  return byBookId;
};

export const selectContinueReading = (
  books: Book[],
  progress: BookProgress[],
): DashboardShelfBook | undefined => {
  const booksById = new Map(books.map((book) => [book.id, book]));
  const candidates = Array.from(progressByBookId(progress).values())
    .filter((record) => booksById.has(record.bookId) && !isCompleted(record))
    .sort((left, right) => timestamp(right.lastReadAt) - timestamp(left.lastReadAt));
  const record = candidates[0];
  const book = record ? booksById.get(record.bookId) : undefined;

  if (!book || !record) return undefined;

  return {
    book,
    progress: clampProgress(record.progress),
    saved: false,
    status: 'in-progress',
    lastReadAt: validDate(record.lastReadAt),
  };
};

export const buildDashboardShelf = (
  books: Book[],
  favoriteIds: string[],
  progress: BookProgress[],
): DashboardShelfBook[] => {
  const favorites = new Set(favoriteIds);
  const records = progressByBookId(progress);
  const items = books.flatMap((book, index) => {
    const record = records.get(book.id);
    const saved = favorites.has(book.id);
    if (!record && !saved) return [];

    const status: DashboardReadingStatus = record
      ? (isCompleted(record) ? 'completed' : 'in-progress')
      : 'saved';

    return [{
      book,
      progress: record ? clampProgress(record.progress) : 0,
      saved,
      status,
      lastReadAt: record ? validDate(record.lastReadAt) : undefined,
      index,
    }];
  });

  const statusOrder: Record<DashboardReadingStatus, number> = {
    'in-progress': 0,
    completed: 1,
    saved: 2,
    'not-started': 3,
  };

  return items
    .sort((left, right) => (
      statusOrder[left.status] - statusOrder[right.status]
      || (left.status === 'in-progress' ? timestamp(right.lastReadAt) - timestamp(left.lastReadAt) : 0)
      || left.index - right.index
    ))
    .map(({ index: _index, ...item }) => item);
};

export const filterDashboardShelf = (
  items: DashboardShelfBook[],
  filter: DashboardLibraryFilter,
): DashboardShelfBook[] => {
  if (filter === 'all') return [...items];
  if (filter === 'saved') return items.filter((item) => item.saved);
  return items.filter((item) => item.status === filter);
};

export const selectRecentKnowledge = (
  data: PersonalNotesData,
  books: Book[],
  limit = 4,
): DashboardKnowledgeItem[] => {
  const booksById = new Map(books.map((book) => [book.id, book]));
  const maximum = Math.max(0, Math.floor(limit));
  if (!Number.isFinite(maximum) || maximum === 0) return [];

  return [
    ...data.notes.map((note, index) => ({
      id: note.id,
      kind: 'note' as const,
      bookId: note.bookId,
      book: booksById.get(note.bookId),
      content: note.content,
      updatedAt: dateOrEpoch(note.updatedAt),
      index,
    })),
    ...data.highlights.map((highlight, index) => ({
      id: highlight.id,
      kind: 'highlight' as const,
      bookId: highlight.bookId,
      book: booksById.get(highlight.bookId),
      content: highlight.text,
      updatedAt: dateOrEpoch(highlight.updatedAt),
      index: data.notes.length + index,
    })),
  ]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime() || left.index - right.index)
    .slice(0, maximum)
    .map(({ index: _index, ...item }) => item);
};

const localDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const localDayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const buildWeeklyReadingInsight = (
  readingHistory: Date[],
  now = new Date(),
): WeeklyReadingInsight => {
  const today = localDay(now);
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - 6);
  const readingDays = new Set<string>();
  const allReadingDays = new Set<string>();

  readingHistory.forEach((value) => {
    const date = validDate(value);
    if (!date) return;
    const day = localDay(date);
    if (day > today) return;
    const key = localDayKey(day);
    allReadingDays.add(key);
    if (day >= windowStart) readingDays.add(key);
  });

  let currentStreak = 0;
  const streakDay = new Date(today);
  while (allReadingDays.has(localDayKey(streakDay))) {
    currentStreak += 1;
    streakDay.setDate(streakDay.getDate() - 1);
  }

  return { readingDays: readingDays.size, currentStreak };
};

export const selectDashboardRecommendations = (
  books: Book[],
  excludedIds: string[],
  limit = 6,
): DashboardShelfBook[] => {
  const excluded = new Set(excludedIds);
  const maximum = Math.max(0, Math.floor(limit));
  if (!Number.isFinite(maximum) || maximum === 0) return [];

  return [...books]
    .map((book, index) => ({ book, index, preferredRank: RECOMMENDED_BOOK_IDS.indexOf(book.id) }))
    .filter(({ book }) => !excluded.has(book.id))
    .sort((left, right) => {
      const leftRank = left.preferredRank === -1 ? Number.POSITIVE_INFINITY : left.preferredRank;
      const rightRank = right.preferredRank === -1 ? Number.POSITIVE_INFINITY : right.preferredRank;
      return leftRank - rightRank || left.index - right.index;
    })
    .slice(0, maximum)
    .map(({ book }) => ({
      book,
      progress: 0,
      saved: false,
      status: 'not-started' as const,
    }));
};
