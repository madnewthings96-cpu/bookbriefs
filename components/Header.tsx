
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';
import { useBooks } from '../contexts/BooksContext';
import LanguageSelector from './LanguageSelector';
import SearchResults from './SearchResults';
import UserMenu from './UserMenu';
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
  const { books } = useBooks();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchBooks(searchQuery, language, books);
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
        const results = searchBooks(query, language, books);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);
  }, [language, books]);

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
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);

        // Toggle scrolled class on body for reader mode
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
  }, [isScrolled, isReaderMode]);

  const linkStyle = "text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 text-xs font-medium relative group";
  const activeLinkStyle = {
    color: '#FFFFFF',
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isReaderMode
          ? 'bg-white/90 shadow-sm backdrop-blur-sm'
          : isScrolled
            ? 'backdrop-blur-xl border-b border-white/10'
            : 'border-b border-white/10'
        } ${isReaderMode && isScrolled ? 'py-2' : 'py-0'
        }`}
      style={!isReaderMode ? {
        background: isScrolled
          ? 'rgba(0, 0, 0, 0.8)'
          : 'rgba(0, 0, 0, 0.95)',
        boxShadow: isScrolled
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
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
                <span className={`text-2xl font-bold ${isReaderMode ? 'text-gray-900 dark:text-white' : 'text-white'
                  } logo-text`}>
                </span>
              </NavLink>
            </div>

            {/* Buy me a coffee button */}
            <div className="hidden sm:flex ml-4">
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${isReaderMode
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                  }`}
                aria-label="Buy me a coffee"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
                </svg>
                <span className="hidden md:inline">Buy me a coffee</span>
                <span className="md:hidden">☕</span>
              </a>
            </div>
            <div className="hidden md:block">
              <nav className="ml-10 flex items-center space-x-1">
                <NavLink to="/summaries" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  {t('summaries')}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                <NavLink to="/blog" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  Blog
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                <NavLink to="/chat" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  AI Chat
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                <NavLink to="/calculators" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  {t('calculators')}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                <NavLink to="/news" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  News
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                <NavLink to="/finance-tracker" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  💰 Tracker
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink>
                {/* <NavLink to="/merch" className={linkStyle} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                  Merch
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </NavLink> */}
              </nav>
            </div>
          </div>

          <div className="flex items-center flex-1 justify-center px-4">
            <div className="relative">
              {/* Search Toggle Button */}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200 ${isReaderMode
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                    : 'hover:bg-white/10 text-gray-400 hover:text-white'
                  } ${isSearchExpanded ? 'bg-white/10 text-white' : ''}`}
                aria-label="Toggle search"
              >
                {isSearchExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>

              {/* Expandable Search Form - Now expands downward */}
              <form
                onSubmit={handleSearch}
                className={`absolute top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out z-50 ${isSearchExpanded
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none -translate-y-2'
                  }`}
              >
                <div className="relative w-80">
                  {/* Search input with enhanced styling for dropdown */}
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
                    placeholder={t('Search') || 'Search books...'}
                    className={`w-full pl-10 pr-12 py-2.5 rounded-lg border transition-all duration-200 ${isReaderMode
                        ? 'border-gray-200 focus:border-orange-400 bg-white text-gray-900 placeholder-gray-500'
                        : 'border-white/10 focus:border-white/20 bg-white/5 text-white placeholder-gray-400'
                      } focus:outline-none focus:ring-1 focus:ring-white/20 shadow-lg backdrop-blur-sm
                    text-sm`}
                  />

                  {/* Search icon inside input */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className={`w-4 h-4 ${isReaderMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Close button inside search */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchFocused(false);
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center
                      ${isReaderMode ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-400 hover:text-white hover:bg-white/10'}
                      transition-colors duration-200`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  {/* Keyboard shortcut hint - positioned better for dropdown */}
                  {isSearchFocused && !searchQuery && (
                    <div className={`absolute right-14 top-1/2 transform -translate-y-1/2 text-xs
                      ${isReaderMode ? 'text-gray-400' : 'text-gray-500'} pointer-events-none`}>
                      <kbd className={`px-2 py-1 text-xs font-semibold rounded 
                        ${isReaderMode ? 'text-gray-600 bg-gray-100 border border-gray-200' : 'text-gray-300 bg-gray-700 border border-gray-600'}`}>
                        Esc
                      </kbd>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center">
                <LanguageSelector />
              </div>
              {!isAuthenticated && (
                <>
                  <NavLink to="/login" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium">
                    {t('login')}
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="text-white font-medium py-2 px-5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                  >
                    {t('signup')}
                  </NavLink>
                </>
              )}
              <UserMenu />
            </div>
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 focus:outline-none transition-all duration-200"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10" id="mobile-menu">
          <div className="px-4 pt-2 pb-3 space-y-1">
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
                    placeholder={t('searchPlaceholder') || 'Search'}
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
            <NavLink to="/summaries" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Summaries</NavLink>
            <NavLink to="/blog" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Blog</NavLink>
            <NavLink to="/chat" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>AI Chat</NavLink>
            <NavLink to="/calculators" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Calculators</NavLink>
            <NavLink to="/news" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>News</NavLink>
            <NavLink to="/finance-tracker" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>💰 Tracker</NavLink>
            {/* Buy me a coffee button for mobile */}
            <div className="mt-4 px-2">
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
                </svg>
                Buy me a coffee ☕
              </a>
            </div>

            <div className="border-t border-white/10 mt-3 pt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 block px-3 py-2 text-sm">Welcome!</span>
                  <NavLink to="/profile" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                  <NavLink to="/reading-challenge" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Reading Challenge</NavLink>
                  <NavLink to="/downloads" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Downloads</NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Log In</NavLink>
                  <NavLink to="/signup" className="text-gray-300 hover:bg-white/5 hover:text-white block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
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
