
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, ContentLanguageProvider } from './contexts/LanguageContext';
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
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import Spinner from './components/Spinner';
import InitialPageReady from './components/InitialPageReady';
import NotFoundPage from './pages/NotFoundPage';
import DashboardNotFoundPage from './components/dashboard/DashboardNotFoundPage';
import PrivatePageSEO from './components/PrivatePageSEO';
import { isPrivateSeoRoute } from './utils/seoConfig';
import { getAppLayoutFamily, LEGACY_DASHBOARD_REDIRECTS } from './components/appLayoutModel';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { DirtyNavigationProvider } from './contexts/DirtyNavigationContext';

export { useFirebase } from './contexts/FirebaseContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const SummariesPage = lazy(() => import('./pages/SummariesPage'));
const SummaryDetailPage = lazy(() => import('./pages/SummaryDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const TradeAnalyzerPage = lazy(async () => {
  const [, pageModule] = await Promise.all([import('./pages/TradeAnalyzerPage.css'), import('./pages/TradeAnalyzerPage')]);
  return pageModule;
});
const NewsPage = lazy(async () => {
  const [, pageModule] = await Promise.all([import('./pages/NewsPage.css'), import('./pages/NewsPage')]);
  return pageModule;
});
const NewsArticlePage = lazy(async () => {
  const [, pageModule] = await Promise.all([import('./pages/NewsPage.css'), import('./pages/NewsArticlePage')]);
  return pageModule;
});
const AdminNewsPage = lazy(async () => {
  const [, pageModule] = await Promise.all([
    import('./pages/AdminNewsPage.css'),
    import('./pages/AdminNewsPage'),
  ]);
  return pageModule;
});
const AdminNewsEditorPage = lazy(async () => {
  const [, , pageModule] = await Promise.all([
    import('./pages/AdminNewsPage.css'),
    import('./pages/NewsPage.css'),
    import('./pages/AdminNewsEditorPage'),
  ]);
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

// Main App Component
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <DirtyNavigationProvider>
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
      </DirtyNavigationProvider>
    </HelmetProvider>
  );
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/summaries" element={<SummariesPage />} />
    <Route path="/book-summaries" element={<SummariesPage />} />
    <Route path="/ar/book-summaries" element={<Navigate to="/summaries/" replace />} />
    <Route path="/categories/:categorySlug" element={<CategoryPage />} />
    <Route path="/ar/categories/:categorySlug" element={<CategoryPage />} />
    <Route path="/summary/:bookId" element={<SummaryDetailPage />} />
    <Route path="/ar/summary/:bookId" element={<ContentLanguageProvider language="ar"><SummaryDetailPage /></ContentLanguageProvider>} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/calculators" element={<CalculatorsPage />} />
    <Route path="/trade-analyzer" element={<TradeAnalyzerPage />} />
    <Route path="/calculators/pip-value" element={<CalculatorsPage />} />
    <Route path="/calculators/position-size" element={<CalculatorsPage />} />
    <Route path="/calculators/fire" element={<CalculatorsPage />} />
    <Route path="/calculators/compound-interest" element={<CalculatorsPage />} />
    <Route path="/ar/tools/pip-value-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/position-size-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/fire-calculator" element={<CalculatorsPage />} />
    <Route path="/ar/tools/compound-interest-calculator" element={<CalculatorsPage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/news/:slug" element={<NewsArticlePage />} />
    <Route path="/admin/news" element={<AdminRoute><AdminNewsPage /></AdminRoute>} />
    <Route path="/admin/news/new" element={<AdminRoute><AdminNewsEditorPage /></AdminRoute>} />
    <Route path="/admin/news/:articleId" element={<AdminRoute><AdminNewsEditorPage /></AdminRoute>} />
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
      <Route path="/dashboard/ar/summary/:bookId" element={<FocusedReaderLayout />}>
        <Route index element={<ContentLanguageProvider language="ar"><SummaryDetailPage surface="dashboard" /></ContentLanguageProvider>} />
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
  const routes = <Suspense fallback={<Spinner />}><AppRoutes /><InitialPageReady /></Suspense>;

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
