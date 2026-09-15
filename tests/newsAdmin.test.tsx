import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';
import { createEmptyNewsDraft, type NewsArticleDraft } from '../components/news/newsModel';

test('AdminGate keeps authenticated non-admin users outside the workspace', async () => {
  const { AdminGate } = await import('../components/AdminRoute');
  const markup = renderToStaticMarkup(
    <StaticRouter location="/admin/news">
      <AdminGate
        user={{ id: 'reader', email: 'reader@example.com', name: 'Reader' }}
        loading={false}
      >
        <p>Editorial secret</p>
      </AdminGate>
    </StaticRouter>,
  );

  assert.doesNotMatch(markup, /Editorial secret/);
  assert.match(markup, /Access denied/i);
});

test('AdminGate shows progress while auth resolves and admits the shared administrator identity', async () => {
  const { AdminGate } = await import('../components/AdminRoute');
  const loading = renderToStaticMarkup(
    <StaticRouter location="/admin/news">
      <AdminGate user={null} loading><p>Editorial secret</p></AdminGate>
    </StaticRouter>,
  );
  const allowed = renderToStaticMarkup(
    <StaticRouter location="/admin/news">
      <AdminGate
        user={{ id: 'ME2iHxeBWgcSTpc1HKwKbSCrQ7t2', email: 'admin@example.com' }}
        loading={false}
      >
        <p>Editorial secret</p>
      </AdminGate>
    </StaticRouter>,
  );

  assert.match(loading, /Checking editorial access/i);
  assert.doesNotMatch(loading, /Editorial secret/);
  assert.match(allowed, /Editorial secret/);
});

test('inventory exposes explicit filters, text statuses, feature state, and row actions', async () => {
  const { AdminNewsInventory } = await import('../components/news/AdminNewsInventory');
  const published = makeNewsArticleFixture({ id: 'published', title: 'Published outlook' });
  const draft: NewsArticleDraft = {
    ...createEmptyNewsDraft(),
    id: 'draft',
    title: 'Draft outlook',
    slug: 'draft-outlook',
    createdAt: new Date('2026-09-14T08:00:00.000Z'),
    updatedAt: new Date('2026-09-14T09:00:00.000Z'),
  };
  const markup = renderToStaticMarkup(
    <StaticRouter location="/admin/news">
      <AdminNewsInventory
        articles={[published, draft]}
        filter="all"
        featuredArticleId="published"
        onFilterChange={() => undefined}
        onPublish={() => undefined}
        onUnpublish={() => undefined}
        onDelete={() => undefined}
        onSetFeatured={() => undefined}
      />
    </StaticRouter>,
  );

  assert.match(markup, /aria-label="Article status filters"/);
  assert.match(markup, />All</);
  assert.match(markup, />Draft</);
  assert.match(markup, />Published</);
  assert.match(markup, /Published outlook/);
  assert.match(markup, /Draft outlook/);
  assert.match(markup, />Featured</);
  assert.match(markup, /href="\/admin\/news\/published"/);
  assert.match(markup, /href="\/admin\/news\/published\?preview=1"/);
  assert.match(markup, />Unpublish</);
  assert.match(markup, />Publish</);
  assert.match(markup, />Delete</);
});

test('editor exposes distinct draft, preview, and publish actions with accessible fields', async () => {
  const { NewsArticleEditor } = await import('../components/news/NewsArticleEditor');
  const keepDraft = async (draft: NewsArticleDraft) => draft;
  const removeDraft = async () => undefined;
  const markup = renderToStaticMarkup(
    <StaticRouter location="/admin/news/new">
      <NewsArticleEditor
        initialDraft={createEmptyNewsDraft()}
        onSaveDraft={keepDraft}
        onPublish={async (draft) => keepDraft(draft)}
        onDelete={removeDraft}
      />
    </StaticRouter>,
  );

  assert.match(markup, /Save draft/);
  assert.match(markup, /Preview/);
  assert.match(markup, /Publish/);
  assert.match(markup, /Featured image/);
  assert.match(markup, /Image alt text/);
  assert.match(markup, /<label[^>]*for="news-title"/);
  assert.match(markup, /<label[^>]*for="news-body"/);
  assert.match(markup, /Add source/);
  assert.doesNotMatch(markup, /href="\/news\/"/);
});

test('editor rejects unsupported or oversized featured images before upload', async () => {
  const { validateNewsImageSelection } = await import('../components/news/NewsArticleEditor');
  assert.match(
    validateNewsImageSelection({ type: 'image/gif', size: 1024 } as File) || '',
    /JPEG, PNG, or WebP/i,
  );
  assert.match(
    validateNewsImageSelection({ type: 'image/webp', size: 5 * 1024 * 1024 + 1 } as File) || '',
    /5 MB/i,
  );
  assert.equal(validateNewsImageSelection({ type: 'image/png', size: 5 * 1024 * 1024 } as File), null);
});

test('preview builder renders current draft values without creating a public draft route', async () => {
  const { createNewsPreviewArticle, NewsArticleEditor } = await import('../components/news/NewsArticleEditor');
  const draft: NewsArticleDraft = {
    ...createEmptyNewsDraft(),
    id: 'draft-preview',
    title: 'A private weekly draft',
    slug: 'private-weekly-draft',
    excerpt: 'Current unsaved excerpt',
    body: '## Current body',
    authorName: 'Ta7leel Editorial',
    imageAlt: 'Current preview alt text',
  };
  const now = new Date('2026-09-14T12:00:00.000Z');
  const preview = createNewsPreviewArticle(draft, 'blob:local-image', now);
  assert.equal(preview.title, 'A private weekly draft');
  assert.equal(preview.imageUrl, 'blob:local-image');
  assert.equal(preview.status, 'published');
  assert.equal(preview.publishedAt.toISOString(), now.toISOString());

  const markup = renderToStaticMarkup(
    <StaticRouter location="/admin/news/draft-preview?preview=1">
      <NewsArticleEditor
        initialDraft={draft}
        initialPreview
        onSaveDraft={async (article) => article}
        onPublish={async (article) => article}
      />
    </StaticRouter>,
  );
  assert.match(markup, /Previewing unsaved changes/);
  assert.match(markup, /A private weekly draft/);
  assert.equal((markup.match(/<h1/g) || []).length, 1);
  assert.match(markup, /<h2 id="news-article-title">A private weekly draft<\/h2>/);
  assert.doesNotMatch(markup, /href="\/news\/private-weekly-draft"/);
  assert.doesNotMatch(markup, /Advertisements/);
});

test('saved draft previews load protected images as authenticated blobs while published previews use public URLs', async () => {
  const {
    getSavedNewsPreviewImage,
    loadSavedNewsPreviewObjectUrl,
  } = await import('../components/news/NewsArticleEditor');
  const draft: NewsArticleDraft = {
    ...createEmptyNewsDraft(),
    id: 'protected-draft',
    imagePath: 'news/protected-draft/chart.webp',
    imageUrl: 'https://firebasestorage.googleapis.com/protected-draft',
  };
  const published = makeNewsArticleFixture({
    id: 'public-story',
    imagePath: 'news/public-story/chart.webp',
    imageUrl: 'https://firebasestorage.googleapis.com/public-story',
  });

  assert.deepEqual(getSavedNewsPreviewImage(draft), {
    kind: 'authenticated',
    imagePath: 'news/protected-draft/chart.webp',
  });
  assert.deepEqual(getSavedNewsPreviewImage(published), {
    kind: 'public',
    imageUrl: 'https://firebasestorage.googleapis.com/public-story',
  });

  let loadedPath = '';
  const objectUrl = await loadSavedNewsPreviewObjectUrl(
    'news/protected-draft/chart.webp',
    async (imagePath) => {
      loadedPath = imagePath;
      return new Blob(['protected image'], { type: 'image/webp' });
    },
    (blob) => `blob:authenticated-${blob.type}`,
  );
  assert.equal(loadedPath, 'news/protected-draft/chart.webp');
  assert.equal(objectUrl, 'blob:authenticated-image/webp');
});

test('editor dirty state includes pending featured selection and navigation confirmation is decision-based', async () => {
  const {
    confirmUnsavedNewsNavigation,
    getUnpublishConfirmation,
    isNewsEditorDirty,
  } = await import('../components/news/NewsArticleEditor');
  let confirmations = 0;
  const rejectLeave = () => {
    confirmations += 1;
    return false;
  };

  assert.equal(isNewsEditorDirty(false, false, false, false), false);
  assert.equal(isNewsEditorDirty(false, false, true, false), true);
  assert.equal(isNewsEditorDirty(true, false, false, false), true);
  assert.equal(confirmUnsavedNewsNavigation(false, rejectLeave), true);
  assert.equal(confirmations, 0);
  assert.equal(confirmUnsavedNewsNavigation(true, rejectLeave), false);
  assert.equal(confirmations, 1);
  assert.match(getUnpublishConfirmation(true, 'Edited story'), /discard unsaved edits/i);
});

test('shared dirty-navigation registry guards imperative shell actions and stays transparent when clean', async () => {
  const {
    createDirtyNavigationRegistry,
    runGuardedNavigation,
  } = await import('../contexts/DirtyNavigationContext');
  const registry = createDirtyNavigationRegistry();
  let actions = 0;
  let confirmations = 0;

  assert.equal(runGuardedNavigation(
    () => registry.confirmNavigation(() => {
      confirmations += 1;
      return false;
    }),
    () => { actions += 1; },
  ), true);
  assert.equal(actions, 1);
  assert.equal(confirmations, 0);

  registry.setDirty('news-editor', true);
  assert.equal(runGuardedNavigation(
    () => registry.confirmNavigation(() => {
      confirmations += 1;
      return false;
    }),
    () => { actions += 1; },
  ), false);
  assert.equal(actions, 1);
  assert.equal(confirmations, 1);

  assert.equal(runGuardedNavigation(
    () => registry.confirmNavigation(() => {
      confirmations += 1;
      return true;
    }),
    () => { actions += 1; },
  ), true);
  assert.equal(actions, 2);
  assert.equal(confirmations, 2);

  registry.setDirty('news-editor', false);
  assert.equal(registry.isDirty(), false);
});

test('imperative header search, result selection, account logout, and modal navigation use the shared guard', async () => {
  const [appSource, headerSource, resultsSource, menuSource, modalSource] = await Promise.all([
    readFile(new URL('../App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/Header.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/SearchResults.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/UserMenu.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/SignUpPromptModal.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(appSource, /<DirtyNavigationProvider>/);
  assert.match(headerSource, /useDirtyNavigation\(\)/);
  assert.match(headerSource, /runGuardedNavigation\(confirmNavigation/);
  assert.match(resultsSource, /runGuardedNavigation\(confirmNavigation/);
  assert.match(menuSource, /runGuardedNavigation\(confirmNavigation/);
  assert.match(modalSource, /runGuardedNavigation\(confirmNavigation/);
});

test('new article publishing creates a stable client id before image upload', async () => {
  const { persistNewsArticleWithImage } = await import('../pages/AdminNewsEditorPage');
  const calls: string[] = [];
  const base = {
    ...createEmptyNewsDraft(),
    title: 'Rates week ahead',
    slug: 'rates-week-ahead',
    excerpt: 'What matters in the rates market this week.',
    body: 'A complete weekly briefing.',
    authorName: 'Ta7leel Editorial',
    imageAlt: 'Interest-rate chart for the week ahead',
  };
  const image = new File(['image'], 'rates.webp', { type: 'image/webp' });
  const services = {
    saveNewsDraft: async (draft: NewsArticleDraft) => {
      calls.push(`save:${draft.id}`);
      return { ...draft, status: 'draft' as const };
    },
    uploadNewsImage: async (id: string) => {
      calls.push(`upload:${id}`);
      return { imagePath: `news/${id}/rates.webp`, imageUrl: 'https://images.example.com/rates.webp' };
    },
    getAdminNewsArticle: async () => null,
    publishNewsArticle: async (draft: NewsArticleDraft) => {
      calls.push(`publish:${draft.id}:${draft.imagePath}`);
      return makeNewsArticleFixture({ ...draft, id: draft.id, status: 'published' });
    },
  };

  const result = await persistNewsArticleWithImage({
    draft: base,
    image,
    mode: 'publish',
    makeFeatured: true,
    createId: () => 'client-article-id',
  }, services);

  assert.equal(result.article.id, 'client-article-id');
  assert.deepEqual(calls, [
    'save:client-article-id',
    'upload:client-article-id',
    'publish:client-article-id:news/client-article-id/rates.webp',
  ]);
});

test('failed first image upload preserves the newly saved draft id for retry', async () => {
  const { persistNewsArticleWithImage, NewsPersistError } = await import('../pages/AdminNewsEditorPage');
  const draft = {
    ...createEmptyNewsDraft(),
    title: 'Retry this draft',
    slug: 'retry-this-draft',
  };
  const services = {
    saveNewsDraft: async (article: NewsArticleDraft) => ({ ...article, status: 'draft' as const }),
    uploadNewsImage: async () => { throw new Error('Upload interrupted'); },
    getAdminNewsArticle: async () => null,
    publishNewsArticle: async (article: NewsArticleDraft) => article,
  };

  await assert.rejects(
    persistNewsArticleWithImage({
      draft,
      image: new File(['image'], 'retry.webp', { type: 'image/webp' }),
      mode: 'draft',
      makeFeatured: false,
      createId: () => 'saved-before-upload',
    }, services),
    (error: unknown) => {
      assert.ok(error instanceof NewsPersistError);
      assert.equal(error.persistedDraft?.id, 'saved-before-upload');
      assert.match(error.message, /Upload interrupted/);
      return true;
    },
  );
});

test('image cleanup failure is separated from a committed article update', async () => {
  const { persistNewsArticleWithImage } = await import('../pages/AdminNewsEditorPage');
  const original = makeNewsArticleFixture({
    id: 'published-story',
    imagePath: 'news/published-story/old.webp',
    imageUrl: 'https://images.example.com/old.webp',
  });
  const replacement = makeNewsArticleFixture({
    ...original,
    imagePath: 'news/published-story/new.webp',
    imageUrl: 'https://images.example.com/new.webp',
  });
  let publishedImagePath = '';
  const services = {
    saveNewsDraft: async (draft: NewsArticleDraft) => draft,
    uploadNewsImage: async () => {
      throw new Error('Could not delete the old image');
    },
    getAdminNewsArticle: async () => replacement,
    publishNewsArticle: async (draft: NewsArticleDraft) => {
      publishedImagePath = draft.imagePath;
      return replacement;
    },
  };

  const result = await persistNewsArticleWithImage({
    draft: original,
    image: new File(['image'], 'new.webp', { type: 'image/webp' }),
    mode: 'publish',
    makeFeatured: false,
  }, services);

  assert.equal(publishedImagePath, 'news/published-story/new.webp');
  assert.match(result.cleanupWarning || '', /old image/i);
  assert.equal(result.article.imagePath, 'news/published-story/new.webp');
});

test('published save persists the selected featured state and clearing failures reject the operation', async () => {
  const {
    persistFeaturedSelection,
    persistNewsArticleWithImage,
  } = await import('../pages/AdminNewsEditorPage');
  const published = makeNewsArticleFixture({ id: 'feature-me' });
  let publishFeatured: boolean | null = null;
  const result = await persistNewsArticleWithImage({
    draft: published,
    image: null,
    mode: 'draft',
    makeFeatured: true,
  }, {
    saveNewsDraft: async (draft) => draft,
    uploadNewsImage: async () => ({ imagePath: '', imageUrl: '' }),
    getAdminNewsArticle: async () => published,
    publishNewsArticle: async (draft, makeFeatured) => {
      publishFeatured = makeFeatured;
      return { ...draft, status: 'published', publishedAt: published.publishedAt };
    },
  });
  assert.equal(result.article.id, 'feature-me');
  assert.equal(publishFeatured, true);

  await assert.rejects(
    persistFeaturedSelection(result.article, 'feature-me', false, async () => {
      throw new Error('Feature config unavailable');
    }),
    /Feature config unavailable/,
  );
});

test('editor confirms only when its featured selection would replace another configured lead', async () => {
  const { getEditorFeatureReplacementConfirmation } = await import('../components/news/NewsArticleEditor');

  assert.match(
    getEditorFeatureReplacementConfirmation('replacement', 'current-lead', true) || '',
    /replace the current featured story/i,
  );
  assert.equal(getEditorFeatureReplacementConfirmation('current-lead', 'current-lead', true), null);
  assert.equal(getEditorFeatureReplacementConfirmation('replacement', 'current-lead', false), null);
  assert.equal(getEditorFeatureReplacementConfirmation('replacement', null, true), null);
});

test('inventory asks before replacing or removing the current featured story', async () => {
  const { getFeaturedChangeConfirmation } = await import('../components/news/AdminNewsInventory');
  const current = makeNewsArticleFixture({ id: 'current', title: 'Current lead' });
  const replacement = makeNewsArticleFixture({ id: 'replacement', title: 'Replacement lead' });

  assert.match(getFeaturedChangeConfirmation(current, 'current') || '', /remove/i);
  assert.match(getFeaturedChangeConfirmation(replacement, 'current') || '', /replace/i);
  assert.equal(getFeaturedChangeConfirmation(replacement, null), null);
});

test('safe deletion reports orphaned image cleanup without reporting the article as undeleted', async () => {
  const { deleteNewsArticleSafely } = await import('../pages/AdminNewsEditorPage');
  const article = makeNewsArticleFixture({ id: 'delete-me' });
  const result = await deleteNewsArticleSafely(article, {
    deleteNewsArticle: async () => { throw new Error('Storage cleanup failed'); },
    getAdminNewsArticle: async () => null,
  });

  assert.equal(result.deleted, true);
  assert.match(result.cleanupWarning || '', /image cleanup/i);
});

test('user menu and application routes share the admin-only publishing entry point', async () => {
  const [menuSource, appSource] = await Promise.all([
    readFile(new URL('../components/UserMenu.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../App.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(menuSource, /isAdminIdentity\(user\)/);
  assert.match(menuSource, /to="\/admin\/news"/);
  assert.match(appSource, /path="\/admin\/news"/);
  assert.match(appSource, /path="\/admin\/news\/new"/);
  assert.match(appSource, /path="\/admin\/news\/:articleId"/);
  assert.match(appSource, /<AdminRoute>/);
  assert.match(appSource, /import\('\.\/pages\/AdminNewsPage\.css'\)/);
});
