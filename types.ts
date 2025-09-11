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
  id: number;
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
