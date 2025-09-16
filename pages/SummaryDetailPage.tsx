import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BOOKS, BOOK_SUMMARIES } from '../constants';
import { Book, SummaryData } from '../types';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLanguage } from '../contexts/LanguageContext';
import { getBookSummaryTranslation } from '../translations/bookSummaries';

const SummaryDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentLanguage, getBookTitle, getBookAuthor, t } = useLanguage();
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


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
      const bookSummary = BOOK_SUMMARIES.find(summary => summary.title === currentBook.title);
      
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
    } else {
      setError(t('bookNotFound') || "Book not found.");
      setLoading(false);
    }
    
    // Cleanup speech synthesis on component unmount
    return () => {
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
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-6xl mx-auto">
      {book && (
        <header className="mb-10 text-center border-b border-gray-200 pb-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#2F4F4F' }}>{getBookTitle(book.id)}</h1>
          <p className="text-xl text-gray-600">by {getBookAuthor(book.id)}</p>
        </header>
      )}

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {summaryData && !loading && (
        <article>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              {book && (
                <div className="sticky top-6">
                  <img src={book.coverImageUrl} alt={`Cover of ${getBookTitle(book.id)}`} className="w-full h-auto rounded-lg shadow-lg mb-4" />
                </div>
              )}
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
                <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: '#2F4F4F' }}>
                  <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t('keyTakeaways') || 'Key Takeaways'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summaryData.keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                      <p className="text-gray-700 leading-relaxed">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold flex items-center" style={{ color: '#2F4F4F' }}>
                <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
{t('detailedSummary') || 'Detailed Summary'}
              </h2>
              {typeof window.speechSynthesis !== 'undefined' && (
                <button
                  onClick={handleToggleSpeech}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: isSpeaking ? '#DC2626' : '#FF7F50' }}
                  aria-label={isSpeaking ? "Stop listening" : "Listen to summary"}
                >
                  {isSpeaking ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                  )}
                  <span>{isSpeaking ? (t('stop') || 'Stop') : (t('listen') || 'Listen')}</span>
                </button>
              )}
            </div>
            <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <MarkdownRenderer content={summaryData.summary} />
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};

export default SummaryDetailPage;