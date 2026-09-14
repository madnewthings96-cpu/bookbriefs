import React from 'react';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '../MarkdownRenderer';
import { AdSlot } from './AdSlot';
import { categoryLabels } from './NewsEditorialStream';
import { formatNewsDate, type NewsArticle } from './newsModel';

type NewsArticleReaderProps = {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
};

const hasMaterialUpdate = (article: NewsArticle): boolean => (
  article.updatedAt.getTime() !== article.publishedAt.getTime()
);

export function NewsArticleReader({ article, relatedArticles }: NewsArticleReaderProps) {
  return (
    <section className="news-editorial news-article-page" aria-labelledby="news-article-title">
      <nav className="news-article-breadcrumb" aria-label="Breadcrumb">
        <Link to="/news">Market News</Link>
        <span aria-hidden="true">/</span>
        <span>{categoryLabels[article.category]}</span>
      </nav>

      <article className="news-article">
        <header className="news-article__header">
          <span className="news-article__category">{categoryLabels[article.category]}</span>
          <h1 id="news-article-title">{article.title}</h1>
          <p className="news-article__excerpt">{article.excerpt}</p>
          <div className="news-article__byline">
            <span>By {article.authorName}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={article.publishedAt.toISOString()}>
              Published {formatNewsDate(article.publishedAt)}
            </time>
            {hasMaterialUpdate(article) && (
              <>
                <span aria-hidden="true">/</span>
                <time dateTime={article.updatedAt.toISOString()}>
                  Updated {formatNewsDate(article.updatedAt)}
                </time>
              </>
            )}
          </div>
        </header>

        <figure className="news-article__figure">
          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            width="1200"
            height="720"
            loading="eager"
            decoding="async"
          />
        </figure>

        <div className="news-article__layout">
          <div className="news-article__main">
            <div className="news-article__body">
              <MarkdownRenderer content={article.body} />
            </div>

            {article.sources.length > 0 && (
              <section className="news-article__sources" aria-labelledby="news-sources-title">
                <h2 id="news-sources-title">Sources</h2>
                <ul>
                  {article.sources.map((source) => (
                    <li key={`${source.label}-${source.url}`}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.label}<span aria-hidden="true"> ↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="news-article__disclaimer">
              This article is for general information only and is not investment advice.
            </p>

            {relatedArticles.length > 0 && (
              <section className="news-related" aria-labelledby="news-related-title">
                <div className="news-related__heading">
                  <span>Continue reading</span>
                  <h2 id="news-related-title">Related stories</h2>
                </div>
                <ul>
                  {relatedArticles.map((related) => (
                    <li key={related.id}>
                      <Link to={`/news/${related.slug}`}>
                        <span>{categoryLabels[related.category]}</span>
                        <strong>{related.title}</strong>
                        <time dateTime={related.publishedAt.toISOString()}>
                          {formatNewsDate(related.publishedAt)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <AdSlot placement="news-article" />
        </div>
      </article>
    </section>
  );
}

export default NewsArticleReader;
