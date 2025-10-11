import React, { useState, useEffect, useRef } from 'react';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import { BROKERS } from '../constants';
import BrokerCard from '../components/BrokerCard';

type CalculatorTab = 'pipValue' | 'positionSize';

const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('positionSize');
  const tickerTapeRef = useRef<HTMLDivElement>(null);

  const tabStyle = "py-2 px-4 text-center cursor-pointer font-semibold transition-colors duration-300";
  const activeTabStyle = "text-orange-500 border-b-2 border-orange-500";
  const inactiveTabStyle = "text-gray-500 hover:text-orange-400";

  useEffect(() => {
    // Load TradingView Ticker Tape widget
    if (tickerTapeRef.current && !tickerTapeRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: [
          {
            proName: "FOREXCOM:SPXUSD",
            title: "S&P 500 "
          },
          {
            proName: "FOREXCOM:NSXUSD",
            title: "NASDAQ-100"
          },
          {
            proName: "FX_IDC:EURUSD",
            title: "EUR to USD"
          },
          {
            proName: "BITSTAMP:BTCUSD",
            title: "Bitcoin"
          },
          {
            proName: "BITSTAMP:ETHUSD",
            title: "Ethereum"
          },
          {
            proName: "OANDA:XAUUSD",
            title: "Gold"
          },
          {
            proName: "CMCMARKETS:GBPUSD",
            title: "GBP to USD"
          }
        ],
        colorTheme: "light",
        locale: "en",
        largeChartUrl: "",
        isTransparent: false,
        showSymbolLogo: true,
        displayMode: "adaptive"
      });
      tickerTapeRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-16">
      {/* TradingView Ticker Tape Widget */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div className="tradingview-widget-container" ref={tickerTapeRef}>
          <div className="tradingview-widget-container__widget"></div>
          <div className="tradingview-widget-copyright">
            <a href="https://www.tradingview.com/markets/" rel="noopener nofollow" target="_blank">
              <span className="blue-text">Ticker tape</span>
            </a>
            <span className="trademark"> by TradingView</span>
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
               <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                   <p className="text-gray-700 leading-relaxed">
                       Therefore, a 20-pip movement in XAU/USD would be calculated as follows:<br/>
                       20 pips * 10 points/pip = 200 points<br/><br/>
                       200 points = 20 Pips
                   </p>
               </div>
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
            <div className="flex justify-center">
                <div className="max-w-sm w-full">
                    {BROKERS.map((broker) => (
                        <BrokerCard key={broker.name} broker={broker} />
                    ))}
                </div>
            </div>
          </div>
      </section>
    </div>
  );
};

export default CalculatorsPage;