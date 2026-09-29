import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('dashboard embeds legacy challenge and trading pages without nested main landmarks', async () => {
  const app = await readFile('App.tsx', 'utf8');
  const challenge = await readFile('pages/ReadingChallengePage.tsx', 'utf8');
  const trading = await readFile('pages/TradingJournalPage.tsx', 'utf8');

  assert.match(app, /path="challenge" element=\{<ReadingChallengePage surface="dashboard" \/>\}/);
  assert.match(app, /path="trading" element=\{<TradingJournalPage surface="dashboard" \/>\}/);
  assert.match(challenge, /const PageElement = surface === 'dashboard' \? 'div' : 'main';/);
  assert.match(trading, /const PageElement = surface === 'dashboard' \? 'div' : 'main';/);
});

test('focused reader skip link uses logical inline-start positioning', async () => {
  const reader = await readFile('components/dashboard/FocusedReaderLayout.tsx', 'utf8');

  assert.match(reader, /start-3/);
  assert.doesNotMatch(reader, /left-3/);
});
