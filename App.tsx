
import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Spinner from './components/Spinner';
import NotFoundPage from './pages/NotFoundPage';
import DashboardNotFoundPage from './components/dashboard/DashboardNotFoundPage';
import PrivatePageSEO from './components/PrivatePageSEO';
import { isPrivateSeoRoute } from './utils/seoConfig';
import { getAppLayoutFamily, LEGACY_DASHBOARD_REDIRECTS } from './components/appLayoutModel';

const HomePage = lazy(() => import('./pages/HomePage'));
const SummariesPage = lazy(() => import('./pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import('./pages/SummaryDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const NewsPage = lazy(async () => {
  const [, pageModule] = await Promise.all([import('./pages/NewsPage.css'), import('./pages/NewsPage')]);
  return pageModule;
});
const BlogPage = lazy(() => import('./pages/BlogPage'));
const IdeasInTheWildPage = lazy(async () => {
  const [, pageModule] = await Promise.all([
    import('./pages/IdeasInTheWildPage.css'),
    import('./pages/IdeasInTheWildPage'),
  ]);
  return pageModule;
});
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ReadingChallengePage = lazy(() => import('./pages/ReadingChallengePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const FinanceTrackerPage = lazy(() => import('./pages/FinanceTrackerPage'));
const TradingJournalPage = lazy(() => import('./pages/TradingJournalPage'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const FocusedReaderLayout = lazy(() => import('./components/dashboard/FocusedReaderLayout'));
const DashboardOverviewPage = lazy(() => import('./pages/DashboardOverviewPage'));
const DashboardLibraryPage = lazy(() => import('./pages/DashboardLibraryPage'));
const DashboardNotesPage = lazy(() => import('./pages/DashboardNotesPage'));
const DashboardSettingsPage = lazy(() => import('./pages/DashboardSettingsPage'));
const ExitIntentPopup = lazy(() => import('./components/ExitIntentPopup'));
const CoffeeSupportCard = lazy(() => import('./components/CoffeeSupportCard'));

interface FirebaseContextType {
  currentUser: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  const ensureUserDocument = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
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
          await ensureUserDocument(user);
          await updateLastLogin(user);
        } catch (error) {
          console.error('Error preparing user data:', error);
        }
      }

      setLoading(false);
    }, (error) => {
      // Error callback for auth state changes
      console.error('Firebase auth error:', error);
      // Auth can no longer verify the prior identity; fail closed for any
      // consumer of this legacy provider as well.
      setCurrentUser(null);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value: FirebaseContextType = {
    currentUser,
    loading,
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

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/summaries" element={<SummariesPage />} />
    <Route path="/book-summaries" element={<SummariesPage />} />
    <Route path="/ar/book-summaries" element={<SummariesPage />} />
    <Route path="/categories/:categorySlug" element={<CategoryPage />} />
    <Route path="/ar/categories/:categorySlug" element={<CategoryPage />} />
    <Route path="/summary/:bookId" element={<SummaryDetailPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/calculators" element={<CalculatorsPage />} />
    <Route path="/calculators/pip-value" element={<CalculatorsPage />} />
    <Route path="/calculators/position-size" element={<CalculatorsPage />} />
    <Route path="/calculators/fire" element={<CalculatorsPage />} />
    <Route path="/calculators/compound-interest" element={<CalculatorsPage />} />
    <Route path="/ar/tools/pip-value-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/position-size-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/fire-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/compound-interest-calculator" element={<CalculatorsPage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/blog/:slug" element={<BlogPage />} />
    <Route path="/connections" element={<IdeasInTheWildPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms-of-use" element={<TermsOfUsePage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverviewPage />} />
        <Route path="discover" element={<SummariesPage surface="dashboard" />} />
        <Route path="library" element={<DashboardLibraryPage />} />
        <Route path="notes" element={<DashboardNotesPage />} />
        <Route path="challenge" element={<ReadingChallengePage surface="dashboard" />} />
        <Route path="downloads" element={<DownloadsPage />} />
        <Route path="calculators/*" element={<CalculatorsPage surface="dashboard" />} />
        <Route path="finance" element={<FinanceTrackerPage />} />
        <Route path="trading" element={<TradingJournalPage surface="dashboard" />} />
        <Route path="settings" element={<DashboardSettingsPage />} />
        <Route path="admin/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<DashboardNotFoundPage />} />
      </Route>
      <Route path="/dashboard/summary/:bookId" element={<FocusedReaderLayout />}>
        <Route index element={<SummaryDetailPage surface="dashboard" />} />
      </Route>
      {Object.entries(LEGACY_DASHBOARD_REDIRECTS).map(([from, to]) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const AppFrame: React.FC = () => {
  const location = useLocation();
  const family = getAppLayoutFamily(location.pathname);
  const routes = <Suspense fallback={<Spinner />}><AppRoutes /></Suspense>;

  const frame = family === 'dashboard' ? routes : family === 'standalone' ? (
    <main className="min-h-screen bg-[#ece9df]">{routes}</main>
  ) : (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto flex-grow px-0 py-8 sm:px-0 lg:px-0">{routes}</main>
      <MobileBottomNav />
      <Suspense fallback={null}>
        <ExitIntentPopup />
        <CoffeeSupportCard />
      </Suspense>
      <Footer />
    </div>
  );

  return <><ScrollToTop />{isPrivateSeoRoute(location.pathname) && <PrivatePageSEO />}{frame}</>;
};

const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  );
};

export default App;
