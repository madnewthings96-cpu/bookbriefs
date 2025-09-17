import { bookSummaryTranslations } from '../translations/bookSummaries';
import { Language } from '../contexts/LanguageContext';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
}

const getBooksForLanguage = (language: Language): { [key: string]: any } => {
  const books: { [key: string]: any } = {};
  Object.entries(bookSummaryTranslations).forEach(([bookId, translations]) => {
    if (translations[language]) {
      books[bookId] = translations[language];
    }
  });
  return books;
};

export const searchBooks = (query: string, language: Language): SearchResult[] => {
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) return [];

  const books = getBooksForLanguage(language);
  const results: SearchResult[] = [];

  Object.entries(books).forEach(([bookId, bookData]) => {
    const { summary, keyTakeaways } = bookData;
    
    // Search in summary
    if (summary.toLowerCase().includes(searchQuery)) {
      // Get a snippet of text around the match
      const index = summary.toLowerCase().indexOf(searchQuery);
      const start = Math.max(0, index - 100);
      const end = Math.min(summary.length, index + 100);
      const description = summary.slice(start, end).trim() + '...';

      results.push({
        id: bookId,
        title: formatBookTitle(bookId),
        description,
        path: `/summaries/${bookId}`
      });
    }

    // Search in key takeaways
    if (keyTakeaways.some(takeaway => takeaway.toLowerCase().includes(searchQuery))) {
      const matchingTakeaway = keyTakeaways.find(takeaway => 
        takeaway.toLowerCase().includes(searchQuery)
      );
      
      if (matchingTakeaway && !results.find(r => r.id === bookId)) {
        results.push({
          id: bookId,
          title: formatBookTitle(bookId),
          description: matchingTakeaway,
          path: `/summaries/${bookId}`
        });
      }
    }
  });

  return results;
};

const formatBookTitle = (bookId: string): string => {
  return bookId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};