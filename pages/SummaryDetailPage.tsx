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
import HighlightableText from '../components/HighlightableText';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import jsPDF from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';
import { getBookSummaryTranslation } from '../translations/bookSummaries';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';

const SummaryDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentLanguage, getBookTitle, getBookAuthor, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { updateBookProgress, recordReadingActivity, getBookProgress } = useUserProgress();
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Personal Notes & Highlights state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);


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
      <ReadingProgressBar />
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-xl max-w-5xl mx-auto">
        {book && (
        <header className="mb-4 sm:mb-6 text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2F4F4F' }}>{getBookTitle(book.id)}</h1>
          <p className="text-base sm:text-lg text-gray-600">by {getBookAuthor(book.id)}</p>
        </header>
      )}

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {summaryData && !loading && (
        <article>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="lg:col-span-1">
              {book && (
                <div className="sticky top-6">
                  <img src={book.coverImageUrl} alt={`Cover of ${getBookTitle(book.id)}`} className="w-full h-auto rounded-lg shadow-lg mb-4" />
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
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg text-white"
                  style={{ backgroundColor: '#2F4F4F' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t('addNote') || 'Add Note'}</span>
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      if (!book) return;
                      
                      // Helper function to open PDF in new tab for viewing (not download)
                      const openPDFInNewTab = (pdfPath: string) => {
                        // Use Google Docs Viewer for better mobile compatibility
                        const fullUrl = `${window.location.origin}${pdfPath}`;
                        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
                        
                        // Try to open in new tab
                        const newWindow = window.open(viewerUrl, '_blank');
                        
                        // Fallback: if popup is blocked, try direct PDF link
                        if (!newWindow) {
                          window.location.href = pdfPath;
                        }
                      };
                      
                      // For America's Bank, open the actual PDF file
                      if (book.id === 'americas-bank') {
                        openPDFInNewTab('/pdfs/americas bank.pdf');
                        return;
                      }

                      // For Broken Money, open the actual PDF file
                      if (book.id === 'broken-money') {
                        openPDFInNewTab('/pdfs/broken money.pdf');
                        return;
                      }

                      // For Rich Dad Poor Dad, open the actual PDF file
                      if (book.id === 'rich-dad-poor-dad') {
                        openPDFInNewTab('/pdfs/rich dad poor dad.pdf');
                        return;
                      }

                      // For The Mental Game of Trading, open the actual PDF file
                      if (book.id === 'thementalgameoftrading') {
                        openPDFInNewTab('/pdfs/the mental game of trading.pdf');
                        return;
                      }

                      // For The Zen Trader, open the actual PDF file
                      if (book.id === 'thezentrader') {
                        openPDFInNewTab('/pdfs/the zen trader.pdf');
                        return;
                      }

                      // For The Alchemist, open the actual PDF file
                      if (book.id === 'the-alchemist') {
                        openPDFInNewTab('/pdfs/the alchemist.pdf');
                        return;
                      }

                      // For How To Day Trade for a Living, open the actual PDF file
                      if (book.id === 'howtodaytradeforaliving') {
                        openPDFInNewTab('/pdfs/how to day trade for a living.pdf');
                        return;
                      }

                      // For Trade Like a Stock Market Wizard, open the actual PDF file
                      if (book.id === 'tradelikeastockmarketwizard') {
                        openPDFInNewTab('/pdfs/trade like a stock market wizard.pdf');
                        return;
                      }

                      // For Think and Grow Rich, open the actual PDF file
                      if (book.id === 'thinkandgrowrich') {
                        openPDFInNewTab('/pdfs/think and grow rich.pdf');
                        return;
                      }

                      // For Trading in the Zone, open the actual PDF file
                      if (book.id === 'trading-in-the-zone') {
                        openPDFInNewTab('/pdfs/trading in the zone 2.pdf');
                        return;
                      }

                      // For Atomic Habits, open the actual PDF file
                      if (book.id === 'atomic-habits') {
                        openPDFInNewTab('/pdfs/atomic habits.pdf');
                        return;
                      }

                      // For Best Loser Wins, open the actual PDF file
                      if (book.id === 'best-loser-wins') {
                        openPDFInNewTab('/pdfs/best loser wins.pdf');
                        return;
                      }

                      // For The Disciplined Trader, open the actual PDF file
                      if (book.id === 'thedisciplinedtrader') {
                        openPDFInNewTab('/pdfs/the disciplined trader.pdf');
                        return;
                      }

                      // For The Richest Man in Babylon, open the actual PDF file
                      if (book.id === 'therichestmaninbabylon') {
                        openPDFInNewTab('/pdfs/the richest man in babylon.pdf');
                        return;
                      }

                      // For Secrets of the Millionaire Mind, open the actual PDF file
                      if (book.id === 'secretsofthemillionairemind') {
                        openPDFInNewTab('/pdfs/secrets of the millionaire mind.pdf');
                        return;
                      }

                      // For Market Wizards, open the actual PDF file
                      if (book.id === 'marketwizards') {
                        openPDFInNewTab('/pdfs/market wizards.pdf');
                        return;
                      }

                      // For Becoming, open the actual PDF file
                      if (book.id === 'becoming') {
                        openPDFInNewTab('/pdfs/becoming.pdf');
                        return;
                      }

                      // For Dune, open the actual PDF file
                      if (book.id === 'dune') {
                        openPDFInNewTab('/pdfs/dune.pdf');
                        return;
                      }

                      // For Educated, open the actual PDF file
                      if (book.id === 'educated') {
                        openPDFInNewTab('/pdfs/educated.pdf');
                        return;
                      }

                      // For Project Hail Mary, open the actual PDF file
                      if (book.id === 'project-hail-mary') {
                        openPDFInNewTab('/pdfs/project hail mary.pdf');
                        return;
                      }

                      // For The Subtle Art of Not Giving a F*ck, open the actual PDF file
                      if (book.id === 'the-subtle-art-of-not-giving-a-f') {
                        openPDFInNewTab('/pdfs/the subtle art of not giving a fck.pdf');
                        return;
                      }

                      // For Sapiens, open the actual PDF file
                      if (book.id === 'sapiens') {
                        openPDFInNewTab('/pdfs/sapiens.pdf');
                        return;
                      }

                      // For The Four Agreements, open the actual PDF file
                      if (book.id === 'the-four-agreements') {
                        openPDFInNewTab('/pdfs/the four agreements.pdf');
                        return;
                      }

                      // For The Laws of Human Nature, open the actual PDF file
                      if (book.id === 'thelawsofhumannature') {
                        openPDFInNewTab('/pdfs/the laws of human nature.pdf');
                        return;
                      }

                      // For Thinking, Fast and Slow, open the actual PDF file
                      if (book.id === 'thinking-fast-and-slow') {
                        openPDFInNewTab('/pdfs/thinking fast and slow.pdf');
                        return;
                      }

                      // For Be Less Zombie, open the actual PDF file
                      if (book.id === 'belesszombie') {
                        openPDFInNewTab('/pdfs/be less zombie.pdf');
                        return;
                      }

                      // For The 48 Laws of Power, open the actual PDF file
                      if (book.id === 'the48lawsofpower') {
                        openPDFInNewTab('/pdfs/the 48 laws of power.pdf');
                        return;
                      }

                      // For The 33 Strategies of War, open the actual PDF file
                      if (book.id === 'the33strategiesofwar') {
                        openPDFInNewTab('/pdfs/the 33 strategies of war.pdf');
                        return;
                      }

                      // For other books, generate PDF as before
                      if (!summaryData) return;

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
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg text-white"
                    style={{ backgroundColor: '#FF7F50' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Arabic PDF</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-gray-500 bg-gray-100 cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Arabic PDF (Login Required)</span>
                  </div>
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

          {/* Personal Notes & Highlights Section */}
          <div className="mt-8">
            <NotesAndHighlightsPanel bookId={bookId || ''} />
          </div>
        </article>
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        bookId={bookId || ''}
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
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
