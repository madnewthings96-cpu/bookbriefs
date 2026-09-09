import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const searchPath = 'components/dashboard/DashboardSearch.tsx';

test('dashboard search gives the listbox direct option children and keeps empty status outside it', async () => {
  const search = await readFile(searchPath, 'utf8');

  assert.match(search, /\{isOpen && hasQuery && \(\s*<ul/);
  assert.match(search, /<ul[^>]*role="listbox"[^>]*>\s*\{results\.map\(/);
  assert.match(search, /<li\s+key=\{result\.book\.id\}\s+id=\{`dashboard-search-result-\$\{index\}`\}\s+role="option"/);
  assert.doesNotMatch(search, /<li key=\{result\.book\.id\}>\s*<button/);
  assert.match(search, /\{isOpen && hasQuery && !results\.length && \(\s*<p[^>]*role="status"/);
});

test('dashboard search contracts retain keyboard navigation, route reset, outside closure, and coherent ARIA', async () => {
  const search = await readFile(searchPath, 'utf8');

  assert.match(search, /role="combobox"/);
  assert.match(search, /aria-expanded=\{isOpen && hasQuery\}/);
  assert.match(search, /aria-controls=\{RESULTS_ID\}/);
  assert.match(search, /aria-activedescendant=\{activeIndex >= 0 && activeIndex < results\.length/);
  assert.match(search, /event\.key === 'ArrowDown'[\s\S]*getDashboardSearchActiveIndex\(index, results\.length, 'next'\)/);
  assert.match(search, /event\.key === 'ArrowUp'[\s\S]*getDashboardSearchActiveIndex\(index, results\.length, 'previous'\)/);
  assert.match(search, /event\.key === 'Enter' && activeIndex >= 0[\s\S]*selectResult\(activeIndex\)/);
  assert.match(search, /event\.key === 'Escape'[\s\S]*clear\(\)/);
  assert.match(search, /document\.addEventListener\('pointerdown', closeOnOutsidePointer\)/);
  assert.match(search, /useEffect\(\(\) => \{\s*clear\(\);\s*\}, \[location\.key\]\)/);
  assert.match(search, /navigate\(`\/dashboard\/summary\/\$\{result\.book\.arabicSlug \|\| result\.book\.id\}`\)/);
});
