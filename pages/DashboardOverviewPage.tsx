import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BooksContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersonalNotes } from '../contexts/PersonalNotesContext';
import { useReadingChallenge } from '../contexts/ReadingChallengeContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import type { Book } from '../types';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';
import {
  buildDashboardShelf,
  buildWeeklyReadingInsight,
  selectContinueReading,
  selectDashboardRecommendations,
  selectRecentKnowledge,
  type DashboardKnowledgeItem,
  type DashboardShelfBook,
} from '../components/dashboard/dashboardOverviewModel';
import './DashboardPages.css';

const greetingForHour = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { books, loading: catalogLoading } = useBooks();
  const { favorites, error: libraryError } = useFavorites();
  const { getBookAuthor, getBookTitle } = useLanguage();
  const { personalNotesData } = usePersonalNotes();
  const { challenge, loading: challengeLoading, error: challengeError, progress } = useReadingChallenge();
  const { bookProgress, userStats } = useUserProgress();

  const localizeBook = useCallback((book: Book): Book => {
    const title = getBookTitle(book.id);
    const author = getBookAuthor(book.id);
    return {
      ...book,
      title: title === book.id ? book.title : title,
      author: author === book.id ? book.author : author,
    };
  }, [getBookAuthor, getBookTitle]);

  const localizeShelfBook = useCallback((item: DashboardShelfBook): DashboardShelfBook => ({
    ...item,
    book: localizeBook(item.book),
  }), [localizeBook]);

  const continueBook = useMemo(() => {
    const selected = selectContinueReading(books, bookProgress);
    return selected ? localizeShelfBook({ ...selected, saved: favorites.includes(selected.book.id) }) : undefined;
  }, [bookProgress, books, favorites, localizeShelfBook]);

  const library = useMemo(() => (
    buildDashboardShelf(books, favorites, bookProgress).map(localizeShelfBook)
  ), [bookProgress, books, favorites, localizeShelfBook]);

  const recentKnowledge = useMemo(() => (
    selectRecentKnowledge(personalNotesData, books).map((item): DashboardKnowledgeItem => ({
      ...item,
      book: item.book ? localizeBook(item.book) : undefined,
    }))
  ), [books, localizeBook, personalNotesData]);

  const recommendations = useMemo(() => (
    selectDashboardRecommendations(books, library.map(item => item.book.id), 6).map(localizeShelfBook)
  ), [books, library, localizeShelfBook]);

  const weeklyInsight = useMemo(() => buildWeeklyReadingInsight(userStats.readingHistory), [userStats.readingHistory]);

  return (
    <DashboardOverviewView
      greeting={greetingForHour(new Date().getHours())}
      userName={user?.name?.trim() || 'Reader'}
      catalogLoading={catalogLoading}
      challengeLoading={challengeLoading}
      continueBook={continueBook}
      challenge={challenge ? progress : undefined}
      challengeError={challengeError}
      libraryError={libraryError}
      recentKnowledge={recentKnowledge}
      library={library}
      weeklyInsight={weeklyInsight}
      recommendations={recommendations}
    />
  );
}
