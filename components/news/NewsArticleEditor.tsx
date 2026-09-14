import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticleReader } from './NewsArticleReader';
import { loadNewsImageBlob } from './newsImages';
import {
  NEWS_CATEGORIES,
  createEmptyNewsDraft,
  slugifyNewsTitle,
  validateNewsDraft,
  type NewsArticle,
  type NewsArticleDraft,
  type NewsSource,
  type NewsValidationErrors,
} from './newsModel';

export type NewsArticleEditorProps = {
  initialDraft: NewsArticleDraft;
  initialPreview?: boolean;
  initiallyFeatured?: boolean;
  uploadProgress?: number | null;
  onSaveDraft(
    draft: NewsArticleDraft,
    image: File | null,
    makeFeatured: boolean,
  ): Promise<NewsArticleDraft>;
  onPublish(
    draft: NewsArticleDraft,
    image: File | null,
    makeFeatured: boolean,
  ): Promise<NewsArticleDraft>;
  onDelete?(article: NewsArticleDraft): Promise<void>;
  onUnpublish?(article: NewsArticleDraft): Promise<NewsArticleDraft | void>;
  loadImageBlob?(imagePath: string): Promise<Blob>;
};

type ActiveMutation = 'save' | 'publish' | 'delete' | 'unpublish' | null;
type EditableField = keyof NewsValidationErrors;

const PREVIEW_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22720%22 viewBox=%220 0 1200 720%22%3E%3Crect width=%221200%22 height=%22720%22 fill=%22%23e5ece6%22/%3E%3Cpath d=%22M0 510 280 320l190 132 210-230 520 298v200H0Z%22 fill=%22%23c8d8cd%22/%3E%3C/svg%3E';
const NEWS_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const NEWS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function validateNewsImageSelection(file: Pick<File, 'type' | 'size'>): string | null {
  if (!NEWS_IMAGE_TYPES.has(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  if (file.size > NEWS_IMAGE_MAX_BYTES) return 'Featured images must be 5 MB or smaller.';
  return null;
}

export type SavedNewsPreviewImage =
  | { kind: 'public'; imageUrl: string }
  | { kind: 'authenticated'; imagePath: string }
  | { kind: 'none' };

export function getSavedNewsPreviewImage(draft: NewsArticleDraft): SavedNewsPreviewImage {
  if (draft.status === 'published' && draft.imageUrl) {
    return { kind: 'public', imageUrl: draft.imageUrl };
  }
  if (draft.status === 'draft' && draft.imagePath) {
    return { kind: 'authenticated', imagePath: draft.imagePath };
  }
  return { kind: 'none' };
}

export async function loadSavedNewsPreviewObjectUrl(
  imagePath: string,
  loadBlob: (path: string) => Promise<Blob> = loadNewsImageBlob,
  createObjectUrl: (blob: Blob) => string = (blob) => URL.createObjectURL(blob),
): Promise<string> {
  return createObjectUrl(await loadBlob(imagePath));
}

export function isNewsEditorDirty(
  contentDirty: boolean,
  hasSelectedImage: boolean,
  makeFeatured: boolean,
  persistedFeatured: boolean,
): boolean {
  return contentDirty || hasSelectedImage || makeFeatured !== persistedFeatured;
}

export function confirmUnsavedNewsNavigation(
  dirty: boolean,
  confirmLeave: () => boolean = () => window.confirm('Leave without saving your changes?'),
): boolean {
  return !dirty || confirmLeave();
}

export function getUnpublishConfirmation(dirty: boolean, title = 'this article'): string {
  return dirty
    ? `Unpublish “${title}” and discard unsaved edits? Its public page will no longer be available.`
    : `Unpublish “${title}”? Its public page will no longer be available.`;
}

const fieldIds: Record<EditableField, string> = {
  title: 'news-title',
  slug: 'news-slug',
  excerpt: 'news-excerpt',
  body: 'news-body',
  category: 'news-category',
  authorName: 'news-author',
  imageUrl: 'news-image',
  imageAlt: 'news-image-alt',
  sources: 'news-source-0-label',
};

const categoryLabel = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);

const usableSources = (sources: NewsSource[]): NewsSource[] => sources.filter((source) => {
  if (!source.label.trim()) return false;
  try {
    return new URL(source.url).protocol === 'https:';
  } catch {
    return false;
  }
});

export function createNewsPreviewArticle(
  draft: NewsArticleDraft,
  imageOverride: string | null | undefined = undefined,
  now = new Date(),
): NewsArticle {
  const publishedAt = draft.publishedAt ?? now;
  return {
    ...draft,
    id: draft.id || 'news-preview',
    title: draft.title.trim() || 'Untitled market briefing',
    slug: draft.slug || 'news-preview',
    excerpt: draft.excerpt.trim() || 'Add an excerpt to see the article introduction here.',
    body: draft.body.trim() || 'Add the article body to preview the finished reading experience.',
    authorName: draft.authorName.trim() || 'Ta7leel Editorial',
    imageUrl: imageOverride === null
      ? PREVIEW_IMAGE_PLACEHOLDER
      : imageOverride || draft.imageUrl || PREVIEW_IMAGE_PLACEHOLDER,
    imageAlt: draft.imageAlt.trim() || 'Featured image preview',
    sources: usableSources(draft.sources),
    status: 'published',
    createdAt: draft.createdAt ?? now,
    updatedAt: draft.updatedAt ?? now,
    publishedAt,
  };
}

const errorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return 'The news workspace could not complete that action. Try again.';
};

export function NewsArticleEditor({
  initialDraft,
  initialPreview = false,
  initiallyFeatured = false,
  uploadProgress = null,
  onSaveDraft,
  onPublish,
  onDelete,
  onUnpublish,
  loadImageBlob = loadNewsImageBlob,
}: NewsArticleEditorProps) {
  const [draft, setDraft] = useState<NewsArticleDraft>(initialDraft);
  const [errors, setErrors] = useState<NewsValidationErrors>({});
  const [contentDirty, setContentDirty] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [savedImageUrl, setSavedImageUrl] = useState('');
  const [savedImageLoading, setSavedImageLoading] = useState(false);
  const [savedImageError, setSavedImageError] = useState('');
  const [savedImageAttempt, setSavedImageAttempt] = useState(0);
  const [activeMutation, setActiveMutation] = useState<ActiveMutation>(null);
  const [previewOpen, setPreviewOpen] = useState(initialPreview);
  const [makeFeatured, setMakeFeatured] = useState(initiallyFeatured);
  const [persistedFeatured, setPersistedFeatured] = useState(initiallyFeatured);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const slugWasEdited = useRef(Boolean(initialDraft.id || initialDraft.slug));

  useEffect(() => {
    setDraft(initialDraft);
    setErrors({});
    setContentDirty(false);
    setSelectedImage(null);
    setSavedImageUrl('');
    setSavedImageError('');
    setSavedImageAttempt(0);
    setPreviewOpen(initialPreview);
    setMakeFeatured(initiallyFeatured);
    setPersistedFeatured(initiallyFeatured);
    setNotice('');
    setActionError('');
    slugWasEdited.current = Boolean(initialDraft.id || initialDraft.slug);
  }, [initialDraft]);

  useEffect(() => {
    if (!selectedImage || typeof URL === 'undefined' || !URL.createObjectURL) {
      setLocalImageUrl('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setLocalImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const savedPreviewImage = useMemo(
    () => getSavedNewsPreviewImage(draft),
    [draft.imagePath, draft.imageUrl, draft.status],
  );

  useEffect(() => {
    setSavedImageUrl('');
    setSavedImageError('');
    if (
      !previewOpen
      || selectedImage
      || savedPreviewImage.kind !== 'authenticated'
    ) {
      setSavedImageLoading(false);
      return undefined;
    }

    let active = true;
    let objectUrl = '';
    setSavedImageLoading(true);
    void loadSavedNewsPreviewObjectUrl(savedPreviewImage.imagePath, loadImageBlob)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setSavedImageUrl(url);
      })
      .catch((error) => {
        if (active) setSavedImageError(errorMessage(error));
      })
      .finally(() => {
        if (active) setSavedImageLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loadImageBlob, previewOpen, savedImageAttempt, savedPreviewImage, selectedImage]);

  const dirty = isNewsEditorDirty(
    contentDirty,
    Boolean(selectedImage),
    makeFeatured,
    persistedFeatured,
  );

  useEffect(() => {
    if (!dirty || typeof window === 'undefined') return undefined;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty || typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    let currentHistoryIndex = typeof window.history.state?.idx === 'number'
      ? window.history.state.idx
      : null;
    let restoringHistory = false;

    const guardInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) return;
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname
        && destination.search === window.location.search
        && destination.hash === window.location.hash
      ) return;
      if (confirmUnsavedNewsNavigation(true)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const guardHistoryNavigation = (event: PopStateEvent) => {
      if (restoringHistory) {
        restoringHistory = false;
        event.stopImmediatePropagation();
        return;
      }
      if (confirmUnsavedNewsNavigation(true)) {
        currentHistoryIndex = typeof event.state?.idx === 'number' ? event.state.idx : currentHistoryIndex;
        return;
      }

      event.stopImmediatePropagation();
      restoringHistory = true;
      const nextHistoryIndex = typeof event.state?.idx === 'number' ? event.state.idx : null;
      const restoreDelta = currentHistoryIndex !== null && nextHistoryIndex !== null
        ? currentHistoryIndex - nextHistoryIndex
        : 1;
      window.history.go(restoreDelta || 1);
    };

    document.addEventListener('click', guardInternalLink, true);
    window.addEventListener('popstate', guardHistoryNavigation, true);
    return () => {
      document.removeEventListener('click', guardInternalLink, true);
      window.removeEventListener('popstate', guardHistoryNavigation, true);
    };
  }, [dirty]);

  const resolvedPreviewImageUrl = localImageUrl
    || savedImageUrl
    || (savedPreviewImage.kind === 'public' ? savedPreviewImage.imageUrl : '');

  const previewArticle = useMemo(
    () => createNewsPreviewArticle(draft, resolvedPreviewImageUrl || null),
    [draft, resolvedPreviewImageUrl],
  );
  const isBusy = activeMutation !== null;
  const isPublished = draft.status === 'published';

  const updateDraft = <K extends keyof NewsArticleDraft>(field: K, value: NewsArticleDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setContentDirty(true);
    setNotice('');
    setActionError('');
    if (field in fieldIds) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const updateTitle = (title: string) => {
    setDraft((current) => ({
      ...current,
      title,
      slug: slugWasEdited.current ? current.slug : slugifyNewsTitle(title),
    }));
    setContentDirty(true);
    setNotice('');
    setActionError('');
    setErrors((current) => ({ ...current, title: undefined, slug: undefined }));
  };

  const focusFirstError = (validationErrors: NewsValidationErrors) => {
    const firstField = Object.keys(validationErrors)[0] as EditableField | undefined;
    if (!firstField || typeof document === 'undefined') return;
    requestAnimationFrame(() => document.getElementById(fieldIds[firstField])?.focus());
  };

  const validateFor = (mode: 'draft' | 'publish') => {
    const validationDraft = selectedImage ? { ...draft, imageUrl: draft.imageUrl || 'pending-upload' } : draft;
    const nextErrors = validateNewsDraft(validationDraft, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActionError(mode === 'publish'
        ? 'Complete the highlighted fields before publishing.'
        : 'Complete the highlighted fields before saving.');
      focusFirstError(nextErrors);
      return false;
    }
    return true;
  };

  const runMutation = async (
    mutation: Exclude<ActiveMutation, null>,
    operation: () => Promise<NewsArticleDraft | void>,
    successMessage: string,
  ) => {
    if (isBusy) return;
    setActiveMutation(mutation);
    setActionError('');
    setNotice('');
    try {
      const result = await operation();
      if (result) setDraft(result);
      setContentDirty(false);
      setSelectedImage(null);
      if (result && result.status === 'published') {
        setPersistedFeatured(makeFeatured);
      } else if (mutation === 'unpublish') {
        setMakeFeatured(false);
        setPersistedFeatured(false);
      } else {
        setPersistedFeatured(false);
      }
      setNotice(successMessage);
    } catch (error) {
      if (error && typeof error === 'object' && 'persistedDraft' in error) {
        const persistedDraft = error.persistedDraft;
        if (persistedDraft && typeof persistedDraft === 'object' && 'id' in persistedDraft) {
          setDraft(persistedDraft as NewsArticleDraft);
        }
      }
      setActionError(errorMessage(error));
    } finally {
      setActiveMutation(null);
    }
  };

  const saveDraft = () => {
    if (!validateFor('draft')) return;
    void runMutation(
      'save',
      () => onSaveDraft(draft, selectedImage, makeFeatured),
      isPublished
        ? 'Changes saved.'
        : makeFeatured
          ? 'Draft saved. The featured selection will be applied when you publish.'
          : 'Draft saved.',
    );
  };

  const publish = () => {
    if (!validateFor('publish')) return;
    void runMutation(
      'publish',
      () => onPublish(draft, selectedImage, makeFeatured),
      isPublished ? 'Published article updated.' : 'Article published.',
    );
  };

  const remove = () => {
    if (!onDelete || !window.confirm(`Delete “${draft.title || 'this article'}”? This cannot be undone.`)) return;
    void runMutation('delete', () => onDelete(draft), 'Article deleted.');
  };

  const unpublish = () => {
    if (!onUnpublish || !window.confirm(getUnpublishConfirmation(dirty, draft.title || 'this article'))) return;
    void runMutation('unpublish', () => onUnpublish(draft), 'Article moved back to drafts.');
  };

  const addSource = () => updateDraft('sources', [...draft.sources, { label: '', url: '' }]);
  const updateSource = (index: number, field: keyof NewsSource, value: string) => {
    const sources = draft.sources.map((source, sourceIndex) => (
      sourceIndex === index ? { ...source, [field]: value } : source
    ));
    updateDraft('sources', sources);
  };
  const removeSource = (index: number) => {
    updateDraft('sources', draft.sources.filter((_, sourceIndex) => sourceIndex !== index));
  };

  return (
    <div className={`admin-news-editor${previewOpen ? ' admin-news-editor--preview' : ''}`}>
      <section className="admin-news-editor__form-pane" aria-labelledby="admin-news-editor-title">
        <header className="admin-news-editor__header">
          <div>
            <span className="admin-news-kicker">Editorial desk</span>
            <h1 id="admin-news-editor-title">{draft.id ? 'Edit article' : 'New article'}</h1>
          </div>
          <div className="admin-news-editor__proof" aria-label="Article state">
            <span>{isPublished ? 'Published' : 'Draft'}</span>
            <span>{dirty ? 'Unsaved changes' : 'Saved state'}</span>
          </div>
        </header>

        {(actionError || notice) && (
          <div className={actionError ? 'admin-news-message admin-news-message--error' : 'admin-news-message'} role={actionError ? 'alert' : 'status'}>
            {actionError || notice}
          </div>
        )}

        <form className="admin-news-form" onSubmit={(event) => event.preventDefault()} noValidate>
          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-title">Title</label>
            <input
              id="news-title"
              value={draft.title}
              maxLength={140}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'news-title-error' : 'news-title-note'}
              onChange={(event) => updateTitle(event.target.value)}
            />
            {errors.title
              ? <p className="admin-news-field__error" id="news-title-error">{errors.title}</p>
              : <p className="admin-news-field__note" id="news-title-note">A clear headline, up to 140 characters.</p>}
          </div>

          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-slug">Slug</label>
            <div className="admin-news-slug">
              <span aria-hidden="true">/news/</span>
              <input
                id="news-slug"
                value={draft.slug}
                disabled={Boolean(draft.publishedAt)}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? 'news-slug-error' : 'news-slug-note'}
                onChange={(event) => {
                  slugWasEdited.current = true;
                  updateDraft('slug', event.target.value.toLowerCase());
                }}
              />
            </div>
            {errors.slug
              ? <p className="admin-news-field__error" id="news-slug-error">{errors.slug}</p>
              : <p className="admin-news-field__note" id="news-slug-note">Permanent after the first publication.</p>}
          </div>

          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-excerpt">Excerpt</label>
            <textarea
              id="news-excerpt"
              rows={3}
              value={draft.excerpt}
              maxLength={240}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? 'news-excerpt-error' : 'news-excerpt-note'}
              onChange={(event) => updateDraft('excerpt', event.target.value)}
            />
            {errors.excerpt
              ? <p className="admin-news-field__error" id="news-excerpt-error">{errors.excerpt}</p>
              : <p className="admin-news-field__note" id="news-excerpt-note">{draft.excerpt.length}/240 characters</p>}
          </div>

          <div className="admin-news-field">
            <label htmlFor="news-category">Category</label>
            <select
              id="news-category"
              value={draft.category}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'news-category-error' : undefined}
              onChange={(event) => updateDraft('category', event.target.value as NewsArticleDraft['category'])}
            >
              {NEWS_CATEGORIES.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}
            </select>
            {errors.category && <p className="admin-news-field__error" id="news-category-error">{errors.category}</p>}
          </div>

          <div className="admin-news-field">
            <label htmlFor="news-author">Author</label>
            <input
              id="news-author"
              value={draft.authorName}
              maxLength={80}
              aria-invalid={Boolean(errors.authorName)}
              aria-describedby={errors.authorName ? 'news-author-error' : undefined}
              onChange={(event) => updateDraft('authorName', event.target.value)}
            />
            {errors.authorName && <p className="admin-news-field__error" id="news-author-error">{errors.authorName}</p>}
          </div>

          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-image">Featured image</label>
            <input
              id="news-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={Boolean(errors.imageUrl)}
              aria-describedby={errors.imageUrl ? 'news-image-error' : 'news-image-note'}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                const imageError = file ? validateNewsImageSelection(file) : null;
                if (imageError) {
                  setSelectedImage(null);
                  setErrors((current) => ({ ...current, imageUrl: imageError }));
                  setActionError('Choose a supported featured image before saving.');
                  event.target.value = '';
                  return;
                }
                setSelectedImage(file);
                setErrors((current) => ({ ...current, imageUrl: undefined }));
                setActionError('');
              }}
            />
            {selectedImage && <p className="admin-news-field__note">Selected: {selectedImage.name}</p>}
            {errors.imageUrl
              ? <p className="admin-news-field__error" id="news-image-error">{errors.imageUrl}</p>
              : <p className="admin-news-field__note" id="news-image-note">JPEG, PNG, or WebP; maximum 5 MB.</p>}
            {uploadProgress !== null && (
              <div className="admin-news-upload" aria-live="polite">
                <progress max={100} value={Math.round(uploadProgress * 100)} />
                <span>Uploading image {Math.round(uploadProgress * 100)}%</span>
              </div>
            )}
          </div>

          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-image-alt">Image alt text</label>
            <input
              id="news-image-alt"
              value={draft.imageAlt}
              maxLength={180}
              aria-invalid={Boolean(errors.imageAlt)}
              aria-describedby={errors.imageAlt ? 'news-image-alt-error' : 'news-image-alt-note'}
              onChange={(event) => updateDraft('imageAlt', event.target.value)}
            />
            {errors.imageAlt
              ? <p className="admin-news-field__error" id="news-image-alt-error">{errors.imageAlt}</p>
              : <p className="admin-news-field__note" id="news-image-alt-note">Describe the information in the image.</p>}
          </div>

          <div className="admin-news-field admin-news-field--wide">
            <label htmlFor="news-body">Body</label>
            <textarea
              id="news-body"
              className="admin-news-body"
              rows={18}
              value={draft.body}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? 'news-body-error' : 'news-body-note'}
              onChange={(event) => updateDraft('body', event.target.value)}
            />
            {errors.body
              ? <p className="admin-news-field__error" id="news-body-error">{errors.body}</p>
              : <p className="admin-news-field__note" id="news-body-note">Markdown headings, emphasis, lists, quotes, and rules are supported.</p>}
          </div>

          <fieldset className="admin-news-sources admin-news-field--wide" aria-describedby={errors.sources ? 'news-sources-error' : undefined}>
            <legend>Sources</legend>
            {draft.sources.map((source, index) => (
              <div className="admin-news-source" key={`source-${index}`}>
                <div className="admin-news-field">
                  <label htmlFor={`news-source-${index}-label`}>Source {index + 1} label</label>
                  <input
                    id={`news-source-${index}-label`}
                    value={source.label}
                    onChange={(event) => updateSource(index, 'label', event.target.value)}
                  />
                </div>
                <div className="admin-news-field">
                  <label htmlFor={`news-source-${index}-url`}>Source {index + 1} URL</label>
                  <input
                    id={`news-source-${index}-url`}
                    type="url"
                    placeholder="https://"
                    value={source.url}
                    onChange={(event) => updateSource(index, 'url', event.target.value)}
                  />
                </div>
                <button type="button" className="admin-news-source__remove" onClick={() => removeSource(index)}>
                  Remove source {index + 1}
                </button>
              </div>
            ))}
            {errors.sources && <p className="admin-news-field__error" id="news-sources-error">{errors.sources}</p>}
            <button type="button" className="admin-news-secondary" onClick={addSource}>Add source</button>
          </fieldset>

          <label className="admin-news-feature-toggle">
            <input
              type="checkbox"
              checked={makeFeatured}
              onChange={(event) => {
                setMakeFeatured(event.target.checked);
                setNotice('');
                setActionError('');
              }}
            />
            <span>
              <strong>Feature on the news page</strong>
              Make this the lead article when it is published.
            </span>
          </label>
        </form>

        <footer className="admin-news-editor__actions">
          <Link to="/admin/news">Back to articles</Link>
          <div>
            {onDelete && draft.id && (
              <button type="button" className="admin-news-danger" disabled={isBusy} onClick={remove}>Delete</button>
            )}
            {onUnpublish && isPublished && (
              <button type="button" className="admin-news-secondary" disabled={isBusy} onClick={unpublish}>Unpublish</button>
            )}
            <button
              type="button"
              className="admin-news-secondary"
              disabled={isBusy}
              aria-pressed={previewOpen}
              onClick={() => setPreviewOpen((open) => !open)}
            >
              Preview
            </button>
            <button type="button" className="admin-news-secondary" disabled={isBusy} onClick={saveDraft}>
              {activeMutation === 'save' ? 'Saving…' : isPublished ? 'Save changes' : 'Save draft'}
            </button>
            <button type="button" className="admin-news-primary" disabled={isBusy} onClick={publish}>
              {activeMutation === 'publish' ? 'Publishing…' : isPublished ? 'Update published article' : 'Publish'}
            </button>
          </div>
        </footer>
      </section>

      {previewOpen && (
        <aside className="admin-news-preview" aria-label="Article preview">
          <div className="admin-news-preview__notice" role="status">
            <strong>Previewing unsaved changes</strong>
            <span>This private preview does not create a public article URL.</span>
          </div>
          {savedImageLoading && (
            <div className="admin-news-message" role="status">Loading the saved featured image…</div>
          )}
          {savedImageError && (
            <div className="admin-news-message admin-news-message--error" role="alert">
              <span>The saved featured image could not be loaded. {savedImageError}</span>
              <button type="button" onClick={() => setSavedImageAttempt((attempt) => attempt + 1)}>Retry image</button>
            </div>
          )}
          <NewsArticleReader article={previewArticle} relatedArticles={[]} showAd={false} />
        </aside>
      )}
    </div>
  );
}

export default NewsArticleEditor;
