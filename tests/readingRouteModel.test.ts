import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getBookLibraryHref, getBookSummaryHref } from '../components/readingRouteModel';

const book = {
  id: 'atomic-habits',
  arabicSlug: 'atomic-habits',
  title: 'Atomic Habits',
  author: 'James Clear',
  category: 'Self-Help',
  coverImageUrl: '/atomic.jpg',
};

test('reading hrefs remain on their selected surface', () => {
  assert.equal(getBookSummaryHref(book, 'public'), '/summary/atomic-habits');
  assert.equal(getBookSummaryHref(book, 'dashboard'), '/dashboard/summary/atomic-habits');
  assert.equal(getBookLibraryHref('public'), '/summaries');
  assert.equal(getBookLibraryHref('dashboard'), '/dashboard/discover');
});

test('dashboard exposes a protected Arabic reader route', async () => {
  const [appSource, switchSource] = await Promise.all([
    readFile(new URL('../App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/SummaryLanguageSwitch.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(appSource, /path="\/dashboard\/ar\/summary\/:bookId"/);
  assert.match(switchSource, /`\/dashboard\/ar\/summary\/\$\{arabicSummary\.slug\}`/);
  assert.match(switchSource, /surface === 'public'/);
});
