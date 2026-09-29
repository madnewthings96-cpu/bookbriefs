import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeDashboardCalculatorPath } from '../pages/CalculatorsPage';

test('dashboard calculator aliases normalize mixed-case paths before route selection', () => {
  assert.equal(
    normalizeDashboardCalculatorPath('/DASHBOARD/CALCULATORS/PIP-VALUE/'),
    '/calculators/pip-value',
  );
  assert.equal(
    normalizeDashboardCalculatorPath('/DaShBoArD/CaLcUlAtOrS/FiRe'),
    '/calculators/fire',
  );
});

test('dashboard calculator FAQ summaries have a 44px disclosure target', async () => {
  const page = await readFile('pages/CalculatorsPage.tsx', 'utf8');
  const shell = await readFile('components/dashboard/DashboardShell.css', 'utf8');

  assert.match(page, /<details key=\{faq\.question\} className="group p-5">\s*<summary className=/);
  assert.match(shell, /\.dashboard-shell\s+:is\(button, a, input, select, textarea, summary\)[^{]*\{[^}]*min-block-size:\s*44px[^}]*min-inline-size:\s*44px/s);
  assert.match(shell, /\.dashboard-shell\s+:focus-visible\s*\{[^}]*outline:/);
});
