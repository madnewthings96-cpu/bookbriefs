import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('trading journal exposes the fieldbook command surface and accessible navigation', async () => {
  const source = await readFile(new URL('../pages/TradingJournalPage.tsx', import.meta.url), 'utf8');

  assert.match(source, /trading-fieldbook/);
  assert.match(source, /fieldbook-command/);
  assert.match(source, /Performance inkline/);
  assert.match(source, /role="tablist"/);
  assert.match(source, /aria-selected=/);
  assert.match(source, /aria-controls=/);
});

test('fieldbook theme defines print-inspired surfaces and responsive behavior', async () => {
  let styles: string;
  try {
    styles = await readFile(new URL('../pages/TradingJournalPage.css', import.meta.url), 'utf8');
  } catch {
    assert.fail('TradingJournalPage.css must define the fieldbook visual system');
  }

  assert.match(styles, /--fieldbook-forest:\s*#102e24/i);
  assert.match(styles, /--fieldbook-paper:\s*#fffdf7/i);
  assert.match(styles, /@media\s*\(max-width:\s*767px\)/i);
  assert.match(styles, /prefers-reduced-motion/);
});

test('equity story preserves tooltip precision and disables chart motion', async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL('../components/trading/EquityCurve.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../pages/TradingJournalPage.css', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /const tooltipCurrencyFormatter = new Intl\.NumberFormat\('en-US', \{[\s\S]*minimumFractionDigits: 2,[\s\S]*maximumFractionDigits: 2,[\s\S]*\}\);/);
  assert.equal((source.match(/<Tooltip content=\{<CustomTooltip \/>} isAnimationActive=\{false\} \/>/g) || []).length, 2);
  assert.match(styles, /\.equity-story-metrics dd\.equity-story-loss\s*\{[^}]*color:\s*var\(--fieldbook-loss\)/s);
});
