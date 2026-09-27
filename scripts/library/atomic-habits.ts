import type { BookDefinition } from '../types';
import { STARTER_BOOKS } from '../../utils/starterBooks';
import { getBookSummaryTranslation } from '../../translations/bookSummaries';

const metadata = STARTER_BOOKS.find(book => book.id === 'atomic-habits')!;
const content = getBookSummaryTranslation(metadata.id, 'en')!;
export const book: BookDefinition = {
  ...metadata,
  ...content,
  isPremium: false,
  translations: { en: { title: metadata.title, author: metadata.author } },
};
