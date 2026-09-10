/**
 * BooksContext - Manages book data from Firestore
 * 
 * This context provides:
 * - Real-time book data from Firestore
 * - Loading states
 * - Book lookup by ID
 * - Search and filter capabilities
 * - Caching for performance
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { getDbInstance } from '../firebase';
import { Book } from '../types';
import {
  readBooksCache,
  writeBooksCache,
  type BooksCacheStorage,
} from './booksCache';

interface BooksContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  getBookById: (id: string) => Book | undefined;
  getBooksByCategory: (category: string) => Book[];
  searchBooks: (searchTerm: string) => Book[];
  refreshBooks: () => Promise<void>;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const getSessionStorage = (): BooksCacheStorage | null => {
  try {
    if (typeof globalThis === 'undefined' || !('sessionStorage' in globalThis)) return null;
    return globalThis.sessionStorage as BooksCacheStorage;
  } catch {
    return null;
  }
};

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
};

interface BooksProviderProps {
  children: React.ReactNode;
  useRealtime?: boolean; // Enable real-time updates
}

export const BooksProvider: React.FC<BooksProviderProps> = ({ 
  children, 
  useRealtime = false 
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from Firestore
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const db = getDbInstance();
      const booksRef = collection(db, 'books');
      const q = query(booksRef, orderBy('title'));
      
      const snapshot = await getDocs(q);
      const booksData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Book[];
      
      setBooks(booksData);
      
      // Cache books in sessionStorage for faster subsequent loads.
      writeBooksCache(getSessionStorage(), booksData);
      
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
      
      // Try a validated cache fallback if Firestore is unavailable. A stale
      // but complete catalog is more useful than replacing the page with an
      // empty state; malformed cache entries are removed by the reader.
      const cached = readBooksCache(getSessionStorage());
      if (cached) {
        setBooks(cached.books);
        console.log('📦 Loaded books from cache');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Try to load from cache first for instant display. The cache reader
    // validates every required field and clears only an invalid cache pair.
    const cached = readBooksCache(getSessionStorage());
    const usedFreshCache = Boolean(cached?.fresh);
    if (cached) {
      setBooks(cached.books);
      if (cached.fresh) {
        setLoading(false);
        console.log('📦 Loaded books from cache instantly');
      } else {
        console.log('📦 Loaded books from stale cache while refreshing');
      }
    }

    // Fetch from Firestore
    if (useRealtime) {
      // Real-time listener
      const db = getDbInstance();
      const booksRef = collection(db, 'books');
      const q = query(booksRef, orderBy('title'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const booksData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Book[];
        
        setBooks(booksData);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('Error in real-time listener:', err);
        setError('Failed to sync books');
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!usedFreshCache) {
      // One-time fetch
      fetchBooks();
    }
  }, [useRealtime]);

  // Get book by ID (memoized for performance)
  const getBookById = useMemo(() => {
    const bookMap = new Map(books.map(book => [book.id, book]));
    return (id: string) => bookMap.get(id);
  }, [books]);

  // Get books by category
  const getBooksByCategory = (category: string): Book[] => {
    return books.filter(book => 
      book.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Search books
  const searchBooks = (searchTerm: string): Book[] => {
    if (!searchTerm.trim()) return books;
    
    const term = searchTerm.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.category.toLowerCase().includes(term)
    );
  };

  // Manual refresh
  const refreshBooks = async () => {
    await fetchBooks();
  };

  const value: BooksContextType = {
    books,
    loading,
    error,
    getBookById,
    getBooksByCategory,
    searchBooks,
    refreshBooks,
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
};
