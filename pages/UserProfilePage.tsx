import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { BOOKS } from '../constants';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBookTitle } = useLanguage();
  const { user } = useAuth();
  const { userStats, bookProgress, updateBookProgress, getBookProgress } = useUserProgress();

  // User data with Firebase user info
  const userName = user?.email?.split('@')[0] || "Reader";
  
  // State for start reading books
  const [startReadingBooks, setStartReadingBooks] = useState<any[]>([]);
  
  // All available books for start reading
  const allStartReadingBooks = BOOKS.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverImageUrl,
    progressColor: ['bg-teal-600', 'bg-purple-600', 'bg-blue-600', 'bg-orange-600', 'bg-pink-600', 'bg-indigo-600'][Math.floor(Math.random() * 6)]
  }));
  
  // Function to shuffle and get 6 random books
  const getRandomBooks = () => {
    const shuffled = [...allStartReadingBooks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6).map(book => {
      const progress = getBookProgress(book.id);
      return {
        ...book,
        progress: progress?.progress || 0
      };
    });
  };
  
  // Initialize with random books
  useEffect(() => {
    setStartReadingBooks(getRandomBooks());
  }, []);
  
  // Refresh books function
  const handleRefreshBooks = () => {
    setStartReadingBooks(getRandomBooks());
  };

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
    // Update progress when user clicks on a book
    const currentProgress = getBookProgress(bookId);
    if (!currentProgress || currentProgress.progress < 100) {
      // If book hasn't been started or isn't completed, add some progress
      const newProgress = currentProgress ? Math.min(currentProgress.progress + 25, 100) : 25;
      updateBookProgress(bookId, newProgress);
    }
    navigate(`/summary/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {userStats.booksRead > 0 ? `Welcome back, ${userName}!` : `Welcome, ${userName}!`}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {userStats.booksRead > 0 
                      ? 'Continue your learning journey with personalized book summaries.' 
                      : 'Start your learning journey with personalized book summaries.'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 rounded-xl shadow-lg text-white text-center min-w-[120px] hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="text-3xl font-bold mb-1">{userStats.booksRead}</div>
                <div className="text-sm font-medium opacity-90">Books Read</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-xl shadow-lg text-white text-center min-w-[120px] hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="text-3xl font-bold mb-1">{userStats.dayStreak}</div>
                <div className="text-sm font-medium opacity-90">Day Streak</div>
              </div>
            </div>
            {userStats.booksRead === 0 && (
              <div className="mt-6 text-center lg:text-right">
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="mr-2">📚</span>
                  <span className="text-sm font-medium">Start reading your first book summary to build your streak!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Reading Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {userStats.booksRead > 0 ? 'Continue Reading' : 'Start Reading'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="mr-2">💡</span>
                Click on any book to make progress!
              </div>
              <button
                onClick={handleRefreshBooks}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                title="Refresh books"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {startReadingBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 group"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFYxMDBINjBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01MCAxMTBIMTEwVjEyMEg1MFYxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCAxMzBIMTAwVjE0MEg2MFYxMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 text-white p-3">
                    <h3 className="font-bold text-sm mb-0.5 truncate">{book.title}</h3>
                    <p className="text-xs text-gray-200 truncate">{book.author}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      {book.progress === 0 ? 'Ready to start' : 
                       book.progress === 100 ? 'Completed!' : 
                       `${book.progress}%`}
                    </span>
                    <button 
                      className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-200 ${
                        book.progress === 100 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookClick(book.id);
                      }}
                    >
                      {book.progress === 0 ? 'Start' : 
                       book.progress === 100 ? '✓' : 
                       'Continue'}
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`${book.progressColor} h-1.5 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.max(book.progress, 2)}%` }}
                    ></div>
                  </div>
                  {book.progress > 0 && book.progress < 100 && (
                    <div className="mt-1.5 text-xs text-gray-500">
                      🔥 Keep going!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended for You Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
            <div className="hidden sm:flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="mr-2">✨</span>
              Curated just for you
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recommendedBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100 group"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFYxMDBINjBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01MCAxMTBIMTEwVjEyMEg1MFYxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCAxMzBIMTAwVjE0MEg2MFYxMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-95 group-hover:scale-100">
                      <button className="bg-white text-teal-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-teal-50 border-2 border-teal-600 shadow-lg">
                        Read Summary
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-900 truncate mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">{book.author}</p>
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
