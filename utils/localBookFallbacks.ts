import type { Language } from '../contexts/LanguageContext';
import { book as dieWithZero } from '../scripts/library/die-with-zero';
import { book as neverSplitTheDifference } from '../scripts/library/never-split-the-difference';
import { book as psychoCybernetics } from '../scripts/library/psycho-cybernetics';
import { book as situated } from '../scripts/library/situated';
import { book as unreasonableHospitality } from '../scripts/library/unreasonable-hospitality';
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

const dieWithZeroMetadata: Book = {
  id: dieWithZero.id,
  title: dieWithZero.title,
  author: dieWithZero.author,
  coverImageUrl: dieWithZero.coverImageUrl,
  category: dieWithZero.category,
  rating: dieWithZero.rating,
  ratingsCount: dieWithZero.ratingsCount,
  publicationYear: dieWithZero.publicationYear,
  pageCount: dieWithZero.pageCount,
  arabicSlug: dieWithZero.arabicSlug,
  amazonUrl: dieWithZero.amazonUrl,
  kindleUrl: dieWithZero.kindleUrl,
  audibleUrl: dieWithZero.audibleUrl,
};

const neverSplitTheDifferenceMetadata: Book = {
  id: neverSplitTheDifference.id,
  title: neverSplitTheDifference.title,
  author: neverSplitTheDifference.author,
  coverImageUrl: neverSplitTheDifference.coverImageUrl,
  category: neverSplitTheDifference.category,
  rating: neverSplitTheDifference.rating,
  ratingsCount: neverSplitTheDifference.ratingsCount,
  publicationYear: neverSplitTheDifference.publicationYear,
  pageCount: neverSplitTheDifference.pageCount,
  arabicSlug: neverSplitTheDifference.arabicSlug,
  amazonUrl: neverSplitTheDifference.amazonUrl,
  kindleUrl: neverSplitTheDifference.kindleUrl,
  audibleUrl: neverSplitTheDifference.audibleUrl,
};

const unreasonableHospitalityMetadata: Book = {
  id: unreasonableHospitality.id,
  title: unreasonableHospitality.title,
  author: unreasonableHospitality.author,
  coverImageUrl: unreasonableHospitality.coverImageUrl,
  category: unreasonableHospitality.category,
  rating: unreasonableHospitality.rating,
  ratingsCount: unreasonableHospitality.ratingsCount,
  publicationYear: unreasonableHospitality.publicationYear,
  pageCount: unreasonableHospitality.pageCount,
  arabicSlug: unreasonableHospitality.arabicSlug,
  amazonUrl: unreasonableHospitality.amazonUrl,
  kindleUrl: unreasonableHospitality.kindleUrl,
  audibleUrl: unreasonableHospitality.audibleUrl,
};

const LOCAL_BOOK_FALLBACKS: Book[] = [
  dieWithZeroMetadata,
  neverSplitTheDifferenceMetadata,
  psychoCyberneticsMetadata,
  situatedMetadata,
  unreasonableHospitalityMetadata,
];

const LOCAL_SUMMARIES = new Map<string, SummaryData>([
  [
    unreasonableHospitality.id,
    {
      summary: unreasonableHospitality.summary,
      keyTakeaways: unreasonableHospitality.keyTakeaways,
    },
  ],
  [
    dieWithZero.id,
    {
      summary: dieWithZero.summary,
      keyTakeaways: dieWithZero.keyTakeaways,
    },
  ],
  [
    neverSplitTheDifference.id,
    {
      summary: neverSplitTheDifference.summary,
      keyTakeaways: neverSplitTheDifference.keyTakeaways,
    },
  ],
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
