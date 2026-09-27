import type { BookDefinition } from '../types';
import { getBookSummaryTranslation } from '../../translations/bookSummaries';

const english = getBookSummaryTranslation('becoming', 'en')!;
export const book: BookDefinition = {
  id: 'becoming', title: 'Becoming', author: 'Michelle Obama', category: 'Biography',
  coverImageUrl: '/images/becoming.jpg', arabicSlug: 'ملخص-كتاب-صيرورة-ميشيل-أوباما', publicationYear: 2018,
  isPremium: false, translations: { en: { title: 'Becoming', author: 'Michelle Obama' } },
  summary: english.summary, keyTakeaways: english.keyTakeaways,
};
