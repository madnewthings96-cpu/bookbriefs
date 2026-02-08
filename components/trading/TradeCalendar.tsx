import React, { useState, useMemo } from 'react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradeCalendarProps {
    trades: Trade[];
    onEditTrade: (trade: Trade) => void;
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades, onEditTrade }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get calendar data for current month
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of month and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get day of week for first day (0 = Sunday)
        const startingDayOfWeek = firstDay.getDay();

        // Calculate days to show from previous month
        const daysInMonth = lastDay.getDate();
        const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

        // Group trades by date
        const tradesByDate: { [key: string]: Trade[] } = {};
        trades.forEach(trade => {
            if (trade.entryDate?.toDate) {
                const date = trade.entryDate.toDate();
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!tradesByDate[dateKey]) {
                    tradesByDate[dateKey] = [];
                }
                tradesByDate[dateKey].push(trade);
            }
        });

        return { startingDayOfWeek, daysInMonth, totalCells, tradesByDate };
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

            // Calculate daily P&L
            const dailyPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            const wins = dayTrades.filter(t => t.status === 'WIN').length;
            const losses = dayTrades.filter(t => t.status === 'LOSS').length;

            const isToday = isCurrentMonth &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

            cells.push(
                <div
                    key={i}
                    className={`min-h-24 border border-gray-100 p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-orange-400' : ''}`}
                >
                    {isCurrentMonth && (
                        <>
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-orange-600' : 'text-gray-700'
                                }`}>
                                {dayNumber}
                            </div>

                            {dayTrades.length > 0 && (
                                <div className="space-y-1">
                                    {/* Daily Summary */}
                                    <div className={`text-xs font-semibold px-1.5 py-0.5 rounded ${dailyPnL > 0
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : dailyPnL < 0
                                            ? 'bg-rose-50 text-rose-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {formatCurrency(dailyPnL)}
                                    </div>

                                    {/* Trade indicators */}
                                    <div className="flex gap-1 flex-wrap">
                                        {dayTrades.slice(0, 3).map((trade, idx) => (
                                            <button
                                                key={trade.id}
                                                onClick={() => onEditTrade(trade)}
                                                className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-transform hover:scale-110 ${trade.status === 'WIN'
                                                    ? 'bg-emerald-500 text-white'
                                                    : trade.status === 'LOSS'
                                                        ? 'bg-rose-500 text-white'
                                                        : 'bg-gray-400 text-white'
                                                    }`}
                                                title={`${trade.symbol}: ${formatCurrency(trade.pnl)}${trade.screenshotUrl ? ' 📷' : ''}`}
                                            >
                                                {trade.symbol.substring(0, 2)}
                                            </button>
                                        ))}
                                        {dayTrades.length > 3 && (
                                            <div className="w-6 h-6 rounded bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
                                                +{dayTrades.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {/* Win/Loss count */}
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        title="Previous Month"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 text-sm font-medium"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        title="Next Month"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                    {renderCalendarCells()}
                </div>
            </div>
        </div>
    );
};

export default TradeCalendar;
