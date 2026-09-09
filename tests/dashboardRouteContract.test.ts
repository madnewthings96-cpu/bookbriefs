import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const extractRouteBlock = (source: string, openingLine: string) => {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(line => line.includes(openingLine));
  assert.ok(start >= 0, `Expected route opening: ${openingLine}`);

  let depth = 0;
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('<Route ') && !line.endsWith('/>')) depth += 1;
    if (line.startsWith('</Route>')) {
      depth -= 1;
      if (depth === 0) return lines.slice(start, index + 1).join('\n');
    }
  }

  assert.fail(`Unbalanced route block for: ${openingLine}`);
};

test('App exposes every approved dashboard destination behind one protected branch', async () => {
  const source = await readFile('App.tsx', 'utf8');
  const protectedBlock = extractRouteBlock(source, '<Route element={<ProtectedRoute />}>');
  const dashboardBlock = extractRouteBlock(source, '<Route path="/dashboard" element={<DashboardLayout />}>');

  for (const path of ['discover', 'library', 'notes', 'challenge', 'downloads', 'calculators/*', 'finance', 'trading', 'settings', 'admin/feedback']) {
    assert.ok(dashboardBlock.includes(`path="${path}"`), `Expected /dashboard descendant: ${path}`);
  }

  assert.ok(protectedBlock.includes('<Route path="/dashboard" element={<DashboardLayout />}>'));
  assert.ok(protectedBlock.includes('path="/dashboard/summary/:bookId"'));
});
