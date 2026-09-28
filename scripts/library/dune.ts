import type { BookDefinition } from '../types.js';
import { bookSummaryTranslations } from '../../translations/bookSummaries';

// Preserve the existing English reader and its public slug; add static/offline metadata.
const english = bookSummaryTranslations.dune.en!;
export const book: BookDefinition = {
  id: 'dune',
  title: 'Dune',
  author: 'Frank Herbert',
  category: 'Science Fiction',
  coverImageUrl: '/images/dune.jpg',
  publicationYear: 1965,
  pageCount: 688,
  arabicSlug: 'ملخص-كتاب-الكثيب',
  isPremium: false,
  translations: { en: { title: 'Dune', author: 'Frank Herbert' } },
  summary: english.summary,
  keyTakeaways: english.keyTakeaways,
};
