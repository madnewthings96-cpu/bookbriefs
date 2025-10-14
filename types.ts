export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  category: string;
  rating?: number;
  ratingsCount?: string;
  publicationYear?: number;
  pageCount?: number;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  reviewText: string;
  helpful: number;
}

export interface SummaryData {
  summary: string;
  keyTakeaways: string[];
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  category: string;
  summary: string;
  keyTakeaways: string[];
  isPremium: boolean;
}

export interface Broker {
  name: string;
  logoUrl: string;
  minDeposit: number;
  commission: number | string;
  eurUsdSpread: number;
  liveAccountUrl: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  avatarUrl: string;
}

export interface PersonalNote {
  id: string;
  bookId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalNotesData {
  notes: PersonalNote[];
  highlights: Highlight[];
}
