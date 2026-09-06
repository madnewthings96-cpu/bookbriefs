import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('reading profile model prefers completed progress and formats the ledger', async () => {
  const {
    buildReadingStats,
    getNextBookProgress,
    getPrimaryShelfUtility,
    isNewReadingProfile,
  } = await import('../components/profile/profilePageModel');

  const stats = buildReadingStats({
    booksRead: 1,
    completedCount: 3,
    dayStreak: 7,
    totalReadingTime: 125,
    savedBooks: 4,
  });

  assert.deepEqual(stats.map(({ key, value }) => ({ key, value })), [
    { key: 'completed', value: '3' },
    { key: 'streak', value: '7' },
    { key: 'time', value: '2h 5m' },
    { key: 'saved', value: '4' },
  ]);
  assert.equal(isNewReadingProfile(stats, 0), false);
  assert.equal(getNextBookProgress(), 25);
  assert.equal(getNextBookProgress(75), 100);
  assert.equal(getNextBookProgress(100), 100);
  assert.deepEqual(getPrimaryShelfUtility(false), { label: 'Refresh shelf', action: 'refresh' });
  assert.deepEqual(getPrimaryShelfUtility(true), { label: 'Browse library', action: 'browse' });
});

test('a new reader receives an action path instead of a wall of zero metrics', async () => {
  const { buildReadingStats, isNewReadingProfile } = await import('../components/profile/profilePageModel');
  const { default: ProfileHero } = await import('../components/profile/ProfileHero');
  const stats = buildReadingStats({
    booksRead: 0,
    completedCount: 0,
    dayStreak: 0,
    totalReadingTime: 0,
    savedBooks: 0,
  });

  const markup = renderToStaticMarkup(React.createElement(ProfileHero, {
    greeting: 'Good evening',
    userName: 'Hamza',
    isNewReader: isNewReadingProfile(stats, 0),
    hasProgress: false,
    nextBook: {
      title: 'One Good Trade',
      author: 'Mike Bellafiore',
      coverImageUrl: '/one-good-trade.jpg',
      progress: 0,
    },
    stats,
    onPrimaryAction: () => undefined,
    onBrowse: () => undefined,
  }));

  assert.match(markup, /<section[^>]*aria-labelledby="reading-desk-title"/);
  assert.match(markup, /Your reading trail starts here/);
  assert.match(markup, /Choose one summary/);
  assert.doesNotMatch(markup, /aria-label="Reading activity"/);
  assert.match(markup, /aria-label="Start One Good Trade"/);
});

test('an active reader sees the compact activity ledger and continue action', async () => {
  const { buildReadingStats } = await import('../components/profile/profilePageModel');
  const { default: ProfileHero } = await import('../components/profile/ProfileHero');
  const stats = buildReadingStats({
    booksRead: 2,
    completedCount: 2,
    dayStreak: 5,
    totalReadingTime: 80,
    savedBooks: 3,
  });

  const markup = renderToStaticMarkup(React.createElement(ProfileHero, {
    greeting: 'Good morning',
    userName: 'Maya',
    isNewReader: false,
    hasProgress: true,
    nextBook: {
      title: 'Atomic Habits',
      author: 'James Clear',
      coverImageUrl: '/atomic-habits.jpg',
      progress: 50,
    },
    stats,
    onPrimaryAction: () => undefined,
    onBrowse: () => undefined,
  }));

  assert.match(markup, /aria-label="Reading activity"/);
  assert.match(markup, /50% read/);
  assert.match(markup, /aria-label="Continue Atomic Habits"/);
  assert.match(markup, /role="progressbar"/);
  assert.match(markup, /aria-valuenow="50"/);
  assert.match(markup, />1h 20m</);
});
