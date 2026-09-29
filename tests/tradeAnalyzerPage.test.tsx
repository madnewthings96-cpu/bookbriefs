import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImportPanel } from '../components/trade-analyzer/ImportPanel';
import { VerifyPanel } from '../components/trade-analyzer/VerifyPanel';
import { readTradeAnalyzerAdSenseConfig } from '../components/AdSenseSlot';
import { StaticRouter } from 'react-router-dom/server';
import TradeAnalyzerPage from '../pages/TradeAnalyzerPage';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import type { ImportReport } from '../features/trade-analyzer/types';

const report: ImportReport = {
  platform: 'ctrader', format: 'csv', currency: 'USD', sourceTimezone: null,
  declaredNetPnl: null, reconciled: null, excludedCount: 1,
  issues: [{ code: 'invalid_date', message: 'One row has an invalid date.', row: 3 }],
  records: [{ platform: 'ctrader', sourceId: '1', symbol: 'EURUSD', direction: 'LONG',
    entryTime: '2026-02-01T09:00:00', exitTime: '2026-02-01T10:00:00', entryPrice: 1.1,
    exitPrice: 1.11, volume: 1, grossPnl: 12, commission: -2, swap: 0, fees: null,
    netPnl: 10, grouping: 'closure', provenance: { netPnl: 'Net (USD)' } }],
};

test('import form offers labeled platform, file, and paste controls', () => {
  const html = renderToStaticMarkup(<ImportPanel platform="mt5" busy={false} error={null} onPlatformChange={() => {}} onSubmit={() => {}} />);
  assert.match(html, /Upload history/);
  assert.match(html, /MT5/);
  assert.match(html, /cTrader/);
  assert.match(html, /type="file"/);
  assert.match(html, /textarea/);
  assert.match(html, /Paste history/);
});

test('verification exposes exclusions, broker net, timezone, and preview before analysis', () => {
  const html = renderToStaticMarkup(<VerifyPanel report={report} currency="USD" timezone="" startingBalance="" onCurrencyChange={() => {}} onTimezoneChange={() => {}} onStartingBalanceChange={() => {}} onBack={() => {}} onAnalyze={() => {}} />);
  assert.match(html, /1 closed trade/);
  assert.match(html, /1 excluded row/);
  assert.match(html, /10\.00/);
  assert.match(html, /One row has an invalid date/);
  assert.match(html, /Source timezone/);
  assert.match(html, /EURUSD/);
  assert.doesNotMatch(html, /adsbygoogle/);
});

test('analyzer ad uses a dedicated slot only when both IDs are configured', () => {
  assert.deepEqual(readTradeAnalyzerAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1' }), { client: '', slot: '' });
  assert.deepEqual(readTradeAnalyzerAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1', VITE_ADSENSE_TRADE_ANALYZER_SLOT_ID: '123' }), { client: 'ca-pub-1', slot: '123' });
});

test('public landing page has the import step and one labeled ad rail', () => {
  const html = renderToStaticMarkup(<StaticRouter location="/trade-analyzer"><FirebaseProvider><TradeAnalyzerPage /></FirebaseProvider></StaticRouter>);
  assert.match(html, /Trade Analyzer/);
  assert.match(html, /Import closed trades/);
  assert.equal((html.match(/aria-label="Advertisements"/g) ?? []).length, 1);
});

test('dashboard analyzer embeds the import workflow without a nested main or public account prompt', () => {
  const html = renderToStaticMarkup(<StaticRouter location="/dashboard/trade-analyzer"><FirebaseProvider><TradeAnalyzerPage surface="dashboard" /></FirebaseProvider></StaticRouter>);
  assert.match(html, /data-surface="dashboard"/);
  assert.match(html, /Import closed trades/);
  assert.doesNotMatch(html, /<main|creating an account/);
});
