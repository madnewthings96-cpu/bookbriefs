import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeTrades } from '../features/trade-analyzer/analyze';
import type { ClosedTradeRecord, ImportReport } from '../features/trade-analyzer/types';

function record(id: string, exitTime: string, netPnl: number, symbol = 'EURUSD'): ClosedTradeRecord {
  return {
    platform: 'ctrader', sourceId: id, symbol, direction: 'LONG', entryTime: '2026-02-01T09:00:00', exitTime,
    entryPrice: 1.1, exitPrice: 1.11, volume: 1, grossPnl: netPnl + 2,
    commission: -2, swap: 0, fees: 0, netPnl, grouping: 'position', provenance: { netPnl: 'Net (USD)' },
  };
}

function report(records: ClosedTradeRecord[]): ImportReport {
  return { platform: 'ctrader', format: 'csv', records, issues: [], excludedCount: 0, currency: 'USD', sourceTimezone: null, declaredNetPnl: null, reconciled: null };
}

test('analysis sorts by close time and uses broker net P&L', () => {
  const model = analyzeTrades({ report: report([record('win', '2026-02-01T11:00:00', 100), record('loss', '2026-02-01T10:00:00', -20)]), currency: 'USD', timezone: 'UTC', startingBalance: null });
  assert.deepEqual(model.curve.map((point) => point.cumulativePnl), [-20, 80]);
  assert.equal(model.metrics.netPnl, 80);
  assert.equal(model.metrics.profitFactor, 5);
  assert.equal(model.metrics.winRate, 50);
  assert.equal(model.metrics.expectancy, 40);
  assert.equal(model.metrics.balanceReturnPercent, null);
  assert.equal(model.metrics.maxDrawdownValue, 20);
});

test('starting balance enables realized balance curve and percentage drawdown', () => {
  const model = analyzeTrades({ report: report([record('win', '2026-02-01T10:00:00', 100), record('loss', '2026-02-01T11:00:00', -50)]), currency: 'USD', timezone: 'UTC', startingBalance: 1000 });
  assert.deepEqual(model.curve.map((point) => point.balance), [1100, 1050]);
  assert.equal(model.metrics.balanceReturnPercent, 5);
  assert.equal(model.metrics.maxDrawdownValue, 50);
  assert.ok(Math.abs((model.metrics.maxDrawdownPercent ?? 0) - 4.5454545) < 0.0001);
  assert.equal(model.quality.drawdownLabel, 'Closed-trade balance drawdown');
});

test('weekday and hour use source wall-clock values labeled with selected timezone', () => {
  const model = analyzeTrades({ report: report([record('late', '2026-02-01T23:30:00', 10)]), currency: 'USD', timezone: 'America/New_York', startingBalance: null });
  assert.equal(model.byWeekday[0].label, 'Sunday');
  assert.equal(model.byHour[0].label, '23:00');
  assert.equal(model.timezone, 'America/New_York');
  assert.equal(model.calendar[0].date, '2026-02-01');
});

test('weak samples do not become directional claims', () => {
  const small = analyzeTrades({ report: report([record('one', '2026-02-01T10:00:00', 10)]), currency: 'USD', timezone: 'UTC', startingBalance: null });
  assert.ok(small.observations.some((item) => /too few trades/i.test(item)));
  assert.ok(small.observations.every((item) => !/outperform/i.test(item)));
  assert.equal(small.metrics.profitFactor, null);
});

test('non-positive starting balance and invalid timezone do not produce invented returns', () => {
  const input = { report: report([record('one', '2026-02-01T10:00:00', 10)]), currency: 'USD', timezone: 'UTC', startingBalance: 0 };
  assert.equal(analyzeTrades(input).metrics.balanceReturnPercent, null);
  assert.throws(() => analyzeTrades({ ...input, timezone: 'not/a-zone' }), /timezone/i);
});
