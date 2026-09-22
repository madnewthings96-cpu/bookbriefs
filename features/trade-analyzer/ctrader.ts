import { combinePosition, createReport, missingColumns, appendMissingIssue, moneyAt, normalizeDate, parseTextRows, rejectRow, valueAt } from './parseSupport';
import type { ClosedTradeRecord, ImportReport } from './types';

const required = [
  ['Symbol'], ['Opening Direction', 'Direction'], ['Closing Time', 'Close Time'],
  ['Net (currency)', 'Net', 'Net P&L'],
];

export async function parseCTraderHistory(text: string, format: 'csv' | 'paste'): Promise<ImportReport> {
  const report = createReport('ctrader', format);
  let rows: string[][];
  try { rows = parseTextRows(text, format); }
  catch { report.issues.push({ code: 'invalid_csv', message: 'The statement has malformed rows or exceeds the row limit.' }); return report; }
  const headers = rows[0] ?? [];
  const netIndex = headers.findIndex((header) => /^net\s*\([a-z]{3}\)$/i.test(header.trim()));
  const netHeader = netIndex >= 0 ? headers[netIndex] : headers.find((header) => /^net(?: p&l)?$/i.test(header.trim()));
  const missing = missingColumns(headers, required.slice(0, 3));
  if (!netHeader) missing.push('Net (currency)');
  appendMissingIssue(report.issues, missing);
  if (missing.length) return report;
  const currency = /\(([A-Z]{3})\)/i.exec(netHeader ?? '')?.[1]?.toUpperCase() ?? null;
  report.currency = currency;
  const decimal: '.' | ',' = format === 'csv' && text.split(/\r?\n/, 1)[0].includes(';') ? ',' : '.';
  const byPosition = new Map<string, ClosedTradeRecord[]>();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const symbol = valueAt(row, headers, ['Symbol']);
    const directionText = valueAt(row, headers, ['Opening Direction', 'Direction']).toLowerCase();
    const direction = directionText === 'buy' || directionText === 'long' ? 'LONG' : directionText === 'sell' || directionText === 'short' ? 'SHORT' : null;
    const exitTime = normalizeDate(valueAt(row, headers, ['Closing Time', 'Close Time']));
    const entryRaw = valueAt(row, headers, ['Opening Time', 'Open Time']);
    const entryTime = entryRaw ? normalizeDate(entryRaw) : null;
    const netPnl = moneyAt(row, headers, [netHeader ?? ''], decimal);
    if (!symbol || !direction || !exitTime || (entryRaw && !entryTime) || netPnl === null) {
      rejectRow(report, !exitTime || (entryRaw && !entryTime) ? 'invalid_date' : 'invalid_trade', 'A closed-trade row has an invalid date or required value.', rowNumber);
      return;
    }
    const positionId = valueAt(row, headers, ['Position ID', 'Position']);
    const dealId = valueAt(row, headers, ['Deal ID', 'ID']);
    const record: ClosedTradeRecord = {
      platform: 'ctrader', sourceId: positionId || dealId || null, symbol, direction, entryTime, exitTime,
      entryPrice: moneyAt(row, headers, ['Entry Price', 'Opening Price'], decimal),
      exitPrice: moneyAt(row, headers, ['Closing Price', 'Exit Price'], decimal),
      volume: moneyAt(row, headers, ['Closing Quantity', 'Quantity', 'Volume'], decimal),
      grossPnl: moneyAt(row, headers, [`Gross (${currency ?? ''})`, 'Gross'], decimal),
      commission: moneyAt(row, headers, ['Commissions', 'Commission'], decimal),
      swap: moneyAt(row, headers, ['Swap'], decimal), fees: moneyAt(row, headers, ['Fees', 'Fee'], decimal),
      netPnl, grouping: positionId ? 'position' : 'closure', provenance: { netPnl: netHeader ?? 'Net' },
    };
    if (positionId) byPosition.set(positionId, [...(byPosition.get(positionId) ?? []), record]);
    else report.records.push(record);
  });
  for (const [positionId, records] of byPosition) report.records.push(combinePosition(records, positionId));
  report.records.sort((a, b) => a.exitTime.localeCompare(b.exitTime));
  return report;
}
