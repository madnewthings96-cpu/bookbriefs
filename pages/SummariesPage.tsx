
import React, { useState } from 'react';
import { BOOKS, BOOK_SUMMARIES } from '../constants';
import BookCard from '../components/BookCard';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useSEO({
    title: 'Book Summaries - Discover Insights from Top Business & Self-Help Books | BookBriefs',
    description: 'Browse our collection of expertly curated book summaries. Get key insights from bestselling business, self-help, and productivity books in minutes.',
    keywords: 'book summaries, business book summaries, self-help books, productivity books, book reviews, key takeaways, quick reads',
    type: 'website',
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Only show books that have summaries available
  const booksWithSummaries = BOOKS.filter(book =>
    BOOK_SUMMARIES.some(summary => summary.id === book.id)
  );

  const filteredBooks = booksWithSummaries.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-4 pb-8 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
            Book Summaries
          </h1>
          <p className="text-gray-600 text-base md:text-lg">Discover wisdom from {filteredBooks.length} carefully curated books</p>
        </div>
        
        <div className="mb-6 md:mb-8 max-w-md mx-auto">
          <input
            type="search"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search for a book summary"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm"
          />
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
