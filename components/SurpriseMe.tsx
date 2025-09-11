import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BOOKS } from '../constants';
import { Book } from '../types';

const SurpriseMe: React.FC = () => {
  const [surpriseBook, setSurpriseBook] = useState<Book | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const getRandomBook = () => {
    setIsSpinning(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * BOOKS.length);
      setSurpriseBook(BOOKS[randomIndex]);
      setIsSpinning(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          🎲 Surprise Me!
        </h2>
        <p className="text-gray-600 mb-8">
          Can't decide what to read? Let us pick a random book brief for you!
        </p>
        
        <button
          onClick={getRandomBook}
          disabled={isSpinning}
          className={`font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-white ${
            isSpinning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: '#2F4F4F' }}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Finding your book...
            </span>
          ) : (
            '🎯 Surprise Me!'
          )}
        </button>

        {surpriseBook && !isSpinning && (
          <div className="mt-8 max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
              <img
                className="h-64 w-full object-cover"
                src={surpriseBook.coverImageUrl}
                alt={`Cover of ${surpriseBook.title}`}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors duration-300" style={{ color: '#2F4F4F' }}>
                  {surpriseBook.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{surpriseBook.author}</p>
                <Link
                  to={`/summary/${surpriseBook.id}`}
                  className="inline-block text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF7F50' }}
                >
                  Read This Brief
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurpriseMe;
