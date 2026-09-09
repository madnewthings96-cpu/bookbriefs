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
        greeting: 'Good morning', userName: 'Belhal', catalogLoading: false, challengeLoading: false,
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
        greeting: 'Good afternoon', userName: 'New reader', catalogLoading: false, challengeLoading: false,
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

test('challenge loading remains inside its card while reading actions stay available', () => {
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard' },
      React.createElement(DashboardOverviewView, {
        greeting: 'Good evening', userName: 'Belhal', catalogLoading: false, challengeLoading: true,
        continueBook: { book: { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' }, progress: 68, saved: true, status: 'in-progress' },
        challenge: undefined, challengeError: null, libraryError: null,
        recentKnowledge: [], library: [], weeklyInsight: { readingDays: 0, currentStreak: 0 }, recommendations: [],
      }),
    ),
  );
  assert.match(markup, /Loading your reading challenge/);
  assert.match(markup, /Continue reading/);
  assert.match(markup, /Atomic Habits/);
});
