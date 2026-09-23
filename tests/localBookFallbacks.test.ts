import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getLocalBookSummary,
  mergeBooksWithLocalFallbacks,
} from '../utils/localBookFallbacks';

test('Situated remains available when Firestore has not been synced yet', () => {
  const books = mergeBooksWithLocalFallbacks([]);
  const situated = books.find((book) => book.id === 'situated');

  assert.ok(situated);
  assert.equal(situated.title, 'Situated');
  assert.equal(situated.author, 'Angela Duckworth');
  assert.equal(situated.coverImageUrl, '/images/situated.jpg');

  const summary = getLocalBookSummary('situated', 'en');
  assert.ok(summary);
  assert.match(summary.summary, /situational agency/i);
  assert.equal(summary.keyTakeaways.length, 14);
});

test('Firestore data wins when it contains a local fallback book', () => {
  const books = mergeBooksWithLocalFallbacks([
    {
      id: 'situated',
      title: 'Situated — Firestore',
      author: 'Angela Duckworth',
      category: 'Self-Help',
      coverImageUrl: '/images/situated.jpg',
    },
  ]);

  assert.equal(books.find((book) => book.id === 'situated')?.title, 'Situated — Firestore');
});

test('the English-only fallback is not presented as an Arabic translation', () => {
  assert.equal(getLocalBookSummary('situated', 'ar'), null);
});
