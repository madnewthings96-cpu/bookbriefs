import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AnalysisModel, Breakdown } from '../../features/trade-analyzer/analyze';
import type { ImportReport } from '../../features/trade-analyzer/types';

type DashboardProps = { model: AnalysisModel; report: ImportReport; onStartOver: () => void };

const number = (value: number, digits = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const money = (value: number, currency: string) => `${number(value)} ${currency}`;

const BreakdownTable: React.FC<{ title: string; items: Breakdown[]; currency: string }> = ({ title, items, currency }) => <section className="ta-breakdown-card">
  <h3>{title}</h3>
  <div className="ta-table-scroll"><table><thead><tr><th>Group</th><th>Trades</th><th>Win rate</th><th>Net P&L</th></tr></thead><tbody>{items.map((item) => <tr key={item.label}><td>{item.label}</td><td>{item.count}</td><td>{number(item.winRate, 1)}%</td><td className={item.netPnl < 0 ? 'ta-negative' : 'ta-positive'}>{money(item.netPnl, currency)}</td></tr>)}</tbody></table></div>
</section>;

const Calendar: React.FC<{ points: AnalysisModel['calendar']; currency: string }> = ({ points, currency }) => {
  const byDate = new Map(points.map((point) => [point.date, point]));
  const months = Array.from(new Set(points.map((point) => point.date.slice(0, 7)))).slice(-3);
  return <section className="ta-calendar-card"><div className="ta-section-heading"><div><p className="ta-eyebrow">The rhythm</p><h2>Closing calendar</h2></div><p>Latest three active months · realised net P&L</p></div>
    <div className="ta-calendar-months">{months.map((month) => {
      const [year, monthNumber] = month.split('-').map(Number);
      const dayCount = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
      const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
      return <div className="ta-calendar-month" key={month}><h3>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))}</h3><div className="ta-calendar-grid">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span className="ta-calendar-weekday" key={`${day}-${index}`}>{day}</span>)}{Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: dayCount }, (_, index) => {
        const date = `${month}-${String(index + 1).padStart(2, '0')}`;
        const point = byDate.get(date);
        const description = point ? `${date}: ${money(point.netPnl, currency)} across ${point.count} ${point.count === 1 ? 'trade' : 'trades'}` : `${date}: no closed trades`;
        return <span key={date} className={`ta-calendar-day ${point ? point.netPnl > 0 ? 'is-win' : point.netPnl < 0 ? 'is-loss' : 'is-flat' : ''}`} title={description} aria-label={description}>{index + 1}</span>;
      })}</div></div>;
    })}</div>
    <details><summary>View daily results as a table</summary><div className="ta-table-scroll"><table><thead><tr><th>Date</th><th>Closed trades</th><th>Net P&L</th></tr></thead><tbody>{points.map((point) => <tr key={point.date}><td>{point.date}</td><td>{point.count}</td><td>{money(point.netPnl, currency)}</td></tr>)}</tbody></table></div></details>
  </section>;
};

export const Dashboard: React.FC<DashboardProps> = ({ model, report, onStartOver }) => {
  const { metrics, quality, currency } = model;
  const hasBalance = metrics.balanceReturnPercent !== null;
  const curveKey = hasBalance ? 'balance' : 'cumulativePnl';
  return <div className="ta-dashboard" aria-labelledby="ta-dashboard-heading">
    <div className="ta-dashboard-head"><div><p className="ta-eyebrow">Your review</p><h2 id="ta-dashboard-heading">What your closes reveal</h2><p>Based on {metrics.count} closed {metrics.count === 1 ? 'trade' : 'trades'} in {currency}. Hours and weekdays use {model.timezone} source time.</p></div><div className="ta-dashboard-actions"><button type="button" className="ta-secondary-button" onClick={onStartOver}>New import</button><button type="button" className="ta-primary-button" onClick={() => window.print()}>Print review</button></div></div>
    <div className="ta-quality-note"><strong>Reading quality</strong><span>{quality.excludedCount} excluded {quality.excludedCount === 1 ? 'row' : 'rows'} · {quality.closureLevelCount} Closure-level {quality.closureLevelCount === 1 ? 'record' : 'records'} · {quality.unknownCostCount} {quality.unknownCostCount === 1 ? 'record' : 'records'} with unknown costs</span>{report.reconciled === null && <small>No statement total was available for automatic P&L reconciliation.</small>}</div>
    <div className="ta-kpi-grid">
      <div className="ta-kpi-card ta-kpi-primary"><span>Net P&L</span><strong>{money(metrics.netPnl, currency)}</strong><small>Broker-reported result after known costs</small></div>
      <div className="ta-kpi-card"><span>Win rate</span><strong>{number(metrics.winRate, 1)}%</strong><small>{metrics.wins} {metrics.wins === 1 ? 'win' : 'wins'} · {metrics.losses} {metrics.losses === 1 ? 'loss' : 'losses'} · {metrics.breakeven} flat</small></div>
      <div className="ta-kpi-card"><span>Profit factor</span><strong>{metrics.profitFactor === null ? 'Not available' : number(metrics.profitFactor)}</strong><small>{metrics.profitFactor === null ? 'Requires at least one loss' : 'Winning net total ÷ losing net total'}</small></div>
      <div className="ta-kpi-card"><span>Average trade / expectancy</span><strong>{money(metrics.expectancy, currency)}</strong><small>Mean realised result per closed record</small></div>
      <div className="ta-kpi-card"><span>{quality.drawdownLabel}</span><strong>{money(metrics.maxDrawdownValue, currency)}</strong><small>{metrics.maxDrawdownPercent === null ? 'Percentage requires a positive starting balance' : `${number(metrics.maxDrawdownPercent, 1)}% of the prior closed-trade peak`}</small></div>
      <div className="ta-kpi-card"><span>Balance return</span><strong>{metrics.balanceReturnPercent === null ? 'Not available' : `${number(metrics.balanceReturnPercent, 1)}%`}</strong><small>{metrics.balanceReturnPercent === null ? 'Add a starting balance to calculate' : 'Closed trades only, excluding deposits'}</small></div>
    </div>
    <section className="ta-chart-card"><div className="ta-section-heading"><div><p className="ta-eyebrow">The trajectory</p><h2>{hasBalance ? 'Closed-trade balance' : 'Cumulative realised P&L'}</h2></div><p>{hasBalance ? 'Starting balance plus closed trades; not intratrade equity.' : 'No starting balance was provided. This is not an account-balance curve.'}</p></div><div className="ta-chart" role="img" aria-label={`${hasBalance ? 'Closed-trade balance' : 'Cumulative realised P&L'} ends at ${money(hasBalance ? model.curve.at(-1)?.balance ?? 0 : metrics.netPnl, currency)}`}>{typeof window !== 'undefined' && <ResponsiveContainer width="100%" height="100%"><LineChart data={model.curve} margin={{ top: 12, right: 18, bottom: 6, left: 2 }}><CartesianGrid stroke="#dfe8df" strokeDasharray="3 5" /><XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5, 10)} tick={{ fill: '#66766e', fontSize: 11 }} /><YAxis tick={{ fill: '#66766e', fontSize: 11 }} width={50} /><Tooltip formatter={(value: number) => money(value, currency)} /><Line type="monotone" dataKey={curveKey} stroke="#2d7658" strokeWidth={2.5} dot={model.curve.length <= 30} isAnimationActive={false} /></LineChart></ResponsiveContainer>}</div><details><summary>View every close as a table</summary><div className="ta-table-scroll"><table><thead><tr><th>Closed at</th><th>Cumulative realised P&L</th>{hasBalance && <th>Closed-trade balance</th>}<th>Drawdown</th></tr></thead><tbody>{model.curve.map((point, index) => <tr key={`${point.sourceId ?? 'close'}-${index}`}><td>{point.date.replace('T', ' ')}</td><td>{money(point.cumulativePnl, currency)}</td>{hasBalance && <td>{money(point.balance ?? 0, currency)}</td>}<td>{money(point.drawdown, currency)}</td></tr>)}</tbody></table></div></details></section>
    <Calendar points={model.calendar} currency={currency} />
    <section className="ta-insights"><p className="ta-eyebrow">Evidence, not predictions</p><h2>What to investigate</h2><ul>{model.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul><p>These patterns describe historical closed trades. They do not predict future results or capture floating drawdown.</p></section>
    <div className="ta-breakdown-grid"><BreakdownTable title="By symbol" items={model.bySymbol} currency={currency} /><BreakdownTable title="By direction" items={model.byDirection} currency={currency} /><BreakdownTable title="By weekday" items={model.byWeekday} currency={currency} /><BreakdownTable title="By hour" items={model.byHour} currency={currency} /></div>
  </div>;
};
