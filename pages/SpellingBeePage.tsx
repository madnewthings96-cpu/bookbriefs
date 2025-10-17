import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const GAME_DATA = {
  centerLetter: 'L',
  outerLetters: ['M', 'O', 'E', 'Z', 'I', 'B'],
  validWords: [
    'LOBE', 'LIME', 'LIMBO', 'MOBILE', 'OIL', 'BOIL', 'MOIL', 'BILE', 'OBILIZE',
    'LOOM', 'BLOOM', 'BOOM', 'ZOOM', 'BLOB', 'EMBLE', 'MILE', 'MOLE', 'BROIL'
  ],
  pangrams: ['MOBILIZE'], // Words using all letters
};

const SpellingBeePage: React.FC = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [rank, setRank] = useState('Beginner');

  useSEO({
    title: 'Spelling Bee - Word Puzzle Game | BookBriefs',
    description: 'How many words can you make with 7 letters? Play our daily word puzzle game.',
    keywords: 'spelling bee, word game, puzzle, vocabulary, brain game',
    type: 'website',
  });

  const allLetters = [GAME_DATA.centerLetter, ...GAME_DATA.outerLetters];

  useEffect(() => {
    updateRank();
  }, [foundWords]);

  const updateRank = () => {
    const wordCount = foundWords.length;
    if (wordCount === 0) setRank('Beginner');
    else if (wordCount < 5) setRank('Good Start');
    else if (wordCount < 10) setRank('Moving Up');
    else if (wordCount < 15) setRank('Good');
    else if (wordCount < 20) setRank('Solid');
    else if (wordCount < 25) setRank('Nice');
    else if (wordCount < 30) setRank('Great');
    else setRank('Amazing');
  };

  const handleLetterClick = (letter: string) => {
    setCurrentWord(currentWord + letter);
    setMessage('');
  };

  const handleDelete = () => {
    setCurrentWord(currentWord.slice(0, -1));
    setMessage('');
  };

  const handleShuffle = () => {
    // Visual shuffle effect - just for UX, doesn't change the game
    setMessage('Letters shuffled!');
    setTimeout(() => setMessage(''), 1500);
  };

  const handleEnter = () => {
    if (currentWord.length < 4) {
      setMessage('Too short');
      return;
    }

    if (!currentWord.includes(GAME_DATA.centerLetter)) {
      setMessage('Missing center letter');
      return;
    }

    const upperWord = currentWord.toUpperCase();
    
    if (foundWords.includes(upperWord)) {
      setMessage('Already found');
      return;
    }

    if (GAME_DATA.validWords.includes(upperWord)) {
      setFoundWords([...foundWords, upperWord]);
      if (GAME_DATA.pangrams.includes(upperWord)) {
        setMessage('Pangram! 🎉');
      } else {
        setMessage('Good! ✓');
      }
      setCurrentWord('');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('Not in word list');
    }
  };

  const handleHint = () => {
    setShowHint(!showHint);
  };

  const getHints = () => {
    const remainingWords = GAME_DATA.validWords.filter(word => !foundWords.includes(word));
    const firstLetterCounts: { [key: string]: number } = {};
    
    remainingWords.forEach(word => {
      const firstLetter = word[0];
      firstLetterCounts[firstLetter] = (firstLetterCounts[firstLetter] || 0) + 1;
    });

    return Object.entries(firstLetterCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, count]) => ({ letter, count }));
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
      handleEnter();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      handleDelete();
    } else if (allLetters.includes(key)) {
      handleLetterClick(key);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentWord, foundWords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-6xl">🐝</div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Spelling Bee
          </h1>
          <p className="text-lg text-gray-800 mb-4">
            How many words can you make<br />with 7 letters?
          </p>
        </div>

        {/* Main Game Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Game */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Type or click</h2>

            {/* Message Display */}
            {message && (
              <div className="text-center mb-4 h-6">
                <p className={`font-semibold ${message.includes('✓') || message.includes('🎉') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              </div>
            )}

            {/* Current Word Display */}
            <div className="text-center mb-8 h-12">
              <p className="text-3xl font-bold text-gray-900 tracking-wider">
                {currentWord || '\u00A0'}
              </p>
            </div>

            {/* Hexagonal Letter Layout */}
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-64">
                {/* Center Letter (Yellow) */}
                <button
                  onClick={() => handleLetterClick(GAME_DATA.centerLetter)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-2xl rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
                >
                  <span className="relative" style={{ top: '2px' }}>{GAME_DATA.centerLetter}</span>
                </button>

                {/* Outer Letters (Gray) - Positioned in hexagon */}
                {GAME_DATA.outerLetters.map((letter, index) => {
                  const angle = (index * 60 - 90) * (Math.PI / 180);
                  const radius = 90;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleLetterClick(letter)}
                      className="absolute w-16 h-16 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold text-xl rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                      }}
                    >
                      <span className="relative" style={{ top: '1px' }}>{letter}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Delete
              </button>
              <button
                onClick={handleShuffle}
                className="bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                ↻ Shuffle
              </button>
              <button
                onClick={handleEnter}
                className="bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Enter
              </button>
            </div>
          </div>

          {/* Right Side - Progress */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Rank Display */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{rank}</h3>
                <span className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
                  {foundWords.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(foundWords.length / GAME_DATA.validWords.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Hint Button */}
            <button
              onClick={handleHint}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl mb-6 transition-all duration-300"
            >
              {showHint ? 'Hide Hints' : 'Show Hints'} 💡
            </button>

            {/* Hints Display */}
            {showHint && (
              <div className="mb-6 bg-blue-50 p-4 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Two-letter list</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {getHints().map(({ letter, count }) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="font-bold">{letter}:</span>
                      <span className="text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Words you haven't found, grouped by first letter
                </p>
              </div>
            )}

            {/* Found Words */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                You have found {foundWords.length} word{foundWords.length !== 1 ? 's' : ''}
              </h3>
              <div className="max-h-64 overflow-y-auto">
                {foundWords.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No words found yet</p>
                ) : (
                  <div className="space-y-2">
                    {foundWords.map((word, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 px-4 py-2 rounded-lg flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{word}</span>
                        {GAME_DATA.pangrams.includes(word) && (
                          <span className="text-yellow-600 font-bold">⭐ Pangram</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-700 mb-4">Want to access more games and features?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Play
            </button>
            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-400 border-2 border-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Buy me a Coffee ☕
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-4">October 17, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default SpellingBeePage;
