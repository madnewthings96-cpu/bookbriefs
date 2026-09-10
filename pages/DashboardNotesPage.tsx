import { useMemo, useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import { selectRecentKnowledge } from '../components/dashboard/dashboardOverviewModel';
import DashboardNotesView, {
  type KnowledgeFilter,
  type KnowledgeGroup,
} from '../components/dashboard/DashboardNotesView';
import { runCatalogRetry } from '../components/dashboard/catalogStateModel';
import './DashboardPages.css';

export default function DashboardNotesPage() {
  const {
    books,
    loading: catalogLoading,
    error: catalogError,
    refreshBooks,
  } = useBooks();
  const { personalNotesData, isUserDataReady } = usePersonalNotes();
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
  const retryCatalog = useMemo(() => runCatalogRetry(refreshBooks), [refreshBooks]);

  return (
    <DashboardNotesView
      filter={filter}
      onFilterChange={setFilter}
      catalogLoading={catalogLoading}
      catalogError={catalogError}
      retryCatalog={retryCatalog}
      userDataReady={isUserDataReady}
      groups={groups}
    />
  );
}
