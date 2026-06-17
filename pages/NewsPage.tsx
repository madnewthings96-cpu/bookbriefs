import React, { useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Clock3,
  Globe2,
  Newspaper,
  TrendingUp,
} from 'lucide-react';

const marketBriefs = [
  {
    title: 'Market impact',
    description: 'High-importance releases can quickly change spreads, volatility, and short-term direction.',
    icon: BarChart3,
    accent: 'bg-blue-50 text-blue-700 shadow-blue-900/5',
  },
  {
    title: 'Plan the session',
    description: 'Check the daily schedule before placing trades, especially near inflation, jobs, and rate data.',
    icon: Clock3,
    accent: 'bg-emerald-50 text-emerald-700 shadow-emerald-900/5',
  },
  {
    title: 'Global pressure',
    description: 'Track data across major economies to understand how currencies, indices, and commodities react.',
    icon: Globe2,
    accent: 'bg-amber-50 text-amber-700 shadow-amber-900/5',
  },
];

const focusItems = [
  'Central bank statements and rate decisions',
  'Inflation, jobs, GDP, and consumer confidence',
  'Unexpected revisions to previous data',
];

const NewsPage: React.FC = () => {
  useSEO({
    title: 'Financial News & Economic Calendar - Real-Time Market Updates | BookBriefs',
    description: 'Stay updated with the latest financial news, economic events, and market analysis. Access real-time economic calendar and top trading stories from global markets.',
    keywords: 'financial news, economic calendar, market news, trading news, forex news, stock market updates, economic events, market analysis',
    type: 'website',
  });

  useEffect(() => {
    const container = document.getElementById('economicCalendarWidget');
    if (!container) return;

    container.innerHTML = '';

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

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="bg-[#f7f4ec]">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-14 lg:pt-10">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#9f4626] shadow-[0_10px_30px_rgba(17,24,39,0.08)]">
            <Newspaper className="h-4 w-4" aria-hidden="true" />
            Live market briefing
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-[#243f3d] sm:text-5xl lg:text-6xl">
            Economic Calendar & Market News
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
            الحصول على معلومات حول الأحداث الاقتصادية الهامة واتجاهات السوق التي تؤثر على الأسواق المالية.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#calendar"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f4f4f] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(47,79,79,0.28)] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.96]"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              View calendar
            </a>
            <a
              href="#briefing"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#2f4f4f] shadow-[0_12px_26px_rgba(17,24,39,0.08)] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.96]"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              Read briefing notes
            </a>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#2f4f4f] shadow-[0_28px_70px_rgba(47,79,79,0.24)] sm:min-h-[320px]">
          <img
            src="/images/news c.jpg"
            alt="Financial market news illustration with economic institutions and price charts"
            className="h-full min-h-[260px] w-full object-cover outline outline-1 outline-black/10 sm:min-h-[320px]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pb-5 pt-16 text-white sm:px-7 sm:pb-7">
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.08em] text-white/80">
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Rates</span>
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Inflation</span>
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Currencies</span>
            </div>
            <p className="mt-3 max-w-xl text-xl font-bold leading-7 sm:text-2xl">
              Follow the events that move prices before the session starts.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
        <section id="briefing" className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
            <img
              src="/images/news -.png"
              alt="Trader climbing a steep market mountain"
              className="aspect-[16/11] w-full object-cover outline outline-1 outline-black/10"
            />
            <div className="p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#9f4626]">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                Before you trade
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Mark the day’s biggest data releases, then decide where you should reduce size, wait for volatility, or avoid trading entirely.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {marketBriefs.map(({ title, description, icon: Icon, accent }) => (
              <article
                key={title}
                className={`${accent} rounded-2xl p-5 shadow-[0_14px_36px_rgba(17,24,39,0.08)]`}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-[0_8px_18px_rgba(17,24,39,0.07)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-black text-gray-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="calendar" className="overflow-hidden rounded-2xl bg-white shadow-[0_22px_60px_rgba(17,24,39,0.1)]">
          <div className="grid gap-5 border-b border-gray-100 p-5 sm:p-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f7f4ec] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#9f4626]">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Real-time calendar
              </div>
              <h2 className="text-2xl font-black text-[#243f3d] sm:text-3xl">
                Key economic events, updated live
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                تتبع الأحداث الاقتصادية الرئيسية والإعلانات وإصدارات البيانات من الأسواق العالمية، قم بتغيير منطقتك الزمنية تحت.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-amber-900 shadow-[0_12px_26px_rgba(146,64,14,0.08)]">
              <div className="flex items-center gap-2 text-sm font-black">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Watch list
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-5">
                {focusItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative w-full overflow-hidden bg-white">
            <div id="economicCalendarWidget" className="h-[620px] w-full"></div>
            <div className="ecw-copyright border-t border-gray-100 p-3 text-center text-xs text-gray-500">
              <a
                href="https://www.mql5.com/?utm_source=calendar.widget&utm_medium=link&utm_term=economic.calendar&utm_content=visit.mql5.calendar&utm_campaign=202.calendar.widget"
                rel="noopener nofollow"
                target="_blank"
                className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline"
              >
                MQL5 Algo Trading Community
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewsPage;
