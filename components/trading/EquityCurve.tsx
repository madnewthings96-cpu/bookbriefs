import React, { useState, useMemo } from 'react';
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    ReferenceLine,
    ComposedChart,
} from 'recharts';
import { EquityPoint, TimeRange, calculateDrawdown, filterEquityByTimeRange, Goal } from '../../utils/tradingUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EquityCurveProps {
    data: EquityPoint[];
    goals?: Goal[];
}

const EquityCurve: React.FC<EquityCurveProps> = ({ data, goals = [] }) => {
    // Calculate performance metrics
    const metrics = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // Start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfWeekTime = startOfWeek.getTime();

        let todayPnL = 0;
        let weekPnL = 0;
        let winCount = 0;
        let lossCount = 0;

        data.forEach(point => {
            if (!point.trade) return;

            const tradeTime = point.timestamp;

            // P&L Metrics
            if (tradeTime >= startOfDay) {
                todayPnL += point.trade.pnl;
            }
            if (tradeTime >= startOfWeekTime) {
                weekPnL += point.trade.pnl;
            }

            // Win/Loss Record (All time)
            if (point.trade.pnl > 0) winCount++;
            if (point.trade.pnl < 0) lossCount++;
        });

        return { todayPnL, weekPnL, winCount, lossCount };
    }, [data]);

    // Calculate drawdown (for stats display only, not drawn on chart)
    const drawdownData = useMemo(() => {
        return calculateDrawdown(data);
    }, [data]);

    // Chart data with display index for ordinal X-axis
    const chartData = useMemo(() => {
        return data.map((point, index) => ({
            ...point,
            displayIndex: index,
            drawdownPercent: drawdownData[index]?.drawdown || 0,
        }));
    }, [data, drawdownData]);

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equity Curve</h3>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p>No trades yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first trade to see your equity curve</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentEquity = chartData[chartData.length - 1]?.cumulativePnL || 0;
    const startingEquity = chartData[0]?.cumulativePnL || 0;
    const isProfitable = currentEquity >= startingEquity;
    const gradientColor = isProfitable ? '#10b981' : '#f43f5e';
    const totalReturn = currentEquity - startingEquity;
    const returnPercent = startingEquity > 0 ? ((totalReturn / startingEquity) * 100).toFixed(2) : '0.00';

    const maxDrawdown = Math.max(...drawdownData.map(d => d.drawdown));

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const equity = data.cumulativePnL;
            const drawdownPercent = data.drawdownPercent || 0;
            const trade = data.trade;

            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-500 text-xs mb-1">{data.date}</p>
                    <p className={`text-base font-bold ${equity >= startingEquity ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {equity.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    {drawdownPercent > 0 && (
                        <p className="text-xs text-rose-500 mt-1">
                            Drawdown: {drawdownPercent.toFixed(2)}%
                        </p>
                    )}
                    {trade && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                            <p className="text-gray-600">{trade.symbol} {trade.direction}</p>
                            <p className={trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                P&L: {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Equity Curve</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <div className={`text-sm font-medium ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {currentEquity.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                        <div className={`text-xs ${isProfitable ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                            {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isProfitable ? '+' : ''}{returnPercent}%
                        </div>
                        {maxDrawdown > 0 && (
                            <div className="text-xs text-rose-500">
                                Max DD: {maxDrawdown.toFixed(2)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Mini-Summary */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Record:</span>
                        <span className="font-semibold text-gray-800 tracking-wide">
                            <span className="text-emerald-600">{metrics.winCount}W</span>
                            <span className="mx-0.5 text-gray-300">/</span>
                            <span className="text-rose-500">{metrics.lossCount}L</span>
                        </span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Today:</span>
                        <span className={`font-semibold ${metrics.todayPnL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {metrics.todayPnL >= 0 ? '+' : ''}{metrics.todayPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">Week:</span>
                        <span className={`font-semibold ${metrics.weekPnL >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {metrics.weekPnL >= 0 ? '+' : ''}{metrics.weekPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                        dataKey="displayIndex"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        tickFormatter={(idx) => {
                            // Only show date if it changed from previous point, or is first point
                            const point = chartData[idx];
                            if (!point) return '';
                            const prevPoint = chartData[idx - 1];
                            if (!prevPoint || point.date !== prevPoint.date) {
                                return point.date;
                            }
                            return '';
                        }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        yAxisId="equity"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}`}
                        domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Main Equity Line */}
                    <Area
                        yAxisId="equity"
                        type="monotone"
                        dataKey="cumulativePnL"
                        stroke={gradientColor}
                        strokeWidth={2.5}
                        fill="url(#equityGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: gradientColor, stroke: '#fff', strokeWidth: 2 }}
                    />

                    {/* Trade Markers */}
                    <Scatter
                        yAxisId="equity"
                        dataKey="cumulativePnL"
                        fill="#8884d8"
                        shape={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (!payload.trade) return null;

                            const isWin = payload.trade.pnl > 0;
                            const color = isWin ? '#10b981' : '#f43f5e';

                            return (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill={color}
                                    stroke="#fff"
                                    strokeWidth={1.5}
                                    opacity={0.9}
                                />
                            );
                        }}
                    />

                    {/* Milestone Markers (Goals) */}
                    {goals.map((goal) => {
                        if (goal.type === 'balance' && goal.target) {
                            return (
                                <ReferenceLine
                                    key={goal.id}
                                    yAxisId="equity"
                                    y={goal.target}
                                    stroke="#f59e0b"
                                    strokeDasharray="3 3"
                                    strokeWidth={1.5}
                                    label={{
                                        value: `Goal: $${goal.target.toLocaleString()}`,
                                        position: 'insideTopRight',
                                        fill: '#f59e0b',
                                        fontSize: 11,
                                        fontWeight: 600,
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Starting Balance Line */}
                    {startingEquity > 0 && (
                        <ReferenceLine
                            yAxisId="equity"
                            y={startingEquity}
                            stroke="#9ca3af"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                                value: 'Start',
                                position: 'insideTopLeft',
                                fill: '#9ca3af',
                                fontSize: 10,
                            }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EquityCurve;
