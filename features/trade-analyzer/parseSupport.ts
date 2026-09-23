import { parseDelimited, parseMoney } from './delimited';
import type { ClosedTradeRecord, ImportIssue, ImportReport, ImportPlatform, ImportFormat } from './types';

export const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.:]/g, '');

export function findHeader(headers: string[], names: string[]): number {
  const normalized = headers.map(normalizeHeader);
  return normalized.findIndex((header) => names.some((name) => header === normalizeHeader(name)));
}

export function valueAt(row: string[], headers: string[], names: string[]): string {
  const index = findHeader(headers, names);
  return index < 0 ? '' : row[index]?.trim() ?? '';
}

export function moneyAt(row: string[], headers: string[], names: string[], decimal: '.' | ','): number | null {
  return parseMoney(valueAt(row, headers, names), decimal);
}

export function normalizeDate(value: string): string | null {
  const raw = value.trim();
  const iso = /^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(raw);
  const dayFirst = /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  let parts: number[];
  if (iso) parts = [Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4]), Number(iso[5]), Number(iso[6] ?? 0)];
  else if (dayFirst && Number(dayFirst[1]) > 12) parts = [Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1]), Number(dayFirst[4]), Number(dayFirst[5]), Number(dayFirst[6] ?? 0)];
  else return null;
  const [year, month, day, hour, minute, second] = parts;
  const checked = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (checked.getUTCFullYear() !== year || checked.getUTCMonth() !== month - 1 || checked.getUTCDate() !== day || checked.getUTCHours() !== hour || checked.getUTCMinutes() !== minute || checked.getUTCSeconds() !== second) return null;
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

export async function hashAccountIdentifier(text: string): Promise<string | undefined> {
  const match = /\b(?:account(?:\s+(?:number|no))?|login)\s*[:#]\s*(\d{4,})\b/i.exec(text);
  if (!match || !globalThis.crypto?.subtle) return undefined;
  const bytes = new TextEncoder().encode(match[1]);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createReport(platform: ImportPlatform, format: ImportFormat): ImportReport {
  return { platform, format, records: [], issues: [], excludedCount: 0, currency: null, sourceTimezone: null, declaredNetPnl: null, reconciled: null };
}

export function rejectRow(report: ImportReport, code: string, message: string, row: number): void {
  report.excludedCount += 1;
  report.issues.push({ code, message, row });
}

export function reconcile(report: ImportReport): void {
  if (report.declaredNetPnl === null) return;
  const sum = report.records.reduce((total, record) => total + record.netPnl, 0);
  report.reconciled = Math.abs(sum - report.declaredNetPnl) <= 0.01;
  if (!report.reconciled) report.issues.push({ code: 'pnl_mismatch', message: 'Imported net P&L does not match the statement total.' });
}

export function combinePosition(records: ClosedTradeRecord[], sourceId: string): ClosedTradeRecord {
  const ordered = [...records].sort((a, b) => a.exitTime.localeCompare(b.exitTime));
  const first = ordered[0];
  const weighted = (key: 'entryPrice' | 'exitPrice'): number | null => {
    const usable = records.filter((record) => record[key] !== null && record.volume !== null);
    const volume = usable.reduce((sum, record) => sum + (record.volume ?? 0), 0);
    return volume > 0 ? usable.reduce((sum, record) => sum + (record[key] ?? 0) * (record.volume ?? 0), 0) / volume : null;
  };
  const sumNullable = (key: 'grossPnl' | 'commission' | 'swap' | 'fees'): number | null =>
    records.every((record) => record[key] !== null) ? records.reduce((sum, record) => sum + (record[key] ?? 0), 0) : null;
  return {
    ...first,
    sourceId,
    entryTime: records.map((record) => record.entryTime).filter((time): time is string => Boolean(time)).sort()[0] ?? null,
    exitTime: ordered.at(-1)?.exitTime ?? first.exitTime,
    entryPrice: weighted('entryPrice'),
    exitPrice: weighted('exitPrice'),
    volume: records.every((record) => record.volume !== null) ? records.reduce((sum, record) => sum + (record.volume ?? 0), 0) : null,
    grossPnl: sumNullable('grossPnl'), commission: sumNullable('commission'), swap: sumNullable('swap'), fees: sumNullable('fees'),
    netPnl: records.reduce((sum, record) => sum + record.netPnl, 0),
    grouping: 'position',
  };
}

export function parseTextRows(text: string, format: 'csv' | 'paste'): string[][] {
  const first = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0];
  const delimiter = format === 'paste' ? '\t' : first.includes(';') && !first.includes(',') ? ';' : ',';
  return parseDelimited(text, delimiter);
}

export function missingColumns(headers: string[], requirements: string[][]): string[] {
  return requirements.filter((aliases) => findHeader(headers, aliases) < 0).map((aliases) => aliases[0]);
}

export function appendMissingIssue(issues: ImportIssue[], missing: string[]): void {
  if (missing.length) issues.push({ code: 'missing_columns', message: `Missing required columns: ${missing.join(', ')}` });
}
