import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PipValueCalculator from '../components/PipValueCalculator';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import FIRECalculator from '../components/FIRECalculator';
import CompoundCalculator from '../components/CompoundCalculator';
import { BROKERS } from '../constants';
import BrokerCard from '../components/BrokerCard';

type CalculatorTab = 'pipValue' | 'positionSize' | 'fire' | 'compound';

const CalculatorsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL
  const getTabFromPath = (path: string): CalculatorTab => {
    if (path.includes('/pip-value')) return 'pipValue';
    if (path.includes('/position-size')) return 'positionSize';
    if (path.includes('/fire')) return 'fire';
    if (path.includes('/compound-interest')) return 'compound';
    return 'positionSize'; // default
  };

  const [activeTab, setActiveTab] = useState<CalculatorTab>(getTabFromPath(location.pathname));
  const tickerTapeRef = useRef<HTMLDivElement>(null);
  
  // Initialize ads after they're loaded
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [activeTab]); // Re-initialize when tab changes

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Handle tab change with URL update
  const handleTabChange = (tab: CalculatorTab) => {
    setActiveTab(tab);
    const pathMap: Record<CalculatorTab, string> = {
      pipValue: '/calculators/pip-value',
      positionSize: '/calculators/position-size',
      fire: '/calculators/fire',
      compound: '/calculators/compound-interest'
    };
    navigate(pathMap[tab]);
  };

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

      {/* Main Content with Sidebar Ads */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          {/* Left Sidebar Ad */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <ins className="adsbygoogle"
                   style={{ display: 'block' }}
                   data-ad-client="ca-pub-2497273887935019"
                   data-ad-slot="1234567890"
                   data-ad-format="vertical"
                   data-full-width-responsive="true"></ins>
            </div>
          </aside>

          {/* Calculators Section */}
          <section className="flex-1 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold" style={{ color: '#2F4F4F' }}>
                Forex Trading Calculators
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Essential tools for your trading journey.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
              <div className="flex justify-center border-b mb-6 overflow-x-auto">
                <div
                  className={`${tabStyle} ${activeTab === 'pipValue' ? activeTabStyle : inactiveTabStyle}`}
                  onClick={() => handleTabChange('pipValue')}
                  role="tab"
                  aria-selected={activeTab === 'pipValue'}
                >
                  Pip Value
                </div>
                <div
                  className={`${tabStyle} ${activeTab === 'positionSize' ? activeTabStyle : inactiveTabStyle}`}
                  onClick={() => handleTabChange('positionSize')}
                  role="tab"
                  aria-selected={activeTab === 'positionSize'}
                >
                  Position Size
                </div>
                <div
                  className={`${tabStyle} ${activeTab === 'fire' ? activeTabStyle : inactiveTabStyle}`}
                  onClick={() => handleTabChange('fire')}
                  role="tab"
                  aria-selected={activeTab === 'fire'}
                >
                  FIRE
                </div>
                <div
                  className={`${tabStyle} ${activeTab === 'compound' ? activeTabStyle : inactiveTabStyle}`}
                  onClick={() => handleTabChange('compound')}
                  role="tab"
                  aria-selected={activeTab === 'compound'}
                >
                  Compound Interest
                </div>
              </div>
              <div>
                {activeTab === 'pipValue' && <PipValueCalculator />}
                {activeTab === 'positionSize' && <PositionSizeCalculator />}
                {activeTab === 'fire' && <FIRECalculator />}
                {activeTab === 'compound' && <CompoundCalculator />}
              </div>
            </div>
          </section>

          {/* Right Sidebar Ad */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <ins className="adsbygoogle"
                   style={{ display: 'block' }}
                   data-ad-client="ca-pub-2497273887935019"
                   data-ad-slot="0987654321"
                   data-ad-format="vertical"
                   data-full-width-responsive="true"></ins>
            </div>
          </aside>
        </div>
      </div>

      {/* Educational Content Section */}
      <section className="max-w-3xl mx-auto space-y-6">
          {(activeTab === 'pipValue' || activeTab === 'positionSize') && (
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
          )}

          {activeTab === 'fire' && (
            <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-green-400">
                 <h2 className="text-2xl font-bold mb-3" style={{ color: '#2F4F4F' }}>What is FIRE?</h2>
                 <p className="text-gray-700 leading-relaxed mb-4">
                     FIRE stands for <strong>Financial Independence, Retire Early</strong>. It's a movement focused on aggressive saving and investing to achieve financial freedom much earlier than traditional retirement age. The core principle is to save and invest a significant portion of your income (typically 50-70%) to build a portfolio that can sustain your lifestyle indefinitely.
                 </p>
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                     <h3 className="font-semibold text-gray-800 mb-2">The 4% Rule</h3>
                     <p className="text-gray-700 leading-relaxed">
                         The FIRE calculator uses the "4% rule," which suggests you can safely withdraw 4% of your portfolio annually without running out of money. To calculate your FIRE number, multiply your annual expenses by 25.<br/><br/>
                         <strong>Example:</strong> If you spend $40,000/year, your FIRE number is $1,000,000.<br/>
                         ($1,000,000 × 4% = $40,000/year)
                     </p>
                 </div>
            </div>
          )}

          {activeTab === 'compound' && (
            <div className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-blue-400">
                 <h2 className="text-2xl font-bold mb-3" style={{ color: '#2F4F4F' }}>Understanding Compound Interest</h2>
                 <p className="text-gray-700 leading-relaxed mb-4">
                     Compound interest is the interest calculated on the initial principal and also on the accumulated interest from previous periods. Often called <strong>"interest on interest,"</strong> it makes your money grow at a faster rate than simple interest, which is calculated only on the principal amount.
                 </p>
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-400">
                     <h3 className="font-semibold text-gray-800 mb-2">The Rule of 72</h3>
                     <p className="text-gray-700 leading-relaxed mb-2">
                         A quick way to estimate how long it takes for your investment to double is the <strong>Rule of 72</strong>. Simply divide 72 by your annual interest rate.
                     </p>
                     <p className="text-gray-700 leading-relaxed">
                         <strong>Example:</strong> At an 8% annual return, your money will double in approximately 9 years (72 ÷ 8 = 9).
                     </p>
                 </div>
                 <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                     <h3 className="font-semibold text-gray-800 mb-2">📈 Key Factors</h3>
                     <ul className="text-gray-700 space-y-1 list-disc list-inside">
                         <li><strong>Time:</strong> The longer your money compounds, the more dramatic the growth</li>
                         <li><strong>Rate:</strong> Higher interest rates accelerate wealth accumulation</li>
                         <li><strong>Frequency:</strong> More frequent compounding (daily vs. annually) increases returns</li>
                         <li><strong>Contributions:</strong> Regular deposits amplify the compounding effect</li>
                     </ul>
                 </div>
            </div>
          )}
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