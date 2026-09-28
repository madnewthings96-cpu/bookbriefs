import assert from 'node:assert/strict';
import test from 'node:test';
import { importHistory, canAnalyze } from '../features/trade-analyzer/importHistory';

const ctrader = 'Deal ID,Symbol,Opening Direction,Closing Time,Net (USD)\n1,EURUSD,Buy,2026-02-01 10:00,42';

test('selected platform and file type must agree', async () => {
  const report = await importHistory({ platform: 'mt5', name: 'statement.csv', text: ctrader });
  assert.equal(canAnalyze(report), false);
  assert.equal(report.issues[0].code, 'unsupported_format');
});

test('valid closed records can be analyzed but mismatched totals cannot', async () => {
  const valid = await importHistory({ platform: 'ctrader', name: 'statement.csv', text: ctrader });
  assert.equal(canAnalyze(valid), true);
  assert.equal(canAnalyze({ ...valid, reconciled: false }), false);
  assert.equal(canAnalyze({ ...valid, records: [] }), false);
});

test('oversized paste is rejected before platform parsing', async () => {
  const report = await importHistory({ platform: 'ctrader', text: 'x'.repeat(5 * 1024 * 1024 + 1) });
  assert.equal(report.issues[0].code, 'too_large');
});
