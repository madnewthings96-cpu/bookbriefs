import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase/firestore';
import { getSaveability, sourceLocalToUtc, toJournalDocument } from '../features/trade-analyzer/journalMapping';
import type { ClosedTradeRecord } from '../features/trade-analyzer/types';

const complete: ClosedTradeRecord = {
  platform: 'ctrader', sourceId: 'position-42', accountHash: 'a1b2', symbol: 'EURUSD', direction: 'LONG',
  entryTime: '2026-02-01T09:00:00', exitTime: '2026-02-01T10:00:00',
  entryPrice: 1.1, exitPrice: 1.11, volume: 1, grossPnl: 52, commission: -2, swap: -1, fees: 0,
  netPnl: 49, grouping: 'position', provenance: { netPnl: 'Net (USD)' },
};

test('complete broker trade maps without inventing stop loss or recalculating P&L', () => {
  const mapped = toJournalDocument(complete, 'import_abc123', 'USD', 'UTC', Timestamp.fromMillis(1));
  assert.equal(mapped.pnl, 49);
  assert.equal(mapped.stopLoss, null);
  assert.equal(mapped.rr, undefined);
  assert.deepEqual([mapped.setup, mapped.emotions, mapped.notes], ['', '', '']);
  assert.equal(mapped.importSource?.currency, 'USD');
  assert.equal(mapped.importSource?.timezone, 'UTC');
  assert.equal(mapped.importSource?.grossPnl, 52);
  assert.equal(mapped.importSource?.commission, -2);
  assert.equal(mapped.importSource?.closeTime.toDate().toISOString(), '2026-02-01T10:00:00.000Z');
});

test('records without source ID or complete entry are not saveable', () => {
  assert.equal(getSaveability({ ...complete, sourceId: null }).saveable, false);
  assert.equal(getSaveability({ ...complete, entryTime: null }).saveable, false);
  assert.equal(getSaveability({ ...complete, entryPrice: null }).saveable, false);
  assert.equal(getSaveability({ ...complete, volume: 0 }).saveable, false);
});

test('source wall-clock time resolves using the selected broker timezone', () => {
  assert.equal(sourceLocalToUtc('2026-02-01T10:00:00', 'America/New_York').toISOString(), '2026-02-01T15:00:00.000Z');
  assert.equal(sourceLocalToUtc('2026-07-01T10:00:00', 'America/New_York').toISOString(), '2026-07-01T14:00:00.000Z');
  assert.throws(() => sourceLocalToUtc('2026-03-08T02:30:00', 'America/New_York'), /nonexistent|ambiguous/i);
});
