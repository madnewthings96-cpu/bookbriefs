import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDashboardShelf,
  buildWeeklyReadingInsight,
  selectContinueReading,
  selectDashboardRecommendations,
  selectRecentKnowledge,
} from '../components/dashboard/dashboardOverviewModel';

const books = [
  { id: 'a', title: 'A', author: 'Author A', category: 'Business', coverImageUrl: '/a.jpg' },
  { id: 'b', title: 'B', author: 'Author B', category: 'Psychology', coverImageUrl: '/b.jpg' },
];
const progress = [
  { bookId: 'a', progress: 25, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-02') },
  { bookId: 'b', progress: 75, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-08') },
];

test('continue reading chooses the most recently opened incomplete catalog book', () => {
  assert.equal(selectContinueReading(books, progress)?.book.id, 'b');
});

test('library merges favorite and progress status without mutating inputs', () => {
  const shelf = buildDashboardShelf(books, ['a'], progress);
  assert.deepEqual(shelf.map(item => [item.book.id, item.saved, item.status]), [
    ['b', false, 'in-progress'], ['a', true, 'in-progress'],
  ]);
});

test('library clamps progress, omits missing catalog records, and leaves its inputs unchanged', () => {
  const catalog = [...books];
  const favoriteIds = ['a'];
  const records = [
    { bookId: 'a', progress: -25, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-04') },
    { bookId: 'b', progress: 175, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-03') },
    { bookId: 'removed', progress: 50, isCompleted: false, startedAt: new Date('2026-09-01'), lastReadAt: new Date('2026-09-09') },
  ];
  const originalCatalog = structuredClone(catalog);
  const originalFavorites = structuredClone(favoriteIds);
  const originalRecords = structuredClone(records);

  const shelf = buildDashboardShelf(catalog, favoriteIds, records);

  assert.deepEqual(shelf.map(item => [item.book.id, item.progress, item.status]), [
    ['a', 0, 'in-progress'], ['b', 100, 'completed'],
  ]);
  assert.deepEqual(catalog, originalCatalog);
  assert.deepEqual(favoriteIds, originalFavorites);
  assert.deepEqual(records, originalRecords);
});

test('recent knowledge combines notes and highlights by updated time', () => {
  const result = selectRecentKnowledge({
    notes: [{ id: 'n', bookId: 'a', content: 'Note', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-02') }],
    highlights: [{ id: 'h', bookId: 'b', text: 'Highlight', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-03') }],
  }, books, 2);
  assert.deepEqual(result.map(item => item.id), ['h', 'n']);
});

test('weekly insight counts unique local reading days in the current seven-day window', () => {
  const insight = buildWeeklyReadingInsight([
    new Date('2026-09-03T09:00:00'), new Date('2026-09-03T18:00:00'), new Date('2026-09-08T12:00:00'),
  ], new Date('2026-09-09T12:00:00'));
  assert.equal(insight.readingDays, 2);
});

test('weekly insight respects local calendar boundaries and counts a streak ending today', () => {
  const insight = buildWeeklyReadingInsight([
    new Date(2026, 8, 2, 23, 59),
    new Date(2026, 8, 3, 0, 1),
    new Date(2026, 8, 7, 23, 59),
    new Date(2026, 8, 8, 23, 59),
    new Date(2026, 8, 9, 0, 1),
  ], new Date(2026, 8, 9, 0, 10));

  assert.deepEqual(insight, { readingDays: 4, currentStreak: 3 });
});

test('recommendations use the established preference sequence, exclusions, and stable catalog fallback', () => {
  const catalog = [
    { id: 'fallback-first', title: 'Fallback first', author: 'A', category: 'Business', coverImageUrl: '/fallback-first.jpg' },
    { id: 'dune', title: 'Dune', author: 'F', category: 'Psychology', coverImageUrl: '/dune.jpg' },
    { id: 'thinkandgrowrich', title: 'Think', author: 'H', category: 'Business', coverImageUrl: '/think.jpg' },
    { id: 'fallback-second', title: 'Fallback second', author: 'B', category: 'Business', coverImageUrl: '/fallback-second.jpg' },
    { id: 'educated', title: 'Educated', author: 'W', category: 'Psychology', coverImageUrl: '/educated.jpg' },
    { id: 'rich-dad-poor-dad', title: 'Rich Dad', author: 'K', category: 'Business', coverImageUrl: '/rich.jpg' },
    { id: 'the-four-agreements', title: 'Four Agreements', author: 'R', category: 'Psychology', coverImageUrl: '/four.jpg' },
    { id: 'the-alchemist', title: 'Alchemist', author: 'C', category: 'Psychology', coverImageUrl: '/alchemist.jpg' },
  ];
  const originalCatalog = structuredClone(catalog);

  const recommendations = selectDashboardRecommendations(catalog, ['the-alchemist', 'fallback-first'], 8);

  assert.deepEqual(recommendations.map(item => [item.book.id, item.status, item.progress]), [
    ['thinkandgrowrich', 'not-started', 0],
    ['rich-dad-poor-dad', 'not-started', 0],
    ['the-four-agreements', 'not-started', 0],
    ['educated', 'not-started', 0],
    ['dune', 'not-started', 0],
    ['fallback-second', 'not-started', 0],
  ]);
  assert.deepEqual(catalog, originalCatalog);
});
