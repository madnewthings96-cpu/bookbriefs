# Authenticated Reading Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, data-backed Ta7leel reading dashboard that wraps every authenticated feature in one coherent workspace while preserving the public site.

**Architecture:** Add a protected nested `/dashboard/*` route branch whose shared `DashboardLayout` owns desktop, tablet, and mobile navigation. Keep public routes intact, derive overview content through pure model helpers over existing contexts, and reuse existing feature pages under the shell with dashboard-aware link generation.

**Tech Stack:** React 18, TypeScript 5.8, React Router 6, Firebase Auth/Firestore, Tailwind CSS 3, scoped CSS, Lucide React, Node test runner with `tsx`, Vite 6.

**Spec:** `docs/superpowers/specs/2026-09-09-authenticated-dashboard-shell-design.md`

## Global Constraints

- The public homepage, header, footer, blog, news, `/summaries`, `/summary/:bookId`, `/categories/*`, and `/calculators/*` keep their current frame and SEO behavior.
- Dashboard routes are private/noindex and never render the public header, footer, public mobile navigation, exit-intent prompt, or coffee-support card.
- The dashboard is English-only in this implementation but uses logical CSS properties and passes a simulated `dir="rtl"` compatibility check.
- Existing Firebase and local-storage data shapes remain unchanged; dashboard components consume context APIs rather than reading persistence directly.
- Overview cards display real context data or purposeful empty/loading/error states—never invented analytics.
- Finance Tracker, Trading Journal, Downloads, Calculators, Reading Challenge, and the administrator feedback queue keep their internal behavior in the first shell release.
- Desktop sidebar widths are 240px expanded and 72px collapsed; the preference key is `ta7leel_dashboard_sidebar_collapsed`.
- Mobile primary navigation contains Overview, Discover, Library, Notes, and More; the More drawer contains Challenge, Tools, Send feedback, and Settings.
- Interactive controls are at least 44×44px, focus remains visible, active routes use `aria-current="page"`, and overlays trap/restore focus.
- Motion respects `prefers-reduced-motion`; do not add `transition: all`, permanent `will-change`, or decorative animation loops.
- Do not add a theme switcher, restore Arabic translations, expose the admin feedback queue to reader navigation, or add a new dependency.

---

## File Structure

### Routing and authentication

- Modify `contexts/AuthContext.tsx` — expose Firebase authentication readiness.
- Modify `contexts/LanguageContext.tsx` — add English dashboard navigation and state copy.
- Modify `contexts/FavoritesContext.tsx` and `contexts/ReadingChallengeContext.tsx` — expose non-destructive card-level load errors.
- Create `components/authRouteModel.ts` — pure protected-route and post-auth destination decisions.
- Modify `components/ProtectedRoute.tsx` — support nested routes, loading state, and intended destination.
- Modify `components/appLayoutModel.ts` — classify public, standalone, dashboard, and focused-reader routes.
- Modify `App.tsx` — install the nested protected route branch and select the correct outer frame.
- Modify `pages/LoginPage.tsx` and `pages/SignUpPage.tsx` — land on the safe intended dashboard destination.
- Modify `utils/seoConfig.ts` — mark the whole dashboard prefix private/noindex.

### Dashboard shell

- Create `components/dashboard/dashboardNavigation.ts` — navigation groups, page labels, active matching, and a re-export of the centralized legacy redirects.
- Create `components/dashboard/DashboardLayout.tsx` — shared shell and responsive overlay ownership.
- Create `components/dashboard/DashboardSidebar.tsx` — desktop navigation and account footer.
- Create `components/dashboard/DashboardTopbar.tsx` — current page title, search slot, and account access.
- Create `components/dashboard/DashboardMobileNav.tsx` — four destinations plus accessible More drawer.
- Create `components/dashboard/DashboardSearch.tsx` — localized catalog search and keyboard navigation.
- Create `components/dashboard/dashboardSearchModel.ts` — pure ranked book search.
- Create `components/dashboard/DashboardShell.css` — scoped shell tokens, layout, responsive, RTL, focus, and reduced-motion rules.
- Create `hooks/useModalDialog.ts` — reusable Escape, focus-trap, scroll-lock, and focus-restoration behavior.
- Modify `components/FeedbackModal.tsx` — satisfy dialog focus trapping and focus restoration inside the dashboard.

### Reading workspace pages

- Create `components/dashboard/dashboardOverviewModel.ts` — pure continue-reading, shelf, notes, insight, and recommendation selectors.
- Create `components/dashboard/DashboardBookCard.tsx` — shared book card for overview and library.
- Create `components/dashboard/DashboardOverviewView.tsx` — presentational overview states.
- Create `pages/DashboardOverviewPage.tsx` — context-backed overview container.
- Create `pages/DashboardLibraryPage.tsx` — saved, active, completed, and recommended shelves.
- Create `pages/DashboardNotesPage.tsx` — cross-book notes/highlights view.
- Create `pages/DashboardSettingsPage.tsx` — account and workspace preferences.
- Create `pages/DashboardPages.css` — overview and workspace-page styling.

### Existing feature integration

- Create `components/dashboard/FocusedReaderLayout.tsx` — compact back-to-dashboard reading header.
- Create `components/readingRouteModel.ts` — public/dashboard summary and catalog hrefs.
- Modify `pages/SummariesPage.tsx` — accept a dashboard surface without duplicating catalog logic.
- Modify `pages/SummaryDetailPage.tsx` — generate surface-aware back and related-book links.
- Modify `components/SummaryReadingExperience.tsx` and `components/YouMayAlsoLike.tsx` — accept route builders from the page.
- Modify `pages/ReadingChallengePage.tsx` — link books into the dashboard reader.
- Modify `pages/CalculatorsPage.tsx` — understand `/dashboard/calculators/*` aliases and retain shell navigation between tabs.
- Modify `components/UserMenu.tsx` — link authenticated users to dashboard destinations.

### Tests

- Modify `tests/appLayoutModel.test.ts`.
- Create `tests/authRouteModel.test.ts`.
- Create `tests/dashboardNavigation.test.ts`.
- Create `tests/dashboardSearchModel.test.ts`.
- Create `tests/dashboardOverviewModel.test.ts`.
- Create `tests/dashboardDataContext.test.ts`.
- Create `tests/dashboardOverviewView.test.ts`.
- Create `tests/dashboardWorkspacePages.test.ts`.
- Create `tests/readingRouteModel.test.ts`.
- Create `tests/dashboardShellContract.test.ts`.
- Create `tests/dashboardRouteContract.test.ts`.
- Modify `tests/seoCatalog.test.ts`.

---

### Task 1: Authentication Readiness and Layout Classification

**Files:**
- Create: `components/authRouteModel.ts`
- Modify: `contexts/AuthContext.tsx:12-88`
- Modify: `components/ProtectedRoute.tsx:1-19`
- Modify: `components/appLayoutModel.ts:1-7`
- Modify: `tests/appLayoutModel.test.ts`
- Create: `tests/authRouteModel.test.ts`

**Interfaces:**
- Produces: `ProtectedRouteDecision`, `getProtectedRouteDecision(isAuthReady, isAuthenticated)`, `getSafePostAuthDestination(candidate)`, `AppLayoutFamily`, `LEGACY_DASHBOARD_REDIRECTS`, `getAppLayoutFamily(pathname)`, `isDashboardAppRoute(pathname)`, and `isFocusedDashboardRoute(pathname)`.
- Produces: `AuthContextType.isAuthReady: boolean` and a `ProtectedRoute` that renders either `children` or an `Outlet`.
- Consumes: Firebase `onAuthStateChanged`, React Router `Navigate`, `Outlet`, and `useLocation`.

- [ ] **Step 1: Write failing authentication and layout-model tests**

```ts
// tests/authRouteModel.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getProtectedRouteDecision, getSafePostAuthDestination } from '../components/authRouteModel';

test('protected routes wait for auth before allowing or redirecting', () => {
  assert.equal(getProtectedRouteDecision(false, false), 'loading');
  assert.equal(getProtectedRouteDecision(false, true), 'loading');
  assert.equal(getProtectedRouteDecision(true, true), 'allow');
  assert.equal(getProtectedRouteDecision(true, false), 'redirect');
});

test('post-auth redirects accept dashboard paths only', () => {
  assert.equal(getSafePostAuthDestination('/dashboard/notes?book=atomic-habits'), '/dashboard/notes?book=atomic-habits');
  assert.equal(getSafePostAuthDestination('/profile'), '/dashboard');
  assert.equal(getSafePostAuthDestination('https://evil.example'), '/dashboard');
  assert.equal(getSafePostAuthDestination(undefined), '/dashboard');
});
```

Add these expectations to `tests/appLayoutModel.test.ts`:

```ts
assert.equal(model.getAppLayoutFamily('/'), 'public');
assert.equal(model.getAppLayoutFamily('/login'), 'standalone');
assert.equal(model.getAppLayoutFamily('/dashboard'), 'dashboard');
assert.equal(model.getAppLayoutFamily('/dashboard/library/'), 'dashboard');
assert.equal(model.getAppLayoutFamily('/profile'), 'dashboard');
assert.equal(model.getAppLayoutFamily('/finance-tracker'), 'dashboard');
assert.equal(model.isDashboardAppRoute('/dashboardish'), false);
assert.equal(model.isFocusedDashboardRoute('/dashboard/summary/atomic-habits'), true);
assert.equal(model.isFocusedDashboardRoute('/summary/atomic-habits'), false);
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
node --import tsx --test tests/authRouteModel.test.ts tests/appLayoutModel.test.ts
```

Expected: FAIL because the new model exports do not exist.

- [ ] **Step 3: Implement the pure decisions**

```ts
// components/authRouteModel.ts
export type ProtectedRouteDecision = 'loading' | 'allow' | 'redirect';

export const getProtectedRouteDecision = (
  isAuthReady: boolean,
  isAuthenticated: boolean,
): ProtectedRouteDecision => {
  if (!isAuthReady) return 'loading';
  return isAuthenticated ? 'allow' : 'redirect';
};

export const getSafePostAuthDestination = (candidate?: string): string => {
  if (!candidate) return '/dashboard';
  const [pathname] = candidate.split(/[?#]/, 1);
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    ? candidate
    : '/dashboard';
};
```

```ts
// components/appLayoutModel.ts
const normalizePath = (pathname: string) =>
  (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname).toLowerCase();

export type AppLayoutFamily = 'public' | 'standalone' | 'dashboard';

export const LEGACY_DASHBOARD_REDIRECTS: Record<string, string> = {
  '/profile': '/dashboard/settings',
  '/reading-challenge': '/dashboard/challenge',
  '/downloads': '/dashboard/downloads',
  '/feedback': '/dashboard/admin/feedback',
  '/finance-tracker': '/dashboard/finance',
  '/trading-journal': '/dashboard/trading',
};

export const isStandaloneAppRoute = (pathname: string) =>
  ['/login', '/signup'].includes(normalizePath(pathname));

export const isDashboardAppRoute = (pathname: string) => {
  const normalized = normalizePath(pathname);
  return normalized === '/dashboard' || normalized.startsWith('/dashboard/');
};

export const isFocusedDashboardRoute = (pathname: string) =>
  /^\/dashboard\/summary\/[^/]+$/.test(normalizePath(pathname));

export const getAppLayoutFamily = (pathname: string): AppLayoutFamily => {
  const normalized = normalizePath(pathname);
  if (isStandaloneAppRoute(normalized)) return 'standalone';
  if (isDashboardAppRoute(normalized) || normalized in LEGACY_DASHBOARD_REDIRECTS) return 'dashboard';
  return 'public';
};
```

- [ ] **Step 4: Expose readiness and update the guard**

In `AuthContext`, initialize `isAuthReady` to `false`, set it to `true` in both the success and error callbacks of `onAuthStateChanged`, and include it in the context value. Do not infer readiness from `user === null`.

```tsx
// components/ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();
  const decision = getProtectedRouteDecision(isAuthReady, isAuthenticated);

  if (decision === 'loading') {
    return <div className="dashboard-auth-loading" role="status">Preparing your reading desk…</div>;
  }
  if (decision === 'redirect') {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return <>{children ?? <Outlet />}</>;
};
```

- [ ] **Step 5: Run tests and type-check through the build**

Run:

```bash
node --import tsx --test tests/authRouteModel.test.ts tests/appLayoutModel.test.ts
npm run build
```

Expected: both tests PASS and the production build succeeds.

- [ ] **Step 6: Commit the authentication foundation**

```bash
git add contexts/AuthContext.tsx components/ProtectedRoute.tsx components/authRouteModel.ts components/appLayoutModel.ts tests/authRouteModel.test.ts tests/appLayoutModel.test.ts
git commit -m "feat: add dashboard auth and layout foundation"
```

---

### Task 2: Navigation Model and Responsive Dashboard Shell

**Files:**
- Create: `components/dashboard/dashboardNavigation.ts`
- Create: `components/dashboard/DashboardLayout.tsx`
- Create: `components/dashboard/DashboardSidebar.tsx`
- Create: `components/dashboard/DashboardTopbar.tsx`
- Create: `components/dashboard/DashboardMobileNav.tsx`
- Create: `components/dashboard/DashboardShell.css`
- Create: `hooks/useModalDialog.ts`
- Modify: `components/FeedbackModal.tsx`
- Modify: `contexts/LanguageContext.tsx`
- Create: `tests/dashboardNavigation.test.ts`
- Create: `tests/dashboardShellContract.test.ts`

**Interfaces:**
- Consumes: `useAuth()`, `useLanguage()`, `Outlet`, `NavLink`, `useLocation()`, `FeedbackModal`, `getModalFocusWrapTarget`, and the existing Ta7leel logo asset.
- Produces: `DASHBOARD_NAVIGATION`, `getDashboardPageTitle(pathname)`, `isDashboardNavItemActive(item, pathname)`, and default `DashboardLayout`; it re-exports the route model's `LEGACY_DASHBOARD_REDIRECTS` for consumers.
- Produces: `useModalDialog({ open, onClose })`, returning a ref for the dialog container and automatically restoring the element that opened it.
- Produces CSS hooks: `.dashboard-shell`, `.dashboard-sidebar`, `.dashboard-topbar`, `.dashboard-main`, `.dashboard-mobile-nav`, and `.dashboard-more-drawer`.

- [ ] **Step 1: Write failing navigation-model tests**

```ts
// tests/dashboardNavigation.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DASHBOARD_NAVIGATION,
  LEGACY_DASHBOARD_REDIRECTS,
  getDashboardPageTitle,
  isDashboardNavItemActive,
} from '../components/dashboard/dashboardNavigation';

test('reading destinations lead and tools remain a secondary group', () => {
  assert.deepEqual(DASHBOARD_NAVIGATION.map(group => group.id), ['reading', 'tools', 'utility']);
  assert.deepEqual(DASHBOARD_NAVIGATION[0].items.map(item => item.href), [
    '/dashboard', '/dashboard/discover', '/dashboard/library', '/dashboard/notes', '/dashboard/challenge',
  ]);
  assert.equal(DASHBOARD_NAVIGATION[1].items[0].href, '/dashboard/downloads');
  assert.equal(DASHBOARD_NAVIGATION.flatMap(group => group.items).some(item => item.href.includes('admin')), false);
});

test('overview matching is exact while nested destinations stay active', () => {
  const overview = DASHBOARD_NAVIGATION[0].items[0];
  const library = DASHBOARD_NAVIGATION[0].items[2];
  assert.equal(isDashboardNavItemActive(overview, '/dashboard'), true);
  assert.equal(isDashboardNavItemActive(overview, '/dashboard/library'), false);
  assert.equal(isDashboardNavItemActive(library, '/dashboard/library/saved'), true);
  assert.equal(getDashboardPageTitle('/dashboard/finance'), 'Finance Tracker');
});

test('legacy protected routes have deterministic replacements', () => {
  assert.equal(LEGACY_DASHBOARD_REDIRECTS['/profile'], '/dashboard/settings');
  assert.equal(LEGACY_DASHBOARD_REDIRECTS['/feedback'], '/dashboard/admin/feedback');
});
```

- [ ] **Step 2: Run the navigation test and verify failure**

Run:

```bash
node --import tsx --test tests/dashboardNavigation.test.ts
```

Expected: FAIL because `dashboardNavigation.ts` does not exist.

- [ ] **Step 3: Implement the typed navigation model**

Use Lucide component types without putting JSX in the model:

```ts
export interface DashboardNavItem {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  action?: 'feedback';
}

export interface DashboardNavGroup {
  id: 'reading' | 'tools' | 'utility';
  label: string | null;
  items: DashboardNavItem[];
}

export { LEGACY_DASHBOARD_REDIRECTS } from '../appLayoutModel';
```

Use stable IDs and exact matching for Overview; other links match their own nested path boundary.

- [ ] **Step 4: Build the shell components**

`DashboardLayout` owns all open/collapsed state so the sidebar and mobile controls never disagree:

```tsx
const SIDEBAR_KEY = 'ta7leel_dashboard_sidebar_collapsed';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === 'true'
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed(current => {
    const next = !current;
    localStorage.setItem(SIDEBAR_KEY, String(next));
    return next;
  });

  useEffect(() => {
    const resetPreference = () => setCollapsed(false);
    window.addEventListener('dashboard-preference-change', resetPreference);
    return () => window.removeEventListener('dashboard-preference-change', resetPreference);
  }, []);

  return (
    <div className="dashboard-shell" data-sidebar-collapsed={collapsed || undefined}>
      <a className="dashboard-skip-link" href="#dashboard-content">Skip to content</a>
      <DashboardSidebar collapsed={collapsed} onToggle={toggleCollapsed} onFeedback={() => setFeedbackOpen(true)} />
      <div className="dashboard-workspace">
        <DashboardTopbar onOpenMore={() => setMoreOpen(true)} />
        <main id="dashboard-content" className="dashboard-main" tabIndex={-1}><Outlet /></main>
      </div>
      <DashboardMobileNav open={moreOpen} onOpenChange={setMoreOpen} onFeedback={() => setFeedbackOpen(true)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
```

The mobile drawer uses `role="dialog"`, `aria-modal="true"`, a labelled heading, Escape close, focus trapping via a new `useModalDialog` hook backed by the existing `getModalFocusWrapTarget` helper, body-scroll locking, and focus restoration to More.

Add the same `role="dialog"`, labelled title, `useModalDialog`, and trigger-focus restoration contract to `FeedbackModal`; the dashboard exposes that existing modal directly, so it must meet the shell's overlay requirements. The hook captures `document.activeElement` when opening, queries only buttons, links, inputs, selects, textareas, and non-negative tabindex elements inside its container, wraps Tab with `getModalFocusWrapTarget`, closes on Escape, locks body scroll while open, and restores the captured trigger on cleanup.

Add these English keys to `LanguageContext` and use `t(key) || fallbackLabel` through the shell: `dashboardOverview`, `dashboardDiscover`, `dashboardLibrary`, `dashboardNotes`, `dashboardChallenge`, `dashboardTools`, `dashboardDownloads`, `dashboardCalculators`, `dashboardFinance`, `dashboardTrading`, `dashboardSendFeedback`, `dashboardSettings`, and `dashboardMore`.

- [ ] **Step 5: Implement the scoped shell CSS**

Start the file with explicit tokens and logical layout properties:

```css
.dashboard-shell {
  --dashboard-sidebar-width: 240px;
  --dashboard-forest: #123d2f;
  --dashboard-forest-deep: #09251c;
  --dashboard-ivory: #f7f3ea;
  --dashboard-card: #fffdf8;
  --dashboard-border: rgb(18 61 47 / 10%);
  min-block-size: 100vh;
  display: grid;
  grid-template-columns: var(--dashboard-sidebar-width) minmax(0, 1fr);
  background: var(--dashboard-ivory);
  color: #16231e;
}

.dashboard-shell[data-sidebar-collapsed] { --dashboard-sidebar-width: 72px; }
.dashboard-sidebar { position: sticky; inset-block-start: 0; block-size: 100vh; }
.dashboard-main { min-inline-size: 0; padding: 24px clamp(16px, 2.5vw, 40px) 48px; }

[dir='rtl'] .dashboard-shell { direction: rtl; }

@media (max-width: 1023px) {
  .dashboard-shell { display: block; }
  .dashboard-sidebar { display: none; }
  .dashboard-main { padding-block-end: 104px; }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-shell *, .dashboard-shell *::before, .dashboard-shell *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

Add explicit 44px minimum targets, focus-visible rings, expanded/collapsed label behavior, the fixed mobile bar, and drawer/backdrop states. Use named transition properties only.

- [ ] **Step 6: Add source-contract tests for accessibility and CSS invariants**

```ts
// tests/dashboardShellContract.test.ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard shell owns landmarks and accessible mobile overlay semantics', async () => {
  const layout = await readFile('components/dashboard/DashboardLayout.tsx', 'utf8');
  const mobile = await readFile('components/dashboard/DashboardMobileNav.tsx', 'utf8');
  const feedback = await readFile('components/FeedbackModal.tsx', 'utf8');
  assert.match(layout, /href="#dashboard-content"/);
  assert.match(layout, /<main[^>]*id="dashboard-content"/);
  assert.match(mobile, /aria-modal="true"/);
  assert.match(mobile, /aria-current|NavLink/);
  assert.match(feedback, /role="dialog"/);
  assert.match(feedback, /useModalDialog/);
});

test('dashboard CSS is scoped, direction-safe, and reduced-motion aware', async () => {
  const css = await readFile('components/dashboard/DashboardShell.css', 'utf8');
  assert.match(css, /--dashboard-sidebar-width:\s*240px/);
  assert.match(css, /\[dir=['"]rtl['"]\]/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /will-change/);
});
```

- [ ] **Step 7: Run shell tests and build**

Run:

```bash
node --import tsx --test tests/dashboardNavigation.test.ts tests/dashboardShellContract.test.ts
npm run build
```

Expected: tests PASS and the shell components type-check even before routes render them.

- [ ] **Step 8: Commit the shell**

```bash
git add components/dashboard hooks/useModalDialog.ts components/FeedbackModal.tsx contexts/LanguageContext.tsx tests/dashboardNavigation.test.ts tests/dashboardShellContract.test.ts
git commit -m "feat: build responsive dashboard shell"
```

---

### Task 3: Global Dashboard Book Search

**Files:**
- Create: `components/dashboard/dashboardSearchModel.ts`
- Create: `components/dashboard/DashboardSearch.tsx`
- Modify: `components/dashboard/DashboardTopbar.tsx`
- Modify: `components/dashboard/DashboardShell.css`
- Create: `tests/dashboardSearchModel.test.ts`

**Interfaces:**
- Consumes: `Book`, `BooksContext`, `LanguageContext`, `useNavigate`, and `/dashboard/summary/:bookId`.
- Produces: `DashboardSearchBook`, `searchDashboardBooks(books, query, limit)`, and default `DashboardSearch`.

- [ ] **Step 1: Write the failing ranked-search test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { searchDashboardBooks } from '../components/dashboard/dashboardSearchModel';

const books = [
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' },
  { id: 'clear-thinking', title: 'Clear Thinking', author: 'Shane Parrish', category: 'Psychology', coverImageUrl: '/clear.jpg' },
];

test('dashboard search ranks title prefix before author matches and caps results', () => {
  const results = searchDashboardBooks(books, 'clear', 5);
  assert.deepEqual(results.map(result => result.book.id), ['clear-thinking', 'atomic-habits']);
  assert.equal(searchDashboardBooks(books, '   ', 5).length, 0);
  assert.equal(searchDashboardBooks(books, 'clear', 1).length, 1);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --import tsx --test tests/dashboardSearchModel.test.ts
```

Expected: FAIL because the search model is missing.

- [ ] **Step 3: Implement normalized ranking**

Return title-prefix matches first, then title contains, then author, then category. Preserve original catalog order as the final tie-breaker and never mutate `books`.

```ts
export interface DashboardSearchBook {
  book: Book;
  title: string;
  author: string;
  score: number;
}

export function searchDashboardBooks(
  books: Array<Book & { localizedTitle?: string; localizedAuthor?: string }>,
  query: string,
  limit = 6,
): DashboardSearchBook[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return books.map((book, index) => {
    const title = book.localizedTitle || book.title;
    const author = book.localizedAuthor || book.author;
    const haystacks = [title, author, book.category].map(value => value.toLocaleLowerCase());
    const score = haystacks[0].startsWith(needle) ? 0 : haystacks[0].includes(needle) ? 1 : haystacks[1].includes(needle) ? 2 : haystacks[2].includes(needle) ? 3 : 99;
    return { book, title, author, score, index };
  }).filter(item => item.score < 99).sort((a, b) => a.score - b.score || a.index - b.index).slice(0, limit);
}
```

- [ ] **Step 4: Build the accessible combobox UI**

`DashboardSearch` uses `role="combobox"`, `aria-expanded`, `aria-controls`, and an `aria-activedescendant` pointing at `role="option"` results. ArrowDown/ArrowUp move the active index, Enter navigates, Escape clears and closes, outside pointer closes, and route changes reset the query. Search results link to `/dashboard/summary/${book.arabicSlug || book.id}`.

- [ ] **Step 5: Run tests and build**

Run:

```bash
node --import tsx --test tests/dashboardSearchModel.test.ts tests/dashboardShellContract.test.ts
npm run build
```

Expected: PASS with no accessibility contract regression.

- [ ] **Step 6: Commit search**

```bash
git add components/dashboard/DashboardSearch.tsx components/dashboard/dashboardSearchModel.ts components/dashboard/DashboardTopbar.tsx components/dashboard/DashboardShell.css tests/dashboardSearchModel.test.ts
git commit -m "feat: add dashboard book search"
```

---

### Task 4: Data-Backed Overview Model

**Files:**
- Create: `components/dashboard/dashboardOverviewModel.ts`
- Modify: `contexts/FavoritesContext.tsx`
- Modify: `contexts/ReadingChallengeContext.tsx`
- Create: `tests/dashboardOverviewModel.test.ts`
- Create: `tests/dashboardDataContext.test.ts`

**Interfaces:**
- Consumes: `Book`, `BookProgress`, `PersonalNotesData`, favorites IDs, and reading-history dates.
- Produces: `DashboardShelfBook`, `DashboardKnowledgeItem`, `WeeklyReadingInsight`, `selectContinueReading`, `buildDashboardShelf`, `selectRecentKnowledge`, `buildWeeklyReadingInsight`, and `selectDashboardRecommendations`.
- Produces: `FavoritesContextType.error: string | null` and `ReadingChallengeContextType.error: string | null` so overview cards can report remote failures without reading Firestore.

- [ ] **Step 1: Write failing selector tests with fixed dates**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDashboardShelf,
  buildWeeklyReadingInsight,
  selectContinueReading,
  selectRecentKnowledge,
} from '../components/dashboard/dashboardOverviewModel';

const books = [
  { id: 'a', title: 'A', author: 'Author A', category: 'Business', coverImageUrl: '/a.jpg' },
  { id: 'b', title: 'B', author: 'Author B', category: 'Psychology', coverImageUrl: '/b.jpg' },
];
const progress = [
  { bookId: 'a', progress: 25, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-02') },
  { bookId: 'b', progress: 75, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-08') },
];

test('continue reading chooses the most recently opened incomplete catalog book', () => {
  assert.equal(selectContinueReading(books, progress)?.book.id, 'b');
});

test('library merges favorite and progress status without mutating inputs', () => {
  const shelf = buildDashboardShelf(books, ['a'], progress);
  assert.deepEqual(shelf.map(item => [item.book.id, item.saved, item.status]), [
    ['a', true, 'in-progress'], ['b', false, 'in-progress'],
  ]);
});

test('recent knowledge combines notes and highlights by updated time', () => {
  const result = selectRecentKnowledge({
    notes: [{ id: 'n', bookId: 'a', content: 'Note', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-02') }],
    highlights: [{ id: 'h', bookId: 'b', text: 'Highlight', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-03') }],
  }, books, 2);
  assert.deepEqual(result.map(item => item.id), ['h', 'n']);
});

test('weekly insight counts unique local reading days in the current seven-day window', () => {
  const insight = buildWeeklyReadingInsight([
    new Date('2026-09-03T09:00:00'), new Date('2026-09-03T18:00:00'), new Date('2026-09-08T12:00:00'),
  ], new Date('2026-09-09T12:00:00'));
  assert.equal(insight.readingDays, 2);
});
```

- [ ] **Step 2: Run the selector test and verify failure**

Run:

```bash
node --import tsx --test tests/dashboardOverviewModel.test.ts
```

Expected: FAIL because the model is missing.

- [ ] **Step 3: Implement immutable selectors and safe fallbacks**

Define status exactly:

```ts
export type DashboardReadingStatus = 'saved' | 'in-progress' | 'completed' | 'not-started';

export interface DashboardShelfBook {
  book: Book;
  progress: number;
  saved: boolean;
  status: DashboardReadingStatus;
  lastReadAt?: Date;
}

export interface DashboardKnowledgeItem {
  id: string;
  kind: 'note' | 'highlight';
  bookId: string;
  book?: Book;
  content: string;
  updatedAt: Date;
}

export interface WeeklyReadingInsight {
  readingDays: number;
  currentStreak: number;
}
```

Clamp progress to 0–100; ignore progress records whose books no longer exist; sort active books by `lastReadAt` descending, completed books next, saved-only books next, and recommendations last. Weekly dates use local `getFullYear/getMonth/getDate` keys rather than UTC strings. `selectDashboardRecommendations(books, excludedIds, limit)` uses the existing preferred IDs followed by stable catalog order, excludes active/library book IDs, and returns `DashboardShelfBook[]` with `not-started` status.

- [ ] **Step 4: Expose non-destructive remote load errors**

In both contexts, initialize `error` to `null`, clear it before subscribing/loading and after a successful result, and set stable English copy in the existing error callbacks. Favorites continues to expose its legacy fallback list; Reading Challenge continues to expose `null` challenge. Add `error` to each context value without changing any stored document or local-storage shape.

```ts
// tests/dashboardDataContext.test.ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard data contexts expose recoverable load errors', async () => {
  const favorites = await readFile('contexts/FavoritesContext.tsx', 'utf8');
  const challenge = await readFile('contexts/ReadingChallengeContext.tsx', 'utf8');
  assert.match(favorites, /error:\s*string\s*\|\s*null/);
  assert.match(favorites, /setError\(/);
  assert.match(challenge, /error:\s*string\s*\|\s*null/);
  assert.match(challenge, /setError\(/);
});
```

- [ ] **Step 5: Run tests**

Run:

```bash
node --import tsx --test tests/dashboardOverviewModel.test.ts tests/dashboardDataContext.test.ts tests/profileDashboard.test.ts
```

Expected: PASS; existing profile-model behavior remains intact.

- [ ] **Step 6: Commit the overview model**

```bash
git add components/dashboard/dashboardOverviewModel.ts contexts/FavoritesContext.tsx contexts/ReadingChallengeContext.tsx tests/dashboardOverviewModel.test.ts tests/dashboardDataContext.test.ts
git commit -m "feat: model dashboard reading data"
```

---

### Task 5: Dashboard Overview UI

**Files:**
- Create: `components/dashboard/DashboardBookCard.tsx`
- Create: `components/dashboard/DashboardOverviewView.tsx`
- Create: `pages/DashboardOverviewPage.tsx`
- Create: `pages/DashboardPages.css`
- Create: `tests/dashboardOverviewView.test.ts`

**Interfaces:**
- Consumes: Task 4 selectors plus `useAuth`, `useBooks`, `useFavorites`, `useUserProgress`, `usePersonalNotes`, `useReadingChallenge`, and `useLanguage`.
- Produces: `DashboardOverviewViewProps`, default `DashboardOverviewView`, default `DashboardOverviewPage`, and reusable `DashboardBookCard`.

- [ ] **Step 1: Write a failing presentational rendering test**

Use `StaticRouter` so route links can render without a browser:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';

test('populated overview exposes one heading and real reading actions', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Belhal', loading: false,
        continueBook: { book: { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' }, progress: 68, saved: true, status: 'in-progress' },
        challenge: { current: 12, goal: 24, percentage: 50 },
        challengeError: null, libraryError: null,
        recentKnowledge: [], library: [], weeklyInsight: { readingDays: 3, currentStreak: 2 }, recommendations: [],
      }),
    ),
  );
  assert.equal((markup.match(/<h1/g) ?? []).length, 1);
  assert.match(markup, /Good morning, Belhal/);
  assert.match(markup, /Continue reading/);
  assert.match(markup, /aria-valuenow="68"/);
  assert.match(markup, /12 of 24/);
});

test('new-reader overview gives actions instead of zero-value decoration', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good afternoon', userName: 'New reader', loading: false,
        continueBook: undefined, challenge: undefined,
        challengeError: null, libraryError: null,
        recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );
  assert.match(markup, /Choose your first summary/);
  assert.match(markup, /Create a reading goal/);
  assert.doesNotMatch(markup, /role="progressbar"/);
});
```

- [ ] **Step 2: Run the view test and verify failure**

Run:

```bash
node --import tsx --test tests/dashboardOverviewView.test.ts
```

Expected: FAIL because the view does not exist.

- [ ] **Step 3: Implement the view composition**

Build these named sections in order: greeting/search lead-in, Continue reading, Reading challenge, Recent notes, Your library, Weekly insight, Recommended reading. Only the page greeting is an `h1`; card titles begin at `h2`.

The presentational prop contract is:

```ts
export interface DashboardOverviewViewProps {
  greeting: string;
  userName: string;
  loading: boolean;
  continueBook?: DashboardShelfBook;
  challenge?: { current: number; goal: number; percentage: number };
  challengeError: string | null;
  libraryError: string | null;
  recentKnowledge: DashboardKnowledgeItem[];
  library: DashboardShelfBook[];
  weeklyInsight: WeeklyReadingInsight;
  recommendations: DashboardShelfBook[];
}
```

Use `Link` destinations under `/dashboard`. The challenge ring includes visible `current of goal` text and a labelled progressbar. Notes use `<time dateTime>` and book names. Empty sections have one action each. A non-null challenge or library error renders inside only that card with `role="alert"` and the guidance “Refresh the page to try again”; it does not replace the rest of the overview.

- [ ] **Step 4: Connect existing contexts in the page container**

`DashboardOverviewPage` localizes book title/author values before passing them into the view. It must not call `updateBookProgress` when constructing or clicking a card; it only navigates to `/dashboard/summary/:slug`. Pass `ReadingChallengeContext.loading` to the challenge card independently so the rest of the overview can render, and pass the two context error strings to their corresponding cards.

- [ ] **Step 5: Implement the approved visual composition**

In `DashboardPages.css`, scope every rule under `.dashboard-page`. Use a wide two-column lead grid, a narrower right rail, 12–16px radii, forest/ivory tokens inherited from the shell, proportional book covers, and local responsive changes at 1180px, 820px, and 600px. Include `text-wrap: balance` for headings, `text-wrap: pretty` for prose, tabular numerals for progress, visible focus rules, and static skeletons under reduced motion.

- [ ] **Step 6: Run view/model tests and build**

Run:

```bash
node --import tsx --test tests/dashboardOverviewModel.test.ts tests/dashboardOverviewView.test.ts
npm run build
```

Expected: PASS and no TypeScript or CSS build errors.

- [ ] **Step 7: Commit the overview**

```bash
git add components/dashboard/DashboardBookCard.tsx components/dashboard/DashboardOverviewView.tsx pages/DashboardOverviewPage.tsx pages/DashboardPages.css tests/dashboardOverviewView.test.ts
git commit -m "feat: build personalized reading dashboard"
```

---

### Task 6: Library, Notes, and Settings Destinations

**Files:**
- Create: `pages/DashboardLibraryPage.tsx`
- Create: `pages/DashboardNotesPage.tsx`
- Create: `pages/DashboardSettingsPage.tsx`
- Modify: `pages/DashboardPages.css`
- Modify: `components/dashboard/dashboardOverviewModel.ts`
- Modify: `tests/dashboardOverviewModel.test.ts`
- Create: `tests/dashboardWorkspacePages.test.ts`

**Interfaces:**
- Consumes: `buildDashboardShelf`, `selectRecentKnowledge`, `DashboardBookCard`, `useAuth`, `useBooks`, `useFavorites`, `useUserProgress`, `usePersonalNotes`, and sidebar preference storage.
- Produces: three route-ready page components and `filterDashboardShelf(items, filter)`.

- [ ] **Step 1: Extend the failing model tests for library filtering**

```ts
test('library filters distinguish saved, active, and completed books', () => {
  const shelf = [
    { book: books[0], progress: 0, saved: true, status: 'saved' as const },
    { book: books[1], progress: 50, saved: false, status: 'in-progress' as const },
    { book: { ...books[1], id: 'c' }, progress: 100, saved: true, status: 'completed' as const },
  ];
  assert.deepEqual(filterDashboardShelf(shelf, 'saved').map(item => item.book.id), ['a', 'c']);
  assert.deepEqual(filterDashboardShelf(shelf, 'in-progress').map(item => item.book.id), ['b']);
  assert.deepEqual(filterDashboardShelf(shelf, 'completed').map(item => item.book.id), ['c']);
});
```

- [ ] **Step 2: Run the extended model test and verify failure**

Run:

```bash
node --import tsx --test tests/dashboardOverviewModel.test.ts
```

Expected: FAIL because `filterDashboardShelf` is missing.

- [ ] **Step 3: Implement filtering and the library page**

Define `DashboardLibraryFilter = 'all' | 'saved' | 'in-progress' | 'completed'`. The page exposes one labelled filter group, a result-count live region, and a responsive `DashboardBookCard` grid. The empty state changes by filter and includes either Discover books or Clear filter.

- [ ] **Step 4: Implement the notes page**

Render notes and highlights in descending `updatedAt` order, grouped visually by book without changing the underlying storage shape. Provide an All/Notes/Highlights segmented control, safe missing-book labels, excerpt truncation in CSS, and links to `/dashboard/summary/:slug`. Editing and deletion remain in the existing per-book notes panel; this first cross-book page is browse-and-return only.

- [ ] **Step 5: Implement the settings page**

Show authenticated name and email, a Reset sidebar preference button that removes `ta7leel_dashboard_sidebar_collapsed` and dispatches a `dashboard-preference-change` event, a link to the public privacy policy, and a Logout button. Logout calls the existing context method and navigates to `/`; do not add password, language, or theme controls.

- [ ] **Step 6: Add rendering/source-contract tests**

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('workspace pages provide a single page heading and purposeful empty states', async () => {
  const library = await readFile('pages/DashboardLibraryPage.tsx', 'utf8');
  const notes = await readFile('pages/DashboardNotesPage.tsx', 'utf8');
  const settings = await readFile('pages/DashboardSettingsPage.tsx', 'utf8');
  assert.match(library, /<h1/);
  assert.match(library, /aria-live="polite"/);
  assert.match(notes, /Highlights/);
  assert.match(notes, /dashboard\/summary/);
  assert.match(settings, /ta7leel_dashboard_sidebar_collapsed/);
  assert.doesNotMatch(settings, /Dark mode|Arabic|Theme/);
});
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
node --import tsx --test tests/dashboardOverviewModel.test.ts tests/dashboardWorkspacePages.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit the workspace pages**

```bash
git add pages/DashboardLibraryPage.tsx pages/DashboardNotesPage.tsx pages/DashboardSettingsPage.tsx pages/DashboardPages.css components/dashboard/dashboardOverviewModel.ts tests/dashboardOverviewModel.test.ts tests/dashboardWorkspacePages.test.ts
git commit -m "feat: add dashboard library notes and settings"
```

---

### Task 7: Dashboard Routes, Existing Tools, and Focused Reading

**Files:**
- Create: `components/readingRouteModel.ts`
- Create: `components/dashboard/FocusedReaderLayout.tsx`
- Modify: `App.tsx:1-255`
- Modify: `pages/LoginPage.tsx:1-120`
- Modify: `pages/SignUpPage.tsx:1-145`
- Modify: `pages/SummariesPage.tsx:1-190`
- Modify: `pages/SummaryDetailPage.tsx`
- Modify: `components/SummaryReadingExperience.tsx`
- Modify: `components/YouMayAlsoLike.tsx`
- Modify: `pages/ReadingChallengePage.tsx:1-120`
- Modify: `pages/CalculatorsPage.tsx:1-220`
- Modify: `components/UserMenu.tsx`
- Modify: `utils/seoConfig.ts:660-670`
- Modify: `tests/seoCatalog.test.ts`
- Create: `tests/readingRouteModel.test.ts`

**Interfaces:**
- Consumes: all route-ready components from Tasks 1–6.
- Produces: `ReadingSurface = 'public' | 'dashboard'`, `getBookSummaryHref(book, surface)`, `getBookLibraryHref(surface)`, the full nested route tree, and focused reader layout.

- [ ] **Step 1: Write failing route-helper and private-SEO tests**

```ts
// tests/readingRouteModel.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { getBookLibraryHref, getBookSummaryHref } from '../components/readingRouteModel';

const book = { id: 'atomic-habits', arabicSlug: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' };

test('reading hrefs remain on their selected surface', () => {
  assert.equal(getBookSummaryHref(book, 'public'), '/summary/atomic-habits');
  assert.equal(getBookSummaryHref(book, 'dashboard'), '/dashboard/summary/atomic-habits');
  assert.equal(getBookLibraryHref('public'), '/summaries');
  assert.equal(getBookLibraryHref('dashboard'), '/dashboard/discover');
});
```

Add to `tests/seoCatalog.test.ts`:

```ts
import { isPrivateSeoRoute } from '../utils/seoConfig';

test('all dashboard paths are private without hiding similarly named public paths', () => {
  assert.equal(isPrivateSeoRoute('/dashboard'), true);
  assert.equal(isPrivateSeoRoute('/dashboard/library/'), true);
  assert.equal(isPrivateSeoRoute('/dashboard/summary/atomic-habits'), true);
  assert.equal(isPrivateSeoRoute('/dashboardish'), false);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node --import tsx --test tests/readingRouteModel.test.ts tests/seoCatalog.test.ts
```

Expected: FAIL on the missing reading model and dashboard privacy rule.

- [ ] **Step 3: Implement surface-aware reading helpers**

```ts
export type ReadingSurface = 'public' | 'dashboard';

export const getBookSummaryHref = (book: Pick<Book, 'id' | 'arabicSlug'>, surface: ReadingSurface) => {
  const slug = book.arabicSlug || book.id;
  return surface === 'dashboard' ? `/dashboard/summary/${slug}` : `/summary/${slug}`;
};

export const getBookLibraryHref = (surface: ReadingSurface) =>
  surface === 'dashboard' ? '/dashboard/discover' : '/summaries';
```

Update `isPrivateSeoRoute` to normalize trailing slashes and return true for the exact `/dashboard` path or the `/dashboard/` prefix, while preserving the existing explicit private routes.

- [ ] **Step 4: Install the three-family app frame and protected route tree**

Extract the route table into an `AppRoutes` component so `<Routes>` is declared once. In `AppFrame`, call `getAppLayoutFamily(location.pathname)` and place that route table in exactly one frame: dashboard renders the route table directly, standalone wraps it in the current authentication `<main>`, and public wraps it with the existing header, public `<main>`, mobile navigation, promotional surfaces, and footer. This avoids nesting `DashboardLayout`'s `<main>` inside the current public `<main>`.

```tsx
const AppFrame = () => {
  const location = useLocation();
  const family = getAppLayoutFamily(location.pathname);
  const routes = <Suspense fallback={<Spinner />}><AppRoutes /></Suspense>;

  const frame = family === 'dashboard' ? routes : family === 'standalone' ? (
    <main className="min-h-screen bg-[#ece9df]">{routes}</main>
  ) : (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto flex-grow px-0 py-8">{routes}</main>
      <MobileBottomNav />
      <Suspense fallback={null}><ExitIntentPopup /><CoffeeSupportCard /></Suspense>
      <Footer />
    </div>
  );

  return <><ScrollToTop />{isPrivateSeoRoute(location.pathname) && <PrivatePageSEO />}{frame}</>;
};
```

Keep `ScrollToTop` and `PrivatePageSEO` outside the selected frame so they apply to every route without adding a second landmark.

The route structure is:

```tsx
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
    <Route path="trading" element={<TradingJournalPage />} />
    <Route path="settings" element={<DashboardSettingsPage />} />
    <Route path="admin/feedback" element={<FeedbackPage />} />
  </Route>
  <Route path="/dashboard/summary/:bookId" element={<FocusedReaderLayout />}>
    <Route index element={<SummaryDetailPage surface="dashboard" />} />
  </Route>
  {Object.entries(LEGACY_DASHBOARD_REDIRECTS).map(([from, to]) => (
    <Route key={from} path={from} element={<Navigate to={to} replace />} />
  ))}
</Route>
```

Keep all public routes exactly once outside this branch. Lazy-load every new page-level component.

- [ ] **Step 5: Restore safe post-auth navigation**

In login and signup pages, read `location.state?.from`, pass it through `getSafePostAuthDestination`, and replace navigation after successful email or Google authentication:

```ts
const location = useLocation();
const destination = getSafePostAuthDestination(
  typeof location.state?.from === 'string' ? location.state.from : undefined,
);
// immediately after auth succeeds
navigate(destination, { replace: true });
```

Remove the existing 1500ms `setTimeout` redirects so successful authentication cannot leave a stale callback behind or briefly show a dashboard-bound success state on the authentication screen.

- [ ] **Step 6: Make catalog and reader links surface-aware**

Give `SummariesPage`, `ReadingChallengePage`, and `SummaryDetailPage` a defaulted `surface?: ReadingSurface` prop. Replace local `/summary/...` builders with `getBookSummaryHref`. Pass `getBookSummaryHref` or a prepared callback through `SummaryReadingExperience` and `YouMayAlsoLike` so recommended books stay inside the focused dashboard reader. Public calls omit the prop and remain unchanged. Dashboard catalog and summary instances set `noindex: true` and use the equivalent public URL as canonical; public instances retain their current SEO metadata and structured data.

`FocusedReaderLayout` renders one skip link, a compact `<header>` with Ta7leel identity and `Link to="/dashboard"`, one `<main id="focused-reader-content">`, and an `Outlet`. It must not render the sidebar or dashboard mobile bar.

- [ ] **Step 7: Alias calculator paths without changing public canonical URLs**

Add `surface?: ReadingSurface` to `CalculatorsPage`. When the surface is dashboard, normalize `/dashboard/calculators` and `/dashboard/calculators/<tab>` to the equivalent existing `CalculatorRoute` for content selection, but set `noindex: true` and keep internal tab links under `/dashboard/calculators/*`. Public calculator canonical and Arabic routes remain unchanged.

- [ ] **Step 8: Update account-menu links and feature page embedding**

Change authenticated UserMenu links to `/dashboard/library`, `/dashboard/challenge`, and `/dashboard/downloads`. Preserve the existing Send Feedback modal behavior. Add a `.dashboard-main` embedding layer in shell CSS that removes only redundant outer minimum-height/background/padding from legacy page roots; do not broadly override internal cards, headings, or modal positioning.

- [ ] **Step 9: Run route, SEO, and regression tests**

Run:

```bash
node --import tsx --test tests/appLayoutModel.test.ts tests/authRouteModel.test.ts tests/dashboardNavigation.test.ts tests/readingRouteModel.test.ts tests/seoCatalog.test.ts tests/headerNavigation.test.ts tests/mobileBottomNavTheme.test.ts
npm run build
```

Expected: all tests PASS; build/prerender keeps public routes crawlable and dashboard routes noindex.

- [ ] **Step 10: Commit the integrated dashboard routes**

```bash
git add App.tsx pages/LoginPage.tsx pages/SignUpPage.tsx pages/SummariesPage.tsx pages/SummaryDetailPage.tsx pages/ReadingChallengePage.tsx pages/CalculatorsPage.tsx components/SummaryReadingExperience.tsx components/YouMayAlsoLike.tsx components/UserMenu.tsx components/readingRouteModel.ts components/dashboard/FocusedReaderLayout.tsx components/dashboard/DashboardShell.css utils/seoConfig.ts tests/readingRouteModel.test.ts tests/seoCatalog.test.ts
git commit -m "feat: route authenticated features through dashboard"
```

---

### Task 8: End-to-End Accessibility, Responsive, and Regression Verification

**Files:**
- Modify: `components/dashboard/DashboardShell.css`
- Modify: `pages/DashboardPages.css`
- Modify: dashboard components only where verification finds an in-scope defect.
- Create: `tests/dashboardRouteContract.test.ts`
- Modify: `design-qa.md` — append the verified dashboard matrix and any accepted deviations from the concept image.

**Interfaces:**
- Consumes: the completed dashboard and all existing test suites.
- Produces: a checked route contract, browser-verified responsive behavior, and a concise design QA record.

- [ ] **Step 1: Add a static route contract test before browser QA**

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('App exposes every approved dashboard destination behind one protected branch', async () => {
  const source = await readFile('App.tsx', 'utf8');
  for (const path of ['discover', 'library', 'notes', 'challenge', 'downloads', 'calculators/*', 'finance', 'trading', 'settings', 'admin/feedback']) {
    assert.match(source, new RegExp(`path=["']${path.replace('*', '\\*')}["']`));
  }
  assert.match(source, /path=["']\/dashboard\/summary\/:bookId["']/);
  assert.match(source, /<Route element={<ProtectedRoute \/>}>/);
});
```

- [ ] **Step 2: Run the complete fast test suite**

Run:

```bash
node --import tsx --test tests/*.test.ts tests/*.test.tsx
```

Expected: all Node/TSX tests PASS. If the shell causes an unrelated existing failure, record the pre-existing failure and do not mask it.

- [ ] **Step 3: Run the production verification path**

Run:

```bash
npm run build
```

Expected: sitemap generation, Vite build, SEO prerender, and SEO tests all succeed.

- [ ] **Step 4: Start the preview server for browser QA**

Run:

```bash
npm run preview -- --host 127.0.0.1
```

Keep the returned session ID for the QA steps and stop the server after verification.

- [ ] **Step 5: Verify authentication and routing behavior**

With an authenticated test account, verify direct load and refresh for `/dashboard`, each child route, and `/dashboard/summary/atomic-habits`. Verify legacy routes replace to their dashboard equivalents. In a signed-out session, verify the same dashboard URLs wait for auth resolution and then redirect to `/login`; after login, verify the original safe dashboard URL is restored. Confirm `/summaries` and `/summary/atomic-habits` still use public chrome.

- [ ] **Step 6: Verify responsive layout at fixed viewports**

Check at 1440×900, 1024×768, 768×1024, 390×844, and 360×800:

- desktop expanded and collapsed sidebar widths;
- persistence after refresh;
- tablet drawer instead of desktop sidebar;
- mobile Overview/Discover/Library/Notes/More bar;
- More drawer focus trap, Escape close, backdrop behavior, and focus restoration;
- no document-level horizontal overflow;
- no final controls hidden behind fixed navigation;
- Finance Tracker and Trading Journal remain usable in the available width.

- [ ] **Step 7: Verify accessibility and direction resilience**

Complete a keyboard-only pass through skip link, sidebar, search combobox, cards, filters, More drawer, account controls, focused reader return link, and feedback modal. In browser devtools, set `document.documentElement.dir = 'rtl'` and verify sidebar/drawer anchoring, logical spacing, and content order; then restore `ltr`. Emulate `prefers-reduced-motion: reduce` and confirm transitions/skeletons become static. Inspect forest/ivory/white focus and text contrast.

- [ ] **Step 8: Verify real, empty, loading, and partial-failure states**

Use one established account and one new account. Confirm real progress, favorites, notes, challenge, and weekly reading history populate the correct cards. Confirm a new reader receives Start reading, Create a goal, and first-note guidance. Throttle the network and simulate a denied challenge/favorites request; the shell and unaffected cards must remain usable.

- [ ] **Step 9: Record the QA outcome**

Append a dated `Authenticated dashboard — 2026-09-09` section to `design-qa.md` containing the tested viewports, routes, keyboard/RTL/reduced-motion results, and exact accepted visual differences from the generated concept. Do not claim a check passed unless it was run.

- [ ] **Step 10: Re-run affected tests after QA fixes**

Run:

```bash
node --import tsx --test tests/*.test.ts tests/*.test.tsx
npm run build
```

Expected: PASS after any final CSS or accessibility corrections.

- [ ] **Step 11: Commit verification fixes and QA record**

```bash
git add components/dashboard pages/DashboardPages.css tests/dashboardRouteContract.test.ts design-qa.md
git commit -m "test: verify authenticated dashboard experience"
```

---

## Final Acceptance Checklist

- [ ] `/dashboard` shows a real personalized reading overview or purposeful onboarding state.
- [ ] All approved reader and tool destinations are reachable in desktop and mobile navigation.
- [ ] The administrator feedback queue is protected and absent from reader navigation.
- [ ] Public routes retain public chrome and SEO behavior.
- [ ] Dashboard and focused-reader routes are private/noindex.
- [ ] Authenticated refresh does not flash or bounce through login.
- [ ] Dashboard book links stay in the dashboard reader; public book links stay public.
- [ ] Sidebar collapse and mobile More behavior are keyboard accessible and persistent.
- [ ] English UI, simulated RTL, reduced motion, mobile, tablet, and desktop checks pass.
- [ ] Existing Firebase/local-storage data works without migration.
- [ ] Full Node/TSX tests and `npm run build` pass.
