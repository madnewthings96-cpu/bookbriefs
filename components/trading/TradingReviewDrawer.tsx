import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    X,
    ExternalLink,
    Pencil,
    Trash2,
    CalendarDays,
    Camera,
    Brain,
    Target,
} from 'lucide-react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';

interface SelectedDay {
    date: Date;
    trades: Trade[];
}

interface TradingReviewDrawerProps {
    trade: Trade | null;
    day: SelectedDay | null;
    onClose: () => void;
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
    onSelectTrade: (trade: Trade) => void;
}

const formatTradeDate = (trade: Trade): string => {
    if (!trade.entryDate?.toDate) return 'No date';
    return trade.entryDate.toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatDayDate = (date: Date): string => date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

const getStatusClass = (pnl: number): string => {
    if (pnl > 0) return 'text-emerald-600 bg-emerald-50';
    if (pnl < 0) return 'text-rose-600 bg-rose-50';
    return 'text-gray-600 bg-gray-100';
};

const MetricTile: React.FC<{ label: string; value: string; tone?: 'profit' | 'loss' | 'neutral' }> = ({
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
        <div className="rounded-lg bg-gray-50 px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`mt-1 text-sm font-semibold tabular-nums ${toneClass}`}>{value}</p>
        </div>
    );
};

const TradeBody: React.FC<{
    trade: Trade;
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
}> = ({ trade, onEdit, onDelete }) => {
    const pnlTone = trade.pnl > 0 ? 'profit' : trade.pnl < 0 ? 'loss' : 'neutral';
    const pricePrecision = trade.symbol.toUpperCase().includes('XAUUSD')
        ? 2
        : trade.symbol.toUpperCase().includes('JPY')
            ? 3
            : 5;

    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{formatTradeDate(trade)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-900 text-balance">{trade.symbol}</h2>
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${trade.direction === 'LONG'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                                }`}>
                                {trade.direction}
                            </span>
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusClass(trade.pnl)}`}>
                                {trade.status}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl font-bold tabular-nums ${trade.pnl > 0
                            ? 'text-emerald-600'
                            : trade.pnl < 0
                                ? 'text-rose-600'
                                : 'text-gray-900'
                            }`}>
                            {formatCurrency(trade.pnl)}
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-500 tabular-nums">
                            {trade.rr ? `${trade.rr > 0 ? '+' : ''}${trade.rr}R` : 'No R recorded'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                    <MetricTile label="Entry" value={trade.entryPrice.toFixed(pricePrecision)} />
                    <MetricTile label="Exit" value={trade.exitPrice.toFixed(pricePrecision)} />
                    <MetricTile label="Stop Loss" value={trade.stopLoss.toFixed(pricePrecision)} />
                    <MetricTile label="Lot Size" value={trade.lotSize.toString()} />
                    <MetricTile label="Risk Multiple" value={trade.rr ? `${trade.rr > 0 ? '+' : ''}${trade.rr}R` : '-'} tone={pnlTone} />
                    <MetricTile label="P&L" value={formatCurrency(trade.pnl)} tone={pnlTone} />
                </div>

                <div className="mt-5 space-y-4">
                    <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Target className="h-4 w-4 text-orange-500" />
                            Setup
                        </div>
                        <p className="text-sm text-gray-600 text-pretty">{trade.setup || 'No setup recorded.'}</p>
                    </section>

                    <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Brain className="h-4 w-4 text-violet-500" />
                            Psychology
                        </div>
                        <p className="text-sm text-gray-600 text-pretty">{trade.emotions || 'No emotion recorded.'}</p>
                    </section>

                    <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                        <p className="mb-2 text-sm font-semibold text-gray-800">Notes</p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 text-pretty">
                            {trade.notes || 'No trade notes yet.'}
                        </p>
                    </section>

                    {trade.screenshotUrl && (
                        <section className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <Camera className="h-4 w-4 text-gray-500" />
                                Screenshot
                            </div>
                            <a
                                href={trade.screenshotUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-semibold text-white transition-[scale,background-color] duration-150 ease-out hover:bg-gray-800 active:scale-[0.96]"
                            >
                                Open screenshot
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </section>
                    )}
                </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-white px-5 py-4">
                <button
                    type="button"
                    onClick={() => onEdit(trade)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-[scale,background-color] duration-150 ease-out hover:bg-orange-600 active:scale-[0.96]"
                >
                    <Pencil className="h-4 w-4" />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(trade.id)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-[scale,background-color] duration-150 ease-out hover:bg-rose-100 active:scale-[0.96]"
                    title="Delete trade"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

const DayBody: React.FC<{
    day: SelectedDay;
    onSelectTrade: (trade: Trade) => void;
}> = ({ day, onSelectTrade }) => {
    const dayPnL = day.trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = day.trades.filter((trade) => trade.status === 'WIN').length;
    const losses = day.trades.filter((trade) => trade.status === 'LOSS').length;
    const breakEven = day.trades.filter((trade) => trade.status === 'BE').length;
    const avgRTrades = day.trades.filter((trade) => typeof trade.rr === 'number' && Number.isFinite(trade.rr));
    const avgR = avgRTrades.length > 0
        ? avgRTrades.reduce((sum, trade) => sum + (trade.rr || 0), 0) / avgRTrades.length
        : 0;

    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-5 py-5">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <CalendarDays className="h-4 w-4" />
                    Day Review
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900 text-balance">{formatDayDate(day.date)}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                    <MetricTile label="Daily P&L" value={formatCurrency(dayPnL)} tone={dayPnL > 0 ? 'profit' : dayPnL < 0 ? 'loss' : 'neutral'} />
                    <MetricTile label="Trades" value={day.trades.length.toString()} />
                    <MetricTile label="Record" value={`${wins}W / ${losses}L / ${breakEven}BE`} />
                    <MetricTile label="Avg R" value={`${avgR > 0 ? '+' : ''}${avgR.toFixed(2)}R`} tone={avgR > 0 ? 'profit' : avgR < 0 ? 'loss' : 'neutral'} />
                </div>

                <div className="mt-5 space-y-3">
                    {day.trades.map((trade) => (
                        <button
                            key={trade.id}
                            type="button"
                            onClick={() => onSelectTrade(trade)}
                            className="w-full rounded-xl bg-white p-4 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[scale,box-shadow] duration-150 ease-out hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)] active:scale-[0.96]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">{trade.symbol}</span>
                                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${trade.direction === 'LONG'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                            }`}>
                                            {trade.direction}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">{trade.setup || 'No setup'}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold tabular-nums ${trade.pnl > 0
                                        ? 'text-emerald-600'
                                        : trade.pnl < 0
                                            ? 'text-rose-600'
                                            : 'text-gray-700'
                                        }`}>
                                        {formatCurrency(trade.pnl)}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">{trade.rr ? `${trade.rr > 0 ? '+' : ''}${trade.rr}R` : '-'}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TradingReviewDrawer: React.FC<TradingReviewDrawerProps> = ({
    trade,
    day,
    onClose,
    onEdit,
    onDelete,
    onSelectTrade,
}) => {
    const isOpen = !!trade || !!day;

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <motion.button
                        type="button"
                        aria-label="Close review drawer"
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    />
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        className="absolute right-0 top-0 h-full w-full max-w-xl overflow-hidden bg-white shadow-2xl sm:rounded-l-2xl"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06)] transition-[scale,background-color,color] duration-150 ease-out hover:bg-gray-50 hover:text-gray-900 active:scale-[0.96]"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {trade ? (
                            <TradeBody trade={trade} onEdit={onEdit} onDelete={onDelete} />
                        ) : day ? (
                            <DayBody day={day} onSelectTrade={onSelectTrade} />
                        ) : null}
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TradingReviewDrawer;
