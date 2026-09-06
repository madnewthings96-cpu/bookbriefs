import React, { useState } from 'react';
import { ArrowRight, Calculator, CheckCircle2, DollarSign, Info, Sparkles, TrendingUp } from 'lucide-react';

const PipValueCalculator: React.FC = () => {
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [pips, setPips] = useState('10');
  const [positionSize, setPositionSize] = useState('1.0');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [pipValue, setPipValue] = useState<string | null>(null);
  const [unitPipValue, setUnitPipValue] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(positionSize);
    const pipsCount = parseFloat(pips);

    if (isNaN(size) || size <= 0) {
      alert('Please enter a valid position size.');
      return;
    }

    if (isNaN(pipsCount) || pipsCount <= 0) {
      alert('Please enter a valid number of pips.');
      return;
    }

    // Calculate pip value based on currency pair
    let pipValuePerPip;
    if (currencyPair === 'XAU/USD') {
      pipValuePerPip = size * 1; // $1 per point for 1 standard lot
    } else if (currencyPair.includes('JPY')) {
      pipValuePerPip = size * 10;
    } else {
      pipValuePerPip = size * 10;
    }

    const calculatedTotal = pipValuePerPip * pipsCount;

    let symbol = '$';
    if (accountCurrency.toUpperCase() === 'EUR') symbol = '€';
    else if (accountCurrency.toUpperCase() === 'GBP') symbol = '£';

    setPipValue(`${symbol}${calculatedTotal.toFixed(2)}`);
    setUnitPipValue(`${symbol}${pipValuePerPip.toFixed(2)}`);
  };

  const formInputStyle =
    'w-full px-4 py-2.5 rounded-xl border border-forest-900/15 bg-white text-sm font-medium text-forest-950 placeholder:text-forest-900/30 focus:border-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-700/10 transition-all shadow-sm';
  const formLabelStyle = 'block text-xs font-bold uppercase tracking-wider text-forest-900/80 mb-1.5';

  const currencyPairs = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'USD/CAD',
    'AUD/USD',
    'NZD/USD',
    'USD/CHF',
    'EUR/GBP',
    'EUR/JPY',
    'GBP/JPY',
    'AUD/JPY',
    'XAU/USD',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-forest-50/70 p-4 border border-forest-900/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm">
            <Calculator className="h-4.5 w-4.5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-forest-950">
              Pip & Point Value Calculator
            </h3>
            <p className="text-xs text-forest-900/70">
              Translate market price movement into exact account currency.
            </p>
          </div>
        </div>

        {currencyPair === 'XAU/USD' && (
          <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 border border-amber-200">
            Gold (XAU/USD): 1 Point = $0.01 movement
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="currencyPair" className={formLabelStyle}>
              Instrument / Pair
            </label>
            <select
              id="currencyPair"
              value={currencyPair}
              onChange={(e) => setCurrencyPair(e.target.value)}
              className={formInputStyle}
            >
              {currencyPairs.map((pair) => (
                <option key={pair} value={pair}>
                  {pair} {pair === 'XAU/USD' ? '(Gold Spot)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pips" className={formLabelStyle}>
              {currencyPair === 'XAU/USD' ? 'Price Movement (Points)' : 'Price Movement (Pips)'}
            </label>
            <input
              type="number"
              id="pips"
              value={pips}
              onChange={(e) => setPips(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 10"
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="positionSize" className={formLabelStyle}>
              Position Size (Lots)
            </label>
            <input
              type="number"
              id="positionSize"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 1.0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="accountCurrency" className={formLabelStyle}>
              Account Currency
            </label>
            <input
              type="text"
              id="accountCurrency"
              value={accountCurrency}
              onChange={(e) => setAccountCurrency(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., USD"
            />
          </div>
        </div>

        {currencyPair === 'XAU/USD' && (
          <p className="text-xs text-forest-900/60 leading-relaxed">
            Note: For Gold (XAU/USD), 1 standard lot = 100 oz. A $1.00 move in gold price equals 100 points ($100 per standard lot).
          </p>
        )}

        <button
          type="submit"
          className="pressable inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 py-3.5 px-6 text-sm font-bold text-white shadow-card-rest transition-all duration-200 hover:bg-forest-700 hover:shadow-card-hover active:scale-[0.98]"
        >
          <span>Calculate Pip Value</span>
          <ArrowRight className="h-4 w-4 text-emerald-300" />
        </button>
      </form>

      {/* Result Display */}
      {pipValue !== null && (
        <div className="overflow-hidden rounded-2xl border border-forest-900/15 bg-white shadow-card-hover animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-forest-900/10 bg-forest-50/70 p-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Movement Valuation
              </span>
            </div>
            <div className="text-xs font-semibold text-forest-800">
              {positionSize} Lots on {currencyPair}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-2xl bg-forest-950 p-5 text-center text-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Total Movement Value ({pips} {currencyPair === 'XAU/USD' ? 'Points' : 'Pips'})
              </span>
              <div className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {pipValue}
              </div>
              <p className="mt-1 text-xs text-forest-200">
                Net value of this movement for your position
              </p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-forest-50/50 p-5 border border-forest-900/10">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900/60">
                Value Per Single Pip
              </span>
              <div className="mt-1 font-display text-2xl font-extrabold text-forest-950 sm:text-3xl">
                {unitPipValue} <span className="text-sm font-normal text-forest-900/60">/ pip</span>
              </div>
              <p className="mt-2 text-xs text-forest-900/70">
                Every {currencyPair === 'XAU/USD' ? 'point' : 'pip'} the market moves changes your equity by this amount.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipValueCalculator;
