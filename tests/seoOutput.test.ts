import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadBookCatalog, getCanonicalBookSlug } from '../scripts/seoCatalog';
import { blogPosts } from '../components/blog/blogContent';

const read = (path: string) => readFile(path, 'utf8');
test('built articles contain real content, one canonical and no invented language alternates', async () => {
  for (const post of blogPosts) {
    const html = await read(`dist/blog/${post.slug}/index.html`);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(post.title.replace(/&/g, '&amp;')));
    assert.doesNotMatch(html, /hreflang|\?lang=en/);
    assert.ok(html.length > 10000);
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  }
});
test('every catalog book is discoverable without JavaScript and metadata reflects English reader', async () => {
  const library = await read('dist/summaries/index.html');
  for (const book of await loadBookCatalog()) {
    const slug = getCanonicalBookSlug(book);
    assert.ok(library.includes(`/summary/${slug}`), book.id);
    const html = await read(`dist/summary/${slug}/index.html`);
    assert.match(html, /<html lang="en" dir="ltr">/);
    assert.doesNotMatch(html, /https:\/\/www.ta7leel.prohttps/);
    assert.doesNotMatch(html, /href="\/categories\/(biography|economics|leadership|sociology|science fiction)-books/);
  }
});
test('sitemaps exclude duplicate library aliases and include every article', async () => {
  const xml = await read('dist/sitemap.xml');
  assert.doesNotMatch(xml, /<loc>[^<]*\/book-summaries\//);
  for (const post of blogPosts) assert.ok(xml.includes(new URL(`/blog/${post.slug}/`, 'https://www.ta7leel.pro').href), post.slug);
});
test('unknown pages and private pages have crawlable noindex responses configured', async () => {
  const config = await read('netlify.toml');
  assert.match(config, /to = "\/404.html"\s+status = 404/);
  const html = await read('dist/404.html');
  assert.match(html, /noindex, follow/);
  const login = await read('dist/login/index.html');
  assert.match(login, /noindex, follow/);
  const robots = await read('dist/robots.txt');
  assert.doesNotMatch(robots, /User-agent: Googlebot|Disallow: \/login|Disallow: \/pdfs/);
});

test('every sitemap URL has static HTML or an explicit server route', async () => {
  const xml = await read('dist/sitemap.xml');
  const config = await read('netlify.toml');
  const explicitRoutes = config.split('[[redirects]]').slice(1)
    .filter(block => /status\s*=\s*200\b/.test(block))
    .map(block => block.match(/from\s*=\s*"([^"]+)"/)?.[1]);
  for (const [, location] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = decodeURIComponent(new URL(location).pathname).replace(/\/$/, '');
    try {
      await read(`dist${pathname}/index.html`);
    } catch {
      assert.ok(explicitRoutes.includes(pathname), `Sitemap URL has no deployable route: ${pathname}`);
    }
  }
});

test('Ideas in the Wild serves its real content, metadata and styles before JavaScript', async () => {
  const html = await read('dist/connections/index.html');
  assert.match(html, /<title>Ideas in the Wild - See the World Through Books \| Ta7leel<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www.ta7leel.pro\/connections\/"/);
  assert.match(html, /id="connection-library"/);
  assert.match(html, /href="\/summary\/atomic-habits"/);
  assert.match(html, /Why market fear travels faster than fundamentals/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/IdeasInTheWildPage-[^"]+\.css"/);
  assert.doesNotMatch(html, /noindex/);
});
