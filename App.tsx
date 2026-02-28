
import React, { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ReaderModeProvider } from './contexts/ReaderModeContext';
import { PersonalNotesProvider } from './contexts/PersonalNotesContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ReadingChallengeProvider } from './contexts/ReadingChallengeContext';
import { BooksProvider } from './contexts/BooksContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './pages/HomePage';
import SummariesPage from './pages/SummariesPage';
import SummaryDetailPage from './pages/SummaryDetailPage';
import AboutPage from './pages/AboutPage';
import CalculatorsPage from './pages/CalculatorsPage';
import NewsPage from './pages/NewsPage';
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UserProfilePage from './pages/UserProfilePage';
import ReadingChallengePage from './pages/ReadingChallengePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';

import DownloadsPage from './pages/DownloadsPage';
import FeedbackPage from './pages/FeedbackPage';
import MerchPage from './pages/MerchPage';
import FinanceTrackerPage from './pages/FinanceTrackerPage';
import TradingJournalPage from './pages/TradingJournalPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from './firebase';
import Spinner from './components/Spinner';
import ExitIntentPopup from './components/ExitIntentPopup';

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
    // Set a shorter timeout to prevent blocking
    const timeoutId = setTimeout(() => {
      console.warn('Firebase auth initialization timeout, proceeding without auth');
      setLoading(false);
    }, 3000); // 3 second timeout (reduced from 10)

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId); // Clear timeout since auth resolved
      setCurrentUser(user);

      if (user) {
        try {
          await loadUserData(user);
          await updateLastLogin(user);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    }, (error) => {
      // Error callback for auth state changes
      console.error('Firebase auth error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
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
    <HelmetProvider>
      <FirebaseProvider>
        <BooksProvider>
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
        </BooksProvider>
      </FirebaseProvider>
    </HelmetProvider>
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
            {/* <Route path="/merch" element={<MerchPage />} /> */}
            <Route path="/finance-tracker" element={
              <ProtectedRoute>
                <FinanceTrackerPage />
              </ProtectedRoute>
            } />
            <Route path="/trading-journal" element={
              <ProtectedRoute>
                <TradingJournalPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          </Routes>
        </main>

        {/* Telegram Floating Icon */}
        <a
          href="https://t.me/MadMarkets"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block fixed bottom-8 right-8 z-50 transition-transform hover:scale-110"
          aria-label="Join our Telegram channel"
        >
          <img
            src="/telegram icon.png"
            alt="Telegram"
            className="w-16 h-16 drop-shadow-lg"
          />
        </a>

        <MobileBottomNav />
        <ExitIntentPopup />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
