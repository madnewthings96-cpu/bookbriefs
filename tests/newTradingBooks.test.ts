import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';
import { getLocalBookSummary, mergeBooksWithLocalFallbacks } from '../utils/localBookFallbacks';

for (const [id, title, author, year, pages] of [
  ['the-daily-trading-coach', 'The Daily Trading Coach', 'Brett Steenbarger', 2009, 368],
  ['think-and-trade-like-a-champion', 'Think & Trade Like a Champion', 'Mark Minervini', 2017, 256],
] as const) {
  test(`${title} is discoverable and readable before remote catalog sync`, async () => {
    const book = (await loadBookCatalog()).find((entry) => entry.id === id);
    assert.ok(book, 'catalog entry is missing');
    assert.equal(book.title, title);
    assert.equal(book.author, author);
    assert.equal(book.category, 'Trading');
    assert.equal(book.publicationYear, year);
    assert.equal(book.pageCount, pages);
    const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
    assert.ok(words.length >= 2850 && words.length <= 3150, `expected about 3000 words, got ${words.length}`);
    assert.equal(book.keyTakeaways.length, 14);
    await access(path.join(process.cwd(), 'public', book.coverImageUrl));
    assert.equal(mergeBooksWithLocalFallbacks([]).find((entry) => entry.id === id)?.title, title);
    assert.equal(getLocalBookSummary(id, 'en')?.summary, book.summary);
    assert.equal(getLocalBookSummary(id, 'ar'), null);
  });
}
