import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BOOKS, BOOK_SUMMARIES } from '../constants';
import { Book, SummaryData } from '../types';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ReadingProgressBar from '../components/ReadingProgressBar';
import jsPDF from 'jspdf';
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
      <ReadingProgressBar />
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl max-w-6xl mx-auto">
        {book && (
        <header className="mb-6 sm:mb-10 text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3" style={{ color: '#2F4F4F' }}>{getBookTitle(book.id)}</h1>
          <p className="text-lg sm:text-xl text-gray-600">by {getBookAuthor(book.id)}</p>
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center" style={{ color: '#2F4F4F' }}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t('keyTakeaways') || 'Key Takeaways'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center mb-4 sm:mb-0" style={{ color: '#2F4F4F' }}>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
{t('detailedSummary') || 'Detailed Summary'}
              </h2>
              <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:items-center sm:space-x-4">
                <button
                  onClick={() => {
                    if (!book || !summaryData) return;
                    
                    // Get Arabic translation
                    const arabicSummary = getBookSummaryTranslation(book.id, 'ar');
                    if (!arabicSummary) return;

                    const doc = new jsPDF({
                      orientation: 'p',
                      unit: 'mm',
                      format: 'a4',
                      putOnlyUsedFonts: true
                    });

                    // Set RTL mode for Arabic
                    doc.setR2L(true);
                    
                    const title = arabicSummary ? getBookTitle(book.id) : book.title;
                    const author = getBookAuthor(book.id);
                    
                    // Create the PDF
                    doc.setFontSize(24);
                    doc.text(title, 190, 20, { align: 'right' });
                    
                    doc.setFontSize(16);
                    doc.text(`${author} :تأليف`, 190, 30, { align: 'right' });
                    
                    doc.setFontSize(18);
                    doc.text('النقاط الرئيسية:', 190, 45, { align: 'right' });
                    doc.setFontSize(12);
                    
                    let yPos = 55;
                    arabicSummary.keyTakeaways.forEach((takeaway) => {
                      const lines = doc.splitTextToSize(`• ${takeaway}`, 170);
                      doc.text(lines, 190, yPos, { align: 'right' });
                      yPos += 10 * lines.length;
                    });
                    
                    doc.setFontSize(18);
                    yPos += 10;
                    doc.text('الملخص التفصيلي:', 190, yPos, { align: 'right' });
                    doc.setFontSize(12);
                    yPos += 10;
                    
                    const summaryLines = doc.splitTextToSize(arabicSummary.summary, 170);
                    doc.text(summaryLines, 190, yPos, { align: 'right' });
                    
                    // Open in new tab
                    const pdfOutput = doc.output('datauristring');
                    window.open(pdfOutput, '_blank');
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 hover:bg-opacity-90 text-white"
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Arabic PDF</span>
                </button>

                <button
                  onClick={() => {
                    if (!book || !summaryData) return;
                    
                    const doc = new jsPDF();
                    const title = getBookTitle(book.id);
                    const author = getBookAuthor(book.id);
                    
                    // Set title font and size
                    doc.setFontSize(24);
                    doc.text(title, 20, 20);
                    
                    // Add author
                    doc.setFontSize(16);
                    doc.text(`by ${author}`, 20, 30);
                    
                    // Add key takeaways
                    doc.setFontSize(18);
                    doc.text('Key Takeaways:', 20, 45);
                    doc.setFontSize(12);
                    
                    let yPos = 55;
                    summaryData.keyTakeaways.forEach((takeaway, index) => {
                      const lines = doc.splitTextToSize(`• ${takeaway}`, 170);
                      doc.text(lines, 20, yPos);
                      yPos += 10 * lines.length;
                    });
                    
                    // Add detailed summary
                    doc.setFontSize(18);
                    yPos += 10;
                    doc.text('Detailed Summary:', 20, yPos);
                    doc.setFontSize(12);
                    yPos += 10;
                    
                    const summaryLines = doc.splitTextToSize(summaryData.summary, 170);
                    doc.text(summaryLines, 20, yPos);
                    
                    doc.save(`${title} - Summary.pdf`);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 hover:bg-opacity-90 text-white"
                  style={{ backgroundColor: '#2F4F4F' }}
                  aria-label="Download summary as PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{t('pdf') || 'PDF'}</span>
                </button>

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
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white rounded-lg">
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                <div className="space-y-4 sm:space-y-6 text-gray-700 leading-relaxed text-base sm:text-lg">
                  <MarkdownRenderer content={summaryData.summary} />
                </div>
              </div>
            </div>
          </div>
        </article>
      )}
      </div>
    </>
  );
};

export default SummaryDetailPage;