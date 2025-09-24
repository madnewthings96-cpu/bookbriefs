
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
    <div>
      <h1 className="text-4xl font-bold text-center mb-6" style={{ color: '#2F4F4F' }}>
        All Book Summaries
      </h1>
      <div className="mb-8 max-w-lg mx-auto">
        <input
          type="search"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search for a book summary"
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow shadow-sm"
          style={{borderColor: '#2F4F4F'}}
        />
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">No books found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default SummariesPage;
