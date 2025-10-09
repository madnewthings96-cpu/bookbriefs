import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  const [userStats, setUserStats] = useState<UserStats>({
    booksRead: 0,
    dayStreak: 0,
    totalReadingTime: 0,
    readingHistory: []
  });
  const [bookProgress, setBookProgress] = useState<BookProgress[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedStats = localStorage.getItem(`bookbriefs_user_stats_${user.id}`);
      const savedProgress = localStorage.getItem(`bookbriefs_book_progress_${user.id}`);
      
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setUserStats({
          ...parsedStats,
          readingHistory: parsedStats.readingHistory.map((date: string) => new Date(date))
        });
      }
      
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setBookProgress(parsedProgress.map((progress: any) => ({
          ...progress,
          startedAt: new Date(progress.startedAt),
          lastReadAt: new Date(progress.lastReadAt),
          completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined
        })));
      }
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`bookbriefs_user_stats_${user.id}`, JSON.stringify(userStats));
    }
  }, [userStats, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`bookbriefs_book_progress_${user.id}`, JSON.stringify(bookProgress));
    }
  }, [bookProgress, user]);

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
    if (!user) return;

    const now = new Date();
    setBookProgress(prev => {
      const existingProgress = prev.find(p => p.bookId === bookId);
      
      if (existingProgress) {
        return prev.map(p =>
          p.bookId === bookId
            ? { ...p, progress, lastReadAt: now, isCompleted: progress >= 100 }
            : p
        );
      } else {
        return [...prev, {
          bookId,
          progress,
          startedAt: now,
          lastReadAt: now,
          isCompleted: progress >= 100
        }];
      }
    });

    // Record reading activity
    recordReadingActivity();
  };

  const completeBook = (bookId: string) => {
    if (!user) return;

    const now = new Date();
    setBookProgress(prev =>
      prev.map(p =>
        p.bookId === bookId
          ? { ...p, progress: 100, completedAt: now, isCompleted: true, lastReadAt: now }
          : p
      )
    );

    // Update books read count
    setUserStats(prev => ({
      ...prev,
      booksRead: prev.booksRead + 1
    }));

    recordReadingActivity();
  };

  const getBookProgress = (bookId: string): BookProgress | null => {
    return bookProgress.find(p => p.bookId === bookId) || null;
  };

  const recordReadingActivity = () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setUserStats(prev => {
      const newHistory = [...prev.readingHistory];
      
      // Check if today is already recorded
      const todayExists = newHistory.some(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      if (!todayExists) {
        newHistory.push(today);
      }

      const newStreak = calculateDayStreak(newHistory);

      return {
        ...prev,
        readingHistory: newHistory,
        dayStreak: newStreak,
        totalReadingTime: prev.totalReadingTime + 5 // Add 5 minutes per reading session
      };
    });
  };

  const value: UserProgressContextType = {
    userStats,
    bookProgress,
    updateBookProgress,
    completeBook,
    getBookProgress,
    recordReadingActivity
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};