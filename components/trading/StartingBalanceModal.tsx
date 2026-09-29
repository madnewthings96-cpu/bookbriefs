import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../utils/tradingUtils';
import { AsyncIdentityGuard } from '../asyncIdentityGuard';
import { useModalDialog } from '../../hooks/useModalDialog';

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
    const operationGuard = useRef(new AsyncIdentityGuard()).current;
    const balanceInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        operationGuard.mount();
        return () => operationGuard.unmount();
    }, [operationGuard]);

    useEffect(() => {
        if (!isOpen) {
            operationGuard.invalidate();
            setIsSubmitting(false);
        }
    }, [isOpen, operationGuard]);

    useEffect(() => {
        if (isOpen) {
            setBalance(currentBalance.toString());
        }
    }, [isOpen, currentBalance]);

    const handleClose = () => {
        operationGuard.invalidate();
        onClose();
    };

    const dialogRef = useModalDialog({ open: isOpen, onClose: handleClose, initialFocusRef: balanceInputRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = operationGuard.begin();
        if (!token) return;
        setIsSubmitting(true);
        try {
            if (!operationGuard.isCurrent(token)) return;
            await onSave(parseFloat(balance));
            if (!operationGuard.isCurrent(token)) return;
            setIsSubmitting(false);
            operationGuard.invalidate();
            onClose();
        } catch (error) {
            if (operationGuard.isCurrent(token)) console.error('Error saving balance:', error);
        } finally {
            if (operationGuard.isCurrent(token)) setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="starting-balance-modal-title"
                tabIndex={-1}
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl [&_input]:min-h-11"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 id="starting-balance-modal-title" className="text-lg font-bold text-gray-800">Set Starting Balance</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close starting balance dialog"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    >
                        <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="starting-balance" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Starting Capital ($)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium">$</span>
                            </div>
                            <input
                                id="starting-balance"
                                ref={balanceInputRef}
                                type="number"
                                step="any"
                                min="0"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            This amount will be used as the base for your equity curve and total balance calculations.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="min-h-11 flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
