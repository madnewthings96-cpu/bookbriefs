import assert from 'node:assert/strict';
import test from 'node:test';
import type { BlogPost } from '../components/blog/blogPageModel';

const posts: BlogPost[] = [
  {
    id: 1,
    title: 'Trading with patience',
    excerpt: 'A patient process.',
    category: 'Trading',
    date: '2026-03-01',
    readTime: '8 min read',
    imageUrl: '/trading.jpg',
    tags: ['discipline'],
    slug: 'trading-with-patience',
  },
  {
    id: 2,
    title: 'هامش الأمان في الاستثمار',
    excerpt: 'كيف تحمي رأس المال.',
    category: 'الاستثمار',
    date: '2026-02-01',
    readTime: '12 دقيقة قراءة',
    imageUrl: '/investing.jpg',
    tags: ['عربي'],
    slug: 'arabic-investing',
  },
  {
    id: 3,
    title: 'A practical risk checklist',
    excerpt: 'Questions to ask before entering.',
    category: 'Trading',
    date: '2026-01-01',
    readTime: '10 min read',
    imageUrl: '/risk.jpg',
    tags: ['risk'],
    slug: 'risk-checklist',
  },
  {
    id: 4,
    title: 'Reading for retention',
    excerpt: 'Remember what matters.',
    category: 'Reading',
    date: '2025-12-01',
    readTime: '6 min read',
    imageUrl: '/reading.jpg',
    tags: ['books'],
    slug: 'reading-for-retention',
  },
];

test('blog discovery preserves category order and filters without mutating the source collection', async () => {
  const { filterBlogPosts, getBlogCategories } = await import('../components/blog/blogPageModel');

  assert.deepEqual(getBlogCategories(posts), ['All', 'Trading', 'الاستثمار', 'Reading']);
  assert.deepEqual(filterBlogPosts(posts, 'Trading').map((post) => post.id), [1, 3]);
  assert.deepEqual(filterBlogPosts(posts, 'All').map((post) => post.id), [1, 2, 3, 4]);
  assert.deepEqual(posts.map((post) => post.id), [1, 2, 3, 4]);
});

test('article direction follows Arabic content instead of the interface language', async () => {
  const { getBlogPostDirection } = await import('../components/blog/blogPageModel');

  assert.equal(getBlogPostDirection(posts[0]), 'ltr');
  assert.equal(getBlogPostDirection(posts[1]), 'rtl');
});

test('related reading prioritizes the current topic before other recent essays', async () => {
  const { getRelatedBlogPosts } = await import('../components/blog/blogPageModel');

  assert.deepEqual(getRelatedBlogPosts(posts, posts[0], 3).map((post) => post.id), [3, 2, 4]);
});

test('reading progress reflects the readable article distance and clamps at both ends', async () => {
  const { calculateReadingProgress } = await import('../components/blog/blogPageModel');

  assert.equal(calculateReadingProgress(50, 100, 1_100, 400), 0);
  assert.equal(calculateReadingProgress(450, 100, 1_100, 400), 50);
  assert.equal(calculateReadingProgress(1_000, 100, 1_100, 400), 100);
});

test('legacy article layouts receive semantic classes before inline styles are removed', async () => {
  const { normalizeBlogArticleMarkup } = await import('../components/blog/blogPageModel');
  const legacyMarkup = `
    <div class="article-body" style="color: #222">
      <h2 style="font-size: 30px">Trading with patience</h2>
      <h4 style="font-size: 20px">Opening callout</h4>
      <h3 style="font-size: 24px">First section</h3>
      <h4 style="font-size: 20px">Section detail</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px"><div>A</div><div>B</div></div>
      <div style="display: grid; gap: 14px"><div>Step one</div></div>
      <div style="display: flex; justify-content: center; align-items: center"><span>Diagram</span></div>
    </div>`;

  const normalized = normalizeBlogArticleMarkup(legacyMarkup);

  assert.match(normalized, /class="article-body"/);
  assert.doesNotMatch(normalized, /Trading with patience/);
  assert.match(normalized, /<h2>Opening callout<\/h2>/);
  assert.match(normalized, /<h2>First section<\/h2>/);
  assert.match(normalized, /<h3>Section detail<\/h3>/);
  assert.match(normalized, /class="article-comparison-grid"/);
  assert.match(normalized, /class="article-step-list"/);
  assert.match(normalized, /class="article-diagram"/);
  assert.doesNotMatch(normalized, /style=/);
});

test('share orchestration reports native, clipboard, failure, and cancellation outcomes', async () => {
  const { shareBlogArticle } = await import('../components/blog/blogPageModel');
  const shareData = { title: 'Article', text: 'Excerpt', url: 'https://example.com/blog/article' };

  assert.equal(await shareBlogArticle(shareData, { share: async () => undefined }), 'Shared');
  assert.equal(await shareBlogArticle(shareData, {
    clipboard: { writeText: async () => undefined },
  }), 'Link copied');
  assert.equal(await shareBlogArticle(shareData, {
    clipboard: { writeText: async () => { throw new Error('denied'); } },
  }), 'Copy failed');
  assert.equal(await shareBlogArticle(shareData, {
    share: async () => { throw new DOMException('cancelled', 'AbortError'); },
  }), 'Share');
});

test('library scroll reset waits for two layout frames and can be cancelled', async () => {
  const { scheduleBlogScrollReset } = await import('../components/blog/blogPageModel');
  const queued = new Map<number, FrameRequestCallback>();
  const cancelled: number[] = [];
  const scrollCalls: ScrollToOptions[] = [];
  let nextFrame = 1;
  const viewport = {
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = nextFrame++;
      queued.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => { cancelled.push(id); queued.delete(id); },
    scrollTo: (options: ScrollToOptions) => { scrollCalls.push(options); },
  };

  const cancel = scheduleBlogScrollReset(viewport);
  assert.equal(scrollCalls.length, 0);
  queued.get(1)?.(0);
  assert.equal(scrollCalls.length, 0);
  queued.get(2)?.(0);
  assert.deepEqual(scrollCalls, [{ top: 0, behavior: 'auto' }]);
  cancel();
  assert.deepEqual(cancelled, [1, 2]);
});
