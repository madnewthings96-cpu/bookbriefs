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
      
      // Cache books in sessionStorage for faster subsequent loads
      try {
        sessionStorage.setItem('books_cache', JSON.stringify(booksData));
        sessionStorage.setItem('books_cache_timestamp', Date.now().toString());
      } catch (e) {
        // Ignore storage errors
        console.warn('Failed to cache books:', e);
      }
      
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
      
      // Try to load from cache if available
      try {
        const cachedBooks = sessionStorage.getItem('books_cache');
        if (cachedBooks) {
          setBooks(JSON.parse(cachedBooks));
          console.log('📦 Loaded books from cache');
        }
      } catch (e) {
        console.warn('Failed to load from cache:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Try to load from cache first for instant display
    try {
      const cachedBooks = sessionStorage.getItem('books_cache');
      const cacheTimestamp = sessionStorage.getItem('books_cache_timestamp');
      
      if (cachedBooks && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setBooks(JSON.parse(cachedBooks));
          setLoading(false);
          console.log('📦 Loaded books from cache instantly');
          return;
        }
      }
    } catch (e) {
      console.warn('Cache load failed:', e);
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
    } else {
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
