import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';

test('Never Split the Difference ships as a complete reader-ready catalog entry', async () => {
  const catalog = await loadBookCatalog();
  const book = catalog.find((entry) => entry.id === 'never-split-the-difference');

  assert.ok(book, 'the book must be discoverable through the published catalog');
  assert.equal(book.title, 'Never Split the Difference');
  assert.equal(book.author, 'Chris Voss');
  assert.equal(book.category, 'Business');
  assert.equal(book.publicationYear, 2016);
  assert.equal(book.pageCount, 288);
  assert.equal(book.isPremium, false);

  const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  assert.ok(words.length >= 2850 && words.length <= 3150, `expected about 3,000 words; received ${words.length}`);
  assert.ok(book.keyTakeaways.length >= 12 && book.keyTakeaways.length <= 15);

  assert.match(book.summary, /tactical empathy/i);
  assert.match(book.summary, /mirror/i);
  assert.match(book.summary, /label/i);
  assert.match(book.summary, /that's right/i);
  assert.match(book.summary, /calibrated questions/i);
  assert.match(book.summary, /Ackerman/i);
  assert.match(book.summary, /Black Swan/i);
  assert.match(book.summary, /limitations?|critique/i);

  assert.match(book.coverImageUrl, /^\/images\//);
  await access(path.join(process.cwd(), 'public', book.coverImageUrl));
});
