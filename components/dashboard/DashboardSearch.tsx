import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooks } from '../../contexts/BooksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getBookSummaryHref } from '../readingRouteModel';
import {
  getDashboardSearchActiveIndex,
  getDashboardSearchSurfaceState,
  searchDashboardBooks,
} from './dashboardSearchModel';

const RESULTS_ID = 'dashboard-search-results';
const STATUS_ID = 'dashboard-search-status';

export default function DashboardSearch() {
  const {
    books,
    loading: booksLoading,
    error: booksError,
    refreshBooks,
  } = useBooks();
  const { getBookAuthor, getBookTitle } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => searchDashboardBooks(
    books.map(book => {
      const localizedTitle = getBookTitle(book.id);
      const localizedAuthor = getBookAuthor(book.id);
      return {
        ...book,
        localizedTitle: localizedTitle === book.id ? book.title : localizedTitle,
        localizedAuthor: localizedAuthor === book.id ? book.author : localizedAuthor,
      };
    }),
    query,
  ), [books, getBookAuthor, getBookTitle, query]);

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const clear = () => {
    setQuery('');
    close();
  };

  const selectResult = (index: number) => {
    const result = results[index];
    if (!result) return;
    navigate(getBookSummaryHref(result.book, 'dashboard'));
    clear();
  };

  useEffect(() => {
    clear();
  }, [location.key]);

  useEffect(() => {
    setActiveIndex(index => index >= 0 && index < results.length ? index : -1);
  }, [results.length]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (results.length) {
        setIsOpen(true);
        setActiveIndex(index => getDashboardSearchActiveIndex(index, results.length, 'next'));
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) {
        setIsOpen(true);
        setActiveIndex(index => getDashboardSearchActiveIndex(index, results.length, 'previous'));
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        selectResult(activeIndex);
      } else {
        setActiveIndex(-1);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      clear();
    }
  };

  const hasQuery = Boolean(query.trim());
  const searchState = getDashboardSearchSurfaceState({
    query,
    loading: booksLoading,
    error: booksError,
    hasResults: results.length > 0,
    hasCatalog: books.length > 0,
  });
  const hasStatus = isOpen && hasQuery && (
    booksLoading
    || Boolean(booksError)
    || (!booksLoading && !booksError && results.length === 0)
  );

  return (
    <div ref={containerRef} className="dashboard-search">
      <label className="dashboard-search-label" htmlFor="dashboard-book-search">Search book summaries</label>
      <div className="dashboard-search-input-wrap">
        <Search aria-hidden="true" size={18} />
        <input
          id="dashboard-book-search"
          type="search"
          role="combobox"
          value={query}
          placeholder="Search books, authors, or categories"
          aria-autocomplete="list"
          aria-expanded={isOpen && hasQuery}
          aria-controls={isOpen && hasQuery ? RESULTS_ID : undefined}
          aria-activedescendant={isOpen && hasQuery && activeIndex >= 0 && activeIndex < results.length ? `dashboard-search-result-${activeIndex}` : undefined}
          aria-describedby={hasStatus ? STATUS_ID : undefined}
          onChange={event => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => hasQuery && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {isOpen && hasQuery && booksLoading && (
        <p id={STATUS_ID} className="dashboard-search-empty" role="status" aria-live="polite">
          {books.length > 0 ? 'Refreshing book summaries…' : 'Loading book summaries…'}
        </p>
      )}
      {isOpen && hasQuery && booksError && (
        <div id={STATUS_ID} className="dashboard-search-empty" role="alert">
          <p>We couldn&apos;t load book summaries. Retry to search the catalog.</p>
          <button type="button" onClick={() => { void refreshBooks(); }}>Try again</button>
        </div>
      )}
      {isOpen && hasQuery && !results.length && (
        <p
          id={!booksLoading && !booksError && searchState === 'empty' ? STATUS_ID : undefined}
          className="dashboard-search-empty"
          role="status"
          aria-live="polite"
          hidden={booksLoading || Boolean(booksError)}
        >
          No matching book summaries.
        </p>
      )}
      {isOpen && hasQuery && (
        <ul id={RESULTS_ID} className="dashboard-search-results" role="listbox" aria-label="Book search results" aria-busy={booksLoading || undefined}>
          {results.map((result, index) => (
            <li
              key={result.book.id}
              id={`dashboard-search-result-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              className={`dashboard-search-option${activeIndex === index ? ' is-active' : ''}`}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => selectResult(index)}
            >
              <strong>{result.title}</strong>
              <span>{result.author} · {result.book.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
