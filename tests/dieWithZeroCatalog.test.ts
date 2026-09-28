import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';

test('Die With Zero ships as a complete reader-ready catalog entry', async () => {
  const catalog = await loadBookCatalog();
  const book = catalog.find((entry) => entry.id === 'die-with-zero');

  assert.ok(book, 'the book must be discoverable through the published catalog');
  assert.equal(book.title, 'Die With Zero');
  assert.equal(book.author, 'Bill Perkins');
  assert.equal(book.category, 'Finance');
  assert.equal(book.publicationYear, 2020);
  assert.equal(book.pageCount, 240);
  assert.equal(book.isPremium, false);

  const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  assert.ok(words.length >= 2850 && words.length <= 3150, `expected about 3,000 words; received ${words.length}`);
  assert.ok(book.keyTakeaways.length >= 12 && book.keyTakeaways.length <= 15);

  assert.match(book.summary, /memory dividends/i);
  assert.match(book.summary, /time buckets/i);
  assert.match(book.summary, /health.*time.*money|money.*time.*health/i);
  assert.match(book.summary, /inheritance|children/i);
  assert.match(book.summary, /annuit/i);
  assert.match(book.summary, /autopilot/i);
  assert.match(book.summary, /limitations?|critique/i);

  assert.match(book.coverImageUrl, /^\/images\//);
  await access(path.join(process.cwd(), 'public', book.coverImageUrl));
});
