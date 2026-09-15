import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsEditorialStream, type NewsCategoryFilter } from '../components/news/NewsEditorialStream';
import { useNewsIndex } from '../components/news/useNewsIndex';
import useSEO from '../hooks/useSEO';
import { DEFAULT_OG_IMAGE, SITE_URL } from '../utils/seoConfig';

const EMPTY_NEWS_MESSAGE = 'The next weekly briefing is being prepared.';

const NewsMasthead = () => (
  <header className="news-masthead">
    <div>
      <span className="news-masthead__eyebrow">Ta7leel editorial</span>
      <h1 id="news-page-title">Market News</h1>
    </div>
    <p className="news-masthead__note">
      Independent weekly context for clearer market decisions.
    </p>
  </header>
);

const NewsLoadingState = () => (
  <section className="news-editorial" aria-labelledby="news-page-title" aria-busy="true">
    <NewsMasthead />
    <div className="news-categories" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span className="news-skeleton" key={index} style={{ height: '2.35rem', width: '5.5rem' }} />
      ))}
    </div>
    <div className="news-editorial__stream" aria-label="Loading market news">
      <div className="news-lead news-skeleton" aria-hidden="true" />
      <div className="news-ad" aria-hidden="true">
        <div className="news-ad__sticky news-skeleton" />
      </div>
    </div>
  </section>
);

const NewsErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <section className="news-editorial" aria-labelledby="news-page-title">
    <NewsMasthead />
    <div className="news-editorial__stream">
      <div className="news-empty" role="alert">
        <span>Brief interruption</span>
        <h2>We could not load the latest market news.</h2>
        <p>Please try again in a moment, or continue exploring Ta7leel.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="news-load-more" type="button" onClick={onRetry}>Retry</button>
          <Link className="news-story-link" to="/">Back to Ta7leel</Link>
        </div>
      </div>
    </div>
  </section>
);

const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<NewsCategoryFilter>('all');
  const news = useNewsIndex(activeCategory);

  useSEO({
    title: 'Market News & Weekly Financial Analysis | Ta7leel',
    description:
      'Read Ta7leel weekly market news and financial analysis covering global markets, forex, the economy, and crypto.',
    keywords: 'market news, weekly financial analysis, forex news, economy news, crypto news',
    image: DEFAULT_OG_IMAGE,
    canonical: `${SITE_URL}/news/`,
    type: 'website',
    language: 'en',
  });

  if (news.loading) return <NewsLoadingState />;
  if (news.error && news.articles.length === 0) return <NewsErrorState onRetry={news.retry} />;

  return (
    <div
      className="news-page"
      aria-label={news.articles.length === 0 ? EMPTY_NEWS_MESSAGE : undefined}
    >
      {news.error && (
        <div
          className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 border border-[#c89a49] bg-[#fffdf7] px-4 py-3 text-sm text-[#071d17]"
          role="status"
        >
          <span>{news.error}</span>
          <button className="font-extrabold underline underline-offset-4" type="button" onClick={news.retry}>
            Retry
          </button>
        </div>
      )}
      <NewsEditorialStream
        articles={news.articles}
        featuredArticleId={news.featuredArticleId}
        activeCategory={activeCategory}
        hasMore={news.hasMore}
        loadingMore={news.loadingMore}
        onCategoryChange={setActiveCategory}
        onLoadMore={news.loadMore}
      />
    </div>
  );
};

export default NewsPage;
