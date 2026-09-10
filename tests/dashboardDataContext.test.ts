import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard data contexts expose recoverable load errors', async () => {
  const favorites = await readFile('contexts/FavoritesContext.tsx', 'utf8');
  const challenge = await readFile('contexts/ReadingChallengeContext.tsx', 'utf8');
  assert.match(favorites, /error:\s*string\s*\|\s*null/);
  assert.match(favorites, /favorites:\s*legacyFavorites/);
  assert.match(favorites, /error:\s*"We couldn't load your saved books/);
  assert.match(favorites, /favorites:\s*mergedFavorites/);
  assert.match(favorites, /error:\s*null/);
  assert.match(challenge, /error:\s*string\s*\|\s*null/);
  assert.match(challenge, /challenge:\s*null,\s+loading:\s*false,\s+error:\s*'Unable to load your reading challenge/);
  assert.match(challenge, /challenge:\s*null,\s+loading:\s*true,\s+error:\s*null/);
  assert.match(challenge, /scopedStore\.isCurrent\(token\)/);
});
