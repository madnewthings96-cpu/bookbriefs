import React from 'react';
import type { ImportReport } from '../../features/trade-analyzer/types';
import { canAnalyze } from '../../features/trade-analyzer/importHistory';

type VerifyPanelProps = {
  report: ImportReport;
  currency: string;
  timezone: string;
  startingBalance: string;
  onCurrencyChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onStartingBalanceChange: (value: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
};

export const isValidTimezone = (value: string): boolean => {
  if (!value.trim()) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date()); return true; }
  catch { return false; }
};

const money = (value: number | null, currency: string) => value === null ? 'Unknown' : `${value.toFixed(2)} ${currency || ''}`;

export const VerifyPanel: React.FC<VerifyPanelProps> = ({ report, currency, timezone, startingBalance, onCurrencyChange, onTimezoneChange, onStartingBalanceChange, onBack, onAnalyze }) => {
  const dates = report.records.map((record) => record.exitTime.slice(0, 10)).sort();
  const net = report.records.reduce((sum, record) => sum + record.netPnl, 0);
  const costTotal = report.records.every((record) => record.commission !== null && record.swap !== null && record.fees !== null)
    ? report.records.reduce((sum, record) => sum + (record.commission ?? 0) + (record.swap ?? 0) + (record.fees ?? 0), 0)
    : null;
  const currencyValid = /^[A-Z]{3}$/.test(currency.trim().toUpperCase());
  const balanceValid = !startingBalance.trim() || (Number.isFinite(Number(startingBalance)) && Number(startingBalance) > 0);
  const ready = canAnalyze(report) && currencyValid && isValidTimezone(timezone) && balanceValid;

  return <section className="ta-verify-card" aria-labelledby="ta-verify-heading">
    <div className="ta-card-heading"><div><p className="ta-eyebrow">Check the interpretation</p><h2 id="ta-verify-heading">Verify before analysis</h2></div><button type="button" className="ta-text-button" onClick={onBack}>← Change import</button></div>
    <p className="ta-section-intro">Confirm the account currency and the timezone used by the exported timestamps. We never infer a stop loss or reconstruct missing entry details.</p>
    <div className="ta-verify-summary">
      <div><span>Platform</span><strong>{report.platform === 'mt5' ? 'MT5' : 'cTrader'} · {report.format.toUpperCase()}</strong></div>
      <div><span>Closed records</span><strong>{report.records.length} closed {report.records.length === 1 ? 'trade' : 'trades'}</strong></div>
      <div><span>Excluded</span><strong>{report.excludedCount} excluded {report.excludedCount === 1 ? 'row' : 'rows'}</strong></div>
      <div><span>Close-date range</span><strong>{dates.length ? `${dates[0]} → ${dates.at(-1)}` : 'Unavailable'}</strong></div>
      <div><span>Broker net P&L</span><strong>{money(net, currency)}</strong></div>
      <div><span>Known costs</span><strong>{money(costTotal, currency)}</strong></div>
    </div>
    {report.reconciled === false && <p className="ta-alert ta-alert-error" role="alert">The imported net P&L does not match the statement total. Analysis is paused until the source is corrected.</p>}
    {report.issues.length > 0 && <div className="ta-issue-list"><h3>What needs attention</h3><ul>{report.issues.slice(0, 8).map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}{issue.row ? ` (row ${issue.row})` : ''}</li>)}</ul>{report.issues.length > 8 && <p>{report.issues.length - 8} more notices.</p>}</div>}
    <div className="ta-verify-fields">
      <label>Account currency<input value={currency} maxLength={3} autoCapitalize="characters" placeholder="USD" onChange={(event) => onCurrencyChange(event.target.value.toUpperCase())} /></label>
      <label>Source timezone<input value={timezone} placeholder="e.g. UTC or Europe/London" list="ta-timezones" onChange={(event) => onTimezoneChange(event.target.value)} /><small>Use the timezone shown in the platform or supplied by your broker.</small></label>
      <datalist id="ta-timezones"><option value="UTC" /><option value="Europe/London" /><option value="America/New_York" /><option value="Africa/Casablanca" /><option value="Asia/Dubai" /></datalist>
      <label>Starting balance <em>optional</em><input value={startingBalance} type="number" min="0.01" step="any" inputMode="decimal" placeholder="For a balance curve" onChange={(event) => onStartingBalanceChange(event.target.value)} /><small>Leave blank to show cumulative closed-trade P&L instead.</small></label>
    </div>
    <div className="ta-preview"><h3>Record preview</h3><div className="ta-table-scroll"><table><thead><tr><th>Closed</th><th>Symbol</th><th>Side</th><th>Net P&L</th><th>Quality</th></tr></thead><tbody>{report.records.slice(0, 5).map((record, index) => <tr key={`${record.sourceId ?? 'row'}-${index}`}><td>{record.exitTime.replace('T', ' ')}</td><td>{record.symbol}</td><td>{record.direction}</td><td>{money(record.netPnl, currency)}</td><td>{record.grouping === 'position' ? 'Position' : 'Closure only'}</td></tr>)}</tbody></table></div></div>
    <div className="ta-actions"><button type="button" className="ta-secondary-button" onClick={onBack}>Change import</button><button type="button" className="ta-primary-button" onClick={onAnalyze} disabled={!ready}>Analyze closed trades <span aria-hidden="true">→</span></button></div>
    {!ready && <p className="ta-helper">Enter a valid account currency and source timezone. Statement mismatches cannot be analyzed.</p>}
  </section>;
};
