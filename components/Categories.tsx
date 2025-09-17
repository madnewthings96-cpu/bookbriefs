import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Book type definition
interface Book {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  description: string;
  categories: string[];
}

// Sample books data with categories
const books: Book[] = [
  {
    id: 'trading-in-the-zone',
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    coverImageUrl: '/images/trading-in-the-zone.jpeg',
    description: 'Master the market with confidence, discipline and a winning attitude.',
    categories: ['finance', 'psychology']
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImageUrl: '/images/atomic-habits.jpg',
    description: 'Tiny changes, remarkable results.',
    categories: ['personal-development', 'psychology']
  }
  // Add more books here
];

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
    id: 'fiction',
    title: 'Fiction Classics',
    color: '#DDA0DD', // Purple
    path: '/categories/fiction'
  },
  {
    id: 'biography',
    title: 'Biography & Memoir',
    color: '#DEB887', // Brown
    path: '/categories/biography'
  },
  {
    id: 'finance',
    title: 'Finance & Investments',
    color: '#FFD700', // Gold
    path: '/categories/finance'
  },
  {
    id: 'society',
    title: 'Society & Culture',
    color: '#87CEEB', // Sky Blue
    path: '/categories/society'
  },
  {
    id: 'parenting',
    title: 'Parenting & Education',
    color: '#FFA07A', // Light Salmon
    path: '/categories/parenting'
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
  },
  {
    id: 'nature',
    title: 'Nature & Science',
    color: '#87CEEB', // Sky Blue
    path: '/categories/nature'
  },
  {
    id: 'philosophy',
    title: 'Philosophy & Religion',
    color: '#98FB98', // Pale Green
    path: '/categories/philosophy'
  }
];

const Topics = [
  { id: 'public-speaking', title: 'Public Speaking', icon: '🎤' },
  { id: 'body-soul', title: 'Body & Soul', icon: '🧘‍♀️' },
  { id: 'positive-thinking', title: 'Positive Thinking', icon: '💭' },
  { id: 'career-development', title: 'Career Development', icon: '💼' },
  { id: 'writing', title: 'Writing', icon: '✍️' },
  { id: 'time-management', title: 'Time Management', icon: '⏰' },
  { id: 'creativity', title: 'Creativity', icon: '🎨' },
  { id: 'decision-making', title: 'Decision-making', icon: '🎯' },
  { id: 'relationship', title: 'Relationship & Communication', icon: '💝' },
  { id: 'money', title: 'Money & Investing', icon: '💰' },
  { id: 'self-help', title: 'Self-Help', icon: '🌟' },
  { id: 'must-read', title: 'Must-Read', icon: '📚' }
];

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter books by selected category
  const filteredBooks = selectedCategory
    ? books.filter(book => book.categories.includes(selectedCategory))
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-1 text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{book.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No books found in this category yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Topics Section */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-3">
          {Topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/topics/${topic.id}`}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              <span>{topic.icon}</span>
              <span className="text-gray-700 font-medium">{topic.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;