import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  emptyUserStats,
  getBrowserStorage,
  readUserProgress,
  safeWriteItem,
  UserScopedStore,
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
  isUserDataReady: boolean;
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

interface UserProgressState {
  userStats: UserStats;
  bookProgress: BookProgress[];
}

export const UserProgressProvider: React.FC<UserProgressProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const scopedStore = useRef(new UserScopedStore<UserProgressState>(() => ({
    userStats: emptyUserStats(),
    bookProgress: [],
  })));
  // Observe during render so the exposed value is empty on the first render
  // after logout or an account switch, before effects have had a chance to run.
  scopedStore.current.observe(currentUserId);
  const [storeRevision, forceRender] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const capturedUserId = currentUserId;
    const storage = getBrowserStorage();

    if (!capturedUserId) return () => { cancelled = true; };

    void scopedStore.current.hydrate(capturedUserId, (userId) => {
      const loaded = readUserProgress(storage, userId);
      return { userStats: loaded.stats, bookProgress: loaded.progress };
    })
      .then((loaded) => {
        if (cancelled || loaded === undefined || !scopedStore.current.canWrite(capturedUserId)) return;
        forceRender((revision) => revision + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Saving is enabled only after the captured user's hydration completes. The
  // identity token is checked again at write time so an old effect cannot write
  // state under a newly selected account.
  useEffect(() => {
    const capturedUserId = currentUserId;
    scopedStore.current.persist(capturedUserId, (persisted) => {
      safeWriteItem(
        getBrowserStorage(),
        `bookbriefs_user_stats_${capturedUserId}`,
        JSON.stringify(persisted.userStats),
      );

      safeWriteItem(
        getBrowserStorage(),
        `bookbriefs_book_progress_${capturedUserId}`,
        JSON.stringify(persisted.bookProgress),
      );
    });
  }, [currentUserId, storeRevision]);

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
    const now = new Date();
    const updated = scopedStore.current.update(capturedUserId, (state) => {
      const existingProgress = state.bookProgress.find(p => p.bookId === bookId);

      if (existingProgress) {
        return {
          ...state,
          bookProgress: state.bookProgress.map(p =>
            p.bookId === bookId
              ? { ...p, progress, lastReadAt: now, isCompleted: progress >= 100 }
              : p
          ),
        };
      }
      return {
        ...state,
        bookProgress: [...state.bookProgress, {
          bookId,
          progress,
          startedAt: now,
          lastReadAt: now,
          isCompleted: progress >= 100,
        }],
      };
    });
    if (!updated) return;
    forceRender((revision) => revision + 1);

    // Record reading activity
    recordReadingActivity();
  };

  const completeBook = (bookId: string) => {
    const capturedUserId = currentUserId;
    const now = new Date();
    const updated = scopedStore.current.update(capturedUserId, (state) => ({
      userStats: { ...state.userStats, booksRead: state.userStats.booksRead + 1 },
      bookProgress: state.bookProgress.map(p =>
        p.bookId === bookId
          ? { ...p, progress: 100, completedAt: now, isCompleted: true, lastReadAt: now }
          : p
      ),
    }));
    if (!updated) return;
    forceRender((revision) => revision + 1);

    recordReadingActivity();
  };

  const exposedState = scopedStore.current.getExposedState(currentUserId);
  const exposedUserStats = exposedState.userStats;
  const exposedBookProgress = exposedState.bookProgress;
  const isUserDataReady = scopedStore.current.canWrite(currentUserId);

  const getBookProgress = (bookId: string): BookProgress | null => {
    return exposedBookProgress.find(p => p.bookId === bookId) || null;
  };

  const recordReadingActivity = () => {
    const capturedUserId = currentUserId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = scopedStore.current.update(capturedUserId, (state) => {
      const prev = state.userStats;
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
        ...state,
        userStats: {
          ...prev,
          readingHistory: newHistory,
          dayStreak: newStreak,
          totalReadingTime: prev.totalReadingTime + 5, // Add 5 minutes per reading session
        },
      };
    });
    if (updated) forceRender((revision) => revision + 1);
  };

  const value: UserProgressContextType = {
    userStats: exposedUserStats,
    bookProgress: exposedBookProgress,
    isUserDataReady,
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
