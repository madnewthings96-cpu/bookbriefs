
import React, { useState } from 'react';
import { BOOKS, BOOK_SUMMARIES } from '../constants';
import BookCard from '../components/BookCard';

const SummariesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
            Book Summaries
          </h1>
          <p className="text-gray-600 text-lg">Discover wisdom from {filteredBooks.length} carefully curated books</p>
        </div>
        
        <div className="mb-8 max-w-md mx-auto">
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
