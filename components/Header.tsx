
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

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `relative group inline-flex min-h-10 items-center rounded-full px-3 py-2 text-xs font-semibold transition-[transform,background-color,color,box-shadow] duration-200 ${
      isActive
        ? 'bg-white/75 text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_20px_rgba(71,85,62,0.10)]'
        : 'text-gray-700 hover:bg-white/50 hover:text-gray-950'
    }`;

  const mobileLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.96] ${
      isActive
        ? 'bg-white/80 text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_20px_rgba(71,85,62,0.10)]'
        : 'text-gray-700 hover:bg-white/55 hover:text-gray-950'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-[padding,box-shadow,background-color,border-color,backdrop-filter] duration-300 ${isReaderMode
        ? 'border-gray-200/70 bg-white/90 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.06)]'
        : isScrolled
          ? 'border-white/70 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.05),0_14px_36px_rgba(71,85,62,0.12)]'
          : 'border-[#dfe5d6]/80 bg-[#E7EBDF] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(71,85,62,0.08)]'
        } ${isReaderMode && isScrolled ? 'py-2' : 'py-0'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="group flex min-h-10 items-center rounded-2xl pr-2 transition-transform duration-200 active:scale-[0.96]">
                <span className="mr-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ccd5ae] shadow-[inset_0_0_0_1px_rgba(71,85,62,0.16),0_1px_2px_rgba(17,24,39,0.08),0_10px_22px_rgba(120,133,94,0.18)] transition-transform duration-200 group-hover:-translate-y-0.5">
                  <img
                    src="/images/logo-white.png"
                    alt="BookBriefs Logo"
                    className="h-7 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textElement = e.currentTarget.parentElement?.nextElementSibling as HTMLElement | null;
                      if (textElement) textElement.style.display = 'block';
                    }}
                  />
                </span>
                <span className="hidden text-sm font-bold text-gray-950 logo-text sm:block">
                </span>
              </NavLink>
            </div>

            {/* Buy me a coffee button */}
            <div className="hidden sm:flex ml-4">
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable flex min-h-10 items-center rounded-xl bg-[#ccd5ae] px-3 py-2 text-sm font-bold text-gray-950 shadow-[0_1px_2px_rgba(71,85,62,0.10),0_10px_22px_rgba(120,133,94,0.20)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#bdc89f] hover:shadow-[0_1px_2px_rgba(71,85,62,0.10),0_14px_30px_rgba(120,133,94,0.24)]"
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
                <NavLink to="/summaries" className={navLinkClassName}>
                  {t('summaries')}
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>
                <NavLink to="/blog" className={navLinkClassName}>
                  Blog
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>

                <NavLink to="/calculators" className={navLinkClassName}>
                  {t('calculators')}
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>
                <NavLink to="/news" className={navLinkClassName}>
                  News
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>
                <NavLink to="/finance-tracker" className={navLinkClassName}>
                  💰 Tracker
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>
                <NavLink to="/trading-journal" className={navLinkClassName}>
                  Journal
                  <span className="absolute bottom-1.5 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-x-100"></span>
                </NavLink>
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
                className={`pressable flex h-10 w-10 items-center justify-center rounded-xl transition-[transform,background-color,color,box-shadow] duration-200 ${
                  isSearchExpanded
                    ? 'bg-white text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.05),0_8px_20px_rgba(71,85,62,0.10)]'
                    : 'bg-white/45 text-gray-600 hover:bg-white/70 hover:text-gray-950'
                }`}
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
                className={`absolute top-12 left-1/2 transform -translate-x-1/2 transition-[opacity,transform] duration-300 ease-in-out z-50 ${isSearchExpanded
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
                    className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-12 text-sm text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.08),0_18px_40px_rgba(71,85,62,0.18)] outline-none ring-1 ring-gray-950/5 placeholder:text-gray-400 transition-[box-shadow,background-color,color] duration-200 focus:ring-2 focus:ring-orange-400/45"
                  />

                  {/* Search icon inside input */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="pressable absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition-[transform,background-color,color] duration-200 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close search"
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
                    <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]">
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
                  <NavLink to="/login" className="inline-flex min-h-10 items-center rounded-full px-3 py-2 text-sm font-semibold text-gray-700 transition-[background-color,color] duration-200 hover:bg-white/50 hover:text-gray-950">
                    {t('login')}
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="pressable inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow-[0_1px_2px_rgba(127,29,29,0.12),0_12px_26px_rgba(249,115,22,0.28)] transition-[transform,box-shadow,background-color] duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-[0_1px_2px_rgba(127,29,29,0.12),0_16px_32px_rgba(249,115,22,0.34)]"
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
                className="pressable inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/55 text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)] transition-[transform,background-color,color,box-shadow] duration-200 hover:bg-white hover:text-gray-950 focus:outline-none"
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
        <div className="border-t border-[#d7ddce]/80 bg-[#E7EBDF] shadow-[0_14px_34px_rgba(71,85,62,0.14)] md:hidden" id="mobile-menu">
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
                    className="w-full rounded-2xl bg-white py-3 pl-10 pr-4 text-sm font-medium text-gray-950 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_12px_26px_rgba(71,85,62,0.12)] outline-none ring-1 ring-gray-950/5 placeholder:text-gray-400 transition-[box-shadow,background-color] duration-200 focus:ring-2 focus:ring-orange-400/45"
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
            <NavLink to="/summaries" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Summaries</NavLink>
            <NavLink to="/blog" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Blog</NavLink>

            <NavLink to="/calculators" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Calculators</NavLink>
            <NavLink to="/news" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>News</NavLink>
            <NavLink to="/finance-tracker" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>💰 Tracker</NavLink>
            <NavLink to="/trading-journal" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Journal</NavLink>
            {/* Buy me a coffee button for mobile */}
            <div className="mt-4 px-2">
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable flex w-full items-center justify-center rounded-xl bg-[#ccd5ae] px-4 py-3 text-sm font-bold text-gray-950 shadow-[0_1px_2px_rgba(71,85,62,0.10),0_10px_22px_rgba(120,133,94,0.20)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#bdc89f]"
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

            <div className="mt-3 space-y-1 border-t border-[#d7ddce]/90 pt-3">
              {isAuthenticated ? (
                <>
                  <span className="block px-3 py-2 text-sm font-semibold text-gray-600">Welcome!</span>
                  <NavLink to="/profile" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                  <NavLink to="/reading-challenge" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Reading Challenge</NavLink>
                  <NavLink to="/downloads" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Downloads</NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition-[background-color,color,transform] duration-200 hover:bg-white/55 hover:text-gray-950 active:scale-[0.96]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Log In</NavLink>
                  <NavLink to="/signup" className={mobileLinkClassName} onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
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
