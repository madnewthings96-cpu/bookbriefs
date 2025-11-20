/**
 * Type definitions for book library
 */

export interface BookDefinition {
  id: string;
  title: string;
  author: string;
  category: 'Finance' | 'Business' | 'Self-Help' | 'Trading' | 'Psychology' | 'Biography' | 'Economics' | 'Sociology' | 'Leadership';
  coverImageUrl: string;
  rating: number;
  publicationYear: number;
  pageCount: number;
  arabicSlug: string;
  summary: string;
  keyTakeaways: string[];
  isPremium: boolean;
  translations: {
    en: {
      title: string;
      author: string;
    };
  };
  // Optional fields
  ratingsCount?: string;
  createdAt?: string;
  updatedAt?: string;
  searchTerms?: string[];
}

export interface SyncResult {
  success: boolean;
  bookId: string;
  operation: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
  error?: any;
}

export interface SyncStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  books: SyncResult[];
}
