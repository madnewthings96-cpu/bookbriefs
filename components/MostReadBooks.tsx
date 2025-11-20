import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import { bookSummaryTranslations } from '../translations/bookSummaries';

const MostReadBooks: React.FC = () => {
  const { getBookTitle, getBookAuthor, currentLanguage } = useLanguage();
  const { books } = useBooks();

  // Specific books to display
  const featuredBookIds = [
    'atomic-habits',
    'the-4-hour-workweek',
    'trading-in-the-zone',
    'thinking-fast-and-slow',
    'marketwizards',
    'thedisciplinedtrader'
  ];

  const mostReadBooks = books.filter(book => featuredBookIds.includes(book.id));

  // Get book description from translations
  const getBookDescription = (bookId: string): string => {
    const translation = bookSummaryTranslations[bookId]?.[currentLanguage];
    if (translation && translation.summary) {
      // Extract first paragraph or first 200 characters
      const firstParagraph = translation.summary.split('\n\n')[0];
      const cleanText = firstParagraph.replace(/[#*`]/g, '').trim();
      return cleanText.length > 200 ? cleanText.substring(0, 200) + '...' : cleanText;
    }
    return 'Discover key insights from this book...';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-normal text-gray-900 mb-2 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          MOST READ THIS WEEK
        </h2>
      </div>

      {/* Books Grid - Smaller cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {mostReadBooks.map((book) => {
          const translatedTitle = getBookTitle(book.id);
          const translatedAuthor = getBookAuthor(book.id);
          const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;
          const description = getBookDescription(book.id);

          return (
            <Link
              key={book.id}
              to={bookUrl}
              className="block group relative"
            >
              <div className="relative overflow-hidden rounded-md shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:z-10">
                {/* Book Cover */}
                <div className="aspect-[2/3] overflow-hidden bg-gray-100">
                  <img
                    className="w-full h-full object-cover"
                    src={book.coverImageUrl}
                    alt={`Cover of ${translatedTitle}`}
                    loading="lazy"
                  />
                </div>

                {/* Hover Overlay with Description and Rating */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col overflow-hidden">
                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900">
                    {translatedTitle}
                  </h3>
                  
                  {/* Author */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                    by {translatedAuthor}
                  </p>

                  {/* Rating */}
                  {book.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.round(book.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{book.rating}</span>
                      <span className="text-xs text-gray-500">— {book.ratingsCount}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
                    {description}
                  </p>

                  {/* Read More Button */}
                  <div className="mt-auto pt-2">
                    <span className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                      ...more →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MostReadBooks;
