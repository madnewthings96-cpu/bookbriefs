import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooks } from '../../contexts/BooksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDashboardSearchActiveIndex, searchDashboardBooks } from './dashboardSearchModel';

const RESULTS_ID = 'dashboard-search-results';

export default function DashboardSearch() {
  const { books } = useBooks();
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
    navigate(`/dashboard/summary/${result.book.arabicSlug || result.book.id}`);
    clear();
  };

  useEffect(() => {
    clear();
  }, [location.key]);

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
    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectResult(activeIndex);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      clear();
    }
  };

  const hasQuery = Boolean(query.trim());

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
          aria-controls={RESULTS_ID}
          aria-activedescendant={activeIndex >= 0 && activeIndex < results.length ? `dashboard-search-result-${activeIndex}` : undefined}
          onChange={event => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => hasQuery && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {isOpen && hasQuery && (
        <ul id={RESULTS_ID} className="dashboard-search-results" role="listbox" aria-label="Book search results">
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
      {isOpen && hasQuery && !results.length && (
        <p className="dashboard-search-empty" role="status">No matching book summaries.</p>
      )}
    </div>
  );
}
