import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (bookId: string) => void;
  removeFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (bookId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (user) {
      const storageKey = `favorites_${user.email}`;
      const storedFavorites = localStorage.getItem(storageKey);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } else {
      // Clear favorites when user logs out
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      const storageKey = `favorites_${user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addFavorite = (bookId: string) => {
    setFavorites(prev => {
      if (prev.includes(bookId)) {
        return prev;
      }
      return [...prev, bookId];
    });
  };

  const removeFavorite = (bookId: string) => {
    setFavorites(prev => prev.filter(id => id !== bookId));
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
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
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
