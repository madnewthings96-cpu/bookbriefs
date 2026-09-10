import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEquityCurveStory } from '../components/trading/equityCurveModel';
import { filterEquityByTimeRange, type EquityPoint } from '../utils/tradingUtils';

const DAY = 24 * 60 * 60 * 1000;
const point = (timestamp: number, cumulativePnL: number, tradeNumber: number): EquityPoint => ({
  date: tradeNumber === 0 ? 'Start' : `Trade ${tradeNumber}`,
  timestamp,
  cumulativePnL,
  tradeNumber,
});

test('equity story aligns underwater drawdown and reports recovery from the worst trough', () => {
  const data = [
    point(0, 10_000, 0),
    point(1, 9_500, 1),
    point(2, 9_000, 2),
    point(3, 9_600, 3),
    point(4, 10_100, 4),
  ];
  const story = buildEquityCurveStory(data, 'ALL', new Date(10 * DAY));

  assert.deepEqual(story.points.map(item => item.drawdownDepth), [0, -5, -10, -4, 0]);
  assert.equal(story.peakEquity, 10_100);
  assert.equal(story.currentDrawdownPercent, 0);
  assert.equal(story.maxDrawdownPercent, 10);
  assert.equal(story.recoveryTrades, 2);
  assert.equal(story.recoveryLabel, '2 trades');
  assert.equal(story.insight, 'The account recovered from its largest drawdown in 2 trades.');
});

test('equity story identifies an active recovery without inventing a duration', () => {
  const story = buildEquityCurveStory([
    point(0, 10_000, 0),
    point(1, 10_200, 1),
    point(2, 9_900, 2),
  ], 'ALL', new Date(10 * DAY));

  assert.equal(story.currentDrawdownPercent, 2.94);
  assert.equal(story.maxDrawdownPercent, 2.94);
  assert.equal(story.recoveryTrades, null);
  assert.equal(story.recoveryLabel, 'In progress');
  assert.equal(story.insight, 'Equity is 2.94% below its latest peak; protect the recovery.');
});

test('time ranges preserve the point before the cutoff for chart continuity', () => {
  const now = new Date('2026-09-10T12:00:00Z');
  const data = [
    point(now.getTime() - 40 * DAY, 10_000, 0),
    point(now.getTime() - 10 * DAY, 10_100, 1),
    point(now.getTime() - 5 * DAY, 9_900, 2),
    point(now.getTime(), 10_200, 3),
  ];

  assert.deepEqual(
    filterEquityByTimeRange(data, '1W', now).map(item => item.tradeNumber),
    [1, 2, 3],
  );
});

test('a flat starting ledger reports an honest at-peak state', () => {
  const story = buildEquityCurveStory([point(0, 10_000, 0)], 'ALL');

  assert.equal(story.maxDrawdownPercent, 0);
  assert.equal(story.recoveryTrades, 0);
  assert.equal(story.recoveryLabel, 'At peak');
  assert.equal(story.insight, 'The account is at its equity high with no recorded drawdown.');
});

test('equity story keeps an unfinished worst trough when rounded drawdowns collide', () => {
  const story = buildEquityCurveStory([
    point(0, 100_000, 0),
    point(1, 89_996, 1),
    point(2, 100_000, 2),
    point(3, 110_000, 3),
    point(4, 98_994.61, 4),
  ], 'ALL');

  assert.equal(story.maxDrawdownPercent, 10);
  assert.equal(story.recoveryTrades, null);
  assert.equal(story.recoveryLabel, 'In progress');
  assert.equal(story.insight, 'Equity is 10.00% below its latest peak; protect the recovery.');
});

test('equity story does not treat a sub-display nonzero drawdown as at peak', () => {
  const story = buildEquityCurveStory([
    point(0, 100_000, 0),
    point(1, 99_999.999, 1),
  ], 'ALL');

  assert.equal(story.maxDrawdownPercent, 0);
  assert.equal(story.recoveryTrades, null);
  assert.equal(story.recoveryLabel, 'In progress');
  assert.equal(story.insight, 'Equity is 0.00% below its latest peak; protect the recovery.');
});
