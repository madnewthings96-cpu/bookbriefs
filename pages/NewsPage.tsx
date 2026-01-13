import React, { useEffect } from 'react';
import useSEO from '../hooks/useSEO';

const NewsPage: React.FC = () => {
  useSEO({
    title: 'Financial News & Economic Calendar - Real-Time Market Updates | BookBriefs',
    description: 'Stay updated with the latest financial news, economic events, and market analysis. Access real-time economic calendar and top trading stories from global markets.',
    keywords: 'financial news, economic calendar, market news, trading news, forex news, stock market updates, economic events, market analysis',
    type: 'website',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-type', 'calendar-widget');
    script.src = 'https://www.tradays.com/c/js/widgets/calendar/widget.js?v=15';
    script.innerHTML = JSON.stringify({
      "width": 800,
      "height": 600,
      "mode": "2",
      "fw": "html",
      "lang": "ar"
    });

    const container = document.getElementById('economicCalendarWidget');
    if (container) {
      container.appendChild(script);
    }
  }, []);

  const brokers = [
    {
      name: 'OctaFX',
      logo: '/images/octa 50.png',
      url: 'https://octa.click/bzsDkbL9lRw?ib=29552482',
      description: 'ECN Forex Broker',
      isImage: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
          Economic Calendar
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          الحصول على معلومات حول الأحداث الاقتصادية الهامة واتجاهات السوق التي تؤثر على الأسواق المالية.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar and Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Economic Calendar Widget */}
          <section id="calendar" className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#2F4F4F' }}>
                Real-Time Economic Calendar
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                تتبع الأحداث الاقتصادية الرئيسية والإعلانات وإصدارات البيانات من الأسواق العالمية، قم بتغيير منطقتك الزمنية تحت.
              </p>
            </div>

            {/* Widget Container */}
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 bg-white">
              <div id="economicCalendarWidget" className="w-full h-[600px]"></div>
              <div className="ecw-copyright text-center p-2 text-xs text-gray-500">
                <a href="https://www.mql5.com/?utm_source=calendar.widget&utm_medium=link&utm_term=economic.calendar&utm_content=visit.mql5.calendar&utm_campaign=202.calendar.widget" rel="noopener nofollow" target="_blank" className="hover:underline text-blue-600">
                  MQL5 Algo Trading Community
                </a>
              </div>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
              Understanding the Economic Calendar
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold mb-2">Market Impact</h4>
                <p className="text-sm text-gray-700">
                  Events marked with high importance can cause significant price movements
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-semibold mb-2">Stay Prepared</h4>
                <p className="text-sm text-gray-700">
                  Check the calendar daily to prepare your trading strategy ahead of time
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="text-2xl mb-2">🌍</div>
                <h4 className="font-semibold mb-2">Global Events</h4>
                <p className="text-sm text-gray-700">
                  Monitor events from multiple countries affecting global markets
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Brokers */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-4">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#2F4F4F' }}>
              Best brokers in your location
            </h3>
            <div className="space-y-4">
              {brokers.map((broker, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {broker.isImage ? (
                      <img
                        src={broker.logo}
                        alt={broker.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className="text-3xl">{broker.logo}</div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{broker.name}</h4>
                      <p className="text-xs text-gray-600">{broker.description}</p>
                    </div>
                  </div>
                  <a
                    href={broker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    Open Account
                  </a>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                ← Previous
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
