
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';
import LanguageSelector from './LanguageSelector';
import SearchResults from './SearchResults';
import { searchBooks, SearchResult } from '../services/searchService';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { isReaderMode } = useReaderMode();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchBooks(searchQuery, language);
      if (results.length > 0) {
        navigate(results[0].path);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  }, [searchQuery, language, navigate]);

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        const results = searchBooks(query, language);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
  }, [language]);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchFocused) {
        e.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else if (e.key === 'Escape' && (isSearchFocused || isSearchExpanded)) {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isSearchFocused, isSearchExpanded]);

  // Handle scroll effect for header
  useEffect(() => {
    if (!isReaderMode) return;
    
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
        
        // Toggle scrolled class on body for reader mode
        if (scrolled) {
          document.body.classList.add('scrolled');
        } else {
          document.body.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled, isReaderMode]);

  const linkStyle = "text-white hover:text-orange-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkStyle = {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 127, 80, 0.2)',
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        isReaderMode 
          ? 'bg-white/90 shadow-sm' 
          : 'shadow-md'
      } ${
        isReaderMode && isScrolled ? 'py-2' : 'py-4'
      }`}
      style={!isReaderMode ? { 
        background: 'linear-gradient(to right, #2F4F4F, #1a2f2f)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      } : {}}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center">
                <img 
                  src="/images/logo-white.png" 
                  alt="BookBriefs Logo" 
                  className="h-8 w-auto mr-2"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    console.log('Logo failed to load from:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                    const textElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textElement) textElement.style.display = 'block';
                  }}
                  onLoad={() => console.log('Logo loaded successfully')}
                />
                <span className={`text-2xl font-bold ${
                  isReaderMode ? 'text-gray-900 dark:text-white' : 'text-white'
                } logo-text`}>
                  BookBriefs
                </span>
              </NavLink>
            </div>
            <div className="hidden md:block">
              <nav className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>{t('home')}</NavLink>
                <NavLink to="/summaries" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>{t('summaries')}</NavLink>
                <NavLink to="/blog" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Blog</NavLink>
                <NavLink to="/calculators" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>{t('calculators')}</NavLink>
                <NavLink to="/about" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>{t('about')}</NavLink>
                {isAuthenticated && (
                  <NavLink to="/profile" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>{t('profile')}</NavLink>
                )}
              </nav>
            </div>
          </div>

          <div className="flex items-center flex-1 justify-center px-4">
            <div className="relative flex items-center">
              {/* Search Toggle Button */}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isReaderMode 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800' 
                    : 'bg-slate-700/80 hover:bg-slate-600 text-gray-300 hover:text-white'
                } ${isSearchExpanded ? 'bg-orange-500 text-white hover:bg-orange-600' : ''} 
                shadow-sm hover:shadow-md transform hover:scale-105`}
                aria-label="Toggle search"
              >
                {isSearchExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>

              {/* Expandable Search Form */}
              <form 
                onSubmit={handleSearch} 
                className={`absolute left-0 transition-all duration-300 ease-in-out ${
                  isSearchExpanded 
                    ? 'w-80 opacity-100 pointer-events-auto' 
                    : 'w-10 opacity-0 pointer-events-none'
                }`}
              >
                <div className="relative ml-12">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => {
                      // Delay hiding results to allow for click handling
                      setTimeout(() => {
                        setIsSearchFocused(false);
                        setSearchResults([]);
                      }, 200);
                    }}
                    placeholder={t('searchPlaceholder') || 'Search book summaries...'}
                    className={`w-full pl-4 pr-12 py-3 rounded-xl border transition-all duration-300 ${
                      isReaderMode 
                        ? 'border-gray-200 focus:border-orange-400 bg-white/95 text-gray-900 placeholder-gray-500' 
                        : 'border-gray-600 focus:border-orange-400 bg-slate-800/95 text-white placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-lg backdrop-blur-sm
                    text-sm font-medium`}
                  />
                  
                  {/* Close button inside search */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchFocused(false);
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full 
                      ${isReaderMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-200'}
                      hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Search Results */}
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

                  {/* Keyboard shortcut hint */}
                  {isSearchFocused && !searchQuery && (
                    <div className={`absolute right-16 top-1/2 transform -translate-y-1/2 text-xs
                      ${isReaderMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`}>
                      <span className="hidden sm:inline">Press </span>
                      <kbd className={`px-2 py-1 text-xs font-semibold rounded 
                        ${isReaderMode ? 'text-gray-600 bg-gray-100 border border-gray-200' : 'text-gray-300 bg-gray-700 border border-gray-600'}`}>
                        /
                      </kbd>
                      <span className="hidden sm:inline"> to search</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="flex items-center">
             <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <LanguageSelector />
                    </div>
                    <span className="text-white text-sm">{t('welcome')}, {user?.name}!</span>
                    <button
                      onClick={logout}
                      className="text-white hover:text-orange-400 transition-colors duration-300 font-medium text-sm"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="text-white hover:text-orange-400 transition-colors duration-300 font-medium text-sm">
                        {t('login')}
                    </NavLink>
                    <NavLink
                        to="/signup"
                        className="text-white font-bold py-2 px-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 text-sm shadow-md hover:shadow-lg"
                    >
                        {t('signup')}
                    </NavLink>
                  </>
                )}
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="relative w-full">
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
                    placeholder={t('searchPlaceholder') || 'Search book summaries...'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-slate-800/95 text-white 
                      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400
                      shadow-lg backdrop-blur-sm text-sm font-medium transition-all duration-300"
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
                </div>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
            <NavLink to="/" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/summaries" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Summaries</NavLink>
            <NavLink to="/blog" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Blog</NavLink>
            <NavLink to="/calculators" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Calculators</NavLink>
            <NavLink to="/about" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>About</NavLink>
            {isAuthenticated && (
              <NavLink to="/profile" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
            )}
            <div className="border-t border-gray-700 mt-3 pt-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-300 block px-3 py-2 text-sm">Welcome, {user?.name}!</span>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Log In</NavLink>
                    <NavLink to="/signup" className="text-gray-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
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
