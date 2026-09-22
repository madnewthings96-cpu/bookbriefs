import { appendMissingIssue, combinePosition, createReport, hashAccountIdentifier, missingColumns, moneyAt, normalizeDate, parseTextRows, reconcile, rejectRow, valueAt } from './parseSupport';
import type { ClosedTradeRecord, ImportReport } from './types';

const decodeHtml = (value: string): string => value
  .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));

function htmlDealsRows(text: string): string[][] {
  if (typeof DOMParser !== 'undefined') {
    const document = new DOMParser().parseFromString(text, 'text/html');
    const tables = Array.from(document.querySelectorAll('table'));
    const table = tables.find((candidate) => {
      const headers = Array.from(candidate.querySelectorAll('tr:first-child th, tr:first-child td')).map((cell) => cell.textContent?.trim().toLowerCase() ?? '');
      return headers.includes('deal') && headers.includes('direction') && headers.includes('profit');
    });
    if (!table) return [];
    return Array.from(table.querySelectorAll('tr')).map((row) => Array.from(row.querySelectorAll('th,td')).map((cell) => cell.textContent?.trim() ?? ''));
  }
  const tables = Array.from(text.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi), (match) => match[1]);
  for (const table of tables) {
    const rows = Array.from(table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi), (match) =>
      Array.from(match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi), (cell) => decodeHtml(cell[1].replace(/<[^>]*>/g, '')).trim()));
    if (rows[0]?.some((cell) => cell.toLowerCase() === 'deal') && rows[0]?.some((cell) => cell.toLowerCase() === 'direction')) return rows;
  }
  return [];
}

const required = [['Time'], ['Symbol'], ['Type'], ['Direction', 'Entry'], ['Volume'], ['Price'], ['Profit'], ['Commission'], ['Swap'], ['Fee']];

export async function parseMt5History(text: string, format: 'html' | 'paste'): Promise<ImportReport> {
  const report = createReport('mt5', format);
  let rows: string[][];
  try { rows = format === 'html' ? htmlDealsRows(text) : parseTextRows(text, 'paste'); }
  catch { report.issues.push({ code: 'invalid_input', message: 'The history has malformed rows or exceeds the row limit.' }); return report; }
  const headers = rows[0] ?? [];
  const missing = missingColumns(headers, required);
  appendMissingIssue(report.issues, missing);
  if (missing.length) return report;
  const accountHash = await hashAccountIdentifier(text);
  report.currency = /\b(?:Currency|Deposit Currency)\s*:\s*([A-Z]{3})\b/i.exec(text)?.[1] ?? null;
  const total = /Closed\s+P\/L\s*:\s*([-\d,.]+)/i.exec(text)?.[1];
  report.declaredNetPnl = total ? Number(total.replaceAll(',', '')) : null;
  const groups = new Map<string, { entries: ClosedTradeRecord[]; exits: ClosedTradeRecord[] }>();
  const decimal: '.' | ',' = '.';
  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const type = valueAt(row, headers, ['Type']).toLowerCase();
    const directionFlag = valueAt(row, headers, ['Direction', 'Entry']).toLowerCase();
    if (['balance', 'credit', 'deposit', 'withdrawal'].includes(type)) {
      rejectRow(report, 'excluded_balance_operation', 'Balance operations are not trades.', rowNumber);
      return;
    }
    if (!['buy', 'sell'].includes(type) || !['in', 'out', 'out by'].includes(directionFlag)) {
      rejectRow(report, 'excluded_non_closed', 'Open, cancelled, or unrecognized deals are not closed trades.', rowNumber);
      return;
    }
    const exitTime = normalizeDate(valueAt(row, headers, ['Time']));
    const symbol = valueAt(row, headers, ['Symbol']);
    const volume = moneyAt(row, headers, ['Volume'], decimal);
    const price = moneyAt(row, headers, ['Price'], decimal);
    const gross = moneyAt(row, headers, ['Profit'], decimal);
    const commission = moneyAt(row, headers, ['Commission'], decimal);
    const swap = moneyAt(row, headers, ['Swap'], decimal);
    const fees = moneyAt(row, headers, ['Fee'], decimal);
    if (!exitTime || !symbol || volume === null || price === null || gross === null || commission === null || swap === null || fees === null) {
      rejectRow(report, !exitTime ? 'invalid_date' : 'invalid_trade', 'A deal has an invalid date, monetary value, or symbol.', rowNumber);
      return;
    }
    const positionId = valueAt(row, headers, ['Position', 'Position ID']);
    const dealId = valueAt(row, headers, ['Deal', 'Ticket']);
    const record: ClosedTradeRecord = {
      platform: 'mt5', sourceId: positionId || dealId || null, ...(accountHash ? { accountHash } : {}), symbol,
      direction: type === 'buy' ? 'LONG' : 'SHORT', entryTime: directionFlag === 'in' ? exitTime : null,
      exitTime, entryPrice: directionFlag === 'in' ? price : null, exitPrice: directionFlag !== 'in' ? price : null,
      volume, grossPnl: gross, commission, swap, fees, netPnl: gross + commission + swap + fees,
      grouping: positionId ? 'position' : 'closure', provenance: { netPnl: 'Profit + Commission + Swap + Fee' },
    };
    if (!positionId) {
      if (directionFlag !== 'in') report.records.push(record);
      return;
    }
    const group = groups.get(positionId) ?? { entries: [], exits: [] };
    if (directionFlag === 'in') group.entries.push(record);
    else group.exits.push(record);
    groups.set(positionId, group);
  });
  for (const [positionId, group] of groups) {
    if (!group.exits.length) continue;
    const opened = group.entries.reduce((sum, record) => sum + (record.volume ?? 0), 0);
    const closed = group.exits.reduce((sum, record) => sum + (record.volume ?? 0), 0);
    if (opened && closed + 1e-8 < opened) {
      rejectRow(report, 'open_position', 'A position is only partially closed and is excluded from position statistics.', 0);
      continue;
    }
    const entry = group.entries[0];
    const entryVolume = group.entries.reduce((sum, record) => sum + (record.volume ?? 0), 0);
    const entryPrice = entryVolume > 0
      ? group.entries.reduce((sum, record) => sum + (record.entryPrice ?? 0) * (record.volume ?? 0), 0) / entryVolume
      : null;
    const exitRecords = group.exits.map((exit) => ({
      ...exit,
      direction: entry?.direction ?? (exit.direction === 'LONG' ? 'SHORT' : 'LONG'),
      entryTime: entry?.entryTime ?? null,
      entryPrice,
    }));
    const combined = combinePosition(exitRecords, positionId);
    combined.netPnl += group.entries.reduce((sum, record) => sum + record.netPnl, 0);
    combined.commission = combined.commission === null ? null : combined.commission + group.entries.reduce((sum, record) => sum + (record.commission ?? 0), 0);
    combined.swap = combined.swap === null ? null : combined.swap + group.entries.reduce((sum, record) => sum + (record.swap ?? 0), 0);
    combined.fees = combined.fees === null ? null : combined.fees + group.entries.reduce((sum, record) => sum + (record.fees ?? 0), 0);
    combined.grossPnl = combined.grossPnl === null ? null : combined.grossPnl + group.entries.reduce((sum, record) => sum + (record.grossPnl ?? 0), 0);
    report.records.push(combined);
  }
  report.records.sort((a, b) => a.exitTime.localeCompare(b.exitTime));
  reconcile(report);
  return report;
}
