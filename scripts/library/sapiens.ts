import type { BookDefinition } from '../types';
import { getBookSummaryTranslation } from '../../translations/bookSummaries';

const english = getBookSummaryTranslation('sapiens', 'en')!;
export const book: BookDefinition = {
  id: 'sapiens', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Sociology',
  coverImageUrl: '/images/sapiens.jpg', arabicSlug: 'ملخص-كتاب-العاقل-تاريخ-مختصر-للنوع-البشري', publicationYear: 2011,
  isPremium: false, translations: { en: { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari' } },
  summary: english.summary, keyTakeaways: english.keyTakeaways,
};
