import React, { useState } from 'react';
import { Award, Flame, Info, Lightbulb, PiggyBank, Sparkles, TrendingUp, Zap } from 'lucide-react';

const FIRECalculator: React.FC = () => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [currentSavings, setCurrentSavings] = useState<number>(50000);
  const [annualIncome, setAnnualIncome] = useState<number>(60000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(40000);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(4);

  const calculateFIRE = () => {
    const annualSavings = annualIncome - annualExpenses;
    const fireNumber = annualExpenses * (100 / withdrawalRate);
    const r = expectedReturn / 100;
    let yearsToFIRE = 0;

    if (annualSavings > 0) {
      const pv = currentSavings;
      const pmt = annualSavings;
      const fv = fireNumber;

      if (pv >= fv) {
        yearsToFIRE = 0;
      } else {
        for (let n = 1; n <= 100; n++) {
          const futureValue = pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
          if (futureValue >= fv) {
            yearsToFIRE = n;
            break;
          }
        }
      }
    } else {
      yearsToFIRE = Infinity;
    }

    const fireAge = currentAge + yearsToFIRE;
    const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

    return {
      fireNumber,
      yearsToFIRE,
      fireAge,
      annualSavings,
      savingsRate,
    };
  };

  const results = calculateFIRE();

  const formInputStyle =
    'w-full px-4 py-2.5 rounded-xl border border-forest-900/15 bg-white text-sm font-medium text-forest-950 placeholder:text-forest-900/30 focus:border-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-700/10 transition-all shadow-sm';
  const formLabelStyle = 'block text-xs font-bold uppercase tracking-wider text-forest-900/80 mb-1.5';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-forest-50/70 p-4 border border-forest-900/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm">
            <Flame className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-forest-950">
              Financial Independence Planner
            </h3>
            <p className="text-xs text-forest-900/70">
              Calculate your personal FIRE target and timeline to financial freedom.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-900 border border-forest-900/10 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Based on the 25x Rule
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current Age */}
        <div>
          <label className={formLabelStyle}>Current Age</label>
          <div className="relative">
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className={formInputStyle}
              min="18"
              max="100"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              Years
            </span>
          </div>
        </div>

        {/* Current Savings */}
        <div>
          <label className={formLabelStyle}>Current Portfolio Savings ($)</label>
          <div className="relative">
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              step="1000"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              USD
            </span>
          </div>
        </div>

        {/* Annual Income */}
        <div>
          <label className={formLabelStyle}>Annual Net Income ($)</label>
          <div className="relative">
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              step="1000"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              / Year
            </span>
          </div>
        </div>

        {/* Annual Expenses */}
        <div>
          <label className={formLabelStyle}>Annual Lifestyle Expenses ($)</label>
          <div className="relative">
            <input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              step="1000"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              / Year
            </span>
          </div>
        </div>

        {/* Expected Return */}
        <div>
          <label className={formLabelStyle}>Expected Annual Return (%)</label>
          <div className="relative">
            <input
              type="number"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              max="20"
              step="0.5"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              %
            </span>
          </div>
        </div>

        {/* Safe Withdrawal Rate */}
        <div>
          <label className={formLabelStyle}>Safe Withdrawal Rate (%)</label>
          <div className="relative">
            <input
              type="number"
              value={withdrawalRate}
              onChange={(e) => setWithdrawalRate(Number(e.target.value))}
              className={formInputStyle}
              min="1"
              max="10"
              step="0.5"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Results Section: Financial Freedom Milestone Board */}
      <div className="overflow-hidden rounded-2xl border border-forest-900/15 bg-white shadow-card-hover">
        {/* Top Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 bg-forest-50/70 p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
              Your Financial Independence Roadmap
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800">
            <span>Annual Savings:</span>
            <span className="font-extrabold text-forest-950">
              ${results.annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Target FIRE Number */}
            <div className="relative rounded-2xl bg-forest-950 p-5 text-white border border-forest-800 shadow-md">
              <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                Target Portfolio
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ${results.fireNumber.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <p className="mt-1 text-xs text-forest-200">
                Amount required to sustain ${annualExpenses.toLocaleString()}/yr
              </p>
            </div>

            {/* Years to FIRE */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Years to Reach
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                {results.yearsToFIRE === Infinity ? '∞' : `${results.yearsToFIRE.toFixed(1)} yrs`}
              </div>
              <p className="mt-1 text-xs text-forest-900/70">
                Time until full financial freedom
              </p>
            </div>

            {/* Projected FIRE Age */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Projected FIRE Age
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                {results.yearsToFIRE === Infinity ? 'N/A' : `Age ${Math.round(results.fireAge)}`}
              </div>
              <p className="mt-1 text-xs text-forest-900/70">
                Retirement age on current trajectory
              </p>
            </div>

            {/* Savings Rate with Mini Bar */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Savings Rate
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                {results.savingsRate.toFixed(1)}%
              </div>
              {/* Progress visual */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-forest-900/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(results.savingsRate, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strategic Insight Callout */}
          <div className="rounded-2xl bg-forest-50/80 p-4 border border-forest-900/[0.06] flex items-start gap-3">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs leading-relaxed text-forest-900/80 space-y-1">
              <p className="font-bold text-forest-950">
                The Core Math of Financial Freedom:
              </p>
              <p>
                Your savings rate determines your timeline far more than your investment returns. At a 50% savings rate, you achieve financial freedom in approximately 17 years from scratch. Increasing your savings rate from 20% to 40% can cut your working timeline by over a decade.
              </p>
              {results.yearsToFIRE === Infinity && (
                <p className="font-bold text-rose-600">
                  ⚠️ Your annual expenses currently meet or exceed your income. Lowering annual burn or creating supplementary cashflow will activate the compounding engine.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;
