import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    console.log('Current theme:', theme);
    if (theme === 'dark') {
      console.log('Adding dark class to documentElement');
      document.documentElement.classList.add('dark');
    } else {
      console.log('Removing dark class from documentElement');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    console.log('Document classes:', document.documentElement.className);
  }, [theme]);
  
  // Log initial theme state
  useEffect(() => {
    console.log('ThemeProvider mounted with initial theme:', theme);
    console.log('Document classes on mount:', document.documentElement.className);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
