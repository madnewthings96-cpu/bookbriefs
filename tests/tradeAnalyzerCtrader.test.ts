import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseCTraderHistory } from '../features/trade-analyzer/ctrader';

const fixture = () => readFile(new URL('./fixtures/trade-analyzer/ctrader-statement.csv', import.meta.url), 'utf8');

test('cTrader CSV groups partial closes and keeps broker net P&L', async () => {
  const report = await parseCTraderHistory(await fixture(), 'csv');
  assert.equal(report.records.length, 2);
  assert.deepEqual(report.records.map((record) => record.netPnl), [30, 5]);
  assert.deepEqual(report.records.map((record) => record.grouping), ['position', 'closure']);
  assert.equal(report.records[0].volume, 1);
  assert.equal(report.currency, 'USD');
});

test('cTrader paste accepts tabular History rows', async () => {
  const text = 'Deal ID\tSymbol\tOpening Direction\tOpening Time\tClosing Time\tEntry Price\tClosing Price\tClosing Quantity\tNet (USD)\n1\tEURUSD\tBuy\t2026-02-01 09:00\t2026-02-01 10:00\t1.10\t1.11\t1\t42';
  const report = await parseCTraderHistory(text, 'paste');
  assert.equal(report.records.length, 1);
  assert.equal(report.records[0].netPnl, 42);
  assert.equal(report.records[0].commission, null);
});

test('cTrader rejects unsupported headers and malformed dates', async () => {
  const missing = await parseCTraderHistory('Symbol,Profit\nEURUSD,10', 'csv');
  assert.equal(missing.records.length, 0);
  assert.match(missing.issues[0].message, /missing/i);
  const invalid = (await fixture()).replace('2026-02-02 10:00:00', 'not a date');
  const report = await parseCTraderHistory(invalid, 'csv');
  assert.equal(report.excludedCount, 1);
  assert.ok(report.issues.some((issue) => issue.code === 'invalid_date'));
});

test('cTrader semicolon CSV parses decimal-comma money without changing its value', async () => {
  const statement = 'Deal ID;Symbol;Opening Direction;Closing Time;Net (EUR)\n7;EURUSD;Buy;2026-02-03 10:00;1.234,50';
  const report = await parseCTraderHistory(statement, 'csv');
  assert.equal(report.records.length, 1);
  assert.equal(report.records[0].netPnl, 1234.5);
  assert.equal(report.currency, 'EUR');
});
