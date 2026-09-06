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
