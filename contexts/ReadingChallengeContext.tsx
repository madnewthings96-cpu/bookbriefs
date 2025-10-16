import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface ReadingChallenge {
  year: number;
  goal: number;
  booksRead: string[]; // Array of book IDs
  createdAt: Date;
  updatedAt: Date;
}

interface ReadingChallengeContextType {
  challenge: ReadingChallenge | null;
  loading: boolean;
  setGoal: (goal: number) => Promise<void>;
  deleteGoal: () => Promise<void>;
  markBookAsRead: (bookId: string) => Promise<void>;
  unmarkBookAsRead: (bookId: string) => Promise<void>;
  isBookRead: (bookId: string) => boolean;
  progress: {
    current: number;
    goal: number;
    percentage: number;
  };
}

const ReadingChallengeContext = createContext<ReadingChallengeContextType | undefined>(undefined);

export const ReadingChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [challenge, setChallenge] = useState<ReadingChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  // Load challenge from Firestore
  useEffect(() => {
    const loadChallenge = async () => {
      if (!isAuthenticated || !user) {
        setChallenge(null);
        setLoading(false);
        return;
      }

      try {
        const challengeRef = doc(db, 'readingChallenges', `${user.id}_${currentYear}`);
        const challengeDoc = await getDoc(challengeRef);

        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          setChallenge({
            year: data.year,
            goal: data.goal,
            booksRead: data.booksRead || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          setChallenge(null);
        }
      } catch (error) {
        console.error('Error loading reading challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [isAuthenticated, user, currentYear]);

  const setGoal = async (goal: number) => {
    if (!user) return;

    try {
      const challengeRef = doc(db, 'readingChallenges', `${user.id}_${currentYear}`);
      const newChallenge: ReadingChallenge = {
        year: currentYear,
        goal,
        booksRead: challenge?.booksRead || [],
        createdAt: challenge?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await setDoc(challengeRef, {
        ...newChallenge,
        createdAt: newChallenge.createdAt,
        updatedAt: newChallenge.updatedAt,
      });

      setChallenge(newChallenge);
    } catch (error) {
      console.error('Error setting reading goal:', error);
      throw error;
    }
  };

  const deleteGoal = async () => {
    if (!user) return;

    try {
      const challengeRef = doc(db, 'readingChallenges', `${user.id}_${currentYear}`);
      await deleteDoc(challengeRef);
      setChallenge(null);
    } catch (error) {
      console.error('Error deleting reading goal:', error);
      throw error;
    }
  };

  const markBookAsRead = async (bookId: string) => {
    if (!user || !challenge) return;

    try {
      const updatedBooksRead = [...challenge.booksRead];
      if (!updatedBooksRead.includes(bookId)) {
        updatedBooksRead.push(bookId);
      }

      const challengeRef = doc(db, 'readingChallenges', `${user.id}_${currentYear}`);
      await updateDoc(challengeRef, {
        booksRead: updatedBooksRead,
        updatedAt: new Date(),
      });

      setChallenge({
        ...challenge,
        booksRead: updatedBooksRead,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking book as read:', error);
      throw error;
    }
  };

  const unmarkBookAsRead = async (bookId: string) => {
    if (!user || !challenge) return;

    try {
      const updatedBooksRead = challenge.booksRead.filter(id => id !== bookId);

      const challengeRef = doc(db, 'readingChallenges', `${user.id}_${currentYear}`);
      await updateDoc(challengeRef, {
        booksRead: updatedBooksRead,
        updatedAt: new Date(),
      });

      setChallenge({
        ...challenge,
        booksRead: updatedBooksRead,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error unmarking book as read:', error);
      throw error;
    }
  };

  const isBookRead = (bookId: string): boolean => {
    return challenge?.booksRead.includes(bookId) || false;
  };

  const progress = {
    current: challenge?.booksRead.length || 0,
    goal: challenge?.goal || 0,
    percentage: challenge?.goal ? Math.min(((challenge?.booksRead.length || 0) / challenge.goal) * 100, 100) : 0,
  };

  return (
    <ReadingChallengeContext.Provider
      value={{
        challenge,
        loading,
        setGoal,
        deleteGoal,
        markBookAsRead,
        unmarkBookAsRead,
        isBookRead,
        progress,
      }}
    >
      {children}
    </ReadingChallengeContext.Provider>
  );
};

export const useReadingChallenge = () => {
  const context = useContext(ReadingChallengeContext);
  if (context === undefined) {
    throw new Error('useReadingChallenge must be used within a ReadingChallengeProvider');
  }
  return context;
};
