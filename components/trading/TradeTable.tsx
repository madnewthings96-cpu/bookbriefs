import React, { useState, useMemo } from 'react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';
import {
    Inbox,
    Camera,
    Edit2,
    Trash2,
    Search,
    ArrowUpDown,
    SlidersHorizontal,
    X,
} from 'lucide-react';

interface TradeTableProps {
    trades: Trade[];
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
    onSelect?: (trade: Trade) => void;
    isLoading?: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onEdit, onDelete, onSelect, isLoading }) => {
    const [sortKey, setSortKey] = useState<keyof Trade>('entryDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
    const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
    const [filterSymbol, setFilterSymbol] = useState('ALL');
    const [filterSetup, setFilterSetup] = useState('ALL');
    const [filterEmotion, setFilterEmotion] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [onlyWithScreenshots, setOnlyWithScreenshots] = useState(false);

    const filterOptions = useMemo(() => {
        const symbols = Array.from(new Set(trades.map((trade) => trade.symbol).filter(Boolean))).sort();
        const setups = Array.from(new Set(trades.map((trade) => trade.setup).filter(Boolean))).sort();
        const emotions = Array.from(new Set(trades.map((trade) => trade.emotions).filter(Boolean))).sort();

        return { symbols, setups, emotions };
    }, [trades]);

    const processedTrades = useMemo(() => {
        let result = [...trades];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter((trade) =>
                (trade.symbol || '').toLowerCase().includes(lowerTerm) ||
                (trade.setup || '').toLowerCase().includes(lowerTerm) ||
                (trade.notes || '').toLowerCase().includes(lowerTerm) ||
                (trade.emotions || '').toLowerCase().includes(lowerTerm)
            );
        }

        if (filterStatus !== 'ALL') {
            result = result.filter((trade) => trade.status === filterStatus);
        }

        if (filterDirection !== 'ALL') {
            result = result.filter((trade) => trade.direction === filterDirection);
        }

        if (filterSymbol !== 'ALL') {
            result = result.filter((trade) => trade.symbol === filterSymbol);
        }

        if (filterSetup !== 'ALL') {
            result = result.filter((trade) => trade.setup === filterSetup);
        }

        if (filterEmotion !== 'ALL') {
            result = result.filter((trade) => trade.emotions === filterEmotion);
        }

        if (dateFrom || dateTo) {
            const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : -Infinity;
            const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : Infinity;

            result = result.filter((trade) => {
                if (!trade.entryDate?.toDate) return false;
                const tradeTime = trade.entryDate.toDate().getTime();
                return tradeTime >= fromTime && tradeTime <= toTime;
            });
        }

        if (onlyWithScreenshots) {
            result = result.filter((trade) => !!trade.screenshotUrl);
        }

        return result.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (aValue instanceof Object && 'toDate' in aValue && bValue instanceof Object && 'toDate' in bValue) {
                const aDate = (aValue as any).toDate();
                const bDate = (bValue as any).toDate();
                return sortDirection === 'asc'
                    ? aDate.getTime() - bDate.getTime()
                    : bDate.getTime() - aDate.getTime();
            }

            const aStr = String(aValue || '').toLowerCase();
            const bStr = String(bValue || '').toLowerCase();
            if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;

            return 0;
        });
    }, [
        trades,
        sortKey,
        sortDirection,
        searchTerm,
        filterStatus,
        filterDirection,
        filterSymbol,
        filterSetup,
        filterEmotion,
        dateFrom,
        dateTo,
        onlyWithScreenshots,
    ]);

    const hasActiveFilters = Boolean(
        searchTerm ||
        filterStatus !== 'ALL' ||
        filterDirection !== 'ALL' ||
        filterSymbol !== 'ALL' ||
        filterSetup !== 'ALL' ||
        filterEmotion !== 'ALL' ||
        dateFrom ||
        dateTo ||
        onlyWithScreenshots
    );

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('ALL');
        setFilterDirection('ALL');
        setFilterSymbol('ALL');
        setFilterSetup('ALL');
        setFilterEmotion('ALL');
        setDateFrom('');
        setDateTo('');
        setOnlyWithScreenshots(false);
    };

    const handleSort = (key: keyof Trade) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ column }: { column: keyof Trade }) => {
        if (sortKey !== column) {
            return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />;
        }

        return (
            <ArrowUpDown
                className={`ml-1 h-3 w-3 text-orange-500 ${sortDirection === 'asc' ? '' : 'rotate-180'}`}
            />
        );
    };

    const getStatusColor = (status: 'WIN' | 'LOSS' | 'BE') => {
        switch (status) {
            case 'WIN': return 'text-emerald-600';
            case 'LOSS': return 'text-rose-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: 'WIN' | 'LOSS' | 'BE') => {
        const baseClass = 'rounded px-2 py-0.5 text-xs font-semibold';
        switch (status) {
            case 'WIN': return `${baseClass} bg-emerald-100 text-emerald-700`;
            case 'LOSS': return `${baseClass} bg-rose-100 text-rose-700`;
            default: return `${baseClass} bg-gray-100 text-gray-700`;
        }
    };

    const getDirectionBadge = (direction: 'LONG' | 'SHORT') => {
        return direction === 'LONG'
            ? 'rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'
            : 'rounded border border-rose-100 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700';
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
        });
    };

    const formatPrice = (trade: Trade, price: number) => {
        if (trade.symbol.toUpperCase().includes('XAUUSD')) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        return price.toFixed(trade.symbol.toUpperCase().includes('JPY') ? 3 : 5);
    };

    const handleTradeAction = (event: React.MouseEvent, action: () => void) => {
        event.stopPropagation();
        action();
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-12 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
                <p className="text-gray-500">Loading trades...</p>
            </div>
        );
    }

    if (trades.length === 0 && !searchTerm) {
        return (
            <div className="rounded-xl bg-white p-12 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <Inbox className="mx-auto mb-4 h-16 w-16 text-gray-300" strokeWidth={1.5} />
                <p className="font-medium text-gray-600">No trades yet</p>
                <p className="mt-1 text-sm text-gray-400">Log your first trade to start seeing patterns.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Trade History</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {processedTrades.length} of {trades.length} trade{trades.length !== 1 ? 's' : ''} shown
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search symbol, setup, notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-72"
                                />
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-[scale,background-color,color] duration-150 ease-out hover:bg-gray-200 hover:text-gray-900 active:scale-[0.96]"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All Status</option>
                            <option value="WIN">Wins Only</option>
                            <option value="LOSS">Losses Only</option>
                            <option value="BE">Break Even</option>
                        </select>

                        <select
                            value={filterDirection}
                            onChange={(e) => setFilterDirection(e.target.value as any)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All Directions</option>
                            <option value="LONG">Longs</option>
                            <option value="SHORT">Shorts</option>
                        </select>

                        <select
                            value={filterSymbol}
                            onChange={(e) => setFilterSymbol(e.target.value)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All Symbols</option>
                            {filterOptions.symbols.map((symbol) => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>

                        <select
                            value={filterSetup}
                            onChange={(e) => setFilterSetup(e.target.value)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All Setups</option>
                            {filterOptions.setups.map((setup) => (
                                <option key={setup} value={setup}>{setup}</option>
                            ))}
                        </select>

                        <select
                            value={filterEmotion}
                            onChange={(e) => setFilterEmotion(e.target.value)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All Emotions</option>
                            {filterOptions.emotions.map((emotion) => (
                                <option key={emotion} value={emotion}>{emotion}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors focus:ring-2 focus:ring-orange-100"
                            aria-label="Date from"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 transition-colors focus:ring-2 focus:ring-orange-100"
                            aria-label="Date to"
                        />

                        <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600">
                            <input
                                type="checkbox"
                                checked={onlyWithScreenshots}
                                onChange={(e) => setOnlyWithScreenshots(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                            />
                            <Camera className="h-4 w-4 text-gray-400" />
                            Screens
                        </label>
                    </div>

                    {dateFrom && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            From {dateFrom}
                            {dateTo ? ` to ${dateTo}` : ''}
                        </div>
                    )}
                </div>
            </div>

            <div className="block divide-y divide-gray-100 md:hidden">
                {processedTrades.map((trade) => (
                    <div
                        key={trade.id}
                        onClick={() => onSelect?.(trade)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect?.(trade);
                            }
                        }}
                        role={onSelect ? 'button' : undefined}
                        tabIndex={onSelect ? 0 : undefined}
                        className={`${onSelect ? 'cursor-pointer' : ''} w-full bg-white p-4 text-left transition-colors hover:bg-gray-50`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-base font-bold text-gray-900">{trade.symbol}</span>
                                    <span className={getDirectionBadge(trade.direction)}>{trade.direction}</span>
                                    <span className={getStatusBadge(trade.status)}>{trade.status}</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{formatDate(trade.entryDate)}</p>
                                <p className="mt-2 line-clamp-1 text-sm text-gray-600">{trade.setup || 'No setup'}</p>
                                <p className="mt-1 line-clamp-1 text-xs text-gray-400">{trade.emotions || 'No emotion'}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-base font-bold tabular-nums ${getStatusColor(trade.status)}`}>
                                    {formatCurrency(trade.pnl)}
                                </p>
                                <p className="mt-1 text-xs text-gray-400 tabular-nums">
                                    {trade.rr ? `${trade.rr > 0 ? '+' : ''}${trade.rr}R` : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            {trade.screenshotUrl ? (
                                <a
                                    href={trade.screenshotUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-[scale,background-color,color] duration-150 ease-out hover:bg-gray-200 hover:text-gray-900 active:scale-[0.96]"
                                >
                                    <Camera className="h-4 w-4" />
                                    Screenshot
                                </a>
                            ) : (
                                <span className="text-xs text-gray-300">No screenshot</span>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => handleTradeAction(event, () => onEdit(trade))}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition-[scale,background-color,color] duration-150 ease-out hover:bg-orange-100 hover:text-orange-700 active:scale-[0.96]"
                                    title="Edit trade"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => handleTradeAction(event, () => onDelete(trade.id))}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-[scale,background-color,color] duration-150 ease-out hover:bg-rose-100 hover:text-rose-700 active:scale-[0.96]"
                                    title="Delete trade"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                    <thead className="border-b border-gray-100 bg-gray-50">
                        <tr>
                            <th onClick={() => handleSort('entryDate')} className="group cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100">
                                <div className="flex items-center">Date <SortIcon column="entryDate" /></div>
                            </th>
                            <th onClick={() => handleSort('symbol')} className="group cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100">
                                <div className="flex items-center">Symbol <SortIcon column="symbol" /></div>
                            </th>
                            <th onClick={() => handleSort('direction')} className="group cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100">
                                <div className="flex items-center">Dir <SortIcon column="direction" /></div>
                            </th>
                            <th className="hidden px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 lg:table-cell">Entry</th>
                            <th className="hidden px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 lg:table-cell">Exit</th>
                            <th onClick={() => handleSort('rr')} className="group cursor-pointer px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100" title="Risk Multiple">
                                <div className="flex items-center justify-center">R <SortIcon column="rr" /></div>
                            </th>
                            <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 xl:table-cell">Setup</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Img</th>
                            <th onClick={() => handleSort('pnl')} className="group cursor-pointer px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100">
                                <div className="flex items-center justify-end">P&L <SortIcon column="pnl" /></div>
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {processedTrades.map((trade) => (
                            <tr
                                key={trade.id}
                                onClick={() => onSelect?.(trade)}
                                className={`${onSelect ? 'cursor-pointer' : ''} group transition-colors hover:bg-gray-50`}
                            >
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                                    {formatDate(trade.entryDate)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="text-sm font-bold text-gray-800">{trade.symbol}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={getDirectionBadge(trade.direction)}>
                                        {trade.direction}
                                    </span>
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-gray-500 tabular-nums lg:table-cell">
                                    {formatPrice(trade, trade.entryPrice)}
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-4 text-right font-mono text-sm text-gray-500 tabular-nums lg:table-cell">
                                    {formatPrice(trade, trade.exitPrice)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    {trade.rr ? (
                                        <span className={`text-sm font-medium tabular-nums ${trade.rr > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {trade.rr > 0 ? '+' : ''}{trade.rr}R
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="hidden max-w-xs truncate px-6 py-4 text-sm text-gray-600 xl:table-cell">
                                    {trade.setup}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    {trade.screenshotUrl ? (
                                        <a
                                            href={trade.screenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(event) => event.stopPropagation()}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-[scale,background-color,color] duration-150 ease-out hover:bg-orange-50 hover:text-orange-500 active:scale-[0.96]"
                                            title="View Screenshot"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-bold tabular-nums ${getStatusColor(trade.status)}`}>
                                            {formatCurrency(trade.pnl)}
                                        </span>
                                        <span className={getStatusBadge(trade.status)}>
                                            {trade.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(event) => handleTradeAction(event, () => onEdit(trade))}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-orange-500 transition-[scale,background-color,color] duration-150 ease-out hover:bg-orange-50 hover:text-orange-700 active:scale-[0.96]"
                                            title="Edit trade"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => handleTradeAction(event, () => onDelete(trade.id))}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-rose-500 transition-[scale,background-color,color] duration-150 ease-out hover:bg-rose-50 hover:text-rose-700 active:scale-[0.96]"
                                            title="Delete trade"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {processedTrades.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                    No trades found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeTable;
