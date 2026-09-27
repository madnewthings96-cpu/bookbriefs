import type { Book } from '../types';
import { arabicBookSummaries, type SummaryLanguage } from '../translations/arabicBookSummaries';
import { SITE_URL, canonicalRoutePath } from './seoConfig';
import { STARTER_BOOKS } from './starterBooks';

export const arabicCategoryNames: Record<string, string> = {
  'Self-Help': 'تطوير الذات', 'Personal Development': 'تطوير الذات', Finance: 'المال والاستثمار', Psychology: 'علم النفس', Trading: 'التداول', Business: 'الأعمال', Economics: 'الاقتصاد', Biography: 'السير الذاتية', Leadership: 'القيادة', Sociology: 'علم الاجتماع', 'Science Fiction': 'الخيال العلمي', Spirituality: 'الروحانيات',
};

export function getSummaryPath(book: Pick<Book, 'id' | 'arabicSlug'>, language: SummaryLanguage = 'en'): string {
  if (language === 'ar') {
    const translation = arabicBookSummaries[book.id];
    if (!translation) throw new Error(`Arabic translation unavailable for ${book.id}`);
    return canonicalRoutePath(`/ar/summary/${translation.slug}`);
  }
  const starter = STARTER_BOOKS.find(item => item.id === book.id);
  return canonicalRoutePath(`/summary/${starter?.arabicSlug || book.arabicSlug || book.id}`);
}

export function getSummaryAlternates(book: Pick<Book, 'id' | 'arabicSlug'>): Array<{ language: SummaryLanguage; href: string }> {
  if (!arabicBookSummaries[book.id]) return [];
  return (['en', 'ar'] as const).map(language => ({ language, href: new URL(getSummaryPath(book, language), SITE_URL).href }));
}

export function resolveArabicSummaryId(idOrSlug?: string): string | undefined {
  return Object.entries(arabicBookSummaries).find(([id, translation]) => id === idOrSlug || translation.slug === idOrSlug)?.[0];
}
