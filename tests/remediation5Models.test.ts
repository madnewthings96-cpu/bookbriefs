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
import { parseBooksCache, readBooksCache, writeBooksCache } from '../contexts/booksCache';

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
    hosting?: { headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };
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
