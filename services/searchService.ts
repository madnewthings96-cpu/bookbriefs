import { bookSummaryTranslations } from '../translations/bookSummaries';
import { Language } from '../contexts/LanguageContext';
import { Book } from '../types';

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

export const searchBooks = (query: string, language: Language, books: Book[]): SearchResult[] => {
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) return [];

  const translatedBooks = getBooksForLanguage(language);
  const results: SearchResult[] = [];

  // First, search in book titles and authors from constants
  books.forEach((book) => {
    const titleMatch = book.title.toLowerCase().includes(searchQuery);
    const authorMatch = book.author.toLowerCase().includes(searchQuery);
    
    if (titleMatch || authorMatch) {
      // Check if we already have this book in results
      if (!results.find(r => r.id === book.id)) {
        results.push({
          id: book.id,
          title: book.title,
          description: `by ${book.author} - ${book.category}`,
          path: `/summaries/${book.id}`
        });
      }
    }
  });

  // Then search in summaries and takeaways
  Object.entries(translatedBooks).forEach(([bookId, bookData]) => {
    const { summary, keyTakeaways } = bookData;
    
    // Search in summary
    if (summary.toLowerCase().includes(searchQuery)) {
      // Check if already added
      if (!results.find(r => r.id === bookId)) {
        // Get a snippet of text around the match
        const index = summary.toLowerCase().indexOf(searchQuery);
        const start = Math.max(0, index - 100);
        const end = Math.min(summary.length, index + 100);
        const description = summary.slice(start, end).trim() + '...';

        const bookInfo = books.find(b => b.id === bookId);
        results.push({
          id: bookId,
          title: bookInfo ? bookInfo.title : formatBookTitle(bookId),
          description,
          path: `/summaries/${bookId}`
        });
      }
    }

    // Search in key takeaways
    if (keyTakeaways && keyTakeaways.some(takeaway => takeaway.toLowerCase().includes(searchQuery))) {
      const matchingTakeaway = keyTakeaways.find(takeaway => 
        takeaway.toLowerCase().includes(searchQuery)
      );
      
      if (matchingTakeaway && !results.find(r => r.id === bookId)) {
        const bookInfo = books.find(b => b.id === bookId);
        results.push({
          id: bookId,
          title: bookInfo ? bookInfo.title : formatBookTitle(bookId),
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