import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { loadBookCatalog, stripMarkdown } from '../scripts/seoCatalog';
import { getLocalBookSummary, mergeBooksWithLocalFallbacks } from '../utils/localBookFallbacks';

for (const [id, title, category] of [
  ['the-science-of-scaling', 'The Science of Scaling', 'Business'],
  ['secrets-for-profiting-in-bull-and-bear-markets', "Stan Weinstein's Secrets for Profiting in Bull and Bear Markets", 'Trading'],
] as const) {
  test(`${title} is available in the catalog and local reader`, async () => {
    const book = (await loadBookCatalog()).find((entry) => entry.id === id);
    assert.ok(book, 'catalog entry is missing');
    assert.equal(book.title, title);
    assert.equal(book.category, category);
    const words = stripMarkdown(book.summary).match(/[\p{L}\p{N}’'-]+/gu) ?? [];
    assert.ok(words.length >= 2850 && words.length <= 3150, `expected about 3000 words, got ${words.length}`);
    assert.equal(book.keyTakeaways.length, 14);
    await access(path.join(process.cwd(), 'public', book.coverImageUrl));
    assert.equal(mergeBooksWithLocalFallbacks([]).find((entry) => entry.id === id)?.title, title);
    assert.equal(getLocalBookSummary(id, 'en')?.summary, book.summary);
    assert.equal(getLocalBookSummary(id, 'ar'), null);
  });
}
