import React, { useMemo, useState } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    ReferenceLine,
    ResponsiveContainer,
    Scatter,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { type EquityPoint, type Goal } from '../../utils/tradingUtils';
import {
    buildEquityCurveStory,
    EQUITY_CURVE_RANGES,
    type EquityChartPoint,
    type EquityCurveRange,
} from './equityCurveModel';

interface EquityCurveProps {
    data: EquityPoint[];
    goals?: Goal[];
}

const chartMargin = { top: 12, right: 16, left: 0, bottom: 0 };
const axisWidth = 58;
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});
const tooltipCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const EquityCurve: React.FC<EquityCurveProps> = ({ data, goals = [] }) => {
    const [range, setRange] = useState<EquityCurveRange>('ALL');
    const story = useMemo(() => buildEquityCurveStory(data, range), [data, range]);
    const isProfitable = story.totalReturn >= 0;
    const equityColor = isProfitable ? '#2f8a67' : '#c65b50';

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equity Curve</h3>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1-1V4z" />
                        </svg>
                        <p>No trades yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first trade to see your equity curve</p>
                    </div>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: EquityChartPoint }> }) => {
        if (!active || !payload?.length) return null;

        const point = payload[0].payload;
        const trade = point.trade;

        return (
            <div className="equity-story-tooltip">
                <p className="equity-story-tooltip-date">{point.date}</p>
                <p className={point.cumulativePnL >= story.startingEquity ? 'equity-story-profit' : 'equity-story-loss'}>
                    {tooltipCurrencyFormatter.format(point.cumulativePnL)}
                </p>
                {point.drawdownDepth < 0 && (
                    <p className="equity-story-tooltip-drawdown">Drawdown: {Math.abs(point.drawdownDepth).toFixed(2)}%</p>
                )}
                {trade && (
                    <div className="equity-story-tooltip-trade">
                        <p>{trade.symbol} {trade.direction}</p>
                        <p className={trade.pnl >= 0 ? 'equity-story-profit' : 'equity-story-loss'}>
                            P&amp;L: {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const dateTick = (index: number) => {
        const point = story.points[index];
        const previousPoint = story.points[index - 1];
        return !point || (previousPoint && point.date === previousPoint.date) ? '' : point.date;
    };

    return (
        <section className="equity-story-card rounded-xl bg-white p-5 shadow-sm">
            <div className="equity-story-header">
                <div>
                    <p className="equity-story-kicker">Account trajectory</p>
                    <h3 className="equity-story-title">Equity curve</h3>
                    <div className="equity-story-headline">
                        <span>{currencyFormatter.format(story.currentEquity)}</span>
                        <span className={isProfitable ? 'equity-story-profit' : 'equity-story-loss'}>
                            {isProfitable ? <TrendingUp aria-hidden="true" /> : <TrendingDown aria-hidden="true" />}
                            {isProfitable ? '+' : ''}{story.returnPercent.toFixed(2)}%
                        </span>
                    </div>
                </div>

                <div className="equity-story-ranges" aria-label="Equity chart time range">
                    {EQUITY_CURVE_RANGES.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className="equity-story-range-button"
                            aria-pressed={range === option}
                            onClick={() => setRange(option)}
                        >
                            {option === 'ALL' ? 'All' : option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="equity-story-chart" dir="ltr" role="img" aria-label="Equity curve showing account balance and trade outcomes over time">
                <ResponsiveContainer width="100%" height={270}>
                    <ComposedChart data={story.points} syncId="equity-drawdown-story" margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 46, 36, 0.12)" vertical={false} />
                        <XAxis dataKey="displayIndex" type="category" hide />
                        <YAxis
                            yAxisId="equity"
                            width={axisWidth}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#66766e', fontSize: 11 }}
                            tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}`}
                            domain={['dataMin - 100', 'dataMax + 100']}
                        />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        <Area
                            yAxisId="equity"
                            type="monotone"
                            dataKey="cumulativePnL"
                            stroke={equityColor}
                            strokeWidth={2.5}
                            fill={equityColor}
                            fillOpacity={0.14}
                            dot={false}
                            activeDot={{ r: 6, fill: equityColor, stroke: '#fffdf7', strokeWidth: 2 }}
                            isAnimationActive={false}
                        />
                        <Scatter
                            yAxisId="equity"
                            dataKey="cumulativePnL"
                            isAnimationActive={false}
                            shape={(props: { cx?: number; cy?: number; payload?: EquityChartPoint }) => {
                                const { cx, cy, payload } = props;
                                if (!payload?.trade || cx === undefined || cy === undefined) return null;

                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={4}
                                        fill={payload.trade.pnl > 0 ? '#2f8a67' : '#c65b50'}
                                        stroke="#fffdf7"
                                        strokeWidth={1.5}
                                        opacity={0.9}
                                    />
                                );
                            }}
                        />
                        {goals.map((goal) => goal.type === 'balance' && goal.target ? (
                            <ReferenceLine
                                key={goal.id}
                                yAxisId="equity"
                                y={goal.target}
                                stroke="#c89a49"
                                strokeDasharray="3 3"
                                strokeWidth={1.5}
                                label={{ value: `Goal: $${goal.target.toLocaleString()}`, position: 'insideTopRight', fill: '#c89a49', fontSize: 11, fontWeight: 600 }}
                            />
                        ) : null)}
                        {story.startingEquity > 0 && (
                            <ReferenceLine
                                yAxisId="equity"
                                y={story.startingEquity}
                                stroke="#66766e"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                                label={{ value: 'Start', position: 'insideTopLeft', fill: '#66766e', fontSize: 10 }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="equity-story-drawdown-heading">
                <span>Drawdown depth</span>
                <span>Below running peak</span>
            </div>
            <div className="equity-story-drawdown-chart" dir="ltr" role="img" aria-label="Drawdown depth below the running equity peak over time">
                <ResponsiveContainer width="100%" height={112}>
                    <ComposedChart data={story.points} syncId="equity-drawdown-story" margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 46, 36, 0.12)" vertical={false} />
                        <XAxis
                            dataKey="displayIndex"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#66766e', fontSize: 11 }}
                            tickFormatter={dateTick}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            width={axisWidth}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#66766e', fontSize: 11 }}
                            tickFormatter={(value) => `${value}%`}
                            domain={['dataMin - 1', 0]}
                        />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        <ReferenceLine y={0} stroke="#66766e" strokeWidth={1} />
                        <Area
                            type="monotone"
                            dataKey="drawdownDepth"
                            stroke="#c65b50"
                            strokeWidth={2}
                            fill="#c65b50"
                            fillOpacity={0.22}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <p className="equity-story-insight">{story.insight}</p>
            <dl className="equity-story-metrics">
                <div>
                    <dt>Peak equity</dt>
                    <dd>{currencyFormatter.format(story.peakEquity)}</dd>
                </div>
                <div>
                    <dt>Current drawdown</dt>
                    <dd className="equity-story-loss">{story.currentDrawdownPercent.toFixed(2)}%</dd>
                </div>
                <div>
                    <dt>Worst drawdown</dt>
                    <dd className="equity-story-loss">{story.maxDrawdownPercent.toFixed(2)}%</dd>
                </div>
                <div>
                    <dt>Recovery</dt>
                    <dd>{story.recoveryLabel}</dd>
                </div>
            </dl>
        </section>
    );
};

export default EquityCurve;
