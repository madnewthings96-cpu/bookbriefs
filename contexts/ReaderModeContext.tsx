import React, { createContext, useContext, useState, useEffect } from 'react';

type ReaderModeContextType = {
  isReaderMode: boolean;
  toggleReaderMode: () => void;
};

const ReaderModeContext = createContext<ReaderModeContextType | undefined>(undefined);

export const ReaderModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReaderMode, setIsReaderMode] = useState<boolean>(false);

  // Load reader mode preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('readerMode');
    if (savedPreference) {
      setIsReaderMode(savedPreference === 'true');
    }
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('readerMode', String(isReaderMode));
    
    // Toggle reader mode class on body
    if (isReaderMode) {
      document.body.classList.add('reader-mode');
    } else {
      document.body.classList.remove('reader-mode');
    }
  }, [isReaderMode]);

  const toggleReaderMode = () => {
    setIsReaderMode(prev => !prev);
  };

  return (
    <ReaderModeContext.Provider value={{ isReaderMode, toggleReaderMode }}>
      {children}
    </ReaderModeContext.Provider>
  );
};

export const useReaderMode = () => {
  const context = useContext(ReaderModeContext);
  if (context === undefined) {
    throw new Error('useReaderMode must be used within a ReaderModeProvider');
  }
  return context;
};
