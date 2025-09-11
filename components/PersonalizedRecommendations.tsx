import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BOOKS } from '../constants';
import { Book } from '../types';

interface ReadingHistory {
  bookIds: string[];
  preferences: string[];
}

const PersonalizedRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [readingHistory, setReadingHistory] = useState<ReadingHistory>({
    bookIds: [],
    preferences: []
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('bookbriefs-reading-history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setReadingHistory(history);
      generateRecommendations(history);
    } else {
      setRecommendations(BOOKS.slice(0, 4));
    }
  }, []);

  const generateRecommendations = (history: ReadingHistory) => {
    const unreadBooks = BOOKS.filter(book => !history.bookIds.includes(book.id));
    
    if (unreadBooks.length === 0) {
      setRecommendations([]);
      return;
    }

    const shuffled = [...unreadBooks].sort(() => Math.random() - 0.5);
    setRecommendations(shuffled.slice(0, 4));
  };

  const simulateReadBook = (bookId: string) => {
    if (!readingHistory.bookIds.includes(bookId)) {
      const newHistory = {
        ...readingHistory,
        bookIds: [...readingHistory.bookIds, bookId]
      };
      setReadingHistory(newHistory);
      localStorage.setItem('bookbriefs-reading-history', JSON.stringify(newHistory));
      generateRecommendations(newHistory);
    }
  };

  const refreshRecommendations = () => {
    generateRecommendations(readingHistory);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold" style={{ color: '#2F4F4F' }}>
          📚 For You
        </h2>
        <button
          onClick={refreshRecommendations}
          className="text-sm text-white px-4 py-2 rounded-full transition-colors duration-300"
          style={{ backgroundColor: '#2F4F4F' }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <p className="text-gray-600 mb-6 text-center">
        {readingHistory.bookIds.length > 0 
          ? `Based on your reading history (${readingHistory.bookIds.length} books read)`
          : 'Popular books to get you started'
        }
      </p>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <img
                className="h-48 w-full object-cover"
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 truncate group-hover:text-orange-500 transition-colors duration-300" style={{ color: '#2F4F4F' }}>
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{book.author}</p>
                <div className="flex gap-2">
                  <Link
                    to={`/summary/${book.id}`}
                    className="flex-1 text-center text-white font-bold py-2 px-3 rounded-full transition-all duration-300 transform hover:scale-105 text-sm"
                    style={{ backgroundColor: '#FF7F50' }}
                  >
                    Read Brief
                  </Link>
                  <button
                    onClick={() => simulateReadBook(book.id)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-full hover:bg-gray-300 transition-colors duration-300 text-sm"
                    title="Mark as read (demo)"
                  >
                    ✓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl font-semibold mb-2" style={{ color: '#2F4F4F' }}>Amazing Progress!</p>
          <p className="text-gray-600">You've read all our current books. More coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
