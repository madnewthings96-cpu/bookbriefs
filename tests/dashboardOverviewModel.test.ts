import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDashboardShelf,
  buildWeeklyReadingInsight,
  selectContinueReading,
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
    ['a', true, 'in-progress'], ['b', false, 'in-progress'],
  ]);
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
