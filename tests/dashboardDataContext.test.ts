import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard data contexts expose recoverable load errors', async () => {
  const favorites = await readFile('contexts/FavoritesContext.tsx', 'utf8');
  const challenge = await readFile('contexts/ReadingChallengeContext.tsx', 'utf8');
  assert.match(favorites, /error:\s*string\s*\|\s*null/);
  assert.match(favorites, /setFavorites\(legacyFavorites\);\s+setError\("We couldn't load your saved books/);
  assert.match(favorites, /setFavorites\(mergedFavorites\);\s+setError\(null\);/);
  assert.match(challenge, /error:\s*string\s*\|\s*null/);
  assert.match(challenge, /setChallenge\(null\);\s+setError\('Unable to load your reading challenge/);
  assert.match(challenge, /setError\(null\);\s+setLoading\(true\);/);
  assert.match(challenge, /setChallenge\(null\);\s+}\s+setError\(null\);/);
});
