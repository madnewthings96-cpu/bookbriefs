import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en';

interface LanguageContextType {
  currentLanguage: Language;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  getBookTitle: (bookId: string) => string;
  getBookAuthor: (bookId: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    // Header
    home: 'Home',
    summaries: 'Summaries',
    calculators: 'Calculators',
    about: 'About',
    profile: 'Profile',
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Logout',
    welcome: 'Welcome',
    
    // Homepage
    heroTitle: 'Unlock Big Ideas, Faster.',
    heroSubtitle: 'Unlock the essence of the world\'s greatest books with Bookbriefs. Get to the heart of powerful ideas fast, so you spend less time reading and more time applying what matters.',
    exploreSummaries: 'Explore Summaries',
    whyPeopleLove: 'Why People Love Using',
    joinThousands: 'Join thousands of readers who learn faster than they ever thought possible.',
    signupFree: 'Sign up for free',
    
    // Footer
    joinNewsletter: 'Join Our Newsletter',
    newsletterText: 'Get the latest market news and books delivered to your inbox.',
    subscribe: 'Subscribe',
    allRightsReserved: 'All rights reserved.',
    
    // Profile
    myProfile: 'My Profile',
    trackProgress: 'Track your reading progress and discover new books',
    
    // Auth
    loginTitle: 'Log In to BookBriefs',
    signupTitle: 'Join BookBriefs',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    loggingIn: 'Logging in...',
    creatingAccount: 'Creating Account...',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    signupHere: 'Sign up here',
    loginHere: 'Log in here',
    demoText: 'Demo: Use any email and password to log in',
    
    // Summary page content
    keyTakeaways: 'Key Takeaways',
    detailedSummary: 'Detailed Summary',
    listen: 'Listen',
    stop: 'Stop',
    bookNotFound: 'Book Not Found',
    bookNotFoundMessage: "We couldn't find the book you were looking for.",
    backToSummaries: 'Back to Summaries',
    summaryComingSoon: "This book summary is coming soon. We're working on providing detailed summaries for all books in our collection.",
    summaryInDevelopment: 'Summary in development',
    checkBackSoon: 'Check back soon for detailed content',
    
    // Book content
    bookTitles: {
      'atomic-habits': 'Atomic Habits',
      'trading-in-the-zone': 'Trading in the Zone',
      'the-subtle-art-of-not-giving-a-f': 'The Subtle Art of Not Giving a F*ck',
      'the-power-of-now': 'The Power of Now',
      'sapiens': 'Sapiens: A Brief History of Humankind',
      'thinking-fast-and-slow': 'Thinking, Fast and Slow',
      'the-alchemist': 'The Alchemist',
      'educated': 'Educated',
      'becoming': 'Becoming',
      'the-four-agreements': 'The Four Agreements',
      'dune': 'Dune',
      'project-hail-mary': 'Project Hail Mary',
      'rich-dad-poor-dad': 'Rich Dad Poor Dad',
      'the33strategiesofwar': 'The 33 Strategies of War',
      'thedisciplinedtrader': 'The Disciplined Trader',
      'thinkandgrowrich': 'Think and Grow Rich',
      'belesszombie': 'Be Less Zombie',
      'marketwizards': 'Market Wizards',
      'tradelikeastockmarketwizard': 'Trade Like a Stock Market Wizard',
      'howtodaytradeforaliving': 'How To Day Trade for a Living',
      'thelawsofhumannature': 'The Laws of Human Nature',
      'the48lawsofpower': 'The 48 Laws of Power',
      'secretsofthemillionairemind': 'Secrets of the Millionaire Mind'
    },
    bookAuthors: {
      'atomic-habits': 'James Clear',
      'trading-in-the-zone': 'Mark Douglas',
      'the-subtle-art-of-not-giving-a-f': 'Mark Manson',
      'the-power-of-now': 'Eckhart Tolle',
      'sapiens': 'Yuval Noah Harari',
      'thinking-fast-and-slow': 'Daniel Kahneman',
      'the-alchemist': 'Paulo Coelho',
      'educated': 'Tara Westover',
      'becoming': 'Michelle Obama',
      'the-four-agreements': 'Don Miguel Ruiz',
      'dune': 'Frank Herbert',
      'project-hail-mary': 'Andy Weir',
      'rich-dad-poor-dad': 'Robert T. Kiyosaki',
      'the33strategiesofwar': 'Robert Greene',
      'thedisciplinedtrader': 'Mark Douglas',
      'thinkandgrowrich': 'Napoleon Hill',
      'belesszombie': 'Elvin Turner',
      'marketwizards': 'Jack D. Schwager',
      'tradelikeastockmarketwizard': 'Mark Minervini',
      'howtodaytradeforaliving': 'Andrew Aziz',
      'thelawsofhumannature': 'Robert Greene',
      'the48lawsofpower': 'Robert Greene',
      'secretsofthemillionairemind': 'T. Harv Eker'
    }
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Initialize language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bookbriefs_language');
    // If the saved language is no longer supported (fr/es/ar), default to English
    if (saved === 'fr' || saved === 'es' || saved === 'ar') {
      localStorage.setItem('bookbriefs_language', 'en');
      setCurrentLanguage('en');
    } else if (saved && saved === 'en') {
      setCurrentLanguage(saved as Language);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('bookbriefs_language', language);
    
    // Set document direction (always LTR for English only)
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language;

    // Set text alignment (always left for English only)
    document.body.classList.remove('rtl');
    document.body.style.textAlign = 'left';

    // Trigger a re-render of the app
    window.dispatchEvent(new Event('languagechange'));
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage];
    if (!translation) return key;

    const value = translation[key as keyof typeof translations['en']];
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // For nested objects like bookTitles and bookAuthors
      return JSON.stringify(value);
    }
    return key;
  };

  const getBookTitle = (bookId: string): string => {
    const bookTitles = translations[currentLanguage].bookTitles as any;
    return bookTitles?.[bookId] || bookId;
  };

  const getBookAuthor = (bookId: string): string => {
    const bookAuthors = translations[currentLanguage].bookAuthors as any;
    return bookAuthors?.[bookId] || bookId;
  };

  const value: LanguageContextType = {
    currentLanguage,
    language: currentLanguage,
    setLanguage,
    t,
    getBookTitle,
    getBookAuthor
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
