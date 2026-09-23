import { parseCTraderHistory } from './ctrader';
import { parseMt5History } from './mt5';
import { createReport } from './parseSupport';
import type { ImportPlatform, ImportReport } from './types';

const MAX_BYTES = 5 * 1024 * 1024;

export async function importHistory(input: { platform: ImportPlatform; name?: string; text: string }): Promise<ImportReport> {
  const { platform, name, text } = input;
  const format = name?.toLowerCase().endsWith('.html') || name?.toLowerCase().endsWith('.htm') ? 'html'
    : name?.toLowerCase().endsWith('.csv') ? 'csv' : 'paste';
  const report = createReport(platform, format);
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) {
    report.issues.push({ code: 'too_large', message: 'History must be no larger than 5 MiB.' });
    return report;
  }
  if (!text.trim()) {
    report.issues.push({ code: 'empty_input', message: 'Paste a history table or choose a statement file.' });
    return report;
  }
  const isTabularPaste = !name && text.includes('\t') && !/^\s*</.test(text);
  const isTextFile = Boolean(name && /\.(tsv|txt)$/i.test(name) && text.includes('\t'));
  if (platform === 'mt5' && format === 'html') return parseMt5History(text, 'html');
  if (platform === 'ctrader' && format === 'csv') return parseCTraderHistory(text, 'csv');
  if (isTabularPaste || isTextFile) return platform === 'mt5'
    ? parseMt5History(text, 'paste') : parseCTraderHistory(text, 'paste');
  report.issues.push({ code: 'unsupported_format', message: `This does not look like a supported ${platform === 'mt5' ? 'MT5 HTML report or tabular History' : 'cTrader CSV statement or tabular History'}. Choose the correct platform and export format.` });
  return report;
}

export function canAnalyze(report: ImportReport): boolean {
  return report.records.length > 0 && report.reconciled !== false &&
    !report.issues.some((issue) => ['missing_columns', 'pnl_mismatch', 'unsupported_format', 'too_large', 'empty_input'].includes(issue.code));
}
