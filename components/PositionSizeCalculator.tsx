import React, { useState } from 'react';
import { ArrowRight, DollarSign, Info, Percent, Shield, ShieldAlert, Sparkles } from 'lucide-react';

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
  const getConversionPair = () => {
    if (currencyPair === 'XAU/USD') return null;

    const [baseCurrency, quoteCurrency] = currencyPair.split('/');

    if (quoteCurrency === accountCurrency) return null; // e.g. EUR/USD
    if (baseCurrency === accountCurrency) return null; // e.g. USD/JPY -> uses marketPrice

    if (quoteCurrency === 'JPY') return 'USD/JPY (for conversion)';
    if (quoteCurrency === 'GBP') return 'GBP/USD (for conversion)';
    if (quoteCurrency === 'CHF') return 'USD/CHF (for conversion)';
    if (quoteCurrency === 'CAD') return 'USD/CAD (for conversion)';
    if (quoteCurrency === 'AUD') return 'AUD/USD (for conversion)';
    if (quoteCurrency === 'NZD') return 'NZD/USD (for conversion)';
    if (quoteCurrency === 'EUR') return 'EUR/USD (for conversion)';

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
      alert('Please enter a valid positive account balance for percentage-based risk.');
      return;
    }

    if (isNaN(riskInput) || isNaN(sl) || riskInput <= 0 || sl <= 0) {
      alert('Please enter valid positive numbers for risk and stop loss.');
      return;
    }

    const riskAmount = riskType === 'percentage'
      ? balance * (riskInput / 100)
      : riskInput;

    let pipValue = 0;
    const [baseCurrency, quoteCurrency] = currencyPair.split('/');
    let pipSize, lotSize;

    if (currencyPair === 'XAU/USD') {
      pipValue = 1; // $1 per point for 1 standard lot
    } else {
      pipSize = currencyPair.includes('JPY') ? 0.01 : 0.0001;
      lotSize = 100000;

      if (quoteCurrency === accountCurrency) {
        pipValue = pipSize * lotSize;
      } else if (baseCurrency === accountCurrency) {
        if (isNaN(price) || price <= 0) {
          alert(`Please enter a valid current market price for ${currencyPair}.`);
          return;
        }
        pipValue = (pipSize * lotSize) / price;
      } else {
        const rawPipValue = pipSize * lotSize;

        if (quoteCurrency === 'JPY') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for USD/JPY.');
            return;
          }
          pipValue = rawPipValue / cPrice;
        } else if (quoteCurrency === 'GBP') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for GBP/USD.');
            return;
          }
          pipValue = rawPipValue * cPrice;
        } else if (quoteCurrency === 'CHF') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for USD/CHF.');
            return;
          }
          pipValue = rawPipValue / cPrice;
        } else if (quoteCurrency === 'EUR') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for EUR/USD.');
            return;
          }
          pipValue = rawPipValue * cPrice;
        } else if (quoteCurrency === 'CAD') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for USD/CAD.');
            return;
          }
          pipValue = rawPipValue / cPrice;
        } else if (quoteCurrency === 'AUD') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for AUD/USD.');
            return;
          }
          pipValue = rawPipValue * cPrice;
        } else if (quoteCurrency === 'NZD') {
          if (isNaN(cPrice) || cPrice <= 0) {
            alert('Please enter the conversion price for NZD/USD.');
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
      alert('Could not calculate pip value. Please check your inputs.');
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
  const accountCurrencies = ['USD'];

  const needsMarketPrice = () => {
    if (currencyPair === 'XAU/USD') return false;
    const [baseCurrency] = currencyPair.split('/');
    return baseCurrency === accountCurrency;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-forest-50/70 p-4 border border-forest-900/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm">
            <Shield className="h-4.5 w-4.5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-forest-950">
              Position Sizing & Risk Engine
            </h3>
            <p className="text-xs text-forest-900/70">
              Calculate exact lot sizes before entering the market.
            </p>
          </div>
        </div>

        {currencyPair === 'XAU/USD' && (
          <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 border border-amber-200">
            Gold (XAU/USD): 1 Point = $0.01 price move
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Account Currency & Balance */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="accountCurrencyPos" className={formLabelStyle}>
              Account Currency
            </label>
            <select
              id="accountCurrencyPos"
              value={accountCurrency}
              onChange={(e) => setAccountCurrency(e.target.value)}
              className={formInputStyle}
            >
              {accountCurrencies.map((c) => (
                <option key={c} value={c}>
                  {c} (United States Dollar)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="accountBalance" className={formLabelStyle}>
              Account Balance ($)
            </label>
            <div className="relative">
              <input
                type="number"
                id="accountBalance"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className={formInputStyle}
                placeholder="e.g., 10000"
                step="100"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
                USD
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Risk Type Toggle & Value */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={formLabelStyle}>Risk Type</label>
            <div className="flex rounded-xl p-1 bg-forest-50 border border-forest-900/10">
              <button
                type="button"
                onClick={() => setRiskType('percentage')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  riskType === 'percentage'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-forest-900/70 hover:text-forest-950'
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                <span>Percentage (%)</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskType('monetary')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  riskType === 'monetary'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-forest-900/70 hover:text-forest-950'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Monetary ($)</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="riskValue" className={formLabelStyle}>
              {riskType === 'percentage' ? 'Risk Percentage (%)' : 'Risk Amount ($)'}
            </label>
            <div className="relative">
              <input
                type="number"
                id="riskValue"
                value={riskValue}
                onChange={(e) => setRiskValue(e.target.value)}
                className={formInputStyle}
                placeholder={riskType === 'percentage' ? 'e.g., 1' : 'e.g., 100'}
                step={riskType === 'percentage' ? '0.1' : '1'}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
                {riskType === 'percentage' ? '%' : 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Stop Loss & Currency Pair */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="stopLoss" className={formLabelStyle}>
              Stop Loss ({currencyPair === 'XAU/USD' ? 'Points' : 'Pips'})
            </label>
            <input
              type="number"
              id="stopLoss"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 20"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="posCurrencyPair" className={formLabelStyle}>
              Instrument / Currency Pair
            </label>
            <select
              id="posCurrencyPair"
              value={currencyPair}
              onChange={(e) => setCurrencyPair(e.target.value)}
              className={formInputStyle}
            >
              {currencyPairs.map((p) => (
                <option key={p} value={p}>
                  {p} {p === 'XAU/USD' ? '(Gold Spot)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Inputs for Market Price and Cross Currency */}
        {needsMarketPrice() && (
          <div>
            <label htmlFor="marketPrice" className={formLabelStyle}>
              Current Market Price of {currencyPair}
            </label>
            <input
              type="number"
              id="marketPrice"
              value={marketPrice}
              onChange={(e) => setMarketPrice(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 145.50"
              step="0.01"
            />
          </div>
        )}

        {conversionPairLabel && (
          <div>
            <label htmlFor="conversionPrice" className={formLabelStyle}>
              Current Rate for {conversionPairLabel}
            </label>
            <input
              type="number"
              id="conversionPrice"
              value={conversionPrice}
              onChange={(e) => setConversionPrice(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 1.2500"
              step="0.0001"
            />
          </div>
        )}

        {/* Arabic Guidance Note for Gold */}
        <p className="text-xs text-forest-900/60 leading-relaxed" dir="rtl">
          💡 تنبيه للمتداولين: إذا كنت تتداول الذهب (XAU/USD)، يرجى وضع مسافة وقف الخسارة بالنقاط السعرية (Points) وليس (Pips).
        </p>

        {/* Primary Action Button */}
        <button
          type="submit"
          className="pressable inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 py-3.5 px-6 text-sm font-bold text-white shadow-card-rest transition-all duration-200 hover:bg-forest-700 hover:shadow-card-hover active:scale-[0.98]"
        >
          <span>Calculate Position Size</span>
          <ArrowRight className="h-4 w-4 text-emerald-300" />
        </button>
      </form>

      {/* Results Ticket */}
      {result && (
        <div className="overflow-hidden rounded-2xl border border-forest-900/15 bg-white shadow-card-hover transition-all animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header Ticket Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 bg-forest-50/70 p-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Recommended Execution
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-forest-800 border border-forest-900/10 shadow-sm">
              Capital at Risk:
              <span className="font-extrabold text-forest-950">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: result.accountCurrency,
                }).format(result.riskAmount)}
              </span>
            </div>
          </div>

          {/* 3-Tier Lots Breakdown */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Standard Lots Hero Card */}
              <div className="relative rounded-2xl bg-forest-950 p-5 text-center text-white shadow-md border border-forest-800">
                <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                  Primary Standard
                </span>
                <div className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {result.standardLots.toFixed(2)}
                </div>
                <p className="mt-1 text-xs font-semibold text-forest-200">
                  Standard Lots (100k units)
                </p>
              </div>

              {/* Mini Lots Card */}
              <div className="rounded-2xl bg-forest-50/50 p-5 text-center border border-forest-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                  Mini Size
                </span>
                <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                  {result.miniLots.toFixed(2)}
                </div>
                <p className="mt-1 text-xs font-semibold text-forest-900/70">
                  Mini Lots (10k units)
                </p>
              </div>

              {/* Micro Lots Card */}
              <div className="rounded-2xl bg-forest-50/50 p-5 text-center border border-forest-900/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                  Micro Size
                </span>
                <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                  {result.microLots.toFixed(2)}
                </div>
                <p className="mt-1 text-xs font-semibold text-forest-900/70">
                  Micro Lots (1k units)
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-forest-50/80 p-3 text-xs text-forest-900/75 border border-forest-900/[0.06]">
              <Info className="h-4 w-4 shrink-0 text-forest-700" />
              <span>
                Always double check spread and broker commission before placing the order to preserve your exact risk parameters.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionSizeCalculator;
