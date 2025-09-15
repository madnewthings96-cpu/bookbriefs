import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const UserProfilePage: React.FC = () => {
  const { getBookTitle } = useLanguage();

  // Mock user data
  const userName = "Sarah";
  
  // Continue Reading books with progress
  const continueReadingBooks = [
    {
      id: 1,
      title: "The Power of Habit",
      author: "Charles Duhigg",
      coverUrl: "/images/atomic-habits.jpg",
      progress: 75,
      progressColor: "bg-teal-500"
    },
    {
      id: 2,
      title: "Atomic Habits", 
      author: "James Clear",
      coverUrl: "/images/atomic-habits.jpg",
      progress: 45,
      progressColor: "bg-cyan-500"
    },
    {
      id: 3,
      title: "The 7 Habits",
      author: "Stephen Covey", 
      coverUrl: "/images/atomic-habits.jpg",
      progress: 15,
      progressColor: "bg-blue-400"
    }
  ];

  // Recommended books
  const recommendedBooks = [
    {
      id: 4,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      coverUrl: "/images/atomic-habits.jpg"
    },
    {
      id: 5,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      coverUrl: "/images/atomic-habits.jpg"
    },
    {
      id: 6,
      title: "The Lean Startup",
      author: "Eric Ries",
      coverUrl: "/images/atomic-habits.jpg"
    },
    {
      id: 7,
      title: "The Innovator's Dilemma",
      author: "Clayton Christensen",
      coverUrl: "/images/atomic-habits.jpg"
    },
    {
      id: 8,
      title: "Zero to One",
      author: "Peter Thiel",
      coverUrl: "/images/atomic-habits.jpg"
    },
    {
      id: 9,
      title: "Dune",
      author: "Frank Herbert",
      coverUrl: "/images/atomic-habits.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">
            Let's dive into some knowledge.
          </p>
        </div>

        {/* Continue Reading Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2F4F4F' }}>
            Continue Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReadingBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA5MEgxMTVWMTIwSDg1VjkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNzUgMTMwSDE0NVYxNDBINzVWMTMwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODUgMTUwSDEyNVYxNjBIODVWMTUwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                    <h3 className="font-semibold text-sm truncate">{book.title}</h3>
                    <p className="text-xs text-gray-200 truncate">{book.author}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{book.progress}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${book.progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${book.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended for You Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2F4F4F' }}>
            Recommended for You
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendedBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFYxMDBINjBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01MCAxMTBIMTEwVjEyMEg1MFYxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCAxMzBIMTAwVjE0MEg2MFYxMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate mb-1" style={{ color: '#2F4F4F' }}>
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
