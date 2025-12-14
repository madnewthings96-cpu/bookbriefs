
import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { useBooks } from '../contexts/BooksContext';
import Spinner from '../components/Spinner';

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { books, loading } = useBooks();

  useSEO({
    title: 'Book Summaries - Discover Insights from Top Business & Self-Help Books | BookBriefs',
    description: 'Browse our collection of expertly curated book summaries. Get key insights from bestselling business, self-help, and productivity books in minutes.',
    keywords: 'book summaries, business book summaries, self-help books, productivity books, book reviews, key takeaways, quick reads',
    type: 'website',
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Show all books from Firestore - trust the database as the source of truth
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-4 pb-8 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
            Book Summaries
          </h1>
          <p className="text-gray-600 text-base md:text-lg">Discover wisdom from {filteredBooks.length} carefully curated books</p>
        </div>
        
        <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
          <div className="relative group">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search Input with Neon Glow Effect */}
            <input
              type="search"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search for a book summary"
              className="w-full pl-12 pr-4 py-4 
                bg-white/90 backdrop-blur-sm
                border-2 border-gray-200 
                rounded-2xl 
                text-gray-800 placeholder-gray-400
                transition-all duration-300 ease-in-out
                shadow-lg
                focus:outline-none 
                focus:border-transparent
                focus:bg-white
                focus:shadow-[0_0_25px_rgba(99,102,241,0.3),0_0_50px_rgba(99,102,241,0.15),0_0_75px_rgba(99,102,241,0.1)]
                focus:ring-4 focus:ring-indigo-400/30
                hover:border-indigo-200
                hover:shadow-xl"
            />
            
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity duration-500"></div>
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 
                  text-gray-400 hover:text-gray-600 
                  transition-colors duration-200
                  p-1 rounded-full hover:bg-gray-100"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 mb-2">No books found</p>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummariesPage;
