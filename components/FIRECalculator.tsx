import React, { useState } from 'react';

const FIRECalculator: React.FC = () => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [currentSavings, setCurrentSavings] = useState<number>(50000);
  const [annualIncome, setAnnualIncome] = useState<number>(60000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(40000);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(4);

  const calculateFIRE = () => {
    // Calculate annual savings
    const annualSavings = annualIncome - annualExpenses;
    
    // Calculate FIRE number (25x annual expenses rule)
    const fireNumber = annualExpenses * (100 / withdrawalRate);
    
    // Calculate years to FIRE
    const r = expectedReturn / 100;
    let yearsToFIRE = 0;
    
    if (annualSavings > 0) {
      // Future Value of Annuity formula with initial principal
      // FV = PV(1 + r)^n + PMT * [((1 + r)^n - 1) / r]
      // Solving for n (years)
      
      const pv = currentSavings;
      const pmt = annualSavings;
      const fv = fireNumber;
      
      if (pv >= fv) {
        yearsToFIRE = 0;
      } else {
        // Iterative approach to find years
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
      savingsRate
    };
  };

  const results = calculateFIRE();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Age
          </label>
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="18"
            max="100"
          />
        </div>

        {/* Current Savings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Savings ($)
          </label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="1000"
          />
        </div>

        {/* Annual Income */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Income ($)
          </label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="1000"
          />
        </div>

        {/* Annual Expenses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Expenses ($)
          </label>
          <input
            type="number"
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            step="1000"
          />
        </div>

        {/* Expected Return */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual Return (%)
          </label>
          <input
            type="number"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="0"
            max="20"
            step="0.5"
          />
        </div>

        {/* Withdrawal Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Safe Withdrawal Rate (%)
          </label>
          <input
            type="number"
            value={withdrawalRate}
            onChange={(e) => setWithdrawalRate(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            min="1"
            max="10"
            step="0.5"
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Your FIRE Journey</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FIRE Number */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">FIRE Number</p>
            <p className="text-2xl font-bold text-orange-600">
              ${results.fireNumber.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Amount needed to retire
            </p>
          </div>

          {/* Years to FIRE */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Years to FIRE</p>
            <p className="text-2xl font-bold text-green-600">
              {results.yearsToFIRE === Infinity ? '∞' : results.yearsToFIRE.toFixed(1)} years
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Time until financial independence
            </p>
          </div>

          {/* FIRE Age */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">FIRE Age</p>
            <p className="text-2xl font-bold text-blue-600">
              {results.yearsToFIRE === Infinity ? 'N/A' : Math.round(results.fireAge)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Age at financial independence
            </p>
          </div>

          {/* Savings Rate */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Savings Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {results.savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ${results.annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
          <h4 className="font-semibold text-gray-700 mb-2">💡 Understanding Your Results</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>FIRE Number:</strong> The total amount you need to save based on the {withdrawalRate}% rule</li>
            <li>• <strong>Years to FIRE:</strong> Time needed to reach your goal with current savings rate</li>
            <li>• <strong>Savings Rate:</strong> Percentage of income saved annually</li>
            {results.yearsToFIRE === Infinity && (
              <li className="text-red-600 font-medium">
                ⚠️ Your expenses exceed income. Increase income or reduce expenses to achieve FIRE.
              </li>
            )}
            {results.savingsRate < 20 && results.savingsRate > 0 && (
              <li className="text-yellow-600 font-medium">
                ⚡ Consider increasing your savings rate to reach FIRE faster!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;
