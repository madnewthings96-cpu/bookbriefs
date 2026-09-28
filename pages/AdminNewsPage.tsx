import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminNewsInventory, type AdminNewsFilter } from '../components/news/AdminNewsInventory';
import type { NewsArticleDraft } from '../components/news/newsModel';
import {
  getFeaturedNewsArticleId,
  listAdminNews,
  publishNewsArticle,
  setFeaturedNewsArticle,
  unpublishNewsArticle,
} from '../components/news/newsRepository';
import { deleteNewsArticleSafely } from './AdminNewsEditorPage';

const messageForError = (error: unknown) => (
  error instanceof Error && error.message
    ? error.message
    : 'The publishing workspace could not complete that action.'
);

const AdminNewsPage: React.FC = () => {
  const location = useLocation();
  const [filter, setFilter] = useState<AdminNewsFilter>('all');
  const [articles, setArticles] = useState<NewsArticleDraft[]>([]);
  const [featuredArticleId, setFeaturedArticleIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(() => {
    const routeState = location.state as { notice?: unknown } | null;
    return typeof routeState?.notice === 'string' ? routeState.notice : '';
  });
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextArticles, featuredId] = await Promise.all([
        listAdminNews(filter === 'all' ? undefined : filter),
        getFeaturedNewsArticleId(),
      ]);
      setArticles(nextArticles);
      setFeaturedArticleIdState(featuredId);
    } catch (loadError) {
      setError(messageForError(loadError));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void loadInventory(); }, [loadInventory]);

  const runRowAction = async (articleId: string, action: () => Promise<string | void>, success: string) => {
    if (busyArticleId) return;
    setBusyArticleId(articleId);
    setError('');
    setNotice('');
    try {
      const actionNotice = await action();
      setNotice(actionNotice || success);
      await loadInventory();
    } catch (actionError) {
      setError(messageForError(actionError));
    } finally {
      setBusyArticleId(null);
    }
  };

  const removeArticle = async (article: NewsArticleDraft) => {
    if (!window.confirm(`Delete “${article.title || 'this article'}”? This cannot be undone.`)) return;
    await runRowAction(article.id, async () => {
      const result = await deleteNewsArticleSafely(article);
      return result.cleanupWarning || undefined;
    }, 'Article deleted.');
  };

  return (
    <section className="admin-news-page" aria-labelledby="admin-news-page-title">
      <header className="admin-news-page__masthead">
        <div>
          <span className="admin-news-kicker">Ta7leel newsroom</span>
          <h1 id="admin-news-page-title">News publishing</h1>
          <p>Draft, review, and publish the weekly market briefing.</p>
        </div>
        <Link className="admin-news-primary admin-news-new" to="/admin/news/new">New article</Link>
      </header>

      {notice && <div className="admin-news-message" role="status">{notice}</div>}
      {error && (
        <div className="admin-news-message admin-news-message--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void loadInventory()}>Retry</button>
        </div>
      )}

      {loading && articles.length === 0 ? (
        <div className="admin-news-state" role="status">
          <h2>Loading the editorial queue</h2>
          <p>Fetching the newest saved articles…</p>
        </div>
      ) : (
        <AdminNewsInventory
          articles={articles}
          filter={filter}
          featuredArticleId={featuredArticleId}
          busyArticleId={busyArticleId}
          onFilterChange={setFilter}
          onPublish={(article) => runRowAction(
            article.id,
            async () => { await publishNewsArticle(article, false); },
            'Article published.',
          )}
          onUnpublish={(article) => {
            if (!window.confirm(`Unpublish “${article.title}”?`)) return;
            return runRowAction(
              article.id,
              () => unpublishNewsArticle(article.id),
              'Article moved back to drafts.',
            );
          }}
          onDelete={removeArticle}
          onSetFeatured={(articleId) => runRowAction(
            articleId || featuredArticleId || 'featured',
            async () => {
              await setFeaturedNewsArticle(articleId);
              setFeaturedArticleIdState(articleId);
            },
            articleId ? 'Featured article updated.' : 'Featured article cleared.',
          )}
        />
      )}
    </section>
  );
};

export default AdminNewsPage;
