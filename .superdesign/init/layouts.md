# Shared Layouts

The app has one global shell rather than per-route layout files. Every route renders beneath `Header` inside the constrained `main` element, followed by `MobileBottomNav` and `Footer`. The source below is verbatim; `SearchResults` is cataloged with full code in `components.md` to avoid duplicating that non-layout primitive here.

## Application entry

- File: `index.tsx`
- Renders: Mounts the root React tree and imports the global stylesheet.

```tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Provider stack and app shell

- File: `App.tsx`
- Renders: Wraps all global providers, owns BrowserRouter, and composes Header, route content, mobile navigation, exit-intent overlay, and Footer.

```tsx

import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ReaderModeProvider } from './contexts/ReaderModeContext';
import { PersonalNotesProvider } from './contexts/PersonalNotesContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ReadingChallengeProvider } from './contexts/ReadingChallengeContext';
import { BooksProvider } from './contexts/BooksContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Spinner from './components/Spinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const SummariesPage = lazy(() => import('./pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import('./pages/SummaryDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ReadingChallengePage = lazy(() => import('./pages/ReadingChallengePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const FinanceTrackerPage = lazy(() => import('./pages/FinanceTrackerPage'));
const TradingJournalPage = lazy(() => import('./pages/TradingJournalPage'));
const ExitIntentPopup = lazy(() => import('./components/ExitIntentPopup'));

interface FirebaseContextType {
  currentUser: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Firebase Provider Component
const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureUserDocument = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastLogin: new Date(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    // Set a shorter timeout to prevent blocking
    const timeoutId = setTimeout(() => {
      console.warn('Firebase auth initialization timeout, proceeding without auth');
      setLoading(false);
    }, 3000); // 3 second timeout (reduced from 10)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId); // Clear timeout since auth resolved
      setCurrentUser(user);

      if (user) {
        try {
          await ensureUserDocument(user);
          await updateLastLogin(user);
        } catch (error) {
          console.error('Error preparing user data:', error);
        }
      }

      setLoading(false);
    }, (error) => {
      // Error callback for auth state changes
      console.error('Firebase auth error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value: FirebaseContextType = {
    currentUser,
    loading,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <FirebaseProvider>
        <BooksProvider>
          <LanguageProvider>
            <AuthProvider>
              <FavoritesProvider>
                <ReadingChallengeProvider>
                  <UserProgressProvider>
                    <ReaderModeProvider>
                      <PersonalNotesProvider>
                        <AppContent />
                      </PersonalNotesProvider>
                    </ReaderModeProvider>
                  </UserProgressProvider>
                </ReadingChallengeProvider>
              </FavoritesProvider>
            </AuthProvider>
          </LanguageProvider>
        </BooksProvider>
      </FirebaseProvider>
    </HelmetProvider>
  );
};

// App Content Component (separated to use Firebase context)
const AppContent: React.FC = () => {
  const { loading } = useFirebase();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow container mx-auto px-0 sm:px-0 lg:px-0 py-8">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/summaries" element={<SummariesPage />} />
              <Route path="/book-summaries" element={<SummariesPage />} />
              <Route path="/ar/book-summaries" element={<SummariesPage />} />
              <Route path="/categories/:categorySlug" element={<CategoryPage />} />
              <Route path="/ar/categories/:categorySlug" element={<CategoryPage />} />
              <Route path="/summary/:bookId" element={<SummaryDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/calculators" element={<CalculatorsPage />} />
              <Route path="/calculators/pip-value" element={<CalculatorsPage />} />
              <Route path="/calculators/position-size" element={<CalculatorsPage />} />
              <Route path="/calculators/fire" element={<CalculatorsPage />} />
              <Route path="/calculators/compound-interest" element={<CalculatorsPage />} />
              <Route path="/ar/tools/pip-value-calculator" element={<CalculatorsPage />} />
              <Route path="/ar/tools/position-size-calculator" element={<CalculatorsPage />} />
              <Route path="/ar/tools/fire-calculator" element={<CalculatorsPage />} />
              <Route path="/ar/tools/compound-interest-calculator" element={<CalculatorsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/reading-challenge" element={
                <ProtectedRoute>
                  <ReadingChallengePage />
                </ProtectedRoute>
              } />
              <Route path="/downloads" element={
                <ProtectedRoute>
                  <DownloadsPage />
                </ProtectedRoute>
              } />
              <Route path="/feedback" element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              } />
              <Route path="/finance-tracker" element={
                <ProtectedRoute>
                  <FinanceTrackerPage />
                </ProtectedRoute>
              } />
              <Route path="/trading-journal" element={
                <ProtectedRoute>
                  <TradingJournalPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-use" element={<TermsOfUsePage />} />
            </Routes>
          </Suspense>
        </main>

        <MobileBottomNav />
        <Suspense fallback={null}>
          <ExitIntentPopup />
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
```

## Header

- File: `components/Header.tsx`
- Renders: Responsive global header with announcement strip, desktop navigation/mega menus, search, authentication actions, and mobile menu.

```tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  ChevronDown,
  Coffee,
  Download,
  FileText,
  Library,
  Menu,
  Newspaper,
  PenLine,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';
import { useBooks } from '../contexts/BooksContext';
import LanguageSelector from './LanguageSelector';
import SearchResults from './SearchResults';
import UserMenu from './UserMenu';
import { searchBooks, SearchResult } from '../services/searchService';

type MegaMenuKey = 'library' | 'tools' | 'learn';

type HeaderIcon = React.ComponentType<{ className?: string }>;

interface MegaMenuItem {
  to: string;
  label: string;
  description: string;
  icon: HeaderIcon;
}

interface MegaMenuConfig {
  label: string;
  eyebrow: string;
  headline: string;
  items: MegaMenuItem[];
  promo: {
    to: string;
    title: string;
    body: string;
    image: string;
  };
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { isReaderMode } = useReaderMode();
  const { books } = useBooks();

  const closeSearch = useCallback(() => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
  }, []);

  const closeMenus = useCallback(() => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchBooks(searchQuery, language, books);
      if (results.length > 0) {
        navigate(results[0].path);
        closeSearch();
      }
    }
  }, [books, closeSearch, language, navigate, searchQuery]);

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        const results = searchBooks(query, language, books);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
  }, [books, language]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault();
        setActiveMegaMenu(null);
        setIsSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else if (e.key === 'Escape') {
        setActiveMegaMenu(null);
        if (isSearchFocused || isSearchExpanded) {
          closeSearch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [closeSearch, isSearchFocused, isSearchExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);

        if (isReaderMode) {
          if (scrolled) {
            document.body.classList.add('scrolled');
          } else {
            document.body.classList.remove('scrolled');
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isReaderMode, isScrolled]);

  useEffect(() => {
    if (!activeMegaMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [activeMegaMenu]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const megaMenus: Record<MegaMenuKey, MegaMenuConfig> = {
    library: {
      label: 'Library',
      eyebrow: '10-minute reading',
      headline: 'Find the next idea worth applying.',
      items: [
        {
          to: '/summaries',
          label: t('summaries'),
          description: 'Browse every book summary in the library.',
          icon: BookOpen,
        },
        {
          to: '/summaries',
          label: 'Most read books',
          description: 'Start with the summaries readers return to most.',
          icon: Library,
        },
        {
          to: '/reading-challenge',
          label: 'Reading Challenge',
          description: 'Set a monthly target and track your progress.',
          icon: Target,
        },
        {
          to: '/downloads',
          label: 'Downloads',
          description: 'Keep your saved summaries and resources together.',
          icon: Download,
        },
      ],
      promo: {
        to: '/summary/atomic-habits',
        title: 'Start with Atomic Habits',
        body: 'A practical first read for building systems that compound.',
        image: '/images/atomic-habits.jpg',
      },
    },
    tools: {
      label: 'Tools',
      eyebrow: 'Practical utilities',
      headline: 'Turn insights into decisions.',
      items: [
        {
          to: '/calculators',
          label: t('calculators'),
          description: 'Run position size, compound interest, FIRE, and pip calculations.',
          icon: Calculator,
        },
        {
          to: '/finance-tracker',
          label: 'Finance Tracker',
          description: 'Track goals, deposits, and progress in one view.',
          icon: BarChart3,
        },
        {
          to: '/trading-journal',
          label: 'Trading Journal',
          description: 'Log trades and review the patterns behind your performance.',
          icon: PenLine,
        },
        {
          to: '/summaries',
          label: 'Money books',
          description: 'Read summaries on investing, markets, and wealth building.',
          icon: Sparkles,
        },
      ],
      promo: {
        to: '/finance-tracker',
        title: 'Build a clearer money system',
        body: 'Pair finance tools with book insights and track the plan.',
        image: '/images/the psychology of money.jpg',
      },
    },
    learn: {
      label: 'Learn',
      eyebrow: 'Updates and essays',
      headline: 'Keep the habit going between books.',
      items: [
        {
          to: '/blog',
          label: 'Blog',
          description: 'Read practical essays and book-driven guides.',
          icon: FileText,
        },
        {
          to: '/news',
          label: 'News',
          description: 'Follow market and learning updates worth scanning.',
          icon: Newspaper,
        },
        {
          to: '/about',
          label: t('about'),
          description: 'Learn why BookBriefs exists and what it is built for.',
          icon: BookOpen,
        },
        {
          to: '/summaries',
          label: 'New summaries',
          description: 'Check the latest books added to the library.',
          icon: Sparkles,
        },
      ],
      promo: {
        to: '/blog',
        title: 'Read beyond the summary',
        body: 'Use the blog to connect ideas across books, money, and habits.',
        image: '/images/reading.jpg',
      },
    },
  };

  const desktopMenuKeys = Object.keys(megaMenus) as MegaMenuKey[];

  const mobileLinks: MegaMenuItem[] = [
    { to: '/summaries', label: t('summaries'), description: '', icon: BookOpen },
    { to: '/blog', label: 'Blog', description: '', icon: FileText },
    { to: '/calculators', label: t('calculators'), description: '', icon: Calculator },
    { to: '/news', label: 'News', description: '', icon: Newspaper },
    { to: '/finance-tracker', label: 'Finance Tracker', description: '', icon: BarChart3 },
    { to: '/trading-journal', label: 'Trading Journal', description: '', icon: PenLine },
  ];

  const routeGroups: Record<MegaMenuKey, string[]> = {
    library: ['/summaries', '/summary', '/reading-challenge', '/downloads'],
    tools: ['/calculators', '/finance-tracker', '/trading-journal'],
    learn: ['/blog', '/news', '/about'],
  };

  const isGroupActive = (key: MegaMenuKey) =>
    routeGroups[key].some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));

  const navButtonClassName = (key: MegaMenuKey) =>
    `inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 ${
      activeMegaMenu === key || isGroupActive(key)
        ? 'bg-white text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_18px_rgba(89,69,45,0.10)]'
        : 'text-[#574f43] hover:bg-white/65 hover:text-gray-950'
    }`;

  const mobileLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.98] ${
      isActive
        ? 'bg-white text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_20px_rgba(89,69,45,0.10)]'
        : 'text-[#574f43] hover:bg-white/70 hover:text-gray-950'
    }`;

  const headerClassName = `group sticky top-0 z-50 border-b backdrop-blur-xl transition-[padding,box-shadow,background-color,border-color,backdrop-filter] duration-300 ${
    isReaderMode
      ? 'border-gray-200/70 bg-white/90 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.06)] hover:bg-white/50'
      : isScrolled
        ? 'border-[#e8dfd3]/50 bg-white/50 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_14px_36px_rgba(89,69,45,0.12)]'
        : 'border-[#e5d8c7] bg-[#f7f0e6]/95 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(89,69,45,0.08)] hover:bg-[#f7f0e6]/50'
  } ${isReaderMode && isScrolled ? 'py-2' : 'py-0'}`;

  const activeMenu = activeMegaMenu ? megaMenus[activeMegaMenu] : null;

  return (
    <header
      ref={headerRef}
      className={headerClassName}
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      {!isReaderMode && (
        <div className={`hidden border-b border-white/15 text-white transition-colors duration-300 group-hover:bg-[#a75d37]/50 md:block ${isScrolled ? 'bg-[#a75d37]/50' : 'bg-[#a75d37]'}`}>
          <div className="mx-auto flex h-7 max-w-7xl items-center justify-center px-4 text-[11px] font-semibold sm:px-6 lg:px-8">
            <Link
              to="/summaries"
              className="inline-flex items-center gap-2 text-white/95 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              New summaries added weekly. Read the next big idea in 10 minutes.
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3 lg:h-16">
          <div className="flex min-w-0 items-center">
            <NavLink
              to="/"
              className="group flex min-h-11 min-w-0 items-center gap-3 rounded-2xl pr-2 transition-transform duration-200 active:scale-[0.98]"
              onClick={() => setActiveMegaMenu(null)}
              aria-label="BookBriefs home"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-transparent text-[#374151] transition-transform duration-200 group-hover:-translate-y-0.5">
                <BookOpen className="h-9 w-9 stroke-[1.7]" aria-hidden="true" />
              </span>
              <span className="logo-text hidden min-w-0 flex-col items-center leading-none text-center sm:flex">
                <span className="block truncate text-[22px] font-semibold tracking-tight text-[#374151]">BookBriefs</span>
                <span className="mt-0.5 hidden text-center text-[14px] font-semibold italic tracking-tight text-[#374151] lg:block" style={{ fontFamily: '"Newsreader", serif' }}>
                  Ta7leel
                </span>
              </span>
            </NavLink>

            <nav className="ml-7 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
              {desktopMenuKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={navButtonClassName(key)}
                  onMouseEnter={() => {
                    closeSearch();
                    setActiveMegaMenu(key);
                  }}
                  onFocus={() => setActiveMegaMenu(key)}
                  onClick={() => {
                    closeSearch();
                    setActiveMegaMenu(key);
                  }}
                  aria-expanded={activeMegaMenu === key}
                  aria-controls="desktop-mega-menu"
                >
                  {megaMenus[key].label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMegaMenu === key ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setActiveMegaMenu(null);
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className={`pressable flex h-10 w-10 items-center justify-center rounded-xl transition-[transform,background-color,color,box-shadow] duration-200 ${
                  isSearchExpanded
                    ? 'bg-white text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_20px_rgba(89,69,45,0.10)]'
                    : 'bg-white/55 text-[#574f43] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.07)] hover:bg-white hover:text-gray-950'
                }`}
                aria-label={isSearchExpanded ? 'Close search' : 'Open search'}
              >
                {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>

              <form
                onSubmit={handleSearch}
                className={`absolute right-0 top-12 z-50 transition-[opacity,transform] duration-300 ease-in-out ${
                  isSearchExpanded
                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                    : '-translate-y-2 opacity-0 pointer-events-none'
                }`}
              >
                <div className="relative w-[22rem]">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsSearchFocused(false);
                        setSearchResults([]);
                      }, 200);
                    }}
                    placeholder="Search books..."
                    className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-12 text-sm text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.08),0_18px_40px_rgba(89,69,45,0.18)] outline-none ring-1 ring-gray-950/5 placeholder:text-gray-400 transition-[box-shadow,background-color,color] duration-200 focus:ring-2 focus:ring-orange-400/45"
                  />
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="pressable absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {(isSearchFocused && searchQuery.trim() !== '') && (
                    <SearchResults
                      results={searchResults}
                      onClose={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setIsSearchFocused(false);
                      }}
                      isVisible={true}
                      isLoading={isSearching}
                    />
                  )}

                  {isSearchFocused && !searchQuery && (
                    <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
                        Esc
                      </kbd>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable hidden min-h-10 items-center gap-2 rounded-xl bg-[#a75d37] px-3 py-2 text-sm font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.10),0_10px_22px_rgba(167,93,55,0.24)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#8f4f2f] xl:inline-flex"
            >
              <Coffee className="h-4 w-4" aria-hidden="true" />
              Support
            </a>

            <div className="hidden items-center md:flex">
              <LanguageSelector />
            </div>

            {!isAuthenticated && (
              <div className="hidden items-center gap-1 md:flex">
                <NavLink to="/login" className="inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold text-[#574f43] transition-[background-color,color] duration-200 hover:bg-white/60 hover:text-gray-950">
                  {t('login')}
                </NavLink>
                <NavLink
                  to="/signup"
                  className="pressable inline-flex min-h-10 items-center rounded-xl bg-[#a75d37] px-5 py-2 text-sm font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.12),0_12px_26px_rgba(167,93,55,0.28)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#8f4f2f] hover:shadow-[0_1px_2px_rgba(89,69,45,0.12),0_16px_32px_rgba(167,93,55,0.34)]"
                >
                  {t('signup')}
                </NavLink>
              </div>
            )}

            <div className="hidden md:block">
              <UserMenu />
            </div>

            <button
              onClick={() => {
                setActiveMegaMenu(null);
                setIsMenuOpen(!isMenuOpen);
              }}
              type="button"
              className="pressable inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-[#574f43] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.07)] transition-[transform,background-color,color,box-shadow] duration-200 hover:bg-white hover:text-gray-950 focus:outline-none md:hidden"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {activeMenu && !isReaderMode && (
        <div
          id="desktop-mega-menu"
          className="hidden border-t border-[#e8dfd3] bg-[#fbf6ed]/98 shadow-[0_18px_42px_rgba(89,69,45,0.14)] backdrop-blur-xl lg:block"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_260px] gap-8 px-8 py-5">
            <div className="grid grid-cols-[190px_1fr] gap-6">
              <div className="pt-1">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a75d37]">{activeMenu.eyebrow}</p>
                <p className="mt-3 max-w-[14rem] text-2xl font-black leading-tight text-[#25301f]">{activeMenu.headline}</p>
              </div>

              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#e7dccd] bg-[#e7dccd]">
                {activeMenu.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={`${activeMegaMenu}-${item.label}`}
                      to={item.to}
                      onClick={() => setActiveMegaMenu(null)}
                      className="group flex min-h-[92px] gap-4 bg-[#fbf6ed] p-4 transition-[background-color] duration-200 hover:bg-white"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.07)] transition-[background-color,color] duration-200 group-hover:bg-[#25301f] group-hover:text-white">
                        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-gray-950">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#6f6558]">{item.description}</span>
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <Link
              to={activeMenu.promo.to}
              onClick={() => setActiveMegaMenu(null)}
              className="group grid grid-cols-[1fr_76px] items-center gap-4 rounded-2xl border border-[#e7dccd] bg-white p-4 text-left shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_28px_rgba(89,69,45,0.10)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(17,24,39,0.05),0_16px_36px_rgba(89,69,45,0.16)]"
            >
              <span>
                <span className="block text-lg font-black leading-tight text-[#25301f]">{activeMenu.promo.title}</span>
                <span className="mt-2 block text-xs leading-5 text-[#6f6558]">{activeMenu.promo.body}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#a75d37]">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </span>
              <img
                src={activeMenu.promo.image}
                alt=""
                className="h-24 w-[76px] rounded-xl object-cover shadow-[0_10px_24px_rgba(17,24,39,0.18)]"
                loading="lazy"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="border-t border-[#e5d8c7] bg-[#f7f0e6] shadow-[0_14px_34px_rgba(89,69,45,0.14)] md:hidden" id="mobile-menu">
          <div className="px-4 pb-4 pt-3">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsSearchFocused(false);
                      setSearchResults([]);
                    }, 200);
                  }}
                  placeholder="Search books..."
                  className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_12px_26px_rgba(89,69,45,0.12)] outline-none ring-1 ring-gray-950/5 placeholder:text-gray-400 transition-[box-shadow,background-color] duration-200 focus:ring-2 focus:ring-orange-400/45"
                />
                {(isSearchFocused && searchQuery.trim() !== '') && (
                  <SearchResults
                    results={searchResults}
                    onClose={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchFocused(false);
                    }}
                    isVisible={true}
                    isLoading={isSearching}
                  />
                )}
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              </div>
            </form>

            <nav className="grid gap-1" aria-label="Mobile primary navigation">
              {mobileLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink key={item.to} to={item.to} className={mobileLinkClassName} onClick={closeMenus}>
                    <Icon className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <a
              href="https://ko-fi.com/ta7leel"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a75d37] px-4 py-3 text-sm font-bold text-white shadow-[0_1px_2px_rgba(89,69,45,0.10),0_10px_22px_rgba(167,93,55,0.24)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#8f4f2f]"
              onClick={() => setIsMenuOpen(false)}
            >
              <Coffee className="h-4 w-4" aria-hidden="true" />
              Support BookBriefs
            </a>

            <div className="mt-3 space-y-1 border-t border-[#e5d8c7] pt-3">
              {isAuthenticated ? (
                <>
                  <span className="block truncate px-3 py-2 text-sm font-semibold text-[#6f6558]">
                    {user?.email || t('welcome')}
                  </span>
                  <NavLink to="/profile" className={mobileLinkClassName} onClick={closeMenus}>
                    <BookOpen className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>{t('profile')}</span>
                  </NavLink>
                  <NavLink to="/reading-challenge" className={mobileLinkClassName} onClick={closeMenus}>
                    <Target className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>Reading Challenge</span>
                  </NavLink>
                  <NavLink to="/downloads" className={mobileLinkClassName} onClick={closeMenus}>
                    <Download className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>Downloads</span>
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#574f43] transition-[background-color,color,transform] duration-200 hover:bg-white/70 hover:text-gray-950 active:scale-[0.98]"
                  >
                    <X className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={mobileLinkClassName} onClick={closeMenus}>
                    <BookOpen className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>{t('login')}</span>
                  </NavLink>
                  <NavLink to="/signup" className={mobileLinkClassName} onClick={closeMenus}>
                    <Sparkles className="h-4.5 w-4.5 text-[#a75d37]" aria-hidden="true" />
                    <span>{t('signup')}</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
```

## Footer

- File: `components/Footer.tsx`
- Renders: Global editorial footer with brand, mission, newsletter CTA, social links, and privacy link.

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Coffee, Instagram, Send, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const readerStack = [
    '/images/the alchemist.jpg',
    '/images/atomic-habits.jpg',
    '/images/rich dad poor dad.jpg',
    '/images/the psychology of money.jpg',
    '/images/dune.jpg',
    '/images/educated.jpg',
  ];

  return (
    <footer className="bg-[#e5d8c7] text-gray-950">
      <div className="mx-auto max-w-7xl">
        <section className="px-5 py-12 text-center sm:px-8 sm:py-16 lg:py-20">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-[0.95] tracking-tight text-gray-950 text-balance sm:text-5xl md:text-6xl">
            You don’t have to read it all alone.
          </h2>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-5 text-gray-700 text-pretty">
            The best ideas are easier to keep when they are clear, short, and ready when you are.
          </p>

          <div className="mt-5 flex justify-center -space-x-2" aria-hidden="true">
            {readerStack.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-10 w-10 rounded-full object-cover book-cover-outline shadow-[0_1px_2px_rgba(17,24,39,0.08),0_8px_18px_rgba(17,24,39,0.12)]"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>

          <Link
            to="/summaries"
            className="pressable mx-auto mt-12 flex min-h-12 w-full max-w-5xl items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-sm font-semibold text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_14px_34px_rgba(17,24,39,0.08)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-gray-50"
          >
            <span className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-950" aria-hidden="true" />
              Start reading smarter
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="grid border-t border-gray-950/55 md:grid-cols-2">
          <div className="flex min-h-[190px] flex-col justify-between px-5 py-8 sm:px-10 md:min-h-[220px]">
            <Link to="/" className="inline-flex items-center gap-3 text-gray-950">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-transparent">
                <BookOpen className="h-12 w-12 stroke-[1.6]" aria-hidden="true" />
              </span>
              <span className="text-4xl font-semibold tracking-tight">BookBriefs</span>
            </Link>
            <p className="mt-10 text-xs text-gray-700">©{currentYear} BookBriefs, Inc. All Rights Reserved.</p>
          </div>

          <div className="grid min-h-[190px] border-t border-gray-950/55 md:min-h-[220px] md:border-l md:border-t-0 md:border-gray-950/55">
            <div className="px-5 py-8 sm:px-20">
              <nav className="space-y-4 text-sm font-medium text-gray-800" aria-label="Social links">
                <a href="https://x.com/Ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-xs font-bold" aria-hidden="true">𝕏</span>
                  X
                </a>
                <a href="https://www.youtube.com/@ta7leeel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Youtube className="h-4 w-4" aria-hidden="true" />
                  YouTube
                </a>
                <a href="https://ko-fi.com/ta7leel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Coffee className="h-4 w-4" aria-hidden="true" />
                  Ko-fi
                </a>
                <a href="https://t.me/MadMarkets" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Telegram
                </a>
                <a href="https://www.instagram.com/ta7leel007" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-950">
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  Instagram
                </a>
              </nav>
            </div>

            <div className="self-end px-5 pb-6 sm:px-20">
              <Link to="/privacy-policy" className="text-xs font-medium text-gray-700 transition-colors duration-200 hover:text-gray-950">
                Privacy Notice
              </Link>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
```

## MobileBottomNav

- File: `components/MobileBottomNav.tsx`
- Renders: Fixed mobile-only primary navigation with active-label expansion and reader-mode visual adaptation.

```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calculator, Newspaper, Sparkles, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';

// Iridescent bubble animation component
const IridescentBubble: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    {/* Animated iridescent bubble */}
    <div className="absolute inset-[-20%] animate-bubble-morph">
      <div
        className="absolute inset-0 animate-bubble-rotate"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 40%, rgba(255, 100, 50, 0.9) 0%, transparent 50%),
            radial-gradient(ellipse 70% 80% at 70% 60%, rgba(50, 150, 255, 0.9) 0%, transparent 50%),
            radial-gradient(ellipse 60% 70% at 50% 30%, rgba(255, 200, 100, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 40% 70%, rgba(150, 50, 255, 0.7) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 60% 50%, rgba(50, 200, 150, 0.6) 0%, transparent 50%)
          `,
          filter: 'blur(8px) contrast(1.2) saturate(1.5)',
        }}
      />
    </div>
    {/* Glass overlay for depth */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: 'radial-gradient(ellipse 100% 100% at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)',
      }}
    />
    {/* Inner glow ring */}
    <div
      className="absolute inset-[2px] rounded-xl border border-white/20"
      style={{
        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)',
      }}
    />
  </div>
);

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { isReaderMode } = useReaderMode();

  const navItems: MobileNavItem[] = [
    { to: '/', label: t('home') || 'Home', icon: Home },
    { to: '/summaries', label: t('summaries') || 'Summaries', icon: BookOpen },
    { to: '/blog', label: t('blog') || 'Blog', icon: FileText },
    { to: '/calculators', label: t('calculators') || 'Calculators', icon: Calculator },
    { to: '/news', label: t('news') || 'News', icon: Newspaper },
  ];

  const baseBackground = isReaderMode ? 'bg-white/95 text-gray-800 shadow-xl shadow-gray-900/5' : 'bg-[#e5d8c7] text-gray-950 shadow-[0_15px_35px_-15px_rgba(89,69,45,0.45)]';
  const inactiveStyles = isReaderMode ? 'text-gray-400' : 'text-gray-600';
  const activeStyles = isReaderMode ? 'bg-gray-900 text-white shadow-inner shadow-gray-900/30' : 'bg-white text-gray-950 shadow-inner shadow-gray-900/15';

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
      <div className="flex w-full max-w-2xl mx-auto items-end gap-3 pointer-events-auto">
        <nav className={`flex-1 flex items-center justify-between rounded-[28px] px-2 py-1 backdrop-blur-xl ${baseBackground}`} aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-2 py-2 rounded-2xl text-[11px] font-semibold uppercase tracking-wide transition-[width,max-width,opacity,transform,background-color,color,box-shadow] duration-200 ${isActive ? `${activeStyles}` : `${inactiveStyles}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-80'}`} />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${isActive ? 'opacity-100 translate-x-0 max-w-[80px]' : 'opacity-0 -translate-x-1 max-w-0'
                      }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  );
};

export default MobileBottomNav;
```

## UserMenu

- File: `components/UserMenu.tsx`
- Renders: Authenticated/guest account dropdown embedded in the header, including profile, challenge, download, feedback, and session actions.

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FeedbackModal from './FeedbackModal';

const UserMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItemClassName = "flex w-full items-center px-4 py-3 text-left transition-[background-color,color] duration-200 hover:bg-[#F2F5EC] group";
  const menuIconClassName = "mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F5EC] transition-colors duration-200 group-hover:bg-[#E7EBDF]";
  const menuIconSvgClassName = "h-5 w-5 text-gray-500 transition-colors duration-200 group-hover:text-gray-950";
  const menuTextClassName = "text-sm font-semibold text-gray-700 transition-colors duration-200 group-hover:text-gray-950";

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] transition-[transform,background-color,color,box-shadow] duration-200 hover:bg-white hover:text-gray-950"
        aria-label="User menu"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white/95 shadow-[0_1px_2px_rgba(17,24,39,0.08),0_22px_48px_rgba(71,85,62,0.18)] ring-1 ring-gray-950/5 backdrop-blur-xl animate-fadeIn">
          {/* User Info Header */}
          {isAuthenticated && user && (
            <div className="border-b border-[#E7EBDF] bg-[#F5F7F1] px-4 py-3">
              <div className="truncate text-sm font-semibold text-gray-950">{user.email}</div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">


            {/* Your Library */}
            {isAuthenticated && (
              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>{t('profile')}</span>
              </NavLink>
            )}

            {/* Reading Challenge */}
            {isAuthenticated && (
              <NavLink
                to="/reading-challenge"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Reading Challenge</span>
              </NavLink>
            )}

            {/* Downloads */}
            {isAuthenticated && (
              <NavLink
                to="/downloads"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Downloads</span>
              </NavLink>
            )}

            {/* Feedback */}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setIsFeedbackModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>Send Feedback</span>
                </button>
                <NavLink
                  to="/feedback"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>View All Feedback</span>
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={menuItemClassName}
              >
                <div className={menuIconClassName}>
                  <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className={menuTextClassName}>Sign in to send feedback</span>
              </NavLink>
            )}

            {/* Divider */}
            <div className="my-2 border-t border-[#E7EBDF]"></div>

            {/* Sign Out */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 text-left transition-[background-color,color] duration-200 hover:bg-red-50 group"
              >
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 transition-colors duration-200 group-hover:bg-red-100">
                  <svg className="h-5 w-5 text-red-500 transition-colors duration-200 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-red-600">{t('logout')}</span>
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className={menuIconClassName}>
                    <svg className={menuIconSvgClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>{t('login')}</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuItemClassName}
                >
                  <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 transition-colors duration-200 group-hover:bg-orange-100">
                    <svg className="h-5 w-5 text-orange-500 transition-colors duration-200 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className={menuTextClassName}>{t('signup')}</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
};

export default UserMenu;
```

## LanguageSelector

- File: `components/LanguageSelector.tsx`
- Renders: Header language menu; currently hidden because only English is configured.

```tsx
import React, { useState } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  // Hide language selector if there's only one language
  if (languages.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-orange-400 transition-colors duration-300 px-3 py-2 rounded-md text-lg"
        aria-label={`Select language. Current: ${currentLang?.name}`}
      >
        <span className="transform hover:scale-110 transition-transform">{currentLang?.flag}</span>
        <svg 
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-lg hover:bg-gray-100 flex items-center justify-center ${
                currentLanguage === language.code ? 'bg-orange-50' : ''
              }`}
              aria-label={language.name}
            >
              <span className="transform hover:scale-110 transition-transform">
                {language.flag}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
```

## ScrollToTop

- File: `components/ScrollToTop.tsx`
- Renders: Route-change behavior component mounted immediately inside BrowserRouter.

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * whenever the route changes
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
```

## ProtectedRoute

- File: `components/ProtectedRoute.tsx`
- Renders: Authentication gate used by all private route entries.

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```


