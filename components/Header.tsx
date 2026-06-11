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
