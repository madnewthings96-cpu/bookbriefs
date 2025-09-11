import React, { useState, useEffect } from 'react';

interface UserStats {
  readingStreak: number;
  totalBooksRead: number;
  badges: string[];
  lastReadDate: string;
  points: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: string;
}

const BADGES: Badge[] = [
  { id: 'first-read', name: 'First Steps', description: 'Read your first book brief', icon: '🌟', requirement: 1, category: 'milestone' },
  { id: 'week-warrior', name: 'Week Warrior', description: 'Read for 7 days straight', icon: '⚡', requirement: 7, category: 'streak' },
  { id: 'bookworm', name: 'Bookworm', description: 'Read 10 book briefs', icon: '🐛', requirement: 10, category: 'milestone' },
  { id: 'scholar', name: 'Scholar', description: 'Read 25 book briefs', icon: '🎓', requirement: 25, category: 'milestone' },
  { id: 'fire-reader', name: 'Fire Reader', description: 'Maintain a 30-day streak', icon: '🔥', requirement: 30, category: 'streak' },
  { id: 'century-club', name: 'Century Club', description: 'Read 100 book briefs', icon: '💯', requirement: 100, category: 'milestone' },
];

const UserEngagement: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    readingStreak: 0,
    totalBooksRead: 0,
    badges: [],
    lastReadDate: '',
    points: 0
  });

  const [showBadgePopup, setShowBadgePopup] = useState<Badge | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem('bookbriefs-user-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  const saveStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem('bookbriefs-user-stats', JSON.stringify(newStats));
  };

  const simulateReadingBook = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = userStats.readingStreak;
    
    if (userStats.lastReadDate === today) {
      return;
    } else if (userStats.lastReadDate === yesterday || userStats.readingStreak === 0) {
      newStreak = userStats.readingStreak + 1;
    } else {
      newStreak = 1;
    }

    const newStats: UserStats = {
      ...userStats,
      readingStreak: newStreak,
      totalBooksRead: userStats.totalBooksRead + 1,
      lastReadDate: today,
      points: userStats.points + 10
    };

    const newBadges = [...userStats.badges];
    BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id)) {
        let earned = false;
        if (badge.category === 'milestone' && newStats.totalBooksRead >= badge.requirement) {
          earned = true;
        } else if (badge.category === 'streak' && newStats.readingStreak >= badge.requirement) {
          earned = true;
        }
        
        if (earned) {
          newBadges.push(badge.id);
          setShowBadgePopup(badge);
          setTimeout(() => setShowBadgePopup(null), 3000);
        }
      }
    });

    newStats.badges = newBadges;
    saveStats(newStats);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-red-600';
    if (streak >= 7) return 'text-orange-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '📖';
  };

  const earnedBadges = BADGES.filter(badge => userStats.badges.includes(badge.id));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#2F4F4F' }}>
        Your Reading Journey
      </h2>
      
      {/* Reading Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md">
          <div className={`text-5xl font-bold ${getStreakColor(userStats.readingStreak)} mb-2`}>
            {userStats.readingStreak}
          </div>
          <div className="text-3xl mb-3">{getStreakEmoji(userStats.readingStreak)}</div>
          <div className="text-sm font-medium" style={{ color: '#2F4F4F' }}>Day Streak</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md">
          <div className="text-5xl font-bold mb-2" style={{ color: '#2F4F4F' }}>{userStats.totalBooksRead}</div>
          <div className="text-3xl mb-3">📚</div>
          <div className="text-sm font-medium" style={{ color: '#2F4F4F' }}>Books Read</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md">
          <div className="text-5xl font-bold text-green-600 mb-2">{userStats.points}</div>
          <div className="text-3xl mb-3">⭐</div>
          <div className="text-sm font-medium" style={{ color: '#2F4F4F' }}>Points</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-center mb-6" style={{ color: '#2F4F4F' }}>
          Achievements ({earnedBadges.length}/{BADGES.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BADGES.map(badge => {
            const isEarned = userStats.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg transition-all duration-300 shadow-sm ${
                  isEarned 
                    ? 'bg-yellow-50 border-2 shadow-md transform hover:scale-105' 
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}
                style={{ borderColor: isEarned ? '#FF7F50' : undefined }}
                title={badge.description}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className={`text-xs font-semibold ${isEarned ? '' : 'text-gray-500'}`} style={{ color: isEarned ? '#2F4F4F' : undefined }}>
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Button */}
      <div className="text-center">
        <button
          onClick={simulateReadingBook}
          className="font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-white"
          style={{ backgroundColor: '#FF7F50' }}
        >
          📖 Read a Book (Demo)
        </button>
        <p className="text-xs text-gray-500 mt-3">Click to simulate reading a book and see your progress!</p>
      </div>

      {/* Badge Popup */}
      {showBadgePopup && (
        <div className="fixed top-4 right-4 bg-white rounded-lg p-6 shadow-2xl z-50 animate-bounce" style={{ border: '4px solid #FF7F50' }}>
          <div className="text-center">
            <div className="text-5xl mb-3">{showBadgePopup.icon}</div>
            <div className="font-bold text-lg mb-1" style={{ color: '#FF7F50' }}>New Badge Earned!</div>
            <div className="text-sm font-semibold mb-1" style={{ color: '#2F4F4F' }}>{showBadgePopup.name}</div>
            <div className="text-xs text-gray-600">{showBadgePopup.description}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEngagement;
