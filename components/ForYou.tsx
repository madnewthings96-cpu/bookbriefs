import React from 'react';
import { Link } from 'react-router-dom';

const books = [
  {
    id: 'four-agreements',
    title: 'The Four Agreements',
    author: 'Don Miguel Ruiz',
    coverUrl: 'https://picsum.photos/seed/fouragreements/400/600',
  },
  {
    id: 'becoming',
    title: 'Becoming',
    author: 'Michelle Obama',
    coverUrl: 'https://picsum.photos/seed/becoming/400/600',
  },
  {
    id: 'power-of-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    coverUrl: 'https://picsum.photos/seed/powerofnow/400/600',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: '/images/atomic-habits.jpg',
  },
  {
    id: 'think-like-a-monk',
    title: 'Think Like a Monk',
    author: 'Jay Shetty',
    coverUrl: 'https://picsum.photos/seed/thinkmonk/400/600',
  },
  {
    id: 'art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverUrl: 'https://picsum.photos/seed/artofwar/400/600',
  }
];

const ForYou: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold" style={{ color: 'rgb(47, 79, 79)' }}>
          📚 For You
        </h2>
        <button
          className="text-sm text-white px-4 py-2 rounded-full transition-colors duration-300"
          style={{ backgroundColor: 'rgb(47, 79, 79)' }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <p className="text-gray-600 mb-6 text-center">Popular books to get you started</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {books.map((book) => (
          <div 
            key={book.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
          >
            <img
              className="h-48 w-full object-cover"
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
            />
            <div className="p-4">
              <h3 
                className="text-lg font-bold mb-2 truncate group-hover:text-orange-500 transition-colors duration-300"
                style={{ color: 'rgb(47, 79, 79)' }}
              >
                {book.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{book.author}</p>
              <div className="flex gap-2">
                <Link
                  to={`/summary/${book.id}`}
                  className="flex-1 text-center text-white font-bold py-2 px-3 rounded-full transition-all duration-300 transform hover:scale-105 text-sm"
                  style={{ backgroundColor: 'rgb(255, 127, 80)' }}
                >
                  Read Brief
                </Link>
                <button
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
    </div>
  );
};

export default ForYou;