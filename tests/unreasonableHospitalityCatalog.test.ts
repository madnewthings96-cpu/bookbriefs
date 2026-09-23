import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';

test('Unreasonable Hospitality ships as a complete reader-ready catalog entry', async () => {
  const catalog = await loadBookCatalog();
  const book = catalog.find((entry) => entry.id === 'unreasonable-hospitality');

  assert.ok(book, 'the book must be discoverable through the published catalog');
  assert.equal(book.title, 'Unreasonable Hospitality');
  assert.equal(book.author, 'Will Guidara');
  assert.equal(book.category, 'Business');
  assert.equal(book.publicationYear, 2022);
  assert.equal(book.pageCount, 288);
  assert.equal(book.isPremium, false);

  const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
  assert.ok(words.length >= 2850 && words.length <= 3150, `expected about 3,000 words; received ${words.length}`);
  assert.ok(book.keyTakeaways.length >= 12 && book.keyTakeaways.length <= 15);

  assert.match(book.summary, /service.*hospitality|hospitality.*service/i);
  assert.match(book.summary, /95\s*\/\s*5/i);
  assert.match(book.summary, /one size fits one/i);
  assert.match(book.summary, /dreamweaver/i);
  assert.match(book.summary, /hot dog/i);
  assert.match(book.summary, /enlightened hospitality/i);
  assert.match(book.summary, /restaurant-smart/i);
  assert.match(book.summary, /feedback|criticism/i);
  assert.match(book.summary, /limitations?|critique/i);

  assert.match(book.coverImageUrl, /^\/images\//);
  await access(path.join(process.cwd(), 'public', book.coverImageUrl));
});
