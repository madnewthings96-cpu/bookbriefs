import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

type Difficulty = 'easy' | 'medium' | 'hard';
type Cell = number | null;
type Grid = Cell[][];

const SudokuPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [grid, setGrid] = useState<Grid>([]);
  const [solution, setSolution] = useState<Grid>([]);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useSEO({
    title: 'Sudoku - Number Puzzle Game | BookBriefs',
    description: 'Play Sudoku and exercise your brain. Choose from easy, medium, or hard difficulty levels.',
    keywords: 'sudoku, puzzle game, brain game, number puzzle, logic game',
    type: 'website',
  });

  // Timer effect
  useEffect(() => {
    if (startTime && !isComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate a valid Sudoku solution
  const generateSolution = (): Grid => {
    const grid: Grid = Array(9).fill(null).map(() => Array(9).fill(null));
    
    const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
      }
      
      // Check column
      for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
      }
      
      // Check 3x3 box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (grid[startRow + i][startCol + j] === num) return false;
        }
      }
      
      return true;
    };
    
    const fillGrid = (grid: Grid): boolean => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === null) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(grid)) return true;
                grid[row][col] = null;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    fillGrid(grid);
    return grid;
  };

  // Create puzzle by removing numbers from solution
  const createPuzzle = (solution: Grid, difficulty: Difficulty): Grid => {
    const puzzle = solution.map(row => [...row]);
    const cellsToRemove = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 40 : 50;
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== null) {
        puzzle[row][col] = null;
        removed++;
      }
    }
    
    return puzzle;
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const newSolution = generateSolution();
    const newPuzzle = createPuzzle(newSolution, selectedDifficulty);
    
    setSolution(newSolution);
    setGrid(newPuzzle);
    setInitialGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] === null) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete) return;
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== null) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);
    
    // Check if the move is correct
    if (num !== solution[row][col]) {
      const newErrors = new Set(errors);
      newErrors.add(`${row}-${col}`);
      setErrors(newErrors);
    } else {
      const newErrors = new Set(errors);
      newErrors.delete(`${row}-${col}`);
      setErrors(newErrors);
      
      // Check if puzzle is complete
      const isGridComplete = newGrid.every((row, i) => 
        row.every((cell, j) => cell === solution[i][j])
      );
      
      if (isGridComplete) {
        setIsComplete(true);
      }
    }
  };

  const handleClear = () => {
    if (!selectedCell || isComplete) return;
    
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== null) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);
    
    const newErrors = new Set(errors);
    newErrors.delete(`${row}-${col}`);
    setErrors(newErrors);
  };

  const handleRestart = () => {
    setDifficulty(null);
    setGrid([]);
    setSolution([]);
    setInitialGrid([]);
    setSelectedCell(null);
    setErrors(new Set());
    setIsComplete(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            {/* Sudoku Icon */}
            <div className="mb-6 flex justify-center">
              <div className="bg-white border-4 border-gray-900 rounded-lg p-2 inline-grid grid-cols-3 gap-0.5">
                <div className="w-6 h-6 bg-white border border-gray-900 flex items-center justify-center text-xs font-bold">1</div>
                <div className="w-6 h-6 bg-orange-400"></div>
                <div className="w-6 h-6 bg-white border border-gray-900"></div>
                <div className="w-6 h-6 bg-white border border-gray-900 flex items-center justify-center text-xs font-bold">2</div>
                <div className="w-6 h-6 bg-white border border-gray-900"></div>
                <div className="w-6 h-6 bg-white border border-gray-900 flex items-center justify-center text-xs font-bold">3</div>
                <div className="w-6 h-6 bg-white border border-gray-900"></div>
                <div className="w-6 h-6 bg-white border border-gray-900"></div>
                <div className="w-6 h-6 bg-white border border-gray-900"></div>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Sudoku
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Try this numbers game,<br />minus the math.
            </p>

            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-4">Choose Your Puzzle:</p>
              <div className="space-y-3">
                <button
                  onClick={() => startGame('easy')}
                  className="w-full max-w-xs mx-auto block bg-gray-900 text-white font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Easy
                </button>
                <button
                  onClick={() => startGame('medium')}
                  className="w-full max-w-xs mx-auto block bg-gray-900 text-white font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Medium
                </button>
                <button
                  onClick={() => startGame('hard')}
                  className="w-full max-w-xs mx-auto block bg-gray-900 text-white font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Hard
                </button>
                <Link
                  to="/login"
                  className="w-full max-w-xs mx-auto block bg-white border-2 border-gray-900 text-gray-900 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Log in
                </Link>
              </div>
            </div>

            <p className="text-sm text-gray-600">October 17, 2025</p>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Congratulations!
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              You solved the {difficulty} puzzle!
            </p>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 mb-8">
              {formatTime(elapsedTime)}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-4 px-8 rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
              <Link
                to="/"
                className="bg-gray-200 text-gray-800 font-bold py-4 px-8 rounded-full hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Sudoku - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </h1>
          <div className="text-2xl font-bold text-white">
            ⏱️ {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 mb-6">
          <div className="inline-block mx-auto">
            <div className="grid grid-cols-9 gap-0 border-4 border-gray-900 bg-gray-900">
              {grid.map((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  const isInitial = initialGrid[rowIndex][colIndex] !== null;
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const hasError = errors.has(`${rowIndex}-${colIndex}`);
                  const isThickRight = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                  const isThickBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center
                        text-sm sm:text-base md:text-xl font-bold
                        ${isInitial ? 'bg-gray-100 text-gray-900' : 'bg-white text-blue-600'}
                        ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                        ${hasError ? 'bg-red-100 text-red-600' : ''}
                        ${isThickRight ? 'border-r-2' : 'border-r'}
                        ${isThickBottom ? 'border-b-2' : 'border-b'}
                        border-gray-400
                        hover:bg-blue-50 transition-colors
                        ${isInitial ? 'cursor-default' : 'cursor-pointer'}
                      `}
                      disabled={isInitial}
                    >
                      {cell || ''}
                    </button>
                  );
                })
              ))}
            </div>
          </div>

          {/* Number Pad */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-yellow-500 text-white font-bold text-xl rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleClear}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Clear
            </button>
            <button
              onClick={handleRestart}
              className="bg-red-500 text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              New Game
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-gray-700">
            Fill the grid so that every row, column, and 3×3 box contains the digits 1-9
          </p>
        </div>
      </div>
    </div>
  );
};

export default SudokuPage;
