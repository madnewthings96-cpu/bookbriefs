import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  Calculator,
  ChevronDown,
  Coffee,
  Compass,
  Download,
  FileText,
  LogOut,
  Menu,
  Newspaper,
  PenLine,
  Search,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BooksContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useReaderMode } from '../contexts/ReaderModeContext';
import { searchBooks, SearchResult } from '../services/searchService';
import {
  getActiveNavigationGroup,
  getNextNavigationMenu,
  isCompactHeader,
  NavigationGroupKey,
} from './headerNavigation';
import SearchResults from './SearchResults';
import UserMenu from './UserMenu';

type HeaderIcon = React.ComponentType<{ className?: string }>;

interface NavigationItem {
  to: string;
  label: string;
  description: string;
  icon: HeaderIcon;
}

interface NavigationGroup {
  number: string;
  label: string;
  eyebrow: string;
  headline: string;
  items: NavigationItem[];
  feature: {
    to: string;
    title: string;
    author: string;
    insight: string;
    image: string;
  };
}

const menuTransition = { type: 'spring' as const, duration: 0.36, bounce: 0 };

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<NavigationGroupKey | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuTriggerRefs = useRef<Partial<Record<NavigationGroupKey, HTMLButtonElement | null>>>({});
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, logout } = useAuth();
  const { t, language } = useLanguage();
  const { isReaderMode } = useReaderMode();
  const { books } = useBooks();

  const navigationGroups = useMemo<Record<NavigationGroupKey, NavigationGroup>>(
    () => ({
      library: {
        number: '01',
        label: 'Library',
        eyebrow: 'Distilled knowledge',
        headline: 'Find the idea worth carrying forward.',
        items: [
          {
            to: '/summaries',
            label: t('summaries'),
            description: 'Browse the complete collection of concise, actionable book briefs.',
            icon: BookOpen,
          },
          {
            to: '/#reading-paths',
            label: 'Reading paths',
            description: 'Follow focused sequences for habits, wealth, psychology, and strategy.',
            icon: Compass,
          },
          {
            to: '/reading-challenge',
            label: '30-day challenge',
            description: 'Turn ten focused minutes into a learning habit that compounds.',
            icon: Target,
          },
          {
            to: '/downloads',
            label: 'Downloads & guides',
            description: 'Keep printable briefs, checklists, and visual cheat sheets close.',
            icon: Download,
          },
        ],
        feature: {
          to: '/summary/atomic-habits',
          title: 'Atomic Habits',
          author: 'James Clear',
          insight: 'Small changes become remarkable results when the system is built to last.',
          image: '/images/atomic-habits.jpg',
        },
      },
      tools: {
        number: '02',
        label: 'Tools',
        eyebrow: 'Ideas in practice',
        headline: 'Turn useful thinking into measurable action.',
        items: [
          {
            to: '/calculators',
            label: t('calculators'),
            description: 'Model compound growth, FIRE targets, position size, and pip value.',
            icon: Calculator,
          },
          {
            to: '/finance-tracker',
            label: 'Finance tracker',
            description: 'See your net worth, income, and financial runway in one place.',
            icon: BarChart3,
          },
          {
            to: '/trading-journal',
            label: 'Trading journal',
            description: 'Review decisions, risk, and emotional discipline across every trade.',
            icon: PenLine,
          },
        ],
        feature: {
          to: '/calculators/compound-interest',
          title: 'The Psychology of Money',
          author: 'Morgan Housel',
          insight: 'Compounding works best when patience has enough room to do the heavy lifting.',
          image: '/images/the psychology of money.jpg',
        },
      },
      learn: {
        number: '03',
        label: 'Learn',
        eyebrow: 'Beyond the brief',
        headline: 'Connect books to the world around you.',
        items: [
          {
            to: '/blog',
            label: 'Essays & blog',
            description: 'Explore practical essays that connect ideas across books and life.',
            icon: FileText,
          },
          {
            to: '/news',
            label: 'Market & news',
            description: 'Scan the global and market shifts that deserve your attention.',
            icon: Newspaper,
          },
          {
            to: '/about',
            label: t('about'),
            description: 'Read why Ta7leel values clarity, signal, and ideas you can use.',
            icon: Bookmark,
          },
        ],
        feature: {
          to: '/about',
          title: 'The Ta7leel philosophy',
          author: 'Our editorial standard',
          insight: 'Clarity over volume. Depth without noise. One useful idea at a time.',
          image: '/images/reading.jpg',
        },
      },
    }),
    [t],
  );

  const activeRouteGroup = getActiveNavigationGroup(location.pathname);
  const activeMenu = activeMegaMenu ? navigationGroups[activeMegaMenu] : null;

  const closeSearch = useCallback((restoreFocus = false) => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    desktopSearchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();

    if (restoreFocus && window.matchMedia('(min-width: 1024px)').matches) {
      window.requestAnimationFrame(() => desktopSearchTriggerRef.current?.focus());
    }
  }, []);

  const closeMenus = useCallback(() => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setActiveMegaMenu(null);

    if (window.matchMedia('(min-width: 1024px)').matches) {
      setIsSearchExpanded(true);
      window.requestAnimationFrame(() => desktopSearchInputRef.current?.focus());
      return;
    }

    setIsMenuOpen(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
    });
  }, []);

  const handleSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const query = searchQuery.trim();
      if (!query) return;

      const results = searchBooks(query, language, books);
      if (results.length > 0) {
        navigate(results[0].path);
        closeSearch();
        closeMenus();
      }
    },
    [books, closeMenus, closeSearch, language, navigate, searchQuery],
  );

  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
      setIsSearching(true);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(() => {
        setSearchResults(query.trim() ? searchBooks(query, language, books) : []);
        setIsSearching(false);
      }, 150);
    },
    [books, language],
  );

  const clearMenuCloseTimer = useCallback(() => {
    if (menuCloseTimeoutRef.current) clearTimeout(menuCloseTimeoutRef.current);
  }, []);

  const scheduleMenuClose = useCallback(() => {
    clearMenuCloseTimer();
    menuCloseTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 140);
  }, [clearMenuCloseTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }

      if (event.key === 'Escape') {
        const megaMenuTrigger = activeMegaMenu ? megaMenuTriggerRefs.current[activeMegaMenu] : null;
        setActiveMegaMenu(null);
        setIsMenuOpen(false);
        if (isSearchExpanded || isSearchFocused) {
          closeSearch(true);
        } else if (megaMenuTrigger) {
          window.requestAnimationFrame(() => megaMenuTrigger.focus());
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeMegaMenu, closeSearch, isSearchExpanded, isSearchFocused, openSearch]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(isCompactHeader(window.scrollY));
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenus();
    setIsSearchExpanded(false);
    setIsSearchFocused(false);
  }, [closeMenus, location.pathname, location.hash]);

  useEffect(() => {
    const encodedTarget = location.hash.replace(/^#/, '');
    if (!encodedTarget) return;

    let frameId = 0;
    let attempts = 0;
    let targetId = encodedTarget;

    try {
      targetId = decodeURIComponent(encodedTarget);
    } catch {
      // Use the literal hash when it is not valid URI-encoded text.
    }

    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        return;
      }

      attempts += 1;
      if (attempts < 30) frameId = window.requestAnimationFrame(scrollToTarget);
    };

    frameId = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname, prefersReducedMotion]);

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
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => mobileCloseButtonRef.current?.focus());

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !mobilePanelRef.current) return;

      const focusable = Array.from(
        mobilePanelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (menuCloseTimeoutRef.current) clearTimeout(menuCloseTimeoutRef.current);
    };
  }, []);

  const isNavigationGroupActive = (key: NavigationGroupKey) => {
    const isAllBooksRoute = location.pathname === '/summaries';
    return activeMegaMenu === key || (activeRouteGroup === key && !(key === 'library' && isAllBooksRoute));
  };

  const navButtonClassName = (key: NavigationGroupKey) => {
    const isActive = isNavigationGroupActive(key);
    return `group relative flex min-h-11 items-center gap-1.5 rounded-[14px] px-3.5 text-[13px] font-semibold tracking-[-0.01em] outline-none transition-[color,transform] duration-200 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] ${
      isActive ? 'text-[#123D2F]' : 'text-[#53675E] hover:-translate-y-px hover:text-[#123D2F]'
    }`;
  };

  const animationDuration = prefersReducedMotion ? 0.01 : undefined;

  return (
    <>
      <div className="h-[76px] sm:h-[84px]" aria-hidden="true" />

      <div
        className={`pointer-events-none fixed inset-x-0 z-[70] px-0 transition-[top,padding] duration-300 ease-out ${
          isScrolled ? 'top-3 px-3 sm:px-5' : 'top-0'
        }`}
      >
        <header
          ref={headerRef}
          data-testid="reading-ribbon"
          data-compact={isScrolled ? 'true' : 'false'}
          className={`reading-ribbon-grain pointer-events-auto relative mx-auto text-[#123D2F] transition-[max-width,min-height,border-radius,background-color,box-shadow] duration-300 ease-out ${
            isScrolled
              ? 'min-h-[60px] max-w-[1180px] rounded-[24px] bg-[#FBF8F1]/[0.94] shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_2px_4px_rgba(9,37,28,0.04),0_18px_48px_rgba(9,37,28,0.14)] backdrop-blur-2xl'
              : 'min-h-[76px] max-w-[1440px] rounded-none bg-[#FBF8F1] shadow-[0_1px_0_rgba(18,61,47,0.09),0_10px_28px_rgba(9,37,28,0.03)] sm:min-h-[84px]'
          }`}
          onMouseEnter={clearMenuCloseTimer}
          onMouseLeave={scheduleMenuClose}
        >
          <div
            className={`relative z-10 flex items-center justify-between transition-[height,padding] duration-300 ease-out ${
              isScrolled ? 'h-[60px] px-2.5 sm:px-3.5' : 'h-[76px] px-4 sm:h-[84px] sm:px-7 lg:px-9'
            }`}
          >
            <Link
              to="/"
              className="group flex min-h-11 shrink-0 items-center rounded-[16px] outline-none transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
              onClick={closeMenus}
              aria-label="Ta7leel home"
            >
              <img
                src="/images/ta7leel-navbar-logo-mind-leaf.png"
                alt=""
                className={`w-auto object-contain transition-[height,filter,transform] duration-300 ease-out group-hover:scale-[1.025] group-hover:drop-shadow-[0_5px_8px_rgba(9,37,28,0.12)] ${
                  isScrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-11'
                }`}
              />
            </Link>

            {!isReaderMode && !isSearchExpanded && (
              <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex" aria-label="Primary navigation">
                {(Object.keys(navigationGroups) as NavigationGroupKey[]).map((key) => {
                  const isActive = isNavigationGroupActive(key);
                  return (
                    <button
                      ref={(element) => {
                        megaMenuTriggerRefs.current[key] = element;
                      }}
                      id={`nav-trigger-${key}`}
                      key={key}
                      type="button"
                      className={navButtonClassName(key)}
                      onMouseEnter={() => {
                        closeSearch();
                        setActiveMegaMenu(key);
                      }}
                      onClick={() => {
                        closeSearch();
                        setActiveMegaMenu((current) => getNextNavigationMenu(current, key));
                      }}
                      aria-haspopup="true"
                      aria-expanded={activeMegaMenu === key}
                      aria-controls="desktop-mega-menu"
                    >
                      <span>{navigationGroups[key].label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-[transform,color] duration-200 ${
                          activeMegaMenu === key ? 'rotate-180 text-[#C49552]' : 'text-[#8A998F]'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`reading-ribbon-marker absolute bottom-0 left-1/2 h-2.5 w-4 -translate-x-1/2 bg-[#C49552] transition-[opacity,transform] duration-200 ${
                          isActive ? 'translate-y-1 opacity-100' : 'translate-y-2 opacity-0'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}

                <NavLink
                  to="/summaries"
                  end
                  className={({ isActive }) =>
                    `group relative flex min-h-11 items-center rounded-[14px] px-3.5 text-[13px] font-semibold tracking-[-0.01em] outline-none transition-[color,transform] duration-200 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] ${
                      isActive
                        ? 'text-[#123D2F]'
                        : 'text-[#53675E] hover:-translate-y-px hover:text-[#123D2F]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      All books
                      <span
                        className={`reading-ribbon-marker absolute bottom-0 left-1/2 h-2.5 w-4 -translate-x-1/2 bg-[#C49552] transition-[opacity,transform] duration-200 ${
                          isActive ? 'translate-y-1 opacity-100' : 'translate-y-2 opacity-0'
                        }`}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </NavLink>
              </nav>
            )}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="relative hidden lg:block">
                {isSearchExpanded ? (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                    onSubmit={handleSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSearchFocused(false);
                    }}
                  >
                    <div className="relative w-56 xl:w-64">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718178]" aria-hidden="true" />
                      <input
                        ref={desktopSearchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchInput}
                        placeholder="Search the library"
                        className="h-11 w-full rounded-[16px] bg-white/80 py-2 pl-10 pr-10 text-[13px] font-medium text-[#09251C] shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_2px_5px_rgba(9,37,28,0.05)] outline-none placeholder:text-[#596C62] focus:shadow-[0_0_0_2px_rgba(196,149,82,0.55),0_5px_14px_rgba(9,37,28,0.08)]"
                        aria-label="Search the Ta7leel library"
                      />
                      <button
                        type="button"
                        onClick={() => closeSearch(true)}
                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#718178] transition-[background-color,color,transform] duration-150 hover:bg-[#EAE3D6] hover:text-[#123D2F] active:scale-[0.96]"
                        aria-label="Close search"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {isSearchFocused && searchQuery.trim() !== '' && (
                        <SearchResults
                          results={searchResults}
                          onClose={closeSearch}
                          isVisible
                          isLoading={isSearching}
                        />
                      )}
                    </div>
                  </motion.form>
                ) : (
                  <button
                    ref={desktopSearchTriggerRef}
                    type="button"
                    onClick={openSearch}
                    className="group flex h-11 items-center gap-2 rounded-[16px] px-3 text-[#53675E] outline-none transition-[background-color,color,transform] duration-150 hover:bg-[#F0EADF] hover:text-[#123D2F] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
                    aria-label="Search summaries"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden text-xs font-semibold xl:inline">Search</span>
                    <kbd className="hidden rounded-md bg-white/75 px-1.5 py-1 font-sans text-[9px] font-bold tracking-wide text-[#53675E] shadow-[0_0_0_1px_rgba(18,61,47,0.09)] xl:inline">
                      ⌘K
                    </kbd>
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <NavLink
                  to="/login"
                  className="hidden min-h-11 items-center rounded-[14px] px-2.5 text-xs font-semibold text-[#53675E] outline-none transition-[color,transform] duration-150 hover:text-[#123D2F] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] lg:flex"
                >
                  {t('login')}
                </NavLink>
              )}

              <Link
                to="/summaries"
                className="group relative hidden h-11 items-center gap-2 overflow-hidden rounded-[16px] bg-[#123D2F] pl-4 pr-3.5 text-xs font-bold text-[#FBF8F1] shadow-[0_1px_2px_rgba(9,37,28,0.12),0_8px_20px_rgba(9,37,28,0.16)] outline-none transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-[#0D3327] hover:shadow-[0_1px_2px_rgba(9,37,28,0.14),0_12px_26px_rgba(9,37,28,0.22)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1] sm:flex"
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-[#C49552]" aria-hidden="true" />
                <span>Explore library</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>

              {isAuthenticated && (
                <div className="hidden lg:block">
                  <UserMenu />
                </div>
              )}

              <button
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => {
                  setActiveMegaMenu(null);
                  setIsMenuOpen((current) => !current);
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#F0EADF] text-[#123D2F] shadow-[0_0_0_1px_rgba(18,61,47,0.07)] outline-none transition-[background-color,transform] duration-150 hover:bg-[#E8DFD0] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] lg:hidden"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
              >
                <span
                  className={`absolute flex items-center justify-center transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    isMenuOpen ? 'scale-100 opacity-100 blur-0' : 'scale-[0.25] opacity-0 blur-[4px]'
                  }`}
                >
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span
                  className={`flex items-center justify-center transition-[opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
                    isMenuOpen ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0'
                  }`}
                >
                  <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {activeMenu && !isReaderMode ? (
              <motion.div
                id="desktop-mega-menu"
                role="region"
                aria-labelledby={`nav-trigger-${activeMegaMenu}`}
                initial={{ opacity: 0, y: -10, scale: 0.985, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, scale: 0.99, filter: 'blur(4px)' }}
                style={{ x: '-50%' }}
                transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                className="absolute left-1/2 top-[calc(100%+10px)] hidden w-[min(1020px,calc(100vw-32px))] overflow-hidden rounded-[28px] bg-[#FBF8F1] p-2 text-[#123D2F] shadow-[0_0_0_1px_rgba(18,61,47,0.11),0_2px_5px_rgba(9,37,28,0.05),0_28px_70px_rgba(9,37,28,0.18)] lg:block"
                onMouseEnter={clearMenuCloseTimer}
                onMouseLeave={scheduleMenuClose}
              >
                <div className="grid grid-cols-[1.45fr_0.75fr] gap-2">
                  <div className="rounded-[20px] bg-[#F1EBDD] p-6">
                    <div className="mb-5 flex items-end justify-between gap-6 border-b border-[#123D2F]/10 pb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#715B38]">
                          Index {activeMenu.number} · {activeMenu.eyebrow}
                        </p>
                        <p className="mt-2 max-w-md font-['Bricolage_Grotesque'] text-[22px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#09251C]">
                          {activeMenu.headline}
                        </p>
                      </div>
                      <span className="shrink-0 font-serif text-sm italic text-[#53675E]">Choose a direction</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {activeMenu.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeMenus}
                            className="group flex min-h-[86px] gap-3 rounded-[16px] p-3 outline-none transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:bg-[#FBF8F1] hover:shadow-[0_0_0_1px_rgba(18,61,47,0.07),0_5px_12px_rgba(9,37,28,0.06)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#DDE7DF] text-[#1E5A45] shadow-[inset_0_0_0_1px_rgba(18,61,47,0.06)] transition-[background-color,color,transform] duration-200 group-hover:-rotate-2 group-hover:bg-[#123D2F] group-hover:text-[#FBF8F1]">
                              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 pt-0.5">
                              <span className="block text-[13px] font-bold tracking-[-0.015em] text-[#123D2F]">{item.label}</span>
                              <span className="mt-1 block text-pretty text-[11px] leading-[1.5] text-[#53675E]">{item.description}</span>
                            </span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    to={activeMenu.feature.to}
                    onClick={closeMenus}
                    className="group relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#123D2F] p-5 text-[#FBF8F1] outline-none transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-[#0D3327] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F1]"
                  >
                    <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#C49552]/20 blur-3xl" aria-hidden="true" />
                    <div className="relative flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E3BE7D]">From the shelves</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </div>

                    <div className="relative my-5 flex items-center gap-4">
                      <img
                        src={activeMenu.feature.image}
                        alt=""
                        className="h-28 w-[76px] shrink-0 rounded-[10px] object-cover shadow-[0_14px_28px_rgba(0,0,0,0.28)] outline outline-1 -outline-offset-1 outline-white/10 transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-['Bricolage_Grotesque'] text-lg font-semibold leading-tight tracking-[-0.035em]">{activeMenu.feature.title}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C7D2CB]">{activeMenu.feature.author}</p>
                      </div>
                    </div>

                    <blockquote className="relative border-t border-[#FBF8F1]/15 pt-4 font-serif text-[15px] italic leading-[1.45] text-[#F3E9D8]">
                      “{activeMenu.feature.insight}”
                    </blockquote>
                  </Link>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </header>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen ? (
          <motion.aside
            ref={mobilePanelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
            className="reading-ribbon-grain fixed inset-0 z-[90] flex flex-col overflow-hidden bg-[#FBF8F1] text-[#123D2F] lg:hidden"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#123D2F]/10 px-4 sm:h-[84px] sm:px-6">
              <Link
                to="/"
                className="group flex min-h-11 items-center rounded-[16px] outline-none transition-transform duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
                onClick={closeMenus}
                aria-label="Ta7leel home"
              >
                <img
                  src="/images/ta7leel-navbar-logo-mind-leaf.png"
                  alt=""
                  className="h-10 w-auto object-contain transition-[filter,transform] duration-200 group-hover:scale-[1.025] group-hover:drop-shadow-[0_5px_8px_rgba(9,37,28,0.12)] sm:h-11"
                />
              </Link>

              <button
                ref={mobileCloseButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#F0EADF] text-[#123D2F] outline-none transition-[background-color,transform] duration-150 hover:bg-[#E8DFD0] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552]"
                aria-label="Close menu"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#123D2F] px-4 pb-10 pt-5 text-[#FBF8F1] sm:px-6">
              <motion.div
                initial="closed"
                animate="open"
                variants={{
                  closed: {},
                  open: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 } },
                }}
                className="mx-auto max-w-2xl"
              >
                <motion.form
                  variants={{
                    closed: { opacity: 0, y: 10, filter: 'blur(4px)' },
                    open: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                  onSubmit={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSearchFocused(false);
                  }}
                  className={`relative z-20 transition-[margin] duration-200 ${
                    isSearchFocused && searchQuery.trim() !== '' ? 'mb-[7.25rem]' : 'mb-7'
                  }`}
                >
                  <Search className="pointer-events-none absolute left-4 top-[22px] h-[18px] w-[18px] -translate-y-1/2 text-[#718178]" aria-hidden="true" />
                  <input
                    ref={mobileSearchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search books, authors, or ideas"
                    className="h-11 w-full rounded-[16px] bg-white py-2 pl-11 pr-4 text-sm font-medium text-[#09251C] shadow-[0_0_0_1px_rgba(18,61,47,0.10),0_3px_10px_rgba(9,37,28,0.05)] outline-none placeholder:text-[#596C62] focus:shadow-[0_0_0_2px_rgba(196,149,82,0.55),0_5px_14px_rgba(9,37,28,0.08)]"
                    aria-label="Search the Ta7leel library"
                  />
                  {isSearchFocused && searchQuery.trim() !== '' && (
                    <SearchResults
                      results={searchResults}
                      onClose={() => {
                        closeSearch();
                        closeMenus();
                      }}
                      isVisible
                      isLoading={isSearching}
                    />
                  )}
                </motion.form>

                <div className="grid gap-7 sm:grid-cols-3 sm:gap-4">
                  {(Object.keys(navigationGroups) as NavigationGroupKey[]).map((key) => {
                    const group = navigationGroups[key];
                    return (
                      <motion.section
                        key={key}
                        variants={{
                          closed: { opacity: 0, y: 12, filter: 'blur(4px)' },
                          open: { opacity: 1, y: 0, filter: 'blur(0px)' },
                        }}
                        transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                        aria-labelledby={`mobile-group-${key}`}
                      >
                        <div className="mb-2.5 flex items-center gap-2 border-b border-[#FBF8F1]/15 pb-2">
                          <span className="font-serif text-xs italic text-[#E3BE7D]">{group.number}</span>
                          <h2 id={`mobile-group-${key}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CAD8D0]">
                            {group.label}
                          </h2>
                        </div>
                        <nav className="grid gap-1" aria-label={`${group.label} navigation`}>
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={closeMenus}
                                className={({ isActive }) =>
                                  `group flex min-h-12 items-center gap-3 rounded-[16px] px-3 py-2 text-sm font-semibold outline-none transition-[background-color,color,transform] duration-150 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#C49552] ${
                                    isActive
                                      ? 'bg-[#FBF8F1]/14 text-[#FBF8F1] shadow-[inset_0_0_0_1px_rgba(251,248,241,0.08)]'
                                      : 'text-[#D9E3DD] hover:bg-[#FBF8F1]/10 hover:text-white'
                                  }`
                                }
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#FBF8F1]/10 text-[#E3BE7D] shadow-[inset_0_0_0_1px_rgba(251,248,241,0.08)] transition-[background-color,color,transform] duration-150 group-hover:-rotate-2 group-hover:bg-[#FBF8F1] group-hover:text-[#123D2F]">
                                  <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </nav>
                      </motion.section>
                    );
                  })}
                </div>

                <motion.div
                  variants={{
                    closed: { opacity: 0, y: 12, filter: 'blur(4px)' },
                    open: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                  className="mt-8 rounded-[24px] bg-[#09291F] p-2 shadow-[0_14px_34px_rgba(4,18,13,0.24)] ring-1 ring-inset ring-[#FBF8F1]/10"
                >
                  <div className="flex flex-col gap-2 rounded-[16px] border border-[#FBF8F1]/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="px-1 py-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E3BE7D]">Your next ten minutes</p>
                      <p className="mt-1 font-['Bricolage_Grotesque'] text-lg font-semibold tracking-[-0.035em] text-[#FBF8F1]">Carry one useful idea forward.</p>
                    </div>
                    <Link
                      to="/summaries"
                      onClick={closeMenus}
                      className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#FBF8F1] pl-4 pr-3.5 text-xs font-bold text-[#123D2F] outline-none transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#E3BE7D]"
                    >
                      Explore library
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div
                  variants={{
                    closed: { opacity: 0, y: 12, filter: 'blur(4px)' },
                    open: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ ...menuTransition, duration: animationDuration ?? menuTransition.duration }}
                  className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1"
                >
                  <div className="flex items-center gap-1">
                    {isAuthenticated ? (
                      <>
                        <NavLink
                          to="/profile"
                          onClick={closeMenus}
                          className="flex min-h-11 items-center rounded-[14px] px-3 text-xs font-semibold text-[#D4E0D8] outline-none transition-[background-color,color,transform] duration-150 hover:bg-[#FBF8F1]/10 hover:text-white active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#E3BE7D]"
                        >
                          My profile
                        </NavLink>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            closeMenus();
                          }}
                          className="flex min-h-11 items-center gap-1.5 rounded-[14px] px-3 text-xs font-semibold text-[#F5B7AA] outline-none transition-[background-color,transform] duration-150 hover:bg-[#F5B7AA]/10 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#F5B7AA]"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          {t('logout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <NavLink
                          to="/login"
                          onClick={closeMenus}
                          className="flex min-h-11 items-center rounded-[14px] px-3 text-xs font-semibold text-[#D4E0D8] outline-none transition-[background-color,color,transform] duration-150 hover:bg-[#FBF8F1]/10 hover:text-white active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#E3BE7D]"
                        >
                          {t('login')}
                        </NavLink>
                        <NavLink
                          to="/signup"
                          onClick={closeMenus}
                          className="flex min-h-11 items-center rounded-[14px] px-3 text-xs font-semibold text-[#FBF8F1] outline-none transition-[background-color,transform] duration-150 hover:bg-[#FBF8F1]/10 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#E3BE7D]"
                        >
                          {t('signup')}
                        </NavLink>
                      </>
                    )}
                  </div>
                  <a
                    href="https://ko-fi.com/ta7leel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-[14px] px-3 text-xs font-semibold text-[#D4E0D8] outline-none transition-[background-color,color,transform] duration-150 hover:bg-[#FBF8F1]/10 hover:text-white active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#E3BE7D]"
                  >
                    <Coffee className="h-4 w-4 text-[#9A6D35]" aria-hidden="true" />
                    Support Ta7leel
                  </a>
                </motion.div>
              </motion.div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default Header;
