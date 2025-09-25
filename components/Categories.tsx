import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BOOKS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

// Map category strings to category IDs
const getCategoryId = (category: string): string => {
  switch (category) {
    case 'Personal Development':
      return 'personal-development';
    case 'Psychology & Happiness':
      return 'psychology';
    case 'Management & Business':
      return 'management';
    case 'Finance & Investment':
      return 'finance';
    default:
      return category.toLowerCase().replace(/\s+/g, '-');
  }
};

const categories = [
  {
    id: 'personal-development',
    title: 'Personal Development',
    color: '#FFD700', // Yellow
    path: '/categories/personal-development'
  },
  {
    id: 'psychology',
    title: 'Psychology & Happiness',
    color: '#FFB6C1', // Pink
    path: '/categories/psychology'
  },
  {
    id: 'management',
    title: 'Management & Business',
    color: '#A4B7E8', // Blue
    path: '/categories/management'
  },
  {
    id: 'finance',
    title: 'Finance & Investments',
    color: '#FFD700', // Gold
    path: '/categories/finance'
  },
  {
    id: 'art',
    title: 'Art & Creativity',
    color: '#FF69B4', // Hot Pink
    path: '/categories/art'
  },
  {
    id: 'health',
    title: 'Health & Sports',
    color: '#98FB98', // Pale Green
    path: '/categories/health'
  }
];

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('finance');
  const { getBookTitle, getBookAuthor } = useLanguage();

  // Filter books by selected category
  const filteredBooks = selectedCategory
    ? BOOKS.filter(book => getCategoryId(book.category) === selectedCategory)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">📚 Categories</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
            className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 aspect-[3/2] ${
              selectedCategory === category.id ? 'ring-4 ring-blue-500' : ''
            }`}
            style={{
              backgroundColor: category.color,
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)'
            }}
          >
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:scale-105 transition-transform duration-300">
                {category.title}
              </h3>
              <div className="w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {selectedCategory && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">
            {categories.find(cat => cat.id === selectedCategory)?.title} Books
          </h3>
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredBooks.map((book) => {
                const translatedTitle = getBookTitle(book.id);
                const translatedAuthor = getBookAuthor(book.id);
                
                return (
                  <Link
                    key={book.id}
                    to={`/summary/${book.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={book.coverImageUrl}
                          alt={`Cover of ${translatedTitle}`}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                          {translatedTitle}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-1">{translatedAuthor}</p>
                        <div className="mt-2 flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            Summary
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No books found in this category yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;