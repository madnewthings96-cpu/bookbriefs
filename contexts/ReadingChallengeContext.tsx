import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserScopedRealtimeStore, type UserIdentityToken } from './userScopedRealtime';

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
  error: string | null;
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

interface ReadingChallengeState {
  challenge: ReadingChallenge | null;
  loading: boolean;
  error: string | null;
}

const emptyReadingChallengeState = (): ReadingChallengeState => ({
  challenge: null,
  loading: true,
  error: null,
});

const ReadingChallengeContext = createContext<ReadingChallengeContextType | undefined>(undefined);

export const ReadingChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id ?? null : null;
  const currentYear = new Date().getFullYear();
  const scopedStore = useRef(new UserScopedRealtimeStore<ReadingChallengeState>(emptyReadingChallengeState)).current;

  // observe() runs during render so an account switch/logout cannot expose the
  // previous user's challenge for even one render.
  scopedStore.observe(currentUserId);
  const [, forceRender] = useState(0);
  const exposedState = scopedStore.getExposedState(currentUserId);

  const publish = (token: UserIdentityToken, nextState: ReadingChallengeState) => {
    if (!scopedStore.publish(token, nextState)) return false;
    forceRender((revision) => revision + 1);
    return true;
  };

  useEffect(() => {
    const capturedUserId = currentUserId;
    const token = scopedStore.capture(capturedUserId);
    if (!token) return () => undefined;

    let cancelled = false;
    publish(token, { challenge: null, loading: true, error: null });

    const loadChallenge = async () => {
      try {
        const challengeRef = doc(db, 'reading_challenges', `${token.userId}_${currentYear}`);
        const challengeDoc = await getDoc(challengeRef);
        if (cancelled || !scopedStore.isCurrent(token)) return;

        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          publish(token, {
            challenge: {
              year: data.year,
              goal: data.goal,
              booksRead: data.booksRead || [],
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            },
            loading: false,
            error: null,
          });
        } else {
          publish(token, { challenge: null, loading: false, error: null });
        }
      } catch (error) {
        if (cancelled || !scopedStore.isCurrent(token)) return;
        console.error('Error loading reading challenge:', error);
        publish(token, {
          challenge: null,
          loading: false,
          error: 'Unable to load your reading challenge. Please refresh the page and try again.',
        });
      }
    };

    void loadChallenge();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, currentYear]);

  const setGoal = async (goal: number) => {
    const token = scopedStore.capture(currentUserId);
    if (!token) return;

    try {
      const challengeRef = doc(db, 'reading_challenges', `${token.userId}_${currentYear}`);
      const existingDoc = await getDoc(challengeRef);
      if (!scopedStore.isCurrent(token)) return;

      if (existingDoc.exists()) {
        await updateDoc(challengeRef, {
          goal,
          updatedAt: serverTimestamp(),
        });
        if (!scopedStore.isCurrent(token)) return;

        const data = existingDoc.data();
        publish(token, {
          challenge: {
            year: data.year,
            goal,
            booksRead: data.booksRead || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: new Date(),
          },
          loading: false,
          error: null,
        });
      } else {
        await setDoc(challengeRef, {
          userId: token.userId,
          year: currentYear,
          goal,
          booksRead: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (!scopedStore.isCurrent(token)) return;

        publish(token, {
          challenge: {
            year: currentYear,
            goal,
            booksRead: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error setting reading goal:', error);
      throw error;
    }
  };

  const deleteGoal = async () => {
    const token = scopedStore.capture(currentUserId);
    if (!token) return;

    try {
      const challengeRef = doc(db, 'reading_challenges', `${token.userId}_${currentYear}`);
      await deleteDoc(challengeRef);
      if (!scopedStore.isCurrent(token)) return;
      publish(token, { challenge: null, loading: false, error: null });
    } catch (error) {
      console.error('Error deleting reading goal:', error);
      throw error;
    }
  };

  const updateBooksRead = async (bookId: string, remove: boolean) => {
    const token = scopedStore.capture(currentUserId);
    if (!token) return;

    const currentState = scopedStore.getExposedState(token.userId);
    if (!currentState.challenge) return;

    const updatedBooksRead = remove
      ? currentState.challenge.booksRead.filter((id) => id !== bookId)
      : currentState.challenge.booksRead.includes(bookId)
        ? currentState.challenge.booksRead
        : [...currentState.challenge.booksRead, bookId];

    try {
      const challengeRef = doc(db, 'reading_challenges', `${token.userId}_${currentYear}`);
      await updateDoc(challengeRef, {
        booksRead: updatedBooksRead,
        updatedAt: serverTimestamp(),
      });
      if (!scopedStore.isCurrent(token)) return;

      publish(token, {
        challenge: {
          ...currentState.challenge,
          booksRead: updatedBooksRead,
          updatedAt: new Date(),
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error(remove ? 'Error unmarking book as read:' : 'Error marking book as read:', error);
      throw error;
    }
  };

  const markBookAsRead = (bookId: string) => updateBooksRead(bookId, false);
  const unmarkBookAsRead = (bookId: string) => updateBooksRead(bookId, true);
  const challenge = currentUserId ? exposedState.challenge : null;
  const error = currentUserId ? exposedState.error : null;
  const loading = currentUserId ? exposedState.loading : false;

  const isBookRead = (bookId: string): boolean => challenge?.booksRead.includes(bookId) || false;

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
        error,
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
