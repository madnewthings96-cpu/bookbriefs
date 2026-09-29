import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, SummaryData } from '../types';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ReadingProgressBar from '../components/ReadingProgressBar';
import NotesAndHighlightsPanel from '../components/NotesAndHighlightsPanel';
import AddNoteModal from '../components/AddNoteModal';
import SignUpPromptModal from '../components/SignUpPromptModal';
import HighlightableText from '../components/HighlightableText';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import BookReviews from '../components/BookReviews';
import FavoriteButton from '../components/FavoriteButton';
import SummaryReadingExperience from '../components/SummaryReadingExperience';
// Lazy load jsPDF - only when user clicks download (saves 385KB from initial bundle!)
// import jsPDF from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';
import { getBookSummaryTranslation } from '../translations/bookSummaries';
import { getLocalBookSummary } from '../utils/localBookFallbacks';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { useBooks } from '../contexts/BooksContext';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';
import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '../firebase';
import { SITE_URL } from '../utils/seoConfig';
import { getBookLibraryHref, getBookSummaryHref, type ReadingSurface } from '../components/readingRouteModel';
import { SummaryVisitTracker } from '../components/summaryVisitModel';
import { AsyncIdentityGuard, type AsyncIdentityToken } from '../components/asyncIdentityGuard';
import { getSummaryCatalogSurfaceState } from '../components/summaryCatalogState';
import { openPdfBlobUrl } from '../utils/pdfDownloadGuard';
import { arabicBookSummaries } from '../translations/arabicBookSummaries';
import { getSummaryPath, getSummaryAlternates, resolveArabicSummaryId } from '../utils/bookLocales';

const PDF_PATHS: Record<string, string> = {
  'americas-bank': '/pdfs/americas bank.pdf',
  'broken-money': '/pdfs/broken money.pdf',
  'rich-dad-poor-dad': '/pdfs/rich dad poor dad.pdf',
  'the-mental-game-of-trading': '/pdfs/the mental game of trading.pdf',
  'the-alchemist': '/pdfs/the alchemist.pdf',
  howtodaytradeforaliving: '/pdfs/how to day trade for a living.pdf',
  'trading-in-the-zone': '/pdfs/trading in the zone 2.pdf',
  'atomic-habits': '/pdfs/atomic habits.pdf',
  'best-loser-wins': '/pdfs/best loser wins.pdf',
  therichestmaninbabylon: '/pdfs/the richest man in babylon.pdf',
  secretsofthemillionairemind: '/pdfs/secrets of the millionaire mind.pdf',
  marketwizards: '/pdfs/market wizards.pdf',
  becoming: '/pdfs/becoming.pdf',
  dune: '/pdfs/dune.pdf',
  educated: '/pdfs/educated.pdf',
  'project-hail-mary': '/pdfs/project hail mary.pdf',
  'the-subtle-art-of-not-giving-a-f': '/pdfs/the subtle art of not giving a fck.pdf',
  sapiens: '/pdfs/sapiens.pdf',
  'the-four-agreements': '/pdfs/the four agreements.pdf',
  'the-4-hour-workweek': '/pdfs/the 4 hour workweek.pdf',
  'the-laws-of-human-nature': '/pdfs/the laws of human nature.pdf',
  'thinking-fast-and-slow': '/pdfs/thinking fast and slow.pdf',
  belesszombie: '/pdfs/be less zombie.pdf',
  the48lawsofpower: '/pdfs/the 48 laws of power.pdf',
  the33strategiesofwar: '/pdfs/the 33 strategies of war.pdf',
  relentless: '/pdfs/relentless.pdf',
  'the-intelligent-investor': '/pdfs/the intelligent investor.pdf',
  'one-up-on-wall-street': '/pdfs/one up on wall street.pdf',
  'the-psychology-of-money': '/pdfs/the psychology of money.pdf',
  'one-good-trade': '/pdfs/one good trade.pdf',
  'cant-hurt-me': "/pdfs/can't hurt me.pdf",
  'the-alchemy-of-finance': '/pdfs/the alchemy of finance.pdf',
  'competition-demystified': '/pdfs/competition demystified.pdf',
  'the-4-hour-work-week': '/pdfs/the 4 hour work week.pdf',
  'the-black-swan': '/pdfs/the black swan.pdf',
  'the-playbook': '/pdfs/the playbook.pdf',
  'the-chatgpt-millionaire': '/pdfs/the chatgpt millionaire.pdf',
  'the-miracle-morning': '/pdfs/the miracle morning.pdf',
  'the-first-90-days': '/pdfs/the first 90 days.pdf',
  'leading-change': '/pdfs/leading change.pdf',
  'i-will-teach-you-to-be-rich': '/pdfs/i will teach you to be rich.pdf',
  'money-master-the-game': '/pdfs/money master the game.pdf',
  'the-total-money-makeover': '/pdfs/the total money makeover.pdf',
  'the-7-habits-of-highly-effective-people': '/pdfs/the 7 habits of highly effective people.pdf',
  'how-to-win-friends-and-influence-people': '/pdfs/how to win friends and influence people.pdf',
  'influence-the-psychology-of-persuasion': '/pdfs/influence.pdf',
  'a-random-walk-down-wall-street': '/pdfs/a random walk down wall street.pdf',
  'the-simple-path-to-wealth': '/pdfs/the simple path to wealth.pdf',
  'basic-economics': '/pdfs/basic economics.pdf',
  'black-rednecks-and-white-liberals': '/pdfs/black rednecks and white liberals.pdf',
  'how-to-trade-in-stocks': '/pdfs/how to trade in stocks.pdf',
  'reminiscences-of-a-stock-operator': '/pdfs/reminiscences of a stock operator.pdf',
};

interface SummaryDetailPageProps {
  surface?: ReadingSurface;
}

function CatalogErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto mb-6 flex max-w-5xl flex-wrap items-start justify-between gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800 ring-1 ring-red-100" role="alert">
      <div>
        <p>We couldn&apos;t refresh the book catalog.</p>
        <p className="mt-1 font-medium text-red-700">{message} Existing book content remains available.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-xl bg-white px-4 py-2 font-black text-red-800 ring-1 ring-red-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}

const SummaryDetailPage: React.FC<SummaryDetailPageProps> = ({ surface = 'public' }) => {
  const { bookId: bookIdOrSlug } = useParams<{ bookId: string }>();
  const { currentLanguage, getBookTitle, getBookAuthor, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { updateBookProgress, getBookProgress, isUserDataReady } = useUserProgress();
  const {
    books,
    loading: booksLoading,
    error: booksError,
    refreshBooks,
  } = useBooks();
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const summaryRequestGuard = useRef(new AsyncIdentityGuard()).current;
  const summaryPdfGuard = useRef(new AsyncIdentityGuard()).current;
  const summaryBookIdRef = useRef<string | null>(null);
  const summaryLoadedBookIdRef = useRef<string | null>(null);
  const summaryLoadedLanguageRef = useRef<string | null>(null);

  // Helper function to resolve Arabic slug to book ID
  const resolveBookId = useCallback((idOrSlug: string | undefined): string | undefined => {
    if (!idOrSlug) return undefined;
    if (currentLanguage === 'ar') return resolveArabicSummaryId(idOrSlug);

    // Try to find by ID in Firestore books
    const firestoreBookById = books.find(b => b.id === idOrSlug);
    if (firestoreBookById) return idOrSlug;

    // Try to find by Arabic slug in Firestore books
    const firestoreBookBySlug = books.find(b => b.arabicSlug === idOrSlug);
    return firestoreBookBySlug?.id;
  }, [books, currentLanguage]);

  const bookId = resolveBookId(bookIdOrSlug);
  const currentUserId = user?.id ?? null;
  const summaryPdfIdentity = `${surface}:${currentUserId ?? 'guest'}:${bookIdOrSlug ?? ''}`;
  summaryPdfGuard.setIdentity(summaryPdfIdentity);
  const summaryVisit = useRef(new SummaryVisitTracker());
  summaryVisit.current.observe(currentUserId);

  const displayTitle = book ? (getBookTitle(book.id) === book.id ? book.title : getBookTitle(book.id)) : '';
  const displayAuthor = book ? (getBookAuthor(book.id) === book.id ? book.author : getBookAuthor(book.id)) : '';
  const arabicTranslation = bookId ? arabicBookSummaries[bookId] : undefined;
  const canonicalPath = book ? getSummaryPath(book, currentLanguage) : undefined;
  useSEO({
    title: currentLanguage === 'ar'
      ? (arabicTranslation ? `ملخص كتاب ${arabicTranslation.title}: أهم الأفكار | تحليل` : 'الملخص غير متاح | تحليل')
      : book ? `${displayTitle} Summary: Key Ideas & Takeaways | Ta7leel` : 'Book Summary | Ta7leel',
    description: book
      ? currentLanguage === 'ar' ? arabicTranslation?.description || '' : `Read the practical summary of ${displayTitle} by ${displayAuthor}. Discover key takeaways and lessons from this ${book.category.toLowerCase()} book.`
      : 'Discover practical book summaries and key insights.',
    image: book?.coverImageUrl || '/favicon/ta7leel.png',
    type: 'book',
    language: currentLanguage,
    noindex: surface === 'dashboard' || (currentLanguage === 'ar' ? !arabicTranslation : !booksLoading && !booksError && !bookId),
    canonical: canonicalPath ? new URL(canonicalPath, SITE_URL).href : undefined,
    alternates: book ? getSummaryAlternates(book) : undefined,
  });

  // Personal Notes & Highlights state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);


  useEffect(() => {
    summaryRequestGuard.mount();
    return () => summaryRequestGuard.unmount();
  }, [summaryRequestGuard]);

  useEffect(() => {
    summaryPdfGuard.mount();
    return () => summaryPdfGuard.unmount();
  }, [summaryPdfGuard]);

  const fetchSummary = useCallback(async (currentBook: Book, requestToken: AsyncIdentityToken) => {
    if (!summaryRequestGuard.isCurrent(requestToken)) return;

    if (summaryBookIdRef.current !== currentBook.id) {
      summaryBookIdRef.current = currentBook.id;
      summaryLoadedBookIdRef.current = null;
      summaryLoadedLanguageRef.current = null;
      setSummaryData(null);
    }
    setLoading(true);
    setError(null);

    // First try to get translated summary
    const translatedSummary = getBookSummaryTranslation(currentBook.id, currentLanguage);

    if (translatedSummary) {
      // Use translated summary
      if (!summaryRequestGuard.isCurrent(requestToken)) return;
      setSummaryData({
        summary: translatedSummary.summary,
        keyTakeaways: translatedSummary.keyTakeaways
      });
      summaryLoadedBookIdRef.current = currentBook.id;
      summaryLoadedLanguageRef.current = currentLanguage;
      setLoading(false);
    } else {
      // Load from Firestore
      try {
        const db = getDbInstance();
        const bookRef = doc(db, 'books', currentBook.id);
        const bookDoc = await getDoc(bookRef);

        if (bookDoc.exists()) {
          const firestoreData = bookDoc.data();
          if (firestoreData.summary && firestoreData.keyTakeaways) {
            if (!summaryRequestGuard.isCurrent(requestToken)) return;
            setSummaryData({
              summary: firestoreData.summary,
              keyTakeaways: firestoreData.keyTakeaways
            });
            summaryLoadedBookIdRef.current = currentBook.id;
            summaryLoadedLanguageRef.current = currentLanguage;
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading from Firestore:', err);
      }

      const localSummary = getLocalBookSummary(currentBook.id, currentLanguage);
      if (localSummary) {
        if (!summaryRequestGuard.isCurrent(requestToken)) return;
        setSummaryData(localSummary);
        summaryLoadedBookIdRef.current = currentBook.id;
        summaryLoadedLanguageRef.current = currentLanguage;
        setLoading(false);
        return;
      }

      // Final fallback: show placeholder
      if (!summaryRequestGuard.isCurrent(requestToken)) return;
      setSummaryData({
        summary: t('summaryComingSoon') || "This book summary is coming soon. We're working on providing detailed summaries for all books in our collection.",
        keyTakeaways: [
          t('summaryInDevelopment') || "Summary in development",
          t('checkBackSoon') || "Check back soon for detailed content"
        ]
      });
      summaryLoadedBookIdRef.current = currentBook.id;
      summaryLoadedLanguageRef.current = currentLanguage;
      setLoading(false);
    }
  }, [currentLanguage, summaryRequestGuard, t]);

  useEffect(() => {
    const requestIdentity = bookIdOrSlug ?? null;
    summaryRequestGuard.setIdentity(requestIdentity);
    const requestToken = summaryRequestGuard.begin(requestIdentity);
    if (!requestToken) return () => undefined;

    // Wait for books to load if they are loading
    if (booksLoading && books.length === 0) {
      setBook(undefined);
      setError(null);
      setLoading(true);
      summaryBookIdRef.current = null;
      summaryLoadedBookIdRef.current = null;
      summaryLoadedLanguageRef.current = null;
      setSummaryData(null);
      return () => summaryRequestGuard.invalidate();
    }

    // A failed catalog request is not evidence that the requested book does
    // not exist. Keep the failure distinct so readers have a recovery path.
    if (booksError && books.length === 0) {
      setBook(undefined);
      setError(booksError);
      setLoading(false);
      summaryBookIdRef.current = null;
      summaryLoadedBookIdRef.current = null;
      summaryLoadedLanguageRef.current = null;
      setSummaryData(null);
      return () => summaryRequestGuard.invalidate();
    }

    const currentBook = books.find((b) => b.id === bookId);
    setBook(currentBook);
    if (currentBook) {
      if (
        summaryLoadedBookIdRef.current !== currentBook.id
        || summaryLoadedLanguageRef.current !== currentLanguage
      ) {
        void fetchSummary(currentBook, requestToken);
      } else {
        setError(null);
        setLoading(false);
      }

    } else {
      summaryBookIdRef.current = null;
      summaryLoadedBookIdRef.current = null;
      summaryLoadedLanguageRef.current = null;
      setSummaryData(null);
      // Only set error if we are sure the book is not found (books are loaded)
      if (!booksLoading) {
        setError(booksError || t('bookNotFound') || "Book not found.");
        setLoading(false);
      }
    }

    // Refresh translated summary when language changes
    const handleLanguageChange = () => {
      if (currentBook) {
        const languageToken = summaryRequestGuard.begin(requestIdentity);
        if (languageToken) void fetchSummary(currentBook, languageToken);
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);

    // Cleanup event listener on component unmount
    return () => {
      summaryRequestGuard.invalidate();
      window.removeEventListener('languagechange', handleLanguageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, bookIdOrSlug, books, booksError, booksLoading, fetchSummary, summaryRequestGuard, t]);

  // User-scoped progress must wait for the captured identity's local record to
  // hydrate. The tracker makes this idempotent across hydration rerenders and
  // StrictMode-style effect repeats while still allowing a new account visit.
  useEffect(() => {
    if (!isAuthenticated || !bookId
      || !summaryVisit.current.shouldRecord(currentUserId, bookId, isUserDataReady)) return;

    const currentProgress = getBookProgress(bookId);
    const newProgress = currentProgress ? Math.min(currentProgress.progress + 25, 100) : 25;
    updateBookProgress(bookId, newProgress);
  }, [bookId, currentUserId, getBookProgress, isAuthenticated, isUserDataReady, updateBookProgress]);

  const handleDownloadPdf = useCallback(async () => {
    if (!book) return;
    if (currentLanguage === 'ar') {
      window.print();
      return;
    }

    if (!isAuthenticated) {
      setShowSignUpModal(true);
      return;
    }

    const directPdfUrl = book.arabicPdfUrl || PDF_PATHS[book.id];
    const pdfToken = summaryPdfGuard.begin(summaryPdfIdentity);
    if (!pdfToken) return;

    if (directPdfUrl) {
      if (summaryPdfGuard.isCurrent(pdfToken)) {
        window.open(directPdfUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (!summaryData || !summaryPdfGuard.isCurrent(pdfToken)) return;

    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
      });

      const title = getBookTitle(book.id);
      const author = getBookAuthor(book.id);

      doc.setFontSize(24);
      doc.text(title, 20, 22);

      doc.setFontSize(14);
      doc.text(`By: ${author}`, 20, 32);

      doc.setFontSize(18);
      doc.text('Key Takeaways', 20, 48);
      doc.setFontSize(11);

      let yPos = 58;
      summaryData.keyTakeaways.forEach((takeaway, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${takeaway.replace(/\*\*/g, '')}`, 170);
        if (yPos + lines.length * 7 > 280) {
          doc.addPage();
          yPos = 22;
        }
        doc.text(lines, 20, yPos);
        yPos += 7 * lines.length + 3;
      });

      yPos += 6;
      if (yPos > 265) {
        doc.addPage();
        yPos = 22;
      }

      doc.setFontSize(18);
      doc.text('Detailed Summary', 20, yPos);
      doc.setFontSize(11);
      yPos += 10;

      const summaryLines = doc.splitTextToSize(summaryData.summary.replace(/\*\*/g, ''), 170);
      summaryLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 22;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
      openPdfBlobUrl(pdfBlob, {
        canCommit: () => summaryPdfGuard.isCurrent(pdfToken),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (summaryPdfGuard.isCurrent(pdfToken)) {
        alert('Failed to generate PDF. Please try again.');
      }
    }
  }, [book, currentLanguage, getBookAuthor, getBookTitle, isAuthenticated, summaryData, summaryPdfGuard, summaryPdfIdentity]);

  const summaryCatalogState = getSummaryCatalogSurfaceState({
    loading: booksLoading,
    error: booksError,
    hasBook: Boolean(book),
  });

  if (summaryCatalogState === 'loading') {
    return (
      <div className="flex min-h-48 items-center justify-center" role="status" aria-label="Loading book">
        <Spinner />
      </div>
    );
  }

  if (summaryCatalogState === 'error' && !book) {
    return (
      <>
        <CatalogErrorBanner message={booksError || 'Please try again.'} onRetry={() => { void refreshBooks(); }} />
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold" style={{ color: '#2F4F4F' }}>We couldn&apos;t load this book</h1>
          <p className="mt-2 text-gray-600">The catalog request failed before we could confirm this book.</p>
        </div>
      </>
    );
  }

  if (summaryCatalogState === 'not-found') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#2F4F4F' }}>{t('bookNotFound') || 'Book Not Found'}</h1>
        <p className="text-gray-600 mt-2">{t('bookNotFoundMessage') || "We couldn't find the book you were looking for."}</p>
        <Link to={getBookLibraryHref(surface)} className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors" style={{ backgroundColor: '#FF7F50' }}>
          {t('backToSummaries') || 'Back to Summaries'}
        </Link>
      </div>
    );
  }

  const hasSummaryForCurrentBook = Boolean(book && summaryData && summaryBookIdRef.current === book.id);
  const showRedesignedLayout = Boolean(
    hasSummaryForCurrentBook
    && !error
    && (!loading || Boolean(booksError)),
  );

  return (
    <>
      {booksError && <CatalogErrorBanner message={booksError} onRetry={() => { void refreshBooks(); }} />}
      {surface === 'public' && book && (
        <StructuredData
          type="book"
          name={displayTitle}
          author={displayAuthor}
          image={book.coverImageUrl}
          description={summaryData?.summary.substring(0, 200) || ''}
          genre={[book.category]}
        />
      )}
      <ReadingProgressBar />
      {book && summaryData && showRedesignedLayout && (
        <SummaryReadingExperience
          book={book}
          bookId={bookId || book.id}
          summaryData={summaryData}
          displayTitle={displayTitle}
          displayAuthor={displayAuthor}
          isAuthenticated={isAuthenticated}
          onDownloadPdf={handleDownloadPdf}
          onAddNote={() => setShowAddNoteModal(true)}
          onRequireSignUp={() => setShowSignUpModal(true)}
          getBookSummaryHref={(candidate) => getBookSummaryHref(candidate, surface)}
          t={t}
          surface={surface}
          language={currentLanguage}
        />
      )}
      {bookId && showRedesignedLayout && currentLanguage === 'en' && (
        <div className="bg-[#f7f3ed] px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <BookReviews bookId={bookId} />
          </div>
        </div>
      )}
      {!showRedesignedLayout && (
        <div className="bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 rounded-lg shadow-xl max-w-5xl mx-auto">
        {book && (
          <header className="mb-4 sm:mb-6 text-center border-b border-gray-200 pb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2F4F4F' }}>{displayTitle}</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-3">by {displayAuthor}</p>

            {/* Rating and Book Info */}
            {book.rating && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(book.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{book.rating.toFixed(2)}</span>
                  {book.ratingsCount && (
                    <span className="text-gray-500">({book.ratingsCount} ratings)</span>
                  )}
                </div>

                {book.publicationYear && (
                  <span className="text-gray-500">| {book.publicationYear}</span>
                )}

                {book.pageCount && (
                  <span className="text-gray-500">| {book.pageCount} pages</span>
                )}
              </div>
            )}
          </header>
        )}

        {/* Mobile Scroll Indicator - Only visible on mobile */}
        <div className="block md:hidden mb-6">
          <div className="flex flex-col items-center justify-center py-2 animate-bounce">
            <p className="text-sm text-gray-600 font-medium mb-2">Scroll down to read more</p>
            <svg
              className="w-6 h-6 text-indigo-600 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Want to read the full book? Section */}
        {book && !loading && (
          <div className="mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 text-center border border-indigo-100 shadow-md relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 end-0 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 start-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-bold mb-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Want to read the full book?
              </h3>
              <p className="text-gray-600 mb-4 text-xs md:text-sm">
                Get the complete experience on your favorite platform
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Dynamic Links */}
                {book.amazonUrl && (
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span>Amazon</span>
                  </a>
                )}

                {book.kindleUrl && (
                  <a
                    href={book.kindleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                    </svg>
                    <span>Kindle</span>
                  </a>
                )}

                {book.audibleUrl && (
                  <a
                    href={book.audibleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                    </svg>
                    <span>Audible</span>
                  </a>
                )}

                {book.arabicPdfUrl && (
                  isAuthenticated ? (
                    <a
                      href={book.arabicPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-green-400 text-sm"
                    >
                      <svg className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>الكتاب بالعربية</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowSignUpModal(true)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-green-400 text-sm"
                    >
                      <svg className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>الكتاب بالعربية</span>
                    </button>
                  )
                )}

                {/* Fallback for existing hardcoded books if no dynamic links are present */}
                {!book.amazonUrl && !book.kindleUrl && !book.audibleUrl && !book.arabicPdfUrl && (
                  <>
                    {book.id === 'reminiscences-of-a-stock-operator' ? (
                      <>
                        <a
                          href="https://link.amazon/B0gxXWgZL"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0bLauC5q"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B04la00Rc"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'trading-in-the-zone' ? (
                      <>
                        <a
                          href="https://link.amazon/B0cQK8a9W"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0g7qLQve"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>
                      </>
                    ) : book.id === 'the-intelligent-investor' ? (
                      <>
                        <a
                          href="https://link.amazon/B0b5VsNVp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0bSUnxhF"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B07wplSg0"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'educated' ? (
                      <>
                        <a
                          href="https://link.amazon/B0j9o7mIb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B002NRCIN"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B00xiVOA7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'marketwizards' ? (
                      <>
                        <a
                          href="https://link.amazon/B04iP0SQC"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0dgWBUMg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>
                      </>
                    ) : book.id === 'best-loser-wins' ? (
                      <>
                        <a
                          href="https://link.amazon/B0ewbeYG3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B08KQPcJO"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0eJfqDQ8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'becoming' ? (
                      <>
                        <a
                          href="https://link.amazon/B07xkYF6I"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B06yrMiLK"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0ih7CY01"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'atomic-habits' ? (
                      <>
                        <a
                          href="https://link.amazon/B07Z4Mby9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B09U4kcyD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B07Hhl4R8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'broken-money' ? (
                      <>
                        <a
                          href="https://link.amazon/B0dWsjm1J"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0fjza9Ec"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B03eO9cZA"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'sapiens' ? (
                      <>
                        <a
                          href="https://link.amazon/B0iMrUKhE"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B01I86ldM"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B09vu3VL5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'thinking-fast-and-slow' ? (
                      <>
                        <a
                          href="https://link.amazon/B05bezPev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0eTsZfuY"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B07Fp3aI7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-alchemist' ? (
                      <>
                        <a
                          href="https://link.amazon/B05WjglgS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B03ByO5ZR"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0ffltRLl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-four-agreements' ? (
                      <>
                        <a
                          href="https://link.amazon/B0fKTakMG"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0178xyZK"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B007r9XvI"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'dune' ? (
                      <>
                        <a
                          href="https://link.amazon/B07byoZDh"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B04PntysP"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B05xlkYbp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'project-hail-mary' ? (
                      <>
                        <a
                          href="https://link.amazon/B0hXTbJIf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0fchFcXR"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B01M5uzrd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'rich-dad-poor-dad' ? (
                      <>
                        <a
                          href="https://link.amazon/B0gZF8L5Q"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hQz33te"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B058bMtxO"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'americas-bank' ? (
                      <>
                        <a
                          href="https://link.amazon/B05Os9lve"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0b37Tzhk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B06guwNrH"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the33strategiesofwar' ? (
                      <>
                        <a
                          href="https://link.amazon/B067pEd6L"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B07SdaKmB"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B06KOxRLB"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'belesszombie' ? (
                      <>
                        <a
                          href="https://link.amazon/B09pP3D6H"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0ajCRpuk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>
                      </>
                    ) : book.id === 'howtodaytradeforaliving' ? (
                      <>
                        <a
                          href="https://link.amazon/B062GweDb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0dAAAjD9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B09jWiikE"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the48lawsofpower' ? (
                      <>
                        <a
                          href="https://link.amazon/B0c5c8zHF"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B09J92TGm"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0e9ruxLK"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'secretsofthemillionairemind' ? (
                      <>
                        <a
                          href="https://link.amazon/B0dcjjPBS"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0fw8wFLE"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B08MKaizU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'relentless' ? (
                      <>
                        <a
                          href="https://link.amazon/B0a46brzF"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0cZskrJ6"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hd2oDgC"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'one-good-trade' ? (
                      <>
                        <a
                          href="https://link.amazon/B01pnyQWj"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B04MEorA8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0dXVgMIu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'cant-hurt-me' ? (
                      <>
                        <a
                          href="https://link.amazon/B0eQIxtFR"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0g6zF9VK"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B041ETZRN"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-alchemy-of-finance' ? (
                      <>
                        <a
                          href="https://link.amazon/B00xLdcsr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0i9042wz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'competition-demystified' ? (
                      <>
                        <a
                          href="https://link.amazon/B0fWp0QD1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B085HBrEr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B01vXoMIW"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-4-hour-workweek' ? (
                      <>
                        <a
                          href="https://link.amazon/B06OoZ7W3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B08nNJ5F0"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B062kPjHV"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-4-hour-work-week' ? (
                      <>
                        <a
                          href="https://link.amazon/B06OoZ7W3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B08nNJ5F0"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B062kPjHV"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-black-swan' ? (
                      <>
                        <a
                          href="https://link.amazon/B09pzk2TT"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B00hmn6ab"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B03DNR30b"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-chatgpt-millionaire' ? (
                      <>
                        <a
                          href="https://link.amazon/B01OLJcKn"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0foVpJxW"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0bUoKQrZ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-first-90-days' ? (
                      <>
                        <a
                          href="https://link.amazon/B0b0vNI10"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B09nZErUE"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B00zV2MlX"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'leading-change' ? (
                      <>
                        <a
                          href="https://link.amazon/B08jFiHBx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B01IotMNv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B071AIYJg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'i-will-teach-you-to-be-rich' ? (
                      <>
                        <a
                          href="https://link.amazon/B0b2P0sF3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hI6OAQY"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hkBPERj"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'money-master-the-game' ? (
                      <>
                        <a
                          href="https://link.amazon/B0gQw1VUr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B09c8IGS8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0dSdzCSw"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-7-habits-of-highly-effective-people' ? (
                      <>
                        <a
                          href="https://link.amazon/B0auU76SR"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B08duRADY"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0bhFvAIg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'how-to-win-friends-and-influence-people' ? (
                      <>
                        <a
                          href="https://link.amazon/B07soJDKk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0jj4fwC3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B08UiaGEO"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'influence-the-psychology-of-persuasion' ? (
                      <>
                        <a
                          href="https://link.amazon/B0bgb9dNa"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0dql1vLt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hMgeJLw"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'a-random-walk-down-wall-street' ? (
                      <>
                        <a
                          href="https://link.amazon/B05JvZ9vs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B05wmxs0E"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'the-simple-path-to-wealth' ? (
                      <>
                        <a
                          href="https://link.amazon/B04xqckA5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0grp9Ii4"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B00aW9anz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'basic-economics' ? (
                      <>
                        <a
                          href="https://link.amazon/B0bM18t7i"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B07IkG2D7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B0hHX3M6S"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'black-rednecks-and-white-liberals' ? (
                      <>
                        <a
                          href="https://link.amazon/B0gvlFjYg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B0bU6L14L"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B085eu3Q3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'how-to-trade-in-stocks' ? (
                      <>
                        <a
                          href="https://link.amazon/B0eDJgUGl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B06b5b2VD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B08IklGMr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : book.id === 'one-up-on-wall-street' ? (
                      <>
                        <a
                          href="https://link.amazon/B0fqjsgm9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </a>

                        <a
                          href="https://link.amazon/B045aay5p"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </a>

                        <a
                          href="https://link.amazon/B09SdwtPb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                        >
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm">
                          <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Amazon</span>
                        </button>

                        <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm">
                          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z" />
                          </svg>
                          <span>Kindle</span>
                        </button>

                        <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm">
                          <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
                          </svg>
                          <span>Audible</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && <Spinner />}
        {error && <ErrorMessage message={error} />}

        {summaryData && !loading && (
          <article>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="lg:col-span-1">
                {book && (
                  <div className="sticky top-6">
                    <div className="relative">
                      <img src={book.coverImageUrl} alt={`Cover of ${getBookTitle(book.id)}`} className="w-full h-auto rounded-lg shadow-lg mb-4" />
                      {/* Favorite Button */}
                      <div className="absolute top-3 end-3">
                        <FavoriteButton bookId={book.id} size="md" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 sm:p-6 shadow-lg border border-indigo-100/50 relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 end-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute bottom-0 start-0 w-40 h-40 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 flex items-center">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl me-3 shadow-lg shadow-indigo-500/30">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {t('keyTakeaways') || 'Key Takeaways'}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {summaryData.keyTakeaways.map((takeaway, index) => {
                      // Remove markdown asterisks from takeaways
                      const cleanTakeaway = takeaway.replace(/\*\*/g, '').replace(/^\*\s*/, '').replace(/\*/g, '');
                      return (
                        <div 
                          key={index} 
                          className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-indigo-200 hover:-translate-y-1 relative overflow-hidden"
                        >
                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300 rounded-xl"></div>
                          
                          {/* Number badge */}
                          <div className="absolute -top-1 -start-1 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-se-xl rounded-ss-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          
                          <div className="relative z-10 ps-5 pt-1">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">{cleanTakeaway}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center mb-3 sm:mb-0" style={{ color: '#2F4F4F' }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 me-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t('detailedSummary') || 'Detailed Summary'}
                </h2>
                <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:items-center sm:gap-4">
                  {isAuthenticated ? (
                    <button
                      onClick={async () => {
                        if (!book) return;
                        const pdfToken = summaryPdfGuard.begin(summaryPdfIdentity);
                        if (!pdfToken) return;

                        const directPdfUrl = book.arabicPdfUrl || PDF_PATHS[book.id];
                        if (directPdfUrl) {
                          if (summaryPdfGuard.isCurrent(pdfToken)) {
                            window.open(directPdfUrl, '_blank', 'noopener,noreferrer');
                          }
                          return;
                        }

                        // For other books, generate PDF dynamically
                        // Lazy load jsPDF only when needed (saves 385KB from initial bundle!)
                        if (!summaryData || !summaryPdfGuard.isCurrent(pdfToken)) return;

                        try {
                          // Dynamic import - only loads when user clicks download
                          const { default: jsPDF } = await import('jspdf');

                          // Use English content for Arabic-style PDF since Arabic translations were removed
                          const doc = new jsPDF({
                            orientation: 'p',
                            unit: 'mm',
                            format: 'a4',
                            putOnlyUsedFonts: true
                          });

                          // Set RTL mode for Arabic-style layout
                          doc.setR2L(true);

                          const title = getBookTitle(book.id);
                          const author = getBookAuthor(book.id);

                          // Create the PDF with Arabic-style layout
                          doc.setFontSize(24);
                          doc.text(title, 190, 20, { align: 'right' });

                          doc.setFontSize(16);
                          doc.text(`By: ${author}`, 190, 30, { align: 'right' });

                          doc.setFontSize(18);
                          doc.text('Key Takeaways:', 190, 45, { align: 'right' });
                          doc.setFontSize(12);

                          let yPos = 55;
                          summaryData.keyTakeaways.forEach((takeaway) => {
                            const lines = doc.splitTextToSize(`• ${takeaway}`, 170);
                            doc.text(lines, 190, yPos, { align: 'right' });
                            yPos += 10 * lines.length;
                          });

                          doc.setFontSize(18);
                          yPos += 10;
                          doc.text('Detailed Summary:', 190, yPos, { align: 'right' });
                          doc.setFontSize(12);
                          yPos += 10;

                          const summaryLines = doc.splitTextToSize(summaryData.summary, 170);
                          doc.text(summaryLines, 190, yPos, { align: 'right' });

                          // Open in new tab using blob URL with proper MIME type
                          const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
                          openPdfBlobUrl(pdfBlob, {
                            canCommit: () => summaryPdfGuard.isCurrent(pdfToken),
                          });
                        } catch (error) {
                          console.error('Error generating PDF:', error);
                          if (summaryPdfGuard.isCurrent(pdfToken)) {
                            alert('Failed to generate PDF. Please try again.');
                          }
                        }
                      }}
                      className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 hover:bg-[100%_100%] border-2 border-orange-400 hover:border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_25px_rgba(251,146,60,0.8)]"
                    >
                      {/* Animated neon border */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300 animate-gradient-xy"></div>

                      {/* Button background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-xl"></div>

                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-orange-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="relative z-10 arabic-btn">الكتاب بالعربية</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSignUpModal(true)}
                      className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 hover:bg-[100%_100%] border-2 border-orange-400 hover:border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_25px_rgba(251,146,60,0.8)]"
                    >
                      {/* Animated neon border */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300 animate-gradient-xy"></div>

                      {/* Button background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-xl"></div>

                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-orange-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>

                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="relative z-10 arabic-btn">الكتاب بالعربية</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl shadow-inner">
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-4 sm:space-y-6">
                    <HighlightableText bookId={bookId || ''}>
                      <MarkdownRenderer content={summaryData.summary} />
                    </HighlightableText>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Reviews Section */}
            {bookId && (
              <BookReviews bookId={bookId} />
            )}

            {/* Ko-fi Support Section */}
            <div className="mt-8 flex justify-center">
              <a
                href="https://ko-fi.com/ta7leel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-110 active:scale-95"
              >
                <img
                  src="/ko-fi icon.webp"
                  alt="Support us on Ko-fi"
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </article>
        )}

        {/* Add Note Modal */}
        <AddNoteModal
          bookId={bookId || ''}
          isOpen={showAddNoteModal}
          onClose={() => setShowAddNoteModal(false)}
          surface={surface}
        />

        {/* Sign Up Prompt Modal */}
        <SignUpPromptModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
        />
        </div >
      )}

      {showRedesignedLayout && (
        <>
          <AddNoteModal
            bookId={bookId || ''}
            isOpen={showAddNoteModal}
            onClose={() => setShowAddNoteModal(false)}
            surface={surface}
          />

          <SignUpPromptModal
            isOpen={showSignUpModal}
            onClose={() => setShowSignUpModal(false)}
          />
        </>
      )}

      {/* You May Also Like Section */}
      {
        book && currentLanguage === 'en' && (
          <YouMayAlsoLike
            currentBookId={book.id}
            currentBookCategory={book.category}
            books={books}
            maxBooks={8}
            getBookSummaryHref={(candidate) => getBookSummaryHref(candidate, surface)}
          />
        )
      }
    </>
  );
};

export default SummaryDetailPage;
