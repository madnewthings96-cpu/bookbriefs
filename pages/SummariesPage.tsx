
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookCard from '../components/BookCard';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import Spinner from '../components/Spinner';
import { SITE_URL } from '../utils/seoConfig';

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

  // Get unique genres and authors for filters
  const genres = useMemo(() => {
    const uniqueGenres = [...new Set(books.map(book => book.category).filter(Boolean))];
    return uniqueGenres.sort();
  }, [books]);

  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(books.map(book => book.author).filter(Boolean))];
    return uniqueAuthors.sort();
  }, [books]);

  // Get the featured book (first book with highest rating, or just first book)
  const featuredBook = useMemo(() => {
    if (books.length === 0) return null;
    const sortedByRating = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sortedByRating[0];
  }, [books]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Show all books from Firestore - trust the database as the source of truth
  const filteredBooks = books.filter(book => {
    const translatedTitle = getBookTitle(book.id) === book.id ? book.title : getBookTitle(book.id);
    const translatedAuthor = getBookAuthor(book.id) === book.id ? book.author : getBookAuthor(book.id);
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch = !normalizedSearch ||
      translatedTitle.toLowerCase().includes(normalizedSearch) ||
      translatedAuthor.toLowerCase().includes(normalizedSearch);
    const matchesGenre = !selectedGenre || book.category === selectedGenre;
    const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
    const matchesRating = !selectedRating || (book.rating && book.rating >= parseFloat(selectedRating));
    return matchesSearch && matchesGenre && matchesAuthor && matchesRating;
  });

  const topGenres = genres.slice(0, 8);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Get featured book translated info
  const featuredTitle = featuredBook ? (getBookTitle(featuredBook.id) === featuredBook.id ? featuredBook.title : getBookTitle(featuredBook.id)) : '';
  const featuredAuthorName = featuredBook ? (getBookAuthor(featuredBook.id) === featuredBook.id ? featuredBook.author : getBookAuthor(featuredBook.id)) : '';
  const featuredBookUrl = featuredBook ? (featuredBook.arabicSlug ? `/summary/${featuredBook.arabicSlug}` : `/summary/${featuredBook.id}`) : '';

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <section className="overflow-hidden rounded-[28px] bg-[#E7EBDF] shadow-[0_1px_2px_rgba(17,24,39,0.05),0_22px_64px_rgba(71,85,62,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06),0_8px_22px_rgba(71,85,62,0.08)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white" aria-hidden="true">✓</span>
                Library
              </div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-gray-950 text-balance md:text-5xl">
                Choose your next summary faster
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-700 text-pretty md:text-base">
                Search, filter, and jump into concise ideas from the books people keep coming back to.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
                  <p className="text-2xl font-bold text-gray-950 tabular-nums">{books.length}</p>
                  <p className="text-xs font-semibold text-gray-500">Total summaries</p>
                </div>
                <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
                  <p className="text-2xl font-bold text-gray-950 tabular-nums">{genres.length}</p>
                  <p className="text-xs font-semibold text-gray-500">Categories</p>
                </div>
              </div>
            </div>

            {featuredBook && (
              <div className="bg-white/40 p-5 md:p-6 lg:p-8">
                <Link
                  to={featuredBookUrl}
                  className="group grid h-full min-h-[260px] grid-cols-[104px_1fr] gap-5 rounded-[22px] bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_18px_44px_rgba(71,85,62,0.14)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_24px_54px_rgba(71,85,62,0.18)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/35 sm:grid-cols-[132px_1fr]"
                >
                  <div className="overflow-hidden rounded-[16px] bg-gray-100 book-cover-outline">
                    <img
                      src={featuredBook.coverImageUrl}
                      alt={`Cover of ${featuredTitle}`}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-between py-1">
                    <div>
                      <span className="inline-flex min-h-8 items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.12)]">
                        Featured summary
                      </span>
                      <h2 className="mt-4 line-clamp-3 text-xl font-bold leading-tight text-gray-950 text-balance md:text-2xl">{featuredTitle}</h2>
                      <p className="mt-2 text-sm font-medium text-gray-600">{featuredAuthorName}</p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {featuredBook.rating && (
                        <span className="inline-flex min-h-9 items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-800 tabular-nums">
                          {featuredBook.rating.toFixed(1)} rating
                        </span>
                      )}
                      <span className="inline-flex min-h-9 items-center rounded-full bg-gray-950 px-4 py-1.5 text-sm font-bold text-white transition-colors duration-200 group-hover:bg-orange-600">
                        Read summary
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="sticky top-14 z-30 mt-4 rounded-[20px] bg-white/95 p-3 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_16px_38px_rgba(17,24,39,0.08)] backdrop-blur-xl md:mt-5 md:rounded-[24px] md:p-4">
          <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="summary-search" className="mb-1.5 block text-[11px] font-bold uppercase text-gray-500 md:mb-2 md:text-xs">Search library</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="summary-search"
                  type="search"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search for a book summary"
                  className="min-h-10 w-full rounded-xl bg-gray-50 py-2.5 pl-10 pr-11 text-sm font-medium text-gray-950 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] outline-none placeholder:text-gray-400 transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-400/40 md:min-h-12 md:rounded-2xl md:py-3 md:pl-12 md:pr-12"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="pressable absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-[transform,background-color,color] duration-200 hover:bg-white hover:text-gray-700 md:right-2 md:h-10 md:w-10"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:w-[520px]">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-500 md:mb-2 md:text-xs">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="min-h-10 w-full cursor-pointer appearance-none truncate rounded-xl bg-gray-50 px-2 py-2.5 text-xs font-semibold text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-400/40 md:min-h-12 md:rounded-2xl md:px-3 md:py-3 md:text-sm"
                >
                  <option value="">All genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-500 md:mb-2 md:text-xs">Author</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="min-h-10 w-full cursor-pointer appearance-none truncate rounded-xl bg-gray-50 px-2 py-2.5 text-xs font-semibold text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-400/40 md:min-h-12 md:rounded-2xl md:px-3 md:py-3 md:text-sm"
                >
                  <option value="">All authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase text-gray-500 md:mb-2 md:text-xs">Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="min-h-10 w-full cursor-pointer appearance-none truncate rounded-xl bg-gray-50 px-2 py-2.5 text-xs font-semibold text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] outline-none transition-[box-shadow,background-color] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-400/40 md:min-h-12 md:rounded-2xl md:px-3 md:py-3 md:text-sm"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5 and up</option>
                  <option value="4">4 and up</option>
                  <option value="3.5">3.5 and up</option>
                  <option value="3">3 and up</option>
                </select>
              </div>
            </div>
          </div>

          {topGenres.length > 0 && (
            <div className="mt-4 hidden gap-2 overflow-x-auto pb-1 md:flex">
              <button
                type="button"
                onClick={() => setSelectedGenre('')}
                className={`pressable inline-flex min-h-10 shrink-0 items-center rounded-full px-4 py-2 text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ${!selectedGenre ? 'bg-gray-950 text-white shadow-[0_8px_20px_rgba(17,24,39,0.14)]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {topGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`pressable inline-flex min-h-10 shrink-0 items-center rounded-full px-4 py-2 text-sm font-bold transition-[transform,background-color,color,box-shadow] duration-200 ${selectedGenre === genre ? 'bg-gray-950 text-white shadow-[0_8px_20px_rgba(17,24,39,0.14)]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 text-balance">Browse summaries</h2>
              <p className="mt-1 text-sm text-gray-500">{summaryCountLabel} ready to read</p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="pressable inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_24px_rgba(17,24,39,0.08)] transition-[transform,background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
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
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] bg-white px-6 text-center shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EBDF] text-gray-500">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-950">No summaries match those filters</p>
              <p className="mt-2 max-w-sm text-sm text-gray-500">Try a broader search, switch categories, or clear the filters to return to the full library.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="pressable mt-5 inline-flex min-h-10 items-center rounded-xl bg-gray-950 px-4 py-2 text-sm font-bold text-white transition-[transform,background-color] duration-200 hover:bg-orange-600"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SummariesPage;
