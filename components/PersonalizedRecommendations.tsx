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
        <div className="relative inline-block">
          <h2 className="text-3xl font-bold relative z-10 px-6 py-3" style={{ color: '#2F4F4F' }}>
            📚 For You
          </h2>
          {/* Neon Green Border Animation */}
          <div className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
              backgroundSize: '200% 100%',
              padding: '2px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              animation: 'neon-border-flow 3s linear infinite',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.5), inset 0 0 15px rgba(16, 185, 129, 0.3)'
            }}
          />
        </div>
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
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                
                {/* Rating */}
                {book.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(book.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{book.rating.toFixed(1)}</span>
                    {book.ratingsCount && (
                      <span className="text-xs text-gray-500">({book.ratingsCount})</span>
                    )}
                  </div>
                )}
                
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
