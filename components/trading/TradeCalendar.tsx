import React, { useState, useMemo } from 'react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradeCalendarProps {
    trades: Trade[];
    onSelectTrade: (trade: Trade) => void;
    onSelectDay: (date: Date, trades: Trade[]) => void;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades, onSelectTrade, onSelectDay }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
        const tradesByDate: { [key: string]: Trade[] } = {};

        trades.forEach((trade) => {
            if (trade.entryDate?.toDate) {
                const date = trade.entryDate.toDate();
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!tradesByDate[dateKey]) {
                    tradesByDate[dateKey] = [];
                }
                tradesByDate[dateKey].push(trade);
            }
        });

        const dailyPnLs = Object.values(tradesByDate).map((dayTrades) =>
            dayTrades.reduce((sum, trade) => sum + trade.pnl, 0)
        );
        const maxAbsDailyPnL = Math.max(0, ...dailyPnLs.map((pnl) => Math.abs(pnl)));

        return { startingDayOfWeek, daysInMonth, totalCells, tradesByDate, maxAbsDailyPnL };
    }, [currentDate, trades]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getHeatmapClass = (dailyPnL: number) => {
        if (dailyPnL === 0 || calendarData.maxAbsDailyPnL === 0) {
            return 'bg-white';
        }

        const intensity = Math.ceil((Math.abs(dailyPnL) / calendarData.maxAbsDailyPnL) * 3);

        if (dailyPnL > 0) {
            if (intensity >= 3) return 'bg-emerald-100';
            if (intensity === 2) return 'bg-emerald-50';
            return 'bg-emerald-50/60';
        }

        if (intensity >= 3) return 'bg-rose-100';
        if (intensity === 2) return 'bg-rose-50';
        return 'bg-rose-50/60';
    };

    const renderCalendarCells = () => {
        const cells = [];
        const { startingDayOfWeek, daysInMonth, totalCells, tradesByDate } = calendarData;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        for (let i = 0; i < totalCells; i++) {
            const dayNumber = i - startingDayOfWeek + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const date = new Date(year, month, dayNumber);
            const dateKey = `${year}-${month}-${dayNumber}`;
            const dayTrades = tradesByDate[dateKey] || [];
            const dailyPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            const wins = dayTrades.filter((trade) => trade.status === 'WIN').length;
            const losses = dayTrades.filter((trade) => trade.status === 'LOSS').length;
            const hasTrades = dayTrades.length > 0;

            const isToday = isCurrentMonth &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

            cells.push(
                <div
                    key={i}
                    role={hasTrades ? 'button' : undefined}
                    tabIndex={hasTrades ? 0 : undefined}
                    onClick={() => {
                        if (hasTrades) onSelectDay(date, dayTrades);
                    }}
                    onKeyDown={(event) => {
                        if (!hasTrades) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelectDay(date, dayTrades);
                        }
                    }}
                    className={`min-h-28 p-2 transition-[background-color,box-shadow] duration-150 ease-out ${isCurrentMonth
                        ? getHeatmapClass(dailyPnL)
                        : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-orange-400 ring-inset' : ''} ${hasTrades ? 'cursor-pointer hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]' : ''}`}
                >
                    {isCurrentMonth && (
                        <>
                            <div className={`mb-1 text-sm font-medium ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                                {dayNumber}
                            </div>

                            {hasTrades && (
                                <div className="space-y-1.5">
                                    <div className={`rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums ${dailyPnL > 0
                                        ? 'bg-white/75 text-emerald-700'
                                        : dailyPnL < 0
                                            ? 'bg-white/75 text-rose-700'
                                            : 'bg-white/75 text-gray-700'
                                        }`}>
                                        {formatCurrency(dailyPnL)}
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {dayTrades.slice(0, 3).map((trade) => (
                                            <button
                                                key={trade.id}
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onSelectTrade(trade);
                                                }}
                                                className={`flex h-7 min-w-7 items-center justify-center rounded px-1 text-[11px] font-bold text-white transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96] ${trade.status === 'WIN'
                                                    ? 'bg-emerald-500'
                                                    : trade.status === 'LOSS'
                                                        ? 'bg-rose-500'
                                                        : 'bg-gray-400'
                                                    }`}
                                                title={`${trade.symbol}: ${formatCurrency(trade.pnl)}`}
                                            >
                                                {trade.symbol.substring(0, 2)}
                                            </button>
                                        ))}
                                        {dayTrades.length > 3 && (
                                            <div className="flex h-7 min-w-7 items-center justify-center rounded bg-gray-200 px-1 text-xs font-bold text-gray-600">
                                                +{dayTrades.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {(wins > 0 || losses > 0) && (
                                        <div className="text-xs text-gray-500">
                                            {wins}W {losses}L
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            );
        }

        return cells;
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
                    <p className="mt-1 text-sm text-gray-500">Daily P&L heatmap</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-[scale,background-color] duration-150 ease-out hover:bg-gray-200 active:scale-[0.96]"
                        title="Previous Month"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={goToToday}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-[scale,background-color] duration-150 ease-out hover:bg-gray-200 active:scale-[0.96]"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={goToNextMonth}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-[scale,background-color] duration-150 ease-out hover:bg-gray-200 active:scale-[0.96]"
                        title="Next Month"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-2 grid grid-cols-7 gap-px">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200">
                    {renderCalendarCells()}
                </div>
            </div>
        </div>
    );
};

export default TradeCalendar;
