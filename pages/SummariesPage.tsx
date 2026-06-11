import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock3,
  Compass,
  Filter,
  Search,
  Star,
  X,
} from 'lucide-react';
import BookCard from '../components/BookCard';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from '../components/Spinner';
import { SITE_URL } from '../utils/seoConfig';
import type { Book } from '../types';

const starterBookIds = [
  'atomic-habits',
  'the-psychology-of-money',
  'rich-dad-poor-dad',
  'thinking-fast-and-slow',
  'trading-in-the-zone',
  'deep-work',
];

const sortByRating = (books: Book[]) => {
  return [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const location = useLocation();
  const { books, loading } = useBooks();
  const { getBookTitle, getBookAuthor } = useLanguage();
  const isArabicRoute = location.pathname.startsWith('/ar/');

  useSEO({
    title: isArabicRoute
      ? 'ملخصات كتب عربية وعالمية | تحليل'
      : 'Book Summaries - Business, Trading, Finance & Self-Development | Ta7leel',
    description: isArabicRoute
      ? 'تصفح مكتبة تحليل لملخصات الكتب العربية والعالمية في الأعمال والتداول والاستثمار وتطوير الذات.'
      : 'Browse practical book summaries from top business, trading, finance, psychology, and self-development books.',
    keywords: isArabicRoute
      ? 'ملخصات كتب, ملخصات كتب عربية, كتب تطوير الذات, كتب الاستثمار, كتب التداول'
      : 'book summaries, business book summaries, trading book summaries, finance book summaries, self-help books',
    type: 'website',
    canonical: `${SITE_URL}${location.pathname}`,
  });

  const genres = useMemo(() => {
    const uniqueGenres = [...new Set(books.map(book => book.category).filter(Boolean))];
    return uniqueGenres.sort();
  }, [books]);

  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(books.map(book => book.author).filter(Boolean))];
    return uniqueAuthors.sort();
  }, [books]);

  const featuredBook = useMemo(() => {
    if (books.length === 0) return null;
    return sortByRating(books)[0];
  }, [books]);

  const starterBooks = useMemo(() => {
    const byId = starterBookIds
      .map(id => books.find(book => book.id === id || book.arabicSlug === id))
      .filter(Boolean) as Book[];
    const fallback = sortByRating(books).filter(book => !byId.some(starter => starter.id === book.id));
    return [...byId, ...fallback].slice(0, 4);
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const translatedTitle = getBookTitle(book.id) === book.id ? book.title : getBookTitle(book.id);
      const translatedAuthor = getBookAuthor(book.id) === book.id ? book.author : getBookAuthor(book.id);
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const matchesSearch = !normalizedSearch ||
        translatedTitle.toLowerCase().includes(normalizedSearch) ||
        translatedAuthor.toLowerCase().includes(normalizedSearch) ||
        book.category.toLowerCase().includes(normalizedSearch);
      const matchesGenre = !selectedGenre || book.category === selectedGenre;
      const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
      const matchesRating = !selectedRating || (book.rating && book.rating >= parseFloat(selectedRating));
      return matchesSearch && matchesGenre && matchesAuthor && matchesRating;
    });
  }, [books, getBookAuthor, getBookTitle, searchQuery, selectedAuthor, selectedGenre, selectedRating]);

  const topGenres = genres.slice(0, 9);
  const hasActiveFilters = Boolean(searchQuery || selectedGenre || selectedAuthor || selectedRating);
  const summaryCountLabel = `${filteredBooks.length} ${filteredBooks.length === 1 ? 'summary' : 'summaries'}`;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedAuthor('');
    setSelectedRating('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf3]">
        <Spinner />
      </div>
    );
  }

  const featuredTitle = featuredBook ? (getBookTitle(featuredBook.id) === featuredBook.id ? featuredBook.title : getBookTitle(featuredBook.id)) : '';
  const featuredAuthorName = featuredBook ? (getBookAuthor(featuredBook.id) === featuredBook.id ? featuredBook.author : getBookAuthor(featuredBook.id)) : '';
  const featuredBookUrl = featuredBook ? (featuredBook.arabicSlug ? `/summary/${featuredBook.arabicSlug}` : `/summary/${featuredBook.id}`) : '';

  return (
    <>
      <StructuredData type="website" />
      <div className="min-h-screen overflow-x-hidden bg-[#fffaf3]">
        <section className="relative isolate overflow-hidden bg-[#f7f0e6] px-4 pb-14 pt-8 sm:px-6 md:pb-16 md:pt-10 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fffaf3] to-transparent" aria-hidden="true" />
          <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                Ta7leel library
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-gray-950 text-balance sm:text-5xl lg:text-6xl">
                Find the next idea worth reading.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#675b4d] md:text-lg md:leading-8">
                Browse practical summaries across money, habits, trading psychology, and better thinking. Search for a book, filter by category, or jump into the most useful brief right now.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#summaries-library"
                  className="pressable inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#a75d37] px-7 py-3 text-base font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.12),0_18px_38px_rgba(167,93,55,0.28)] transition-[transform,box-shadow,background-color] duration-300 hover:bg-[#8f4f2f] hover:shadow-[0_1px_2px_rgba(89,69,45,0.12),0_22px_48px_rgba(167,93,55,0.34)]"
                >
                  Browse library
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
                <Link
                  to="/calculators"
                  className="pressable inline-flex min-h-12 items-center justify-center rounded-full bg-white/70 px-6 py-3 text-base font-black text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10),0_10px_24px_rgba(89,69,45,0.08)] transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-gray-950"
                >
                  Use Calculator
                </Link>
              </div>

              <div className="mt-7 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  [String(books.length), 'summaries'],
                  [String(genres.length), 'categories'],
                  ['10 min', 'average read'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/60 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                    <div className="text-lg font-black text-gray-950 tabular-nums md:text-2xl">{value}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7a6f62] md:text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px] lg:min-h-[500px]">
              <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e5d8c7]/80 blur-3xl md:h-[460px] md:w-[460px]" aria-hidden="true" />
              <img
                src="/images/cat-reading-summaries.png"
                alt="Cat reading a book"
                className="relative z-10 mx-auto h-auto w-full max-w-[470px] select-none drop-shadow-[0_24px_44px_rgba(89,69,45,0.18)]"
                loading="eager"
                decoding="async"
              />

              {featuredBook && (
                <Link
                  to={featuredBookUrl}
                  className="group absolute bottom-4 left-0 z-20 hidden w-[320px] max-w-[78%] items-center gap-4 rounded-2xl bg-white/90 p-3 text-left shadow-[0_18px_44px_rgba(89,69,45,0.18)] ring-1 ring-[#d7c7b3] backdrop-blur transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(89,69,45,0.22)] sm:flex"
                >
                  <img
                    src={featuredBook.coverImageUrl}
                    alt={`Cover of ${featuredTitle}`}
                    className="h-24 w-16 shrink-0 rounded-xl object-cover shadow-[0_10px_20px_rgba(17,24,39,0.15)]"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="min-w-0 py-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#a75d37]">Featured summary</p>
                    <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-gray-950">{featuredTitle}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#6d6256]">{featuredAuthorName}</p>
                  </div>
                </Link>
              )}

              <div className="absolute right-0 top-8 z-20 hidden max-w-[220px] rounded-2xl bg-white/88 p-4 text-left shadow-[0_18px_40px_rgba(89,69,45,0.16)] ring-1 ring-[#d7c7b3] backdrop-blur md:block">
                <Clock3 className="mb-2 h-5 w-5 text-[#a75d37]" aria-hidden="true" />
                <p className="text-sm font-black leading-5 text-gray-950">A useful book idea before your next break ends.</p>
              </div>
            </div>
          </div>
        </section>

        <div id="summaries-library" className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <section className="sticky top-[86px] z-30 rounded-[22px] bg-white/95 p-3 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_16px_38px_rgba(89,69,45,0.10)] ring-1 ring-[#eadfce] backdrop-blur-xl md:rounded-[24px] md:p-4">
            <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="summary-search" className="mb-1.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.10em] text-[#7a6f62] md:mb-2 md:text-xs">
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  Search library
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8d7f] md:h-5 md:w-5" aria-hidden="true" />
                  <input
                    id="summary-search"
                    type="search"
                    placeholder="Search by title, author, or topic..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search for a book summary"
                    className="min-h-11 w-full rounded-xl bg-[#fffaf3] py-2.5 pl-10 pr-11 text-sm font-semibold text-gray-950 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)] outline-none placeholder:text-[#9a8d7f] transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-[#a75d37]/30 md:min-h-12 md:rounded-2xl md:py-3 md:pl-12 md:pr-12"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="pressable absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7a6f62] transition-[transform,background-color,color] duration-200 hover:bg-white hover:text-gray-950 md:right-2 md:h-10 md:w-10"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3 lg:w-[540px]">
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.10em] text-[#7a6f62] md:mb-2 md:text-xs">Genre</label>
                  <div className="relative">
                    <select
                      value={selectedGenre}
                      onChange={(event) => setSelectedGenre(event.target.value)}
                      className="min-h-11 w-full cursor-pointer appearance-none truncate rounded-xl bg-[#fffaf3] px-3 py-2.5 pr-8 text-xs font-bold text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-[#a75d37]/30 md:min-h-12 md:rounded-2xl md:text-sm"
                    >
                      <option value="">All genres</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a6f62]" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.10em] text-[#7a6f62] md:mb-2 md:text-xs">Author</label>
                  <div className="relative">
                    <select
                      value={selectedAuthor}
                      onChange={(event) => setSelectedAuthor(event.target.value)}
                      className="min-h-11 w-full cursor-pointer appearance-none truncate rounded-xl bg-[#fffaf3] px-3 py-2.5 pr-8 text-xs font-bold text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-[#a75d37]/30 md:min-h-12 md:rounded-2xl md:text-sm"
                    >
                      <option value="">All authors</option>
                      {authors.map((author) => (
                        <option key={author} value={author}>{author}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a6f62]" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.10em] text-[#7a6f62] md:mb-2 md:text-xs">Rating</label>
                  <div className="relative">
                    <select
                      value={selectedRating}
                      onChange={(event) => setSelectedRating(event.target.value)}
                      className="min-h-11 w-full cursor-pointer appearance-none truncate rounded-xl bg-[#fffaf3] px-3 py-2.5 pr-8 text-xs font-bold text-[#453c31] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.10)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-[#a75d37]/30 md:min-h-12 md:rounded-2xl md:text-sm"
                    >
                      <option value="">Any rating</option>
                      <option value="4.5">4.5 and up</option>
                      <option value="4">4 and up</option>
                      <option value="3.5">3.5 and up</option>
                      <option value="3">3 and up</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a6f62]" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {topGenres.length > 0 && (
              <div className="mt-4 hidden gap-2 overflow-x-auto pb-1 md:flex">
                <button
                  type="button"
                  onClick={() => setSelectedGenre('')}
                  className={`pressable inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-[transform,background-color,color,box-shadow] duration-200 ${!selectedGenre ? 'bg-[#a75d37] text-white shadow-[0_8px_20px_rgba(167,93,55,0.22)]' : 'bg-[#f7f0e6] text-[#453c31] hover:bg-[#e5d8c7]'}`}
                >
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  All
                </button>
                {topGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`pressable inline-flex min-h-10 shrink-0 items-center rounded-full px-4 py-2 text-sm font-black transition-[transform,background-color,color,box-shadow] duration-200 ${selectedGenre === genre ? 'bg-[#a75d37] text-white shadow-[0_8px_20px_rgba(167,93,55,0.22)]' : 'bg-[#f7f0e6] text-[#453c31] hover:bg-[#e5d8c7]'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </section>

          {starterBooks.length > 0 && !hasActiveFilters && (
            <section className="mt-8 rounded-[24px] bg-[#e5d8c7] p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_42px_rgba(89,69,45,0.10)] md:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Start here
                  </p>
                  <h2 className="text-2xl font-black tracking-tight text-gray-950 md:text-4xl">
                    Four summaries that make the library easier to enter.
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {starterBooks.map((book) => {
                    const title = getBookTitle(book.id) === book.id ? book.title : getBookTitle(book.id);
                    const bookUrl = book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`;

                    return (
                      <Link
                        key={book.id}
                        to={bookUrl}
                        className="group rounded-2xl bg-white/70 p-3 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_12px_26px_rgba(89,69,45,0.08)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_34px_rgba(89,69,45,0.14)]"
                      >
                        <img
                          src={book.coverImageUrl}
                          alt={`Cover of ${title}`}
                          className="mx-auto aspect-[3/4] w-full max-w-[92px] rounded-xl object-cover shadow-[0_10px_18px_rgba(17,24,39,0.14)]"
                          loading="lazy"
                          decoding="async"
                        />
                        <p className="mt-3 line-clamp-2 min-h-[2.25rem] text-sm font-black leading-tight text-gray-950 transition-colors duration-300 group-hover:text-[#a75d37]">{title}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e5d8c7] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7a4a31]">
                  <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Library results
                </p>
                <h2 className="text-2xl font-black text-gray-950 text-balance md:text-3xl">Browse summaries</h2>
                <p className="mt-1 text-sm font-semibold text-[#6d6256]">{summaryCountLabel} ready to read</p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="pressable inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-black text-[#453c31] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_24px_rgba(89,69,45,0.08)] transition-[transform,background-color,color] duration-200 hover:bg-[#a75d37] hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="grid min-h-[340px] gap-6 rounded-[24px] bg-white px-6 py-8 text-center shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(89,69,45,0.08)] ring-1 ring-[#eadfce] md:grid-cols-[0.75fr_1.25fr] md:items-center md:text-left">
                <div className="mx-auto w-full max-w-[210px] md:max-w-[240px]">
                  <img
                    src="/images/bookbriefs-reading-companion.png"
                    alt="BookBriefs reading companion"
                    className="h-auto w-full rounded-[24px] shadow-[0_18px_40px_rgba(89,69,45,0.14)] ring-1 ring-[#dccfbd]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-950">No summaries match those filters</p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#6d6256]">
                    Try a broader search, switch categories, or clear the filters to return to the full library.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="pressable mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#a75d37] px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(167,93,55,0.24)] transition-[transform,background-color] duration-200 hover:bg-[#8f4f2f]"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default SummariesPage;
