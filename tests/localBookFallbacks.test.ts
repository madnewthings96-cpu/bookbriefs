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

test('Psycho-Cybernetics is available before Firestore is synced', () => {
  const books = mergeBooksWithLocalFallbacks([]);
  const book = books.find((entry) => entry.id === 'psycho-cybernetics');

  assert.ok(book);
  assert.equal(book.author, 'Maxwell Maltz');

  const summary = getLocalBookSummary('psycho-cybernetics', 'en');
  assert.ok(summary);
  assert.match(summary.summary, /self-image/i);
  assert.ok(summary.keyTakeaways.length >= 12);
  assert.equal(getLocalBookSummary('psycho-cybernetics', 'ar'), null);
});

test('Die With Zero and Never Split the Difference are available before Firestore sync', () => {
  const books = mergeBooksWithLocalFallbacks([]);

  assert.equal(books.find((book) => book.id === 'die-with-zero')?.author, 'Bill Perkins');
  assert.equal(books.find((book) => book.id === 'never-split-the-difference')?.author, 'Chris Voss');

  const dieWithZero = getLocalBookSummary('die-with-zero', 'en');
  const neverSplit = getLocalBookSummary('never-split-the-difference', 'en');
  assert.match(dieWithZero?.summary ?? '', /memory dividends/i);
  assert.match(neverSplit?.summary ?? '', /tactical empathy/i);
  assert.equal(getLocalBookSummary('die-with-zero', 'ar'), null);
  assert.equal(getLocalBookSummary('never-split-the-difference', 'ar'), null);
});
