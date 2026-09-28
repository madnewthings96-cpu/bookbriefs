import React from 'react';
import { Link, useParams } from 'react-router-dom';
import StructuredData from '../components/StructuredData';
import { NewsArticleReader } from '../components/news/NewsArticleReader';
import { useNewsArticle } from '../components/news/useNewsArticle';
import type { NewsArticle } from '../components/news/newsModel';
import useSEO from '../hooks/useSEO';
import { SITE_URL } from '../utils/seoConfig';
import NotFoundPage from './NotFoundPage';

const NewsArticleLoading = () => (
  <section className="news-editorial news-article-state" aria-busy="true" aria-labelledby="news-article-loading-title">
    <span className="news-article__category">Ta7leel editorial</span>
    <h1 id="news-article-loading-title">Loading market briefing</h1>
    <div className="news-skeleton news-article-state__line" aria-hidden="true" />
    <div className="news-skeleton news-article-state__image" aria-hidden="true" />
  </section>
);

const NewsArticleError = ({ onRetry }: { onRetry: () => void }) => (
  <section className="news-editorial news-article-state" aria-labelledby="news-article-error-title">
    <span className="news-article__category">Brief interruption</span>
    <h1 id="news-article-error-title">This article could not be loaded.</h1>
    <p>Try again in a moment, or return to the latest market news.</p>
    <div className="news-article-state__actions">
      <button className="news-load-more" type="button" onClick={onRetry}>Retry</button>
      <Link to="/news">Back to Market News</Link>
    </div>
  </section>
);

const PublishedNewsArticle = ({ article, relatedArticles }: {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
}) => {
  const canonical = `${SITE_URL}/news/${article.slug}/`;
  const datePublished = article.publishedAt.toISOString();
  const dateModified = article.updatedAt.toISOString();

  useSEO({
    title: `${article.title} | Ta7leel Market News`,
    description: article.excerpt,
    keywords: `${article.category} news, market analysis, weekly market news`,
    image: article.imageUrl,
    canonical,
    type: 'article',
    author: article.authorName,
    publishedTime: datePublished,
    modifiedTime: dateModified,
    language: 'en',
  });

  return (
    <>
      <StructuredData
        type="newsArticle"
        headline={article.title}
        description={article.excerpt}
        image={article.imageUrl}
        authorName={article.authorName}
        datePublished={datePublished}
        dateModified={dateModified}
        mainEntityOfPage={canonical}
      />
      <NewsArticleReader article={article} relatedArticles={relatedArticles} />
    </>
  );
};

const NewsArticlePage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const state = useNewsArticle(slug);

  if (state.loading) return <NewsArticleLoading />;
  if (state.notFound) return <NotFoundPage />;
  if (state.error || !state.article) return <NewsArticleError onRetry={state.retry} />;

  return <PublishedNewsArticle article={state.article} relatedArticles={state.relatedArticles} />;
};

export default NewsArticlePage;
