import type { Book } from '../types';

export type ReadingSurface = 'public' | 'dashboard';

export const getBookSummaryHref = (
  book: Pick<Book, 'id' | 'arabicSlug'>,
  surface: ReadingSurface,
) => {
  const slug = book.arabicSlug || book.id;
  return surface === 'dashboard' ? `/dashboard/summary/${slug}` : `/summary/${slug}`;
};

export const getBookLibraryHref = (surface: ReadingSurface) =>
  surface === 'dashboard' ? '/dashboard/discover' : '/summaries';
