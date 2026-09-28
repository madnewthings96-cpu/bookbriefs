import type { BookDefinition } from '../types';
import { getBookSummaryTranslation } from '../../translations/bookSummaries';

const english = getBookSummaryTranslation('educated', 'en')!;
export const book: BookDefinition = {
  id: 'educated', title: 'Educated', author: 'Tara Westover', category: 'Biography',
  coverImageUrl: '/images/educated.jpg', arabicSlug: 'ملخص-كتاب-متعلمة', publicationYear: 2018,
  isPremium: false, translations: { en: { title: 'Educated', author: 'Tara Westover' } },
  summary: english.summary, keyTakeaways: english.keyTakeaways,
};
