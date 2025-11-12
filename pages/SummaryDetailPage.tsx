import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BOOKS, BOOK_SUMMARIES } from '../constants';
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
// Lazy load jsPDF - only when user clicks download (saves 385KB from initial bundle!)
// import jsPDF from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';
import { getBookSummaryTranslation } from '../translations/bookSummaries';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import useSEO from '../hooks/useSEO';
import StructuredData from '../components/StructuredData';

const SummaryDetailPage: React.FC = () => {
  const { bookId: bookIdOrSlug } = useParams<{ bookId: string }>();
  const { currentLanguage, getBookTitle, getBookAuthor, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { updateBookProgress, recordReadingActivity, getBookProgress } = useUserProgress();
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to resolve Arabic slug to book ID
  const resolveBookId = (idOrSlug: string | undefined): string | undefined => {
    if (!idOrSlug) return undefined;
    
    // First, try to find book by ID directly
    const bookById = BOOKS.find(b => b.id === idOrSlug);
    if (bookById) return idOrSlug;
    
    // If not found, try to find by Arabic slug
    const bookBySlug = BOOKS.find(b => b.arabicSlug === idOrSlug);
    return bookBySlug?.id;
  };

  const bookId = resolveBookId(bookIdOrSlug);

  // SEO for the current book
  useSEO({
    title: book 
      ? `${getBookTitle(book.id)} by ${getBookAuthor(book.id)} - Summary & Key Insights | BookBriefs`
      : 'Book Summary | BookBriefs',
    description: book 
      ? `Read the comprehensive summary of ${getBookTitle(book.id)} by ${getBookAuthor(book.id)}. Discover key takeaways, insights, and lessons from this ${book.category.toLowerCase()} book in minutes.`
      : 'Discover book summaries and key insights.',
    keywords: book 
      ? `${getBookTitle(book.id)}, ${getBookAuthor(book.id)}, book summary, key takeaways, ${book.category}, book insights, book review`
      : 'book summary, book insights',
    image: book?.coverImageUrl || '/images/og-default.jpg',
    type: 'book',
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Personal Notes & Highlights state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);


  const fetchSummary = useCallback((currentBook: Book) => {
    setLoading(true);
    setError(null);
    
    // First try to get translated summary
    const translatedSummary = getBookSummaryTranslation(currentBook.id, currentLanguage);
    
    if (translatedSummary) {
      // Use translated summary
      setSummaryData({
        summary: translatedSummary.summary,
        keyTakeaways: translatedSummary.keyTakeaways
      });
      setLoading(false);
    } else {
      // Fallback to original English summary
      const bookSummary = BOOK_SUMMARIES.find(summary => summary.id === currentBook.id);
      
      if (bookSummary) {
        setSummaryData({
          summary: bookSummary.summary,
          keyTakeaways: bookSummary.keyTakeaways
        });
        setLoading(false);
      } else {
        // Final fallback: show placeholder
        setSummaryData({
          summary: t('summaryComingSoon') || "This book summary is coming soon. We're working on providing detailed summaries for all books in our collection.",
          keyTakeaways: [
            t('summaryInDevelopment') || "Summary in development", 
            t('checkBackSoon') || "Check back soon for detailed content"
          ]
        });
        setLoading(false);
      }
    }
  }, [currentLanguage, t]);

  useEffect(() => {
    const currentBook = BOOKS.find((b) => b.id === bookId);
    setBook(currentBook);
    if (currentBook) {
      fetchSummary(currentBook);
      
      // Record reading activity when user opens a book summary
      if (isAuthenticated && bookId) {
        recordReadingActivity();
        
        // Update book progress - add 25% progress each time they visit
        const currentProgress = getBookProgress(bookId);
        const newProgress = currentProgress ? Math.min(currentProgress.progress + 25, 100) : 25;
        updateBookProgress(bookId, newProgress);
      }
    } else {
      setError(t('bookNotFound') || "Book not found.");
      setLoading(false);
    }

    // Listen for language changes
    const handleLanguageChange = () => {
      if (currentBook) {
        fetchSummary(currentBook);
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);
    
    // Cleanup speech synthesis and event listener on component unmount
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, fetchSummary]);

  const handleToggleSpeech = () => {
    if (!summaryData) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const translatedTitle = book ? getBookTitle(book.id) : book?.title;
      const textToSpeak = `Summary for ${translatedTitle}. ${summaryData.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        console.error("Speech synthesis error");
        setIsSpeaking(false);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!book && !loading) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold" style={{color: '#2F4F4F'}}>{t('bookNotFound') || 'Book Not Found'}</h1>
            <p className="text-gray-600 mt-2">{t('bookNotFoundMessage') || "We couldn't find the book you were looking for."}</p>
            <Link to="/summaries" className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors" style={{backgroundColor: '#FF7F50'}}>
                {t('backToSummaries') || 'Back to Summaries'}
            </Link>
        </div>
    );
  }

  return (
    <>
      {book && (
        <StructuredData 
          type="book"
          name={getBookTitle(book.id)}
          author={getBookAuthor(book.id)}
          image={book.coverImageUrl}
          description={summaryData?.summary.substring(0, 200) || ''}
          genre={[book.category]}
        />
      )}
      <ReadingProgressBar />
      <div className="bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 rounded-lg shadow-xl max-w-5xl mx-auto">
        {book && (
        <header className="mb-4 sm:mb-6 text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2F4F4F' }}>{getBookTitle(book.id)}</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-3">by {getBookAuthor(book.id)}</p>
          
          {/* Rating and Book Info */}
          {book.rating && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(book.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
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
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg md:text-xl font-bold mb-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Want to read the full book?
            </h3>
            <p className="text-gray-600 mb-4 text-xs md:text-sm">
              Get the complete experience on your favorite platform
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {book.id === 'trading-in-the-zone' ? (
                <>
                  <a 
                    href="https://amzn.to/4n8z3I7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4n1pnPi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/43jrnLQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-intelligent-investor' ? (
                <>
                  <a 
                    href="https://amzn.to/4nOFXTT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4763wAi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/46QHaUS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'educated' ? (
                <>
                  <a 
                    href="https://amzn.to/4nJ8jyV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3KLPRqS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4q4qEIp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'marketwizards' ? (
                <>
                  <a 
                    href="https://amzn.to/4nRy6oJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/46SyIEs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qeGdgM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thedisciplinedtrader' ? (
                <>
                  <a 
                    href="https://amzn.to/3WoeWuF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3WFDu20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nLwlJx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thementalgameoftrading' ? (
                <>
                  <a 
                    href="https://amzn.to/46Qkmof"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3IJ7IOF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/470yzO1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'best-loser-wins' ? (
                <>
                  <a 
                    href="https://amzn.to/3W0goTJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/47aKyc4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/473Agu7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'becoming' ? (
                <>
                  <a 
                    href="https://amzn.to/4qqFV6D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/46PAZ3d"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/47jnSHL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thezentrader' ? (
                <>
                  <a 
                    href="https://amzn.to/3W3DqsQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nn5kLL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4mYR6Ah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'atomic-habits' ? (
                <>
                  <a 
                    href="https://amzn.to/42EOe4j"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3KVuXWd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/47oavpG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'broken-money' ? (
                <>
                  <a 
                    href="https://amzn.to/4n6vfqx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/43cdcbr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4mYRxup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'sapiens' ? (
                <>
                  <a 
                    href="https://amzn.to/43jv5VM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nV4B5w"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qaeVrH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thinking-fast-and-slow' ? (
                <>
                  <a 
                    href="https://amzn.to/46NEyHg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/47miWln"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nL5zRv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-alchemist' ? (
                <>
                  <a 
                    href="https://amzn.to/46P8QcF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3KOGW83"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nI5DS4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-four-agreements' ? (
                <>
                  <a 
                    href="https://amzn.to/48prwAZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/473bZ7w"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4mYS1Rf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'dune' ? (
                <>
                  <a 
                    href="https://amzn.to/43j0O9z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nL63XP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3WFGbRa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'project-hail-mary' ? (
                <>
                  <a 
                    href="https://amzn.to/4q8Edq1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nLz9X5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/473CI3N"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-subtle-art-of-not-giving-a-f' ? (
                <>
                  <a 
                    href="https://amzn.to/46QKP54"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4ombJrp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3J8x88e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'rich-dad-poor-dad' ? (
                <>
                  <a 
                    href="https://amzn.to/3Wyk9zU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/48nupSO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/470Bczn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'americas-bank' ? (
                <>
                  <a 
                    href="https://amzn.to/4og7AVA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/42CZ8aT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/42CZ9vt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'therichestmaninbabylon' ? (
                <>
                  <a 
                    href="https://amzn.to/4om40tm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/437t5Qs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nRPf1w"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the33strategiesofwar' ? (
                <>
                  <a 
                    href="https://amzn.to/3KM3qXi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qnFkCC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nJcwTf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thinkandgrowrich' ? (
                <>
                  <a 
                    href="https://amzn.to/490gcv9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/48YfYVp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4927jkS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'belesszombie' ? (
                <>
                  <a 
                    href="https://amzn.to/4nT4Bmu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qavow4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qavow4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'tradelikeastockmarketwizard' ? (
                <>
                  <a 
                    href="https://amzn.to/498yQ42"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4htpvq1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4htpvq1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'howtodaytradeforaliving' ? (
                <>
                  <a 
                    href="https://amzn.to/46WKf4g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/475aqpL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3IMQ6RY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the48lawsofpower' ? (
                <>
                  <a 
                    href="https://amzn.to/4n5mDk2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3L8qOhG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3JcUee1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'thelawsofhumannature' ? (
                <>
                  <a 
                    href="https://amzn.to/476eW7s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3W0KCpE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/471422B"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'secretsofthemillionairemind' ? (
                <>
                  <a 
                    href="https://amzn.to/4onA4NA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4ogCQUq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oelK9L"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'relentless' ? (
                <>
                  <a 
                    href="https://amzn.to/42GMWWB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3W54Y14"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/42GgALA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'one-good-trade' ? (
                <>
                  <a 
                    href="https://amzn.to/4oiXe7o"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3W6Qk9q"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4omIvIW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'cant-hurt-me' ? (
                <>
                  <a 
                    href="https://amzn.to/3IYWju7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4hmAod6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4o4CqRm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-alchemy-of-finance' ? (
                <>
                  <a 
                    href="https://amzn.to/4nTagZ1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oCNZjc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nSGROh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'competition-demystified' ? (
                <>
                  <a 
                    href="https://amzn.to/3KXXScb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nWz1nI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4orvbTB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-4-hour-workweek' ? (
                <>
                  <a 
                    href="https://amzn.to/47DQ2gI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4hkoK2e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/47u42bU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-4-hour-work-week' ? (
                <>
                  <a 
                    href="https://amzn.to/4ovvsEV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4hkoK2e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oDnv0J"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-black-swan' ? (
                <>
                  <a 
                    href="https://amzn.to/49wxssz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oKYAsc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/444ACjn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-playbook' ? (
                <>
                  <a 
                    href="https://amzn.to/49MqwHE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oGdvnQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oGdvnQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-chatgpt-millionaire' ? (
                <>
                  <a 
                    href="https://amzn.to/4hPWKng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3LwDaAx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oyH5LI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-miracle-morning' ? (
                <>
                  <a 
                    href="https://amzn.to/4oIwOwm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3WpP4yv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/43J3Xjd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'trading-for-a-living' ? (
                <>
                  <a 
                    href="https://amzn.to/437cE6M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4omGVHo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4ofounL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-first-90-days' ? (
                <>
                  <a 
                    href="https://amzn.to/4nH7Ufp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/47wObuj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/43jItcL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'traction' ? (
                <>
                  <a 
                    href="https://amzn.to/3XhtQ63"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4nJ9WvC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4oY8ruz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'leading-change' ? (
                <>
                  <a 
                    href="https://amzn.to/4oZOyTV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/49I7BxA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4qQPsDT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'i-will-teach-you-to-be-rich' ? (
                <>
                  <a 
                    href="https://amzn.to/49diaJ1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3LuPi5b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3LwC6N3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'money-master-the-game' ? (
                <>
                  <a 
                    href="https://amzn.to/488ydqk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/43lLbP0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3Jw643f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-total-money-makeover' ? (
                <>
                  <a 
                    href="https://amzn.to/4ouPEqU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/49ge4Qf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/4hS3DVe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-7-habits-of-highly-effective-people' ? (
                <>
                  <a 
                    href="https://amzn.to/4nVGTVZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3WSsCy5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3JwEe73"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'the-psychology-of-money' ? (
                <>
                  <a 
                    href="https://amzn.to/4oyOdrp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/4hXn0fJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/49NceGJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : book.id === 'one-up-on-wall-street' ? (
                <>
                  <a 
                    href="https://amzn.to/4owUzHL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </a>

                  <a 
                    href="https://amzn.to/3JNxstA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </a>

                  <a 
                    href="https://amzn.to/3JNxstA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm"
                  >
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </a>
                </>
              ) : (
                <>
                  <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-400 text-sm">
                    <svg className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Amazon</span>
                  </button>

                  <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 text-sm">
                    <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V8h2v2zm0-4H7V4h2v2zm8 12h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V8h6v2zm0-4h-6V4h6v2z"/>
                    </svg>
                    <span>Kindle</span>
                  </button>

                  <button className="group flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg font-semibold text-gray-900 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 text-sm">
                    <svg className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <span>Audible</span>
                  </button>
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
                    <div className="absolute top-3 right-3">
                      <FavoriteButton bookId={book.id} size="md" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 shadow-sm border border-blue-100">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center" style={{ color: '#2F4F4F' }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t('keyTakeaways') || 'Key Takeaways'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {summaryData.keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center mb-3 sm:mb-0" style={{ color: '#2F4F4F' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
{t('detailedSummary') || 'Detailed Summary'}
              </h2>
              <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:items-center sm:space-x-4">
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      if (!book) return;
                      
                      // For America's Bank, open the actual PDF file
                      if (book.id === 'americas-bank') {
                        window.open('/pdfs/americas bank.pdf', '_blank');
                        return;
                      }

                      // For Broken Money, open the actual PDF file
                      if (book.id === 'broken-money') {
                        window.open('/pdfs/broken money.pdf', '_blank');
                        return;
                      }

                      // For Rich Dad Poor Dad, open the actual PDF file
                      if (book.id === 'rich-dad-poor-dad') {
                        window.open('/pdfs/rich dad poor dad.pdf', '_blank');
                        return;
                      }

                      // For The Mental Game of Trading, open the actual PDF file
                      if (book.id === 'thementalgameoftrading') {
                        window.open('/pdfs/the mental game of trading.pdf', '_blank');
                        return;
                      }

                      // For The Zen Trader, open the actual PDF file
                      if (book.id === 'thezentrader') {
                        window.open('/pdfs/the zen trader.pdf', '_blank');
                        return;
                      }

                      // For The Alchemist, open the actual PDF file
                      if (book.id === 'the-alchemist') {
                        window.open('/pdfs/the alchemist.pdf', '_blank');
                        return;
                      }

                      // For How To Day Trade for a Living, open the actual PDF file
                      if (book.id === 'howtodaytradeforaliving') {
                        window.open('/pdfs/how to day trade for a living.pdf', '_blank');
                        return;
                      }

                      // For Trade Like a Stock Market Wizard, open the actual PDF file
                      if (book.id === 'tradelikeastockmarketwizard') {
                        window.open('/pdfs/trade like a stock market wizard.pdf', '_blank');
                        return;
                      }

                      // For Think and Grow Rich, open the actual PDF file
                      if (book.id === 'thinkandgrowrich') {
                        window.open('/pdfs/think and grow rich.pdf', '_blank');
                        return;
                      }

                      // For Trading in the Zone, open the actual PDF file
                      if (book.id === 'trading-in-the-zone') {
                        window.open('/pdfs/trading in the zone 2.pdf', '_blank');
                        return;
                      }

                      // For Atomic Habits, open the actual PDF file
                      if (book.id === 'atomic-habits') {
                        window.open('/pdfs/atomic habits.pdf', '_blank');
                        return;
                      }

                      // For Best Loser Wins, open the actual PDF file
                      if (book.id === 'best-loser-wins') {
                        window.open('/pdfs/best loser wins.pdf', '_blank');
                        return;
                      }

                      // For The Disciplined Trader, open the actual PDF file
                      if (book.id === 'thedisciplinedtrader') {
                        window.open('/pdfs/the disciplined trader.pdf', '_blank');
                        return;
                      }

                      // For The Richest Man in Babylon, open the actual PDF file
                      if (book.id === 'therichestmaninbabylon') {
                        window.open('/pdfs/the richest man in babylon.pdf', '_blank');
                        return;
                      }

                      // For Secrets of the Millionaire Mind, open the actual PDF file
                      if (book.id === 'secretsofthemillionairemind') {
                        window.open('/pdfs/secrets of the millionaire mind.pdf', '_blank');
                        return;
                      }

                      // For Market Wizards, open the actual PDF file
                      if (book.id === 'marketwizards') {
                        window.open('/pdfs/market wizards.pdf', '_blank');
                        return;
                      }

                      // For Becoming, open the actual PDF file
                      if (book.id === 'becoming') {
                        window.open('/pdfs/becoming.pdf', '_blank');
                        return;
                      }

                      // For Dune, open the actual PDF file
                      if (book.id === 'dune') {
                        window.open('/pdfs/dune.pdf', '_blank');
                        return;
                      }

                      // For Educated, open the actual PDF file
                      if (book.id === 'educated') {
                        window.open('/pdfs/educated.pdf', '_blank');
                        return;
                      }

                      // For Project Hail Mary, open the actual PDF file
                      if (book.id === 'project-hail-mary') {
                        window.open('/pdfs/project hail mary.pdf', '_blank');
                        return;
                      }

                      // For The Subtle Art of Not Giving a F*ck, open the actual PDF file
                      if (book.id === 'the-subtle-art-of-not-giving-a-f') {
                        window.open('/pdfs/the subtle art of not giving a fck.pdf', '_blank');
                        return;
                      }

                      // For Sapiens, open the actual PDF file
                      if (book.id === 'sapiens') {
                        window.open('/pdfs/sapiens.pdf', '_blank');
                        return;
                      }

                      // For The Four Agreements, open the actual PDF file
                      if (book.id === 'the-four-agreements') {
                        window.open('/pdfs/the four agreements.pdf', '_blank');
                        return;
                      }

                      // For The 4-Hour Workweek, open the actual PDF file
                      if (book.id === 'the-4-hour-workweek') {
                        window.open('/pdfs/the 4 hour workweek.pdf', '_blank');
                        return;
                      }

                      // For The Laws of Human Nature, open the actual PDF file
                      if (book.id === 'thelawsofhumannature') {
                        window.open('/pdfs/the laws of human nature.pdf', '_blank');
                        return;
                      }

                      // For Thinking, Fast and Slow, open the actual PDF file
                      if (book.id === 'thinking-fast-and-slow') {
                        window.open('/pdfs/thinking fast and slow.pdf', '_blank');
                        return;
                      }

                      // For Be Less Zombie, open the actual PDF file
                      if (book.id === 'belesszombie') {
                        window.open('/pdfs/be less zombie.pdf', '_blank');
                        return;
                      }

                      // For The 48 Laws of Power, open the actual PDF file
                      if (book.id === 'the48lawsofpower') {
                        window.open('/pdfs/the 48 laws of power.pdf', '_blank');
                        return;
                      }

                      // For The 33 Strategies of War, open the actual PDF file
                      if (book.id === 'the33strategiesofwar') {
                        window.open('/pdfs/the 33 strategies of war.pdf', '_blank');
                        return;
                      }

                      // For Relentless, open the actual PDF file
                      if (book.id === 'relentless') {
                        window.open('/pdfs/relentless.pdf', '_blank');
                        return;
                      }

                      // For The Intelligent Investor, open the actual PDF file
                      if (book.id === 'the-intelligent-investor') {
                        window.open('/pdfs/the intelligent investor.pdf', '_blank');
                        return;
                      }

                      // For One Up on Wall Street, open the actual PDF file
                      if (book.id === 'one-up-on-wall-street') {
                        window.open('/pdfs/one up on wall street.pdf', '_blank');
                        return;
                      }

                      // For The Psychology of Money, open the actual PDF file
                      if (book.id === 'the-psychology-of-money') {
                        window.open('/pdfs/the psychology of money.pdf', '_blank');
                        return;
                      }

                      // For One Good Trade, open the actual PDF file
                      if (book.id === 'one-good-trade') {
                        window.open('/pdfs/one good trade.pdf', '_blank');
                        return;
                      }

                      // For Can't Hurt Me, open the actual PDF file
                      if (book.id === 'cant-hurt-me') {
                        window.open("/pdfs/can't hurt me.pdf", '_blank');
                        return;
                      }

                      // For The Alchemy of Finance, open the actual PDF file
                      if (book.id === 'the-alchemy-of-finance') {
                        window.open('/pdfs/the alchemy of finance.pdf', '_blank');
                        return;
                      }

                      // For Competition Demystified, open the actual PDF file
                      if (book.id === 'competition-demystified') {
                        window.open('/pdfs/competition demystified.pdf', '_blank');
                        return;
                      }

                      // For The 4-Hour Work Week, open the actual PDF file
                      if (book.id === 'the-4-hour-work-week') {
                        window.open('/pdfs/the 4 hour work week.pdf', '_blank');
                        return;
                      }

                      // For The Black Swan, open the actual PDF file
                      if (book.id === 'the-black-swan') {
                        window.open('/pdfs/the black swan.pdf', '_blank');
                        return;
                      }

                      // For The PlayBook, open the actual PDF file
                      if (book.id === 'the-playbook') {
                        window.open('/pdfs/the playbook.pdf', '_blank');
                        return;
                      }

                      // For The ChatGPT Millionaire, open the actual PDF file
                      if (book.id === 'the-chatgpt-millionaire') {
                        window.open('/pdfs/the chatgpt millionaire.pdf', '_blank');
                        return;
                      }

                      // For The Miracle Morning, open the actual PDF file
                      if (book.id === 'the-miracle-morning') {
                        window.open('/pdfs/the miracle morning.pdf', '_blank');
                        return;
                      }

                      // For Trading for a Living, open the actual PDF file
                      if (book.id === 'trading-for-a-living') {
                        window.open('/pdfs/trading for a living.pdf', '_blank');
                        return;
                      }

                      // For The First 90 Days, open the actual PDF file
                      if (book.id === 'the-first-90-days') {
                        window.open('/pdfs/the first 90 days.pdf', '_blank');
                        return;
                      }

                      // For Traction, open the actual PDF file
                      if (book.id === 'traction') {
                        window.open('/pdfs/traction.pdf', '_blank');
                        return;
                      }

                      // For Leading Change, open the actual PDF file
                      if (book.id === 'leading-change') {
                        window.open('/pdfs/leading change.pdf', '_blank');
                        return;
                      }

                      // For I Will Teach You to Be Rich, open the actual PDF file
                      if (book.id === 'i-will-teach-you-to-be-rich') {
                        window.open('/pdfs/i will teach you to be rich.pdf', '_blank');
                        return;
                      }

                      // For Money: Master the Game, open the actual PDF file
                      if (book.id === 'money-master-the-game') {
                        window.open('/pdfs/money master the game.pdf', '_blank');
                        return;
                      }

                      // For The Total Money Makeover, open the actual PDF file
                      if (book.id === 'the-total-money-makeover') {
                        window.open('/pdfs/the total money makeover.pdf', '_blank');
                        return;
                      }

                      // For The 7 Habits of Highly Effective People, open the actual PDF file
                      if (book.id === 'the-7-habits-of-highly-effective-people') {
                        window.open('/pdfs/the 7 habits of highly effective people.pdf', '_blank');
                        return;
                      }

                      // For other books, generate PDF dynamically
                      // Lazy load jsPDF only when needed (saves 385KB from initial bundle!)
                      if (!summaryData) return;
                      
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
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        window.open(pdfUrl, '_blank');
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                        alert('Failed to generate PDF. Please try again.');
                      }
                    }}
                    className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 hover:bg-right-bottom border-2 border-orange-400 hover:border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_25px_rgba(251,146,60,0.8)]"
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
                    <span className="relative z-10">Arabic PDF</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSignUpModal(true)}
                    className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 hover:bg-right-bottom border-2 border-orange-400 hover:border-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.5)] hover:shadow-[0_0_25px_rgba(251,146,60,0.8)]"
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
                    <span className="relative z-10">Arabic PDF</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg">
              <div className="prose prose-sm sm:prose max-w-none">
                <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
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
        </article>
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        bookId={bookId || ''}
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
      />

      {/* Sign Up Prompt Modal */}
      <SignUpPromptModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />
      </div>

      {/* You May Also Like Section */}
      {book && (
        <YouMayAlsoLike 
          currentBookId={book.id}
          currentBookCategory={book.category}
          books={BOOKS}
          maxBooks={8}
        />
      )}
    </>
  );
};

export default SummaryDetailPage;
