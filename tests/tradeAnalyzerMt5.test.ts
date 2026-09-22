import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseMt5History } from '../features/trade-analyzer/mt5';

const fixture = () => readFile(new URL('./fixtures/trade-analyzer/mt5-deals.html', import.meta.url), 'utf8');

test('MT5 HTML groups closed deals by position and excludes balance operations', async () => {
  const report = await parseMt5History(await fixture(), 'html');
  assert.equal(report.records.length, 2);
  assert.deepEqual(report.records.map((record) => record.sourceId), ['100', '200']);
  assert.deepEqual(report.records.map((record) => record.netPnl), [48, 48]);
  assert.deepEqual(report.records.map((record) => record.grouping), ['position', 'position']);
  assert.equal(report.records[1].volume, 1);
  assert.equal(report.excludedCount, 1);
  assert.equal(report.reconciled, true);
  assert.equal(report.currency, 'USD');
});

test('MT5 pasted history without native IDs is honestly closure-level', async () => {
  const report = await parseMt5History('Time\tSymbol\tType\tDirection\tVolume\tPrice\tProfit\tCommission\tSwap\tFee\n2026.02.01 10:00:00\tEURUSD\tsell\tout\t1\t1.1050\t51\t-1\t-1\t0', 'paste');
  assert.equal(report.records.length, 1);
  assert.equal(report.records[0].grouping, 'closure');
  assert.equal(report.records[0].netPnl, 49);
  assert.equal(report.records[0].entryTime, null);
});

test('MT5 rejects unsupported headers instead of guessing', async () => {
  const report = await parseMt5History('Time\tSymbol\tProfit\n2026.02.01\tEURUSD\t10', 'paste');
  assert.equal(report.records.length, 0);
  assert.match(report.issues[0].message, /missing/i);
});

test('MT5 weights multiple entry fills and blocks unreconciled totals', async () => {
  const text = (await fixture())
    .replace('<tr><td>2026.02.01 09:00:00</td><td>1</td><td>EURUSD</td><td>buy</td><td>in</td><td>1.00</td><td>1.1000</td>', '<tr><td>2026.02.01 09:00:00</td><td>1</td><td>EURUSD</td><td>buy</td><td>in</td><td>0.50</td><td>1.1000</td>')
    .replace('<tr><td>2026.02.01 10:00:00</td>', '<tr><td>2026.02.01 09:30:00</td><td>7</td><td>EURUSD</td><td>buy</td><td>in</td><td>0.50</td><td>1.2000</td><td>100</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n<tr><td>2026.02.01 10:00:00</td>')
    .replace('Closed P/L: 96.00', 'Closed P/L: 97.00');
  const report = await parseMt5History(text, 'html');
  assert.equal(report.records[0].entryPrice, 1.15);
  assert.equal(report.reconciled, false);
  assert.ok(report.issues.some((issue) => issue.code === 'pnl_mismatch'));
});
