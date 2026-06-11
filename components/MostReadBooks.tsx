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
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Most read this week
          </p>
          <h2 className="max-w-2xl text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
            Start with books readers keep opening.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#675b4d]">
            A quick shelf of high-signal summaries across habits, thinking, trading, and work.
          </p>
        </div>
        <Link
          to="/summaries"
          className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_12px_28px_rgba(89,69,45,0.08)] transition-[background-color,color,transform] duration-200 hover:bg-[#a75d37] hover:text-white"
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
              <article className="h-full rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_40px_rgba(89,69,45,0.10)] ring-1 ring-[#d7c7b3]/70 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_24px_54px_rgba(89,69,45,0.16)]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#f7f0e6]">
                  <img
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={book.coverImageUrl}
                    alt={`Cover of ${translatedTitle}`}
                    loading="lazy"
                  />

                  {book.rating && (
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-black text-gray-950 shadow-[0_8px_18px_rgba(17,24,39,0.14)] backdrop-blur">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      {book.rating}
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-gray-950/88 via-gray-950/60 to-transparent p-3 pt-14 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-4 text-xs leading-5 text-white/90">{description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-white">
                      Read brief
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="line-clamp-2 text-sm font-black leading-5 text-gray-950">{translatedTitle}</h3>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#7a6f62]">by {translatedAuthor}</p>
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
