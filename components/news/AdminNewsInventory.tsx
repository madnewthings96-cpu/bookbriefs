import React from 'react';
import { Link } from 'react-router-dom';
import { categoryLabels } from './NewsEditorialStream';
import { formatNewsDate, type NewsArticleDraft, type NewsStatus } from './newsModel';

export type AdminNewsFilter = 'all' | NewsStatus;

type AdminNewsInventoryProps = {
  articles: NewsArticleDraft[];
  filter: AdminNewsFilter;
  featuredArticleId: string | null;
  busyArticleId?: string | null;
  onFilterChange: (filter: AdminNewsFilter) => void;
  onPublish: (article: NewsArticleDraft) => void | Promise<void>;
  onUnpublish: (article: NewsArticleDraft) => void | Promise<void>;
  onDelete: (article: NewsArticleDraft) => void | Promise<void>;
  onSetFeatured: (articleId: string | null) => void | Promise<void>;
};

const FILTER_LABELS: Record<AdminNewsFilter, string> = {
  all: 'All',
  draft: 'Draft',
  published: 'Published',
};

function UpdatedTime({ value }: { value: Date | null }) {
  if (!value) return <span>Not saved yet</span>;
  return <time dateTime={value.toISOString()}>{formatNewsDate(value)}</time>;
}

export function getFeaturedChangeConfirmation(
  article: Pick<NewsArticleDraft, 'id' | 'title'>,
  featuredArticleId: string | null,
): string | null {
  if (article.id === featuredArticleId) {
    return `Remove “${article.title || 'this article'}” from the featured position?`;
  }
  if (featuredArticleId) {
    return `Replace the current featured story with “${article.title || 'this article'}”?`;
  }
  return null;
}

export function AdminNewsInventory({
  articles,
  filter,
  featuredArticleId,
  busyArticleId = null,
  onFilterChange,
  onPublish,
  onUnpublish,
  onDelete,
  onSetFeatured,
}: AdminNewsInventoryProps) {
  return (
    <div className="admin-news-inventory">
      <nav className="admin-news-filters" aria-label="Article status filters">
        {(Object.keys(FILTER_LABELS) as AdminNewsFilter[]).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={filter === item}
            onClick={() => onFilterChange(item)}
          >
            {FILTER_LABELS[item]}
          </button>
        ))}
      </nav>

      {articles.length === 0 ? (
        <div className="admin-news-empty" role="status">
          <h2>No {filter === 'all' ? '' : `${FILTER_LABELS[filter].toLowerCase()} `}articles yet</h2>
          <p>Create a briefing, or choose another status filter.</p>
        </div>
      ) : (
        <ul className="admin-news-list">
          {articles.map((article) => {
            const isFeatured = article.id === featuredArticleId;
            const busy = busyArticleId === article.id;
            return (
              <li className="admin-news-row" key={article.id}>
                <div className="admin-news-row__identity">
                  <div className="admin-news-row__labels">
                    <span className={`admin-news-status admin-news-status--${article.status}`}>
                      {FILTER_LABELS[article.status]}
                    </span>
                    <span>{categoryLabels[article.category]}</span>
                    {isFeatured && <span className="admin-news-featured">Featured</span>}
                  </div>
                  <h2>{article.title || 'Untitled article'}</h2>
                  <p>Updated <UpdatedTime value={article.updatedAt} /></p>
                </div>

                <div className="admin-news-row__actions" aria-label={`Actions for ${article.title || 'untitled article'}`}>
                  <Link to={`/admin/news/${article.id}`}>Edit</Link>
                  <Link to={`/admin/news/${article.id}?preview=1`}>Preview</Link>
                  {article.status === 'published' ? (
                    <button type="button" disabled={busy} onClick={() => onUnpublish(article)}>Unpublish</button>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => onPublish(article)}>Publish</button>
                  )}
                  {article.status === 'published' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const confirmation = getFeaturedChangeConfirmation(article, featuredArticleId);
                        if (confirmation && !window.confirm(confirmation)) return;
                        void onSetFeatured(isFeatured ? null : article.id);
                      }}
                    >
                      {isFeatured ? 'Remove feature' : 'Make featured'}
                    </button>
                  )}
                  <button className="admin-news-danger" type="button" disabled={busy} onClick={() => onDelete(article)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AdminNewsInventory;
