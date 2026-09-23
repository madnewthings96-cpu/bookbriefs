import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';

test('Psycho-Cybernetics ships as a complete reader-ready catalog entry', async () => {
  const catalog = await loadBookCatalog();
  const book = catalog.find((entry) => entry.id === 'psycho-cybernetics');

  assert.ok(book, 'the book must be discoverable through the published catalog');
  assert.equal(book.title, 'Psycho-Cybernetics');
  assert.equal(book.author, 'Maxwell Maltz');
  assert.equal(book.category, 'Self-Help');
  assert.equal(book.publicationYear, 2015);
  assert.equal(book.pageCount, 336);
  assert.equal(book.isPremium, false);

  const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  assert.ok(
    words.length >= 2850 && words.length <= 3150,
    `summary must be approximately 3,000 words; received ${words.length}`,
  );
  assert.ok(book.keyTakeaways.length >= 12 && book.keyTakeaways.length <= 15);

  assert.match(book.summary, /self-image/i);
  assert.match(book.summary, /servo-mechanism/i);
  assert.match(book.summary, /mental rehearsal|visualization/i);
  assert.match(book.summary, /rational thinking/i);
  assert.match(book.summary, /relaxation/i);
  assert.match(book.summary, /success-type personality/i);
  assert.match(book.summary, /failure mechanism/i);
  assert.match(book.summary, /emotional scars/i);
  assert.match(book.summary, /winning feeling/i);
  assert.match(book.summary, /limitations?|critique/i);

  assert.match(book.coverImageUrl, /^\/images\//);
  await access(path.join(process.cwd(), 'public', book.coverImageUrl));
});
