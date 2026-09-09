import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardSearchActiveIndex, searchDashboardBooks } from '../components/dashboard/dashboardSearchModel';

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

test('dashboard search keeps catalog order for ties without mutating the catalog', () => {
  const catalog = [
    { id: 'second', title: 'Second Book', author: 'Author', category: 'Leadership', coverImageUrl: '/second.jpg' },
    { id: 'first', title: 'First Book', author: 'Author', category: 'Leadership', coverImageUrl: '/first.jpg' },
  ];
  const originalCatalog = structuredClone(catalog);

  assert.deepEqual(searchDashboardBooks(catalog, 'leadership').map(result => result.book.id), ['second', 'first']);
  assert.deepEqual(catalog, originalCatalog);
});

test('dashboard search ranks title content ahead of author and category matches for short queries', () => {
  const catalog = [
    { id: 'category', title: 'Markets', author: 'Ari', category: 'Learning', coverImageUrl: '/category.jpg' },
    { id: 'author', title: 'Markets', author: 'Learning Author', category: 'Finance', coverImageUrl: '/author.jpg' },
    { id: 'title', title: 'Deep Learning', author: 'Ada', category: 'Technology', coverImageUrl: '/title.jpg' },
  ];

  assert.deepEqual(searchDashboardBooks(catalog, 'earn').map(result => result.book.id), ['title', 'author', 'category']);
  const shortQueryCatalog = [
    { id: 'category-short', title: 'Book', author: 'Joe', category: 'Art', coverImageUrl: '/category-short.jpg' },
    { id: 'author-short', title: 'Book', author: 'Ada', category: 'Finance', coverImageUrl: '/author-short.jpg' },
    { id: 'title-contains-short', title: 'Coda', author: 'Joe', category: 'Finance', coverImageUrl: '/title-contains-short.jpg' },
    { id: 'title-prefix-short', title: 'Axiom', author: 'Joe', category: 'Finance', coverImageUrl: '/title-prefix-short.jpg' },
  ];

  assert.deepEqual(searchDashboardBooks(shortQueryCatalog, 'a', 2).map(result => result.book.id), ['title-prefix-short', 'title-contains-short']);
  assert.equal(searchDashboardBooks(shortQueryCatalog, 'a', 0).length, 0);
});

test('dashboard search keyboard index wraps at both result-list bounds', () => {
  assert.equal(getDashboardSearchActiveIndex(-1, 3, 'next'), 0);
  assert.equal(getDashboardSearchActiveIndex(2, 3, 'next'), 0);
  assert.equal(getDashboardSearchActiveIndex(0, 3, 'previous'), 2);
  assert.equal(getDashboardSearchActiveIndex(1, 3, 'previous'), 0);
  assert.equal(getDashboardSearchActiveIndex(-1, 0, 'next'), -1);
});
