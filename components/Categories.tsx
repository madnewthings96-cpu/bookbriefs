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

  // Get sample book images for each category
  const getCategoryBookImages = (categoryId: string) => {
    const categoryBooks = BOOKS.filter(book => getCategoryId(book.category) === categoryId);
    return categoryBooks.slice(0, 3).map(book => book.coverImageUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="relative inline-block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 relative z-10 px-6 py-3">📚 Categories</h2>
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
      
      {/* Categories Grid with Floating Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {categories.map((category) => {
          const bookImages = getCategoryBookImages(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 aspect-[3/4] transform hover:scale-105 ${
                selectedCategory === category.id ? 'ring-4 ring-orange-500 scale-105' : ''
              }`}
              style={{
                backgroundColor: category.color,
                backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
              }}
            >
              {/* Floating Book Images */}
              <div className="absolute inset-0 overflow-hidden">
                {bookImages.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Book ${index + 1}`}
                    className="absolute w-12 h-16 sm:w-14 sm:h-20 rounded shadow-xl object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                    style={{
                      top: index === 0 ? '10%' : index === 1 ? '40%' : '70%',
                      left: index === 0 ? '10%' : index === 1 ? '60%' : '30%',
                      transform: `rotate(${index === 0 ? '-12deg' : index === 1 ? '8deg' : '-5deg'})`,
                      animation: `float ${3 + index}s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`
                    }}
                  />
                ))}
              </div>

              {/* Category Title Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3">
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight group-hover:scale-105 transition-transform duration-300 drop-shadow-lg">
                  {category.title}
                </h3>
              </div>

              {/* Hover Indicator */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
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