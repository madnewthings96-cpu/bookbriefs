
import React, { Suspense, lazy, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../constants';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { RainbowButton } from '../components/RainbowButton';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';

// Lazy load heavy components
const Testimonials = lazy(() => import('../components/Testimonials'));
const MostReadBooks = lazy(() => import('../components/MostReadBooks'));

// Flashcard data
const flashcards = [
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    book: "Atomic Habits",
    backText: "Build small habits that compound over time. Focus on 1% improvements daily."
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    book: "The Psychology of Money",
    backText: "Action beats planning. Start before you're ready and learn as you go."
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    book: "Think and Grow Rich",
    backText: "Follow your own path. Don't let others' opinions drown out your inner voice."
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    book: "So Good They Can't Ignore You",
    backText: "Passion follows mastery. Get really good at something valuable first."
  },
  {
    quote: "It is not the strongest that survive, but those most responsive to change.",
    author: "Charles Darwin",
    book: "Antifragile",
    backText: "Embrace uncertainty. Build systems that get stronger from stress and volatility."
  }
];

const HomePage: React.FC = () => {
  const { books } = useBooks();
  const { getBookTitle } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [booksPerMonth, setBooksPerMonth] = useState(5);

  // Time calculations (average book = 4 hours, summary = 12 minutes)
  const fullBookTime = booksPerMonth * 4;
  const summaryTime = (booksPerMonth * 12) / 60; // Convert to hours

  // Get a diverse selection of books for the showcase
  const showcaseBooks = books.slice(0, 12);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useSEO({
    title: 'BookBriefs - Transform Your Learning with Powerful Book Summaries',
    description: 'Discover key insights from the world\'s greatest business and self-help books. Get comprehensive book summaries in minutes, not hours. Join thousands of learners today.',
    keywords: 'book summaries, business books, self-help books, book insights, learning, personal development, productivity, leadership books',
    type: 'website',
  });

  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <div>
        {/* Hero Section */}
        <section className="relative isolate pt-2 pb-8 md:pt-4 md:pb-12 overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)]">
          {/* Content */}
          <div className="container mx-auto text-center relative z-10 max-w-6xl">{/* removed px-4 */}
            {/* Logo and Rating */}
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 logo-container" aria-label="BookBriefs">
                <img
                  src="/favicon/logo-white.png"
                  alt="BookBriefs Logo"
                  className="h-24 md:h-28 w-auto logo-image"
                  loading="eager"
                />
              </div>
              <div className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/85 px-4 py-2 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_12px_30px_rgba(17,24,39,0.08)]">
                <div className="flex" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold tabular-nums">5,000+ readers</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900 text-balance">
              Read any{' '}
              <span className="font-canicule inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                book
              </span>
              {' '}in{' '}
              <span className="relative inline-block">
                <span className="relative z-10">10 minutes</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-yellow-300 -skew-y-1"></span>
              </span>
            </h1>

            {/* Subheading */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10 text-gray-600 text-base md:text-lg text-pretty">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium">New Books Weekly</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mb-12 flex justify-center">
              <Link
                to="/summaries"
                className="pressable inline-flex min-h-12 items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3 text-base font-bold text-white shadow-[0_1px_2px_rgba(127,29,29,0.12),0_18px_38px_rgba(249,115,22,0.28)] hover:shadow-[0_1px_2px_rgba(127,29,29,0.12),0_22px_48px_rgba(249,115,22,0.34)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/40 transition-[transform,box-shadow,background-color] duration-300"
                style={{ textDecoration: 'none' }}
              >
                <span className="arabic-btn text-white">إقرأ الآن</span>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Book Carousel */}
            <div className="relative">
              <div className="flex justify-center items-end gap-3 md:gap-4 overflow-hidden">
                {/* Row 1 - Top */}
                <div className="hero-cover-strip flex gap-3 md:gap-4 animate-scroll-slow">
                  <img src="/images/the alchemist.jpg" alt="The Alchemist" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/atomic-habits.jpg" alt="Atomic Habits" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/becoming.jpg" alt="Becoming" loading="lazy" decoding="async" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/rich dad poor dad.jpg" alt="Rich Dad Poor Dad" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/one good trade.jpg" alt="One Good Trade" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/sapiens.jpg" alt="Sapiens" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/educated.jpg" alt="Educated" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the subtle art.jpg" alt="The Subtle Art" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/fast and slow.jpg" alt="Thinking Fast and Slow" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the four agreements.jpg" alt="The Four Agreements" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/hail mary.jpg" alt="Project Hail Mary" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/dune.jpg" alt="Dune" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the alchemist.jpg" alt="The Alchemist" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                </div>
              </div>

              {/* Second Row */}
              <div className="flex justify-center items-end gap-3 md:gap-4 mt-3 md:mt-4 overflow-hidden">
                <div className="hero-cover-strip flex gap-3 md:gap-4 animate-scroll-reverse">
                  <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the psychology of money.jpg" alt="The Psychology of Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/trading-in-the-zone.jpg" alt="Trading in the Zone" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/best loser wins.jpg" alt="Best Loser Wins" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/can't hurt me.jpg" alt="Can't Hurt Me" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the alchemy of finance.jpg" alt="The Alchemy of Finance" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/competition demystified.jpg" alt="Competition Demystified" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/law of human nature.jpg" alt="The Laws of Human Nature" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/broken money.jpg" alt="Broken Money" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/the intelligent investor.jpg" alt="The Intelligent Investor" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/one up on wall street.jpg" alt="One Up on Wall Street" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/relentless.jpg" alt="Relentless" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/americas bank.jpg" alt="America's Bank" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                  <img src="/images/think and grow rich.jpg" alt="Think and Grow Rich" loading="lazy" className="w-16 h-24 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-xl object-cover hover:scale-105 transition-transform duration-300 ease-out" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Most Read Books Section */}
        <section className="py-8 bg-gray-50">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <MostReadBooks />
          </Suspense>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Top Row - Library Showcase Card */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Card - Library Showcase */}
              <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-[28px] p-6 md:p-8 overflow-hidden polished-surface">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-orange-100/0 group-hover:from-orange-50/30 group-hover:via-orange-50/20 group-hover:to-orange-100/30 transition-colors duration-700 pointer-events-none"></div>

                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/0 via-orange-500/0 to-orange-400/0 group-hover:from-orange-400/20 group-hover:via-orange-500/20 group-hover:to-orange-400/20 rounded-[32px] blur-xl transition-[opacity,background-color] duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>

                <div className="relative z-10">
                  {/* Header with title and CTA */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-[transform,box-shadow] duration-500 group-hover:scale-105">
                        <img src="/icons/book.png" alt="Books" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-500 text-balance">
                          Explore 100+ Best-Sellers in Minutes
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base mt-1 text-pretty">
                          From Business to Psychology, access the world's best ideas instantly.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/summaries"
                      className="pressable inline-flex min-h-10 items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 transition-[transform,box-shadow,background-position] duration-300 text-sm whitespace-nowrap"
                    >
                      Browse Library
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>

                  {/* Book Carousel */}
                  <div className="relative">
                    {/* Left scroll button */}
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="pressable absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-[transform,background-color,box-shadow] duration-300"
                      aria-label="Scroll books left"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Carousel container */}
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12 py-4"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {showcaseBooks.length > 0 ? (
                        showcaseBooks.map((book) => (
                          <Link
                            key={book.id}
                            to={book.arabicSlug ? `/summary/${book.arabicSlug}` : `/summary/${book.id}`}
                            className="flex-shrink-0 group/book"
                          >
                            <div className="w-28 md:w-32 transform hover:scale-105 hover:-translate-y-2 transition-transform duration-300 ease-out">
                              <div className="library-cover aspect-[2/3] rounded-xl overflow-hidden bg-gray-100">
                                <img
                                  src={book.coverImageUrl}
                                  alt={getBookTitle(book.id)}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <p className="mt-2 text-xs text-gray-600 line-clamp-1 text-center font-medium group-hover/book:text-orange-600 transition-colors duration-200">
                                {getBookTitle(book.id)}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        // Placeholder book covers when no books loaded
                        [...Array(8)].map((_, i) => (
                          <div key={i} className="flex-shrink-0 w-28 md:w-32">
                            <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-md"></div>
                            <div className="mt-2 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Right scroll button */}
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="pressable absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-[transform,background-color,box-shadow] duration-300"
                      aria-label="Scroll books right"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Fade edges */}
                    <div className="absolute left-10 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
                    <div className="absolute right-10 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
                  </div>

                  {/* Category badges */}
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {['Business', 'Psychology', 'Self-Help', 'Finance', 'Leadership', 'Productivity'].map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors duration-300 cursor-pointer"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - 2 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card - Time-Saver Calculator */}
              <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-[28px] p-6 md:p-8 overflow-hidden polished-surface">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/0 group-hover:from-blue-50/30 group-hover:via-blue-50/20 group-hover:to-blue-100/30 transition-colors duration-700 pointer-events-none"></div>

                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/0 via-blue-500/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-blue-500/20 group-hover:to-blue-400/20 rounded-[32px] blur-xl transition-[opacity,background-color] duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/50 transition-[transform,box-shadow] duration-500 group-hover:scale-105">
                        <img src="/icons/time.png" alt="Time" className="w-8 h-8 object-contain" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-500 text-balance">
                        How many books do you want to read?
                      </h3>
                      <p className="text-gray-500 text-sm">See your time savings in real-time</p>
                    </div>
                  </div>

                  {/* Slider Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl md:text-4xl font-bold text-blue-600 tabular-nums">{booksPerMonth}</span>
                      <span className="text-gray-500 text-sm">books / month</span>
                    </div>

                    {/* Custom Slider */}
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={booksPerMonth}
                        onChange={(e) => setBooksPerMonth(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((booksPerMonth - 1) / 14) * 100}%, #e5e7eb ${((booksPerMonth - 1) / 14) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1</span>
                        <span>15</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Full Books Time */}
                    <div className="bg-red-50 rounded-2xl p-4 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12)]">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-xs text-red-600 font-medium">Full Books</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-red-600 tabular-nums">
                        {fullBookTime} <span className="text-base font-normal">hrs</span>
                      </div>
                      <p className="text-xs text-red-500 mt-1">Traditional reading</p>
                    </div>

                    {/* Ta7leel Time */}
                    <div className="bg-green-50 rounded-2xl p-4 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.12)]">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs text-green-600 font-medium">With Ta7leel</span>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-green-600 tabular-nums">
                        {summaryTime.toFixed(1)} <span className="text-base font-normal">hrs</span>
                      </div>
                      <p className="text-xs text-green-500 mt-1">Smart summaries</p>
                    </div>
                  </div>

                  {/* Savings Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-3 px-4 shadow-[0_12px_28px_rgba(37,99,235,0.22)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold tabular-nums">You save {(fullBookTime - summaryTime).toFixed(1)} hours!</span>
                    <span className="text-blue-200 text-sm tabular-nums">({Math.round(((fullBookTime - summaryTime) / fullBookTime) * 100)}% faster)</span>
                  </div>
                </div>
              </div>

              {/* Card - Smart Flashcards / Retain What You Read */}
              <div className="group relative bg-gradient-to-br from-white via-white to-gray-50 rounded-[28px] p-6 md:p-8 overflow-hidden polished-surface">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-100/0 group-hover:from-purple-50/30 group-hover:via-purple-50/20 group-hover:to-purple-100/30 transition-colors duration-700 pointer-events-none"></div>

                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/0 via-purple-500/0 to-purple-400/0 group-hover:from-purple-400/20 group-hover:via-purple-500/20 group-hover:to-purple-400/20 rounded-[32px] blur-xl transition-[opacity,background-color] duration-700 opacity-0 group-hover:opacity-100 -z-10"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-[transform,box-shadow] duration-500 group-hover:scale-105 group-hover:rotate-3">
                        <img src="/icons/idea.png" alt="Idea" className="w-9 h-9 object-contain transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-500 text-balance">
                        Retain What You Read
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm text-pretty">
                        Smart flashcards and quote highlights help you remember key insights forever.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Flashcard Stack UI */}
                  <div className="relative h-52 mb-4">
                    {/* Background cards (stack effect) */}
                    <div className="absolute inset-x-4 top-4 h-40 bg-purple-100/50 rounded-xl transform rotate-2 transition-transform duration-500"></div>
                    <div className="absolute inset-x-2 top-2 h-40 bg-purple-200/50 rounded-xl transform -rotate-1 transition-transform duration-500"></div>

                    {/* Main Flashcard - Flippable */}
                    <div
                      className="absolute inset-0 cursor-pointer"
                      style={{ perspective: '1000px' }}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-500"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                      >
                        {/* Front of card */}
                        <div
                          className="absolute inset-0 bg-white rounded-2xl p-5 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.16),0_16px_34px_rgba(88,28,135,0.12)] hover:shadow-[inset_0_0_0_1px_rgba(168,85,247,0.28),0_22px_44px_rgba(88,28,135,0.16)] transition-shadow duration-300"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {/* Quote mark */}
                          <svg className="w-6 h-6 text-purple-200 mb-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>

                          {/* Quote text */}
                          <p className="text-gray-800 font-medium text-sm leading-relaxed mb-2 line-clamp-3">
                            <span className="relative inline">
                              <span className="relative z-10">{flashcards[currentFlashcard].quote}</span>
                              <span className="absolute bottom-0 left-0 w-full h-1.5 bg-yellow-300/60 -z-0"></span>
                            </span>
                          </p>

                          {/* Source */}
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-purple-600 font-semibold">— {flashcards[currentFlashcard].author}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{flashcards[currentFlashcard].book}</span>
                          </div>

                          {/* Flip indicator */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-purple-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Tap to flip</span>
                          </div>
                        </div>

                        {/* Back of card */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 flex flex-col justify-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <p className="text-white font-medium text-sm leading-relaxed mb-2">Key Insight</p>
                            <p className="text-white/90 text-xs leading-relaxed">{flashcards[currentFlashcard].backText}</p>
                          </div>

                          {/* Flip back indicator */}
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white/70">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Tap to flip</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card navigation dots & arrows */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setCurrentFlashcard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
                      }}
                      className="pressable w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-[transform,background-color] duration-200"
                      aria-label="Previous flashcard"
                    >
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex gap-0.5">
                      {flashcards.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFlipped(false);
                            setCurrentFlashcard(index);
                          }}
                          className="pressable flex h-10 w-10 items-center justify-center rounded-full"
                          aria-label={`Show flashcard ${index + 1}`}
                        >
                          <span
                            className={`h-2 rounded-full transition-[width,background-color] duration-300 ${index === currentFlashcard
                              ? 'w-4 bg-purple-600'
                              : 'w-2 bg-purple-200 hover:bg-purple-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setCurrentFlashcard((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
                      }}
                      className="pressable w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-[transform,background-color] duration-200"
                      aria-label="Next flashcard"
                    >
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Spaced Repetition
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Smart Highlights
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full group-hover:bg-purple-100 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      تحليل (Analysis)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <Testimonials testimonials={TESTIMONIALS} />
          </Suspense>
        </section>

      </div>
    </>
  );
};

export default HomePage;
