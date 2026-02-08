import React, { useState, useMemo } from 'react';
import { Trade, formatCurrency } from '../../utils/tradingUtils';
import { Inbox, Camera, Edit2, Trash2 } from 'lucide-react';

interface TradeTableProps {
    trades: Trade[];
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
    isLoading?: boolean;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onEdit, onDelete, isLoading }) => {
    const [sortKey, setSortKey] = useState<keyof Trade>('entryDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const sortedTrades = useMemo(() => {
        return [...trades].sort((a, b) => {
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

            return 0;
        });
    }, [trades, sortKey, sortDirection]);

    const getStatusColor = (status: 'WIN' | 'LOSS' | 'BE') => {
        switch (status) {
            case 'WIN':
                return 'text-emerald-600';
            case 'LOSS':
                return 'text-rose-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusBadge = (status: 'WIN' | 'LOSS' | 'BE') => {
        const baseClass = 'ml-2 px-2 py-0.5 text-xs font-semibold rounded';
        switch (status) {
            case 'WIN':
                return `${baseClass} bg-emerald-100 text-emerald-700`;
            case 'LOSS':
                return `${baseClass} bg-rose-100 text-rose-700`;
            default:
                return `${baseClass} bg-gray-100 text-gray-700`;
        }
    };

    const getDirectionBadge = (direction: 'LONG' | 'SHORT') => {
        return direction === 'LONG'
            ? 'px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700'
            : 'px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-700';
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

    if (trades.length === 0) {
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
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Trade History</h3>
                <p className="text-sm text-gray-500 mt-1">{trades.length} total trade{trades.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Symbol</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Direction</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Setup</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Emotions</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">P&L</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedTrades.map((trade) => (
                            <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatDate(trade.entryDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-800">{trade.symbol}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getDirectionBadge(trade.direction)}>
                                        {trade.direction}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {trade.setup}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {trade.emotions}
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
                                        <span className={`font-semibold ${getStatusColor(trade.status)}`}>
                                            {formatCurrency(trade.pnl)}
                                        </span>
                                        <span className={getStatusBadge(trade.status)}>
                                            {trade.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2">
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
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeTable;
