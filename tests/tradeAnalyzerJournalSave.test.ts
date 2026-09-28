import assert from 'node:assert/strict';
import test from 'node:test';
import { Timestamp } from 'firebase/firestore';
import { makeImportKey, previewJournalSave, saveJournalTrades, type JournalWriter } from '../features/trade-analyzer/journalSave';
import type { ClosedTradeRecord } from '../features/trade-analyzer/types';

const trade: ClosedTradeRecord = {
  platform: 'ctrader', sourceId: 'position-42', symbol: 'EURUSD', direction: 'LONG',
  entryTime: '2026-02-01T09:00:00', exitTime: '2026-02-01T10:00:00', entryPrice: 1.1,
  exitPrice: 1.11, volume: 1, grossPnl: 52, commission: -2, swap: -1, fees: 0,
  netPnl: 49, grouping: 'position', provenance: {},
};

test('stable keys are scoped to platform, account, ID, and entry/exit time', async () => {
  const key = await makeImportKey(trade);
  assert.equal(key, await makeImportKey({ ...trade }));
  assert.notEqual(key, await makeImportKey({ ...trade, platform: 'mt5' }));
  assert.notEqual(key, await makeImportKey({ ...trade, accountHash: 'another-account' }));
  assert.notEqual(key, await makeImportKey({ ...trade, exitTime: '2026-02-01T11:00:00' }));
  assert.notEqual(key, await makeImportKey({ ...trade, symbol: 'GBPUSD' }));
  assert.notEqual(key, await makeImportKey({ ...trade, entryPrice: 1.2 }));
  assert.notEqual(key, await makeImportKey({ ...trade, netPnl: 50 }));
});

test('preview reads only; save creates once and retry skips existing import', async () => {
  const docs = new Map<string, any>();
  let writes = 0;
  const writer: JournalWriter = {
    read: async (_uid, key) => docs.get(key) ?? null,
    createIfAbsent: async (_uid, key, document) => {
      if (docs.has(key)) return false;
      docs.set(key, document);
      writes++;
      return true;
    },
  };
  const records = [trade, { ...trade, sourceId: null }];
  const preview = await previewJournalSave('user-1', records, 'USD', 'UTC', writer);
  assert.deepEqual({ ready: preview.ready, existing: preview.existing, notSaveable: preview.notSaveable }, { ready: 1, existing: 0, notSaveable: 1 });
  assert.equal(writes, 0);
  const first = await saveJournalTrades('user-1', records, 'USD', 'UTC', writer, Timestamp.fromMillis(1));
  assert.deepEqual({ saved: first.saved, existing: first.existing, notSaveable: first.notSaveable }, { saved: 1, existing: 0, notSaveable: 1 });
  const second = await saveJournalTrades('user-1', records, 'USD', 'UTC', writer, Timestamp.fromMillis(2));
  assert.equal(second.saved, 0);
  assert.equal(second.existing, 1);
  assert.equal(writes, 1);
  assert.equal([...docs.values()][0].pnl, 49);
});

test('same key occupied by an unrelated document is a collision, never overwritten', async () => {
  const writer: JournalWriter = {
    read: async () => ({ pnl: 999 }),
    createIfAbsent: async () => { throw new Error('should not write'); },
  };
  const result = await previewJournalSave('user-1', [trade], 'USD', 'UTC', writer);
  assert.equal(result.collisions, 1);
  await assert.rejects(() => saveJournalTrades('user-1', [trade], 'USD', 'UTC', writer, Timestamp.fromMillis(1)), /collision/i);
});

test('bad broker timestamps are excluded before any trade is written', async () => {
  let writes = 0;
  const writer: JournalWriter = { read: async () => null, createIfAbsent: async () => { writes++; return true; } };
  const records = [trade, { ...trade, sourceId: 'gap', exitTime: '2026-03-08T02:30:00' }];
  const preview = await previewJournalSave('user-1', records, 'USD', 'America/New_York', writer);
  assert.equal(preview.ready, 1);
  assert.equal(preview.notSaveable, 1);
  const saved = await saveJournalTrades('user-1', records, 'USD', 'America/New_York', writer, Timestamp.fromMillis(1));
  assert.equal(saved.saved, 1);
  assert.equal(saved.notSaveable, 1);
  assert.equal(writes, 1);
});

test('non-USD trades cannot be mixed into the dollar-denominated journal', async () => {
  let writes = 0;
  const writer: JournalWriter = { read: async () => null, createIfAbsent: async () => { writes++; return true; } };
  await assert.rejects(() => saveJournalTrades('user-1', [trade], 'EUR', 'UTC', writer), /USD|currency/i);
  assert.equal(writes, 0);
});

test('retry after a partial write creates only the remaining trade', async () => {
  const docs = new Map<string, any>();
  let failOnce = true;
  const writer: JournalWriter = {
    read: async (_uid, key) => docs.get(key) ?? null,
    createIfAbsent: async (_uid, key, document) => {
      if (document.importSource?.sourceId === 'position-43' && failOnce) { failOnce = false; throw new Error('temporary'); }
      if (docs.has(key)) return false;
      docs.set(key, document);
      return true;
    },
  };
  const records = [trade, { ...trade, sourceId: 'position-43' }];
  await assert.rejects(() => saveJournalTrades('user-1', records, 'USD', 'UTC', writer), /temporary/);
  assert.equal(docs.size, 1);
  const retry = await saveJournalTrades('user-1', records, 'USD', 'UTC', writer);
  assert.equal(retry.saved, 1);
  assert.equal(retry.existing, 1);
  assert.equal(docs.size, 2);
});
