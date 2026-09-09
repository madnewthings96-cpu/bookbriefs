import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard data contexts expose recoverable load errors', async () => {
  const favorites = await readFile('contexts/FavoritesContext.tsx', 'utf8');
  const challenge = await readFile('contexts/ReadingChallengeContext.tsx', 'utf8');
  assert.match(favorites, /error:\s*string\s*\|\s*null/);
  assert.match(favorites, /setError\(/);
  assert.match(challenge, /error:\s*string\s*\|\s*null/);
  assert.match(challenge, /setError\(/);
});
