import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  Heart,
  Library,
  Play,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useBooks } from '../contexts/BooksContext';
import FavoriteButton from '../components/FavoriteButton';
import { Book } from '../types';

interface ShelfBook extends Book {
  progress: number;
  progressColor: string;
}

const PROGRESS_COLORS = [
  'from-teal-500 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
  'from-blue-500 to-indigo-500',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-lime-500',
  'from-rose-500 to-pink-500',
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

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
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
      const newProgress = currentProgress ? Math.min(currentProgress.progress + 25, 100) : 25;
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
  const nextBook = primaryShelf[0] || recommendedBooks[0];

  const stats = [
    {
      label: 'Books read',
      value: String(Math.max(userStats.booksRead, completedCount)),
      helper: 'Completed summaries',
      icon: Trophy,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Day streak',
      value: String(userStats.dayStreak),
      helper: 'Reading days',
      icon: Flame,
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Reading time',
      value: formatMinutes(userStats.totalReadingTime),
      helper: 'Tracked locally',
      icon: Clock3,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Saved books',
      value: String(favoriteBooks.length),
      helper: 'Favorites',
      icon: Heart,
      tone: 'bg-rose-50 text-rose-600',
    },
  ];

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
        className="group block w-full rounded-[18px] bg-white text-left shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.04),0_22px_48px_rgba(17,24,39,0.12)] focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/35 active:scale-[0.96]"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-[18px] bg-gray-100 book-cover-outline">
          <img
            src={book.coverImageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_COVER;
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-white">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{title}</p>
            <p className="mt-1 truncate text-xs text-white/75">{author}</p>
          </div>
          {isComplete && (
            <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Done
            </div>
          )}
        </div>
        <div className={compact ? 'p-3' : 'p-4'}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-500 tabular-nums">
              {progress === 0 ? 'Ready to start' : `${progress}% complete`}
            </span>
            <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-gray-950 px-2.5 py-1 text-xs font-bold text-white transition-colors duration-200 group-hover:bg-orange-600">
              {progress === 0 ? <Play className="h-3 w-3" aria-hidden="true" /> : <ArrowRight className="h-3 w-3" aria-hidden="true" />}
              {progress === 0 ? 'Start' : 'Read'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${book.progressColor} transition-[width] duration-500`}
              style={{ width: `${Math.max(progress, 3)}%` }}
            />
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
      <div className="group rounded-[18px] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,24,39,0.04),0_22px_48px_rgba(17,24,39,0.12)]">
        <button
          type="button"
          onClick={() => handleBookClick(book.id)}
          className="block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/35"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-[18px] bg-gray-100 book-cover-outline">
            <img
              src={book.coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_COVER;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-[opacity,background-color] duration-300 group-hover:bg-black/25 group-hover:opacity-100">
              <span className="inline-flex min-h-10 items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-950 shadow-lg">
                Read summary
              </span>
            </div>
            <div className="absolute right-2 top-2 z-10" onClick={(event) => event.stopPropagation()}>
              <FavoriteButton bookId={book.id} size="sm" />
            </div>
          </div>
        </button>
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-950 text-balance">{title}</h3>
          <p className="mt-1 truncate text-xs text-gray-500">{author}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[28px] bg-[#E7EBDF] shadow-[0_1px_2px_rgba(17,24,39,0.05),0_22px_64px_rgba(71,85,62,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 text-gray-950 md:p-8 lg:p-10">
              <div className="mb-8 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/65 px-3 py-2 text-sm font-semibold text-gray-700 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06),0_8px_22px_rgba(71,85,62,0.08)]">
                <BookOpen className="h-4 w-4 text-orange-600" aria-hidden="true" />
                Your reading home
              </div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-gray-950 text-balance md:text-5xl">
                {getGreeting()}, {userName}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-700 text-pretty md:text-base">
                Pick up where you left off, save the books that matter, and turn quick summaries into a steady reading habit.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => nextBook && handleBookClick(nextBook.id)}
                  disabled={!nextBook}
                  className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-bold text-white shadow-[0_1px_2px_rgba(127,29,29,0.12),0_16px_34px_rgba(249,115,22,0.34)] transition-[transform,box-shadow,background-color] duration-200 hover:shadow-[0_1px_2px_rgba(127,29,29,0.12),0_20px_42px_rgba(249,115,22,0.42)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {continueBooks.length > 0 ? 'Continue reading' : 'Start a summary'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/summaries')}
                  className="pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/65 px-5 py-3 text-sm font-bold text-gray-950 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06),0_8px_22px_rgba(71,85,62,0.08)] transition-[transform,background-color] duration-200 hover:bg-white"
                >
                  <Library className="h-4 w-4" aria-hidden="true" />
                  Browse library
                </button>
              </div>
            </div>

            <div className="bg-white/30 p-5 md:p-6 lg:p-8">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_36px_rgba(0,0,0,0.14)]">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.tone}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-950 tabular-nums">{item.value}</p>
                      <p className="mt-1 text-xs text-gray-400">{item.helper}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {favoriteBooks.length > 0 && (
          <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-950 text-balance">
                  <BookMarked className="h-6 w-6 text-rose-500" aria-hidden="true" />
                  Favorites
                </h2>
                <p className="mt-1 text-sm text-gray-500 tabular-nums">{favoriteBooks.length} saved for later</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {favoriteBooks.slice(0, 6).map((book) => (
                <RecommendationCard key={book.id} book={withProgress(book)} />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 text-balance">{primaryShelfTitle}</h2>
              <p className="mt-1 text-sm text-gray-500">Click a book to add progress and open its summary.</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshBooks}
              className="pressable inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-[transform,background-color] duration-200 hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh shelf
            </button>
          </div>
          {primaryShelf.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {primaryShelf.map((book) => (
                <BookShelfCard key={book.id} book={book} compact />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 text-center">
              <Library className="mb-3 h-9 w-9 text-gray-300" aria-hidden="true" />
              <p className="font-semibold text-gray-700">Your library is loading</p>
              <p className="mt-1 text-sm text-gray-400">Books will appear here as soon as the catalog is ready.</p>
            </div>
          )}
        </section>

        <section className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_14px_34px_rgba(17,24,39,0.08)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-950 text-balance">
                <Sparkles className="h-6 w-6 text-orange-500" aria-hidden="true" />
                Recommended for You
              </h2>
              <p className="mt-1 text-sm text-gray-500">A focused shelf to help you choose faster.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/summaries')}
              className="hidden min-h-10 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-[transform,background-color] duration-200 hover:bg-gray-200 active:scale-[0.96] sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {recommendedBooks.map((book) => (
              <RecommendationCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
