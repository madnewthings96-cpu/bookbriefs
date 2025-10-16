import React, { useState } from 'react';

const CompoundCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [years, setYears] = useState<number>(20);
  const [compoundFrequency, setCompoundFrequency] = useState<string>('monthly');

  const calculateCompound = () => {
    const r = annualRate / 100;
    const n = compoundFrequency === 'annually' ? 1 
              : compoundFrequency === 'quarterly' ? 4 
              : compoundFrequency === 'monthly' ? 12 
              : 365; // daily
    const t = years;
    const monthlyRate = r / 12;
    
    // Future value of initial investment
    const fvInitial = initialAmount * Math.pow(1 + r / n, n * t);
    
    // Future value of monthly contributions (annuity)
    const monthsTotal = years * 12;
    let fvContributions = 0;
    
    if (monthlyContribution > 0) {
      // Using the future value of annuity formula
      fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsTotal) - 1) / monthlyRate);
    }
    
    const totalValue = fvInitial + fvContributions;
    const totalContributed = initialAmount + (monthlyContribution * monthsTotal);
    const interestEarned = totalValue - totalContributed;
    
    return {
      totalValue,
      totalContributed,
      interestEarned,
      returnOnInvestment: totalContributed > 0 ? ((interestEarned / totalContributed) * 100) : 0
    };
  };

  const results = calculateCompound();

  // Generate data for visualization
  const generateYearlyData = () => {
    const data = [];
    const r = annualRate / 100;
    const monthlyRate = r / 12;
    
    for (let year = 0; year <= years; year++) {
      const monthsElapsed = year * 12;
      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, monthsElapsed);
      const fvContributions = monthlyContribution > 0 
        ? monthlyContribution * ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate) 
        : 0;
      
      const totalContributed = initialAmount + (monthlyContribution * monthsElapsed);
      const totalValue = fvInitial + fvContributions;
      
      data.push({
        year,
        contributed: totalContributed,
        total: totalValue
      });
    }
    return data;
  };

  const yearlyData = generateYearlyData();
  const maxValue = Math.max(...yearlyData.map(d => d.total));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initial Investment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="1000"
          />
        </div>

        {/* Monthly Contribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="100"
          />
        </div>

        {/* Annual Interest Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            max="30"
            step="0.5"
          />
        </div>

        {/* Time Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="1"
            max="50"
          />
        </div>

        {/* Compound Frequency */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compound Frequency
          </label>
          <select
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Investment Growth Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Future Value */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Future Value</p>
            <p className="text-2xl font-bold text-blue-600">
              ${results.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total amount after {years} years
            </p>
          </div>

          {/* Total Contributed */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Contributed</p>
            <p className="text-2xl font-bold text-green-600">
              ${results.totalContributed.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your total deposits
            </p>
          </div>

          {/* Interest Earned */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Interest Earned</p>
            <p className="text-2xl font-bold text-purple-600">
              ${results.interestEarned.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Growth from compound interest
            </p>
          </div>

          {/* ROI */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Return on Investment</p>
            <p className="text-2xl font-bold text-orange-600">
              {results.returnOnInvestment.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total percentage gain
            </p>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart Visualization */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Growth Over Time</h4>
        <div className="space-y-2">
          {yearlyData.filter((_, index) => index % Math.ceil(years / 10) === 0 || index === yearlyData.length - 1).map((data) => (
            <div key={data.year} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-16">Year {data.year}</span>
              <div className="flex-1 flex gap-1">
                <div 
                  className="bg-green-400 h-6 rounded-l transition-all duration-300 relative group"
                  style={{ width: `${(data.contributed / maxValue) * 100}%` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold opacity-0 group-hover:opacity-100">
                    ${data.contributed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div 
                  className="bg-blue-500 h-6 rounded-r transition-all duration-300 relative group"
                  style={{ width: `${((data.total - data.contributed) / maxValue) * 100}%` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold opacity-0 group-hover:opacity-100">
                    ${(data.total - data.contributed).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-600 w-24 text-right">
                ${data.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-gray-600">Contributed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Interest</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-4 bg-white rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-700 mb-2">💡 The Power of Compound Interest</h4>
        <p className="text-sm text-gray-600">
          Compound interest is often called the "eighth wonder of the world." Your money grows exponentially 
          as interest is earned on both your initial investment and the accumulated interest from previous periods. 
          The key factors are: <strong>starting early</strong>, <strong>contributing regularly</strong>, and 
          <strong>giving it time to grow</strong>.
        </p>
      </div>
    </div>
  );
};

export default CompoundCalculator;
