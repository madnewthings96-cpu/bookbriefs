import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import DashboardOverviewView from '../components/dashboard/DashboardOverviewView';
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
