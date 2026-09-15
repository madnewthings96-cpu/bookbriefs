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
import {
  assertNewsArticleTransition,
  createNewsCursor,
  NewsRepositoryError,
  normalizeNewsDocument,
  resolvePublicNewsReference,
} from '../components/news/newsRepository';

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

test('source validation requires the literal https:// URL prefix', () => {
  const draft = makeNewsArticleFixture({
    sources: [{ label: 'Malformed secure URL', url: 'https:example.com' }],
  });
  assert.equal(validateNewsDraft(draft, 'publish').sources, 'Sources need a label and an https:// URL.');
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

test('normalizeNewsDocument rejects malformed categories', () => {
  assert.equal(normalizeNewsDocument('bad', { category: 'sports' }), null);
});

test('normalizeNewsDocument converts valid timestamps and rejects each malformed timestamp', () => {
  const fixture = makeNewsArticleFixture({ id: 'converted-story' });
  const timestamp = (value: string) => ({ toDate: () => new Date(value) });
  const stored = {
    ...fixture,
    id: undefined,
    createdAt: timestamp('2026-09-10T10:00:00.000Z'),
    updatedAt: timestamp('2026-09-11T11:00:00.000Z'),
    publishedAt: timestamp('2026-09-12T12:00:00.000Z'),
  };

  const normalized = normalizeNewsDocument('converted-story', stored);
  assert.equal(normalized?.createdAt.toISOString(), '2026-09-10T10:00:00.000Z');
  assert.equal(normalized?.updatedAt.toISOString(), '2026-09-11T11:00:00.000Z');
  assert.equal(normalized?.publishedAt?.toISOString(), '2026-09-12T12:00:00.000Z');
  assert.equal(normalizeNewsDocument('bad-created', { ...stored, createdAt: 'now' }), null);
  assert.equal(normalizeNewsDocument('bad-updated', { ...stored, updatedAt: 'now' }), null);
  assert.equal(normalizeNewsDocument('bad-published', { ...stored, publishedAt: 'now' }), null);
  assert.equal(normalizeNewsDocument('invalid-created-date', {
    ...stored,
    createdAt: { toDate: () => new Date('invalid') },
  }), null);
  assert.equal(normalizeNewsDocument('invalid-updated-value', {
    ...stored,
    updatedAt: { toDate: () => 'not-a-date' },
  }), null);
  assert.equal(normalizeNewsDocument('throwing-published-converter', {
    ...stored,
    publishedAt: { toDate: () => { throw new Error('malformed timestamp'); } },
  }), null);
});

test('public reference reads normalize rule-hidden records without swallowing other failures', async () => {
  assert.equal(
    await resolvePublicNewsReference(async () => {
      throw { code: 'permission-denied' };
    }),
    null,
  );

  await assert.rejects(
    resolvePublicNewsReference(async () => {
      throw { code: 'unavailable' };
    }),
    (error: unknown) => error instanceof NewsRepositoryError && error.code === 'offline',
  );
});

test('cursor serialization preserves publication time and id', () => {
  const cursor = createNewsCursor(makeNewsArticleFixture({
    id: 'story-1',
    publishedAt: new Date('2026-09-13T10:00:00.000Z'),
  }));
  assert.deepEqual(cursor, {
    id: 'story-1',
    publishedAt: new Date('2026-09-13T10:00:00.000Z'),
  });
});

test('article slugs remain immutable after the first publication for draft saves and publishing', () => {
  const previouslyPublishedDraft = {
    status: 'draft',
    slug: 'original-route',
    publishedAt: new Date('2026-09-13T10:00:00.000Z'),
  };

  for (const operation of ['save', 'publish'] as const) {
    assert.throws(
      () => assertNewsArticleTransition(previouslyPublishedDraft, { slug: 'changed-route' }, operation),
      (error: unknown) => error instanceof NewsRepositoryError && error.code === 'validation',
    );
  }
});

test('draft saves reject a record that became published while allowing an unpublished draft with its original slug', () => {
  assert.throws(
    () => assertNewsArticleTransition({ status: 'published', slug: 'stable-route', publishedAt: new Date('2026-09-13T10:00:00.000Z') }, { slug: 'stable-route' }, 'save'),
    (error: unknown) => error instanceof NewsRepositoryError && error.code === 'conflict',
  );
  assert.doesNotThrow(() => assertNewsArticleTransition(
    { status: 'draft', slug: 'stable-route', publishedAt: new Date('2026-09-13T10:00:00.000Z') },
    { slug: 'stable-route' },
    'save',
  ));
});
