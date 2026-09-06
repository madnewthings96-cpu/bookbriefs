# Key Page Dependency Trees

These ten routes are the principal design targets. Trees recursively trace every local static import plus page-owned local dynamic imports. External packages are omitted. Repeated local files are marked after their first expansion within a page.

Boundary for the circular app import: `FinanceTrackerPage.tsx` and `TradingJournalPage.tsx` import `useFirebase` from `App.tsx`. Their trees therefore expand all synchronous provider/layout dependencies and the globally rendered lazy `ExitIntentPopup`. `App.tsx`'s lazy sibling page registry is not expanded back into every route because those chunks are not rendered dependencies of the active page, would create a cycle, and are mapped completely in `routes.md`.

## / (Home Page)

Entry: `pages/HomePage.tsx`

Renders: Outcome-led editorial landing page with hero proof, learning paths, most-read titles, sample brief, testimonials, and conversion CTA.

Dependencies:

- `constants.ts`
  - `types.ts`
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/StructuredData.tsx`
- `components/Testimonials.tsx`
- `components/MostReadBooks.tsx`
  - `contexts/BooksContext.tsx`
    - `firebase.ts`
    - `types.ts` _(shared; expanded above)_
  - `contexts/LanguageContext.tsx`
  - `translations/bookSummaries.ts`
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_

## /summaries (Book Library)

Entry: `pages/SummariesPage.tsx`

Renders: Filterable/searchable library grid, shared by the English and Arabic summary aliases.

Dependencies:

- `components/BookCard.tsx`
  - `types.ts`
  - `contexts/LanguageContext.tsx`
  - `components/FavoriteButton.tsx`
    - `contexts/FavoritesContext.tsx`
      - `contexts/AuthContext.tsx`
        - `firebase.ts`
      - `firebase.ts` _(shared; expanded above)_
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `components/SignUpPromptModal.tsx`
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/StructuredData.tsx`
- `contexts/BooksContext.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `types.ts` _(shared; expanded above)_
- `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `components/Spinner.tsx`
- `utils/seoConfig.ts` _(shared; expanded above)_
- `types.ts` _(shared; expanded above)_

## /summary/:bookId (Summary Reading Experience)

Entry: `pages/SummaryDetailPage.tsx`

Renders: Long-form book brief with reading progress, notes/highlights, recommendations, reviews, favorites, and PDF/support actions.

Dependencies:

- `types.ts`
- `components/Spinner.tsx`
- `components/ErrorMessage.tsx`
- `components/MarkdownRenderer.tsx`
- `components/ReadingProgressBar.tsx`
- `components/NotesAndHighlightsPanel.tsx`
  - `types.ts` _(shared; expanded above)_
  - `contexts/PersonalNotesContext.tsx`
    - `types.ts` _(shared; expanded above)_
    - `contexts/AuthContext.tsx`
      - `firebase.ts`
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/LanguageContext.tsx`
- `components/AddNoteModal.tsx`
  - `contexts/PersonalNotesContext.tsx` _(shared; expanded above)_
  - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `components/SignUpPromptModal.tsx`
  - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `components/HighlightableText.tsx`
  - `contexts/PersonalNotesContext.tsx` _(shared; expanded above)_
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `components/YouMayAlsoLike.tsx`
  - `types.ts` _(shared; expanded above)_
  - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `components/BookReviews.tsx`
  - `types.ts` _(shared; expanded above)_
  - `constants.ts`
    - `types.ts` _(shared; expanded above)_
- `components/FavoriteButton.tsx`
  - `contexts/FavoritesContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `firebase.ts` _(shared; expanded above)_
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `components/SignUpPromptModal.tsx` _(shared; expanded above)_
- `components/SummaryReadingExperience.tsx`
  - `types.ts` _(shared; expanded above)_
  - `utils/affiliateLinks.ts`
    - `types.ts` _(shared; expanded above)_
  - `components/FavoriteButton.tsx` _(shared; expanded above)_
  - `components/HighlightableText.tsx` _(shared; expanded above)_
  - `components/MarkdownRenderer.tsx` _(shared; expanded above)_
  - `components/NotesAndHighlightsPanel.tsx` _(shared; expanded above)_
- `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `translations/bookSummaries.ts`
  - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `contexts/AuthContext.tsx` _(shared; expanded above)_
- `contexts/UserProgressContext.tsx`
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
- `contexts/BooksContext.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `types.ts` _(shared; expanded above)_
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/StructuredData.tsx`
- `firebase.ts` _(shared; expanded above)_
- `utils/seoConfig.ts` _(shared; expanded above)_

## /calculators/* (Calculator Hub)

Entry: `pages/CalculatorsPage.tsx`

Renders: Pathname-selected shell for position size, pip value, FIRE, and compound-interest tools.

Dependencies:

- `components/PipValueCalculator.tsx`
- `components/PositionSizeCalculator.tsx`
- `components/FIRECalculator.tsx`
- `components/CompoundCalculator.tsx`
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `utils/seoConfig.ts` _(shared; expanded above)_

## /blog and /blog/:slug (Editorial Blog)

Entry: `pages/BlogPage.tsx`

Renders: Bilingual index/article renderer backed by an in-file post catalog and structured data.

Dependencies:

- `contexts/LanguageContext.tsx`
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/StructuredData.tsx`

## /trading-journal (Trading Journal)

Entry: `pages/TradingJournalPage.tsx`

Renders: Protected trading dashboard with command center, trade capture/table/calendar, goals, review drawer, analytics, confirmations, and report export.

Dependencies:

- `App.tsx`
  - `contexts/AuthContext.tsx`
    - `firebase.ts`
  - `contexts/LanguageContext.tsx`
  - `contexts/ReaderModeContext.tsx`
  - `contexts/PersonalNotesContext.tsx`
    - `types.ts`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/UserProgressContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/FavoritesContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `firebase.ts` _(shared; expanded above)_
  - `contexts/ReadingChallengeContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `firebase.ts` _(shared; expanded above)_
  - `contexts/BooksContext.tsx`
    - `firebase.ts` _(shared; expanded above)_
    - `types.ts` _(shared; expanded above)_
  - `components/Header.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `contexts/ReaderModeContext.tsx` _(shared; expanded above)_
    - `contexts/BooksContext.tsx` _(shared; expanded above)_
    - `components/LanguageSelector.tsx`
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `components/SearchResults.tsx`
    - `components/UserMenu.tsx`
      - `contexts/AuthContext.tsx` _(shared; expanded above)_
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `components/FeedbackModal.tsx`
        - `firebase.ts` _(shared; expanded above)_
        - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `services/searchService.ts`
      - `translations/bookSummaries.ts`
        - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `types.ts` _(shared; expanded above)_
  - `components/Footer.tsx`
  - `components/MobileBottomNav.tsx`
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `contexts/ReaderModeContext.tsx` _(shared; expanded above)_
  - `components/ProtectedRoute.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `components/ScrollToTop.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `components/Spinner.tsx`
  - `components/ExitIntentPopup.tsx`
    - `firebase.ts` _(shared; expanded above)_
- `firebase.ts` _(shared; expanded above)_
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/trading/StatCard.tsx`
- `components/trading/AddTradeModal.tsx`
  - `utils/tradingUtils.ts`
- `components/trading/TradeTable.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/TradeCalendar.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/StartingBalanceModal.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/StreakBanner.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/GoalsSection.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/AddGoalModal.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/ui/ConfirmDialog.tsx`
- `components/trading/ExportReportModal.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
  - `utils/pdfReportGenerator.ts`
    - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/TradingReviewDrawer.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/TradingCommandCenter.tsx`
  - `components/trading/EquityCurve.tsx`
    - `utils/tradingUtils.ts` _(shared; expanded above)_
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `components/trading/TradingAnalyticsPanels.tsx`
  - `utils/tradingUtils.ts` _(shared; expanded above)_
- `utils/tradingUtils.ts` _(shared; expanded above)_

## /finance-tracker (Finance Tracker)

Entry: `pages/FinanceTrackerPage.tsx`

Renders: Protected personal-finance dashboard for transactions, budgets, goals, charts, filters, localization, and receipt scanning.

Dependencies:

- `App.tsx`
  - `contexts/AuthContext.tsx`
    - `firebase.ts`
  - `contexts/LanguageContext.tsx`
  - `contexts/ReaderModeContext.tsx`
  - `contexts/PersonalNotesContext.tsx`
    - `types.ts`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/UserProgressContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `contexts/FavoritesContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `firebase.ts` _(shared; expanded above)_
  - `contexts/ReadingChallengeContext.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `firebase.ts` _(shared; expanded above)_
  - `contexts/BooksContext.tsx`
    - `firebase.ts` _(shared; expanded above)_
    - `types.ts` _(shared; expanded above)_
  - `components/Header.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `contexts/ReaderModeContext.tsx` _(shared; expanded above)_
    - `contexts/BooksContext.tsx` _(shared; expanded above)_
    - `components/LanguageSelector.tsx`
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `components/SearchResults.tsx`
    - `components/UserMenu.tsx`
      - `contexts/AuthContext.tsx` _(shared; expanded above)_
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `components/FeedbackModal.tsx`
        - `firebase.ts` _(shared; expanded above)_
        - `contexts/AuthContext.tsx` _(shared; expanded above)_
    - `services/searchService.ts`
      - `translations/bookSummaries.ts`
        - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `contexts/LanguageContext.tsx` _(shared; expanded above)_
      - `types.ts` _(shared; expanded above)_
  - `components/Footer.tsx`
  - `components/MobileBottomNav.tsx`
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_
    - `contexts/ReaderModeContext.tsx` _(shared; expanded above)_
  - `components/ProtectedRoute.tsx`
    - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `components/ScrollToTop.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `components/Spinner.tsx`
  - `components/ExitIntentPopup.tsx`
    - `firebase.ts` _(shared; expanded above)_
- `firebase.ts` _(shared; expanded above)_
- `hooks/useSEO.tsx`
  - `utils/seoConfig.ts`
- `components/ReceiptScanner.tsx`

## /profile (User Library)

Entry: `pages/UserProfilePage.tsx`

Renders: Protected account library with saved books and reading-progress data.

Dependencies:

- `contexts/LanguageContext.tsx`
- `contexts/AuthContext.tsx`
  - `firebase.ts`
- `contexts/UserProgressContext.tsx`
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
- `contexts/FavoritesContext.tsx`
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `firebase.ts` _(shared; expanded above)_
- `contexts/BooksContext.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `types.ts`
- `components/FavoriteButton.tsx`
  - `contexts/FavoritesContext.tsx` _(shared; expanded above)_
  - `contexts/AuthContext.tsx` _(shared; expanded above)_
  - `components/SignUpPromptModal.tsx`
    - `contexts/LanguageContext.tsx` _(shared; expanded above)_
- `types.ts` _(shared; expanded above)_

## /reading-challenge (Reading Challenge)

Entry: `pages/ReadingChallengePage.tsx`

Renders: Protected onboarding and challenge dashboard driven by auth, books, and challenge contexts.

Dependencies:

- `contexts/ReadingChallengeContext.tsx`
  - `contexts/AuthContext.tsx`
    - `firebase.ts`
  - `firebase.ts` _(shared; expanded above)_
- `contexts/AuthContext.tsx` _(shared; expanded above)_
- `contexts/BooksContext.tsx`
  - `firebase.ts` _(shared; expanded above)_
  - `types.ts`
- `types.ts` _(shared; expanded above)_

## /downloads (Downloads)

Entry: `pages/DownloadsPage.tsx`

Renders: Protected companion-resource catalog with language-aware copy and direct file actions.

Dependencies:

- `contexts/LanguageContext.tsx`


