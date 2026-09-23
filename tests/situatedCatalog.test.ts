import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';

test('Situated ships as a complete reader-ready catalog entry', async () => {
  const catalog = await loadBookCatalog();
  const book = catalog.find((entry) => entry.id === 'situated');

  assert.ok(book, 'the book must be discoverable through the published catalog');
  assert.equal(book.title, 'Situated');
  assert.equal(book.author, 'Angela Duckworth');
  assert.equal(book.category, 'Self-Help');
  assert.equal(book.publicationYear, 2026);
  assert.equal(book.pageCount, 352);
  assert.equal(book.isPremium, false);

  const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  assert.ok(
    words.length >= 2850 && words.length <= 3150,
    `summary must be approximately 3,000 words; received ${words.length}`,
  );
  assert.ok(book.keyTakeaways.length >= 12 && book.keyTakeaways.length <= 15);

  assert.match(book.summary, /situational agency/i);
  assert.match(book.summary, /space/i);
  assert.match(book.summary, /peers/i);
  assert.match(book.summary, /mentors/i);
  assert.match(book.summary, /culture/i);
  assert.match(book.summary, /willpower/i);
  assert.match(book.summary, /limitations?|critique/i);

  assert.match(book.coverImageUrl, /^\/images\//);
  await access(path.join(process.cwd(), 'public', book.coverImageUrl));
});
