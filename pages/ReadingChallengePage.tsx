import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Library,
  Lock,
  Medal,
  Pencil,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { useReadingChallenge } from '../contexts/ReadingChallengeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BooksContext';
import { Book } from '../types';

const getBookUrl = (book: Book) => `/summary/${book.arabicSlug || book.id}`;

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const ReadingChallengePage: React.FC = () => {
  const { challenge, loading, setGoal, deleteGoal, progress, isBookRead, markBookAsRead, unmarkBookAsRead } = useReadingChallenge();
  const { isAuthenticated } = useAuth();
  const { books } = useBooks();
  const [goalInput, setGoalInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const currentYear = new Date().getFullYear();

  const readBooks = useMemo(() => books.filter((book) => isBookRead(book.id)), [books, isBookRead]);
  const unreadBooks = useMemo(() => books.filter((book) => !isBookRead(book.id)), [books, isBookRead]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(books.map((book) => book.category).filter(Boolean))).sort();
    return ['All', ...uniqueCategories];
  }, [books]);

  const filteredUnreadBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return unreadBooks.filter((book) => {
      const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery) ||
        book.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, query, unreadBooks]);

  const rawPercentage = challenge?.goal ? (progress.current / challenge.goal) * 100 : 0;
  const displayPercentage = clamp(rawPercentage);
  const remainingBooks = challenge ? Math.max(challenge.goal - progress.current, 0) : 0;
  const today = new Date();
  const endOfYear = new Date(currentYear, 11, 31);
  const daysLeft = Math.max(Math.ceil((endOfYear.getTime() - today.getTime()) / 86400000), 0);
  const monthsLeft = Math.max(12 - today.getMonth(), 1);
  const monthlyPace = challenge ? Math.ceil(remainingBooks / monthsLeft) : 0;
  const nextMilestone = [1, 3, 5, 10, 20, 50, 100].find((target) => target > progress.current);
  const nextBooks = filteredUnreadBooks.slice(0, 12);
  const recentReadBooks = readBooks.slice(-6).reverse();

  const achievements = [
    { label: 'First summary', detail: 'Read 1 book', target: 1, unlocked: progress.current >= 1, icon: BookOpen },
    { label: 'Three-book streak', detail: 'Read 3 books', target: 3, unlocked: progress.current >= 3, icon: Flame },
    { label: 'Committed reader', detail: 'Read 5 books', target: 5, unlocked: progress.current >= 5, icon: Medal },
    { label: 'Ten insights', detail: 'Read 10 books', target: 10, unlocked: progress.current >= 10, icon: Sparkles },
    { label: 'Goal complete', detail: 'Reach 100%', target: challenge?.goal || 0, unlocked: rawPercentage >= 100, icon: Trophy },
    { label: 'Over target', detail: 'Reach 150%', target: Math.ceil((challenge?.goal || 0) * 1.5), unlocked: rawPercentage >= 150, icon: Award },
  ];

  const earnedAchievementCount = achievements.filter((achievement) => achievement.unlocked).length;

  const openGoalModal = (preset?: number) => {
    setGoalInput(String(preset || challenge?.goal || ''));
    setError(null);
    setShowGoalModal(true);
  };

  const handleSetGoal = async () => {
    const goal = parseInt(goalInput, 10);
    if (!goal || goal <= 0 || goal > 1000) {
      setError('Please enter a valid goal between 1 and 1000.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setGoal(goal);
      setShowGoalModal(false);
      setGoalInput('');
    } catch (err) {
      console.error('Error setting goal:', err);
      setError('Failed to set goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteGoal();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkRead = async (bookId: string) => {
    setError(null);
    try {
      await markBookAsRead(bookId);
    } catch (err) {
      console.error('Error marking book as read:', err);
      setError('Could not update this book. Please try again.');
    }
  };

  const handleUnmarkRead = async (bookId: string) => {
    setError(null);
    try {
      await unmarkBookAsRead(bookId);
    } catch (err) {
      console.error('Error unmarking book:', err);
      setError('Could not update this book. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f0e6] px-4 py-12">
        <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.86fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-orange-700 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.12)]">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Reading challenge
            </p>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
              Turn summaries into a visible reading habit.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#6f6558]">
              Sign in to set a yearly target, mark summaries as read, and keep your next book visible.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_24px_60px_rgba(89,69,45,0.16)]">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <BookOpen className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-gray-950">Create your challenge</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your goal and completed books stay connected to your account.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                to="/signup"
                className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(249,115,22,0.28)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_20px_42px_rgba(249,115,22,0.34)]"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-gray-100 px-5 py-3 text-sm font-black text-gray-800 transition-[background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500"></div>
          <p className="font-semibold text-gray-600">Loading your reading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <section className="border-b border-[#e5d8c7] bg-[#f7f0e6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#a75d37] shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08)]">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {currentYear} Reading Challenge
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-gray-950 md:text-6xl">
                Keep your next summary in sight.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f6558]">
                Set a target, mark summaries as read, and use the dashboard to choose the next book with less friction.
              </p>

              {!challenge && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {[12, 24, 52].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => openGoalModal(preset)}
                      className="pressable inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-800 shadow-[inset_0_0_0_1px_rgba(89,69,45,0.08),0_10px_24px_rgba(89,69,45,0.10)] transition-[background-color,color,transform] duration-200 hover:bg-gray-950 hover:text-white"
                    >
                      {preset} books
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_24px_60px_rgba(89,69,45,0.16)]">
              {challenge ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-500">Progress</p>
                      <p className="mt-1 text-4xl font-black tracking-tight text-gray-950">
                        {progress.current}
                        <span className="text-gray-300">/{progress.goal}</span>
                      </p>
                    </div>
                    <div
                      className="grid h-28 w-28 place-items-center rounded-full"
                      style={{ background: `conic-gradient(#f97316 ${displayPercentage * 3.6}deg, #f1f5f9 0deg)` }}
                      aria-label={`${Math.round(displayPercentage)} percent complete`}
                    >
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
                        <span className="text-2xl font-black tabular-nums text-gray-950">{Math.round(displayPercentage)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-[width] duration-500"
                      style={{ width: `${displayPercentage}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Metric label="Remaining" value={remainingBooks} />
                    <Metric label="Days left" value={daysLeft} />
                    <Metric label="Monthly pace" value={monthlyPace} />
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openGoalModal()}
                      className="pressable inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-black text-white transition-[background-color,transform] duration-200 hover:bg-orange-600"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Update goal
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="pressable inline-flex min-h-11 items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition-[background-color,transform] duration-200 hover:bg-red-100"
                      aria-label="Delete reading challenge"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-3">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Target className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-950">Set your target</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Choose a number that feels useful. You can update it later.
                  </p>
                  <button
                    type="button"
                    onClick={() => openGoalModal(12)}
                    className="pressable mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(249,115,22,0.28)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_20px_42px_rgba(249,115,22,0.34)]"
                  >
                    Start challenge
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-100">
            <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {challenge && (
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="space-y-6">
              <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_36px_rgba(17,24,39,0.07)] ring-1 ring-gray-950/5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Milestones</h2>
                    <p className="mt-1 text-sm text-gray-500">{earnedAchievementCount} of {achievements.length} unlocked</p>
                  </div>
                  <Award className="h-5 w-5 text-orange-600" aria-hidden="true" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {achievements.map((achievement) => {
                    const Icon = achievement.unlocked ? achievement.icon : Lock;
                    return (
                      <div
                        key={achievement.label}
                        className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition-[background-color,opacity] duration-200 ${
                          achievement.unlocked
                            ? 'bg-orange-50 ring-orange-100'
                            : 'bg-gray-50 opacity-70 ring-gray-950/5'
                        }`}
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${achievement.unlocked ? 'bg-white text-orange-600' : 'bg-white text-gray-400'}`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-gray-950">{achievement.label}</span>
                          <span className="block text-xs font-semibold text-gray-500">{achievement.detail}</span>
                        </span>
                        {achievement.unlocked && <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_36px_rgba(17,24,39,0.07)] ring-1 ring-gray-950/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Read shelf</h2>
                    <p className="text-sm text-gray-500">{readBooks.length} completed summaries</p>
                  </div>
                </div>

                {recentReadBooks.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {recentReadBooks.map((book) => (
                      <div key={book.id} className="group relative">
                        <Link to={getBookUrl(book)} className="block">
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="aspect-[2/3] w-full rounded-xl object-cover shadow-[0_10px_22px_rgba(17,24,39,0.14)] transition-transform duration-200 group-hover:-translate-y-1"
                            loading="lazy"
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnmarkRead(book.id)}
                          className="pressable absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_10px_22px_rgba(17,24,39,0.18)] transition-[background-color,transform] duration-200 hover:bg-red-500"
                          aria-label={`Mark ${book.title} as unread`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    Mark your first summary as read and it will appear here.
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_16px_36px_rgba(17,24,39,0.07)] ring-1 ring-gray-950/5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-950">Choose your next summary</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {nextMilestone ? `${nextMilestone - progress.current} more to reach ${nextMilestone}.` : 'Every new summary extends your streak.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search books"
                      className="h-11 w-full rounded-xl bg-gray-50 pl-10 pr-3 text-sm font-semibold text-gray-900 outline-none ring-1 ring-gray-950/5 transition-[background-color,box-shadow] duration-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-300 sm:w-56"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-11 rounded-xl bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none ring-1 ring-gray-950/5 transition-[background-color,box-shadow] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-300"
                    aria-label="Filter by category"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nextBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {nextBooks.map((book) => (
                    <BookChallengeCard
                      key={book.id}
                      book={book}
                      isRead={false}
                      onToggle={() => handleMarkRead(book.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <Library className="mx-auto mb-3 h-8 w-8 text-gray-400" aria-hidden="true" />
                  <h3 className="text-lg font-black text-gray-950">No books match this filter</h3>
                  <p className="mt-1 text-sm text-gray-500">Clear search or choose another category.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {showGoalModal && (
        <GoalModal
          challengeGoal={challenge?.goal}
          currentYear={currentYear}
          error={error}
          goalInput={goalInput}
          isSubmitting={isSubmitting}
          setError={setError}
          setGoalInput={setGoalInput}
          onClose={() => {
            setShowGoalModal(false);
            setGoalInput('');
            setError(null);
          }}
          onSubmit={handleSetGoal}
        />
      )}

      {showDeleteConfirm && (
        <DeleteChallengeModal
          currentYear={currentYear}
          error={error}
          isSubmitting={isSubmitting}
          onClose={() => {
            setShowDeleteConfirm(false);
            setError(null);
          }}
          onDelete={handleDeleteGoal}
        />
      )}
    </div>
  );
};

interface MetricProps {
  label: string;
  value: number;
}

const Metric: React.FC<MetricProps> = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3 text-center">
    <p className="text-xl font-black tabular-nums text-gray-950">{value}</p>
    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</p>
  </div>
);

interface BookChallengeCardProps {
  book: Book;
  isRead: boolean;
  onToggle: () => void;
}

const BookChallengeCard: React.FC<BookChallengeCardProps> = ({ book, isRead, onToggle }) => (
  <div className="group">
    <div className="relative">
      <Link to={getBookUrl(book)} className="block overflow-hidden rounded-xl bg-gray-100 shadow-[0_10px_24px_rgba(17,24,39,0.12)]">
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <button
        type="button"
        onClick={onToggle}
        className={`pressable absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_10px_22px_rgba(17,24,39,0.18)] transition-[background-color,color,transform] duration-200 ${
          isRead ? 'bg-emerald-500 text-white hover:bg-red-500' : 'bg-white text-gray-500 hover:bg-emerald-500 hover:text-white'
        }`}
        aria-label={isRead ? `Mark ${book.title} as unread` : `Mark ${book.title} as read`}
      >
        {isRead ? <Check className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
    <Link to={getBookUrl(book)} className="mt-3 block">
      <h3 className="line-clamp-2 text-sm font-black leading-5 text-gray-950 transition-colors duration-200 group-hover:text-orange-600">{book.title}</h3>
      <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-500">{book.author}</p>
    </Link>
  </div>
);

interface GoalModalProps {
  challengeGoal?: number;
  currentYear: number;
  error: string | null;
  goalInput: string;
  isSubmitting: boolean;
  setError: (error: string | null) => void;
  setGoalInput: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({
  challengeGoal,
  currentYear,
  error,
  goalInput,
  isSubmitting,
  setError,
  setGoalInput,
  onClose,
  onSubmit,
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(17,24,39,0.24)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-950">{challengeGoal ? 'Update your goal' : 'Set your reading goal'}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">How many summaries do you want to finish in {currentYear}?</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-[background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
          aria-label="Close goal modal"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <label className="mb-2 block text-sm font-black text-gray-900" htmlFor="reading-goal">
        Goal
      </label>
      <input
        id="reading-goal"
        type="number"
        value={goalInput}
        onChange={(event) => {
          setGoalInput(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !isSubmitting) {
            onSubmit();
          }
        }}
        placeholder={challengeGoal ? String(challengeGoal) : '12'}
        className="h-12 w-full rounded-xl bg-gray-50 px-4 text-base font-bold text-gray-950 outline-none ring-1 ring-gray-950/5 transition-[background-color,box-shadow] duration-200 focus:bg-white focus:ring-2 focus:ring-orange-300"
        min="1"
        max="1000"
        autoFocus
        disabled={isSubmitting}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {[12, 24, 52].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setGoalInput(String(preset))}
            className="pressable min-h-10 rounded-xl bg-gray-100 px-3 py-2 text-sm font-black text-gray-700 transition-[background-color,color] duration-200 hover:bg-gray-950 hover:text-white"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="pressable min-h-12 rounded-xl bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition-[background-color,color] duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!goalInput || parseInt(goalInput, 10) <= 0 || isSubmitting}
          className="pressable inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-black text-white transition-[opacity,box-shadow] duration-200 hover:shadow-[0_16px_34px_rgba(249,115,22,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : challengeGoal ? 'Update' : 'Set goal'}
        </button>
      </div>
    </div>
  </div>
);

interface DeleteChallengeModalProps {
  currentYear: number;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteChallengeModal: React.FC<DeleteChallengeModalProps> = ({ currentYear, error, isSubmitting, onClose, onDelete }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(17,24,39,0.24)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <Trash2 className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-black text-gray-950">Delete challenge?</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        This will delete your {currentYear} reading challenge and progress. This action cannot be undone.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="pressable min-h-12 rounded-xl bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition-[background-color,color] duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isSubmitting}
          className="pressable min-h-12 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition-[background-color,opacity] duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

export default ReadingChallengePage;
