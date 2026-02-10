// Trading Journal Utility Functions

import { Timestamp } from 'firebase/firestore';

export interface Trade {
    id: string;
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryDate: Timestamp;
    entryPrice: number;
    exitPrice: number;
    stopLoss: number;
    lotSize: number;
    pnl: number;
    rr?: number; // R-Multiple
    status: 'WIN' | 'LOSS' | 'BE';
    setup: string;
    emotions: string;
    notes: string;
    screenshotUrl?: string;
    createdAt: Timestamp;
}

export interface TradeFormData {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryDate: string;
    entryPrice: string;
    exitPrice: string;
    stopLoss: string;
    lotSize: string;
    setup: string;
    emotions: string;
    notes: string;
    screenshotUrl: string;
}

export interface TradingStats {
    totalPnL: number;
    winRate: number;
    profitFactor: number;
    avgRR: number;
    totalTrades: number;
    wins: number;
    losses: number;
}

export interface EquityPoint {
    date: string;
    timestamp: number; // For accurate X-axis positioning
    cumulativePnL: number;
    tradeNumber: number;
    trade?: Trade; // Reference to the trade for markers
}

export interface DrawdownPoint {
    date: string;
    timestamp: number; // For accurate X-axis positioning
    drawdown: number; // Percentage from peak
    drawdownValue: number; // Absolute value
}

// Goal types for tracking
export type GoalType = 'balance' | 'behavior' | 'winRate' | 'streak';

export interface Goal {
    id: string;
    type: GoalType;
    title: string;
    target: number;
    current: number;
    unit: string; // '$', '%', 'days', 'trades'
    deadline?: Timestamp;
    createdAt: Timestamp;
    completed: boolean;
    behaviorToAvoid?: string; // For behavior goals (e.g., 'Revenge', 'FOMO')
}

// Streak info for display
export interface StreakInfo {
    type: 'win' | 'loss' | 'neutral';
    count: number;
    message: string;
}

// Time range options
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

// Emotion/Psychology options for the dropdown
export const EMOTION_OPTIONS = [
    'Disciplined',
    'Confident',
    'FOMO',
    'Revenge',
    'Bored',
    'Overconfident',
    'Fearful',
    'Anxious',
    'Greedy',
    'Patient',
    'Impulsive',
];

// Common trading setups
// Common trading setups
export const SETUP_OPTIONS = [
    'Support',
    'Resistance',
    'Breakout',
    'News Trade',
    'Scalp',
];

/**
 * Calculate P&L for a single trade
 */
export const calculatePnL = (
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    lotSize: number
): number => {
    const priceChange = direction === 'LONG'
        ? exitPrice - entryPrice
        : entryPrice - exitPrice;

    return priceChange * lotSize;
};

/**
 * Determine trade status based on P&L
 */
export const getTradeStatus = (pnl: number): 'WIN' | 'LOSS' | 'BE' => {
    if (pnl > 0) return 'WIN';
    if (pnl < 0) return 'LOSS';
    return 'BE';
};

// Alias for backwards compatibility
export const determineStatus = getTradeStatus;

/**
 * Calculate cumulative P&L array for the equity curve chart
 */
export const calculateCumulativePnL = (trades: Trade[], startingBalance: number = 0): EquityPoint[] => {
    if (trades.length === 0) {
        // Return a single point for the starting balance if no trades
        return [{
            date: 'Start',
            timestamp: Date.now(),
            cumulativePnL: startingBalance,
            tradeNumber: 0,
        }];
    }

    // Sort trades by entry date (oldest first)
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = a.entryDate?.toDate?.() || new Date(0);
        const dateB = b.entryDate?.toDate?.() || new Date(0);
        return dateA.getTime() - dateB.getTime();
    });

    let cumulative = startingBalance;

    // Start point: 1 day before first trade or just use first trade time - slight offset
    const firstTradeDate = sortedTrades[0].entryDate?.toDate?.() || new Date();
    const startDate = new Date(firstTradeDate);
    startDate.setDate(startDate.getDate() - 1);

    const points: EquityPoint[] = [{
        date: 'Start',
        timestamp: startDate.getTime(),
        cumulativePnL: startingBalance,
        tradeNumber: 0,
    }];

    sortedTrades.forEach((trade, index) => {
        cumulative += trade.pnl;
        const entryDate = trade.entryDate?.toDate?.() || new Date();
        const date = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Ensure strictly increasing timestamps if multiple trades on exact same millisecond (rare but possible)
        let timestamp = entryDate.getTime();
        if (points.length > 0 && timestamp <= points[points.length - 1].timestamp) {
            timestamp = points[points.length - 1].timestamp + 1;
        }

        points.push({
            date,
            timestamp,
            cumulativePnL: Math.round(cumulative * 100) / 100,
            tradeNumber: index + 1,
            trade, // Store reference for markers
        });
    });

    return points;
};

/**
 * Calculate all trading statistics from an array of trades
 */
export const calculateStats = (trades: Trade[]): TradingStats => {
    if (trades.length === 0) {
        return {
            totalPnL: 0,
            winRate: 0,
            profitFactor: 0,
            avgRR: 0,
            totalTrades: 0,
            wins: 0,
            losses: 0,
        };
    }

    const wins = trades.filter(t => t.status === 'WIN');
    const losses = trades.filter(t => t.status === 'LOSS');

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = (wins.length / trades.length) * 100;

    // Profit Factor = Gross Profit / Gross Loss (absolute value)
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Average R:R = Average Win / Average Loss (absolute value)
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    return {
        totalPnL: Math.round(totalPnL * 100) / 100,
        winRate: Math.round(winRate * 10) / 10,
        profitFactor: profitFactor === Infinity ? 999 : Math.round(profitFactor * 100) / 100,
        avgRR: avgRR === Infinity ? 999 : Math.round(avgRR * 100) / 100,
        totalTrades: trades.length,
        wins: wins.length,
        losses: losses.length,
    };
};

/**
 * Format currency with + prefix for positive values
 */
export const formatCurrency = (amount: number, showSign: boolean = true): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (!showSign) return `$${formatted}`;
    if (amount > 0) return `+$${formatted}`;
    if (amount < 0) return `-$${formatted}`;
    return `$${formatted}`;
};

/**
 * Get initial form data for adding a new trade
 */
export const getInitialTradeFormData = (): TradeFormData => ({
    symbol: '',
    direction: 'LONG',
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    lotSize: '',
    setup: '',
    emotions: EMOTION_OPTIONS[0],
    notes: '',
    screenshotUrl: '',
});

/**
 * Calculate current win/loss streak from trades
 */
export const calculateStreak = (trades: Trade[]): StreakInfo => {
    if (trades.length === 0) {
        return { type: 'neutral', count: 0, message: 'Start trading to build your streak!' };
    }

    // Sort by date descending (most recent first)
    const sortedTrades = [...trades].sort((a, b) =>
        b.entryDate.toMillis() - a.entryDate.toMillis()
    );

    // Start from the most recent non-BE trade
    let firstStatus: 'WIN' | 'LOSS' | null = null;
    for (const trade of sortedTrades) {
        if (trade.status !== 'BE') {
            firstStatus = trade.status;
            break;
        }
    }

    if (!firstStatus) {
        return { type: 'neutral', count: 0, message: 'No streak yet' };
    }

    let streak = 0;
    for (const trade of sortedTrades) {
        if (trade.status === firstStatus) {
            streak++;
        } else if (trade.status !== 'BE') {
            break;
        }
    }

    if (firstStatus === 'WIN') {
        if (streak >= 5) return { type: 'win', count: streak, message: `🔥 ${streak}-trade win streak! You're on fire!` };
        if (streak >= 3) return { type: 'win', count: streak, message: `🔥 ${streak}-trade win streak! Keep it up!` };
        return { type: 'win', count: streak, message: `✅ ${streak} winning trade${streak > 1 ? 's' : ''} in a row!` };
    } else {
        if (streak >= 5) return { type: 'loss', count: streak, message: `⚠️ ${streak} consecutive losses. Consider taking a break.` };
        if (streak >= 3) return { type: 'loss', count: streak, message: `⚠️ ${streak} consecutive losses. Review your rules.` };
        return { type: 'loss', count: streak, message: `📉 ${streak} losing trade${streak > 1 ? 's' : ''}. Stay disciplined.` };
    }
};

/**
 * Calculate drawdown from equity curve
 * Returns array of drawdown points showing how far below peak equity
 */
export const calculateDrawdown = (equityPoints: EquityPoint[]): DrawdownPoint[] => {
    if (equityPoints.length === 0) return [];

    const drawdownPoints: DrawdownPoint[] = [];
    let peak = equityPoints[0].cumulativePnL;

    equityPoints.forEach((point) => {
        const currentEquity = point.cumulativePnL;

        // Update peak if we have new high
        if (currentEquity > peak) {
            peak = currentEquity;
        }

        // Calculate drawdown
        const drawdownValue = peak - currentEquity;
        const drawdownPercent = peak > 0 ? (drawdownValue / peak) * 100 : 0;

        drawdownPoints.push({
            date: point.date,
            timestamp: point.timestamp,
            drawdown: Math.round(drawdownPercent * 100) / 100,
            drawdownValue: Math.round(drawdownValue * 100) / 100,
        });
    });

    return drawdownPoints;
};

/**
 * Filter equity points by time range
 */
export const filterEquityByTimeRange = (
    equityPoints: EquityPoint[],
    range: TimeRange
): EquityPoint[] => {
    if (range === 'ALL' || equityPoints.length === 0) {
        return equityPoints;
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
        case '1D':
            cutoffDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
            break;
        case '1W':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1M':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case '3M':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case '6M':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case '1Y':
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            return equityPoints;
    }

    const cutoffTime = cutoffDate.getTime();

    // Filter points, but always include the starting point if it falls within range OR just re-normalize?
    // Actually, usually charts just show data within that range.
    // If we cut off the start, we might start from a non-zero PnL relative to that range start.
    // But equity curve usually shows absolute equity. So it's fine.

    // Strategy: Include all points after cutoff. 
    // And include the point just BEFORE cutoff as the "start" for continuity?

    const filtered = equityPoints.filter((point) => point.timestamp >= cutoffTime);

    // If no points in range, return at least the last known point or something
    if (filtered.length === 0) {
        return [equityPoints[equityPoints.length - 1]];
    }

    return filtered;
};

/**
 * Generate benchmark data for comparison
 * Creates a line showing expected growth at a given monthly return rate
 */
export const generateBenchmarkData = (
    startingBalance: number,
    startDate: Date,
    endDate: Date,
    monthlyReturnPercent: number = 3
): EquityPoint[] => {
    const points: EquityPoint[] = [];

    // Calculate daily return rate from monthly target
    // value * (1 + monthly)^months = value * (1 + daily)^days
    // (1 + monthly) = (1 + daily)^30
    // daily = (1 + monthly)^(1/30) - 1

    const monthlyMultiplier = 1 + (monthlyReturnPercent / 100);
    const dailyMultiplier = Math.pow(monthlyMultiplier, 1 / 30);

    const current = new Date(startDate);
    const end = new Date(endDate);

    // Ensure we cover the full range
    if (end < current) { // Handle case where end date is same as start
        end.setDate(end.getDate() + 1);
    }

    let balance = startingBalance;
    let dayCount = 0;

    // Add start point
    points.push({
        date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: current.getTime(),
        cumulativePnL: balance,
        tradeNumber: dayCount,
    });

    while (current < end) {
        current.setDate(current.getDate() + 1);
        dayCount++;
        balance = balance * dailyMultiplier;

        points.push({
            date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            timestamp: current.getTime(),
            cumulativePnL: Math.round(balance * 100) / 100,
            tradeNumber: dayCount,
        });
    }

    return points;
};
