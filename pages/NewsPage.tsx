import React from 'react';
import useSEO from '../hooks/useSEO';

const NewsPage: React.FC = () => {
  useSEO({
    title: 'Financial News & Economic Calendar - Real-Time Market Updates | BookBriefs',
    description: 'Stay updated with the latest financial news, economic events, and market analysis. Access real-time economic calendar and top trading stories from global markets.',
    keywords: 'financial news, economic calendar, market news, trading news, forex news, stock market updates, economic events, market analysis',
    type: 'website',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Financial News & Market Analysis
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed about important economic events and market trends that impact financial markets. 
          Learn about key announcements, reports, and data releases from major economies around the world.
        </p>
      </div>

      {/* Information Section */}
      <section className="bg-white p-6 rounded-lg shadow-xl border-l-4 border-orange-400">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Understanding Economic News & Market Analysis
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Economic news and events can significantly impact financial markets, including forex, stocks, 
            commodities, and cryptocurrencies. Understanding when major announcements occur and staying informed with 
            the latest market analysis helps traders and investors make informed decisions.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold mb-2 text-lg">📊 Market Impact</h3>
              <p className="text-sm">
                Major economic events and breaking news can cause significant price movements and volatility in various markets.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-400">
              <h3 className="font-semibold mb-2 text-lg">⏰ Stay Informed</h3>
              <p className="text-sm">
                Keep track of important data releases and market analysis to prepare your investment strategy.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
              <h3 className="font-semibold mb-2 text-lg">🌍 Global Coverage</h3>
              <p className="text-sm">
                Monitor events from multiple countries to understand global economic trends and opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
