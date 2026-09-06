import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp } from 'lucide-react';
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
    'the-disciplined-trader'
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
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-800/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-forest-800">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Most read this week
          </p>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-forest-950 md:text-4xl font-display">
            Start with books readers keep opening.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-forest-900/70">
            A curated shelf of high-signal summaries across habits, thinking, trading, and wealth.
          </p>
        </div>
        <Link
          to="/summaries"
          className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-forest-900 border border-forest-900/15 shadow-sm transition-all duration-200 hover:bg-forest-800 hover:text-white hover:border-forest-800"
        >
          Browse library
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {mostReadBooks.map((book) => {
          const translatedTitle = getBookTitle(book.id);
          const translatedAuthor = getBookAuthor(book.id);
          const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;
          const description = getBookDescription(book.id);

          return (
            <Link
              key={book.id}
              to={bookUrl}
              className="group block"
            >
              <article className="h-full rounded-2xl bg-white p-3 shadow-card-rest border border-forest-900/[0.08] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-forest-600/30">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-forest-50/60 book-3d-shadow">
                  <img
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={book.coverImageUrl}
                    alt={`Cover of ${translatedTitle}`}
                    loading="lazy"
                  />

                  {book.rating && (
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-forest-950 shadow-sm backdrop-blur">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />
                      {book.rating}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-forest-950/95 via-forest-950/70 to-transparent p-3 pt-14 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-4 text-xs leading-5 text-white/90">{description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white">
                      Read brief
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="line-clamp-2 text-sm font-bold leading-5 text-forest-950 group-hover:text-forest-700 transition-colors">{translatedTitle}</h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-forest-900/60">by {translatedAuthor}</p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MostReadBooks;
