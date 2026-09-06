import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Library,
  Play,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBooks } from '../contexts/BooksContext';
import FavoriteButton from '../components/FavoriteButton';
import ProfileHero from '../components/profile/ProfileHero';
import {
  buildReadingStats,
  getNextBookProgress,
  getPrimaryShelfUtility,
  isNewReadingProfile,
} from '../components/profile/profilePageModel';
import { Book } from '../types';
import './UserProfilePage.css';

interface ShelfBook extends Book {
  progress: number;
  progressColor: string;
}

const PROGRESS_COLORS = [
  '#2f7660',
  '#c89a49',
  '#d96847',
  '#54735e',
  '#a1783c',
  '#7b6255',
];

const FALLBACK_COVER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDE1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3Lm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFYxMDBINjBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik01MCAxMTBIMTEwVjEyMEg1MFYxMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCAxMzBIMTAwVjE0MEg2MFYxMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';

const RECOMMENDED_BOOK_IDS = [
  'thinkandgrowrich',
  'the-alchemist',
  'rich-dad-poor-dad',
  'the-four-agreements',
  'educated',
  'dune',
];

const getProgressColor = (bookId: string) => {
  const index = bookId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % PROGRESS_COLORS.length;
  return PROGRESS_COLORS[index];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { getBookTitle, getBookAuthor } = useLanguage();
  const { user } = useAuth();
  const { userStats, bookProgress, updateBookProgress, getBookProgress } = useUserProgress();
  const { favorites } = useFavorites();
  const { books } = useBooks();
  const [startReadingBooks, setStartReadingBooks] = useState<ShelfBook[]>([]);

  const userName = user?.name || user?.email?.split('@')[0] || 'Reader';
  const completedCount = bookProgress.filter((progress) => progress.isCompleted || progress.progress >= 100).length;
  const inProgress = bookProgress
    .filter((progress) => progress.progress > 0 && progress.progress < 100)
    .sort((a, b) => b.lastReadAt.getTime() - a.lastReadAt.getTime());

  const getBookUrl = (book: Book) => `/summary/${book.arabicSlug || book.id}`;

  const withProgress = (book: Book): ShelfBook => ({
    ...book,
    progress: getBookProgress(book.id)?.progress || 0,
    progressColor: getProgressColor(book.id),
  });

  const getRandomBooks = () => {
    const candidates = books
      .filter((book) => !getBookProgress(book.id)?.isCompleted)
      .sort(() => Math.random() - 0.5);
    return candidates.slice(0, 6).map(withProgress);
  };

  useEffect(() => {
    if (books.length > 0 && startReadingBooks.length === 0) {
      setStartReadingBooks(getRandomBooks());
    }
  }, [books.length, startReadingBooks.length]);

  const handleRefreshBooks = () => {
    setStartReadingBooks(getRandomBooks());
  };

  const handleBookClick = (bookId: string) => {
    const book = books.find((candidate) => candidate.id === bookId);
    if (!book) return;

    const currentProgress = getBookProgress(bookId);
    if (!currentProgress || currentProgress.progress < 100) {
      const newProgress = getNextBookProgress(currentProgress?.progress);
      updateBookProgress(bookId, newProgress);
    }

    navigate(getBookUrl(book));
  };

  const favoriteBooks = useMemo(() => books.filter((book) => favorites.includes(book.id)), [books, favorites]);

  const continueBooks = useMemo(() => {
    const mapped = inProgress
      .map((progress) => books.find((book) => book.id === progress.bookId))
      .filter((book): book is Book => Boolean(book))
      .map(withProgress);

    return mapped.slice(0, 6);
  }, [books, bookProgress]);

  const recommendedBooks = useMemo(() => {
    const byId = new Map(books.map((book) => [book.id, book]));
    const recommended = RECOMMENDED_BOOK_IDS.map((id) => byId.get(id)).filter((book): book is Book => Boolean(book));
    const fallback = books.filter((book) => !recommended.some((recommendedBook) => recommendedBook.id === book.id));
    return [...recommended, ...fallback].slice(0, 6).map(withProgress);
  }, [books, bookProgress]);

  const primaryShelf = continueBooks.length > 0 ? continueBooks : startReadingBooks;
  const primaryShelfTitle = continueBooks.length > 0 ? 'Continue Reading' : 'Start Reading';
  const primaryShelfUtility = getPrimaryShelfUtility(continueBooks.length > 0);
  const nextBook = primaryShelf[0] || recommendedBooks[0];
  const stats = buildReadingStats({
    booksRead: userStats.booksRead,
    completedCount,
    dayStreak: userStats.dayStreak,
    totalReadingTime: userStats.totalReadingTime,
    savedBooks: favoriteBooks.length,
  });
  const isNewReader = isNewReadingProfile(stats, inProgress.length);

  const heroBook = nextBook ? (() => {
    const localizedTitle = getBookTitle(nextBook.id);
    const localizedAuthor = getBookAuthor(nextBook.id);
    return {
      title: localizedTitle === nextBook.id ? nextBook.title : localizedTitle,
      author: localizedAuthor === nextBook.id ? nextBook.author : localizedAuthor,
      coverImageUrl: nextBook.coverImageUrl,
      progress: nextBook.progress,
    };
  })() : undefined;

  const BookShelfCard = ({ book, compact = false }: { book: ShelfBook; compact?: boolean }) => {
    const localizedTitle = getBookTitle(book.id);
    const localizedAuthor = getBookAuthor(book.id);
    const title = localizedTitle === book.id ? book.title : localizedTitle;
    const author = localizedAuthor === book.id ? book.author : localizedAuthor;
    const progress = Math.min(Math.max(book.progress, 0), 100);
    const isComplete = progress >= 100;

    return (
      <button
        type="button"
        onClick={() => handleBookClick(book.id)}
        aria-label={`${progress === 0 ? 'Start' : 'Continue'} ${title}`}
        className={`reader-book-card${compact ? ' reader-book-card--compact' : ''}`}
        style={{ '--reader-progress-color': book.progressColor } as React.CSSProperties}
      >
        <div className="reader-book-card__cover">
          <img
            src={book.coverImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_COVER;
            }}
          />
          {isComplete && (
            <div className="reader-book-card__done">
              <CheckCircle2 size={14} aria-hidden="true" />
              Done
            </div>
          )}
        </div>
        <div className="reader-book-card__body">
          <span className="reader-book-card__category">{book.category}</span>
          <h3>{title}</h3>
          <p>{author}</p>
          <div className="reader-book-card__status">
            <span>{progress === 0 ? 'Ready to start' : `${progress}% complete`}</span>
            <span className="reader-book-card__verb">
              {progress === 0 ? <Play size={12} aria-hidden="true" /> : <ArrowRight size={12} aria-hidden="true" />}
              {progress === 0 ? 'Start' : 'Read'}
            </span>
          </div>
          <div
            className="reader-book-card__progress"
            role="progressbar"
            aria-label={`${title} reading progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </button>
    );
  };

  const RecommendationCard = ({ book }: { book: ShelfBook }) => {
    const localizedTitle = getBookTitle(book.id);
    const localizedAuthor = getBookAuthor(book.id);
    const title = localizedTitle === book.id ? book.title : localizedTitle;
    const author = localizedAuthor === book.id ? book.author : localizedAuthor;

    return (
      <article className="reader-recommendation">
        <div className="reader-recommendation__cover">
          <button
            type="button"
            className="reader-recommendation__cover-action"
            onClick={() => handleBookClick(book.id)}
            aria-label={`Read ${title}`}
          >
            <img
              src={book.coverImageUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_COVER;
              }}
            />
            <span className="reader-recommendation__read">Read summary <ArrowRight size={14} aria-hidden="true" /></span>
          </button>
          <div className="reader-recommendation__favorite">
            <FavoriteButton bookId={book.id} size="sm" />
          </div>
        </div>
        <div className="reader-recommendation__body">
          <span>{book.category}</span>
          <h3>{title}</h3>
          <p>{author}</p>
        </div>
      </article>
    );
  };

  return (
    <main className="reader-desk">
      <div className="reader-desk__inner">
        <ProfileHero
          greeting={getGreeting()}
          userName={userName}
          isNewReader={isNewReader}
          hasProgress={continueBooks.length > 0}
          nextBook={heroBook}
          stats={stats}
          onPrimaryAction={() => nextBook && handleBookClick(nextBook.id)}
          onBrowse={() => navigate('/summaries')}
        />

        <div className="reader-trail">
          <section className="reader-panel reader-panel--primary" aria-labelledby="primary-shelf-title">
            <div className="reader-panel__heading">
              <div>
                <p className="reader-panel__eyebrow">On your desk</p>
                <h2 id="primary-shelf-title">{primaryShelfTitle}</h2>
                <p>{continueBooks.length > 0
                  ? 'Your active summaries, ordered by the last time you opened them.'
                  : 'A small first shelf—choose the title that feels useful today.'}</p>
              </div>
              <button
                type="button"
                className="reader-panel__utility"
                onClick={primaryShelfUtility.action === 'refresh' ? handleRefreshBooks : () => navigate('/summaries')}
              >
                {primaryShelfUtility.action === 'refresh'
                  ? <RefreshCw size={16} aria-hidden="true" />
                  : <Library size={16} aria-hidden="true" />}
                {primaryShelfUtility.label}
              </button>
            </div>
            {primaryShelf.length > 0 ? (
              <div className="reader-shelf" aria-label={primaryShelfTitle}>
                {primaryShelf.map((book) => <BookShelfCard key={book.id} book={book} compact />)}
              </div>
            ) : (
              <div className="reader-shelf-empty" role="status">
                <Library size={34} aria-hidden="true" />
                <strong>Your shelf is being prepared</strong>
                <span>Books will appear here as soon as the catalog is ready.</span>
              </div>
            )}
          </section>

          {favoriteBooks.length > 0 && (
            <section className="reader-panel reader-panel--saved" aria-labelledby="saved-shelf-title">
              <div className="reader-panel__heading">
                <div>
                  <p className="reader-panel__eyebrow">Worth returning to</p>
                  <h2 id="saved-shelf-title"><BookMarked size={22} aria-hidden="true" /> Saved books</h2>
                  <p>{favoriteBooks.length} {favoriteBooks.length === 1 ? 'title' : 'titles'} waiting in your library.</p>
                </div>
              </div>
              <div className="reader-shelf" aria-label="Saved books">
                {favoriteBooks.slice(0, 6).map((book) => (
                  <RecommendationCard key={book.id} book={withProgress(book)} />
                ))}
              </div>
            </section>
          )}

          <section className="reader-panel reader-panel--curated" aria-labelledby="recommended-shelf-title">
            <div className="reader-panel__heading">
              <div>
                <p className="reader-panel__eyebrow"><Sparkles size={14} aria-hidden="true" /> Curated for your next hour</p>
                <h2 id="recommended-shelf-title">Recommended reading</h2>
                <p>A focused shelf for choosing quickly and reading deliberately.</p>
              </div>
              <button type="button" className="reader-panel__utility" onClick={() => navigate('/summaries')}>
                View all <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="reader-shelf" aria-label="Recommended reading">
              {recommendedBooks.map((book) => <RecommendationCard key={book.id} book={book} />)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
