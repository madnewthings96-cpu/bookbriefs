import React, { useEffect, useRef } from 'react';

const NewsPage: React.FC = () => {
  const economicNewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView Economic Calendar widget
    if (economicNewsRef.current && !economicNewsRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        colorTheme: "light",
        isTransparent: false,
        locale: "ar_AE",
        countryFilter: "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
        importanceFilter: "-1,0,1",
        width: "100%",
        height: 550
      });
      economicNewsRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Economic News Calendar
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay updated with important economic events that impact the markets. Track key announcements, 
          reports, and data releases from major economies around the world.
        </p>
      </div>

      {/* Economic Calendar Widget */}
      <section className="mb-12">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="tradingview-widget-container" ref={economicNewsRef}>
            <div className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright">
              <a href="https://ar.tradingview.com/economic-calendar/" rel="noopener nofollow" target="_blank">
                <span className="blue-text">Track all markets on TradingView</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-orange-400">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Why Track Economic News?
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Economic news and events can significantly impact financial markets, including forex, stocks, 
            commodities, and cryptocurrencies. Understanding when major announcements occur helps traders 
            and investors make informed decisions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2 text-lg">📊 Market Impact</h3>
              <p className="text-sm">
                Major economic events can cause significant price movements and volatility in various markets.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-400">
              <h3 className="font-semibold mb-2 text-lg">⏰ Timing Matters</h3>
              <p className="text-sm">
                Knowing when important data is released helps you prepare your trading strategy in advance.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
              <h3 className="font-semibold mb-2 text-lg">🌍 Global Coverage</h3>
              <p className="text-sm">
                Track events from multiple countries to understand global economic trends and opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
