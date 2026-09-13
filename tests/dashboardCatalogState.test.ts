import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';
import DashboardLibraryView from '../components/dashboard/DashboardLibraryView';
import DashboardNotesView from '../components/dashboard/DashboardNotesView';
import { buildCatalogSurfaceState, runCatalogRetry } from '../components/dashboard/catalogStateModel';

test('overview renders a retryable catalog failure without replacing unrelated challenge content', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Reader', catalogLoading: false,
        catalogError: 'Failed to load books. Please try again later.',
        onRetryCatalog: () => undefined,
        challengeLoading: false,
        continueBook: undefined,
        challenge: { current: 2, goal: 10, percentage: 20 },
        challengeError: null, libraryError: null,
        recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 1, currentStreak: 1 }, recommendations: [],
      }),
    ),
  );

  assert.match(markup, /role="alert"/);
  assert.match(markup, /Try again/);
  assert.match(markup, /2 of 10/);
  assert.doesNotMatch(markup, /Choose your first summary/);
  assert.doesNotMatch(markup, /Browse book summaries/);
});

test('overview keeps challenge data visible while catalog cards show loading state', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good evening', userName: 'Reader', catalogLoading: true,
        challengeLoading: false,
        continueBook: undefined,
        challenge: { current: 4, goal: 12, percentage: 33 },
        challengeError: null, libraryError: null,
        recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );

  assert.match(markup, /aria-label="Loading reading data"/);
  assert.match(markup, /4 of 12/);
  assert.doesNotMatch(markup, /Choose your first summary/);
});

test('overview keeps stale catalog cards visible while the catalog refreshes', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good evening', userName: 'Reader', catalogLoading: true,
        challengeLoading: false,
        continueBook: {
          book: { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' },
          progress: 52, saved: false, status: 'in-progress',
        },
        challenge: { current: 5, goal: 12, percentage: 42 },
        challengeError: null, libraryError: null,
        recentKnowledge: [{
          id: 'note-1', kind: 'note', bookId: 'atomic-habits',
          book: { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' },
          content: 'Make the cue obvious.', updatedAt: new Date('2026-09-10'),
        }],
        library: [{
          book: { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', category: 'Business', coverImageUrl: '/deep-work.jpg' },
          progress: 0, saved: true, status: 'saved',
        }],
        weeklyInsight: { readingDays: 1, currentStreak: 1 },
        recommendations: [{
          book: { id: 'dune', title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', coverImageUrl: '/dune.jpg' },
          progress: 0, saved: false, status: 'not-started',
        }],
      }),
    ),
  );

  assert.match(markup, /Atomic Habits/);
  assert.match(markup, /Make the cue obvious\./);
  assert.match(markup, /Deep Work/);
  assert.match(markup, /Dune/);
  assert.doesNotMatch(markup, /dashboard-card-skeleton/);
  assert.doesNotMatch(markup, /aria-label="Loading reading data"/);
});

test('catalog presenters give loading and failure precedence without hiding usable content', () => {
  assert.equal(buildCatalogSurfaceState({ loading: true, error: null, hasContent: false }), 'loading');
  assert.equal(buildCatalogSurfaceState({ loading: true, error: null, hasContent: true }), 'content');
  assert.equal(buildCatalogSurfaceState({ loading: false, error: 'offline', hasContent: false }), 'error');
  assert.equal(buildCatalogSurfaceState({ loading: false, error: 'offline', hasContent: true }), 'content');
  assert.equal(buildCatalogSurfaceState({ loading: false, error: null, hasContent: false }), 'empty');
});

test('catalog retry presenter invokes the context refresh callback exactly once', async () => {
  let calls = 0;
  const retry = runCatalogRetry(async () => {
    calls += 1;
  });

  await retry();
  assert.equal(calls, 1);
});

test('library presenter renders stale content during loading and a retryable error without hiding it', async () => {
  let refreshCalls = 0;
  const refreshBooks = async () => {
    refreshCalls += 1;
  };
  const retryCatalog = runCatalogRetry(refreshBooks);
  const item = {
    book: { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', category: 'Business', coverImageUrl: '/deep-work.jpg' },
    progress: 0, saved: true, status: 'saved' as const,
  };
  const emptyState = { message: 'Discover something useful.', action: { label: 'Discover books', to: '/dashboard/discover' } };

  const loadingMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/library' },
      React.createElement(DashboardLibraryView, {
        filter: 'all', onFilterChange: () => undefined, visibleItems: [item],
        catalogLoading: true, catalogError: null, retryCatalog, emptyState,
      }),
    ),
  );
  assert.match(loadingMarkup, /Deep Work/);
  assert.match(loadingMarkup, /Loading your library/);
  assert.doesNotMatch(loadingMarkup, /No books here yet/);

  const errorMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/library' },
      React.createElement(DashboardLibraryView, {
        filter: 'all', onFilterChange: () => undefined, visibleItems: [item],
        catalogLoading: false, catalogError: 'Catalog offline', retryCatalog, emptyState,
      }),
    ),
  );
  assert.match(errorMarkup, /role="alert"/);
  assert.match(errorMarkup, /Try again/);
  assert.match(errorMarkup, /Deep Work/);

  await retryCatalog();
  assert.equal(refreshCalls, 1);
});

test('notes presenter distinguishes empty/loading/error states while preserving captured groups', async () => {
  let refreshCalls = 0;
  const refreshBooks = async () => {
    refreshCalls += 1;
  };
  const retryCatalog = runCatalogRetry(refreshBooks);
  const group = {
    bookId: 'atomic-habits', bookTitle: 'Atomic Habits', bookSlug: 'atomic-habits',
    items: [{
      id: 'note-1', kind: 'note' as const, bookId: 'atomic-habits',
      content: 'Make the cue obvious.', updatedAt: new Date('2026-09-10'),
    }],
  };

  const loadingMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/notes' },
      React.createElement(DashboardNotesView, {
        filter: 'all', onFilterChange: () => undefined, catalogLoading: true,
        catalogError: null, retryCatalog, groups: [group],
      }),
    ),
  );
  assert.match(loadingMarkup, /Atomic Habits/);
  assert.match(loadingMarkup, /Make the cue obvious\./);
  assert.match(loadingMarkup, /Loading book details/);
  assert.doesNotMatch(loadingMarkup, /Nothing captured yet/);

  const errorMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/notes' },
      React.createElement(DashboardNotesView, {
        filter: 'all', onFilterChange: () => undefined, catalogLoading: false,
        catalogError: 'Catalog offline', retryCatalog, groups: [group],
      }),
    ),
  );
  assert.match(errorMarkup, /role="alert"/);
  assert.match(errorMarkup, /Try again/);
  assert.match(errorMarkup, /Make the cue obvious\./);

  const emptyMarkup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/notes' },
      React.createElement(DashboardNotesView, {
        filter: 'all', onFilterChange: () => undefined, catalogLoading: false,
        catalogError: null, retryCatalog, groups: [],
      }),
    ),
  );
  assert.match(emptyMarkup, /Nothing captured yet/);

  await retryCatalog();
  assert.equal(refreshCalls, 1);
});

test('overview catalog failure omits retry control when no callback is supplied', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good morning', userName: 'Reader', catalogLoading: false,
        catalogError: 'Catalog offline',
        challengeLoading: false,
        continueBook: undefined, challenge: undefined,
        challengeError: null, libraryError: null,
        recentKnowledge: [], library: [],
        weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );

  assert.match(markup, /role="alert"/);
  assert.doesNotMatch(markup, /<button[^>]*>Try again<\/button>/);
});
