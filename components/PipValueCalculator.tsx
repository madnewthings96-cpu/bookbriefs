
import React, { useState } from 'react';

const PipValueCalculator: React.FC = () => {
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [pips, setPips] = useState('10');
  const [positionSize, setPositionSize] = useState('1.0');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [pipValue, setPipValue] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(positionSize);
    const pipsCount = parseFloat(pips);

    if (isNaN(size) || size <= 0) {
      alert("Please enter a valid position size.");
      return;
    }

    if (isNaN(pipsCount) || pipsCount <= 0) {
      alert("Please enter a valid number of pips.");
      return;
    }

    // Calculate pip value based on currency pair
    let pipValuePerPip;
    if (currencyPair === 'XAU/USD') {
      // For gold (XAU/USD):
      // 1 pip = $0.01 movement in price
      // 1 standard lot = 100 oz
      // Pip value per lot = 100 oz × $0.01 = $1 per pip per lot
      pipValuePerPip = size * 1; // $1 per pip per lot
    } else if (currencyPair.includes('JPY')) {
      // For JPY pairs, 1 pip = 0.01 (not 0.0001)
      // 1 standard lot = 100,000 units
      // Pip value = (0.01 / exchange rate) × lot size × 100,000
      // Simplified: approximately $9.17 per pip for 1 lot (varies with price)
      pipValuePerPip = size * 10; // Approximation
    } else {
      // For regular currency pairs (EUR/USD, GBP/USD, etc.)
      // 1 pip = 0.0001 movement
      // 1 standard lot = 100,000 units
      // Pip value = 0.0001 × 100,000 = $10 per pip per lot
      pipValuePerPip = size * 10;
    }

    const calculatedValue = pipValuePerPip * pipsCount;

    let symbol = '';
    if (accountCurrency.toUpperCase() === 'USD') symbol = '$';
    else if (accountCurrency.toUpperCase() === 'EUR') symbol = '€';
    else if (accountCurrency.toUpperCase() === 'GBP') symbol = '£';

    setPipValue(`${symbol}${calculatedValue.toFixed(2)}`);
  };

  const formInputStyle = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow shadow-sm";
  const formLabelStyle = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#2F4F4F' }}>
        Pip Value Calculator
      </h2>
      <p className="text-center text-gray-600 mb-6">Calculate the value of a single pip to manage your risk effectively.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currencyPair" className={formLabelStyle}>Currency Pair</label>
          <select id="currencyPair" value={currencyPair} onChange={e => setCurrencyPair(e.target.value)} className={formInputStyle}>
            {['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'XAU/USD'].map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pips" className={formLabelStyle}>
            {currencyPair === 'XAU/USD' ? 'Points/Pips' : 'Pips'}
          </label>
          <input type="number" id="pips" value={pips} onChange={e => setPips(e.target.value)} className={formInputStyle} placeholder="e.g., 10" step="0.1" />
          {currencyPair === 'XAU/USD' && (
            <p className="text-xs text-gray-500 mt-1">For gold: 1 point = $0.01 movement (e.g., from 2000.00 to 2000.10 = 10 points)</p>
          )}
        </div>
        <div>
          <label htmlFor="positionSize" className={formLabelStyle}>Position Size (in lots)</label>
          <input type="number" id="positionSize" value={positionSize} onChange={e => setPositionSize(e.target.value)} className={formInputStyle} placeholder="e.g., 1.0" step="0.01" />
        </div>
        <div>
          <label htmlFor="accountCurrency" className={formLabelStyle}>Account Currency</label>
          <input type="text" id="accountCurrency" value={accountCurrency} onChange={e => setAccountCurrency(e.target.value)} className={formInputStyle} placeholder="e.g., USD" />
        </div>
        <button
          type="submit"
          className="calculator-button w-full px-6 py-3.5 text-base shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-200"
        >
          Calculate Pip Value
        </button>
      </form>
      {pipValue !== null && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-lg text-gray-800">The value of {pips} pip{parseFloat(pips) !== 1 ? 's' : ''} is: <span className="font-bold" style={{ color: '#2F4F4F' }}>{pipValue}</span></p>
        </div>
      )}
    </div>
  );
};

export default PipValueCalculator;
