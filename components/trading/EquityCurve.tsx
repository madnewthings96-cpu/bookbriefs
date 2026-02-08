import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { EquityPoint } from '../../utils/tradingUtils';

interface EquityCurveProps {
    data: EquityPoint[];
}

const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
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

    const finalPnL = data[data.length - 1]?.cumulativePnL || 0;
    const isPositive = finalPnL >= 0;
    const gradientColor = isPositive ? '#10b981' : '#f43f5e';

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const isPositive = value >= 0;
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? '+' : ''}{value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Equity Curve</h3>
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{finalPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 11 }}
                        tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}`}
                        domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="cumulativePnL"
                        stroke={gradientColor}
                        strokeWidth={2}
                        fill="url(#equityGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: gradientColor, stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EquityCurve;
