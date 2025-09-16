import React from 'react';
import { useReaderMode } from '../contexts/ReaderModeContext';

const ReaderModeToggle: React.FC = () => {
  const { isReaderMode, toggleReaderMode } = useReaderMode();
  
  return (
    <button
      onClick={toggleReaderMode}
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isReaderMode 
          ? 'text-blue-500 hover:text-blue-600 focus:ring-blue-500' 
          : 'text-gray-500 hover:text-gray-700 focus:ring-gray-500'
      }`}
      aria-label={isReaderMode ? 'Exit reader mode' : 'Enter reader mode'}
      title={isReaderMode ? 'Exit reader mode' : 'Enter reader mode'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
        />
      </svg>
    </button>
  );
};

export default ReaderModeToggle;
