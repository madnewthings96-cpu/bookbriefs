import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  NEWS_CATEGORIES,
  formatNewsDate,
  selectFeaturedArticle,
  type NewsArticle,
  type NewsCategory,
} from './newsModel';
import { AdSlot } from './AdSlot';

export const categoryLabels = {
  all: 'All',
  markets: 'Markets',
  forex: 'Forex',
  economy: 'Economy',
  crypto: 'Crypto',
} as const;

export type NewsCategoryFilter = NewsCategory | 'all';

type NewsEditorialStreamProps = {
  articles: NewsArticle[];
  featuredArticleId?: string | null;
  activeCategory: NewsCategoryFilter;
  hasMore: boolean;
  loadingMore?: boolean;
  onCategoryChange: (category: NewsCategoryFilter) => void;
  onLoadMore: () => void;
};

const byNewestPublication = (left: NewsArticle, right: NewsArticle): number => (
  right.publishedAt.getTime() - left.publishedAt.getTime()
);

const categoryFilters: NewsCategoryFilter[] = ['all', ...NEWS_CATEGORIES];

const StoryMeta = ({ article }: { article: NewsArticle }) => (
  <div className="news-story-meta">
    <span className="news-story-meta__category">{categoryLabels[article.category]}</span>
    <span aria-hidden="true">/</span>
    <span>{article.authorName}</span>
    <span aria-hidden="true">/</span>
    <time dateTime={article.publishedAt.toISOString()}>{formatNewsDate(article.publishedAt)}</time>
  </div>
);

const LeadStory = ({ article }: { article: NewsArticle }) => (
  <article className="news-lead">
    <Link className="news-lead__image-link" to={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
      <img
        className="news-lead__image"
        src={article.imageUrl}
        alt={article.imageAlt}
        width="1200"
        height="720"
        loading="eager"
        decoding="async"
      />
    </Link>
    <div className="news-lead__copy">
      <span className="news-lead__register">Weekly market register</span>
      <StoryMeta article={article} />
      <h2>
        <Link to={`/news/${article.slug}`}>{article.title}</Link>
      </h2>
      <p>{article.excerpt}</p>
      <Link className="news-story-link" to={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
        Read the briefing <span aria-hidden="true">↗</span>
      </Link>
    </div>
  </article>
);

const StoryCard = ({ article }: { article: NewsArticle }) => (
  <article className="news-card">
    <div className="news-card__copy">
      <StoryMeta article={article} />
      <h2>
        <Link to={`/news/${article.slug}`}>{article.title}</Link>
      </h2>
      <p>{article.excerpt}</p>
    </div>
    <Link className="news-card__image-link" to={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
      <img
        className="news-card__image"
        src={article.imageUrl}
        alt={article.imageAlt}
        width="480"
        height="320"
        loading="lazy"
        decoding="async"
      />
    </Link>
  </article>
);

export function NewsEditorialStream({
  articles,
  featuredArticleId,
  activeCategory,
  hasMore,
  loadingMore = false,
  onCategoryChange,
  onLoadMore,
}: NewsEditorialStreamProps) {
  const featuredArticle = selectFeaturedArticle(articles, featuredArticleId);
  const streamArticles = articles
    .filter((article) => article.id !== featuredArticle?.id)
    .sort(byNewestPublication);
  const latestPublication = [...articles].sort(byNewestPublication)[0]?.publishedAt;
  const adAfterThirdStory = streamArticles.length >= 3;

  return (
    <section className="news-editorial" aria-labelledby="news-editorial-title">
      <header className="news-masthead">
        <div>
          <span className="news-masthead__eyebrow">Ta7leel editorial</span>
          <h1 id="news-editorial-title">Market News</h1>
        </div>
        <p className="news-masthead__note">
          Independent weekly context for clearer market decisions.
          {latestPublication && (
            <time dateTime={latestPublication.toISOString()}>
              Latest: {formatNewsDate(latestPublication)}
            </time>
          )}
        </p>
      </header>

      <nav className="news-categories" aria-label="News categories">
        {categoryFilters.map((category) => (
          <button
            type="button"
            key={category}
            aria-pressed={activeCategory === category}
            onClick={() => onCategoryChange(category)}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </nav>

      <div className="news-editorial__stream">
        {featuredArticle ? (
          <LeadStory article={featuredArticle} />
        ) : (
          <div className="news-empty" role="status">
            <span>Next edition</span>
            <h2>The next weekly briefing is being prepared.</h2>
            <p>Return soon for a focused read on the forces shaping markets.</p>
          </div>
        )}

        {streamArticles.map((article, index) => (
          <Fragment key={article.id}>
            <StoryCard article={article} />
            {index === 2 && <AdSlot placement="news-index" />}
          </Fragment>
        ))}

        {!adAfterThirdStory && <AdSlot placement="news-index" />}

        {hasMore && (
          <div className="news-load-more-row">
            <button
              type="button"
              className="news-load-more"
              disabled={loadingMore}
              onClick={onLoadMore}
            >
              {loadingMore ? 'Loading more…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default NewsEditorialStream;
