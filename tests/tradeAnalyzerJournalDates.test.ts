import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase/firestore';
import { getTradeResultTime, calculateCumulativePnL, type Trade } from '../utils/tradingUtils';
import { buildMonthlyTradingReportModel } from '../utils/tradingReportModel';
import { filterTradesByMonth } from '../utils/pdfReportGenerator';

test('imported result belongs to close month while manual result keeps entry date', () => {
  const entry = Timestamp.fromDate(new Date('2026-01-31T23:00:00Z'));
  const close = Timestamp.fromDate(new Date('2026-02-01T01:00:00Z'));
  const base: Trade = { id: 'imported', symbol: 'EURUSD', direction: 'LONG', entryDate: entry, entryPrice: 1,
    exitPrice: 2, stopLoss: null, lotSize: 1, pnl: 100, status: 'WIN', setup: '', emotions: '', notes: '', createdAt: entry,
    importSource: { platform: 'mt5', key: 'import_1', sourceId: '1', importedAt: entry, closeTime: close, currency: 'USD', grouping: 'position', grossPnl: 100, commission: 0, swap: 0, fees: 0 } };
  const manual: Trade = { ...base, id: 'manual', importSource: undefined };
  assert.equal(getTradeResultTime(base).toISOString(), '2026-02-01T01:00:00.000Z');
  assert.equal(getTradeResultTime(manual).toISOString(), '2026-01-31T23:00:00.000Z');
  assert.deepEqual(filterTradesByMonth([base, manual], 1, 2026).map((item) => item.id), ['imported']);
  const february = buildMonthlyTradingReportModel({ trades: [base, manual], startingBalance: 1000, month: 1, year: 2026 });
  assert.deepEqual(february.tradeRows.map((row) => row.id), ['imported']);
  assert.equal(february.openingBalance, 1100);
  assert.equal(february.closingBalance, 1200);
  assert.equal(calculateCumulativePnL([base, manual], 1000).at(-1)?.trade?.id, 'imported');
});
