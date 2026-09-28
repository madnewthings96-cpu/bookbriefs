import type { ClosedTradeRecord, ImportReport } from './types';

export type Breakdown = { label: string; count: number; wins: number; netPnl: number; winRate: number };
export type CurvePoint = { sourceId: string | null; date: string; cumulativePnl: number; balance: number | null; drawdown: number };
export type CalendarPoint = { date: string; count: number; netPnl: number };
export type AnalysisModel = {
  currency: string;
  timezone: string;
  metrics: {
    count: number; netPnl: number; wins: number; losses: number; breakeven: number;
    winRate: number; profitFactor: number | null; averageTrade: number; expectancy: number;
    balanceReturnPercent: number | null; maxDrawdownValue: number; maxDrawdownPercent: number | null;
  };
  curve: CurvePoint[];
  calendar: CalendarPoint[];
  bySymbol: Breakdown[];
  byDirection: Breakdown[];
  byWeekday: Breakdown[];
  byHour: Breakdown[];
  observations: string[];
  quality: { excludedCount: number; closureLevelCount: number; unknownCostCount: number; drawdownLabel: string };
};

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function breakdown(records: ClosedTradeRecord[], label: (record: ClosedTradeRecord) => string): Breakdown[] {
  const groups = new Map<string, { count: number; wins: number; netPnl: number }>();
  for (const record of records) {
    const key = label(record);
    const group = groups.get(key) ?? { count: 0, wins: 0, netPnl: 0 };
    group.count += 1;
    if (record.netPnl > 0) group.wins += 1;
    group.netPnl += record.netPnl;
    groups.set(key, group);
  }
  return Array.from(groups, ([key, values]) => ({
    label: key, count: values.count, wins: values.wins, netPnl: values.netPnl,
    winRate: values.wins / values.count * 100,
  })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function analyzeTrades(input: { report: ImportReport; currency: string; timezone: string; startingBalance: number | null }): AnalysisModel {
  const { report, currency, timezone, startingBalance } = input;
  if (!currency || !/^[A-Z]{3}$/.test(currency)) throw new Error('Choose a three-letter account currency.');
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date()); }
  catch { throw new Error('Choose a valid source timezone.'); }
  if (!report.records.length) throw new Error('No closed trades are available to analyze.');
  const records = [...report.records].sort((a, b) => a.exitTime.localeCompare(b.exitTime) || (a.sourceId ?? '').localeCompare(b.sourceId ?? ''));
  const hasBalance = startingBalance !== null && Number.isFinite(startingBalance) && startingBalance > 0;
  const netPnl = records.reduce((sum, record) => sum + record.netPnl, 0);
  const wins = records.filter((record) => record.netPnl > 0);
  const losses = records.filter((record) => record.netPnl < 0);
  const grossWins = wins.reduce((sum, record) => sum + record.netPnl, 0);
  const grossLosses = -losses.reduce((sum, record) => sum + record.netPnl, 0);
  let cumulativePnl = 0;
  let peak = hasBalance ? startingBalance : 0;
  let maxDrawdownValue = 0;
  let maxDrawdownPercent: number | null = hasBalance ? 0 : null;
  const curve = records.map((record): CurvePoint => {
    cumulativePnl += record.netPnl;
    const balance = hasBalance ? startingBalance + cumulativePnl : null;
    const level = balance ?? cumulativePnl;
    peak = Math.max(peak, level);
    const drawdown = peak - level;
    maxDrawdownValue = Math.max(maxDrawdownValue, drawdown);
    if (hasBalance && peak > 0) maxDrawdownPercent = Math.max(maxDrawdownPercent ?? 0, drawdown / peak * 100);
    return { sourceId: record.sourceId, date: record.exitTime, cumulativePnl, balance, drawdown };
  });
  const dateBreakdown = breakdown(records, (record) => record.exitTime.slice(0, 10));
  const calendar = dateBreakdown.map(({ label, count, netPnl: value }) => ({ date: label, count, netPnl: value })).sort((a, b) => a.date.localeCompare(b.date));
  const bySymbol = breakdown(records, (record) => record.symbol);
  const byDirection = breakdown(records, (record) => record.direction);
  const byWeekday = breakdown(records, (record) => weekdayNames[new Date(`${record.exitTime.slice(0, 10)}T00:00:00Z`).getUTCDay()]);
  const byHour = breakdown(records, (record) => `${record.exitTime.slice(11, 13)}:00`);
  const observations = [`Net P&L is ${netPnl.toFixed(2)} ${currency} across ${records.length} closed ${records.length === 1 ? 'trade' : 'trades'}.`];
  const qualified = bySymbol.filter((segment) => segment.count >= 10);
  if (qualified.length) {
    const strongest = [...qualified].sort((a, b) => b.netPnl - a.netPnl)[0];
    observations.push(`${strongest.label} contributed ${strongest.netPnl.toFixed(2)} ${currency} across ${strongest.count} closed trades; investigate whether that pattern persists.`);
  } else observations.push('Too few trades in any one symbol to conclude a repeatable pattern.');
  return {
    currency, timezone,
    metrics: {
      count: records.length, netPnl, wins: wins.length, losses: losses.length, breakeven: records.length - wins.length - losses.length,
      winRate: wins.length / records.length * 100, profitFactor: grossLosses > 0 ? grossWins / grossLosses : null,
      averageTrade: netPnl / records.length, expectancy: netPnl / records.length,
      balanceReturnPercent: hasBalance ? netPnl / startingBalance * 100 : null,
      maxDrawdownValue, maxDrawdownPercent,
    },
    curve, calendar, bySymbol, byDirection, byWeekday, byHour, observations,
    quality: {
      excludedCount: report.excludedCount,
      closureLevelCount: records.filter((record) => record.grouping === 'closure').length,
      unknownCostCount: records.filter((record) => record.commission === null || record.swap === null || record.fees === null).length,
      drawdownLabel: hasBalance ? 'Closed-trade balance drawdown' : 'Closed-trade P&L drawdown',
    },
  };
}
