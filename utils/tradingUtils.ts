// Trading Journal Utility Functions

import { Timestamp } from 'firebase/firestore';

export interface Trade {
    id: string;
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryDate: Timestamp;
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
    pnl: number;
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
    cumulativePnL: number;
    tradeNumber: number;
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
export const SETUP_OPTIONS = [
    'Support Bounce',
    'Resistance Rejection',
    'Breakout',
    'Trend Continuation',
    'News Trade',
    'Scalp',
];

/**
 * Calculate P&L for a single trade
 * For forex/gold: (exit - entry) * lotSize * 100
 */
export const calculatePnL = (
    entryPrice: number,
    exitPrice: number,
    lotSize: number,
    direction: 'LONG' | 'SHORT'
): number => {
    const pipMultiplier = 100; // For XAUUSD and similar
    const rawPnL = (exitPrice - entryPrice) * lotSize * pipMultiplier;
    return direction === 'SHORT' ? -rawPnL : rawPnL;
};

/**
 * Determine trade status based on P&L
 */
export const determineStatus = (pnl: number): 'WIN' | 'LOSS' | 'BE' => {
    if (pnl > 0) return 'WIN';
    if (pnl < 0) return 'LOSS';
    return 'BE';
};

/**
 * Calculate cumulative P&L array for the equity curve chart
 */
export const calculateCumulativePnL = (trades: Trade[], startingBalance: number = 0): EquityPoint[] => {
    if (trades.length === 0) {
        // Return a single point for the starting balance if no trades
        return [{
            date: 'Start',
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
    const points: EquityPoint[] = [{
        date: 'Start',
        cumulativePnL: startingBalance,
        tradeNumber: 0,
    }];

    sortedTrades.forEach((trade, index) => {
        cumulative += trade.pnl;
        const date = trade.entryDate?.toDate?.()
            ? trade.entryDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : `Trade ${index + 1}`;

        points.push({
            date,
            cumulativePnL: Math.round(cumulative * 100) / 100,
            tradeNumber: index + 1,
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
    symbol: 'XAUUSD',
    direction: 'LONG',
    entryDate: new Date().toISOString().split('T')[0],
    entryPrice: '',
    exitPrice: '',
    lotSize: '0.10',
    setup: '',
    emotions: 'Disciplined',
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

    const firstStatus = sortedTrades[0].status;
    if (firstStatus === 'BE') {
        return { type: 'neutral', count: 0, message: 'Break-even trade. Keep going!' };
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
