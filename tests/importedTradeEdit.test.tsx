import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Timestamp } from 'firebase/firestore';
import AddTradeModal from '../components/trading/AddTradeModal';
import type { Trade } from '../utils/tradingUtils';

const importedTrade: Trade = {
  id: 'import_1', symbol: 'EURUSD', direction: 'LONG', entryDate: Timestamp.fromMillis(1),
  entryPrice: 1.1, exitPrice: 1.11, stopLoss: null, lotSize: 1, pnl: 10, status: 'WIN',
  setup: '', emotions: '', notes: '', createdAt: Timestamp.fromMillis(1),
  importSource: {
    platform: 'ctrader', key: 'import_1', sourceId: '7', importedAt: Timestamp.fromMillis(1),
    closeTime: Timestamp.fromMillis(2), currency: 'USD', timezone: 'UTC', grouping: 'closure',
    grossPnl: 12, commission: -2, swap: 0, fees: 0,
  },
};

test('an imported trade can be edited without inventing a stop loss', () => {
  const html = renderToStaticMarkup(<AddTradeModal isOpen onClose={() => {}} onSave={async () => {}} editingTrade={importedTrade} />);
  assert.match(html, /Stop Loss \(Optional for imported trades\)/);
  const stopLossInput = html.match(/<input[^>]*placeholder="Stop Loss"[^>]*>/)?.[0] ?? '';
  assert.ok(stopLossInput);
  assert.doesNotMatch(stopLossInput, /required/);
});
