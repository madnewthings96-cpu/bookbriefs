import type { Language } from '../contexts/LanguageContext';
import { book as psychoCybernetics } from '../scripts/library/psycho-cybernetics';
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

const psychoCyberneticsMetadata: Book = {
  id: psychoCybernetics.id,
  title: psychoCybernetics.title,
  author: psychoCybernetics.author,
  coverImageUrl: psychoCybernetics.coverImageUrl,
  category: psychoCybernetics.category,
  rating: psychoCybernetics.rating,
  ratingsCount: psychoCybernetics.ratingsCount,
  publicationYear: psychoCybernetics.publicationYear,
  pageCount: psychoCybernetics.pageCount,
  arabicSlug: psychoCybernetics.arabicSlug,
  amazonUrl: psychoCybernetics.amazonUrl,
  kindleUrl: psychoCybernetics.kindleUrl,
  audibleUrl: psychoCybernetics.audibleUrl,
};

const LOCAL_BOOK_FALLBACKS: Book[] = [psychoCyberneticsMetadata, situatedMetadata];

const LOCAL_SUMMARIES = new Map<string, SummaryData>([
  [
    psychoCybernetics.id,
    {
      summary: psychoCybernetics.summary,
      keyTakeaways: psychoCybernetics.keyTakeaways,
    },
  ],
  [
    situated.id,
    {
      summary: situated.summary,
      keyTakeaways: situated.keyTakeaways,
    },
  ],
]);

export function mergeBooksWithLocalFallbacks(firestoreBooks: Book[]): Book[] {
  const merged = new Map(LOCAL_BOOK_FALLBACKS.map((book) => [book.id, book]));

  firestoreBooks.forEach((book) => merged.set(book.id, book));

  return Array.from(merged.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export function getLocalBookSummary(bookId: string, language: Language): SummaryData | null {
  if (language !== 'en') return null;

  return LOCAL_SUMMARIES.get(bookId) ?? null;
}
