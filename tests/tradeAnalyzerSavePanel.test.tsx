import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { SaveToJournal } from '../components/trade-analyzer/SaveToJournal';
import type { ImportReport } from '../features/trade-analyzer/types';

const report: ImportReport = { platform: 'mt5', format: 'html', records: [], issues: [], excludedCount: 0, currency: 'USD', sourceTimezone: null, declaredNetPnl: null, reconciled: null };

test('signed-out saving is optional and explains what will be retained', () => {
  const html = renderToStaticMarkup(<StaticRouter location="/trade-analyzer"><SaveToJournal report={report} currency="USD" timezone="UTC" userId={null} /></StaticRouter>);
  assert.match(html, /Save to journal/);
  assert.match(html, /Sign in/);
  assert.match(html, /closed trades/);
  assert.match(html, /broker-reported net P&amp;L/);
  assert.doesNotMatch(html, /adsbygoogle/);
});

test('non-USD account history explains the journal currency limitation', () => {
  const html = renderToStaticMarkup(<StaticRouter location="/trade-analyzer"><SaveToJournal report={report} currency="EUR" timezone="UTC" userId={null} /></StaticRouter>);
  assert.match(html, /USD-only journal/);
  assert.doesNotMatch(html, /Sign in to save/);
});

test('signed-in saving waits for an explicit journal check', () => {
  const html = renderToStaticMarkup(<StaticRouter location="/trade-analyzer"><SaveToJournal report={report} currency="USD" timezone="UTC" userId="user-1" /></StaticRouter>);
  assert.match(html, /Check journal/);
  assert.doesNotMatch(html, /Checking your journal/);
  assert.doesNotMatch(html, /Save eligible trades/);
});
