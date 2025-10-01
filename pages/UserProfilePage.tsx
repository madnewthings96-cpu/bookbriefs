import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBookTitle } = useLanguage();
  const { user } = useAuth();

  // User data with Firebase user info
  const userName = user?.email?.split('@')[0] || "Reader";
  
  // User statistics (defaulting to 0 for new users)
  const userStats = {
    booksRead: 0,
    dayStreak: 0,
    inProgress: 0
  };
  
  // Continue Reading books with progress - using actual book IDs (starting at 0% for new users)
  const continueReadingBooks = [
    {
      id: "atomic-habits",
      title: "Atomic Habits",
      author: "James Clear",
      coverUrl: "/images/atomic-habits.jpg",
      progress: 0,
      progressColor: "bg-teal-600"
    },
    {
      id: "sapiens",
      title: "Sapiens",
      author: "Yuval Noah Harari", 
      coverUrl: "/images/sapiens.jpg",
      progress: 0,
      progressColor: "bg-purple-600"
    }
  ];

  // Recommended books - using actual book IDs
  const recommendedBooks = [
    {
      id: "thinkandgrowrich",
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      coverUrl: "/images/think and grow rich.jpg"
    },
    {
      id: "the-alchemist",
      title: "The Alchemist",
      author: "Paulo Coelho",
      coverUrl: "/images/the alchemist.jpg"
    },
    {
      id: "rich-dad-poor-dad",
      title: "Rich Dad Poor Dad",
      author: "Robert T. Kiyosaki",
      coverUrl: "/images/rich dad poor dad.jpg"
    },
    {
      id: "the-four-agreements",
      title: "The Four Agreements",
      author: "Don Miguel Ruiz",
      coverUrl: "/images/the four agreements.jpg"
    },
    {
      id: "educated",
      title: "Educated",
      author: "Tara Westover",
      coverUrl: "/images/educated.jpg"
    },
    {
      id: "dune",
      title: "Dune",
      author: "Frank Herbert",
      coverUrl: "/images/dune.jpg"
    }
  ];

  const handleBookClick = (bookId: string) => {
    navigate(`/summary/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#2F4F4F' }}>
                {userStats.booksRead > 0 ? `Welcome back, ${userName}!` : `Welcome, ${userName}!`}
              </h1>
              <p className="text-gray-600">
                {userStats.booksRead > 0 
                  ? 'Continue your learning journey with personalized book summaries.' 
                  : 'Start your learning journey with personalized book summaries.'
                }
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-4 text-center">
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border-l-4 border-teal-500">
                  <div className="text-2xl font-bold text-teal-600">{userStats.booksRead}</div>
                  <div className="text-xs text-gray-500">Books Read</div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <div className="text-2xl font-bold text-blue-600">{userStats.dayStreak}</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border-l-4 border-purple-500">
                  <div className="text-2xl font-bold text-purple-600">{userStats.inProgress}</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
              </div>
              {userStats.booksRead === 0 && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500 italic">
                    📚 Start reading your first book summary to build your streak!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continue Reading Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" style={{ color: '#2F4F4F' }}>
            {userStats.booksRead > 0 ? 'Continue Reading' : 'Start Reading'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReadingBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
                onClick={() => handleBookClick(book.id)}
              >
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
                    <span className="text-sm text-gray-600">
                      {book.progress === 0 ? 'Ready to start' : `${book.progress}% complete`}
                    </span>
                    <button className="text-xs bg-teal-600 text-white px-3 py-1 rounded-full hover:bg-teal-700 transition-colors">
                      {book.progress === 0 ? 'Start Reading' : 'Continue'}
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${book.progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${book.progress === 0 ? '2' : book.progress}%` }}
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
              <div 
                key={book.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="aspect-[3/4] relative">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFYxMDBINjBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01MCAxMTBIMTEwVjEyMEg1MFYxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCAxMzBIMTAwVjE0MEg2MFYxMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity">
                      <button className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-700">
                        Read Summary
                      </button>
                    </div>
                  </div>
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
