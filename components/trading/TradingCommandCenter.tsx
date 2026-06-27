import React, { useMemo } from 'react';
import {
    AlertTriangle,
    Ban,
    CheckCircle2,
    ClipboardList,
    Plus,
    ShieldCheck,
    Target,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import EquityCurve from './EquityCurve';
import {
    AdvancedTradingStats,
    EquityPoint,
    Goal,
    StreakInfo,
    Trade,
    TradingStats,
    formatCurrency,
} from '../../utils/tradingUtils';

interface TradingCommandCenterProps {
    trades: Trade[];
    stats: TradingStats;
    advancedStats: AdvancedTradingStats;
    equityCurveData: EquityPoint[];
    goals: Goal[];
    streak: StreakInfo;
    startingBalance: number;
    onAddTrade: () => void;
    onAddGoal: () => void;
}

type StatusTone = 'clear' | 'caution' | 'stop' | 'idle';

const harmfulEmotions = new Set(['FOMO', 'Revenge', 'Impulsive', 'Overconfident', 'Greedy', 'Bored']);

const isSameLocalDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const calculateDisciplineScore = (trades: Trade[]) => {
    const sample = trades.slice(0, 20);
    if (sample.length === 0) {
        return {
            score: 0,
            label: 'No score yet',
            note: 'Log trades with stops, notes, and psychology to build the score.',
        };
    }

    const totalPoints = sample.length * 4;
    const earnedPoints = sample.reduce((points, trade) => {
        const hasStop = trade.stopLoss > 0 ? 1 : 0;
        const hasNotes = trade.notes?.trim() ? 1 : 0;
        const hasSetup = trade.setup?.trim() ? 1 : 0;
        const cleanEmotion = harmfulEmotions.has(trade.emotions) ? 0 : 1;
        return points + hasStop + hasNotes + hasSetup + cleanEmotion;
    }, 0);

    const score = Math.round((earnedPoints / totalPoints) * 100);

    if (score >= 80) {
        return {
            score,
            label: 'Strong process',
            note: 'Recent trades show clean documentation and better emotional control.',
        };
    }

    if (score >= 55) {
        return {
            score,
            label: 'Mixed process',
            note: 'The journal has useful data, but some trades need clearer notes or setup labels.',
        };
    }

    return {
        score,
        label: 'Process risk',
        note: 'Tighten stops, notes, setup labels, and emotional discipline before scaling.',
    };
};

const getTradingStatus = (trades: Trade[], startingBalance: number) => {
    const today = new Date();
    const todayTrades = trades.filter((trade) =>
        trade.entryDate?.toDate && isSameLocalDay(trade.entryDate.toDate(), today)
    );
    const dailyPnL = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = todayTrades.filter((trade) => trade.status === 'WIN').length;
    const losses = todayTrades.filter((trade) => trade.status === 'LOSS').length;
    const emotionalTrades = todayTrades.filter((trade) => harmfulEmotions.has(trade.emotions)).length;
    const dailyReturn = startingBalance > 0 ? (dailyPnL / startingBalance) * 100 : 0;

    if (todayTrades.length === 0) {
        return {
            tone: 'idle' as StatusTone,
            title: 'Ready for a clean session',
            message: 'No trades logged today. Start with a plan, then record the execution.',
            action: 'Log the first trade only after the setup is valid.',
            dailyPnL,
            dailyReturn,
            wins,
            losses,
            emotionalTrades,
            trades: todayTrades.length,
        };
    }

    if (losses >= 3 || dailyReturn <= -2 || emotionalTrades >= 2) {
        return {
            tone: 'stop' as StatusTone,
            title: 'Stop and review',
            message: 'Today has enough risk signals to pause execution and inspect the last decisions.',
            action: 'Do not add size. Review the losing/emotional trades first.',
            dailyPnL,
            dailyReturn,
            wins,
            losses,
            emotionalTrades,
            trades: todayTrades.length,
        };
    }

    if (losses >= 2 || dailyPnL < 0 || emotionalTrades > 0) {
        return {
            tone: 'caution' as StatusTone,
            title: 'Trade smaller and slower',
            message: 'There is friction in today’s execution. Keep the next decision mechanical.',
            action: 'Reduce frequency and require a written reason before the next entry.',
            dailyPnL,
            dailyReturn,
            wins,
            losses,
            emotionalTrades,
            trades: todayTrades.length,
        };
    }

    return {
        tone: 'clear' as StatusTone,
        title: 'Good execution today',
        message: 'Today is positive without emotional flags. Protect the process.',
        action: 'Keep sizing consistent and avoid adding trades just to stay active.',
        dailyPnL,
        dailyReturn,
        wins,
        losses,
        emotionalTrades,
        trades: todayTrades.length,
    };
};

const statusStyles: Record<StatusTone, {
    surface: string;
    iconSurface: string;
    text: string;
    icon: React.ReactNode;
}> = {
    clear: {
        surface: 'bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.16),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]',
        iconSurface: 'bg-emerald-500 text-white',
        text: 'text-emerald-700',
        icon: <CheckCircle2 className="h-5 w-5" />,
    },
    caution: {
        surface: 'bg-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]',
        iconSurface: 'bg-amber-500 text-white',
        text: 'text-amber-700',
        icon: <AlertTriangle className="h-5 w-5" />,
    },
    stop: {
        surface: 'bg-rose-50 shadow-[0_0_0_1px_rgba(244,63,94,0.18),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]',
        iconSurface: 'bg-rose-500 text-white',
        text: 'text-rose-700',
        icon: <Ban className="h-5 w-5" />,
    },
    idle: {
        surface: 'bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]',
        iconSurface: 'bg-[#e5d8c7] text-gray-900',
        text: 'text-gray-700',
        icon: <ClipboardList className="h-5 w-5" />,
    },
};

const MiniMetric: React.FC<{ label: string; value: string; tone?: 'profit' | 'loss' | 'neutral' }> = ({
    label,
    value,
    tone = 'neutral',
}) => {
    const toneClass = tone === 'profit'
        ? 'text-emerald-600'
        : tone === 'loss'
            ? 'text-rose-600'
            : 'text-gray-900';

    return (
        <div className="rounded-lg bg-gray-50 px-3 py-3">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-sm font-semibold tabular-nums ${toneClass}`}>{value}</p>
        </div>
    );
};

const TradingCommandCenter: React.FC<TradingCommandCenterProps> = ({
    trades,
    stats,
    advancedStats,
    equityCurveData,
    goals,
    streak,
    startingBalance,
    onAddTrade,
    onAddGoal,
}) => {
    const status = useMemo(() => getTradingStatus(trades, startingBalance), [trades, startingBalance]);
    const discipline = useMemo(() => calculateDisciplineScore(trades), [trades]);
    const statusStyle = statusStyles[status.tone];
    const bestGoal = goals[0];

    return (
        <div className="space-y-4">
            <section className={`rounded-xl p-5 ${statusStyle.surface}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${statusStyle.iconSurface}`}>
                            {statusStyle.icon}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${statusStyle.text}`}>Trading Status</p>
                            <h2 className="mt-1 text-2xl font-bold text-gray-950 text-balance">{status.title}</h2>
                            <p className="mt-1 max-w-2xl text-sm text-gray-600 text-pretty">{status.message}</p>
                            <p className="mt-3 text-sm font-medium text-gray-800 text-pretty">{status.action}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[460px]">
                        <MiniMetric
                            label="Today P&L"
                            value={formatCurrency(status.dailyPnL)}
                            tone={status.dailyPnL > 0 ? 'profit' : status.dailyPnL < 0 ? 'loss' : 'neutral'}
                        />
                        <MiniMetric
                            label="Today Return"
                            value={`${status.dailyReturn > 0 ? '+' : ''}${status.dailyReturn.toFixed(2)}%`}
                            tone={status.dailyReturn > 0 ? 'profit' : status.dailyReturn < 0 ? 'loss' : 'neutral'}
                        />
                        <MiniMetric label="Record" value={`${status.wins}W / ${status.losses}L`} />
                        <MiniMetric label="Emotion Flags" value={status.emotionalTrades.toString()} tone={status.emotionalTrades > 0 ? 'loss' : 'neutral'} />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <EquityCurve data={equityCurveData} goals={goals} />

                <div className="space-y-4">
                    <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Discipline Score</p>
                                <p className="mt-2 text-3xl font-bold text-gray-950 tabular-nums">{discipline.score}%</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">{discipline.label}</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full ${discipline.score >= 80 ? 'bg-emerald-500' : discipline.score >= 55 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${discipline.score}%` }}
                            />
                        </div>
                        <p className="mt-3 text-sm text-gray-500 text-pretty">{discipline.note}</p>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-500" />
                            <p className="font-semibold text-gray-900">Next Best Action</p>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 text-pretty">
                            {bestGoal
                                ? `Keep the active goal visible: ${bestGoal.title}.`
                                : 'Add one goal so the journal can judge execution against a specific target.'}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={onAddTrade}
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-[scale,background-color] duration-150 ease-out hover:bg-orange-600 active:scale-[0.96]"
                            >
                                <Plus className="h-4 w-4" />
                                Add Trade
                            </button>
                            <button
                                type="button"
                                onClick={onAddGoal}
                                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-[scale,background-color,color] duration-150 ease-out hover:bg-gray-200 hover:text-gray-900 active:scale-[0.96]"
                            >
                                Goal
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <p className="text-sm font-medium text-gray-500">Session Risk</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <MiniMetric
                                label="Expectancy"
                                value={formatCurrency(advancedStats.expectancy)}
                                tone={advancedStats.expectancy > 0 ? 'profit' : advancedStats.expectancy < 0 ? 'loss' : 'neutral'}
                            />
                            <MiniMetric
                                label="Max DD"
                                value={`${advancedStats.maxDrawdownPercent.toFixed(2)}%`}
                                tone={advancedStats.maxDrawdownValue > 0 ? 'loss' : 'neutral'}
                            />
                            <MiniMetric
                                label="Win Rate"
                                value={`${stats.winRate}%`}
                                tone={stats.winRate >= 50 ? 'profit' : stats.totalTrades > 0 ? 'loss' : 'neutral'}
                            />
                            <MiniMetric
                                label="Streak"
                                value={streak.count > 0 ? `${streak.count} ${streak.type}` : 'None'}
                                tone={streak.type === 'win' ? 'profit' : streak.type === 'loss' ? 'loss' : 'neutral'}
                            />
                        </div>
                        <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                            {advancedStats.expectancy >= 0 ? (
                                <TrendingUp className="mt-0.5 h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="mt-0.5 h-4 w-4 text-rose-500" />
                            )}
                            <p className="text-sm text-gray-600 text-pretty">
                                {advancedStats.expectancy >= 0
                                    ? 'The edge is currently positive. The design goal is to protect it from emotional trades.'
                                    : 'Expectancy is negative. Prioritize filtering setups before adding more volume.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TradingCommandCenter;
