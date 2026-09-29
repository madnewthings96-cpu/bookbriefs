import { useMemo, useState } from 'react';
import { useBooks } from '../contexts/BooksContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import {
  buildDashboardShelf,
  filterDashboardShelf,
  type DashboardLibraryFilter,
} from '../components/dashboard/dashboardOverviewModel';
import DashboardLibraryView from '../components/dashboard/DashboardLibraryView';
import { runCatalogRetry } from '../components/dashboard/catalogStateModel';
import './DashboardPages.css';

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
  const {
    books,
    loading: catalogLoading,
    error: catalogError,
    refreshBooks,
  } = useBooks();
  const {
    favorites,
    error: favoritesError,
    isUserDataReady: favoritesReady,
    refreshFavorites,
  } = useFavorites();
  const { bookProgress, isUserDataReady: progressReady } = useUserProgress();
  const [filter, setFilter] = useState<DashboardLibraryFilter>('all');

  const library = useMemo(() => buildDashboardShelf(books, favorites, bookProgress), [books, favorites, bookProgress]);
  const visibleItems = useMemo(() => filterDashboardShelf(library, filter), [filter, library]);
  const retryCatalog = useMemo(() => runCatalogRetry(refreshBooks), [refreshBooks]);
  const emptyState = emptyStateFor(filter);

  return (
    <DashboardLibraryView
      filter={filter}
      onFilterChange={setFilter}
      visibleItems={visibleItems}
      catalogLoading={catalogLoading}
      catalogError={catalogError}
      favoritesError={favoritesError}
      retryFavorites={refreshFavorites}
      userDataReady={favoritesReady && progressReady}
      retryCatalog={retryCatalog}
      emptyState={emptyState}
    />
  );
}
