import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';
import { NEWS_PAGE_SIZE, type NewsArticle } from '../components/news/newsModel';
import {
  NewsRepositoryError,
  type NewsCursor,
  type NewsPageResult,
} from '../components/news/newsRepository';

const articles = [
  makeNewsArticleFixture({
    id: 'latest',
    slug: 'latest-dollar-outlook',
    title: 'Dollar steadies before the policy week',
    category: 'forex',
    publishedAt: new Date('2026-09-13T12:00:00.000Z'),
  }),
  makeNewsArticleFixture({
    id: 'lead',
    slug: 'featured-market-map',
    title: 'The market map for the week ahead',
    category: 'markets',
    publishedAt: new Date('2026-09-10T12:00:00.000Z'),
  }),
  makeNewsArticleFixture({
    id: 'third',
    slug: 'inflation-pulse',
    title: 'Inflation data returns to focus',
    category: 'economy',
    publishedAt: new Date('2026-09-11T12:00:00.000Z'),
  }),
  makeNewsArticleFixture({
    id: 'fourth',
    slug: 'bitcoin-range',
    title: 'Bitcoin holds its weekly range',
    category: 'crypto',
    publishedAt: new Date('2026-09-09T12:00:00.000Z'),
  }),
];

const renderStream = async (overrides: Record<string, unknown> = {}) => {
  const { NewsEditorialStream } = await import('../components/news/NewsEditorialStream');
  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: '/news' },
      React.createElement(NewsEditorialStream, {
        articles,
        featuredArticleId: 'lead',
        activeCategory: 'all',
        hasMore: true,
        loadingMore: false,
        onCategoryChange: () => undefined,
        onLoadMore: () => undefined,
        ...overrides,
      }),
    ),
  );
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
};

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

test('news index resets on category change and ignores the stale category response', async () => {
  const { createNewsIndexController } = await import('../components/news/useNewsIndex');
  const allRequest = deferred<NewsPageResult>();
  const forexRequest = deferred<NewsPageResult>();
  const source = {
    listPublishedNews: ({ category }: { category?: string }) => (
      category === 'forex' ? forexRequest.promise : allRequest.promise
    ),
    getFeaturedNewsArticleId: async () => null,
    getPublishedNewsArticle: async () => null,
  };
  const controller = createNewsIndexController('all', source);

  controller.setCategory('all');
  controller.setCategory('forex');
  assert.deepEqual(controller.getSnapshot().articles, []);
  assert.equal(controller.getSnapshot().loading, true);

  const forexArticle = makeNewsArticleFixture({ id: 'forex-story', category: 'forex' });
  forexRequest.resolve({ articles: [forexArticle], nextCursor: null });
  await flushPromises();
  assert.deepEqual(controller.getSnapshot().articles.map((article) => article.id), ['forex-story']);

  allRequest.resolve({ articles: [makeNewsArticleFixture({ id: 'stale-story' })], nextCursor: null });
  await flushPromises();
  assert.deepEqual(controller.getSnapshot().articles.map((article) => article.id), ['forex-story']);
  controller.cancel();
});

test('news index retains loaded stories when pagination fails and retry resumes from the cursor', async () => {
  const { createNewsIndexController } = await import('../components/news/useNewsIndex');
  const firstPage = Array.from({ length: NEWS_PAGE_SIZE }, (_, index) => (
    makeNewsArticleFixture({ id: `story-${index}` })
  ));
  const cursor: NewsCursor = { id: 'story-9', publishedAt: new Date('2026-09-01T00:00:00.000Z') };
  let requestCount = 0;
  const seenCursors: Array<NewsCursor | null | undefined> = [];
  const source = {
    listPublishedNews: async ({ cursor: requestedCursor }: { cursor?: NewsCursor | null } = {}) => {
      seenCursors.push(requestedCursor);
      requestCount += 1;
      if (requestCount === 1) return { articles: firstPage, nextCursor: cursor };
      if (requestCount === 2) throw new Error('offline');
      return {
        articles: [makeNewsArticleFixture({ id: 'story-10' })],
        nextCursor: null,
      };
    },
    getFeaturedNewsArticleId: async () => null,
    getPublishedNewsArticle: async () => null,
  };
  const controller = createNewsIndexController('all', source);

  controller.setCategory('all');
  await flushPromises();
  assert.equal(controller.getSnapshot().hasMore, true);

  await controller.loadMore();
  assert.deepEqual(controller.getSnapshot().articles.map((article) => article.id), firstPage.map((article) => article.id));
  assert.match(controller.getSnapshot().error || '', /temporarily unavailable/i);

  await controller.retry();
  assert.equal(controller.getSnapshot().articles.length, NEWS_PAGE_SIZE + 1);
  assert.equal(controller.getSnapshot().error, null);
  assert.equal(controller.getSnapshot().hasMore, false);
  assert.deepEqual(seenCursors.slice(1), [cursor, cursor]);
  controller.cancel();
});

test('news index merges an older configured lead without changing the list cursor or duplicating it later', async () => {
  const { createNewsIndexController } = await import('../components/news/useNewsIndex');
  const firstPage = Array.from({ length: NEWS_PAGE_SIZE }, (_, index) => (
    makeNewsArticleFixture({ id: `recent-${index}` })
  ));
  const olderLead = makeNewsArticleFixture({
    id: 'older-lead',
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
  });
  const cursor: NewsCursor = { id: 'recent-9', publishedAt: new Date('2026-09-01T00:00:00.000Z') };
  let page = 0;
  const source = {
    listPublishedNews: async (): Promise<NewsPageResult> => {
      page += 1;
      return page === 1
        ? { articles: firstPage, nextCursor: cursor }
        : { articles: [olderLead, makeNewsArticleFixture({ id: 'later-story' })], nextCursor: null };
    },
    getFeaturedNewsArticleId: async () => 'older-lead',
    getPublishedNewsArticle: async (id: string): Promise<NewsArticle | null> => (
      id === 'older-lead' ? olderLead : null
    ),
  };
  const controller = createNewsIndexController('all', source);

  controller.setCategory('all');
  await flushPromises();
  assert.equal(controller.getSnapshot().featuredArticleId, 'older-lead');
  assert.equal(controller.getSnapshot().articles.length, NEWS_PAGE_SIZE + 1);
  assert.deepEqual(controller.getSnapshot().cursor, cursor);

  await controller.loadMore();
  assert.equal(
    controller.getSnapshot().articles.filter((article) => article.id === 'older-lead').length,
    1,
  );
  assert.match(controller.getSnapshot().articles.map((article) => article.id).join(','), /later-story/);
  controller.cancel();
});

test('news index keeps the published feed when a stale featured reference is rule-hidden', async () => {
  const { createNewsIndexController } = await import('../components/news/useNewsIndex');
  const newest = makeNewsArticleFixture({ id: 'newest', slug: 'newest' });
  const source = {
    listPublishedNews: async (): Promise<NewsPageResult> => ({ articles: [newest], nextCursor: null }),
    getFeaturedNewsArticleId: async (): Promise<string | null> => {
      throw new NewsRepositoryError('permission', 'The configured article is no longer public.');
    },
    getPublishedNewsArticle: async (): Promise<NewsArticle | null> => null,
  };
  const controller = createNewsIndexController('all', source);

  controller.setCategory('all');
  await flushPromises();

  assert.deepEqual(controller.getSnapshot().articles.map((article) => article.id), ['newest']);
  assert.equal(controller.getSnapshot().featuredArticleId, null);
  assert.equal(controller.getSnapshot().error, null);
  controller.cancel();
});

test('news index still reports unexpected featured configuration failures', async () => {
  const { createNewsIndexController } = await import('../components/news/useNewsIndex');
  const source = {
    listPublishedNews: async (): Promise<NewsPageResult> => ({
      articles: [makeNewsArticleFixture({ id: 'newest' })],
      nextCursor: null,
    }),
    getFeaturedNewsArticleId: async (): Promise<string | null> => {
      throw new Error('unexpected config failure');
    },
    getPublishedNewsArticle: async (): Promise<NewsArticle | null> => null,
  };
  const controller = createNewsIndexController('all', source);

  controller.setCategory('all');
  await flushPromises();

  assert.deepEqual(controller.getSnapshot().articles, []);
  assert.match(controller.getSnapshot().error || '', /temporarily unavailable/i);
  controller.cancel();
});

test('news page exposes calm loading, empty, and retry states', async () => {
  const source = await readFile(new URL('../pages/NewsPage.tsx', import.meta.url), 'utf8');

  assert.match(source, /NewsEditorialStream/);
  assert.match(source, /The next weekly briefing is being prepared/);
  assert.match(source, />Retry</);
  assert.doesNotMatch(source, /mountEconomicCalendarWidget|marketBriefs|signalItems/);
});

test('repository news runtime no longer references the MQL5 calendar', async () => {
  const app = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const page = await readFile(new URL('../pages/NewsPage.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(
    `${app}\n${page}`,
    /MQL5|tradays|economicCalendarWidget|newsCalendarWidget/i,
  );
});

test('editorial stream renders one lead, chronological cards, filters, and one ad rail', async () => {
  const markup = await renderStream();

  assert.equal((markup.match(/class="news-lead"/g) || []).length, 1);
  assert.match(markup, /<nav[^>]*aria-label="News categories"/);
  assert.match(markup, /<button[^>]*aria-pressed="true"[^>]*>All<\/button>/);
  assert.match(markup, />Markets<\/button>/);
  assert.match(markup, />Forex<\/button>/);
  assert.match(markup, />Economy<\/button>/);
  assert.match(markup, />Crypto<\/button>/);
  assert.equal((markup.match(/aria-label="Advertisements"/g) || []).length, 1);
  assert.match(markup, />Load more<\/button>/);
  assert.doesNotMatch(markup, /economicCalendarWidget|MQL5/);

  const latest = markup.indexOf('Dollar steadies before the policy week');
  const economy = markup.indexOf('Inflation data returns to focus');
  const crypto = markup.indexOf('Bitcoin holds its weekly range');
  assert.ok(latest < economy && economy < crypto, 'non-featured stories are newest first');
  assert.ok(crypto < markup.indexOf('aria-label="Advertisements"'), 'the ad follows the first three stream cards');
});

test('every story is a discoverable link with publication metadata and intentional image loading', async () => {
  const markup = await renderStream();

  assert.match(markup, /href="\/news\/featured-market-map"/);
  assert.match(markup, /href="\/news\/latest-dollar-outlook"/);
  assert.equal((markup.match(/class="news-story-meta"/g) || []).length, 4);
  assert.equal((markup.match(/<time dateTime="2026-09-/g) || []).length, 5);
  assert.match(markup, /class="news-lead__image"[^>]*loading="eager"/);
  assert.match(markup, /class="news-card__image"[^>]*loading="lazy"/);
});

test('stream reflects category and pagination state without hiding its controls', async () => {
  const markup = await renderStream({ activeCategory: 'forex', loadingMore: true });

  assert.match(markup, /<button[^>]*aria-pressed="true"[^>]*>Forex<\/button>/);
  assert.match(markup, /<button[^>]*class="news-load-more"[^>]*disabled=""[^>]*>Loading more…<\/button>/);
});

test('short streams keep one advertisement after every available card', async () => {
  const markup = await renderStream({ articles: articles.slice(0, 3) });

  assert.equal((markup.match(/aria-label="Advertisements"/g) || []).length, 1);
  assert.ok(
    markup.indexOf('Inflation data returns to focus') < markup.indexOf('aria-label="Advertisements"'),
    'the ad follows both available non-featured cards',
  );
});

test('a stream without cards keeps its advertisement after the lead or empty state', async () => {
  const leadOnlyMarkup = await renderStream({ articles: [articles[1]] });
  const emptyMarkup = await renderStream({ articles: [] });

  assert.equal((leadOnlyMarkup.match(/aria-label="Advertisements"/g) || []).length, 1);
  assert.ok(
    leadOnlyMarkup.indexOf('The market map for the week ahead') < leadOnlyMarkup.indexOf('aria-label="Advertisements"'),
    'the ad follows the lead when no cards exist',
  );
  assert.equal((emptyMarkup.match(/aria-label="Advertisements"/g) || []).length, 1);
  assert.ok(
    emptyMarkup.indexOf('The next weekly briefing is being prepared.') < emptyMarkup.indexOf('aria-label="Advertisements"'),
    'the ad follows the empty state when no stories exist',
  );
});

test('AdSense configuration requires both identifiers and reserves an honest fallback', async () => {
  const { AdSlot, readAdSenseConfig } = await import('../components/news/AdSlot');

  assert.deepEqual(readAdSenseConfig({
    VITE_ADSENSE_CLIENT_ID: 'ca-pub-123',
    VITE_ADSENSE_NEWS_SLOT_ID: '456',
  }), { client: 'ca-pub-123', slot: '456' });
  assert.deepEqual(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-123' }), { client: '', slot: '' });

  const markup = renderToStaticMarkup(React.createElement(AdSlot, {
    placement: 'news-index',
    config: { client: '', slot: '' },
  }));
  assert.match(markup, /data-configured="false"/);
  assert.match(markup, />Advertisements<\/span>/);
  assert.doesNotMatch(markup, /adsbygoogle|<iframe|<script/);
});

test('editorial stylesheet keeps the single ad node responsive, stable, and accessible', async () => {
  const styles = await readFile(new URL('../pages/NewsPage.css', import.meta.url), 'utf8');

  assert.match(styles, /--news-forest:\s*#12382b/i);
  assert.match(styles, /--news-brass:\s*#c89a49/i);
  assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(260px,\s*300px\)/i);
  assert.match(styles, /min-height:\s*250px/i);
  assert.match(styles, /min-width:\s*300px/i);
  assert.match(styles, /\.news-ad\s*\{[^}]*position:\s*absolute/i);
  assert.match(styles, /\.news-ad\s*\{[^}]*inset-block:\s*0/i);
  assert.match(styles, /\.news-ad__sticky\s*\{[^}]*position:\s*sticky/i);
  assert.doesNotMatch(styles, /\.news-ad\s*\{[^}]*grid-row:\s*1/i);
  assert.match(styles, /@media\s*\(max-width:\s*900px\)/i);
  assert.match(styles, /@media\s*\(max-width:\s*720px\)/i);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /:focus-visible/);
  assert.doesNotMatch(styles, /transition:\s*all/i);
  assert.doesNotMatch(styles, /\.market-|economicCalendarWidget|MQL5/i);
});
