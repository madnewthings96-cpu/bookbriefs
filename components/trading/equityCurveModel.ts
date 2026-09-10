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

const getRecovery = (data: EquityPoint[], maxDrawdownPercent: number) => {
    if (maxDrawdownPercent === 0) {
        return { recoveryTrades: 0, recoveryLabel: 'At peak' };
    }

    let runningPeak = data[0].cumulativePnL;
    let troughIndex = -1;
    let troughPeak = runningPeak;

    for (let index = 0; index < data.length; index += 1) {
        const point = data[index];
        runningPeak = Math.max(runningPeak, point.cumulativePnL);
        const drawdown = runningPeak > 0
            ? roundPercentage(((runningPeak - point.cumulativePnL) / runningPeak) * 100)
            : 0;

        if (troughIndex === -1 && drawdown === maxDrawdownPercent) {
            troughIndex = index;
            troughPeak = runningPeak;
        }
    }

    let recoveryTrades = 0;
    for (let index = troughIndex + 1; index < data.length; index += 1) {
        const point = data[index];
        if (point.tradeNumber > 0) recoveryTrades += 1;

        if (point.cumulativePnL >= troughPeak) {
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

    const drawdownByTimestamp = new Map(
        calculateDrawdown(data).map((point) => [point.timestamp, point.drawdown]),
    );
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
    const maxDrawdownPercent = Math.max(...calculateDrawdown(data).map((point) => point.drawdown));
    const currentDrawdownPercent = calculateDrawdown(data)[data.length - 1].drawdown;
    const recovery = getRecovery(data, maxDrawdownPercent);
    const insight = maxDrawdownPercent === 0
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
