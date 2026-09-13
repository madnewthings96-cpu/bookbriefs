# Editorial News Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the MQL5 calendar page with an English-first, Firebase-backed weekly news publication workflow, individual article pages, and a responsive AdSense rail.

**Architecture:** A focused news domain module owns normalization, validation, querying, and mutations. Pure presentational components render the public index and reader, while authenticated admin pages call the same repository for draft and publishing operations. Firestore, Storage rules, SEO generation, and advertising configuration enforce the public/private boundary outside the UI.

**Tech Stack:** React 18, TypeScript 5.8, React Router 6, Firebase Auth/Firestore/Storage 12, Vite 6, Netlify static hosting, Node test runner with `tsx`, Firebase Emulator Suite, CSS.

**Spec:** `docs/superpowers/specs/2026-09-13-editorial-news-publishing-design.md`

## Global Constraints

- First-release article language is English and every record stores `language: "en"`.
- Categories are exactly `markets`, `forex`, `economy`, and `crypto`.
- Public users may read only published article documents and their images; only the existing administrator may read drafts or write news data.
- Article slugs become immutable after first publication and are transactionally reserved in `newsArticleSlugs/{slug}`.
- Featured state is stored only in `newsConfig/editorial.featuredArticleId`.
- Public pagination uses ten records per page and a **Load more** button.
- The article body accepts the existing safe Markdown subset and never raw executable HTML.
- AdSense identifiers come from environment configuration; editorial content remains usable when ads or consent tooling fail.
- No scheduling, multiple authors, editorial approvals, AI generation, in-article ads, or automatic post-publish deployment.
- Existing header, footer, application routes, and unrelated Firebase data shapes remain unchanged.

## File Map

### News domain

- Create `components/news/newsModel.ts`: public types, validation, slug/date helpers, featured and related selection.
- Create `components/news/newsRepository.ts`: Firestore read/write operations, cursors, slug reservations, and featured configuration.
- Create `components/news/newsImages.ts`: Storage upload, replacement, and deletion.
- Create `components/news/newsFixtures.ts`: development-only sample draft.
- Create `components/news/NewsEditorialStream.tsx`: pure public index presentation.
- Create `components/news/NewsArticleReader.tsx`: pure published-article presentation.
- Create `components/news/AdSlot.tsx`: configured AdSense unit with stable fallback dimensions.
- Create `components/news/useNewsIndex.ts`: public index loading/filter/pagination state.
- Create `components/news/useNewsArticle.ts`: slug loading and not-found/error state.
- Create `components/news/NewsArticleEditor.tsx`: controlled draft/publish form and preview.
- Create `components/news/AdminNewsInventory.tsx`: pure admin inventory presentation.

### Pages, routing, and styles

- Replace `pages/NewsPage.tsx`: public index page composition.
- Replace `pages/NewsPage.css`: Editorial Stream visual system.
- Create `pages/NewsArticlePage.tsx`: `/news/:slug` route composition and SEO.
- Create `pages/AdminNewsPage.tsx`: `/admin/news` inventory container.
- Create `pages/AdminNewsEditorPage.tsx`: `/admin/news/new` and edit container.
- Create `pages/AdminNewsPage.css`: admin inventory/editor styles.
- Modify `App.tsx`: lazy imports and public/admin routes.
- Modify `components/UserMenu.tsx`: show the publishing-workspace link only to the administrator.
- Create `components/AdminRoute.tsx`: authenticated container plus pure admin-access gate.
- Create `utils/adminAuth.ts`: one client-side administrator identity check.

### Firebase and platform

- Modify `firebase.ts`: initialize and export Firebase Storage.
- Modify `firestore.rules`: published-only reads, validated admin writes, slug/config constraints.
- Modify `firestore.indexes.json`: public and admin news query indexes.
- Create `storage.rules`: published-image reads and admin-only validated writes.
- Modify `firebase.json`: register Storage rules and emulator.
- Modify `package.json`: include news tests and Storage emulator in verification commands.

### SEO, privacy, and tests

- Create `scripts/newsCatalog.ts`: read and normalize published Firestore news during builds.
- Create `scripts/newsSeo.ts`: pure news sitemap and prerender page builders.
- Modify `scripts/generate-seo-sitemaps.ts`: append English news article URLs.
- Modify `scripts/prerender-seo.ts`: generate the news index and article fallbacks with `NewsArticle` JSON-LD.
- Modify `pages/PrivacyPolicyPage.tsx`: disclose Firebase Storage, AdSense, consent, and cookies.
- Modify `components/StructuredData.tsx`: add a `NewsArticle` schema variant.
- Create `tests/newsModel.test.ts`: domain behavior.
- Replace `tests/newsMarketDesk.test.tsx` with `tests/newsEditorialStream.test.tsx`: public index structure.
- Create `tests/newsArticlePage.test.tsx`: reader and SEO structure.
- Create `tests/newsAdmin.test.tsx`: admin guard, inventory, and editor structure.
- Extend `tests/firestore.rules.test.mjs`: news Firestore authorization and validation.
- Create `tests/storage.rules.test.mjs`: news-image Storage authorization and constraints.
- Modify SEO tests only where their expected route counts or news output must change.
- Delete `pages/newsCalendarWidget.ts` and `tests/newsCalendarWidget.test.ts` after replacement tests pass.

---

### Task 1: News Domain Model

**Files:**
- Create: `components/news/newsModel.ts`
- Create: `components/news/newsFixtures.ts`
- Create: `tests/newsModel.test.ts`

**Interfaces:**
- Produces: `NewsCategory`, `NewsStatus`, `NewsSource`, `NewsArticle`, `NewsArticleDraft`, `NewsValidationErrors`, `NEWS_CATEGORIES`, `NEWS_PAGE_SIZE`, `createEmptyNewsDraft()`, `slugifyNewsTitle(title)`, `validateNewsDraft(draft, mode)`, `selectFeaturedArticle(articles, featuredArticleId)`, `selectRelatedArticles(current, candidates, limit)`, `formatNewsDate(date)`, `makeNewsArticleFixture(overrides)`.
- Consumes: no feature-local interfaces.

- [ ] **Step 1: Write failing model tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  selectFeaturedArticle,
  selectRelatedArticles,
  slugifyNewsTitle,
  validateNewsDraft,
} from '../components/news/newsModel';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';

test('slugifyNewsTitle produces a stable ASCII route segment', () => {
  assert.equal(slugifyNewsTitle('Dollar Outlook: What Changes Next?'), 'dollar-outlook-what-changes-next');
});

test('publish validation requires complete editorial and image fields', () => {
  const errors = validateNewsDraft({
    id: 'draft-1', title: 'Weekly outlook', slug: 'weekly-outlook', excerpt: '', body: '',
    category: 'markets', language: 'en', authorName: '', imageUrl: '', imagePath: '', imageAlt: '',
    sources: [], status: 'draft', createdAt: null, updatedAt: null, publishedAt: null,
  }, 'publish');
  assert.deepEqual(Object.keys(errors).sort(), ['authorName', 'body', 'excerpt', 'imageAlt', 'imageUrl']);
});

test('featured selection falls back to the newest published article', () => {
  const articles = [
    makeNewsArticleFixture({ id: 'new', publishedAt: new Date('2026-09-13') }),
    makeNewsArticleFixture({ id: 'old', publishedAt: new Date('2026-09-06') }),
  ];
  assert.equal(selectFeaturedArticle(articles, 'missing')?.id, 'new');
});

test('related stories prefer the current category and exclude the current article', () => {
  const current = makeNewsArticleFixture({ id: 'current', publishedAt: new Date('2026-09-13'), category: 'forex' });
  const related = selectRelatedArticles(current, [
    current,
    makeNewsArticleFixture({ id: 'fx', publishedAt: new Date('2026-09-12'), category: 'forex' }),
    makeNewsArticleFixture({ id: 'macro', publishedAt: new Date('2026-09-11'), category: 'economy' }),
  ], 3);
  assert.deepEqual(related.map((item) => item.id), ['fx', 'macro']);
});
```

- [ ] **Step 2: Run the model tests and verify the missing module failure**

Run: `node --import tsx --test tests/newsModel.test.ts`

Expected: FAIL with `Cannot find module '../components/news/newsModel'`.

- [ ] **Step 3: Implement the domain types and pure helpers**

```ts
export const NEWS_CATEGORIES = ['markets', 'forex', 'economy', 'crypto'] as const;
export const NEWS_PAGE_SIZE = 10;
export type NewsCategory = typeof NEWS_CATEGORIES[number];
export type NewsStatus = 'draft' | 'published';
export type NewsSource = { label: string; url: string };

export interface NewsArticleDraft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: NewsCategory;
  language: 'en';
  authorName: string;
  imageUrl: string;
  imagePath: string;
  imageAlt: string;
  sources: NewsSource[];
  status: NewsStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}

export type NewsArticle = Omit<NewsArticleDraft, 'status' | 'createdAt' | 'updatedAt' | 'publishedAt'> & {
  status: 'published'; createdAt: Date; updatedAt: Date; publishedAt: Date;
};
export type NewsValidationErrors = Partial<Record<'title' | 'slug' | 'excerpt' | 'body' | 'category' | 'authorName' | 'imageUrl' | 'imageAlt' | 'sources', string>>;

export function slugifyNewsTitle(title: string): string {
  return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 100);
}
```

Implement the documented length limits, `https://` source validation, publish-only required fields, original-date ordering, category-first related ordering, and the immutable development sample returned by `getSampleNewsDraft()`.

- [ ] **Step 4: Run the model tests**

Run: `node --import tsx --test tests/newsModel.test.ts`

Expected: PASS for slug, validation, featured fallback, related selection, and sample-draft tests.

- [ ] **Step 5: Commit the domain model**

```bash
git add components/news/newsModel.ts components/news/newsFixtures.ts tests/newsModel.test.ts
git commit -m "feat: add news article domain model"
```

### Task 2: Firebase Repository and Image Service

**Files:**
- Create: `components/news/newsRepository.ts`
- Create: `components/news/newsImages.ts`
- Create: `utils/adminAuth.ts`
- Modify: `firebase.ts`
- Test: `tests/newsModel.test.ts`

**Interfaces:**
- Consumes: all types and constants from `newsModel.ts`; existing `auth`, `db`, and new `storage` exports from `firebase.ts`.
- Produces: `NewsCursor`, `NewsPageResult`, `NewsRepositoryError`, `normalizeNewsDocument(id, data)`, `createNewsCursor(article)`, `listPublishedNews({ category, cursor })`, `getPublishedNewsArticleBySlug(slug)`, `getFeaturedNewsArticleId()`, `listAdminNews(status?)`, `getAdminNewsArticle(id)`, `saveNewsDraft(draft)`, `publishNewsArticle(draft, makeFeatured)`, `unpublishNewsArticle(id)`, `setFeaturedNewsArticle(id | null)`, `deleteNewsArticle(article)`, `uploadNewsImage(articleId, file, onProgress)`, `deleteNewsImage(path)`, `isAdminIdentity(user)`.

- [ ] **Step 1: Add failing converter and cursor tests**

```ts
test('normalizeNewsDocument rejects malformed categories and timestamps', () => {
  assert.equal(normalizeNewsDocument('bad', { category: 'sports' }), null);
});

test('cursor serialization preserves publication time and id', () => {
  const cursor = createNewsCursor(makeNewsArticleFixture({ id: 'story-1', publishedAt: new Date('2026-09-13T10:00:00.000Z') }));
  assert.deepEqual(cursor, { id: 'story-1', publishedAt: new Date('2026-09-13T10:00:00.000Z') });
});
```

- [ ] **Step 2: Run the focused test and verify missing repository exports**

Run: `node --import tsx --test tests/newsModel.test.ts`

Expected: FAIL because `normalizeNewsDocument` and `createNewsCursor` do not exist.

- [ ] **Step 3: Initialize Storage and implement repository reads**

```ts
// firebase.ts
import { getStorage } from 'firebase/storage';
const storage = getStorage(app);
export { auth, db, storage, googleProvider, analytics };

// newsRepository.ts
export interface NewsCursor { id: string; publishedAt: Date }
export interface NewsPageResult { articles: NewsArticle[]; nextCursor: NewsCursor | null }

export async function getPublishedNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const mapping = await getDoc(doc(db, 'newsArticleSlugs', slug));
  if (!mapping.exists()) return null;
  const snapshot = await getDoc(doc(db, 'newsArticles', mapping.data().articleId));
  const article = snapshot.exists() ? normalizeNewsDocument(snapshot.id, snapshot.data()) : null;
  return article?.status === 'published' ? article : null;
}
```

Implement public queries with `where('status', '==', 'published')`, optional category, `orderBy('publishedAt', 'desc')`, `orderBy(documentId(), 'desc')`, `limit(10)`, and cursor-based `startAfter`.

- [ ] **Step 4: Implement admin mutations and image operations**

Use `runTransaction` to reserve `newsArticleSlugs/{slug}` on first publication, reject a mapping owned by another article, preserve the first `publishedAt`, and update `newsConfig/editorial` when `makeFeatured` is true. Unpublishing a featured article clears the config but preserves its publication timestamp and slug reservation. Deleting an article clears a matching featured reference but retains the slug reservation as a tombstone, preventing a deleted public URL from being reassigned. Map Firebase failures to `NewsRepositoryError` codes `permission`, `offline`, `validation`, `conflict`, and `unknown`. Use `uploadBytesResumable` with `contentType`, then `getDownloadURL`; replacement and document update happen before old-image deletion.

```ts
export const ADMIN_UID = 'ME2iHxeBWgcSTpc1HKwKbSCrQ7t2';
export const ADMIN_EMAIL = 'belhalyt01@proton.me';
export const isAdminIdentity = (user: { id?: string; uid?: string; email?: string | null } | null) =>
  !!user && (user.id === ADMIN_UID || user.uid === ADMIN_UID || user.email === ADMIN_EMAIL);
```

- [ ] **Step 5: Run model tests and TypeScript build**

Run: `node --import tsx --test tests/newsModel.test.ts`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS with repository and Storage SDK types resolved.

- [ ] **Step 6: Commit the data services**

```bash
git add firebase.ts utils/adminAuth.ts components/news/newsRepository.ts components/news/newsImages.ts tests/newsModel.test.ts
git commit -m "feat: add Firebase news repository"
```

### Task 3: Firestore and Storage Security

**Files:**
- Modify: `firestore.rules`
- Modify: `firestore.indexes.json`
- Create: `storage.rules`
- Modify: `firebase.json`
- Modify: `tests/firestore.rules.test.mjs`
- Create: `tests/storage.rules.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: exact `NewsArticle` field names and admin identity from Tasks 1–2.
- Produces: deployable Firebase authorization rules and indexes for all repository operations.

- [ ] **Step 1: Add failing Firestore news authorization tests**

```js
const newsPayload = (overrides = {}) => ({
  title: 'Weekly outlook', slug: 'weekly-outlook', excerpt: 'The week ahead.', body: '## Outlook\nRates remain in focus.',
  category: 'markets', language: 'en', authorName: 'Ta7leel Editorial', imageUrl: 'https://example.com/lead.webp',
  imagePath: 'news/story/lead.webp', imageAlt: 'Market chart on a desk', sources: [], status: 'published',
  createdAt: timestamp(), updatedAt: timestamp(), publishedAt: timestamp(), ...overrides,
});

it('allows public reads only for published news', async () => {
  await seedDocument('newsArticles/published', newsPayload({ status: 'published' }));
  await seedDocument('newsArticles/draft', newsPayload({ status: 'draft', publishedAt: null }));
  const publicDb = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(publicDb.doc('newsArticles/published').get());
  await assertFails(publicDb.doc('newsArticles/draft').get());
});

it('allows only the admin to write valid news records and slug mappings', async () => {
  await assertFails(authContext().firestore().doc('newsArticles/story').set(newsPayload()));
  await assertSucceeds(adminContext().firestore().doc('newsArticles/story').set(newsPayload()));
  await assertSucceeds(adminContext().firestore().doc('newsArticleSlugs/weekly-outlook').set({ articleId: 'story' }));
  await assertFails(adminContext().firestore().doc('newsArticles/invalid').set({ ...newsPayload(), category: 'sports' }));
});
```

- [ ] **Step 2: Add failing Storage authorization and size/type tests**

```js
it('rejects non-admin uploads and oversized or unsupported admin uploads', async () => {
  const readerRef = authContext().storage().ref('news/story/lead.jpg');
  await assertFails(readerRef.putString('image', 'raw', { contentType: 'image/jpeg' }));
  const adminRef = adminContext().storage().ref('news/story/lead.svg');
  await assertFails(adminRef.putString('<svg/>', 'raw', { contentType: 'image/svg+xml' }));
});
```

- [ ] **Step 3: Run emulator tests and verify rule failures**

Run: `firebase emulators:exec --project demo-bookbriefs-rules --only firestore,storage "node --test tests/firestore.rules.test.mjs tests/storage.rules.test.mjs"`

Expected: FAIL because news and Storage rules/config are absent.

- [ ] **Step 4: Implement Firestore validation and indexes**

First remove the current blanket `match /{document=**} { allow read, write: if isAdmin(); }`: Firestore allow statements are additive, so that rule would bypass news validation. Preserve existing administrator capabilities by adding `isAdmin()` explicitly to the current user/subcollection, community, book, feedback, progress, favorite, note, and highlight matches, then rerun their existing rule tests. Add `isValidNewsArticle(data)`, published-only public `get/list`, validated admin writes, public slug/config reads that verify the referenced article is published, and admin-only slug/config writes. Add composite indexes for:

```json
{
  "collectionGroup": "newsArticles",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" },
    { "fieldPath": "__name__", "order": "DESCENDING" }
  ]
}
```

Also add the corresponding no-category public index and status/update-date admin index.

- [ ] **Step 5: Implement Storage rules and emulator config**

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null &&
        (request.auth.uid == 'ME2iHxeBWgcSTpc1HKwKbSCrQ7t2' || request.auth.token.email == 'belhalyt01@proton.me');
    }
    match /news/{articleId}/{fileName} {
      allow read: if isAdmin() || firestore.get(/databases/(default)/documents/newsArticles/$(articleId)).data.status == 'published';
      allow create, update: if isAdmin() && request.resource.size <= 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/(jpeg|png|webp)');
      allow delete: if isAdmin();
    }
  }
}
```

Register `storage.rules` and the Storage emulator on port `9199`. Change `test:rules` to start both emulators and execute both rule files.

- [ ] **Step 6: Run all rule tests**

Run: `npm run test:rules`

Expected: PASS for existing feedback/challenge tests and all news Firestore/Storage tests.

- [ ] **Step 7: Commit Firebase security**

```bash
git add firestore.rules firestore.indexes.json storage.rules firebase.json package.json tests/firestore.rules.test.mjs tests/storage.rules.test.mjs
git commit -m "feat: secure editorial news data"
```

### Task 4: Public Editorial Stream Presentation

**Files:**
- Create: `components/news/NewsEditorialStream.tsx`
- Create: `components/news/AdSlot.tsx`
- Replace: `pages/NewsPage.css`
- Create: `tests/newsEditorialStream.test.tsx`

**Interfaces:**
- Consumes: `NewsArticle`, `NewsCategory`, `NEWS_CATEGORIES`, `selectFeaturedArticle`, `formatNewsDate`.
- Produces: `NewsEditorialStream({ articles, featuredArticleId, activeCategory, hasMore, loadingMore, onCategoryChange, onLoadMore })`, `AdSlot({ placement, config? })`, `readAdSenseConfig(env)`.

- [ ] **Step 1: Write failing static-render tests for the selected layout**

```tsx
test('editorial stream renders one lead, chronological cards, filters, and desktop ad rail', () => {
  const markup = renderToStaticMarkup(<NewsEditorialStream articles={articles} featuredArticleId="lead" activeCategory="all" hasMore onCategoryChange={() => {}} onLoadMore={() => {}} />);
  assert.match(markup, /class="news-lead"/);
  assert.match(markup, /aria-label="News categories"/);
  assert.match(markup, /All/);
  assert.match(markup, /Forex/);
  assert.match(markup, /Advertisements/);
  assert.match(markup, /Load more/);
  assert.doesNotMatch(markup, /economicCalendarWidget|MQL5/);
});
```

- [ ] **Step 2: Run the presentation test and verify it fails**

Run: `node --import tsx --test tests/newsEditorialStream.test.tsx`

Expected: FAIL because `NewsEditorialStream` does not exist.

- [ ] **Step 3: Implement semantic stream and ad components**

Use actual `<Link>` elements for every story, `<time dateTime>`, a radio-like category control with `aria-pressed`, `<aside aria-label="Advertisements">`, and an explicit Load more button. Keep one ad node in natural document order after the first three non-featured cards; desktop grid placement moves that same node into the right rail, so no duplicate ad request is mounted.

```tsx
export const categoryLabels = { all: 'All', markets: 'Markets', forex: 'Forex', economy: 'Economy', crypto: 'Crypto' } as const;

type AdSenseConfig = { client: string; slot: string };
type AdSlotProps = { placement: 'news-index' | 'news-article'; config?: AdSenseConfig };
export const readAdSenseConfig = (env: Record<string, string | undefined>): AdSenseConfig =>
  env.VITE_ADSENSE_CLIENT_ID && env.VITE_ADSENSE_NEWS_SLOT_ID
    ? { client: env.VITE_ADSENSE_CLIENT_ID, slot: env.VITE_ADSENSE_NEWS_SLOT_ID }
    : { client: '', slot: '' };

export function AdSlot({ placement, config = readAdSenseConfig((import.meta as ImportMeta & { env?: Record<string, string> }).env ?? {}) }: AdSlotProps) {
  const { client, slot } = config;
  return <aside className={`news-ad news-ad--${placement}`} aria-label="Advertisements" data-configured={Boolean(client && slot)} />;
}
```

- [ ] **Step 4: Replace the old CSS with the Editorial Stream visual system**

Define a max-width two-column frame, Newsreader/Georgia headline stack, forest/brass palette, stable 300×250 minimum ad area, sticky desktop rail below the header, horizontal filters, lead/card image ratios, skeletons, focus-visible states, reduced motion, and one-column behavior at `900px`. At `720px`, place the mobile ad after the third story and ensure no horizontal page overflow.

- [ ] **Step 5: Run presentation tests and CSS assertions**

Run: `node --import tsx --test tests/newsEditorialStream.test.tsx`

Expected: PASS and no MQL5 text or container in markup.

- [ ] **Step 6: Commit the public presentation**

```bash
git add components/news/NewsEditorialStream.tsx components/news/AdSlot.tsx pages/NewsPage.css tests/newsEditorialStream.test.tsx
git commit -m "feat: add editorial news stream"
```

### Task 5: Public News Data State and Index Page

**Files:**
- Create: `components/news/useNewsIndex.ts`
- Replace: `pages/NewsPage.tsx`
- Modify: `App.tsx`
- Test: `tests/newsEditorialStream.test.tsx`

**Interfaces:**
- Consumes: `listPublishedNews`, `getFeaturedNewsArticleId`, `NewsEditorialStream`, `NewsCategory`, `NewsCursor`.
- Produces: `useNewsIndex(activeCategory)` returning `{ articles, featuredArticleId, loading, loadingMore, error, hasMore, loadMore, retry }`; public `/news` page.

- [ ] **Step 1: Add failing page-state tests**

```tsx
test('news page exposes calm loading, empty, and retry states', async () => {
  const source = await readFile(new URL('../pages/NewsPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /NewsEditorialStream/);
  assert.match(source, /The next weekly briefing is being prepared/);
  assert.match(source, />Retry</);
  assert.doesNotMatch(source, /mountEconomicCalendarWidget|marketBriefs|signalItems/);
});
```

- [ ] **Step 2: Run the page test and verify it fails against the MQL5 implementation**

Run: `node --import tsx --test tests/newsEditorialStream.test.tsx`

Expected: FAIL because the current page still mounts the calendar.

- [ ] **Step 3: Implement index loading and cancellation-safe state**

Reset article/cursor state when category changes. Ignore results after unmount or a newer request. Retain already loaded stories during a load-more error. Set `hasMore` only when a full page is returned.

```ts
export type NewsIndexState = {
  articles: NewsArticle[];
  featuredArticleId: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore(): Promise<void>;
  retry(): void;
};
```

- [ ] **Step 4: Compose the new `/news` page and SEO**

Use `useSEO` with title `Market News & Weekly Financial Analysis | Ta7leel`, a news-specific description, canonical `/news/`, and the default social image. Render one `h1`, loading skeleton, approved empty copy, initial error with Retry, or `NewsEditorialStream`.

- [ ] **Step 5: Run public index tests and TypeScript**

Run: `node --import tsx --test tests/newsEditorialStream.test.tsx`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit the live public index**

```bash
git add components/news/useNewsIndex.ts pages/NewsPage.tsx App.tsx tests/newsEditorialStream.test.tsx
git commit -m "feat: connect news index to Firebase"
```

### Task 6: Individual Article Route and Reader

**Files:**
- Create: `components/news/NewsArticleReader.tsx`
- Create: `components/news/useNewsArticle.ts`
- Create: `pages/NewsArticlePage.tsx`
- Modify: `components/StructuredData.tsx`
- Modify: `App.tsx`
- Modify: `pages/NewsPage.css`
- Create: `tests/newsArticlePage.test.tsx`

**Interfaces:**
- Consumes: `getPublishedNewsArticleBySlug`, `listPublishedNews`, `selectRelatedArticles`, `MarkdownRenderer`, `AdSlot`, `useSEO`, `StructuredData`, route `slug`.
- Produces: `NewsArticleReader({ article, relatedArticles })`, `useNewsArticle(slug)`, public `/news/:slug` behavior.

- [ ] **Step 1: Write failing reader and metadata tests**

```tsx
test('article reader renders metadata, sources, disclaimer, related links, and ad rail', () => {
  const markup = renderToStaticMarkup(<NewsArticleReader article={article} relatedArticles={[related]} />);
  assert.match(markup, /<article/);
  assert.match(markup, /<time/);
  assert.match(markup, />Sources</);
  assert.match(markup, /not investment advice/i);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.match(markup, /Advertisements/);
});

test('article page configures NewsArticle structured data', async () => {
  const source = await readFile(new URL('../pages/NewsArticlePage.tsx', import.meta.url), 'utf8');
  assert.match(source, /NewsArticle/);
  assert.match(source, /datePublished/);
  assert.match(source, /mainEntityOfPage/);
});
```

- [ ] **Step 2: Run the reader tests and verify missing modules**

Run: `node --import tsx --test tests/newsArticlePage.test.tsx`

Expected: FAIL because the reader and article page do not exist.

- [ ] **Step 3: Implement the reader and slug hook**

Render semantic article metadata, featured image, existing safe `MarkdownRenderer`, optional sources, disclaimer, same-category related stories, and the article ad rail. The hook distinguishes `loading`, `notFound`, and `error`; a null published lookup is not-found, while rejected Firestore calls are retryable errors.

- [ ] **Step 4: Implement route-level SEO and routing**

Add the lazy `/news/:slug` route after exact `/news`. Set canonical, title, description, image, and Open Graph article fields through `useSEO`. Extend `StructuredData` with a `newsArticle` prop variant and render this JSON-LD shape:

```ts
{
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: article.title,
  description: article.excerpt,
  image: article.imageUrl,
  author: { '@type': 'Person', name: article.authorName },
  datePublished: article.publishedAt.toISOString(),
  dateModified: article.updatedAt.toISOString(),
  inLanguage: 'en',
  mainEntityOfPage: `${SITE_URL}/news/${article.slug}/`,
}
```

- [ ] **Step 5: Run reader, route, and TypeScript checks**

Run: `node --import tsx --test tests/newsArticlePage.test.tsx tests/newsEditorialStream.test.tsx`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit article pages**

```bash
git add components/news/NewsArticleReader.tsx components/news/useNewsArticle.ts pages/NewsArticlePage.tsx pages/NewsPage.css components/StructuredData.tsx App.tsx tests/newsArticlePage.test.tsx
git commit -m "feat: add individual news articles"
```

### Task 7: Admin Guard, Inventory, and Editor

**Files:**
- Create: `components/AdminRoute.tsx`
- Create: `components/news/AdminNewsInventory.tsx`
- Create: `components/news/NewsArticleEditor.tsx`
- Create: `pages/AdminNewsPage.tsx`
- Create: `pages/AdminNewsEditorPage.tsx`
- Create: `pages/AdminNewsPage.css`
- Modify: `components/UserMenu.tsx`
- Modify: `App.tsx`
- Create: `tests/newsAdmin.test.tsx`

**Interfaces:**
- Consumes: `isAdminIdentity`, `useFirebase` for route loading/authentication, `useAuth` for the current menu identity, all admin repository mutations, image service, validation/model helpers, sample draft.
- Produces: `AdminGate({ user, loading, children })`, authenticated `AdminRoute`, and admin-only `/admin/news`, `/admin/news/new`, and `/admin/news/:articleId` workflows.

- [ ] **Step 1: Write failing guard, inventory, and editor tests**

```tsx
test('AdminGate rejects signed-in non-admin users', () => {
  const markup = renderToStaticMarkup(<StaticRouter location="/admin/news"><AdminGate user={{ id: 'reader', email: 'reader@example.com', name: 'Reader' }} loading={false}><p>Secret</p></AdminGate></StaticRouter>);
  assert.doesNotMatch(markup, /Secret/);
});

test('editor exposes distinct draft, preview, and publish actions', () => {
  const keepDraft = async (draft: NewsArticleDraft) => draft;
  const removeDraft = async () => undefined;
  const markup = renderToStaticMarkup(<NewsArticleEditor initialDraft={createEmptyNewsDraft()} onSaveDraft={keepDraft} onPublish={keepDraft} onDelete={removeDraft} />);
  assert.match(markup, /Save draft/);
  assert.match(markup, /Preview/);
  assert.match(markup, /Publish/);
  assert.match(markup, /Featured image/);
  assert.match(markup, /Image alt text/);
});

test('user menu exposes the news workspace only through the shared admin check', async () => {
  const source = await readFile(new URL('../components/UserMenu.tsx', import.meta.url), 'utf8');
  assert.match(source, /isAdminIdentity\(user\)/);
  assert.match(source, /to="\/admin\/news"/);
});
```

- [ ] **Step 2: Run admin tests and verify missing components**

Run: `node --import tsx --test tests/newsAdmin.test.tsx`

Expected: FAIL because admin components do not exist.

- [ ] **Step 3: Implement shared admin authorization and inventory**

`AdminRoute` reads `useFirebase` and delegates rendering to exported pure `AdminGate`. `AdminGate` shows a loading state, redirects anonymous users to `/login`, and renders Access Denied for authenticated non-admins. Inventory loads newest-updated records, supports All/Draft/Published filters, and displays status text in addition to color. Add a **News publishing** link to `UserMenu` only when `isAdminIdentity(user)` is true.

- [ ] **Step 4: Implement controlled editor and preview**

Track `NewsArticleDraft`, per-field errors, dirty state, selected image, upload progress, and active mutation. Generate the slug from title until manual slug editing. Preview renders `NewsArticleReader` inside the admin route with `noindex`; it must not create or navigate to a public draft URL.

```ts
type NewsArticleEditorProps = {
  initialDraft: NewsArticleDraft;
  onSaveDraft(draft: NewsArticleDraft, image: File | null): Promise<NewsArticleDraft>;
  onPublish(draft: NewsArticleDraft, image: File | null, makeFeatured: boolean): Promise<NewsArticleDraft>;
  onDelete?(article: NewsArticleDraft): Promise<void>;
};
```

- [ ] **Step 5: Connect create/edit actions and safe deletion**

Create a client document ID before upload, keep failed selections available for retry, disable duplicate submissions, confirm unsaved navigation and deletion, update the article before deleting a replaced image, and report cleanup failure separately. Use `getSampleNewsDraft()` only in development/emulator mode and never write it without an explicit Save action.

- [ ] **Step 6: Add lazy admin routes and styles**

Load admin CSS with the admin page chunks. Provide visible labels, connected `aria-describedby` errors, keyboard-safe dialogs, responsive two-column edit/preview layout, and focus movement to the first invalid field after Publish.

- [ ] **Step 7: Run admin and regression tests**

Run: `node --import tsx --test tests/newsAdmin.test.tsx tests/newsArticlePage.test.tsx tests/newsEditorialStream.test.tsx`

Expected: PASS.

Run: `npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 8: Commit the admin workflow**

```bash
git add components/AdminRoute.tsx components/UserMenu.tsx components/news/AdminNewsInventory.tsx components/news/NewsArticleEditor.tsx pages/AdminNewsPage.tsx pages/AdminNewsEditorPage.tsx pages/AdminNewsPage.css App.tsx tests/newsAdmin.test.tsx
git commit -m "feat: add news publishing workspace"
```

### Task 8: AdSense Loading and Privacy Disclosure

**Files:**
- Modify: `components/news/AdSlot.tsx`
- Modify: `pages/PrivacyPolicyPage.tsx`
- Modify: `tests/newsEditorialStream.test.tsx`
- Create: `tests/newsAdSlot.test.tsx`

**Interfaces:**
- Consumes: `VITE_ADSENSE_CLIENT_ID`, `VITE_ADSENSE_NEWS_SLOT_ID`, Google Privacy & Messaging CMP configured outside source.
- Produces: one-time script loading, one ad request per mounted visible unit, stable missing/blocked behavior, updated privacy copy.

- [ ] **Step 1: Write failing configuration tests**

```tsx
test('unconfigured ad slot reserves space without emitting an AdSense request', () => {
  const markup = renderToStaticMarkup(<AdSlot placement="news-index" config={{ client: '', slot: '' }} />);
  assert.match(markup, /aria-label="Advertisements"/);
  assert.doesNotMatch(markup, /adsbygoogle/);
});

test('privacy policy discloses AdSense, cookies, consent, and Firebase Storage', async () => {
  const source = await readFile(new URL('../pages/PrivacyPolicyPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /Google AdSense/);
  assert.match(source, /consent/i);
  assert.match(source, /Firebase Storage/);
});

test('readAdSenseConfig enables ads only when both ids exist', () => {
  assert.deepEqual(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1', VITE_ADSENSE_NEWS_SLOT_ID: '42' }), { client: 'ca-pub-1', slot: '42' });
  assert.deepEqual(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1' }), { client: '', slot: '' });
});
```

- [ ] **Step 2: Run ad/privacy tests and verify disclosure failure**

Run: `node --import tsx --test tests/newsAdSlot.test.tsx tests/newsEditorialStream.test.tsx`

Expected: FAIL because the finalized loader and disclosures are absent.

- [ ] **Step 3: Implement one-time AdSense loading**

Create the script with `async`, `crossOrigin="anonymous"`, and `src=https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}` only when both IDs exist. Mark the document when loaded, push one `{}` request per mounted configured slot, catch blocked-script errors, and never throw into the news tree. Render `<ins className="adsbygoogle" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />` only when configured.

- [ ] **Step 4: Update the privacy policy**

Add plain-language disclosures for news-image storage, Google AdSense, cookies/local storage, personalized/non-personalized advertising, Google Privacy & Messaging consent controls, and links to Google's privacy/ad settings pages. Do not claim legal compliance or consent behavior that the application cannot verify.

- [ ] **Step 5: Run ad/privacy and public-page tests**

Run: `node --import tsx --test tests/newsAdSlot.test.tsx tests/newsEditorialStream.test.tsx tests/newsArticlePage.test.tsx`

Expected: PASS with configured and unconfigured branches covered.

- [ ] **Step 6: Commit advertising and privacy**

```bash
git add components/news/AdSlot.tsx pages/PrivacyPolicyPage.tsx tests/newsAdSlot.test.tsx tests/newsEditorialStream.test.tsx
git commit -m "feat: add compliant news ad slot"
```

### Task 9: Dynamic News SEO Catalog, Sitemap, and Prerender

**Files:**
- Create: `scripts/newsCatalog.ts`
- Create: `scripts/newsSeo.ts`
- Modify: `scripts/generate-seo-sitemaps.ts`
- Modify: `scripts/prerender-seo.ts`
- Modify: `tests/seoCatalog.test.ts`
- Modify: `tests/seoOutput.test.ts`

**Interfaces:**
- Consumes: public `newsArticles` query, `SITE_URL`, canonical helpers, exact news model fields.
- Produces: `loadPublishedNewsCatalog()`, `buildNewsSitemapUrls(articles)`, `buildNewsIndexPage(articles)`, `buildNewsArticlePage(article)`, sitemap entries, index fallback, article fallback, `NewsArticle` JSON-LD.

- [ ] **Step 1: Add failing catalog and generated-output tests**

```ts
import { buildNewsArticlePage, buildNewsSitemapUrls } from '../scripts/newsSeo';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';

test('news sitemap records use canonical article paths and updated dates', () => {
  const urls = buildNewsSitemapUrls([{ slug: 'weekly-outlook', updatedAt: new Date('2026-09-13') }]);
  assert.deepEqual(urls, [{ path: '/news/weekly-outlook', changefreq: 'weekly', priority: '0.7', lastmod: '2026-09-13' }]);
});

test('news article fallback includes crawlable copy and NewsArticle schema', () => {
  const page = buildNewsArticlePage(makeNewsArticleFixture({ slug: 'weekly-outlook' }));
  assert.match(page.body, /<article>/);
  assert.equal(page.schema[0]['@type'], 'NewsArticle');
  assert.equal(page.path, '/news/weekly-outlook');
});
```

- [ ] **Step 2: Run SEO tests and verify missing helpers**

Run: `node --import tsx --test tests/seoCatalog.test.ts tests/seoOutput.test.ts`

Expected: FAIL because `scripts/newsCatalog.ts` and `scripts/newsSeo.ts` do not exist.

- [ ] **Step 3: Implement build-time published catalog loading**

Initialize a named Firebase app from `VITE_FIREBASE_*` process variables, query only `status == 'published'`, normalize timestamps, and return records ordered newest first. If configuration/load fails and `NEWS_CATALOG_REQUIRED === 'true'`, throw an actionable error; otherwise warn once and return an empty catalog for local builds.

- [ ] **Step 4: Extend sitemap generation**

Append published news routes only to the English sitemap/all-routes output. Use `/news/:slug`, `changefreq: 'weekly'`, `priority: '0.7'`, and ISO date-only `updatedAt`. Keep `/news` in base routes and update its change frequency from daily to weekly.

- [ ] **Step 5: Extend prerender generation**

Generate a crawlable `/news` index and each published `/news/:slug` route. Escape all Firestore content, convert the safe Markdown subset to plain paragraphs/headings without executing HTML, add canonical metadata, treat `/news/:slug` as Open Graph `article`, and emit `NewsArticle` JSON-LD with publisher, author, dates, image, language, and main-entity URL.

- [ ] **Step 6: Run SEO tests and production generation**

Run: `node --import tsx --test tests/seoCatalog.test.ts tests/seoOutput.test.ts`

Expected: PASS.

Run: `npm run sitemap`

Expected: exits zero; without Firebase build variables it warns once and still produces valid base sitemaps.

- [ ] **Step 7: Commit news SEO**

```bash
git add scripts/newsCatalog.ts scripts/newsSeo.ts scripts/generate-seo-sitemaps.ts scripts/prerender-seo.ts tests/seoCatalog.test.ts tests/seoOutput.test.ts
git commit -m "feat: publish news SEO artifacts"
```

### Task 10: Remove MQL5 and Complete End-to-End Verification

**Files:**
- Delete: `pages/newsCalendarWidget.ts`
- Delete: `tests/newsCalendarWidget.test.ts`
- Delete: `tests/newsMarketDesk.test.tsx`
- Modify: `package.json`
- Modify: any news files from Tasks 1–9 only when verification exposes a defect.

**Interfaces:**
- Consumes: all completed public, admin, Firebase, advertising, and SEO interfaces.
- Produces: one clean, production-buildable news publishing feature with no MQL5 runtime dependency.

- [ ] **Step 1: Add an explicit removal regression assertion**

```ts
test('repository news runtime no longer references the MQL5 calendar', async () => {
  const app = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const page = await readFile(new URL('../pages/NewsPage.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(`${app}\n${page}`, /MQL5|tradays|economicCalendarWidget|newsCalendarWidget/i);
});
```

- [ ] **Step 2: Delete the widget and obsolete tests**

Remove `pages/newsCalendarWidget.ts`, `tests/newsCalendarWidget.test.ts`, and `tests/newsMarketDesk.test.tsx`. Update explicit test lists/scripts so they point to the new news suites.

- [ ] **Step 3: Run focused feature tests**

Run: `node --import tsx --test tests/newsModel.test.ts tests/newsEditorialStream.test.tsx tests/newsArticlePage.test.tsx tests/newsAdmin.test.tsx tests/newsAdSlot.test.tsx`

Expected: PASS with zero skipped or todo tests.

- [ ] **Step 4: Run Firebase rules tests**

Run: `npm run test:rules`

Expected: PASS for Firestore and Storage suites.

- [ ] **Step 5: Run the production build and SEO checks**

Run: `npm run build`

Expected: sitemap generation, Vite compilation, prerender generation, and SEO tests all PASS. Output must not contain an MQL5 calendar script or attribution.

- [ ] **Step 6: Inspect responsive and failure behavior**

Start `npm run dev`, then verify `/news`, one `/news/:slug`, `/admin/news`, and `/admin/news/new` at 1440×900, 768×1024, and 390×844. Repeat the public checks with Firestore offline and AdSense blocked. Confirm one `h1`, keyboard focus, filter overflow, mobile ad order, draft privacy, Retry actions, no layout jump, and no horizontal page scroll.

- [ ] **Step 7: Review the working tree and commit final integration fixes**

Run: `git status --short`

Expected: only files intentionally changed by this plan are staged; pre-existing `email-templates/`, `public/images/email/`, and `tests/emailMarketBriefFooter.test.ts` remain untouched.

Stage only the exact files changed while completing Tasks 9–10. At minimum, the removal commit is:

```bash
git add package.json pages/newsCalendarWidget.ts tests/newsCalendarWidget.test.ts tests/newsMarketDesk.test.tsx
git commit -m "feat: launch editorial market news"
```

Do not stage unrelated pre-existing workspace files. If all Task 10 fixes were already committed in earlier tasks, skip the empty final commit.
