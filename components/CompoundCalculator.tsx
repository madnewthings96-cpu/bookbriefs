import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LineChart, Sparkles, TrendingUp } from 'lucide-react';

const CompoundCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(20);
  const [compoundFrequency, setCompoundFrequency] = useState<string>('monthly');

  const calculateCompound = () => {
    const r = annualRate / 100;
    const n =
      compoundFrequency === 'annually'
        ? 1
        : compoundFrequency === 'quarterly'
        ? 4
        : compoundFrequency === 'monthly'
        ? 12
        : 365;
    const t = years;
    const monthlyRate = r / 12;

    const fvInitial = initialAmount * Math.pow(1 + r / n, n * t);

    const monthsTotal = years * 12;
    let fvContributions = 0;

    if (monthlyContribution > 0) {
      fvContributions =
        monthlyContribution * ((Math.pow(1 + monthlyRate, monthsTotal) - 1) / monthlyRate);
    }

    const totalValue = fvInitial + fvContributions;
    const totalContributed = initialAmount + monthlyContribution * monthsTotal;
    const interestEarned = totalValue - totalContributed;

    return {
      totalValue,
      totalContributed,
      interestEarned,
      returnOnInvestment: totalContributed > 0 ? (interestEarned / totalContributed) * 100 : 0,
    };
  };

  const results = calculateCompound();

  const generateYearlyData = () => {
    const data = [];
    const r = annualRate / 100;
    const monthlyRate = r / 12;

    for (let year = 0; year <= years; year++) {
      const monthsElapsed = year * 12;
      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, monthsElapsed);
      const fvContributions =
        monthlyContribution > 0
          ? monthlyContribution * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate)
          : 0;

      const totalContributed = initialAmount + monthlyContribution * monthsElapsed;
      const totalValue = fvInitial + fvContributions;

      data.push({
        year,
        contributed: totalContributed,
        total: totalValue,
      });
    }
    return data;
  };

  const yearlyData = generateYearlyData();
  const maxValue = Math.max(...yearlyData.map((d) => d.total));

  const formInputStyle =
    'w-full px-4 py-2.5 rounded-xl border border-forest-900/15 bg-white text-sm font-medium text-forest-950 placeholder:text-forest-900/30 focus:border-forest-700 focus:outline-none focus:ring-4 focus:ring-forest-700/10 transition-all shadow-sm';
  const formLabelStyle = 'block text-xs font-bold uppercase tracking-wider text-forest-900/80 mb-1.5';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-forest-50/70 p-4 border border-forest-900/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-white shadow-sm">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-forest-950">
              Compound Growth Visualizer
            </h3>
            <p className="text-xs text-forest-900/70">
              Project future net worth through regular monthly contributions and exponential growth.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-900 border border-forest-900/10 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Exponential Compounding
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Initial Amount */}
        <div>
          <label className={formLabelStyle}>Initial Investment ($)</label>
          <div className="relative">
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              step="1000"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              USD
            </span>
          </div>
        </div>

        {/* Monthly Contribution */}
        <div>
          <label className={formLabelStyle}>Monthly Contribution ($)</label>
          <div className="relative">
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              step="50"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              / Month
            </span>
          </div>
        </div>

        {/* Annual Interest Rate */}
        <div>
          <label className={formLabelStyle}>Annual Rate of Return (%)</label>
          <div className="relative">
            <input
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className={formInputStyle}
              min="0"
              max="30"
              step="0.5"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              %
            </span>
          </div>
        </div>

        {/* Time Period */}
        <div>
          <label className={formLabelStyle}>Investment Horizon (Years)</label>
          <div className="relative">
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className={formInputStyle}
              min="1"
              max="50"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-900/40">
              Years
            </span>
          </div>
        </div>

        {/* Compounding Frequency */}
        <div className="sm:col-span-2">
          <label className={formLabelStyle}>Compounding Schedule</label>
          <select
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(e.target.value)}
            className={formInputStyle}
          >
            <option value="daily">Daily (365 times/year)</option>
            <option value="monthly">Monthly (12 times/year - Standard)</option>
            <option value="quarterly">Quarterly (4 times/year)</option>
            <option value="annually">Annually (1 time/year)</option>
          </select>
        </div>
      </div>

      {/* Results Dashboard: Executive Growth Board */}
      <div className="overflow-hidden rounded-2xl border border-forest-900/15 bg-white shadow-card-hover">
        {/* Top Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 bg-forest-50/70 p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
              Portfolio Growth Projections
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800">
            <span>Horizon:</span>
            <span className="font-extrabold text-forest-950">{years} Years</span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Future Total Value */}
            <div className="relative rounded-2xl bg-forest-950 p-5 text-white border border-forest-800 shadow-md">
              <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                Future Portfolio
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ${results.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <p className="mt-1 text-xs text-forest-200">
                Total accumulated value at Year {years}
              </p>
            </div>

            {/* Total Deposited */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Total Principal Deposited
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                ${results.totalContributed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <p className="mt-1 text-xs text-forest-900/70">
                Initial deposit + regular contributions
              </p>
            </div>

            {/* Compound Interest Generated */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Pure Interest Generated
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl">
                +${results.interestEarned.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <p className="mt-1 text-xs text-forest-900/70">
                Free wealth generated by compounding
              </p>
            </div>

            {/* Total ROI % */}
            <div className="rounded-2xl bg-forest-50/60 p-5 border border-forest-900/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900/60">
                Total Return (ROI)
              </span>
              <div className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                +{results.returnOnInvestment.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-forest-900/70">
                Gain over your total deposited principal
              </p>
            </div>
          </div>

          {/* Clean Growth Over Time Bar Chart */}
          <div className="rounded-2xl bg-forest-50/40 p-5 border border-forest-900/[0.08]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-sm font-bold text-forest-950">
                Compound Trajectory: Principal vs. Earned Growth
              </h4>
              <div className="flex items-center gap-4 text-xs font-medium text-forest-900/80">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-forest-800" />
                  <span>Deposited Principal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                  <span>Compounded Interest</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {yearlyData
                .filter(
                  (_, index) =>
                    index % Math.ceil(years / 8) === 0 || index === yearlyData.length - 1
                )
                .map((data) => (
                  <div key={data.year} className="flex items-center gap-3">
                    <span className="w-14 text-xs font-bold text-forest-900/70 tabular-nums">
                      Yr {data.year}
                    </span>

                    <div className="flex flex-1 h-6 overflow-hidden rounded-lg bg-forest-900/10">
                      {/* Principal bar */}
                      <div
                        className="h-full bg-forest-800 transition-all duration-500"
                        style={{ width: `${(data.contributed / maxValue) * 100}%` }}
                        title={`Contributed: $${data.contributed.toLocaleString()}`}
                      />
                      {/* Interest bar */}
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${((data.total - data.contributed) / maxValue) * 100}%`,
                        }}
                        title={`Interest: $${(data.total - data.contributed).toLocaleString()}`}
                      />
                    </div>

                    <span className="w-24 text-right text-xs font-bold text-forest-950 tabular-nums">
                      ${data.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Mental Model Callout */}
          <div className="rounded-2xl bg-forest-50/80 p-4 border border-forest-900/[0.06] text-xs text-forest-900/80 leading-relaxed">
            <span className="font-bold text-forest-950">The Compounding Law: </span>
            In the early years, your savings rate drives 90% of your progress. In the late years, compound interest does 90% of the work. Notice how the green bar widens dramatically in the second half of the horizon.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundCalculator;
