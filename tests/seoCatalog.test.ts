import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { makeNewsArticleFixture } from '../components/news/newsFixtures';
import { loadPublishedNewsCatalog, normalizePublishedNewsDocuments } from '../scripts/newsCatalog';
import {
  buildNewsArticlePage,
  buildNewsIndexPage,
  buildNewsSitemapUrls,
} from '../scripts/newsSeo';
import { renderPage } from '../scripts/prerender-seo';
import { absoluteUrl } from '../scripts/seoCatalog';
import { canonicalRoutePath } from '../utils/seoConfig';

test('absolute URLs preserve remote covers and encode Arabic paths exactly once', () => {
  assert.equal(absoluteUrl('https://www.ta7leel.pro', 'https://example.com/cover.jpg'), 'https://example.com/cover.jpg');
  const encoded = 'https://www.ta7leel.pro/summary/%D9%83%D8%AA%D8%A7%D8%A8/';
  assert.equal(absoluteUrl('https://www.ta7leel.pro', '/summary/كتاب/'), encoded);
  assert.equal(absoluteUrl('https://www.ta7leel.pro', '/summary/%D9%83%D8%AA%D8%A7%D8%A8/'), encoded);
});

test('canonical paths exclude tracking, search and fragment state', () => {
  assert.equal(canonicalRoutePath('/summaries?search=habits#results'), '/summaries/');
  assert.equal(canonicalRoutePath('/book-summaries/'), '/summaries/');
  assert.equal(canonicalRoutePath('/'), '/');
});

test('news sitemap records use canonical article paths and updated dates', () => {
  const urls = buildNewsSitemapUrls([
    { slug: 'weekly-outlook', updatedAt: new Date('2026-09-13T22:45:00.000Z') },
  ]);

  assert.deepEqual(urls, [{
    path: '/news/weekly-outlook',
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: '2026-09-13',
  }]);
});

test('news catalog normalization rejects drafts and orders valid records newest first', () => {
  const base = makeNewsArticleFixture();
  const timestamp = (value: string) => ({ toDate: () => new Date(value) });
  const documents = [
    {
      id: 'older',
      data: {
        ...base,
        id: undefined,
        slug: 'older-story',
        publishedAt: timestamp('2026-09-10T12:00:00.000Z'),
        updatedAt: timestamp('2026-09-11T12:00:00.000Z'),
        createdAt: timestamp('2026-09-09T12:00:00.000Z'),
      },
    },
    {
      id: 'draft',
      data: { ...base, id: undefined, status: 'draft' },
    },
    {
      id: 'malformed-timestamp',
      data: {
        ...base,
        id: undefined,
        createdAt: { toDate: () => { throw new Error('malformed timestamp'); } },
      },
    },
    {
      id: 'newer',
      data: {
        ...base,
        id: undefined,
        slug: 'newer-story',
        publishedAt: timestamp('2026-09-13T12:00:00.000Z'),
        updatedAt: timestamp('2026-09-13T13:00:00.000Z'),
        createdAt: timestamp('2026-09-12T12:00:00.000Z'),
      },
    },
  ];

  assert.deepEqual(
    normalizePublishedNewsDocuments(documents).map((article) => article.id),
    ['newer', 'older'],
  );
});

test('news catalog falls back safely when Firebase build variables are unavailable', async () => {
  const warnings: string[] = [];
  const articles = await loadPublishedNewsCatalog({
    environment: {},
    warn: (message) => warnings.push(message),
  });

  assert.deepEqual(articles, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /news catalog/i);
});

test('required news catalog failures explain how to configure the build', async () => {
  await assert.rejects(
    loadPublishedNewsCatalog({ environment: { NEWS_CATALOG_REQUIRED: 'true' } }),
    /VITE_FIREBASE_API_KEY.*VITE_FIREBASE_PROJECT_ID.*VITE_FIREBASE_APP_ID/,
  );
});

test('Netlify production builds require the news catalog while local builds default to fallback', async () => {
  const [netlify, environmentTemplate] = await Promise.all([
    readFile(new URL('../netlify.toml', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  ]);
  const productionEnvironment = netlify.match(/\[context\.production\.environment\]([\s\S]*?)(?=\n\[[^\n]+\]|$)/)?.[1] ?? '';

  assert.match(productionEnvironment, /^\s*NEWS_CATALOG_REQUIRED\s*=\s*"true"\s*$/m);
  assert.match(environmentTemplate, /^NEWS_CATALOG_REQUIRED=false$/m);
  assert.match(environmentTemplate, /production builds must set this to true/i);
});

test('news article fallback includes escaped crawlable copy and NewsArticle schema', () => {
  const article = makeNewsArticleFixture({
    slug: 'weekly-outlook',
    body: '## Rates & growth\n\n<script>alert("unsafe")</script> remains visible.',
  });
  const page = buildNewsArticlePage(article);

  assert.match(page.body, /<article>/);
  assert.match(page.body, /<h3>Rates &amp; growth<\/h3>/);
  assert.match(page.body, /&lt;script&gt;alert\(&quot;unsafe&quot;\)&lt;\/script&gt; remains visible\./);
  assert.doesNotMatch(page.body, /<script>alert/);
  assert.equal(page.schema[0]['@type'], 'NewsArticle');
  assert.equal(page.schema[0].inLanguage, 'en');
  assert.deepEqual(page.schema[0].author, { '@type': 'Person', name: article.authorName });
  assert.equal(page.schema[0].mainEntityOfPage, 'https://www.ta7leel.pro/news/weekly-outlook/');
  assert.equal(page.path, '/news/weekly-outlook');
});

test('news article fallback parses body headings line by line without creating another h1', () => {
  const page = buildNewsArticlePage(makeNewsArticleFixture({
    body: '# Body title\nFollowing body line.\n\n## Section\nSection copy.\n\n###### Deep section',
  }));

  assert.equal((page.body.match(/<h1>/g) || []).length, 1);
  assert.match(page.body, /<h3>Body title<\/h3>\n<p>Following body line\.<\/p>/);
  assert.match(page.body, /<h3>Section<\/h3>\n<p>Section copy\.<\/p>/);
  assert.match(page.body, /<h6>Deep section<\/h6>/);
});

test('news article prerender metadata matches the runtime article fields', () => {
  const excerpt = `${'Detailed market context. '.repeat(8)}End.`;
  const article = makeNewsArticleFixture({ excerpt });
  const page = buildNewsArticlePage(article);
  const template = '<!doctype html><html><head><title>Old</title><meta name="author" content="Old" /></head><body><div id="root"></div></body></html>';
  const html = renderPage(template, page);

  assert.equal(page.description, excerpt);
  assert.equal(page.type, 'article');
  assert.equal(page.author, article.authorName);
  assert.equal(page.publishedTime, article.publishedAt.toISOString());
  assert.equal(page.modifiedTime, article.updatedAt.toISOString());
  assert.match(html, new RegExp(`<meta name="description" content="${excerpt.replaceAll('.', '\\.')}" />`));
  assert.match(html, new RegExp(`<meta property="og:description" content="${excerpt.replaceAll('.', '\\.')}" />`));
  assert.match(html, new RegExp(`<meta name="twitter:description" content="${excerpt.replaceAll('.', '\\.')}" />`));
  assert.match(html, /<meta property="og:type" content="article" \/>/);
  assert.match(html, new RegExp(`<meta name="author" content="${article.authorName}" />`));
  assert.match(html, new RegExp(`<meta property="article:published_time" content="${article.publishedAt.toISOString().replaceAll('.', '\\.')}" />`));
  assert.match(html, new RegExp(`<meta property="article:modified_time" content="${article.updatedAt.toISOString().replaceAll('.', '\\.')}" />`));
  assert.match(html, new RegExp(`<meta property="article:author" content="${article.authorName}" />`));
});

test('news index fallback exposes article links and escapes Firestore text', () => {
  const page = buildNewsIndexPage([
    makeNewsArticleFixture({
      slug: 'weekly-outlook',
      title: 'Rates <script> & currencies',
      excerpt: 'What central banks signal next.',
    }),
  ]);

  assert.match(page.body, /href="\/news\/weekly-outlook\/"/);
  assert.match(page.body, /Rates &lt;script&gt; &amp; currencies/);
  assert.doesNotMatch(page.body, /Rates <script>/);
  assert.equal(page.schema[0]['@type'], 'CollectionPage');
});
