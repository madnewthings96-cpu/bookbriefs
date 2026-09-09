import React, { createContext, useContext, useState, useEffect } from 'react';
import { arrayRemove, arrayUnion, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../firebase';

interface FavoritesContextType {
  favorites: string[];
  error: string | null;
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (bookId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const readLegacyFavorites = (storageKey: string): string[] => {
    const storedFavorites = localStorage.getItem(storageKey);
    if (!storedFavorites) return [];

    try {
      const parsed = JSON.parse(storedFavorites);
      return Array.isArray(parsed)
        ? parsed.filter((bookId): bookId is string => typeof bookId === 'string')
        : [];
    } catch (error) {
      console.error('Failed to parse legacy favorites:', error);
      return [];
    }
  };

  const uniqueFavorites = (bookIds: string[]) => (
    Array.from(new Set(bookIds.filter((bookId) => typeof bookId === 'string' && bookId.length > 0)))
  );

  useEffect(() => {
    setError(null);
    if (!user) {
      setFavorites([]);
      return;
    }

    const legacyStorageKey = `favorites_${user.email}`;
    const legacyFavorites = readLegacyFavorites(legacyStorageKey);
    const favoritesRef = doc(db, 'favorites', user.id);

    return onSnapshot(
      favoritesRef,
      (snapshot) => {
        const data = snapshot.data();
        const remoteFavorites = Array.isArray(data?.bookIds)
          ? data.bookIds.filter((bookId): bookId is string => typeof bookId === 'string')
          : [];
        const mergedFavorites = uniqueFavorites([...remoteFavorites, ...legacyFavorites]);

        setFavorites(mergedFavorites);
        setError(null);

        if (legacyFavorites.length > 0 && mergedFavorites.length !== remoteFavorites.length) {
          setDoc(favoritesRef, {
            bookIds: mergedFavorites,
            updatedAt: serverTimestamp(),
          }, { merge: true })
            .then(() => localStorage.removeItem(legacyStorageKey))
            .catch((error) => {
              console.error('Failed to migrate legacy favorites:', error);
            });
        }
      },
      (error) => {
        console.error('Failed to load favorites:', error);
        setFavorites(legacyFavorites);
        setError("We couldn't load your saved books. Your saved books on this device are still available.");
      }
    );
  }, [user]);

  const addFavorite = (bookId: string) => {
    if (!user) return;

    setFavorites(prev => {
      if (prev.includes(bookId)) {
        return prev;
      }
      return [...prev, bookId];
    });

    const favoritesRef = doc(db, 'favorites', user.id);
    setDoc(favoritesRef, {
      bookIds: arrayUnion(bookId),
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((error) => {
      console.error('Failed to add favorite:', error);
      setFavorites(prev => prev.filter(id => id !== bookId));
    });
  };

  const removeFavorite = (bookId: string) => {
    if (!user) return;

    setFavorites(prev => prev.filter(id => id !== bookId));

    const favoritesRef = doc(db, 'favorites', user.id);
    setDoc(favoritesRef, {
      bookIds: arrayRemove(bookId),
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((error) => {
      console.error('Failed to remove favorite:', error);
      setFavorites(prev => prev.includes(bookId) ? prev : [...prev, bookId]);
    });
  };

  const isFavorite = (bookId: string): boolean => {
    return favorites.includes(bookId);
  };

  const toggleFavorite = (bookId: string) => {
    if (isFavorite(bookId)) {
      removeFavorite(bookId);
    } else {
      addFavorite(bookId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, error, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
