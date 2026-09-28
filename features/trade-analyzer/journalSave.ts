import { Timestamp, doc, getDoc, runTransaction, type Firestore } from 'firebase/firestore';
import type { Trade } from '../../utils/tradingUtils';
import type { ClosedTradeRecord } from './types';
import { getSaveability, toJournalDocument } from './journalMapping';

export interface JournalWriter {
  read(uid: string, key: string): Promise<unknown | null>;
  createIfAbsent(uid: string, key: string, document: Omit<Trade, 'id'>): Promise<boolean>;
}

export const firestoreJournalWriter = (db: Firestore): JournalWriter => ({
  async read(uid, key) {
    const snapshot = await getDoc(doc(db, 'users', uid, 'trades', key));
    return snapshot.exists() ? snapshot.data() : null;
  },
  async createIfAbsent(uid, key, document) {
    const reference = doc(db, 'users', uid, 'trades', key);
    return runTransaction(db, async (transaction) => {
      const existing = await transaction.get(reference);
      if (existing.exists()) return false;
      transaction.set(reference, document);
      return true;
    });
  },
});

export async function makeImportKey(record: ClosedTradeRecord): Promise<string> {
  if (!getSaveability(record).saveable) throw new Error('Trade is not saveable');
  const identity = JSON.stringify([
    record.platform, record.accountHash ?? '', record.sourceId, record.symbol, record.direction,
    record.entryTime, record.exitTime, record.entryPrice, record.exitPrice, record.volume,
    record.grossPnl, record.commission, record.swap, record.fees, record.netPnl,
  ]);
  const bytes = new TextEncoder().encode(identity);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return `import_${Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, '0')).join('')}`;
}

export type SavePreview = { ready: number; existing: number; notSaveable: number; collisions: number };
export type SaveResult = { saved: number; existing: number; notSaveable: number };
export const MAX_JOURNAL_IMPORT_RECORDS = 1000;

function assertImportSize(records: ClosedTradeRecord[]): void {
  if (records.length > MAX_JOURNAL_IMPORT_RECORDS) {
    throw new Error(`Journal saving supports up to ${MAX_JOURNAL_IMPORT_RECORDS.toLocaleString()} trades per import. Analyze a shorter date range before saving.`);
  }
}

function isSameImport(value: unknown, key: string): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const source = (value as { importSource?: { key?: unknown } }).importSource;
  return source?.key === key;
}

export async function previewJournalSave(uid: string, records: ClosedTradeRecord[], currency: string, timezone: string, writer: JournalWriter): Promise<SavePreview> {
  assertImportSize(records);
  const preview = { ready: 0, existing: 0, notSaveable: 0, collisions: 0 };
  for (const record of records) {
    if (!getSaveability(record).saveable) { preview.notSaveable++; continue; }
    const key = await makeImportKey(record);
    try { toJournalDocument(record, key, currency, timezone, Timestamp.fromMillis(0)); }
    catch { preview.notSaveable++; continue; }
    const existing = await writer.read(uid, key);
    if (existing === null) preview.ready++;
    else if (isSameImport(existing, key)) preview.existing++;
    else preview.collisions++;
  }
  return preview;
}

export async function saveJournalTrades(uid: string, records: ClosedTradeRecord[], currency: string, timezone: string, writer: JournalWriter, now = Timestamp.now()): Promise<SaveResult> {
  assertImportSize(records);
  if (currency !== 'USD') throw new Error('The current journal is USD-only. Non-USD account histories cannot be saved without currency conversion.');
  const result = { saved: 0, existing: 0, notSaveable: 0 };
  for (const record of records) {
    if (!getSaveability(record).saveable) { result.notSaveable++; continue; }
    const key = await makeImportKey(record);
    let document: Omit<Trade, 'id'>;
    try { document = toJournalDocument(record, key, currency, timezone, now); }
    catch { result.notSaveable++; continue; }
    const prior = await writer.read(uid, key);
    if (prior !== null) {
      if (!isSameImport(prior, key)) throw new Error('Import ID collision: an unrelated journal entry uses this ID. No entry was overwritten.');
      result.existing++;
      continue;
    }
    const created = await writer.createIfAbsent(uid, key, document);
    if (created) result.saved++;
    else {
      const raced = await writer.read(uid, key);
      if (!isSameImport(raced, key)) throw new Error('Import ID collision: an unrelated journal entry uses this ID. No entry was overwritten.');
      result.existing++;
    }
  }
  return result;
}
