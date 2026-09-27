import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Dashboard } from '../components/trade-analyzer/Dashboard';
import { analyzeTrades } from '../features/trade-analyzer/analyze';
import type { ImportReport } from '../features/trade-analyzer/types';

const report: ImportReport = {
  platform: 'ctrader', format: 'csv', currency: 'USD', sourceTimezone: null,
  declaredNetPnl: null, reconciled: null, excludedCount: 1,
  issues: [{ code: 'invalid_date', message: 'One invalid date', row: 3 }],
  records: [{ platform: 'ctrader', sourceId: '1', symbol: 'EURUSD', direction: 'LONG',
    entryTime: '2026-02-01T09:00:00', exitTime: '2026-02-01T10:00:00', entryPrice: 1.1,
    exitPrice: 1.11, volume: 1, grossPnl: 12, commission: -2, swap: 0, fees: null,
    netPnl: 10, grouping: 'closure', provenance: { netPnl: 'Net (USD)' } }],
};

test('dashboard explains unavailable metrics and shows parser quality without ads', () => {
  const model = analyzeTrades({ report, currency: 'USD', timezone: 'UTC', startingBalance: null });
  const html = renderToStaticMarkup(<Dashboard model={model} report={report} onStartOver={() => {}} />);
  assert.match(html, /10\.00/);
  assert.match(html, /Profit factor/);
  assert.match(html, /Not available/);
  assert.match(html, /Closed-trade P&amp;L drawdown/);
  assert.match(html, /1 excluded/);
  assert.match(html, /Closure-level/);
  assert.match(html, /UTC/);
  assert.match(html, /Print review/);
  assert.doesNotMatch(html, /adsbygoogle|Advertisements/);
});

test('dashboard has text and table alternatives for visual breakdowns', () => {
  const model = analyzeTrades({ report, currency: 'USD', timezone: 'UTC', startingBalance: 1000 });
  const html = renderToStaticMarkup(<Dashboard model={model} report={report} onStartOver={() => {}} />);
  assert.match(html, /Closed-trade balance drawdown/);
  assert.match(html, /Cumulative realised P&amp;L/);
  assert.match(html, /<table/);
  assert.match(html, /By symbol/);
  assert.match(html, /By weekday/);
  assert.match(html, /EURUSD/);
  assert.match(html, /across 1 trade(?:&quot;|")/);
});
