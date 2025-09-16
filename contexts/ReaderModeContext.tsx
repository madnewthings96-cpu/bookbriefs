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

  // Save preference to localStorage and handle scroll behavior
  useEffect(() => {
    localStorage.setItem('readerMode', String(isReaderMode));
    
    // Toggle reader mode class on body
    if (isReaderMode) {
      document.body.classList.add('reader-mode');
      
      let lastScrollY = window.scrollY;
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const direction = scrollY > lastScrollY ? 'down' : 'up';
        
        if (direction === 'down' && scrollY > 100) {
          document.body.classList.add('scrolled-down');
          document.body.classList.remove('scrolled-up');
        } else if (direction === 'up') {
          document.body.classList.add('scrolled-up');
          document.body.classList.remove('scrolled-down');
        }
        
        lastScrollY = scrollY;
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      document.body.classList.remove('reader-mode');
      document.body.classList.remove('scrolled-down');
      document.body.classList.remove('scrolled-up');
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
