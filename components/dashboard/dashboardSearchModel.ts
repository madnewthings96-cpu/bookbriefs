import type { Book } from '../../types';

export interface DashboardSearchBook {
  book: Book;
  title: string;
  author: string;
  score: number;
}

export type DashboardSearchDirection = 'next' | 'previous';

export function getDashboardSearchActiveIndex(
  activeIndex: number,
  resultCount: number,
  direction: DashboardSearchDirection,
) {
  if (resultCount <= 0) return -1;
  const currentIndex = activeIndex >= 0 && activeIndex < resultCount ? activeIndex : -1;
  if (direction === 'next') return currentIndex < resultCount - 1 ? currentIndex + 1 : 0;
  return currentIndex > 0 ? currentIndex - 1 : resultCount - 1;
}

export function searchDashboardBooks(
  books: Array<Book & { localizedTitle?: string; localizedAuthor?: string }>,
  query: string,
  limit = 6,
): DashboardSearchBook[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];

  return books
    .map((book, index) => {
      const title = book.localizedTitle || book.title;
      const author = book.localizedAuthor || book.author;
      const haystacks = [title, author, book.category].map(value => value.toLocaleLowerCase());
      const score = haystacks[0].startsWith(needle) ? 0 : haystacks[0].includes(needle) ? 1 : haystacks[1].includes(needle) ? 2 : haystacks[2].includes(needle) ? 3 : 99;
      return { book, title, author, score, index };
    })
    .filter(item => item.score < 99)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit);
}
