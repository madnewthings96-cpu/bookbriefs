import type { BookDefinition } from '../scripts/types';

type StarterBookMetadata = Pick<BookDefinition, 'id' | 'title' | 'author' | 'category' | 'coverImageUrl' | 'arabicSlug' | 'publicationYear'>;

// Existing English routes are preserved, including the Arabic slug already used
// for the English Psychology of Money page. Arabic content has separate URLs.
export const STARTER_BOOKS: StarterBookMetadata[] = [
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/images/atomic-habits.jpg', arabicSlug: 'atomic-habits', publicationYear: 2018 },
  { id: 'the-psychology-of-money', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', coverImageUrl: '/images/the psychology of money.jpg', arabicSlug: 'سيكولوجية-المال', publicationYear: 2020 },
  { id: 'rich-dad-poor-dad', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', category: 'Finance', coverImageUrl: '/images/rich dad poor dad.jpg', arabicSlug: 'rich-dad-poor-dad', publicationYear: 1997 },
  { id: 'thinking-fast-and-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', coverImageUrl: '/images/fast and slow.jpg', arabicSlug: 'thinking-fast-and-slow', publicationYear: 2011 },
  { id: 'trading-in-the-zone', title: 'Trading in the Zone', author: 'Mark Douglas', category: 'Trading', coverImageUrl: '/images/trading-in-the-zone.jpg', arabicSlug: 'trading-in-the-zone', publicationYear: 2000 },
];
