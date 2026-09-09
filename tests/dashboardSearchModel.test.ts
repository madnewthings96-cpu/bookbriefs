import assert from 'node:assert/strict';
import test from 'node:test';
import { searchDashboardBooks } from '../components/dashboard/dashboardSearchModel';

const books = [
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', coverImageUrl: '/atomic.jpg' },
  { id: 'clear-thinking', title: 'Clear Thinking', author: 'Shane Parrish', category: 'Psychology', coverImageUrl: '/clear.jpg' },
];

test('dashboard search ranks title prefix before author matches and caps results', () => {
  const results = searchDashboardBooks(books, 'clear', 5);
  assert.deepEqual(results.map(result => result.book.id), ['clear-thinking', 'atomic-habits']);
  assert.equal(searchDashboardBooks(books, '   ', 5).length, 0);
  assert.equal(searchDashboardBooks(books, 'clear', 1).length, 1);
});
