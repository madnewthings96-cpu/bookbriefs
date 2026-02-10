import React, { useState, useMemo } from 'react';
import { X, FileDown, Calendar, Loader2 } from 'lucide-react';
import { Trade } from '../../utils/tradingUtils';
import { generateMonthlyReport, getAvailableMonths, filterTradesByMonth } from '../../utils/pdfReportGenerator';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    trades: Trade[];
    startingBalance: number;
    currentBalance: number;
    userEmail?: string;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({
    isOpen,
    onClose,
    trades,
    startingBalance,
    currentBalance,
    userEmail,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);

    const availableMonths = useMemo(() => getAvailableMonths(trades), [trades]);

    // Set default selected month to most recent
    React.useEffect(() => {
        if (availableMonths.length > 0 && !selectedMonth) {
            setSelectedMonth({ month: availableMonths[0].month, year: availableMonths[0].year });
        }
    }, [availableMonths, selectedMonth]);

    const selectedMonthTrades = useMemo(() => {
        if (!selectedMonth) return [];
        return filterTradesByMonth(trades, selectedMonth.month, selectedMonth.year);
    }, [trades, selectedMonth]);

    const handleDownload = async () => {
        if (!selectedMonth) return;

        setIsGenerating(true);
        try {
            // Small delay for UI feedback
            await new Promise(resolve => setTimeout(resolve, 300));

            await generateMonthlyReport({
                trades,
                startingBalance,
                currentBalance,
                month: selectedMonth.month,
                year: selectedMonth.year,
                userEmail,
            });

            onClose();
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Export Report</h2>
                            <p className="text-sm text-orange-100">Download monthly trading report</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                        disabled={isGenerating}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {/* Month Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Month
                        </label>
                        {availableMonths.length > 0 ? (
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
                                    onChange={(e) => {
                                        const [year, month] = e.target.value.split('-').map(Number);
                                        setSelectedMonth({ year, month });
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                                >
                                    {availableMonths.map((m) => (
                                        <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500 text-sm">No trades recorded yet</p>
                                <p className="text-gray-400 text-xs mt-1">Add trades to generate reports</p>
                            </div>
                        )}
                    </div>

                    {/* Preview Info */}
                    {selectedMonth && selectedMonthTrades.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Report Preview</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Trades:</span>
                                    <span className="font-medium text-gray-800">{selectedMonthTrades.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Wins:</span>
                                    <span className="font-medium text-emerald-600">
                                        {selectedMonthTrades.filter(t => t.status === 'WIN').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Losses:</span>
                                    <span className="font-medium text-rose-600">
                                        {selectedMonthTrades.filter(t => t.status === 'LOSS').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">P&L:</span>
                                    <span className={`font-medium ${selectedMonthTrades.reduce((sum, t) => sum + t.pnl, 0) >= 0
                                        ? 'text-emerald-600'
                                        : 'text-rose-600'
                                        }`}>
                                        ${Math.abs(selectedMonthTrades.reduce((sum, t) => sum + t.pnl, 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Contents */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium text-gray-600">Report includes:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                            <li>Performance summary (P&L, Win Rate, Profit Factor)</li>
                            <li>Account balance overview</li>
                            <li>Complete trade log with details</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isGenerating}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating || !selectedMonth || selectedMonthTrades.length === 0}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileDown className="w-4 h-4" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportReportModal;
