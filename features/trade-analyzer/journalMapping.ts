import { Timestamp } from 'firebase/firestore';
import { getTradeStatus, type Trade } from '../../utils/tradingUtils';
import type { ClosedTradeRecord } from './types';

export function getSaveability(record: ClosedTradeRecord): { saveable: boolean; reason?: string } {
  if (!record.sourceId?.trim() || record.sourceId.length > 256) return { saveable: false, reason: 'Missing or oversized native trade ID' };
  if (!record.symbol.trim() || record.symbol.length > 32 || !record.entryTime || !record.exitTime) return { saveable: false, reason: 'Missing or oversized trade details' };
  if (record.accountHash && record.accountHash.length > 128) return { saveable: false, reason: 'Invalid account identity' };
  const sourceDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!sourceDate.test(record.entryTime) || !sourceDate.test(record.exitTime)) return { saveable: false, reason: 'Invalid trade date' };
  if (record.entryPrice === null || !Number.isFinite(record.entryPrice) || record.entryPrice <= 0 || Math.abs(record.entryPrice) > 1e12
    || record.exitPrice === null || !Number.isFinite(record.exitPrice) || record.exitPrice <= 0 || Math.abs(record.exitPrice) > 1e12) {
    return { saveable: false, reason: 'Missing or unreasonable prices' };
  }
  if (record.volume === null || !Number.isFinite(record.volume) || record.volume <= 0 || record.volume > 1e9 || !Number.isFinite(record.netPnl) || Math.abs(record.netPnl) > 1e15) {
    return { saveable: false, reason: 'Missing or unreasonable volume or result' };
  }
  const optionalMoney = [record.grossPnl, record.commission, record.swap, record.fees];
  if (optionalMoney.some((value) => value !== null && (!Number.isFinite(value) || Math.abs(value) > 1e15))) {
    return { saveable: false, reason: 'Unreasonable broker cost data' };
  }
  return { saveable: true };
}

function wallParts(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export function sourceLocalToUtc(value: string, timezone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) throw new Error('Invalid source date');
  const wall = Date.parse(`${value}Z`);
  if (!Number.isFinite(wall)) throw new Error('Invalid source date');
  // Sample offsets on either side of the date so DST gaps/repeats are detected.
  const offsets = new Set<number>();
  for (const hours of [-24, -12, 0, 12, 24]) {
    const sample = wall + hours * 3_600_000;
    const rendered = wallParts(new Date(sample), timezone);
    offsets.add(Date.parse(`${rendered}Z`) - sample);
  }
  const matches = [...offsets].map((offset) => new Date(wall - offset))
    .filter((candidate) => wallParts(candidate, timezone) === value);
  if (matches.length !== 1) throw new Error('Nonexistent or ambiguous source time in selected timezone');
  return matches[0];
}

export function toJournalDocument(record: ClosedTradeRecord, key: string, currency: string, timezone: string, now: Timestamp): Omit<Trade, 'id'> {
  const saveability = getSaveability(record);
  if (!saveability.saveable) throw new Error(saveability.reason);
  const entryDate = Timestamp.fromDate(sourceLocalToUtc(record.entryTime!, timezone));
  const closeTime = Timestamp.fromDate(sourceLocalToUtc(record.exitTime, timezone));
  return {
    symbol: record.symbol,
    direction: record.direction,
    entryDate,
    entryPrice: record.entryPrice!,
    exitPrice: record.exitPrice!,
    stopLoss: null,
    lotSize: record.volume!,
    pnl: record.netPnl,
    status: getTradeStatus(record.netPnl),
    setup: '', emotions: '', notes: '',
    createdAt: now,
    importSource: {
      platform: record.platform, key, sourceId: record.sourceId!, importedAt: now, closeTime,
      currency, timezone, grouping: record.grouping, grossPnl: record.grossPnl,
      commission: record.commission, swap: record.swap, fees: record.fees,
    },
  };
}
