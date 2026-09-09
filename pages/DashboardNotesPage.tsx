import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookSummaryHref } from '../components/readingRouteModel';
import { useBooks } from '../contexts/BooksContext';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import {
  selectRecentKnowledge,
  type DashboardKnowledgeItem,
} from '../components/dashboard/dashboardOverviewModel';
import { buildCatalogSurfaceState, runCatalogRetry } from '../components/dashboard/catalogStateModel';
import './DashboardPages.css';

type KnowledgeFilter = 'all' | 'note' | 'highlight';

const KNOWLEDGE_FILTERS: Array<{ value: KnowledgeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'note', label: 'Notes' },
  { value: 'highlight', label: 'Highlights' },
];

interface KnowledgeGroup {
  bookId: string;
  bookTitle: string;
  bookSlug?: string;
  items: DashboardKnowledgeItem[];
}

const relativeUpdatedAt = (date: Date) => {
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

export default function DashboardNotesPage() {
  const {
    books,
    loading: catalogLoading,
    error: catalogError,
    refreshBooks,
  } = useBooks();
  const { personalNotesData } = usePersonalNotes();
  const [filter, setFilter] = useState<KnowledgeFilter>('all');

  const allKnowledge = useMemo(() => (
    selectRecentKnowledge(personalNotesData, books, personalNotesData.notes.length + personalNotesData.highlights.length)
  ), [books, personalNotesData]);
  const visibleKnowledge = useMemo(() => (
    filter === 'all' ? allKnowledge : allKnowledge.filter((item) => item.kind === filter)
  ), [allKnowledge, filter]);
  const groups = useMemo(() => {
    const byBookId = new Map<string, KnowledgeGroup>();

    visibleKnowledge.forEach((item) => {
      const existing = byBookId.get(item.bookId);
      if (existing) {
        existing.items.push(item);
        return;
      }

      byBookId.set(item.bookId, {
        bookId: item.bookId,
        bookTitle: item.book?.title || 'Book no longer available',
        bookSlug: item.book?.arabicSlug || item.book?.id,
        items: [item],
      });
    });

    return Array.from(byBookId.values());
  }, [visibleKnowledge]);
  const catalogState = buildCatalogSurfaceState({
    loading: catalogLoading,
    error: catalogError,
    hasContent: groups.length > 0,
  });
  const retryCatalog = useMemo(() => runCatalogRetry(refreshBooks), [refreshBooks]);

  return (
    <section className="dashboard-page dashboard-workspace-page dashboard-notes-page">
      <header className="dashboard-workspace-intro">
        <p className="dashboard-page-eyebrow">Your knowledge</p>
        <h1>Notes and highlights</h1>
        <p>Browse what you captured, then return to the book whenever you want to edit it.</p>
      </header>

      <div className="dashboard-segmented-control" role="group" aria-label="Filter notes and highlights">
        {KNOWLEDGE_FILTERS.map(({ value, label }) => (
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

      {catalogLoading && (
        <section className="dashboard-workspace-loading" role="status" aria-label="Loading book details">
          <p>Loading book details…</p>
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
