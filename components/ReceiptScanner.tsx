import React, { useState, useRef } from 'react';

// Lazy load types
import type { Worker } from 'tesseract.js';

interface ScannedData {
    date: string;
    amount: string;
    description: string;
    category: string;
}

interface ReceiptScannerProps {
    onScanComplete: (data: ScannedData) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    // Form state for verification
    const [scannedData, setScannedData] = useState<ScannedData>({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: 'Expense'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
        setIsScanning(true);
        setShowModal(true);
        setStatus('Initializing OCR...');

        try {
            // Dynamic import for lazy loading
            const Tesseract = await import('tesseract.js');

            // @ts-ignore - Tesseract.js types might be slightly off between versions, but this signature is correct for v5+
            const worker: Worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(m.progress * 100);
                        setStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
                    } else {
                        setStatus(m.status);
                    }
                }
            });

            // recognized() is called directly on the worker instance which is already initialized
            const { data: { text } } = await worker.recognize(file);

            // Parse data
            const extractedData = parseReceipt(text);
            setScannedData(prev => ({
                ...prev,
                ...extractedData
            }));

            await worker.terminate();
        } catch (error) {
            console.error('OCR Error:', error);
            setStatus('Failed to scan receipt');
        } finally {
            setIsScanning(false);
            // Reset input so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const parseReceipt = (text: string) => {
        const lines = text.split('\n');
        let amount = '';
        let date = '';

        // Regex Patterns
        const datePattern = /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|([A-Za-z]{3}\s\d{1,2},?\s\d{4})/;
        const amountPattern = /(?:Total|Amount|Balance|Net|Grand Total)[\s:]*[$€£]?\s*(\d+[.,]\d{2})/i;
        // Fallback amount pattern: just looks for the largest number showing currency format at the bottom of receipt usually
        const currencyPattern = /[$€£]\s*(\d+[.,]\d{2})/;

        // Find Date
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
            try {
                const parsedDate = new Date(dateMatch[0]);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate.toISOString().split('T')[0];
                }
            } catch (e) {
                console.log('Date parse error', e);
            }
        }

        // Find Amount
        // First try explicit "Total: $XX.XX" pattern
        const totalMatch = text.match(amountPattern);
        if (totalMatch) {
            amount = totalMatch[1].replace(',', '.');
        } else {
            // If no "Total" label, look for currency symbols
            const currencyMatches = text.match(new RegExp(currencyPattern, 'g'));
            if (currencyMatches) {
                // Usually the last currency match is the total
                const lastMatch = currencyMatches[currencyMatches.length - 1];
                const numMatch = lastMatch.match(/(\d+[.,]\d{2})/);
                if (numMatch) amount = numMatch[1].replace(',', '.');
            }
        }

        return { amount, date: date || new Date().toISOString().split('T')[0] };
    };

    const handleConfirm = () => {
        onScanComplete(scannedData);
        setShowModal(false);
        setPreviewUrl(null);
    };

    const handleCancel = () => {
        setShowModal(false);
        setPreviewUrl(null);
    };

    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <button
                onClick={triggerCamera}
                className="uiverse-btn"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Scan Receipt</span>
            </button>

            <input
                type="file"
                accept="image/*;capture=camera"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-xl">🧾</span> Verify Receipt Data
                            </h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 h-48 sm:h-64 flex-shrink-0">
                                    <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-contain" />
                                    {isScanning && (
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white mb-3"></div>
                                            <p className="font-medium text-sm">{status}</p>
                                            {progress > 0 && <p className="text-xs opacity-80">{Math.round(progress)}%</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={scannedData.date}
                                            onChange={e => setScannedData({ ...scannedData, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount ($)</label>
                                        <input
                                            type="number" step="0.01"
                                            value={scannedData.amount}
                                            onChange={e => setScannedData({ ...scannedData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Merchant)</label>
                                    <input
                                        type="text"
                                        value={scannedData.description}
                                        onChange={e => setScannedData({ ...scannedData, description: e.target.value })}
                                        placeholder="e.g. Starbucks, Walmart..."
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category (Review)</label>
                                    <select
                                        value={scannedData.category}
                                        onChange={e => setScannedData({ ...scannedData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                                    >
                                        <option>Food</option>
                                        <option>Transport</option>
                                        <option>Housing</option>
                                        <option>Entertainment</option>
                                        <option>Shopping</option>
                                        <option>Utilities</option>
                                        <option>Healthcare</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isScanning || !scannedData.amount}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                Confirm & Save
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default ReceiptScanner;
