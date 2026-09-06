import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase/firestore';
import type { Trade } from '../utils/tradingUtils';

function trade(
  id: string,
  date: string,
  pnl: number,
  overrides: Partial<Trade> = {},
): Trade {
  const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BE';
  const timestamp = Timestamp.fromDate(new Date(`${date}T12:00:00Z`));

  return {
    id,
    symbol: 'EURUSD',
    direction: 'LONG',
    entryDate: timestamp,
    entryPrice: 1.1,
    exitPrice: 1.11,
    stopLoss: 1.09,
    lotSize: 1,
    pnl,
    rr: pnl > 0 ? 2 : pnl < 0 ? -1 : 0,
    status,
    setup: pnl > 0 ? 'Breakout' : 'Pullback',
    emotions: pnl > 0 ? 'Disciplined' : 'FOMO',
    notes: '',
    createdAt: timestamp,
    ...overrides,
  };
}

test('monthly report derives historical opening and closing balances from the complete ledger', async () => {
  let reportModule: typeof import('../utils/tradingReportModel');

  try {
    reportModule = await import('../utils/tradingReportModel');
  } catch {
    assert.fail('the monthly trading report model must exist');
  }

  const model = reportModule.buildMonthlyTradingReportModel({
    trades: [
      trade('jan', '2026-01-20', 200),
      trade('feb-win', '2026-02-04', 100),
      trade('feb-loss', '2026-02-19', -50),
      trade('mar', '2026-03-02', 300),
    ],
    startingBalance: 10_000,
    month: 1,
    year: 2026,
  });

  assert.equal(model.periodLabel, 'February 2026');
  assert.equal(model.openingBalance, 10_200);
  assert.equal(model.closingBalance, 10_250);
  assert.equal(model.returnAmount, 50);
  assert.equal(model.returnPercent, 0.49);
  assert.deepEqual(model.tradeRows.map((row) => row.id), ['feb-loss', 'feb-win']);
  assert.deepEqual(model.equityCurve.map((point) => point.balance), [10_200, 10_300, 10_250]);
});

test('monthly report surfaces repeatable setup and psychology signals', async () => {
  const { buildMonthlyTradingReportModel } = await import('../utils/tradingReportModel');

  const model = buildMonthlyTradingReportModel({
    trades: [
      trade('win-one', '2026-02-04', 120),
      trade('win-two', '2026-02-07', 80),
      trade('loss-one', '2026-02-19', -50),
    ],
    startingBalance: 10_000,
    month: 1,
    year: 2026,
  });

  assert.equal(model.stats.totalPnL, 150);
  assert.equal(model.stats.winRate, 66.7);
  assert.equal(model.highlights.bestSetup?.label, 'Breakout');
  assert.equal(model.highlights.bestSetup?.totalPnL, 200);
  assert.equal(model.highlights.costliestEmotion?.label, 'FOMO');
  assert.equal(model.highlights.costliestEmotion?.totalPnL, -50);
});

test('empty report month carries the prior balance forward without inventing performance', async () => {
  const { buildMonthlyTradingReportModel, getTradingReportFilename } = await import('../utils/tradingReportModel');

  const model = buildMonthlyTradingReportModel({
    trades: [trade('jan', '2026-01-20', 200)],
    startingBalance: 10_000,
    month: 1,
    year: 2026,
  });

  assert.equal(model.openingBalance, 10_200);
  assert.equal(model.closingBalance, 10_200);
  assert.equal(model.returnAmount, 0);
  assert.equal(model.returnPercent, 0);
  assert.deepEqual(model.tradeRows, []);
  assert.deepEqual(model.equityCurve.map((point) => point.balance), [10_200]);
  assert.equal(getTradingReportFilename(1, 2026), 'Ta7leel_Trading_Fieldbook_2026-02.pdf');
});

test('date-only trades remain in their UTC calendar month west of Greenwich', async () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';

  try {
    const { buildMonthlyTradingReportModel } = await import('../utils/tradingReportModel');
    const { filterTradesByMonth, getAvailableMonths } = await import('../utils/pdfReportGenerator');
    const edgeTimestamp = Timestamp.fromMillis(Date.UTC(2026, 1, 1));
    const firstOfFebruary = trade('month-edge', '2026-02-01', 100, {
      entryDate: edgeTimestamp,
      createdAt: edgeTimestamp,
    });
    const model = buildMonthlyTradingReportModel({
      trades: [firstOfFebruary],
      startingBalance: 10_000,
      month: 1,
      year: 2026,
    });

    assert.equal(model.openingBalance, 10_000);
    assert.equal(model.returnAmount, 100);
    assert.deepEqual(model.tradeRows.map((row) => row.id), ['month-edge']);
    assert.deepEqual(filterTradesByMonth([firstOfFebruary], 1, 2026).map((item) => item.id), ['month-edge']);
    assert.equal(getAvailableMonths([firstOfFebruary])[0]?.label, 'February 2026');
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test('report insights only claim a repeatable edge or costly emotion when polarity supports it', async () => {
  const { buildMonthlyTradingReportModel } = await import('../utils/tradingReportModel');
  const profitableOnly = buildMonthlyTradingReportModel({
    trades: [trade('positive', '2026-02-03', 50, { emotions: 'Patient' })],
    startingBalance: 10_000,
    month: 1,
    year: 2026,
  });
  const losingOnly = buildMonthlyTradingReportModel({
    trades: [trade('negative', '2026-02-03', -50, { setup: 'Breakout' })],
    startingBalance: 10_000,
    month: 1,
    year: 2026,
  });

  assert.equal(profitableOnly.highlights.costliestEmotion, null);
  assert.equal(losingOnly.highlights.bestSetup, null);
});
