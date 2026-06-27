import React, { useState, useEffect } from 'react';
import {
    TradeFormData,
    Trade,
    EMOTION_OPTIONS,
    SETUP_OPTIONS,
    calculatePnL,
    determineStatus,
    getInitialTradeFormData,
} from '../../utils/tradingUtils';
import { X, ArrowLeft, Loader2 } from 'lucide-react';

interface AddTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TradeFormData, calculatedPnL: number, status: 'WIN' | 'LOSS' | 'BE') => Promise<void>;
    editingTrade?: Trade | null;
}

const AddTradeModal: React.FC<AddTradeModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingTrade,
}) => {
    const [formData, setFormData] = useState<TradeFormData>(getInitialTradeFormData());
    const [calculatedPnL, setCalculatedPnL] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomSetup, setIsCustomSetup] = useState(false);
    const [isManualPnL, setIsManualPnL] = useState(false);

    // Initialize form when editing or opening
    useEffect(() => {
        if (editingTrade) {
            setFormData({
                symbol: editingTrade.symbol,
                direction: editingTrade.direction,
                entryDate: editingTrade.entryDate?.toDate?.()
                    ? editingTrade.entryDate.toDate().toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                entryPrice: editingTrade.entryPrice.toString(),
                exitPrice: editingTrade.exitPrice.toString(),
                stopLoss: editingTrade.stopLoss?.toString() || '',
                lotSize: editingTrade.lotSize.toString(),
                setup: editingTrade.setup,
                emotions: editingTrade.emotions,
                notes: editingTrade.notes,
                screenshotUrl: editingTrade.screenshotUrl || '',
            });

            // Check if setup is custom (not in the predefined list)
            const isPredefined = SETUP_OPTIONS.includes(editingTrade.setup);
            setIsCustomSetup(!isPredefined && editingTrade.setup !== '');
            setCalculatedPnL(editingTrade.pnl.toString());
            setIsManualPnL(true);
        } else if (isOpen) {
            setFormData(getInitialTradeFormData());
            setCalculatedPnL('');
            setIsCustomSetup(false);
            setIsManualPnL(false);
        }
    }, [editingTrade, isOpen]);

    useEffect(() => {
        if (!isOpen || isManualPnL) return;

        const entryPrice = parseFloat(formData.entryPrice);
        const exitPrice = parseFloat(formData.exitPrice);
        const lotSize = parseFloat(formData.lotSize);

        if ([entryPrice, exitPrice, lotSize].every(Number.isFinite)) {
            const pnl = calculatePnL(formData.direction, entryPrice, exitPrice, lotSize);
            setCalculatedPnL(pnl.toFixed(2));
        } else {
            setCalculatedPnL('');
        }
    }, [
        formData.direction,
        formData.entryPrice,
        formData.exitPrice,
        formData.lotSize,
        isManualPnL,
        isOpen,
    ]);

    const handleManualPnLToggle = () => {
        setIsManualPnL((current) => !current);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const pnlValue = parseFloat(calculatedPnL) || 0;
            const status = determineStatus(pnlValue);
            await onSave(formData, pnlValue, status);
            onClose();
        } catch (error) {
            console.error('Error saving trade:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200"
                style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingTrade ? 'Edit Trade' : 'Log New Trade'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-[scale,color,background-color] duration-150 ease-out hover:bg-gray-50 hover:text-gray-600 active:scale-[0.96]"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Symbol & Direction Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Symbol</label>
                            <input
                                type="text"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                placeholder="XAUUSD"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Direction</label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: 'LONG' })}
                                    className={`flex-1 rounded-md py-2 font-medium transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] ${formData.direction === 'LONG'
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    LONG
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, direction: 'SHORT' })}
                                    className={`flex-1 rounded-md py-2 font-medium transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] ${formData.direction === 'SHORT'
                                        ? 'bg-rose-500 text-white'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    SHORT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Entry Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Entry Date</label>
                        <input
                            type="date"
                            value={formData.entryDate}
                            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Entry/Exit/Stop Loss Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Entry Price</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.entryPrice}
                                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                                placeholder="Entry Price"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exit Price</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.exitPrice}
                                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                                placeholder="Exit Price"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stop Loss</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.stopLoss}
                                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                                placeholder="Stop Loss"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Lot Size & Calculated P&L Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lot Size</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.lotSize}
                                onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                                placeholder="0.10"
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                <label className="block text-sm font-medium text-gray-700">P&L ($)</label>
                                <button
                                    type="button"
                                    onClick={handleManualPnLToggle}
                                    className={`rounded-md px-2 py-1 text-xs font-semibold transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] ${isManualPnL
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-emerald-50 text-emerald-600'
                                        }`}
                                    title={isManualPnL ? 'Switch to automatic P&L' : 'Override calculated P&L'}
                                >
                                    {isManualPnL ? 'Manual' : 'Auto'}
                                </button>
                            </div>
                            <input
                                type="number"
                                step="any"
                                value={calculatedPnL}
                                onChange={(e) => setCalculatedPnL(e.target.value)}
                                readOnly={!isManualPnL}
                                placeholder={isManualPnL ? '0.00' : 'Auto'}
                                className={`w-full rounded-lg border px-4 py-2.5 text-lg font-bold tabular-nums transition-colors focus:border-transparent focus:ring-2 focus:ring-orange-400 ${!isManualPnL ? 'cursor-not-allowed' : ''} ${parseFloat(calculatedPnL || '0') > 0
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : parseFloat(calculatedPnL || '0') < 0
                                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-white text-gray-800 border-gray-300'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Setup */}
                    {/* Setup */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Setup / Strategy</label>
                        {isCustomSetup ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.setup}
                                    onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                                    placeholder="Enter your custom strategy..."
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomSetup(false);
                                        setFormData({ ...formData, setup: '' });
                                    }}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-[scale,background-color,color] duration-150 ease-out hover:bg-gray-200 hover:text-gray-700 active:scale-[0.96]"
                                    title="Back to list"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <select
                                value={formData.setup}
                                onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                        setIsCustomSetup(true);
                                        setFormData({ ...formData, setup: '' });
                                    } else {
                                        setFormData({ ...formData, setup: e.target.value });
                                    }
                                }}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                required
                            >
                                <option value="">Select setup...</option>
                                {SETUP_OPTIONS.map((setup) => (
                                    <option key={setup} value={setup}>{setup}</option>
                                ))}
                                <option value="__custom__" className="font-semibold text-orange-600 bg-orange-50">
                                    + Add New Strategy...
                                </option>
                            </select>
                        )}
                    </div>

                    {/* Psychology / Emotions - Key Feature */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Psychology / Emotions
                            <span className="ml-2 text-xs text-orange-500 font-normal">Key Insight</span>
                        </label>
                        <select
                            value={formData.emotions}
                            onChange={(e) => setFormData({ ...formData, emotions: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            required
                        >
                            {EMOTION_OPTIONS.map((emotion) => (
                                <option key={emotion} value={emotion}>{emotion}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="What did you learn from this trade?"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Screenshot URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Screenshot URL (Optional)</label>
                        <input
                            type="url"
                            value={formData.screenshotUrl}
                            onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                            placeholder="https://tradingview.com/..."
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition-[scale,background-color] duration-150 ease-out hover:bg-orange-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Saving...
                                </>
                            ) : (
                                editingTrade ? 'Update Trade' : 'Log Trade'
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AddTradeModal;
