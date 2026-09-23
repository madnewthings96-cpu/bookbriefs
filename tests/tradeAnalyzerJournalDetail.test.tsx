import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timestamp } from 'firebase/firestore';
import TradingReviewDrawer from '../components/trading/TradingReviewDrawer';
import type { Trade } from '../utils/tradingUtils';

test('imported journal detail identifies broker, close time, and unavailable stop loss', () => {
  const entry = Timestamp.fromDate(new Date('2026-02-01T09:00:00Z'));
  const close = Timestamp.fromDate(new Date('2026-02-01T10:00:00Z'));
  const trade: Trade = { id: 'import_1', symbol: 'EURUSD', direction: 'LONG', entryDate: entry,
    entryPrice: 1.1, exitPrice: 1.11, stopLoss: null, lotSize: 1, pnl: 49, status: 'WIN',
    setup: '', emotions: '', notes: '', createdAt: close,
    importSource: { platform: 'ctrader', key: 'import_1', sourceId: 'position-42', importedAt: close,
      closeTime: close, currency: 'USD', timezone: 'UTC', grouping: 'position', grossPnl: 52, commission: -2, swap: -1, fees: 0 },
  };
  const html = renderToStaticMarkup(<TradingReviewDrawer trade={trade} day={null} onClose={() => {}} onEdit={() => {}} onDelete={() => {}} onSelectTrade={() => {}} />);
  assert.match(html, /Not provided/);
  assert.match(html, /cTrader/);
  assert.match(html, /Close time/);
  assert.match(html, /Commission/);
});
