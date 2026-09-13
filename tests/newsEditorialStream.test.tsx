import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';

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
  assert.doesNotMatch(markup, /<iframe|<script/);
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
