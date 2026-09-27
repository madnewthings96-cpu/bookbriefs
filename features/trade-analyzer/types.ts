export type ImportPlatform = 'mt5' | 'ctrader';
export type ImportFormat = 'html' | 'csv' | 'paste';
export type GroupingQuality = 'position' | 'closure' | 'incomplete';

export type ImportIssue = {
  code: string;
  message: string;
  row?: number;
  count?: number;
};

export type ClosedTradeRecord = {
  platform: ImportPlatform;
  sourceId: string | null;
  accountHash?: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryTime: string | null;
  exitTime: string;
  entryPrice: number | null;
  exitPrice: number | null;
  volume: number | null;
  grossPnl: number | null;
  commission: number | null;
  swap: number | null;
  fees: number | null;
  netPnl: number;
  grouping: GroupingQuality;
  provenance: Record<string, string>;
};

export type ImportReport = {
  platform: ImportPlatform;
  format: ImportFormat;
  records: ClosedTradeRecord[];
  issues: ImportIssue[];
  excludedCount: number;
  currency: string | null;
  sourceTimezone: string | null;
  declaredNetPnl: number | null;
  reconciled: boolean | null;
};
