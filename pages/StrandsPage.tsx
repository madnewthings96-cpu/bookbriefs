import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

interface Position {
  row: number;
  col: number;
}

interface ThemeWord {
  word: string;
  positions: Position[];
}

const GAME_DATA = {
  theme: 'CLASSIC BOOKS',
  themeWords: [
    { word: 'PRIDE', positions: [] },
    { word: 'PREJUDICE', positions: [] },
    { word: 'GATSBY', positions: [] },
    { word: 'MOCKINGBIRD', positions: [] },
    { word: 'CATCHER', positions: [] },
    { word: 'ODYSSEY', positions: [] },
  ],
  grid: [
    ['P', 'R', 'I', 'D', 'E', 'G'],
    ['R', 'E', 'J', 'U', 'D', 'A'],
    ['E', 'M', 'O', 'C', 'K', 'T'],
    ['J', 'I', 'N', 'G', 'B', 'S'],
    ['U', 'N', 'I', 'R', 'D', 'B'],
    ['D', 'G', 'B', 'I', 'R', 'Y'],
    ['I', 'C', 'A', 'T', 'C', 'H'],
    ['C', 'E', 'R', 'O', 'D', 'Y'],
    ['E', 'S', 'S', 'E', 'Y', 'S'],
  ]
};

const StrandsPage: React.FC = () => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Position[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useSEO({
    title: 'Strands - Word Search Game | BookBriefs',
    description: 'Find hidden words and uncover the day\'s theme in this engaging word puzzle game.',
    keywords: 'strands, word game, word search, puzzle, brain game',
    type: 'website',
  });

  const handleCellClick = (row: number, col: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (!isDragging) {
      // Start new selection
      setIsDragging(true);
      setSelectedCells([{ row, col }]);
      setCurrentWord(GAME_DATA.grid[row][col]);
    } else {
      // Add to existing selection
      const lastCell = selectedCells[selectedCells.length - 1];
      if (!lastCell) return;
      
      // Check if cell is adjacent
      const rowDiff = Math.abs(lastCell.row - row);
      const colDiff = Math.abs(lastCell.col - col);
      const isAdjacent = rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
      const isNotAlreadySelected = !selectedCells.some(cell => cell.row === row && cell.col === col);
      
      if (isAdjacent && isNotAlreadySelected) {
        setSelectedCells([...selectedCells, { row, col }]);
        setCurrentWord(currentWord + GAME_DATA.grid[row][col]);
      }
    }
  };

  const handleSubmitWord = () => {
    if (!currentWord) return;
    
    // Check if the formed word is a theme word
    const upperWord = currentWord.toUpperCase();
    const isThemeWord = GAME_DATA.themeWords.some(tw => tw.word === upperWord);
    
    if (isThemeWord && !foundWords.includes(upperWord)) {
      setFoundWords([...foundWords, upperWord]);
      // Keep cells highlighted if word is found
    } else {
      // Clear selection if word is not valid
      setSelectedCells([]);
      setCurrentWord('');
    }
    
    setIsDragging(false);
  };

  const handleClearSelection = () => {
    setSelectedCells([]);
    setCurrentWord('');
    setIsDragging(false);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number): boolean => {
    return foundWords.some(word => {
      // Simple check - in a real implementation, you'd track actual positions
      return GAME_DATA.grid[row][col] && word.includes(GAME_DATA.grid[row][col]);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl">🔤</div>
            <h1 className="text-5xl font-bold text-gray-900">
              Strands
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Find hidden words and<br />uncover the day's theme.
          </p>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="text-blue-600 hover:text-blue-800 underline font-semibold"
          >
            How to Play
          </button>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Theme Display */}
          <div className="mb-6 text-center">
            <div className="inline-block bg-blue-100 px-6 py-2 rounded-full">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                Today's Theme
              </p>
              <h2 className="text-xl font-bold text-gray-900">{GAME_DATA.theme}</h2>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-gray-700">
              {foundWords.length} of {GAME_DATA.themeWords.length}
            </p>
          </div>

          {/* Grid */}
          <div className="inline-block mx-auto select-none">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GAME_DATA.grid[0].length}, minmax(0, 1fr))` }}>
              {GAME_DATA.grid.map((row, rowIndex) => (
                row.map((letter, colIndex) => {
                  const isSelected = isCellSelected(rowIndex, colIndex);
                  const isFound = isCellFound(rowIndex, colIndex);
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                      className={`
                        w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
                        text-xl md:text-2xl font-bold rounded-lg
                        cursor-pointer transition-all duration-200
                        ${isSelected ? 'bg-blue-400 text-white scale-110 shadow-lg' : ''}
                        ${isFound && !isSelected ? 'bg-blue-200 text-blue-900' : ''}
                        ${!isSelected && !isFound ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                      `}
                    >
                      {letter}
                    </button>
                  );
                })
              ))}
            </div>
          </div>

          {/* Current Word Display */}
          {currentWord && (
            <div className="mt-6 text-center">
              <p className="text-xl font-semibold text-blue-600 mb-4">
                {currentWord}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSubmitWord}
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Submit Word
                </button>
                <button
                  onClick={handleClearSelection}
                  className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Found Words */}
          {foundWords.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Found Words:</h3>
              <div className="flex flex-wrap gap-2">
                {foundWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button className="bg-gray-900 text-white font-bold py-4 px-12 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Play
          </button>
          
          <p className="text-gray-700">Want to access more games and features?</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Log in
            </Link>
            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-gray-900 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
            >
              Buy me a Coffee ☕
            </a>
          </div>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">How to Play</h2>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="text-gray-500 hover:text-gray-900 text-3xl"
                >
                  ×
                </button>
              </div>

              {/* Example Grid */}
              <div className="mb-6 bg-blue-50 p-6 rounded-2xl">
                <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto mb-4">
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">B</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">A</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">N</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">A</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">N</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">A</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">I</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">I</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">T</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">F</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">R</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">U</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">L</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">I</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">E</div>
                  <div className="w-12 h-12 bg-blue-400 text-white flex items-center justify-center text-xl font-bold rounded">E</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">M</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">L</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">A</div>
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold rounded">P</div>
                </div>
                <p className="text-center text-sm font-semibold text-gray-700">APPLE</p>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Find theme words to fill the board.</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Theme words stay highlighted in blue when found.</li>
                    <li>Drag or tap letters to create words. If tapping, double tap the last letter to submit.</li>
                    <li>Theme words fill the board entirely. No theme words overlap.</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Tips:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Look for words related to the theme</li>
                    <li>Words can go in any direction (horizontal, vertical, diagonal)</li>
                    <li>All letters must be used to complete the puzzle</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrandsPage;
