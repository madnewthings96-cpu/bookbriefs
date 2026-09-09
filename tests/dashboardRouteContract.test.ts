import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('App exposes every approved dashboard destination behind one protected branch', async () => {
  const source = await readFile('App.tsx', 'utf8');

  for (const path of ['discover', 'library', 'notes', 'challenge', 'downloads', 'calculators/*', 'finance', 'trading', 'settings', 'admin/feedback']) {
    assert.match(source, new RegExp(`path=["']${path.replace('*', '\\*')}["']`));
  }

  assert.match(source, /path=["']\/dashboard\/summary\/:bookId["']/);
  assert.match(source, /<Route element={<ProtectedRoute \/>}>/);
});
