import React, { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Globe2,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { mountEconomicCalendarWidget } from './newsCalendarWidget';

const marketBriefs = [
  {
    eyebrow: '01 / Interpret',
    title: 'Read the release, not the headline',
    description:
      'Compare the actual number with forecast and prior data. The surprise—not the label—usually drives the first move.',
    icon: Newspaper,
  },
  {
    eyebrow: '02 / Prepare',
    title: 'Map the session before entry',
    description:
      'Mark high-impact windows, reduce exposure around uncertainty, and decide what would invalidate your idea.',
    icon: Target,
  },
  {
    eyebrow: '03 / Connect',
    title: 'Follow pressure across markets',
    description:
      'Rates, currencies, indices, and commodities tell one connected story. Watch confirmation before committing.',
    icon: TrendingUp,
  },
];

const signalItems = [
  { label: 'Rates', detail: 'Central-bank direction', icon: BarChart3 },
  { label: 'Growth', detail: 'Jobs, GDP and demand', icon: Globe2 },
  { label: 'Inflation', detail: 'Prices and policy pressure', icon: AlertTriangle },
];

const focusItems = [
  'Central-bank statements and rate decisions',
  'Inflation, jobs, GDP, and consumer confidence',
  'Unexpected revisions to previous data',
];

const impactLevels = [
  { label: 'High impact', className: 'market-impact market-impact--high' },
  { label: 'Medium', className: 'market-impact market-impact--medium' },
  { label: 'Low', className: 'market-impact market-impact--low' },
];

const NewsPage: React.FC = () => {
  useSEO({
    title: 'Financial News & Economic Calendar - Real-Time Market Updates | BookBriefs',
    description:
      'Stay updated with the latest financial news, economic events, and market analysis. Access real-time economic calendar and top trading stories from global markets.',
    keywords:
      'financial news, economic calendar, market news, trading news, forex news, stock market updates, economic events, market analysis',
    type: 'website',
  });

  useEffect(() => {
    const container = document.getElementById('economicCalendarWidget');
    if (!container) return;
    return mountEconomicCalendarWidget(container);
  }, []);

  return (
    <div className="market-desk">
      <section className="market-hero" aria-labelledby="market-desk-title">
        <div className="market-hero__copy">
          <div className="market-kicker">
            <span className="market-kicker__pulse" aria-hidden="true" />
            Ta7leel Market Desk
          </div>

          <h1 id="market-desk-title">Know what can move the market—before it moves you.</h1>

          <p className="market-hero__lead">
            A calmer way to scan macro risk, prepare your session, and act with a plan when the market gets loud.
          </p>

          <p className="market-hero__arabic" lang="ar" dir="rtl">
            راقب الأحداث الاقتصادية المؤثرة، افهم سياقها، وادخل جلستك بخطة واضحة قبل تحرك الأسعار.
          </p>

          <div className="market-hero__actions">
            <a className="market-action market-action--primary" href="#calendar">
              Open event radar
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="market-action market-action--secondary" href="#briefing">
              <Bell aria-hidden="true" />
              Build my briefing
            </a>
          </div>

          <div className="market-hero__trust">
            <ShieldCheck aria-hidden="true" />
            <span>Context first. Headlines second.</span>
          </div>
        </div>

        <figure className="market-hero__visual">
          <img
            src="/images/news c.jpg"
            alt="Financial market collage with institutions, scales, and price charts"
          />
          <figcaption>
            <span>Desk principle</span>
            The market can be loud. Your process should not be.
          </figcaption>
        </figure>
      </section>

      <section className="market-signals">
        <div className="market-signals__intro">
          <Sparkles aria-hidden="true" />
          <span>Scan the pressure points</span>
        </div>
        <div
          className="market-signals__rail"
          role="region"
          aria-label="Market preparation signals"
          tabIndex={0}
        >
          {signalItems.map(({ label, detail, icon: Icon }) => (
            <article className="market-signal" key={label}>
              <Icon aria-hidden="true" />
              <div>
                <strong>{label}</strong>
                <span>{detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="briefing" className="market-briefing" aria-labelledby="briefing-title">
        <header className="market-section-heading">
          <span>Before the bell / 03 moves</span>
          <h2 id="briefing-title">Trading day brief</h2>
          <p>Turn the calendar into a decision process—not another stream of noise.</p>
        </header>

        <div className="market-briefing__layout">
          <aside className="market-briefing__note">
            <img
              src="/images/news -.png"
              alt="Trader climbing a steep market mountain before the session"
            />
            <div>
              <span className="market-briefing__tag">Operating rule</span>
              <p>Know when to trade, when to size down, and when the best trade is no trade.</p>
            </div>
          </aside>

          <div
            className="market-briefing__cards"
            role="region"
            aria-label="Trading-day preparation cards"
            tabIndex={0}
          >
            {marketBriefs.map(({ eyebrow, title, description, icon: Icon }) => (
              <article className="market-brief" key={title}>
                <div className="market-brief__topline">
                  <span>{eyebrow}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calendar" className="market-calendar" aria-labelledby="calendar-title">
        <header className="market-calendar__header">
          <div className="market-calendar__title">
            <span className="market-calendar__eyebrow">
              <CalendarDays aria-hidden="true" />
              Live macro calendar
            </span>
            <h2 id="calendar-title">Event radar</h2>
            <p>
              Track the releases most likely to reshape volatility, sentiment, and short-term price direction.
            </p>
            <p className="market-calendar__arabic" lang="ar" dir="rtl">
              تابع البيانات الاقتصادية حسب التوقيت والأهمية، وركّز على المفاجأة مقارنة بالتوقعات.
            </p>
          </div>

          <aside className="market-watchlist" aria-label="Calendar watch list">
            <div className="market-watchlist__title">
              <AlertTriangle aria-hidden="true" />
              <span>Watch before entry</span>
            </div>
            <ul>
              {focusItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="market-impact-legend" aria-label="Event impact key">
              {impactLevels.map(({ label, className }) => (
                <span key={label}>
                  <i className={className} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </aside>
        </header>

        <div
          className="market-calendar__feed"
          role="region"
          aria-label="Economic calendar"
          tabIndex={0}
        >
          <div id="economicCalendarWidget" />
          <div className="ecw-copyright">
            Calendar data provided by{' '}
            <a
              href="https://www.mql5.com/?utm_source=calendar.widget&utm_medium=link&utm_term=economic.calendar&utm_content=visit.mql5.calendar&utm_campaign=202.calendar.widget"
              rel="noopener nofollow"
              target="_blank"
            >
              MQL5 Algo Trading Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
