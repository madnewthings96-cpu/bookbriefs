export type ReadingStatKey = 'completed' | 'streak' | 'time' | 'saved';

export interface ReadingStat {
  key: ReadingStatKey;
  label: string;
  value: string;
  rawValue: number;
  helper: string;
}

interface ReadingStatsInput {
  booksRead: number;
  completedCount: number;
  dayStreak: number;
  totalReadingTime: number;
  savedBooks: number;
}

export const formatReadingMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

export const buildReadingStats = ({
  booksRead,
  completedCount,
  dayStreak,
  totalReadingTime,
  savedBooks,
}: ReadingStatsInput): ReadingStat[] => {
  const completed = Math.max(booksRead, completedCount);
  return [
    { key: 'completed', label: 'Books read', value: String(completed), rawValue: completed, helper: 'Completed summaries' },
    { key: 'streak', label: 'Day streak', value: String(dayStreak), rawValue: dayStreak, helper: 'Reading days' },
    { key: 'time', label: 'Reading time', value: formatReadingMinutes(totalReadingTime), rawValue: totalReadingTime, helper: 'Tracked locally' },
    { key: 'saved', label: 'Saved books', value: String(savedBooks), rawValue: savedBooks, helper: 'Favorites' },
  ];
};

export const isNewReadingProfile = (stats: ReadingStat[], inProgressCount: number): boolean => (
  inProgressCount === 0 && stats.every((stat) => stat.rawValue === 0)
);

export const getNextBookProgress = (currentProgress?: number | null): number => (
  Math.min(Math.max(currentProgress ?? 0, 0) + 25, 100)
);

export const getPrimaryShelfUtility = (hasActiveReading: boolean) => (
  hasActiveReading
    ? { label: 'Browse library', action: 'browse' as const }
    : { label: 'Refresh shelf', action: 'refresh' as const }
);
