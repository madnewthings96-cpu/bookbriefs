import React from 'react';
import {
    AlertTriangle,
    BarChart3,
    Brain,
    CalendarDays,
    CheckCircle2,
    LineChart,
    Target,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    AdvancedTradingStats,
    BreakdownStats,
    Trade,
    TradingStats,
    formatCurrency,
} from '../../utils/tradingUtils';

const formatTradeLabel = (trade?: Trade): string => {
    if (!trade) return 'No trade yet';
    return `${trade.symbol} ${formatCurrency(trade.pnl)}`;
};

const getPnLTone = (value: number): string => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-rose-600';
    return 'text-gray-800';
};

const EmptyAnalyticsState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="rounded-xl bg-white p-10 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
        <BarChart3 className="mx-auto mb-3 h-12 w-12 text-gray-300" strokeWidth={1.5} />
        <p className="font-semibold text-gray-700">{title}</p>
        <p className="mt-1 text-sm text-gray-400 text-pretty">{description}</p>
    </div>
);

const InsightCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    tone?: 'profit' | 'loss' | 'neutral';
}> = ({ title, value, subtitle, icon, tone = 'neutral' }) => {
    const toneClass = tone === 'profit'
        ? 'text-emerald-600'
        : tone === 'loss'
            ? 'text-rose-600'
            : 'text-gray-900';

    return (
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={`mt-2 text-xl font-bold tabular-nums ${toneClass}`}>{value}</p>
                    <p className="mt-1 text-sm text-gray-400 text-pretty">{subtitle}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export const OverviewInsights: React.FC<{
    stats: TradingStats;
    advancedStats: AdvancedTradingStats;
}> = ({ stats, advancedStats }) => {
    if (stats.totalTrades === 0) {
        return (
            <EmptyAnalyticsState
                title="No performance insights yet"
                description="Add a few trades and this dashboard will start surfacing risk, day, and expectancy patterns."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InsightCard
                title="Expectancy"
                value={formatCurrency(advancedStats.expectancy)}
                subtitle="Average P&L per trade"
                icon={<LineChart className="h-5 w-5" />}
                tone={advancedStats.expectancy > 0 ? 'profit' : advancedStats.expectancy < 0 ? 'loss' : 'neutral'}
            />
            <InsightCard
                title="Max Drawdown"
                value={`${advancedStats.maxDrawdownPercent.toFixed(2)}%`}
                subtitle={formatCurrency(-advancedStats.maxDrawdownValue)}
                icon={<TrendingDown className="h-5 w-5" />}
                tone={advancedStats.maxDrawdownValue > 0 ? 'loss' : 'neutral'}
            />
            <InsightCard
                title="Best Trade"
                value={formatTradeLabel(advancedStats.bestTrade)}
                subtitle="Largest single winner"
                icon={<TrendingUp className="h-5 w-5" />}
                tone="profit"
            />
            <InsightCard
                title="Worst Trade"
                value={formatTradeLabel(advancedStats.worstTrade)}
                subtitle="Largest single loser"
                icon={<AlertTriangle className="h-5 w-5" />}
                tone={advancedStats.worstTrade && advancedStats.worstTrade.pnl < 0 ? 'loss' : 'neutral'}
            />
        </div>
    );
};

export const BreakdownAnalytics: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    breakdowns: BreakdownStats[];
}> = ({ title, description, icon, breakdowns }) => {
    if (breakdowns.length === 0) {
        return (
            <EmptyAnalyticsState
                title={`No ${title.toLowerCase()} data yet`}
                description="Add trades with complete labels to unlock this breakdown."
            />
        );
    }

    const maxAbsPnL = Math.max(...breakdowns.map((item) => Math.abs(item.totalPnL)), 1);

    return (
        <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-50 p-2 text-orange-500">{icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 text-balance">{title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 text-pretty">{description}</p>
                </div>
            </div>

            <div className="space-y-3">
                {breakdowns.map((item) => {
                    const barWidth = Math.max(6, (Math.abs(item.totalPnL) / maxAbsPnL) * 100);

                    return (
                        <div
                            key={item.key}
                            className="rounded-lg bg-gray-50 p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                        >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-gray-900">{item.label}</p>
                                        <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                                            {item.trades} trade{item.trades !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                                        <div
                                            className={`h-full rounded-full ${item.totalPnL >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[460px]">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">P&L</p>
                                        <p className={`font-semibold tabular-nums ${getPnLTone(item.totalPnL)}`}>{formatCurrency(item.totalPnL)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">Win Rate</p>
                                        <p className="font-semibold text-gray-800 tabular-nums">{item.winRate.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">Avg R</p>
                                        <p className={`font-semibold tabular-nums ${getPnLTone(item.avgR)}`}>{item.avgR > 0 ? '+' : ''}{item.avgR.toFixed(2)}R</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">Record</p>
                                        <p className="font-semibold text-gray-800 tabular-nums">{item.wins}W / {item.losses}L</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const ReviewPanel: React.FC<{
    stats: TradingStats;
    advancedStats: AdvancedTradingStats;
    setupBreakdowns: BreakdownStats[];
    emotionBreakdowns: BreakdownStats[];
}> = ({ stats, advancedStats, setupBreakdowns, emotionBreakdowns }) => {
    if (stats.totalTrades === 0) {
        return (
            <EmptyAnalyticsState
                title="No review yet"
                description="After logging trades, this page will identify what to repeat, what to stop, and what to inspect next."
            />
        );
    }

    const bestSetup = [...setupBreakdowns].sort((a, b) => b.totalPnL - a.totalPnL)[0];
    const worstSetup = [...setupBreakdowns].sort((a, b) => a.totalPnL - b.totalPnL)[0];
    const bestEmotion = [...emotionBreakdowns].sort((a, b) => b.totalPnL - a.totalPnL)[0];
    const worstEmotion = [...emotionBreakdowns].sort((a, b) => a.totalPnL - b.totalPnL)[0];
    const losingBias = stats.losses > stats.wins;

    const reviewItems = [
        {
            title: 'Repeat',
            value: bestSetup ? `${bestSetup.label}: ${formatCurrency(bestSetup.totalPnL)}` : 'No setup pattern yet',
            description: 'This is the strongest setup by total P&L.',
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            surface: 'bg-emerald-50',
        },
        {
            title: 'Stop',
            value: worstEmotion ? `${worstEmotion.label}: ${formatCurrency(worstEmotion.totalPnL)}` : 'No emotion pattern yet',
            description: 'This emotional state is costing the most money.',
            icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
            surface: 'bg-rose-50',
        },
        {
            title: 'Inspect',
            value: worstSetup ? `${worstSetup.label}: ${formatCurrency(worstSetup.totalPnL)}` : 'No setup risk yet',
            description: 'Review entry quality, stop placement, and whether this setup still belongs in the plan.',
            icon: <Target className="h-5 w-5 text-orange-500" />,
            surface: 'bg-orange-50',
        },
        {
            title: 'State',
            value: bestEmotion ? `${bestEmotion.label}: ${formatCurrency(bestEmotion.totalPnL)}` : 'No positive state yet',
            description: 'This is the mental state most associated with profitable execution.',
            icon: <Brain className="h-5 w-5 text-violet-500" />,
            surface: 'bg-violet-50',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reviewItems.map((item) => (
                    <div
                        key={item.title}
                        className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`rounded-lg p-2 ${item.surface}`}>{item.icon}</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                                <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums text-balance">{item.value}</p>
                                <p className="mt-1 text-sm text-gray-500 text-pretty">{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Review Prompts</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-800">What happened?</p>
                        <p className="mt-1 text-sm text-gray-500 text-pretty">
                            {advancedStats.bestDay && advancedStats.worstDay
                                ? `Best day was ${advancedStats.bestDay.date}; worst day was ${advancedStats.worstDay.date}.`
                                : 'Log more active days to compare daily performance.'}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-800">What is the risk?</p>
                        <p className="mt-1 text-sm text-gray-500 text-pretty">
                            {advancedStats.maxDrawdownValue > 0
                                ? `Largest drawdown is ${advancedStats.maxDrawdownPercent.toFixed(2)}%, or ${formatCurrency(-advancedStats.maxDrawdownValue)}.`
                                : 'No drawdown recorded yet.'}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-800">What changes next?</p>
                        <p className="mt-1 text-sm text-gray-500 text-pretty">
                            {losingBias
                                ? 'Reduce frequency and review every loss before taking the next trade.'
                                : 'Protect the process that produced the current edge.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
