import type { Language } from '../contexts/LanguageContext';
import { book as situated } from '../scripts/library/situated';
import type { Book, SummaryData } from '../types';

const situatedMetadata: Book = {
  id: situated.id,
  title: situated.title,
  author: situated.author,
  coverImageUrl: situated.coverImageUrl,
  category: situated.category,
  rating: situated.rating,
  ratingsCount: situated.ratingsCount,
  publicationYear: situated.publicationYear,
  pageCount: situated.pageCount,
  arabicSlug: situated.arabicSlug,
  amazonUrl: situated.amazonUrl,
  kindleUrl: situated.kindleUrl,
  audibleUrl: situated.audibleUrl,
};

const LOCAL_BOOK_FALLBACKS: Book[] = [situatedMetadata];

export function mergeBooksWithLocalFallbacks(firestoreBooks: Book[]): Book[] {
  const merged = new Map(LOCAL_BOOK_FALLBACKS.map((book) => [book.id, book]));

  firestoreBooks.forEach((book) => merged.set(book.id, book));

  return Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export function getLocalBookSummary(bookId: string, language: Language): SummaryData | null {
  if (bookId !== situated.id || language !== 'en') return null;

  return {
    summary: situated.summary,
    keyTakeaways: situated.keyTakeaways,
  };
}
