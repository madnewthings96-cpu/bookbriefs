
import React, { useState } from 'react';

const PipValueCalculator: React.FC = () => {
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [positionSize, setPositionSize] = useState('1.0');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [pipValue, setPipValue] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(positionSize);
    if (isNaN(size) || size <= 0) {
      alert("Please enter a valid position size.");
      return;
    }

    // Calculate pip value based on currency pair
    let calculatedValue;
    if (currencyPair === 'XAU/USD') {
      // For gold, 1 pip = $1 per oz, and standard lot is 100 oz
      calculatedValue = size * 100;
    } else {
      // For regular currency pairs, 1 pip = $10 per standard lot
      calculatedValue = size * 10;
    }
    
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
            {['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD', 'NZD/USD', 'XAU/USD'].map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
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
          className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-all duration-300"
          style={{ backgroundColor: '#FF7F50' }}
        >
          Calculate Pip Value
        </button>
      </form>
      {pipValue !== null && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-lg text-gray-800">The value of one pip is: <span className="font-bold" style={{color: '#2F4F4F'}}>{pipValue}</span></p>
        </div>
      )}
    </div>
  );
};

export default PipValueCalculator;
