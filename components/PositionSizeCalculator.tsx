import React, { useState } from 'react';

interface PositionSizeResult {
    standardLots: number;
    miniLots: number;
    microLots: number;
    riskAmount: number;
    accountCurrency: string;
}

const PositionSizeCalculator: React.FC = () => {
    const [accountBalance, setAccountBalance] = useState('10000');
    const [riskPercentage, setRiskPercentage] = useState('1');
    const [stopLossPips, setStopLossPips] = useState('20');
    const [currencyPair, setCurrencyPair] = useState('EUR/USD');
    const [accountCurrency, setAccountCurrency] = useState('USD');
    const [marketPrice, setMarketPrice] = useState('');
    const [result, setResult] = useState<PositionSizeResult | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const balance = parseFloat(accountBalance);
        const risk = parseFloat(riskPercentage);
        const sl = parseFloat(stopLossPips);
        const price = parseFloat(marketPrice);

        if (isNaN(balance) || isNaN(risk) || isNaN(sl) || balance <= 0 || risk <= 0 || sl <= 0) {
            alert("Please enter valid positive numbers for balance, risk, and stop loss.");
            return;
        }
        
        const riskAmount = balance * (risk / 100);

        let pipValue = 0;
        const [baseCurrency, quoteCurrency] = currencyPair.split('/');
        let pipSize, lotSize;
        
        if (currencyPair === 'XAU/USD') {
            pipSize = 0.01; // For gold, 1 pip = 0.01
            lotSize = 100; // Gold standard lot is 100 oz
        } else {
            pipSize = currencyPair.includes('JPY') ? 0.01 : 0.0001;
            lotSize = 100000; // Standard currency lot
        }

        if (quoteCurrency === accountCurrency) {
            pipValue = pipSize * lotSize / 1; // Simplified for direct pairs
        } else if (baseCurrency === accountCurrency) {
            if (isNaN(price) || price <= 0) {
                alert(`Please enter a valid current market price for the ${currencyPair} pair to calculate the pip value correctly.`);
                return;
            }
            pipValue = (pipSize * lotSize) / price;
        } else {
             alert(`Cross-currency calculation for ${currencyPair} with an account in ${accountCurrency} is not supported in this simplified version.`);
             return;
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
    
    const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'XAU/USD'];
    const accountCurrencies = ['USD'];

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2F4F4F' }}>
                Position Size Calculator
            </h2>
             <p className="text-center text-gray-600 mb-6">Determine the appropriate trade size based on your risk tolerance.</p>
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
                        <label htmlFor="riskPercentage" className={formLabelStyle}>Risk Percentage (%)</label>
                        <input type="number" id="riskPercentage" value={riskPercentage} onChange={e => setRiskPercentage(e.target.value)} className={formInputStyle} placeholder="e.g., 1" />
                    </div>
                    <div>
                        <label htmlFor="stopLoss" className={formLabelStyle}>Stop Loss (pips)</label>
                        <input type="number" id="stopLoss" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} className={formInputStyle} placeholder="e.g., 20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="posCurrencyPair" className={formLabelStyle}>Currency Pair</label>
                      <select id="posCurrencyPair" value={currencyPair} onChange={e => setCurrencyPair(e.target.value)} className={formInputStyle}>
                          {currencyPairs.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                        <label htmlFor="marketPrice" className={formLabelStyle}>Market Price (optional)</label>
                        <input type="number" id="marketPrice" value={marketPrice} onChange={e => setMarketPrice(e.target.value)} className={formInputStyle} placeholder="e.g., 1.12345" step="0.00001" />
                    </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-all duration-300"
                  style={{ backgroundColor: '#FF7F50' }}
                >
                    Calculate Position Size
                </button>
            </form>

            {result && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                    <h3 className="text-lg font-semibold text-center mb-3" style={{color: '#2F4F4F'}}>Recommended Position Size</h3>
                    <div className="text-center mb-4 border-b pb-3">
                        You are risking <span className="font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: result.accountCurrency }).format(result.riskAmount)}</span> on this trade.
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center pt-2">
                        <div>
                            <p className="font-bold text-2xl" style={{color: '#FF7F50'}}>{result.standardLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 font-semibold">Standard Lots</p>
                        </div>
                         <div>
                            <p className="font-bold text-lg" style={{color: '#FF7F50'}}>{result.miniLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Mini Lots</p>
                        </div>
                         <div>
                            <p className="font-bold text-lg" style={{color: '#FF7F50'}}>{result.microLots.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Micro Lots</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PositionSizeCalculator;