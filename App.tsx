
import React, { useEffect, useState, createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ReaderModeProvider } from './contexts/ReaderModeContext';
import { PersonalNotesProvider } from './contexts/PersonalNotesContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ReadingChallengeProvider } from './contexts/ReadingChallengeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebase';
import Spinner from './components/Spinner';

// Lazy load all pages for better initial load performance
// Using webpackPrefetch for better UX on commonly visited pages
const HomePage = lazy(() => import(/* webpackPrefetch: true */ './pages/HomePage'));
const SummariesPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SummaryDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ReadingChallengePage = lazy(() => import('./pages/ReadingChallengePage'));
const BookTriviaPage = lazy(() => import('./pages/BookTriviaPage'));
const SudokuPage = lazy(() => import('./pages/SudokuPage'));
const StrandsPage = lazy(() => import('./pages/StrandsPage'));
const SpellingBeePage = lazy(() => import('./pages/SpellingBeePage'));
const AuthorQuizPage = lazy(() => import('./pages/AuthorQuizPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const LLMChatPage = lazy(() => import('./pages/LLMChatPage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));

// Firebase User Data Context
interface UserData {
  favorites: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    readerMode: boolean;
  };
  notes: Record<string, any[]>;
  highlights: Record<string, any[]>;
}

interface FirebaseContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  addToFavorites: (bookId: string) => Promise<void>;
  removeFromFavorites: (bookId: string) => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  updateUserPreferences: (preferences: Partial<UserData['preferences']>) => Promise<void>;
  saveUserNote: (bookId: string, note: any) => Promise<void>;
  saveUserHighlight: (bookId: string, highlight: any) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Firebase Provider Component
const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user data structure
  const createInitialUserData = (): UserData => ({
    favorites: [],
    preferences: {
      theme: 'light',
      language: 'en',
      readerMode: false,
    },
    notes: {},
    highlights: {},
  });

  // Load user data from Firestore
  const loadUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserData;
        setUserData(data);
      } else {
        // Create new user document with initial data
        const initialData = createInitialUserData();
        await setDoc(userDocRef, {
          ...initialData,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        setUserData(initialData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default data if loading fails
      setUserData(createInitialUserData());
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastLogin: new Date(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    // Don't block rendering - proceed immediately if Firebase isn't ready
    setLoading(false);
    
    // Initialize auth listener in the background (non-blocking)
    let unsubscribe: (() => void) | undefined;
    
    // Use requestIdleCallback to defer auth check until browser is idle
    const scheduleAuthCheck = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
              // Load user data in background without blocking
              loadUserData(user).catch(error => {
                console.error('Error loading user data:', error);
              });
              updateLastLogin(user).catch(error => {
                console.error('Error updating last login:', error);
              });
            } else {
              setUserData(null);
            }
          }, (error) => {
            console.error('Firebase auth error:', error);
          });
        });
      } else {
        // Fallback: use setTimeout with minimal delay
        setTimeout(() => {
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
              loadUserData(user).catch(error => {
                console.error('Error loading user data:', error);
              });
              updateLastLogin(user).catch(error => {
                console.error('Error updating last login:', error);
              });
            } else {
              setUserData(null);
            }
          }, (error) => {
            console.error('Firebase auth error:', error);
          });
        }, 0);
      }
    };
    
    scheduleAuthCheck();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Add book to favorites
  const addToFavorites = async (bookId: string) => {
    if (!currentUser || !userData) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        favorites: arrayUnion(bookId)
      });

      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        favorites: [...prev.favorites, bookId]
      } : null);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  // Remove book from favorites
  const removeFromFavorites = async (bookId: string) => {
    if (!currentUser || !userData) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        favorites: arrayRemove(bookId)
      });

      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        favorites: prev.favorites.filter(fav => fav !== bookId)
      } : null);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  // Check if book is favorite
  const isFavorite = (bookId: string): boolean => {
    return userData?.favorites.includes(bookId) || false;
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: Partial<UserData['preferences']>) => {
    if (!currentUser || !userData) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedPreferences = { ...userData.preferences, ...preferences };
      
      await updateDoc(userDocRef, {
        preferences: updatedPreferences
      });

      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        preferences: updatedPreferences
      } : null);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  // Save user note
  const saveUserNote = async (bookId: string, note: any) => {
    if (!currentUser || !userData) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedNotes = {
        ...userData.notes,
        [bookId]: [...(userData.notes[bookId] || []), { ...note, id: Date.now(), createdAt: new Date() }]
      };

      await updateDoc(userDocRef, {
        notes: updatedNotes
      });

      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        notes: updatedNotes
      } : null);
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  // Save user highlight
  const saveUserHighlight = async (bookId: string, highlight: any) => {
    if (!currentUser || !userData) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedHighlights = {
        ...userData.highlights,
        [bookId]: [...(userData.highlights[bookId] || []), { ...highlight, id: Date.now(), createdAt: new Date() }]
      };

      await updateDoc(userDocRef, {
        highlights: updatedHighlights
      });

      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        highlights: updatedHighlights
      } : null);
    } catch (error) {
      console.error('Error saving highlight:', error);
      throw error;
    }
  };

  const value: FirebaseContextType = {
    currentUser,
    userData,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    updateUserPreferences,
    saveUserNote,
    saveUserHighlight,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <LanguageProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ReadingChallengeProvider>
              <UserProgressProvider>
                <ReaderModeProvider>
                  <PersonalNotesProvider>
                    <AppContent />
                  </PersonalNotesProvider>
                </ReaderModeProvider>
              </UserProgressProvider>
            </ReadingChallengeProvider>
          </FavoritesProvider>
        </AuthProvider>
      </LanguageProvider>
    </FirebaseProvider>
  );
};

// App Content Component (separated to use Firebase context)
const AppContent: React.FC = () => {
  const { loading } = useFirebase();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow container mx-auto px-0 sm:px-0 lg:px-0 py-8">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen w-full">
                <div className="text-center">
                  <Spinner />
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/summaries" element={<SummariesPage />} />
            <Route path="/summary/:bookId" element={<SummaryDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/calculators" element={<CalculatorsPage />} />
            <Route path="/calculators/pip-value" element={<CalculatorsPage />} />
            <Route path="/calculators/position-size" element={<CalculatorsPage />} />
            <Route path="/calculators/fire" element={<CalculatorsPage />} />
            <Route path="/calculators/compound-interest" element={<CalculatorsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/games/book-trivia" element={<BookTriviaPage />} />
            <Route path="/games/sudoku" element={<SudokuPage />} />
            <Route path="/games/strands" element={<StrandsPage />} />
            <Route path="/games/spelling-bee" element={<SpellingBeePage />} />
            <Route path="/games/author-quiz" element={<AuthorQuizPage />} />
            <Route path="/chat" element={<LLMChatPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/reading-challenge" element={
              <ProtectedRoute>
                <ReadingChallengePage />
              </ProtectedRoute>
            } />
            <Route path="/downloads" element={
              <ProtectedRoute>
                <DownloadsPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-use" element={<TermsOfUsePage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
