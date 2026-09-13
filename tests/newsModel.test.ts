import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createEmptyNewsDraft,
  formatNewsDate,
  selectFeaturedArticle,
  selectRelatedArticles,
  slugifyNewsTitle,
  validateNewsDraft,
} from '../components/news/newsModel';
import { getSampleNewsDraft, makeNewsArticleFixture } from '../components/news/newsFixtures';

test('slugifyNewsTitle produces a stable ASCII route segment', () => {
  assert.equal(slugifyNewsTitle('Dollar Outlook: What Changes Next?'), 'dollar-outlook-what-changes-next');
  assert.equal(slugifyNewsTitle('  Café / EUR & USD  '), 'cafe-eur-usd');
  assert.ok(slugifyNewsTitle('x'.repeat(140)).length <= 100);
});

test('createEmptyNewsDraft returns a saveable draft shape', () => {
  assert.deepEqual(createEmptyNewsDraft(), {
    id: '', title: '', slug: '', excerpt: '', body: '', category: 'markets', language: 'en',
    authorName: '', imageUrl: '', imagePath: '', imageAlt: '', sources: [], status: 'draft',
    createdAt: null, updatedAt: null, publishedAt: null,
  });
});

test('draft validation allows partial editorial and image fields', () => {
  const errors = validateNewsDraft({ ...createEmptyNewsDraft(), title: 'A draft title' }, 'draft');
  assert.deepEqual(errors, {});
});

test('publish validation requires complete editorial and image fields', () => {
  const errors = validateNewsDraft({
    id: 'draft-1', title: 'Weekly outlook', slug: 'weekly-outlook', excerpt: '', body: '',
    category: 'markets', language: 'en', authorName: '', imageUrl: '', imagePath: '', imageAlt: '',
    sources: [], status: 'draft', createdAt: null, updatedAt: null, publishedAt: null,
  }, 'publish');
  assert.deepEqual(Object.keys(errors).sort(), ['authorName', 'body', 'excerpt', 'imageAlt', 'imageUrl']);
});

test('validation enforces field lengths, slug syntax, and secure source URLs', () => {
  const draft = makeNewsArticleFixture({
    title: 't'.repeat(141), excerpt: 'e'.repeat(241), authorName: 'a'.repeat(81),
    imageAlt: 'i'.repeat(181), body: 'b'.repeat(100001), slug: 'Bad Slug',
    sources: [{ label: 'l'.repeat(121), url: 'http://example.com' }],
  });
  const errors = validateNewsDraft(draft, 'publish');
  assert.deepEqual(Object.keys(errors).sort(), ['authorName', 'body', 'excerpt', 'imageAlt', 'slug', 'sources', 'title']);
});

test('featured selection honors a published configured article and falls back by publication date', () => {
  const newest = makeNewsArticleFixture({ id: 'new', publishedAt: new Date('2026-09-13') });
  const old = makeNewsArticleFixture({ id: 'old', publishedAt: new Date('2026-09-06') });
  assert.equal(selectFeaturedArticle([newest, old], 'old')?.id, 'old');
  assert.equal(selectFeaturedArticle([old, newest], 'missing')?.id, 'new');
  assert.equal(selectFeaturedArticle([], null), undefined);
});

test('related stories prefer the current category, then newest publication date', () => {
  const current = makeNewsArticleFixture({ id: 'current', publishedAt: new Date('2026-09-13'), category: 'forex' });
  const related = selectRelatedArticles(current, [
    current,
    makeNewsArticleFixture({ id: 'fx-old', publishedAt: new Date('2026-09-10'), category: 'forex' }),
    makeNewsArticleFixture({ id: 'macro-new', publishedAt: new Date('2026-09-12'), category: 'economy' }),
    makeNewsArticleFixture({ id: 'fx-new', publishedAt: new Date('2026-09-11'), category: 'forex' }),
  ], 3);
  assert.deepEqual(related.map((item) => item.id), ['fx-new', 'fx-old', 'macro-new']);
});

test('formatNewsDate uses a stable readable English date', () => {
  assert.equal(formatNewsDate(new Date('2026-09-13T15:30:00.000Z')), 'September 13, 2026');
});

test('fixture defaults to a valid published article and sample draft is isolated development data', () => {
  const fixture = makeNewsArticleFixture();
  assert.equal(fixture.status, 'published');
  assert.ok(fixture.createdAt instanceof Date);
  assert.ok(fixture.updatedAt instanceof Date);
  assert.ok(fixture.publishedAt instanceof Date);

  const sample = getSampleNewsDraft();
  assert.equal(sample.status, 'draft');
  assert.match(sample.id, /^sample-/);
  assert.equal(Object.isFrozen(sample), true);
});
