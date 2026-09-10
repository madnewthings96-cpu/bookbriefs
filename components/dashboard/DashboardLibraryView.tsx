import { Link } from 'react-router-dom';
import DashboardBookCard from './DashboardBookCard';
import {
  buildCatalogSurfaceState,
  type CatalogSurfaceState,
} from './catalogStateModel';
import type { DashboardLibraryFilter, DashboardShelfBook } from './dashboardOverviewModel';

export const DASHBOARD_LIBRARY_FILTERS: Array<{ value: DashboardLibraryFilter; label: string }> = [
  { value: 'all', label: 'All books' },
  { value: 'saved', label: 'Saved' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export interface DashboardLibraryEmptyState {
  message: string;
  action: { label: string; to?: string };
}

export interface DashboardLibraryViewProps {
  filter: DashboardLibraryFilter;
  onFilterChange: (filter: DashboardLibraryFilter) => void;
  visibleItems: DashboardShelfBook[];
  catalogLoading: boolean;
  catalogError: string | null;
  retryCatalog: () => Promise<void>;
  emptyState: DashboardLibraryEmptyState;
}

export default function DashboardLibraryView({
  filter,
  onFilterChange,
  visibleItems,
  catalogLoading,
  catalogError,
  retryCatalog,
  emptyState,
}: DashboardLibraryViewProps) {
  const catalogState: CatalogSurfaceState = buildCatalogSurfaceState({
    loading: catalogLoading,
    error: catalogError,
    hasContent: visibleItems.length > 0,
  });
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
          {DASHBOARD_LIBRARY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? 'is-selected' : undefined}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="dashboard-result-count" aria-live="polite">{countLabel}</p>

      {catalogLoading && (
        <section className="dashboard-workspace-loading" role="status" aria-label="Loading your library">
          <p>Loading your library…</p>
        </section>
      )}

      {catalogError && (
        <section className="dashboard-workspace-status" role="alert">
          <p>{catalogError}</p>
          <p>Your saved reading state is still safe. Retry the catalog to restore book details.</p>
          <button type="button" onClick={() => { void retryCatalog(); }}>Try again</button>
        </section>
      )}

      {catalogState === 'content' ? (
        <div className="dashboard-book-grid dashboard-book-grid--library" aria-label="Library books">
          {visibleItems.map((item) => <DashboardBookCard key={item.book.id} item={item} />)}
        </div>
      ) : catalogState === 'empty' ? (
        <section className="dashboard-empty-state dashboard-workspace-empty" aria-labelledby="library-empty-heading">
          <h2 id="library-empty-heading">No books here yet</h2>
          <p>{emptyState.message}</p>
          {emptyState.action.to ? (
            <Link className="dashboard-empty-action" to={emptyState.action.to}>{emptyState.action.label}</Link>
          ) : (
            <button className="dashboard-empty-action" type="button" onClick={() => onFilterChange('all')}>
              {emptyState.action.label}
            </button>
          )}
        </section>
      ) : null}
    </section>
  );
}
