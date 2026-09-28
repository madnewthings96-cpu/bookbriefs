import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NewsArticleEditor } from '../components/news/NewsArticleEditor';
import { createEmptyNewsDraft, type NewsArticleDraft } from '../components/news/newsModel';
import { getSampleNewsDraft } from '../components/news/newsFixtures';
import {
  getAdminNewsArticle,
  getFeaturedNewsArticleId,
  publishNewsArticle,
  saveNewsDraft,
  setFeaturedNewsArticle,
  unpublishNewsArticle,
  deleteNewsArticle,
  uploadNewsImage,
  type NewsImageUpload,
} from '../components/news/newsRepository';

type EditorMode = 'draft' | 'publish';

type PersistNewsInput = {
  draft: NewsArticleDraft;
  image: File | null;
  mode: EditorMode;
  makeFeatured: boolean;
  onProgress?: (progress: number) => void;
  createId?: () => string;
};

type EditorServices = {
  saveNewsDraft(draft: NewsArticleDraft): Promise<NewsArticleDraft>;
  uploadNewsImage(
    articleId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<NewsImageUpload>;
  getAdminNewsArticle(id: string): Promise<NewsArticleDraft | null>;
  publishNewsArticle(draft: NewsArticleDraft, makeFeatured: boolean): Promise<NewsArticleDraft>;
};

type PersistNewsResult = {
  article: NewsArticleDraft;
  cleanupWarning: string | null;
};

export class NewsPersistError extends Error {
  constructor(message: string, public readonly persistedDraft: NewsArticleDraft, public readonly cause?: unknown) {
    super(message);
    this.name = 'NewsPersistError';
  }
}

type DeleteNewsServices = {
  deleteNewsArticle(article: Pick<NewsArticleDraft, 'id' | 'imagePath'>): Promise<void>;
  getAdminNewsArticle(id: string): Promise<NewsArticleDraft | null>;
};

export async function deleteNewsArticleSafely(
  article: Pick<NewsArticleDraft, 'id' | 'imagePath'>,
  services: DeleteNewsServices = { deleteNewsArticle, getAdminNewsArticle },
): Promise<{ deleted: true; cleanupWarning: string | null }> {
  try {
    await services.deleteNewsArticle(article);
    return { deleted: true, cleanupWarning: null };
  } catch (error) {
    const remaining = await services.getAdminNewsArticle(article.id).catch(() => undefined);
    if (remaining === null) {
      return {
        deleted: true,
        cleanupWarning: 'Article deleted, but image cleanup did not finish. The old file may need manual cleanup.',
      };
    }
    throw error;
  }
}

const defaultCreateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `news-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export async function persistNewsArticleWithImage(
  input: PersistNewsInput,
  services: EditorServices = {
    saveNewsDraft,
    uploadNewsImage,
    getAdminNewsArticle,
    publishNewsArticle,
  },
): Promise<PersistNewsResult> {
  const articleId = input.draft.id || (input.createId ?? defaultCreateId)();
  let workingDraft = { ...input.draft, id: articleId };
  let newlySavedDraft: NewsArticleDraft | null = null;
  let cleanupWarning: string | null = null;

  if (!input.draft.id) {
    workingDraft = await services.saveNewsDraft(workingDraft);
    newlySavedDraft = workingDraft;
  }

  if (input.image) {
    const previousPath = workingDraft.imagePath;
    try {
      const uploaded = await services.uploadNewsImage(articleId, input.image, input.onProgress);
      workingDraft = { ...workingDraft, ...uploaded };
    } catch (error) {
      const recovered = await services.getAdminNewsArticle(articleId).catch(() => null);
      if (recovered && recovered.imagePath && recovered.imagePath !== previousPath) {
        workingDraft = { ...workingDraft, imagePath: recovered.imagePath, imageUrl: recovered.imageUrl };
        cleanupWarning = 'The article image was updated, but the old image could not be removed. Cleanup can be retried later.';
      } else {
        if (newlySavedDraft) {
          const message = error instanceof Error ? error.message : 'The image upload did not finish.';
          throw new NewsPersistError(message, newlySavedDraft, error);
        }
        throw error;
      }
    }
  }

  if (input.mode === 'publish' || workingDraft.status === 'published') {
    const article = await services.publishNewsArticle(workingDraft, input.makeFeatured);
    return { article, cleanupWarning };
  }

  if (!input.image && input.draft.id) {
    return { article: await services.saveNewsDraft(workingDraft), cleanupWarning };
  }

  return { article: await services.saveNewsDraft(workingDraft), cleanupWarning };
}

export async function persistFeaturedSelection(
  article: NewsArticleDraft,
  currentFeaturedArticleId: string | null,
  makeFeatured: boolean,
  setFeatured: (id: string | null) => Promise<void> = setFeaturedNewsArticle,
): Promise<string | null> {
  if (article.status !== 'published') return currentFeaturedArticleId;
  if (makeFeatured) return article.id;
  if (currentFeaturedArticleId !== article.id) return currentFeaturedArticleId;
  await setFeatured(null);
  return null;
}

const developmentDraft = (): NewsArticleDraft => {
  const environment = (import.meta.env ?? {}) as Record<string, string | boolean | undefined>;
  const projectId = typeof environment.VITE_FIREBASE_PROJECT_ID === 'string'
    ? environment.VITE_FIREBASE_PROJECT_ID
    : '';
  const isDevelopment = environment.DEV === true
    || environment.VITE_USE_FIREBASE_EMULATORS === 'true'
    || projectId.startsWith('demo-');
  if (!isDevelopment) return createEmptyNewsDraft();
  return {
    ...getSampleNewsDraft(),
    id: '',
    imageUrl: '',
    imagePath: '',
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  };
};

const friendlyError = (error: unknown) => (
  error instanceof Error && error.message
    ? error.message
    : 'The article could not be loaded. Try again.'
);

const AdminNewsEditorPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initialDraft, setInitialDraft] = useState<NewsArticleDraft | null>(() => (
    articleId ? null : developmentDraft()
  ));
  const [featuredArticleId, setFeaturedArticleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [createdId, setCreatedId] = useState('');

  useEffect(() => {
    let active = true;
    setWorkspaceNotice('');
    setError('');

    if (!articleId) {
      setInitialDraft(developmentDraft());
      setLoading(true);
      void getFeaturedNewsArticleId().then((id) => {
        if (active) setFeaturedArticleId(id);
      }).catch((loadError) => {
        if (active) setError(friendlyError(loadError));
      }).finally(() => {
        if (active) setLoading(false);
      });
      return () => { active = false; };
    }

    setLoading(true);
    void Promise.all([getAdminNewsArticle(articleId), getFeaturedNewsArticleId()])
      .then(([article, featuredId]) => {
        if (!active) return;
        if (!article) {
          setInitialDraft(null);
          setError('This news article does not exist.');
          return;
        }
        setInitialDraft(article);
        setFeaturedArticleId(featuredId);
      })
      .catch((loadError) => {
        if (active) setError(friendlyError(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [articleId]);

  useEffect(() => {
    if (createdId) navigate(`/admin/news/${createdId}`, { replace: true });
  }, [createdId, navigate]);

  const initialPreview = searchParams.get('preview') === '1';
  const initiallyFeatured = useMemo(
    () => Boolean(initialDraft?.id && initialDraft.id === featuredArticleId),
    [featuredArticleId, initialDraft?.id],
  );

  const persist = async (draft: NewsArticleDraft, image: File | null, mode: EditorMode, makeFeatured: boolean) => {
    setUploadProgress(image ? 0 : null);
    setWorkspaceNotice('');
    try {
      const result = await persistNewsArticleWithImage({
        draft,
        image,
        mode,
        makeFeatured,
        onProgress: setUploadProgress,
      });
      if (result.cleanupWarning) setWorkspaceNotice(result.cleanupWarning);
      if (!articleId) setCreatedId(result.article.id);
      const nextFeaturedArticleId = await persistFeaturedSelection(
        result.article,
        featuredArticleId,
        makeFeatured,
      );
      setFeaturedArticleId(nextFeaturedArticleId);
      return result.article;
    } finally {
      setUploadProgress(null);
    }
  };

  if (loading) {
    return (
      <section className="admin-news-page admin-news-state" role="status">
        <span className="admin-news-kicker">Editorial desk</span>
        <h1>Loading article</h1>
        <p>Preparing the latest saved version…</p>
      </section>
    );
  }

  if (error || !initialDraft) {
    return (
      <section className="admin-news-page admin-news-state" role="alert">
        <span className="admin-news-kicker">Editorial desk</span>
        <h1>Article unavailable</h1>
        <p>{error || 'This news article could not be loaded.'}</p>
        <Link to="/admin/news">Back to articles</Link>
      </section>
    );
  }

  return (
    <div className="admin-news-page">
      {workspaceNotice && <div className="admin-news-cleanup-warning" role="status">{workspaceNotice}</div>}
      <NewsArticleEditor
        key={initialDraft.id || 'new-article'}
        initialDraft={initialDraft}
        initialPreview={initialPreview}
        initiallyFeatured={initiallyFeatured}
        currentFeaturedArticleId={featuredArticleId}
        uploadProgress={uploadProgress}
        onSaveDraft={(draft, image, makeFeatured) => persist(draft, image, 'draft', makeFeatured)}
        onPublish={(draft, image, makeFeatured) => persist(draft, image, 'publish', makeFeatured)}
        onDelete={initialDraft.id ? async (article) => {
          const result = await deleteNewsArticleSafely(article);
          navigate('/admin/news', {
            replace: true,
            state: { notice: result.cleanupWarning || 'Article deleted.' },
          });
        } : undefined}
        onUnpublish={initialDraft.status === 'published' ? async (article) => {
          await unpublishNewsArticle(article.id);
          const refreshed = await getAdminNewsArticle(article.id);
          if (!refreshed) throw new Error('The unpublished article could not be reloaded.');
          setFeaturedArticleId((current) => current === article.id ? null : current);
          return refreshed;
        } : undefined}
      />
    </div>
  );
};

export default AdminNewsEditorPage;
