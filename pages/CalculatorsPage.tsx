import React, { useState } from 'react';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import { BROKERS } from '../constants';
import BrokerCard from '../components/BrokerCard';

type CalculatorTab = 'pipValue' | 'positionSize';

const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('positionSize');

  const tabStyle = "py-2 px-4 text-center cursor-pointer font-semibold transition-colors duration-300";
  const activeTabStyle = "text-orange-500 border-b-2 border-orange-500";
  const inactiveTabStyle = "text-gray-500 hover:text-orange-400";

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section>
          <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: '#2F4F4F' }}>Stay up to date!</h1>
                  <p className="text-lg text-gray-600 mb-6">Add Calculator to your browser</p>
                  <a href="#" className="inline-flex items-center space-x-2 bg-white border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg" alt="Chrome Logo" className="h-6 w-6"/>
                      <span className="font-semibold text-gray-700">Add To Chrome</span>
                  </a>
              </div>
              <div>
                  <img src="https://assets-global.website-files.com/6036982905cd287ad4a26d70/61793734139e802772589574_economic-calendar-hero-p-1080.png" alt="Forex Trading Platform on Laptop" className="rounded-lg shadow-xl" />
              </div>
          </div>
      </section>

      {/* Calculators Section */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold" style={{ color: '#2F4F4F' }}>
            Forex Trading Calculators
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Essential tools for your trading journey.
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="flex justify-center border-b mb-6">
            <div
              className={`${tabStyle} ${activeTab === 'pipValue' ? activeTabStyle : inactiveTabStyle}`}
              onClick={() => setActiveTab('pipValue')}
              role="tab"
              aria-selected={activeTab === 'pipValue'}
            >
              Pip Value Calculator
            </div>
            <div
              className={`${tabStyle} ${activeTab === 'positionSize' ? activeTabStyle : inactiveTabStyle}`}
              onClick={() => setActiveTab('positionSize')}
              role="tab"
              aria-selected={activeTab === 'positionSize'}
            >
              Position Size Calculator
            </div>
          </div>
          <div>
            {activeTab === 'pipValue' && <PipValueCalculator />}
            {activeTab === 'positionSize' && <PositionSizeCalculator />}
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-orange-400">
               <h2 className="text-2xl font-bold mb-3" style={{ color: '#2F4F4F' }}>Why is Position Sizing Important?</h2>
               <p className="text-gray-700 leading-relaxed">
                   Proper position sizing is one of the most critical aspects of successful trading and risk management. It determines how many lots to trade per position, ensuring you don't risk too much of your capital on a single trade. By calculating the correct size, you can protect your account from significant losses, survive market volatility, and maintain the discipline needed for long-term consistency.
               </p>
          </div>
      </section>


      {/* Forex Brokers Section */}
      <section className="bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#2F4F4F' }}>
                    Open a Forex account
                </h2>
                <a href="#" className="text-orange-500 font-semibold hover:underline flex items-center space-x-1">
                    <span>More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {BROKERS.map((broker) => (
                    <BrokerCard key={broker.name} broker={broker} />
                ))}
            </div>
          </div>
      </section>
    </div>
  );
};

export default CalculatorsPage;