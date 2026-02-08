import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/tradingUtils';

interface StartingBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (balance: number) => Promise<void>;
    currentBalance: number;
}

const StartingBalanceModal: React.FC<StartingBalanceModalProps> = ({
    isOpen,
    onClose,
    onSave,
    currentBalance,
}) => {
    const [balance, setBalance] = useState<string>('10000');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setBalance(currentBalance.toString());
        }
    }, [isOpen, currentBalance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(parseFloat(balance));
            onClose();
        } catch (error) {
            console.error('Error saving balance:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Set Starting Balance</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Starting Capital ($)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium">$</span>
                            </div>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            This amount will be used as the base for your equity curve and total balance calculations.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Save Balance'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartingBalanceModal;
