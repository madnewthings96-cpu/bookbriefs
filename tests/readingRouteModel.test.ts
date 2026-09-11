import assert from 'node:assert/strict';
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
