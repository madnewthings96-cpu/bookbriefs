import React, { useState } from 'react';

interface PositionSizeResult {
    standardLots: number;
    miniLots: number;
    microLots: number;
    riskAmount: number;
    accountCurrency: string;
}

type RiskType = 'percentage' | 'monetary';

const PositionSizeCalculator: React.FC = () => {
    const [accountBalance, setAccountBalance] = useState('10000');
    const [riskType, setRiskType] = useState<RiskType>('percentage');
    const [riskValue, setRiskValue] = useState('1');
    const [stopLossPips, setStopLossPips] = useState('20');
    const [currencyPair, setCurrencyPair] = useState('EUR/USD');
    const [accountCurrency, setAccountCurrency] = useState('USD');
    const [marketPrice, setMarketPrice] = useState('');
    const [conversionPrice, setConversionPrice] = useState('');
    const [result, setResult] = useState<PositionSizeResult | null>(null);

    // Determine what secondary price input is needed
    // If USD account:
    // Quote or Base is USD -> handled by marketPrice (or handled automatically)
    // Else -> Need conversion rate
    const getConversionPair = () => {
        if (currencyPair === 'XAU/USD') return null;

        const [baseCurrency, quoteCurrency] = currencyPair.split('/');

        if (quoteCurrency === accountCurrency) return null; // e.g. EUR/USD
        if (baseCurrency === accountCurrency) return null; // e.g. USD/JPY -> uses marketPrice

        // Cross pairs: need to convert Quote Currency to Account Currency
        // e.g. GBP/JPY (Quote JPY) -> need USD/JPY
        if (quoteCurrency === 'JPY') return 'USD/JPY (for conversion)';
        if (quoteCurrency === 'GBP') return 'GBP/USD (for conversion)';
        if (quoteCurrency === 'CHF') return 'USD/CHF (for conversion)';
        if (quoteCurrency === 'CAD') return 'USD/CAD (for conversion)';
        if (quoteCurrency === 'AUD') return 'AUD/USD (for conversion)';
        if (quoteCurrency === 'NZD') return 'NZD/USD (for conversion)';
        if (quoteCurrency === 'EUR') return 'EUR/USD (for conversion)';

        // Fallback
        return `${accountCurrency}/${quoteCurrency} or ${quoteCurrency}/${accountCurrency}`;
    };

    const conversionPairLabel = getConversionPair();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const balance = parseFloat(accountBalance);
        const riskInput = parseFloat(riskValue);
        const sl = parseFloat(stopLossPips);
        const price = parseFloat(marketPrice);
        const cPrice = parseFloat(conversionPrice);

        if (riskType === 'percentage' && (isNaN(balance) || balance <= 0)) {
            alert("Please enter a valid positive account balance for percentage-based risk.");
            return;
        }

        if (isNaN(riskInput) || isNaN(sl) || riskInput <= 0 || sl <= 0) {
            alert("Please enter valid positive numbers for risk and stop loss.");
            return;
        }

        // Calculate risk amount based on type
        const riskAmount = riskType === 'percentage'
            ? balance * (riskInput / 100)
            : riskInput;

        let pipValue = 0;
        const [baseCurrency, quoteCurrency] = currencyPair.split('/');
        let pipSize, lotSize;

        if (currencyPair === 'XAU/USD') {
            // For XAU/USD (Gold):
            // 1 standard lot = 100 oz
            // 1 point = $0.01 price movement
            // Pip value = 100 oz × $0.01 = $1 per point per standard lot
            pipValue = 1; // $1 per point for 1 standard lot
        } else {
            pipSize = currencyPair.includes('JPY') ? 0.01 : 0.0001;
            lotSize = 100000; // Standard currency lot

            if (quoteCurrency === accountCurrency) {
                // Case 1: Quote is Account Currency (e.g. EUR/USD)
                pipValue = pipSize * lotSize;
            } else if (baseCurrency === accountCurrency) {
                // Case 2: Base is Account Currency (e.g. USD/JPY)
                if (isNaN(price) || price <= 0) {
                    alert(`Please enter a valid current market price for ${currencyPair}.`);
                    return;
                }
                pipValue = (pipSize * lotSize) / price;
            } else {
                // Case 3: Cross Pair (e.g. GBP/JPY, EUR/GBP)
                // We need to convert the Quote Currency Value to Account Currency

                // Base Pip Value logic:
                // Pip Value in Quote Currency = pipSize * lotSize
                // We need value in Account Currency (USD)

                let rawPipValue = pipSize * lotSize; // Value in Quote Currency

                // We need to convert 'rawPipValue' (which is in QuoteCurrency) to AccountCurrency (USD)

                if (quoteCurrency === 'JPY') {
                    // Quote is JPY. Value is in JPY (e.g. 1000). Account is USD.
                    // Need USD/JPY rate.
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for USD/JPY.");
                        return;
                    }
                    pipValue = rawPipValue / cPrice;
                } else if (quoteCurrency === 'GBP') {
                    // Quote is GBP. Value is in GBP. Account is USD.
                    // Need GBP/USD rate.
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for GBP/USD.");
                        return;
                    }
                    pipValue = rawPipValue * cPrice;
                } else if (quoteCurrency === 'CHF') {
                    // Quote is CHF. Value is in CHF. Account is USD.
                    // Need USD/CHF rate.
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for USD/CHF.");
                        return;
                    }
                    pipValue = rawPipValue / cPrice;
                } else if (quoteCurrency === 'EUR') {
                    // Quote is EUR (rare for pairs in this list but possible).
                    // Need EUR/USD rate.
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for EUR/USD.");
                        return;
                    }
                    pipValue = rawPipValue * cPrice;
                } else if (quoteCurrency === 'CAD') {
                    // Need USD/CAD
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for USD/CAD.");
                        return;
                    }
                    pipValue = rawPipValue / cPrice;
                } else if (quoteCurrency === 'AUD') {
                    // Need AUD/USD
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for AUD/USD.");
                        return;
                    }
                    pipValue = rawPipValue * cPrice;
                } else if (quoteCurrency === 'NZD') {
                    // Need NZD/USD
                    if (isNaN(cPrice) || cPrice <= 0) {
                        alert("Please enter the conversion price for NZD/USD.");
                        return;
                    }
                    pipValue = rawPipValue * cPrice;
                } else {
                    alert(`Cross-currency calculation for ${currencyPair} is not fully supported.`);
                    return;
                }
            }
        }

        if (pipValue <= 0) {
            alert("Could not calculate pip value. Please check your inputs.");
            return;
        }

        const standardLots = riskAmount / (sl * pipValue);

        setResult({
            standardLots,
            miniLots: standardLots * 10,
            microLots: standardLots * 100,
            riskAmount,
            accountCurrency,
        });
    };

    const formInputStyle = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow shadow-sm";
    const formLabelStyle = "block text-sm font-medium text-gray-700 mb-1";

    const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'XAU/USD'];
    const accountCurrencies = ['USD'];

    const getPriceLabel = () => {
        if (currencyPair === 'XAU/USD') return null;
        const [baseCurrency] = currencyPair.split('/');
        if (baseCurrency === accountCurrency) return `Current Price of ${currencyPair}`;
        return `Current Price of ${currencyPair}`;
    };

    const needsMarketPrice = () => {
        if (currencyPair === 'XAU/USD') return false;
        const [baseCurrency] = currencyPair.split('/');
        // If Base is Account Currency (e.g. USD/JPY), we NEED market price of the pair.
        if (baseCurrency === accountCurrency) return true;
        return false;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2F4F4F' }}>
                Position Size Calculator
            </h2>
            <p className="text-center text-gray-600 mb-2">Determine the appropriate trade size based on your risk tolerance.</p>
            <p className="text-center text-gray-600 mb-6" dir="rtl">إذا كنت تتداول الذهب، يرجى وضع النقاط (Points) بدلاً من (Pips) وشكراً.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="accountCurrencyPos" className={formLabelStyle}>Account Currency</label>
                        <select id="accountCurrencyPos" value={accountCurrency} onChange={e => setAccountCurrency(e.target.value)} className={formInputStyle}>
                            {accountCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="accountBalance" className={formLabelStyle}>Account Balance</label>
                        <input type="number" id="accountBalance" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} className={formInputStyle} placeholder="e.g., 10000" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={formLabelStyle}>Risk Type</label>
                        <div className="flex rounded-md overflow-hidden border border-gray-300">
                            <button
                                type="button"
                                onClick={() => setRiskType('percentage')}
                                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${riskType === 'percentage'
                                        ? 'bg-[#a75d37] text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Percentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setRiskType('monetary')}
                                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${riskType === 'monetary'
                                        ? 'bg-[#a75d37] text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Monetary ($)
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="riskValue" className={formLabelStyle}>
                            {riskType === 'percentage' ? 'Risk Percentage (%)' : 'Risk Amount ($)'}
                        </label>
                        <input
                            type="number"
                            id="riskValue"
                            value={riskValue}
                            onChange={e => setRiskValue(e.target.value)}
                            className={formInputStyle}
                            placeholder={riskType === 'percentage' ? 'e.g., 1' : 'e.g., 100'}
                            step={riskType === 'percentage' ? '0.1' : '1'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="stopLoss" className={formLabelStyle}>Stop Loss (pips) or (points) for XAUUSD</label>
                        <input type="number" id="stopLoss" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} className={formInputStyle} placeholder="e.g., 20" />
                    </div>
                    <div>
                        <label htmlFor="posCurrencyPair" className={formLabelStyle}>Currency Pair</label>
                        <select id="posCurrencyPair" value={currencyPair} onChange={e => setCurrencyPair(e.target.value)} className={formInputStyle}>
                            {currencyPairs.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Market Price Input: Only really needed if Base == Account (e.g. USD/JPY) */}
                {needsMarketPrice() && (
                    <div>
                        <label htmlFor="marketPrice" className={formLabelStyle}>Current Price of {currencyPair}</label>
                        <input type="number" id="marketPrice" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} className={formInputStyle} placeholder="e.g., 145.50" step="0.01" />
                    </div>
                )}

                {/* Conversion Price Input: Needed for Cross Pairs */}
                {conversionPairLabel && (
                    <div>
                        <label htmlFor="conversionPrice" className={formLabelStyle}>Price of {conversionPairLabel}</label>
                        <input
                            type="number"
                            id="conversionPrice"
                            value={conversionPrice}
                            onChange={e => setConversionPrice(e.target.value)}
                            className={formInputStyle}
                            placeholder="e.g., 1.2500 or 145.00"
                            step="0.0001"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="calculator-button w-full px-6 py-3.5 text-base shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-200"
                >
                    Calculate Position Size
                </button>
            </form>

            {result && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                    <h3 className="text-lg font-semibold text-center mb-3" style={{ color: '#2F4F4F' }}>Recommended Position Size</h3>
                    <div className="text-center mb-4 border-b pb-3">
                        You are risking <span className="font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: result.accountCurrency }).format(result.riskAmount)}</span> on this trade.
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center pt-2">
                        <div>
                            <p className="font-bold text-2xl text-blue-600">{result.standardLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 font-semibold">Standard Lots</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg" style={{ color: '#a75d37' }}>{result.miniLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Mini Lots</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg" style={{ color: '#a75d37' }}>{result.microLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Micro Lots</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionSizeCalculator;
