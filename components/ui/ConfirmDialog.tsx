import React, { useId, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useModalDialog } from '../../hooks/useModalDialog';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export const getConfirmDialogInitialFocusMode = (isLoading: boolean): 'cancel' | 'dialog' => (
    isLoading ? 'dialog' : 'cancel'
);

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false
}) => {
    const instanceId = useId().replace(/:/g, '');
    const titleId = `confirm-dialog-title-${instanceId}`;
    const messageId = `confirm-dialog-message-${instanceId}`;
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const handleClose = () => {
        if (!isLoading) onClose();
    };
    const dialogRef = useModalDialog({
        open: isOpen,
        onClose: handleClose,
        initialFocusRef: getConfirmDialogInitialFocusMode(isLoading) === 'cancel' ? cancelButtonRef : undefined,
    });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={messageId}
                tabIndex={-1}
                className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 id={titleId} className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {variant === 'danger' && <AlertTriangle aria-hidden="true" className="w-5 h-5 text-red-500" />}
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close confirmation dialog"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                        disabled={isLoading}
                    >
                        <X aria-hidden="true" className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p id={messageId} className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={handleClose}
                        className="min-h-11 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`min-h-11 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <div aria-hidden="true" className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
