import React, { useState, useMemo } from 'react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';
import { Inbox, Camera, Edit2, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';

interface TradeTableProps {
    trades: Trade[];
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
    isLoading?: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onEdit, onDelete, isLoading }) => {
    const [sortKey, setSortKey] = useState<keyof Trade>('entryDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
    const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');

    // Filtered and Sorted Trades
    const processedTrades = useMemo(() => {
        let result = [...trades];

        // 1. Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(t =>
                (t.symbol || '').toLowerCase().includes(lowerTerm) ||
                (t.setup || '').toLowerCase().includes(lowerTerm) ||
                (t.notes || '').toLowerCase().includes(lowerTerm) ||
                (t.emotions || '').toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Filter by Status
        if (filterStatus !== 'ALL') {
            result = result.filter(t => t.status === filterStatus);
        }

        // 3. Filter by Direction
        if (filterDirection !== 'ALL') {
            result = result.filter(t => t.direction === filterDirection);
        }

        // 4. Sort
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

            // Fallback for strings
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();
            if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;

            return 0;
        });
    }, [trades, sortKey, sortDirection, searchTerm, filterStatus, filterDirection]);

    const handleSort = (key: keyof Trade) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ column }: { column: keyof Trade }) => {
        if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
        return <ArrowUpDown className={`w-3 h-3 ml-1 ${sortDirection === 'asc' ? 'text-orange-500' : 'text-orange-500 transform rotate-180'}`} />;
    };

    const getStatusColor = (status: 'WIN' | 'LOSS' | 'BE') => {
        switch (status) {
            case 'WIN': return 'text-emerald-600';
            case 'LOSS': return 'text-rose-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: 'WIN' | 'LOSS' | 'BE') => { // simplified badge
        const baseClass = 'px-2 py-0.5 text-xs font-semibold rounded';
        switch (status) {
            case 'WIN': return `${baseClass} bg-emerald-100 text-emerald-700`;
            case 'LOSS': return `${baseClass} bg-rose-100 text-rose-700`;
            default: return `${baseClass} bg-gray-100 text-gray-700`;
        }
    };

    const getDirectionBadge = (direction: 'LONG' | 'SHORT') => {
        return direction === 'LONG'
            ? 'px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 text-rose-700 border border-rose-100';
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading trades...</p>
            </div>
        );
    }

    if (trades.length === 0 && !searchTerm) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                <p className="text-gray-600 font-medium">No trades yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Add Trade" to start tracking your trading journey</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header / Controls */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Trade History</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {processedTrades.length} trade{processedTrades.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search symbol, setup..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors w-48 sm:w-64"
                        />
                    </div>

                    {/* Filters */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-orange-100 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="WIN">Wins Only</option>
                        <option value="LOSS">Losses Only</option>
                        <option value="BE">Break Even</option>
                    </select>

                    <select
                        value={filterDirection}
                        onChange={(e) => setFilterDirection(e.target.value as any)}
                        className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-orange-100 cursor-pointer hidden sm:block"
                    >
                        <option value="ALL">All Directions</option>
                        <option value="LONG">Longs</option>
                        <option value="SHORT">Shorts</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th onClick={() => handleSort('entryDate')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">Date <SortIcon column="entryDate" /></div>
                            </th>
                            <th onClick={() => handleSort('symbol')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">Symbol <SortIcon column="symbol" /></div>
                            </th>
                            <th onClick={() => handleSort('direction')} className="group px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">Dir <SortIcon column="direction" /></div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Entry</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Exit</th>
                            <th onClick={() => handleSort('rr')} className="group px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" title="Risk Multiple">
                                <div className="flex items-center justify-center">R <SortIcon column="rr" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Setup</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Img</th>
                            <th onClick={() => handleSort('pnl')} className="group px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-end">P&L <SortIcon column="pnl" /></div>
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {processedTrades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                    {formatDate(trade.entryDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-800">{trade.symbol}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getDirectionBadge(trade.direction)}>
                                        {trade.direction}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right hidden md:table-cell font-mono">
                                    {trade.symbol.toUpperCase().includes('XAUUSD')
                                        ? trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : trade.entryPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right hidden md:table-cell font-mono">
                                    {trade.symbol.toUpperCase().includes('XAUUSD')
                                        ? trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : trade.exitPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {trade.rr ? (
                                        <span className={`text-sm font-medium ${trade.rr > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {trade.rr > 0 ? '+' : ''}{trade.rr}R
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell max-w-xs truncate">
                                    {trade.setup}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {trade.screenshotUrl ? (
                                        <a
                                            href={trade.screenshotUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-orange-500 transition-colors inline-block"
                                            title="View Screenshot"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-bold ${getStatusColor(trade.status)}`}>
                                            {formatCurrency(trade.pnl)}
                                        </span>
                                        <span className={getStatusBadge(trade.status)}>
                                            {trade.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(trade)}
                                            className="text-orange-500 hover:text-orange-700 transition-colors p-1.5 hover:bg-orange-50 rounded"
                                            title="Edit trade"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(trade.id)}
                                            className="text-rose-500 hover:text-rose-700 transition-colors p-1.5 hover:bg-rose-50 rounded"
                                            title="Delete trade"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
