export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
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
