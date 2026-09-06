import {
    AdvancedTradingStats,
    BreakdownStats,
    Trade,
    TradingStats,
    calculateAdvancedStats,
    calculateBreakdownStats,
    calculateCumulativePnL,
    calculateStats,
} from './tradingUtils';

export interface TradingReportTradeRow {
    id: string;
    date: string;
    symbol: string;
    direction: Trade['direction'];
    pnl: number;
    status: Trade['status'];
    rr: number | null;
    setup: string;
    emotion: string;
    notes: string;
}

export interface TradingReportEquityPoint {
    label: string;
    timestamp: number;
    balance: number;
}

export interface TradingReportHighlight {
    label: string;
    totalPnL: number;
    trades: number;
    winRate: number;
}

export interface MonthlyTradingReportModel {
    periodLabel: string;
    periodKey: string;
    openingBalance: number;
    closingBalance: number;
    returnAmount: number;
    returnPercent: number;
    stats: TradingStats;
    advancedStats: AdvancedTradingStats;
    setupBreakdowns: BreakdownStats[];
    emotionBreakdowns: BreakdownStats[];
    highlights: {
        bestSetup: TradingReportHighlight | null;
        costliestEmotion: TradingReportHighlight | null;
    };
    equityCurve: TradingReportEquityPoint[];
    tradeRows: TradingReportTradeRow[];
}

export interface BuildMonthlyTradingReportInput {
    trades: Trade[];
    startingBalance: number;
    month: number;
    year: number;
}

const round = (value: number, precision = 2): number => {
    const factor = 10 ** precision;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};

const toHighlight = (breakdown?: BreakdownStats): TradingReportHighlight | null => breakdown
    ? {
        label: breakdown.label,
        totalPnL: breakdown.totalPnL,
        trades: breakdown.trades,
        winRate: breakdown.winRate,
    }
    : null;

const tradeTime = (trade: Trade): number => trade.entryDate?.toDate?.().getTime() ?? 0;

export const getTradingReportFilename = (month: number, year: number): string => (
    `Ta7leel_Trading_Fieldbook_${year}-${String(month + 1).padStart(2, '0')}.pdf`
);

export const buildMonthlyTradingReportModel = ({
    trades,
    startingBalance,
    month,
    year,
}: BuildMonthlyTradingReportInput): MonthlyTradingReportModel => {
    const periodStart = new Date(Date.UTC(year, month, 1));
    const periodEnd = new Date(Date.UTC(year, month + 1, 1));
    const startTime = periodStart.getTime();
    const endTime = periodEnd.getTime();

    const priorPnL = trades
        .filter((trade) => tradeTime(trade) < startTime)
        .reduce((sum, trade) => sum + trade.pnl, 0);
    const monthlyTrades = trades.filter((trade) => {
        const timestamp = tradeTime(trade);
        return timestamp >= startTime && timestamp < endTime;
    });

    const openingBalance = round(startingBalance + priorPnL);
    const stats = calculateStats(monthlyTrades);
    const closingBalance = round(openingBalance + stats.totalPnL);
    const returnAmount = round(closingBalance - openingBalance);
    const returnPercent = openingBalance !== 0
        ? round((returnAmount / openingBalance) * 100)
        : 0;
    const setupBreakdowns = calculateBreakdownStats(monthlyTrades, 'setup');
    const emotionBreakdowns = calculateBreakdownStats(monthlyTrades, 'emotions');
    const bestSetup = [...setupBreakdowns]
        .sort((a, b) => b.totalPnL - a.totalPnL)
        .find((breakdown) => breakdown.totalPnL > 0);
    const costliestEmotion = [...emotionBreakdowns]
        .sort((a, b) => a.totalPnL - b.totalPnL)
        .find((breakdown) => breakdown.totalPnL < 0);

    return {
        periodLabel: periodStart.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }),
        periodKey: `${year}-${String(month + 1).padStart(2, '0')}`,
        openingBalance,
        closingBalance,
        returnAmount,
        returnPercent,
        stats,
        advancedStats: calculateAdvancedStats(monthlyTrades, openingBalance),
        setupBreakdowns,
        emotionBreakdowns,
        highlights: {
            bestSetup: toHighlight(bestSetup),
            costliestEmotion: toHighlight(costliestEmotion),
        },
        equityCurve: calculateCumulativePnL(monthlyTrades, openingBalance).map((point) => ({
            label: point.date,
            timestamp: point.timestamp,
            balance: point.cumulativePnL,
        })),
        tradeRows: [...monthlyTrades]
            .sort((a, b) => tradeTime(b) - tradeTime(a))
            .map((trade) => ({
                id: trade.id,
                date: trade.entryDate?.toDate?.().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                }) ?? '-',
                symbol: trade.symbol,
                direction: trade.direction,
                pnl: round(trade.pnl),
                status: trade.status,
                rr: typeof trade.rr === 'number' && Number.isFinite(trade.rr) ? round(trade.rr) : null,
                setup: trade.setup?.trim() || 'Unlabeled',
                emotion: trade.emotions?.trim() || 'Unlabeled',
                notes: trade.notes?.trim() || '',
            })),
    };
};
