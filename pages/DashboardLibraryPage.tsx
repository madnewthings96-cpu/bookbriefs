import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../contexts/BooksContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import DashboardBookCard from '../components/dashboard/DashboardBookCard';
import {
  buildDashboardShelf,
  filterDashboardShelf,
  type DashboardLibraryFilter,
} from '../components/dashboard/dashboardOverviewModel';
import './DashboardPages.css';

const FILTERS: Array<{ value: DashboardLibraryFilter; label: string }> = [
  { value: 'all', label: 'All books' },
  { value: 'saved', label: 'Saved' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const emptyStateFor = (filter: DashboardLibraryFilter) => {
  if (filter === 'saved') {
    return {
      message: 'Save summaries you want to revisit, and they will appear here.',
      action: { label: 'Discover books', to: '/dashboard/discover' },
    };
  }

  if (filter === 'in-progress') {
    return {
      message: 'Start a summary to keep track of your current reading here.',
      action: { label: 'Clear filter' },
    };
  }

  if (filter === 'completed') {
    return {
      message: 'Completed summaries will appear here as your reading history grows.',
      action: { label: 'Clear filter' },
    };
  }

  return {
    message: 'Your saved and in-progress summaries will collect here.',
    action: { label: 'Discover books', to: '/dashboard/discover' },
  };
};

export default function DashboardLibraryPage() {
  const { books } = useBooks();
  const { favorites } = useFavorites();
  const { bookProgress } = useUserProgress();
  const [filter, setFilter] = useState<DashboardLibraryFilter>('all');

  const library = useMemo(() => buildDashboardShelf(books, favorites, bookProgress), [books, favorites, bookProgress]);
  const visibleItems = useMemo(() => filterDashboardShelf(library, filter), [filter, library]);
  const emptyState = emptyStateFor(filter);
  const countLabel = `${visibleItems.length} ${visibleItems.length === 1 ? 'book' : 'books'} shown`;

  return (
    <section className="dashboard-page dashboard-workspace-page dashboard-library-page">
      <header className="dashboard-workspace-intro">
        <p className="dashboard-page-eyebrow">Reading library</p>
        <h1>Your library</h1>
        <p>Keep saved summaries, current reads, and completed books in one calm place.</p>
      </header>

      <fieldset className="dashboard-filter-group">
        <legend>Filter your library</legend>
        <div className="dashboard-segmented-control">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? 'is-selected' : undefined}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="dashboard-result-count" aria-live="polite">{countLabel}</p>

      {visibleItems.length > 0 ? (
        <div className="dashboard-book-grid dashboard-book-grid--library" aria-label="Library books">
          {visibleItems.map((item) => <DashboardBookCard key={item.book.id} item={item} />)}
        </div>
      ) : (
        <section className="dashboard-empty-state dashboard-workspace-empty" aria-labelledby="library-empty-heading">
          <h2 id="library-empty-heading">No books here yet</h2>
          <p>{emptyState.message}</p>
          {emptyState.action.to ? (
            <Link className="dashboard-empty-action" to={emptyState.action.to}>{emptyState.action.label}</Link>
          ) : (
            <button className="dashboard-empty-action" type="button" onClick={() => setFilter('all')}>
              {emptyState.action.label}
            </button>
          )}
        </section>
      )}
    </section>
  );
}
