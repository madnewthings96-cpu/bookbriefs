# Routes

Routing is configuration-based via React Router DOM 6 in `App.tsx`. All routes use the same `AppContent` shell: `Header` → centered `main` → `MobileBottomNav` / `ExitIntentPopup` → `Footer`. There are no nested route layouts, route-level error elements, or wildcard/404 route.

## Route map

| URL path | Component file | Layout / gate | Page summary |
| --- | --- | --- | --- |
| `/` | `pages/HomePage.tsx` | App shell | Editorial landing page with outcome-led hero, proof metrics, reading paths, most-read books, sample brief, and conversion CTA. |
| `/summaries`, `/book-summaries`, `/ar/book-summaries` | `pages/SummariesPage.tsx` | App shell | Searchable/filterable book library; English and Arabic aliases resolve to one component. |
| `/categories/:categorySlug`, `/ar/categories/:categorySlug` | `pages/CategoryPage.tsx` | App shell | Category-specific collection using the reusable book-card grid. |
| `/summary/:bookId` | `pages/SummaryDetailPage.tsx` | App shell | Long-form reading experience with summary content, progress, highlights/notes, favorites, reviews, recommendations, and PDF/support actions. |
| `/about` | `pages/AboutPage.tsx` | App shell | Brand story, principles, and product rationale. |
| `/calculators` | `pages/CalculatorsPage.tsx` | App shell | Calculator hub; defaults to position sizing. |
| `/calculators/pip-value`, `/ar/tools/pip-value-calculator` | `pages/CalculatorsPage.tsx` | App shell | Pip-value calculator state selected by pathname. |
| `/calculators/position-size`, `/ar/tools/position-size-calculator` | `pages/CalculatorsPage.tsx` | App shell | Position-size calculator state selected by pathname. |
| `/calculators/fire`, `/ar/tools/fire-calculator` | `pages/CalculatorsPage.tsx` | App shell | Financial-independence calculator state selected by pathname. |
| `/calculators/compound-interest`, `/ar/tools/compound-interest-calculator` | `pages/CalculatorsPage.tsx` | App shell | Compound-interest calculator state selected by pathname. |
| `/news` | `pages/NewsPage.tsx` | App shell | Financial-news and economic-calendar landing page. |
| `/blog` | `pages/BlogPage.tsx` | App shell | Blog index with bilingual editorial cards and topic navigation. |
| `/blog/:slug` | `pages/BlogPage.tsx` | App shell | Article-detail mode selected from the in-file post catalog. |
| `/profile` | `pages/UserProfilePage.tsx` | App shell + `ProtectedRoute` | Personal library, reading progress, and saved books. |
| `/reading-challenge` | `pages/ReadingChallengePage.tsx` | App shell + `ProtectedRoute` | Goal setup and visual reading-challenge dashboard. |
| `/downloads` | `pages/DownloadsPage.tsx` | App shell + `ProtectedRoute` | Downloadable companion resources, currently centered on the trading journal. |
| `/feedback` | `pages/FeedbackPage.tsx` | App shell + `ProtectedRoute` | Feedback submission/history workspace. |
| `/finance-tracker` | `pages/FinanceTrackerPage.tsx` | App shell + `ProtectedRoute` | Personal finance dashboard for income, expenses, budgets, goals, and receipt capture. |
| `/trading-journal` | `pages/TradingJournalPage.tsx` | App shell + `ProtectedRoute` | Trading command center with stats, trade entry/table/calendar, goals, review, analytics, and report export. |
| `/login` | `pages/LoginPage.tsx` | App shell | Animated sign-in flow backed by Firebase Auth. |
| `/signup` | `pages/SignUpPage.tsx` | App shell | Animated account-creation flow backed by Firebase Auth. |
| `/privacy-policy` | `pages/PrivacyPolicyPage.tsx` | App shell | Bilingual privacy policy. |
| `/terms-of-use` | `pages/TermsOfUsePage.tsx` | App shell | Bilingual terms of use. |

## Full router configuration

File: `App.tsx`

```tsx

import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Spinner from './components/Spinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const SummariesPage = lazy(() => import('./pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import('./pages/SummaryDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ReadingChallengePage = lazy(() => import('./pages/ReadingChallengePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const FinanceTrackerPage = lazy(() => import('./pages/FinanceTrackerPage'));
const TradingJournalPage = lazy(() => import('./pages/TradingJournalPage'));
const ExitIntentPopup = lazy(() => import('./components/ExitIntentPopup'));

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

// App Content Component (separated to use Firebase context)
const AppContent: React.FC = () => {
  const { loading } = useFirebase();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow container mx-auto px-0 sm:px-0 lg:px-0 py-8">
          <Suspense fallback={<Spinner />}>
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
          </Suspense>
        </main>

        <MobileBottomNav />
        <Suspense fallback={null}>
          <ExitIntentPopup />
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
```

