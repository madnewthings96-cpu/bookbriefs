import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface YouMayAlsoLikeProps {
  currentBookId: string;
  currentBookCategory?: string;
  books: Book[];
  maxBooks?: number;
}

const YouMayAlsoLike: React.FC<YouMayAlsoLikeProps> = ({ 
  currentBookId, 
  currentBookCategory,
  books, 
  maxBooks = 8 
}) => {
  const { getBookTitle, getBookAuthor, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [likedBooks, setLikedBooks] = useState<Set<string>>(new Set());

  // Smart recommendations: prioritize books from the same category
  const recommendedBooks = React.useMemo(() => {
    const filteredBooks = books.filter(book => book.id !== currentBookId);
    
    if (currentBookCategory) {
      // Get books from same category first
      const sameCategory = filteredBooks.filter(book => book.category === currentBookCategory);
      const otherBooks = filteredBooks.filter(book => book.category !== currentBookCategory);
      
      // Combine: same category first, then others
      return [...sameCategory, ...otherBooks].slice(0, maxBooks);
    }
    
    return filteredBooks.slice(0, maxBooks);
  }, [books, currentBookId, currentBookCategory, maxBooks]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const toggleLike = (bookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  // Check scroll position on mount and when books change
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Check immediately
    checkScroll();

    // Check after a short delay to ensure images are loaded
    const timer = setTimeout(checkScroll, 100);

    return () => clearTimeout(timer);
  }, [recommendedBooks]);

  if (recommendedBooks.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-200 pb-4 animate-fade-in">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {t('youMayAlsoLike') || 'You May Also Like'}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 hidden sm:block"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Books Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-8 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {recommendedBooks.map((book) => {
              const isLiked = likedBooks.has(book.id);
              return (
                <Link
                  key={book.id}
                  to={`/summary/${book.id}`}
                  className="flex-shrink-0 w-[160px] sm:w-[180px] group relative snap-start"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {/* Book Cover */}
                  <div className="relative mb-3 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={book.coverImageUrl}
                      alt={`Cover of ${getBookTitle(book.id)}`}
                      className="w-full h-[240px] sm:h-[270px] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Like Button */}
                    <button
                      onClick={(e) => toggleLike(book.id, e)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label={isLiked ? 'Unlike' : 'Like'}
                    >
                      <svg
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                        fill={isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Book Info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                      {getBookTitle(book.id)}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      by {getBookAuthor(book.id)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200 hidden sm:block"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Hide scrollbar and add animations CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default YouMayAlsoLike;
