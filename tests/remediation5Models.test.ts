import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import DashboardLibraryView from '../components/dashboard/DashboardLibraryView';
import DashboardNotesView from '../components/dashboard/DashboardNotesView';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';
import { buildCatalogSurfaceState } from '../components/dashboard/catalogStateModel';
import { getDashboardSearchSurfaceState } from '../components/dashboard/dashboardSearchModel';
import { runDashboardRetry } from '../components/dashboard/dashboardOverviewModel';
import { getSummaryCatalogSurfaceState } from '../components/summaryCatalogState';
import { parseBooksCache, readBooksCache, writeBooksCache } from '../contexts/booksCache';
import { LatestRequestGate } from '../contexts/latestRequestGate';
import { AsyncIdentityGuard } from '../components/asyncIdentityGuard';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  readonly removed: string[] = [];

  constructor(entries: Record<string, string> = {}) {
    Object.entries(entries).forEach(([key, value]) => this.values.set(key, value));
  }

  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); this.removed.push(key); }
}

const validBook = {
  id: 'atomic-habits',
  title: 'Atomic Habits',
  author: 'James Clear',
  coverImageUrl: '/atomic.jpg',
  category: 'Self-Help',
};

test('catalog presenters keep private empty states in loading until user data is ready', () => {
  assert.equal(buildCatalogSurfaceState({
    loading: false,
    error: null,
    hasContent: false,
    userDataReady: false,
  } as never), 'loading');
  assert.equal(buildCatalogSurfaceState({
    loading: false,
    error: null,
    hasContent: false,
    userDataReady: true,
  } as never), 'empty');
});

test('hydration readiness keeps overview and notes presenters from flashing private empties', () => {
  const overview = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Reader', catalogLoading: false,
        challengeLoading: false, continueBook: undefined, challenge: undefined,
        challengeError: null, libraryError: null, recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
        userDataReady: false,
      }),
    ),
  );
  const notes = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/notes' },
      React.createElement(DashboardNotesView, {
        filter: 'all', onFilterChange: () => undefined, catalogLoading: false,
        catalogError: null, retryCatalog: async () => undefined, groups: [], userDataReady: false,
      }),
    ),
  );

  assert.match(overview, /Loading reading data/);
  assert.doesNotMatch(overview, /Choose your first summary/);
  assert.match(notes, /Loading your notes/);
  assert.doesNotMatch(notes, /Nothing captured yet/);
});

test('overview recovery actions replace misleading empty CTAs and preserve stale cards', () => {
  const emptyMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Reader', catalogLoading: false,
        challengeLoading: false, challenge: undefined,
        challengeError: 'Challenge unavailable', libraryError: 'Saved books unavailable',
        onRetryChallenge: () => undefined, onRetryLibrary: () => undefined,
        continueBook: undefined, recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );
  assert.equal((emptyMarkup.match(/>Try again</g) ?? []).length, 2);
  assert.doesNotMatch(emptyMarkup, /Create a reading goal/);
  assert.doesNotMatch(emptyMarkup, /Explore the library/);

  const staleMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Reader', catalogLoading: false,
        challengeLoading: false,
        challenge: { current: 4, goal: 12, percentage: 33 },
        challengeError: 'Challenge refresh failed', libraryError: 'Saved books unavailable',
        onRetryChallenge: () => undefined, onRetryLibrary: () => undefined,
        continueBook: undefined, recentKnowledge: [],
        library: [{
          book: { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' },
          progress: 40, saved: true, status: 'in-progress' as const,
        }],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );
  assert.match(staleMarkup, /4 of 12/);
  assert.match(staleMarkup, /Atomic Habits/);
  assert.equal((staleMarkup.match(/>Try again</g) ?? []).length, 2);
});

test('overview retry actions invoke each context refresh callback exactly once', () => {
  let challengeCalls = 0;
  let favoritesCalls = 0;
  runDashboardRetry(() => { challengeCalls += 1; });
  runDashboardRetry(() => { favoritesCalls += 1; });
  runDashboardRetry(undefined);
  assert.equal(challengeCalls, 1);
  assert.equal(favoritesCalls, 1);
});

test('library renders favorites failures separately from catalog failures', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/library' },
      React.createElement(DashboardLibraryView, {
        filter: 'all',
        onFilterChange: () => undefined,
        visibleItems: [],
        catalogLoading: false,
        catalogError: null,
        favoritesError: 'Saved books are temporarily unavailable.',
        retryCatalog: async () => undefined,
        retryFavorites: () => undefined,
        userDataReady: true,
        emptyState: { message: 'Discover something useful.', action: { label: 'Discover books', to: '/dashboard/discover' } },
      } as never),
    ),
  );

  assert.match(markup, /Saved books are temporarily unavailable\./);
  assert.match(markup, /role="alert"/);
  assert.doesNotMatch(markup, /No books here yet/);
});

test('firebase hosting protects exact and nested dashboard responses from indexing', async () => {
  const config = JSON.parse(await readFile('firebase.json', 'utf8')) as {
    hosting?: {
      public?: string;
      ignore?: string[];
      headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
      rewrites?: Array<{ source: string; destination: string; status?: number }>;
    };
  };
  const headerBlocks = config.hosting?.headers ?? [];
  const robots = headerBlocks.filter((block) => (
    (block.source === '/dashboard' || block.source === '/dashboard/**')
    && block.headers.some((header) => header.key === 'X-Robots-Tag' && header.value === 'noindex, nofollow, noarchive')
  ));

  assert.deepEqual(robots.map((block) => block.source).sort(), ['/dashboard', '/dashboard/**']);
  assert.equal(headerBlocks.some((block) => (
    !['/dashboard', '/dashboard/**'].includes(block.source)
    && block.headers.some((header) => header.key === 'X-Robots-Tag')
  )), false);
  assert.equal(config.hosting?.public, 'dist');
  assert.deepEqual(config.hosting?.ignore, ['firebase.json', '**/.*', '**/node_modules/**']);
  assert.deepEqual(config.hosting?.rewrites, [{ source: '**', destination: '/index.html' }]);

  const netlifyConfig = await readFile('netlify.toml', 'utf8');
  const publicSecurityBlock = netlifyConfig.slice(netlifyConfig.indexOf('for = "/*"'), netlifyConfig.indexOf('[[headers]]', netlifyConfig.indexOf('for = "/*"') + 1));
  for (const header of [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy',
    'Strict-Transport-Security',
  ]) {
    assert.match(publicSecurityBlock, new RegExp(`^\\s*${header}\\s*=`, 'm'), header);
  }
  assert.doesNotMatch(publicSecurityBlock, /X-Robots-Tag/);
});

test('books cache accepts complete legacy records and clears wrong-shaped records only', () => {
  const validRaw = JSON.stringify([validBook]);
  assert.deepEqual(parseBooksCache(validRaw), [validBook]);
  assert.equal(parseBooksCache('{not-json'), null);
  assert.equal(parseBooksCache(JSON.stringify([{ id: 'missing-fields' }])), null);

  const storage = new MemoryStorage({
    books_cache: JSON.stringify({ books: [validBook] }),
    books_cache_timestamp: 'not-a-time',
    unrelated: 'keep me',
  });
  assert.equal(readBooksCache(storage), null);
  assert.deepEqual(storage.removed.sort(), ['books_cache', 'books_cache_timestamp']);
  assert.equal(storage.getItem('unrelated'), 'keep me');
});

test('books cache rejects blank and non-canonical timestamp strings before numeric conversion', () => {
  const invalidTimestamps = ['', ' ', ' 1700000000000', '1700000000000 ', '01700000000000', '1e12', '+1700000000000'];
  for (const timestamp of invalidTimestamps) {
    const storage = new MemoryStorage({
      books_cache: JSON.stringify([validBook]),
      books_cache_timestamp: timestamp,
      unrelated: 'keep me',
    });
    assert.equal(readBooksCache(storage, 1_700_000_000_000), null, timestamp);
    assert.deepEqual(storage.removed.sort(), ['books_cache', 'books_cache_timestamp'], timestamp);
    assert.equal(storage.getItem('unrelated'), 'keep me');
  }
});

test('books cache reads a valid fresh record without changing its shape', () => {
  const now = 1_700_000_000_000;
  const storage = new MemoryStorage({
    books_cache: JSON.stringify([validBook]),
    books_cache_timestamp: String(now - 60_000),
  });
  assert.deepEqual(readBooksCache(storage, now), { books: [validBook], fresh: true });
  assert.deepEqual(storage.removed, []);
});

test('books cache degrades safely when session storage access throws', () => {
  const throwingStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.doesNotThrow(() => readBooksCache(throwingStorage));
  assert.doesNotThrow(() => {
    // A valid cache write must remain an optional optimization.
    writeBooksCache(throwingStorage, [validBook]);
  });
});

test('search surface distinguishes loading, retryable errors, and confirmed no results', () => {
  assert.equal(getDashboardSearchSurfaceState({ query: 'atomic', loading: true, error: null, hasResults: false, hasCatalog: false }), 'loading');
  assert.equal(getDashboardSearchSurfaceState({ query: 'atomic', loading: false, error: 'offline', hasResults: false, hasCatalog: false }), 'error');
  assert.equal(getDashboardSearchSurfaceState({ query: 'unknown', loading: false, error: null, hasResults: false, hasCatalog: true }), 'empty');
  assert.equal(getDashboardSearchSurfaceState({ query: 'atomic', loading: true, error: null, hasResults: true, hasCatalog: true }), 'results');
});

test('focused-reader and modal/mobile contracts remain direction-safe and labelled', async () => {
  const readerCss = await readFile('components/dashboard/FocusedReaderLayout.css', 'utf8');
  const mobile = await readFile('components/dashboard/DashboardMobileNav.tsx', 'utf8');
  const feedback = await readFile('components/FeedbackModal.tsx', 'utf8');

  assert.match(readerCss, /min-block-size:\s*44px/);
  assert.match(readerCss, /min-inline-size:\s*44px/);
  assert.match(readerCss, /:focus-visible/);
  assert.match(readerCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(mobile, /aria-controls=\{open \? 'dashboard-more-drawer' : undefined\}/);
  assert.match(feedback, /<label htmlFor="feedback-message"/);
  assert.match(feedback, /id="feedback-message"/);
});

test('latest catalog requests block stale commits in either completion order', () => {
  const firstWinsTooLate = new LatestRequestGate();
  const first = firstWinsTooLate.begin();
  const second = firstWinsTooLate.begin();
  let state = 'initial';
  const commitFirstWinsTooLate = (requestId: number, next: string) => {
    if (firstWinsTooLate.isCurrent(requestId)) state = next;
  };
  commitFirstWinsTooLate(first, 'old-error');
  commitFirstWinsTooLate(second, 'new-success');
  assert.equal(state, 'new-success');

  const firstCompletesBeforeRetry = new LatestRequestGate();
  const initial = firstCompletesBeforeRetry.begin();
  let orderedState = 'initial';
  if (firstCompletesBeforeRetry.isCurrent(initial)) orderedState = 'old-success';
  const retry = firstCompletesBeforeRetry.begin();
  if (firstCompletesBeforeRetry.isCurrent(retry)) orderedState = 'new-error';
  assert.equal(orderedState, 'new-error');
});

test('summary request guard prevents late response and error commits after route changes or unmount', () => {
  const guard = new AsyncIdentityGuard();
  guard.setIdentity('book-a');
  const first = guard.begin('book-a');
  guard.setIdentity('book-b');
  const second = guard.begin('book-b');
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);

  const commits: string[] = [];
  if (guard.isCurrent(first)) commits.push('book-a-error');
  if (guard.isCurrent(second)) commits.push('book-b-success');
  guard.unmount();
  if (guard.isCurrent(second)) commits.push('book-b-error');
  assert.deepEqual(commits, ['book-b-success']);
});

test('summary catalog state keeps stale books distinct from confirmed not-found', () => {
  assert.equal(getSummaryCatalogSurfaceState({ loading: false, error: 'offline', hasBook: true }), 'error');
  assert.equal(getSummaryCatalogSurfaceState({ loading: false, error: 'offline', hasBook: false }), 'error');
  assert.equal(getSummaryCatalogSurfaceState({ loading: false, error: null, hasBook: false }), 'not-found');
  assert.equal(getSummaryCatalogSurfaceState({ loading: true, error: null, hasBook: false }), 'loading');
});
