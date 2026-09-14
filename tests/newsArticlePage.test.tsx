import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';
import type { NewsArticle, NewsCategory } from '../components/news/newsModel';
import type { NewsPageResult } from '../components/news/newsRepository';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

test('article reader renders metadata, sources, disclaimer, related links, and ad rail', async () => {
  const { NewsArticleReader } = await import('../components/news/NewsArticleReader');
  const article = makeNewsArticleFixture({
    id: 'policy-week',
    slug: 'policy-week',
    title: 'Policy week comes into view',
    body: '## What matters\n\nRates remain the central question.',
    updatedAt: new Date('2026-09-14T12:00:00.000Z'),
    sources: [{ label: 'Central bank release', url: 'https://example.com/policy' }],
  });
  const related = makeNewsArticleFixture({
    id: 'dollar-watch',
    slug: 'dollar-watch',
    title: 'Dollar watch for the week ahead',
  });

  const markup = renderToStaticMarkup(
    <StaticRouter location="/news/policy-week">
      <NewsArticleReader article={article} relatedArticles={[related]} />
    </StaticRouter>,
  );

  assert.match(markup, /<article/);
  assert.match(markup, /<time/);
  assert.match(markup, /Updated September 14, 2026/);
  assert.match(markup, />Sources</);
  assert.match(markup, /not investment advice/i);
  assert.match(markup, /target="_blank" rel="noopener noreferrer"/);
  assert.match(markup, /href="\/news\/dollar-watch"/);
  assert.match(markup, /Advertisements/);
  assert.match(markup, /alt="A market chart showing the weekly outlook"/);
});

test('article controller distinguishes not found from retryable repository errors and selects related stories', async () => {
  const { createNewsArticleController } = await import('../components/news/useNewsArticle');
  const article = makeNewsArticleFixture({ id: 'current', slug: 'current', category: 'forex' });
  const related = makeNewsArticleFixture({ id: 'related', slug: 'related', category: 'forex' });
  const fallback = makeNewsArticleFixture({ id: 'fallback', slug: 'fallback', category: 'economy' });
  let mode: 'notFound' | 'error' | 'success' = 'notFound';
  const requestedCategories: Array<NewsCategory | undefined> = [];
  const source = {
    getPublishedNewsArticleBySlug: async () => {
      if (mode === 'error') throw new Error('offline');
      return mode === 'success' ? article : null;
    },
    listPublishedNews: async (options?: { category?: NewsCategory }): Promise<NewsPageResult> => {
      requestedCategories.push(options?.category);
      return {
        articles: [article, fallback, related],
        nextCursor: null,
      };
    },
  };
  const controller = createNewsArticleController(source);

  await controller.load('missing');
  assert.equal(controller.getSnapshot().loading, false);
  assert.equal(controller.getSnapshot().notFound, true);
  assert.equal(controller.getSnapshot().error, null);

  mode = 'error';
  await controller.retry();
  assert.equal(controller.getSnapshot().notFound, false);
  assert.match(controller.getSnapshot().error || '', /temporarily unavailable/i);

  mode = 'success';
  await controller.retry();
  await flushPromises();
  assert.equal(controller.getSnapshot().article?.id, 'current');
  assert.deepEqual(requestedCategories, ['forex', undefined]);
  assert.deepEqual(controller.getSnapshot().relatedArticles.map((item) => item.id), ['related', 'fallback']);
  assert.equal(controller.getSnapshot().error, null);
  controller.cancel();
});

test('article controller finds same-category stories outside the newest general page', async () => {
  const { createNewsArticleController } = await import('../components/news/useNewsArticle');
  const article = makeNewsArticleFixture({ id: 'current', slug: 'current', category: 'forex' });
  const deepCategoryMatch = makeNewsArticleFixture({
    id: 'deep-category-match',
    slug: 'deep-category-match',
    category: 'forex',
    publishedAt: new Date('2026-08-01T12:00:00.000Z'),
  });
  const generalPage = Array.from({ length: 10 }, (_, index) => makeNewsArticleFixture({
    id: `general-${index}`,
    slug: `general-${index}`,
    category: 'economy',
    publishedAt: new Date(Date.UTC(2026, 8, 13 - index, 12)),
  }));
  const source = {
    getPublishedNewsArticleBySlug: async () => article,
    listPublishedNews: async (options?: { category?: NewsCategory }): Promise<NewsPageResult> => ({
      articles: options?.category ? [article, deepCategoryMatch] : generalPage,
      nextCursor: null,
    }),
  };
  const controller = createNewsArticleController(source);

  await controller.load('current');

  assert.deepEqual(
    controller.getSnapshot().relatedArticles.map((item) => item.id),
    ['deep-category-match', 'general-0', 'general-1'],
  );
});

test('a slug change synchronously hides the previous article snapshot', async () => {
  const { selectNewsArticleRouteState } = await import('../components/news/useNewsArticle');
  const previousArticle = makeNewsArticleFixture({ id: 'previous', slug: 'previous' });
  const previousState = {
    slug: 'previous',
    snapshot: {
      article: previousArticle,
      relatedArticles: [] as NewsArticle[],
      loading: false,
      notFound: false,
      error: null,
    },
  };

  assert.equal(selectNewsArticleRouteState('previous', previousState).article?.slug, 'previous');
  const nextRouteState = selectNewsArticleRouteState('next', previousState);
  assert.equal(nextRouteState.loading, true);
  assert.equal(nextRouteState.article, null);
  assert.deepEqual(nextRouteState.relatedArticles, []);
});

test('article stylesheet defines a readable two-column reader with responsive ad order', async () => {
  const source = await readFile(new URL('../pages/NewsPage.css', import.meta.url), 'utf8');
  assert.match(source, /\.news-article__layout\s*\{[^}]*grid-template-columns:/s);
  assert.match(source, /\.news-article__body\s*\{[^}]*max-width:/s);
  assert.match(source, /@media \(max-width: 900px\)[\s\S]*\.news-article__layout\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
});

test('NewsArticle structured data uses the published story fields', async () => {
  const { default: StructuredData } = await import('../components/StructuredData');
  const markup = renderToStaticMarkup(
    <StructuredData
      type="newsArticle"
      headline="Policy week comes into view"
      description="The forces shaping the week."
      image="https://images.example.com/policy.jpg"
      authorName="Ta7leel Editorial"
      datePublished="2026-09-13T12:00:00.000Z"
      dateModified="2026-09-14T12:00:00.000Z"
      mainEntityOfPage="https://www.ta7leel.pro/news/policy-week/"
    />,
  );

  assert.match(markup, /&quot;@type&quot;:&quot;NewsArticle&quot;/);
  assert.match(markup, /&quot;inLanguage&quot;:&quot;en&quot;/);
  assert.match(markup, /&quot;mainEntityOfPage&quot;:&quot;https:\/\/www\.ta7leel\.pro\/news\/policy-week\/&quot;/);
});

test('article page configures NewsArticle structured data and article Open Graph fields', async () => {
  const source = await readFile(new URL('../pages/NewsArticlePage.tsx', import.meta.url), 'utf8');
  assert.match(source, /NewsArticle/);
  assert.match(source, /datePublished/);
  assert.match(source, /mainEntityOfPage/);
  assert.match(source, /type:\s*'article'/);
  assert.match(source, /publishedTime/);
  assert.match(source, /modifiedTime/);
  assert.match(source, /state\.notFound[^]*<NotFoundPage\s*\/>/);
});

test('application routes exact news index before the lazy article slug page', async () => {
  const source = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const indexRoute = source.indexOf('path="/news"');
  const articleRoute = source.indexOf('path="/news/:slug"');
  assert.ok(indexRoute >= 0);
  assert.ok(articleRoute > indexRoute);
  assert.match(source, /import\('\.\/pages\/NewsArticlePage'\)/);
});
