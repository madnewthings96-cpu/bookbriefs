import { Link } from 'react-router-dom';
import { getBookSummaryHref } from '../readingRouteModel';
import {
  buildCatalogSurfaceState,
  type CatalogSurfaceState,
} from './catalogStateModel';
import type { DashboardKnowledgeItem } from './dashboardOverviewModel';

export type KnowledgeFilter = 'all' | 'note' | 'highlight';

export const DASHBOARD_KNOWLEDGE_FILTERS: Array<{ value: KnowledgeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'note', label: 'Notes' },
  { value: 'highlight', label: 'Highlights' },
];

export interface KnowledgeGroup {
  bookId: string;
  bookTitle: string;
  bookSlug?: string;
  items: DashboardKnowledgeItem[];
}

export interface DashboardNotesViewProps {
  filter: KnowledgeFilter;
  onFilterChange: (filter: KnowledgeFilter) => void;
  catalogLoading: boolean;
  catalogError: string | null;
  retryCatalog: () => Promise<void>;
  userDataReady?: boolean;
  groups: KnowledgeGroup[];
}

const relativeUpdatedAt = (date: Date) => {
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

export default function DashboardNotesView({
  filter,
  onFilterChange,
  catalogLoading,
  catalogError,
  retryCatalog,
  userDataReady = true,
  groups,
}: DashboardNotesViewProps) {
  const catalogState: CatalogSurfaceState = buildCatalogSurfaceState({
    loading: catalogLoading,
    error: catalogError,
    hasContent: groups.length > 0,
    userDataReady,
  });

  return (
    <section className="dashboard-page dashboard-workspace-page dashboard-notes-page">
      <header className="dashboard-workspace-intro">
        <p className="dashboard-page-eyebrow">Your knowledge</p>
        <h1>Notes and highlights</h1>
        <p>Browse what you captured, then return to the book whenever you want to edit it.</p>
      </header>

      <div className="dashboard-segmented-control" role="group" aria-label="Filter notes and highlights">
        {DASHBOARD_KNOWLEDGE_FILTERS.map(({ value, label }) => (
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

      {catalogLoading && (
        <section className="dashboard-workspace-loading" role="status" aria-label="Loading book details">
          <p>Loading book details…</p>
        </section>
      )}

      {!catalogLoading && !userDataReady && (
        <section className="dashboard-workspace-loading" role="status" aria-label="Loading your notes">
          <p>Loading your notes…</p>
        </section>
      )}

      {catalogError && (
        <section className="dashboard-workspace-status" role="alert">
          <p>{catalogError}</p>
          <p>Your notes and highlights remain available. Retry the catalog to restore book links.</p>
          <button type="button" onClick={() => { void retryCatalog(); }}>Try again</button>
        </section>
      )}

      {catalogState === 'content' ? (
        <div className="dashboard-knowledge-groups">
          {groups.map((group) => (
            <section className="dashboard-knowledge-group" key={group.bookId}>
              <h2>{group.bookTitle}</h2>
              {group.bookSlug && <Link to={getBookSummaryHref({ id: group.bookSlug }, 'dashboard')}>Open book summary</Link>}
              <ul>
                {group.items.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link to={group.bookSlug ? getBookSummaryHref({ id: group.bookSlug }, 'dashboard') : '/dashboard/library'}>
                      <span className="dashboard-knowledge-kind">{item.kind === 'note' ? 'Note' : 'Highlight'}</span>
                      <p className="dashboard-knowledge-excerpt">{item.content}</p>
                      <time dateTime={item.updatedAt.toISOString()}>Updated {relativeUpdatedAt(item.updatedAt)}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : catalogState === 'empty' ? (
        <section className="dashboard-empty-state dashboard-workspace-empty" aria-labelledby="knowledge-empty-heading">
          <h2 id="knowledge-empty-heading">Nothing captured yet</h2>
          <p>{filter === 'all' ? 'Notes and highlights from your reading will appear here.' : `No ${filter === 'note' ? 'notes' : 'highlights'} match this view.`}</p>
          <Link className="dashboard-empty-action" to="/dashboard/library">Open your library</Link>
        </section>
      ) : null}
    </section>
  );
}
