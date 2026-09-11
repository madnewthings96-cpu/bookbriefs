# Authenticated Reading Dashboard Design

**Status:** Approved direction, implementation pending

**Date:** 2026-09-09

**Surfaces:** `/dashboard/*` and legacy authenticated routes

## Context

Ta7leel currently presents authenticated features as separate pages inside the public website frame. Profile, reading progress, favorites, notes, reading challenge, downloads, finance tracking, and the trading journal work, but they do not feel like one personal product. Readers repeatedly encounter the public header, footer, promotional surfaces, and public mobile navigation after signing in.

The new authenticated experience will be a personal reading and learning workspace. It takes the persistent navigation clarity of products such as Canva and combines it with Ta7leel's warm forest-and-paper editorial identity. Reading remains the product's center of gravity; finance and trading remain available as secondary tools.

## Goals

- Give every authenticated feature one consistent desktop, tablet, and mobile shell.
- Make the signed-in home page immediately useful through real reading, library, challenge, and notes data.
- Establish a clear information architecture that can grow without overloading the public navigation.
- Preserve the public website, indexable book catalog, and summary detail routes for visitors and SEO.
- Reuse the existing contexts and page behavior without requiring a data migration.
- Support empty, loading, partial-error, offline-tolerant, English, RTL-ready, keyboard, and reduced-motion states.

## Non-goals

- Rebuilding the public homepage, header, footer, blog, news, or SEO structure.
- Replacing Firebase authentication or moving all locally stored reading data to Firestore.
- Adding social feeds, teams, billing, notifications, or administrative analytics.
- Inventing engagement metrics that the application does not currently collect.
- Redesigning every tool's internal content during the shell rollout.

## Product Principles

1. **Reading first.** Continue reading, saved books, notes, and the current challenge receive the strongest visual hierarchy.
2. **Action before analytics.** The overview answers “What should I read or revisit next?” before showing progress numbers.
3. **Real data or an honest empty state.** Cards never display fabricated activity, goals, or percentages.
4. **Public site and personal workspace are distinct.** Signing in unlocks the workspace; it does not force dashboard chrome onto public URLs.
5. **Tools remain secondary.** Downloads, calculators, finance tracking, and trading sit in a clearly separated Tools group.

## Route Architecture

React Router will use one protected nested route branch. `DashboardLayout` renders the persistent application chrome and an `Outlet` for dashboard pages. `ProtectedRoute` guards the branch and waits for Firebase's initial authentication resolution before deciding whether to render or redirect.

```text
/dashboard
├── /discover
├── /library
├── /notes
├── /challenge
├── /downloads
├── /calculators
├── /finance
├── /trading
├── /settings
├── /admin/feedback
└── /summary/:bookId
```

The route roles are:

| Route | Purpose |
| --- | --- |
| `/dashboard` | Personalized overview and next actions |
| `/dashboard/discover` | Search and browse the summary catalog inside the workspace |
| `/dashboard/library` | Saved, in-progress, and completed books |
| `/dashboard/notes` | All personal notes and highlights, grouped by book |
| `/dashboard/challenge` | Existing reading challenge experience |
| `/dashboard/downloads` | Existing templates and downloadable resources |
| `/dashboard/calculators` | Existing calculators inside the dashboard shell |
| `/dashboard/finance` | Existing finance tracker |
| `/dashboard/trading` | Existing trading journal |
| `/dashboard/settings` | Account identity, workspace preferences, and logout |
| `/dashboard/admin/feedback` | Existing administrator-only feedback review queue; hidden from reader navigation |
| `/dashboard/summary/:bookId` | Focused signed-in reading experience |

Public `/summaries`, `/summary/:bookId`, and `/calculators/*` remain unchanged and indexable. Dashboard discovery and reading reuse the same data and presentational components under dashboard URLs.

Legacy authenticated routes redirect with `replace`:

- `/profile` → `/dashboard/settings`
- `/reading-challenge` → `/dashboard/challenge`
- `/downloads` → `/dashboard/downloads`
- `/feedback` → `/dashboard/admin/feedback`
- `/finance-tracker` → `/dashboard/finance`
- `/trading-journal` → `/dashboard/trading`

The redirects preserve bookmarks without maintaining two authenticated layouts.

## Application Frame

`AppFrame` will classify the current path into three layout families:

1. **Public:** current header, main container, mobile navigation, exit-intent prompt, support card, and footer.
2. **Dashboard:** protected dashboard shell only; no public header, footer, promotional overlays, or public mobile navigation.
3. **Standalone authentication:** login and signup without either surrounding frame.

Route classification is centralized in the layout model rather than repeated across components. Authentication alone does not change a public page's frame; a signed-in user may still intentionally visit public pages.

## Dashboard Shell Components

### `DashboardLayout`

- Owns the sidebar, top utility bar, responsive drawer state, main content landmark, and mobile bottom navigation.
- Constrains dashboard content to a readable maximum width while allowing data-heavy tools to request a wider content mode.
- Reserves mobile bottom space so fixed navigation never covers page controls.
- Restores focus to the drawer trigger after the mobile drawer closes.

### `DashboardSidebar`

- Expanded desktop width: approximately 240px.
- Collapsed desktop width: approximately 72px, showing icons with accessible tooltips.
- Collapse preference persists locally and never blocks the initial render.
- Primary group: Overview, Discover, My Library, Notes, Reading Challenge.
- Tools group: Downloads, Calculators, Finance Tracker, Trading Journal.
- Utility group: a Send feedback action and Settings. Send feedback opens the existing submission modal rather than navigating to the administrator queue.
- User identity and logout sit at the bottom.
- Active state uses a filled forest surface and is communicated by more than color.

### `DashboardTopbar`

- Contains the page title or compact brand context, global book search, and account menu.
- Avoids duplicating sidebar navigation.
- Search uses `BooksContext` and the current localization helpers; it requires no new search service.
- Keyboard behavior supports arrow-key result navigation, Escape to close, and Enter to open a result.

### `DashboardMobileNav`

- Primary destinations: Overview, Discover, Library, and Notes.
- A fifth More control opens a labelled drawer containing Challenge, Tools, Send feedback, and Settings.
- The public bottom navigation is never rendered on dashboard routes.
- The drawer edge and navigation order mirror appropriately in RTL.

### Focused reader

`/dashboard/summary/:bookId` keeps the dashboard context but removes the sidebar, dashboard top bar, and nonessential overview chrome at every breakpoint. A compact reading header provides a return-to-dashboard control and preserves the current summary reading tools. This gives the reading surface the full viewport without losing the reader's workspace context.

## Dashboard Overview

The overview is assembled from small, independent sections so each data source can load or fail without taking down the page.

### Header and search

- Time-aware greeting using the authenticated user's display name.
- Supporting prompt: “What will you learn today?”
- Prominent global search with the placeholder “Search books, ideas, or authors”.

### Continue reading

- Selects the most recently read incomplete book from `UserProgressContext`.
- Shows localized cover, title, author, actual progress, and one primary Continue action.
- If no book is active, becomes a Start reading card using an existing curated recommendation.

### Reading challenge

- Uses `ReadingChallengeContext.progress` and loading state.
- Shows current count, goal, restrained circular progress, and a link to the challenge page.
- If no challenge exists, offers one Create a goal action instead of a zeroed chart.

### Recent notes

- Combines notes and highlights from `PersonalNotesContext`, sorted by `updatedAt` descending.
- Resolves book titles through `BooksContext` and localization helpers.
- Each item links to the relevant dashboard summary.
- The empty state invites the reader to open a book and capture the first idea.

### Library shelf

- Combines favorites and reading progress into saved, in-progress, and completed statuses.
- Shows a concise first row on the overview and links to the complete library page.
- Never mutates progress merely because a card was opened; reading progress changes remain tied to the reading experience.

### Weekly insight

- Derives reading days and the current streak from the existing reading history.
- Uses plain language and a compact visual, not a speculative chart.
- If there is no activity, it explains how the insight will become useful after the first reading session.

### Recommendations

- Reuses the current curated book list and catalog fallback.
- Appears below personal content so generic recommendations do not outrank the reader's own work.

## Library, Notes, and Settings Pages

The existing profile page currently combines dashboard, shelf, and recommendation responsibilities. It will be separated rather than embedded unchanged:

- `DashboardOverviewPage` receives the greeting, next-book, challenge, note, and insight composition.
- `DashboardLibraryPage` owns saved, in-progress, completed, and recommended shelves with filtering.
- `DashboardNotesPage` owns cross-book notes and highlights, with empty states and book grouping.
- `DashboardSettingsPage` owns account identity, dashboard navigation preferences, and logout. It does not invent a theme or language switcher that the current application does not support.

Shared book-card and dashboard-card components will be extracted only where two or more pages use the same behavior. The implementation will not create a generic card abstraction before a real reuse case exists.

## Existing Data Sources

No storage migration is required for this feature:

- Authentication identity: Firebase Auth through `AuthContext`.
- Catalog and localized book metadata: `BooksContext` and `LanguageContext`.
- Favorites: Firestore with the existing legacy-local migration in `FavoritesContext`.
- Reading progress, reading history, time, and streak: user-scoped local storage through `UserProgressContext`.
- Personal notes and highlights: user-scoped local storage through `PersonalNotesContext`.
- Reading challenge: Firestore through `ReadingChallengeContext`.

The overview consumes these public context APIs. It does not read storage or Firestore directly. Data model changes discovered while implementing an individual feature require a separate decision rather than being hidden in the layout work.

## Authentication Readiness

`AuthContext` will expose an authentication-readiness/loading state based on the first `onAuthStateChanged` callback. Protected dashboard routes show a branded, non-jarring loading surface while auth is unresolved. They redirect to `/login` only after Firebase confirms there is no user. This prevents authenticated readers from flashing or bouncing through the login page on refresh.

After login, the intended destination is restored when safe; otherwise the user lands on `/dashboard`. Logout returns to the public homepage.

## Visual System

The approved mockup establishes the direction, while implementation uses reusable tokens rather than copying pixels from the raster concept.

### Color

- Deep forest: navigation, primary actions, strong active states.
- Moss and sage: progress, success, selected secondary states.
- Warm ivory: application background.
- Parchment and white: cards and nested surfaces.
- Muted gold: milestones and small emphasis.
- Muted terracotta: warnings or destructive states only.

Existing Ta7leel palette values should be reused where they already satisfy contrast. New dashboard tokens live under one dashboard scope so public styling is not unintentionally changed.

### Type and shape

- Editorial serif for the greeting and major section headings.
- Existing readable sans serif for navigation, controls, metadata, and body text.
- Card radii remain between 12px and 16px.
- Fine warm-gray borders and restrained shadows provide hierarchy.
- Book covers retain their natural proportions and use object-fit behavior that avoids cropping titles.

### Density

The overview favors a calm, asymmetric grid with generous whitespace. Finance-style KPI grids, dense charts, neon gradients, heavy glass effects, and generic admin-template patterns are explicitly excluded.

## Responsive Behavior

- **Large desktop:** persistent expanded or collapsed sidebar; overview uses a flexible multi-column grid.
- **Small desktop/tablet landscape:** collapsible icon rail; wide tools can use the remaining viewport.
- **Tablet portrait:** sidebar becomes an off-canvas drawer; cards reorganize into one or two columns.
- **Mobile:** dashboard bottom navigation plus More drawer; all primary content becomes a single readable column.
- Content uses container-driven or layout-local breakpoints where practical, avoiding page-specific viewport assumptions.
- Interactive targets are at least 44×44px, and no page introduces document-level horizontal scrolling.

## RTL Readiness and Localization

- The dashboard remains English-only because the current `LanguageContext` intentionally supports only `en`; restoring Arabic translations is a separate project.
- Navigation labels and dashboard copy use the existing language system rather than scattering hard-coded English through UI components.
- Layout uses CSS logical properties for inline spacing and positioning.
- When the document direction is set to RTL during compatibility testing, the sidebar and drawer anchor to the right, content alignment mirrors, and directional arrows adapt.
- Book covers, universal icons, numbers, and progress direction are evaluated individually rather than blindly mirrored.
- Long translated labels truncate only when an accessible full label remains available.

## Motion and Interaction

- Sidebar width, drawer entrance, and card elevation use short, interruptible transitions.
- Hover elevation is subtle and never the only indication of clickability.
- Pressed controls use restrained scale feedback.
- Skeletons do not shimmer under reduced-motion preferences.
- No `transition: all`, permanent `will-change`, or decorative animation loops are introduced.

## Loading, Empty, and Error States

- The shell renders independently from page data, so navigation remains available during card-level loading.
- Overview sections use shape-matched skeletons instead of a full-page spinner.
- A failed challenge or favorites request shows a local error with retry guidance while other sections remain usable.
- Local data parse failures fall back to an empty state and log a diagnostic without breaking the dashboard.
- Missing book records use a neutral cover placeholder and safe metadata fallback.
- Empty states always provide one useful next action and never blame the reader.

## Accessibility

- The shell provides one skip link, one main landmark, and labelled primary and utility navigation regions.
- Every page has one `h1` with correctly nested section headings.
- Sidebar collapse, drawers, account menus, and search results are fully keyboard operable.
- Mobile drawers trap focus, close with Escape, restore focus, and prevent background interaction.
- Active routes use `aria-current="page"`; collapsed items retain accessible names and tooltips.
- Status and progress are described in text and are not conveyed by color alone.
- Focus rings remain visible on forest, ivory, and white surfaces.
- Motion respects `prefers-reduced-motion`, and colors meet WCAG AA contrast targets.

## Testing Strategy

### Pure model tests

- Route classification for public, dashboard, standalone, focused-reader, and trailing-slash paths.
- Sidebar group definitions, active-route matching, and legacy redirect mapping.
- Continue-reading selection by recency and incomplete status.
- Combined library status, recent-note sorting, and weekly insight derivation.
- New-reader empty-state selection and safe fallbacks for missing books.

### Component and contract tests

- Protected branch waits for auth readiness, renders for authenticated users, and redirects confirmed guests.
- Public chrome is absent from dashboard routes and unchanged on public routes.
- Desktop collapse state, mobile More drawer, current-route semantics, and logout behavior.
- English labels, simulated RTL anchoring, visible focus, reduced motion, and minimum touch targets.
- Overview loading, partial-error, empty, and populated structures.

### Integration verification

- Production build and existing SEO tests.
- Direct navigation and refresh for every dashboard and legacy route.
- Browser QA at phone, tablet, laptop, and wide-desktop sizes.
- Keyboard-only pass through skip link, sidebar, search, cards, drawers, and account controls.
- Confirm public summaries remain indexable and dashboard pages remain private/noindex.

## Implementation Boundaries

The work should proceed in vertical slices:

1. Route model, auth readiness, protected nested branch, and empty dashboard shell.
2. Desktop sidebar, top bar, mobile navigation, RTL, and accessibility behavior.
3. Overview model and data-backed cards.
4. Library, notes, and settings page separation.
5. Existing challenge, downloads, calculators, finance, trading, and feedback pages inside the shell.
6. Focused dashboard reader, legacy redirects, final responsive polish, and regression QA.

Each slice must leave the application buildable. Existing protected pages should not lose access while their dashboard equivalent is being introduced.

## Rollout and Success Criteria

The dashboard replaces the authenticated frame in one release after all legacy redirects and responsive checks pass. No feature flag or database migration is required because the public routes remain intact and the data providers are unchanged.

The implementation is complete when:

- A confirmed authenticated user lands in a coherent `/dashboard` workspace.
- Every approved dashboard destination is reachable through the correct responsive navigation.
- Refreshing a protected route does not incorrectly redirect an authenticated user during auth initialization.
- Overview cards show real values or purposeful empty states.
- Public browsing and SEO routes retain their current frame and behavior.
- English, simulated RTL, mobile, keyboard, and reduced-motion verification pass.
- Existing tests and the production build pass without unrelated regressions.
