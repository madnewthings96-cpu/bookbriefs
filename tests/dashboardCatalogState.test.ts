import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';

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

test('library and notes distinguish catalog loading and failure from true empty state', async () => {
  const library = await readFile('pages/DashboardLibraryPage.tsx', 'utf8');
  const notes = await readFile('pages/DashboardNotesPage.tsx', 'utf8');

  for (const source of [library, notes]) {
    assert.match(source, /loading:\s*catalogLoading/);
    assert.match(source, /error:\s*catalogError/);
    assert.match(source, /refreshBooks/);
    assert.match(source, /role="alert"/);
    assert.match(source, /Try again/);
    assert.match(source, /role="status"/);
  }

  assert.match(library, /catalogError.*visibleItems\.length/s);
  assert.match(notes, /catalogError.*groups\.length/s);
  assert.match(notes, /Book no longer available/);
});
