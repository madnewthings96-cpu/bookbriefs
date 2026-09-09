import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  emptyUserStats,
  getBrowserStorage,
  readUserProgress,
  safeWriteItem,
  UserScopedIdentity,
} from './userScopedPersistence';

export interface BookProgress {
  bookId: string;
  progress: number; // 0-100
  startedAt: Date;
  lastReadAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface UserStats {
  booksRead: number;
  dayStreak: number;
  totalReadingTime: number; // in minutes
  readingHistory: Date[]; // dates when user read something
}

interface UserProgressContextType {
  userStats: UserStats;
  bookProgress: BookProgress[];
  updateBookProgress: (bookId: string, progress: number) => void;
  completeBook: (bookId: string) => void;
  getBookProgress: (bookId: string) => BookProgress | null;
  recordReadingActivity: () => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};
interface UserProgressProviderProps {
  children: ReactNode;
}

export const UserProgressProvider: React.FC<UserProgressProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const identity = useRef(new UserScopedIdentity());
  // Observe during render so the exposed value is empty on the first render
  // after logout or an account switch, before effects have had a chance to run.
  identity.current.observe(currentUserId);

  const [userStats, setUserStats] = useState<UserStats>(() => emptyUserStats());
  const [bookProgress, setBookProgress] = useState<BookProgress[]>([]);

  useEffect(() => {
    let cancelled = false;
    const capturedUserId = currentUserId;
    const storage = getBrowserStorage();

    // Reset immediately for every identity transition. The identity gate below
    // also hides the previous state during the render before this effect runs.
    setUserStats(emptyUserStats());
    setBookProgress([]);

    if (!capturedUserId) return () => { cancelled = true; };

    void identity.current.hydrate(capturedUserId, (userId) => readUserProgress(storage, userId))
      .then((loaded) => {
        if (cancelled || loaded === undefined || !identity.current.isReady(capturedUserId)) return;
        setUserStats(loaded.stats);
        setBookProgress(loaded.progress);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const canWrite = (capturedUserId: string | null) => (
    capturedUserId !== null && identity.current.canWrite(capturedUserId)
  );

  // Saving is enabled only after the captured user's hydration completes. The
  // identity token is checked again at write time so an old effect cannot write
  // state under a newly selected account.
  useEffect(() => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    safeWriteItem(
      getBrowserStorage(),
      `bookbriefs_user_stats_${capturedUserId}`,
      JSON.stringify(userStats),
    );
  }, [currentUserId, userStats]);

  useEffect(() => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    safeWriteItem(
      getBrowserStorage(),
      `bookbriefs_book_progress_${capturedUserId}`,
      JSON.stringify(bookProgress),
    );
  }, [currentUserId, bookProgress]);

  // Calculate day streak
  const calculateDayStreak = (readingHistory: Date[]): number => {
    if (readingHistory.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort dates in descending order
    const sortedDates = readingHistory
      .map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      })
      .sort((a, b) => b.getTime() - a.getTime())
      .filter((date, index, arr) =>
        index === 0 || date.getTime() !== arr[index - 1].getTime()
      ); // Remove duplicates

    let streak = 0;
    let currentDate = new Date(today);

    for (const readingDate of sortedDates) {
      if (readingDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (readingDate.getTime() < currentDate.getTime()) {
        // Gap in reading dates
        break;
      }
    }

    return streak;
  };

  const updateBookProgress = (bookId: string, progress: number) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    const now = new Date();
    setBookProgress(prev => {
      if (!canWrite(capturedUserId)) return prev;
      const existingProgress = prev.find(p => p.bookId === bookId);

      if (existingProgress) {
        return prev.map(p =>
          p.bookId === bookId
            ? { ...p, progress, lastReadAt: now, isCompleted: progress >= 100 }
            : p
        );
      }
      return [...prev, {
        bookId,
        progress,
        startedAt: now,
        lastReadAt: now,
        isCompleted: progress >= 100,
      }];
    });

    // Record reading activity
    recordReadingActivity();
  };

  const completeBook = (bookId: string) => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    const now = new Date();
    setBookProgress(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return prev.map(p =>
        p.bookId === bookId
          ? { ...p, progress: 100, completedAt: now, isCompleted: true, lastReadAt: now }
          : p
      );
    });

    // Update books read count
    setUserStats(prev => {
      if (!canWrite(capturedUserId)) return prev;
      return { ...prev, booksRead: prev.booksRead + 1 };
    });

    recordReadingActivity();
  };

  const exposedUserStats = identity.current.isReady(currentUserId) ? userStats : emptyUserStats();
  const exposedBookProgress = identity.current.isReady(currentUserId) ? bookProgress : [];

  const getBookProgress = (bookId: string): BookProgress | null => {
    return exposedBookProgress.find(p => p.bookId === bookId) || null;
  };

  const recordReadingActivity = () => {
    const capturedUserId = currentUserId;
    if (!canWrite(capturedUserId)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setUserStats(prev => {
      if (!canWrite(capturedUserId)) return prev;
      const newHistory = [...prev.readingHistory];

      // Check if today is already recorded
      const todayExists = newHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      if (!todayExists) newHistory.push(today);

      const newStreak = calculateDayStreak(newHistory);

      return {
        ...prev,
        readingHistory: newHistory,
        dayStreak: newStreak,
        totalReadingTime: prev.totalReadingTime + 5, // Add 5 minutes per reading session
      };
    });
  };

  const value: UserProgressContextType = {
    userStats: exposedUserStats,
    bookProgress: exposedBookProgress,
    updateBookProgress,
    completeBook,
    getBookProgress,
    recordReadingActivity,
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};
