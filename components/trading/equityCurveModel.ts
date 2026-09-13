import {
    calculateDrawdown,
    filterEquityByTimeRange,
    type EquityPoint,
} from '../../utils/tradingUtils';

export const EQUITY_CURVE_RANGES = ['1W', '1M', '3M', 'ALL'] as const;

export type EquityCurveRange = (typeof EQUITY_CURVE_RANGES)[number];

export interface EquityChartPoint extends EquityPoint {
    displayIndex: number;
    drawdownDepth: number;
}

export interface EquityCurveStory {
    points: EquityChartPoint[];
    currentEquity: number;
    startingEquity: number;
    totalReturn: number;
    returnPercent: number;
    peakEquity: number;
    currentDrawdownPercent: number;
    maxDrawdownPercent: number;
    recoveryTrades: number | null;
    recoveryLabel: string;
    insight: string;
}

const roundPercentage = (value: number) => Math.round(value * 100) / 100;

interface RawDrawdownState {
    drawdown: number;
    peakEquity: number;
}

const calculateRawDrawdowns = (data: EquityPoint[]): RawDrawdownState[] => {
    let peakEquity = data[0].cumulativePnL;

    return data.map((point) => {
        peakEquity = Math.max(peakEquity, point.cumulativePnL);
        return {
            drawdown: peakEquity > 0 ? ((peakEquity - point.cumulativePnL) / peakEquity) * 100 : 0,
            peakEquity,
        };
    });
};

const getRecovery = (data: EquityPoint[], rawDrawdowns: RawDrawdownState[]) => {
    let worstTroughIndex = 0;

    for (let index = 1; index < rawDrawdowns.length; index += 1) {
        if (rawDrawdowns[index].drawdown > rawDrawdowns[worstTroughIndex].drawdown) {
            worstTroughIndex = index;
        }
    }

    const worstTrough = rawDrawdowns[worstTroughIndex];
    if (worstTrough.drawdown === 0) {
        return { recoveryTrades: 0, recoveryLabel: 'At peak' };
    }

    let recoveryTrades = 0;
    for (let index = worstTroughIndex + 1; index < data.length; index += 1) {
        const point = data[index];
        if (point.tradeNumber > 0) recoveryTrades += 1;

        if (point.cumulativePnL >= worstTrough.peakEquity) {
            return {
                recoveryTrades,
                recoveryLabel: `${recoveryTrades} trade${recoveryTrades === 1 ? '' : 's'}`,
            };
        }
    }

    return { recoveryTrades: null, recoveryLabel: 'In progress' };
};

export const buildEquityCurveStory = (
    data: EquityPoint[],
    range: EquityCurveRange,
    now: Date = new Date(),
): EquityCurveStory => {
    if (data.length === 0) {
        return {
            points: [],
            currentEquity: 0,
            startingEquity: 0,
            totalReturn: 0,
            returnPercent: 0,
            peakEquity: 0,
            currentDrawdownPercent: 0,
            maxDrawdownPercent: 0,
            recoveryTrades: 0,
            recoveryLabel: 'At peak',
            insight: 'The account is at its equity high with no recorded drawdown.',
        };
    }

    const displayedDrawdowns = calculateDrawdown(data);
    const drawdownByTimestamp = new Map(
        displayedDrawdowns.map((point) => [point.timestamp, point.drawdown]),
    );
    const rawDrawdowns = calculateRawDrawdowns(data);
    const visiblePoints = filterEquityByTimeRange(data, range, now);
    const points = visiblePoints.map((point, displayIndex) => {
        const drawdown = drawdownByTimestamp.get(point.timestamp) || 0;
        return {
            ...point,
            displayIndex,
            drawdownDepth: drawdown === 0 ? 0 : -drawdown,
        };
    });
    const startingEquity = data[0].cumulativePnL;
    const currentEquity = data[data.length - 1].cumulativePnL;
    const totalReturn = currentEquity - startingEquity;
    const returnPercent = startingEquity > 0
        ? roundPercentage((totalReturn / startingEquity) * 100)
        : 0;
    const peakEquity = Math.max(...data.map((point) => point.cumulativePnL));
    const maxRawDrawdownPercent = Math.max(...rawDrawdowns.map((point) => point.drawdown));
    const maxDrawdownPercent = roundPercentage(maxRawDrawdownPercent);
    const currentDrawdownPercent = roundPercentage(rawDrawdowns[data.length - 1].drawdown);
    const recovery = getRecovery(data, rawDrawdowns);
    const insight = maxRawDrawdownPercent === 0
        ? 'The account is at its equity high with no recorded drawdown.'
        : recovery.recoveryTrades === null
            ? `Equity is ${currentDrawdownPercent.toFixed(2)}% below its latest peak; protect the recovery.`
            : `The account recovered from its largest drawdown in ${recovery.recoveryLabel}.`;

    return {
        points,
        currentEquity,
        startingEquity,
        totalReturn,
        returnPercent,
        peakEquity,
        currentDrawdownPercent,
        maxDrawdownPercent,
        recoveryTrades: recovery.recoveryTrades,
        recoveryLabel: recovery.recoveryLabel,
        insight,
    };
};
