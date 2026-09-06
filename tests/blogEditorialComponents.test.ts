import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { BlogPost } from '../components/blog/blogPageModel';

const arabicPost: BlogPost = {
  id: 7,
  title: 'فن الاستثمار الهادئ',
  excerpt: 'قرارات أفضل على المدى الطويل.',
  category: 'الاستثمار',
  date: '2026-04-05',
  readTime: '14 دقيقة قراءة',
  imageUrl: '/essay.jpg',
  tags: ['عربي'],
  slug: 'calm-investing',
};

test('blog library exposes its topic filter as a named, stateful navigation control', async () => {
  const { default: BlogLibrary } = await import('../components/blog/BlogLibrary');
  const markup = renderToStaticMarkup(React.createElement(BlogLibrary, {
    posts: [arabicPost],
    categories: ['All', 'الاستثمار'],
    activeCategory: 'All',
    onCategoryChange: () => undefined,
    onOpenPost: () => undefined,
    formatDate: () => 'April 5, 2026',
  }));

  assert.match(markup, /<nav[^>]*aria-label="Article topics"/);
  assert.match(markup, /<button[^>]*aria-pressed="true"[^>]*>All<\/button>/);
  assert.match(markup, /<article[^>]*dir="rtl"/);
});

test('article reader announces progress and preserves RTL reading direction', async () => {
  const { default: BlogArticleReader } = await import('../components/blog/BlogArticleReader');
  const markup = renderToStaticMarkup(React.createElement(BlogArticleReader, {
    post: arabicPost,
    contentHtml: '<p>نص المقال</p>',
    relatedPosts: [],
    readingProgress: 42,
    shareLabel: 'Share article',
    onBack: () => undefined,
    onShare: () => undefined,
    onOpenPost: () => undefined,
    formatDate: () => 'April 5, 2026',
  }));

  assert.match(markup, /role="progressbar"/);
  assert.match(markup, /aria-valuenow="42"/);
  assert.match(markup, /<div[^>]*class="signal-reader"[^>]*dir="rtl"/);
  assert.doesNotMatch(markup, /class="signal-reader"[^>]*lang="ar"/);
  assert.match(markup, /class="signal-reader__headline"[^>]*lang="ar"/);
  assert.match(markup, /<article[^>]*dir="rtl"[^>]*lang="ar"/);
  assert.match(markup, /aria-label="Back to all articles"/);
  assert.match(markup, /aria-label="Share article"/);
  assert.match(markup, /role="status"[^>]*aria-live="polite"/);
});

test('article controls include the destination title in their accessible names', async () => {
  const { default: BlogLibrary } = await import('../components/blog/BlogLibrary');
  const { default: BlogArticleReader } = await import('../components/blog/BlogArticleReader');
  const englishPost: BlogPost = {
    ...arabicPost,
    id: 8,
    title: 'Trading with patience',
    excerpt: 'A durable decision process.',
    category: 'Trading',
    slug: 'trading-with-patience',
  };

  const libraryMarkup = renderToStaticMarkup(React.createElement(BlogLibrary, {
    posts: [englishPost, arabicPost],
    categories: ['All'],
    activeCategory: 'All',
    onCategoryChange: () => undefined,
    onOpenPost: () => undefined,
    formatDate: () => 'April 5, 2026',
  }));
  const readerMarkup = renderToStaticMarkup(React.createElement(BlogArticleReader, {
    post: englishPost,
    contentHtml: '<p>Article</p>',
    relatedPosts: [arabicPost],
    readingProgress: 0,
    shareLabel: 'Share',
    onBack: () => undefined,
    onShare: () => undefined,
    onOpenPost: () => undefined,
    formatDate: () => 'April 5, 2026',
  }));

  assert.match(libraryMarkup, /aria-label="Read the essay: Trading with patience"/);
  assert.match(libraryMarkup, /aria-label="Continue reading: فن الاستثمار الهادئ"/);
  assert.match(readerMarkup, /aria-label="Read next: فن الاستثمار الهادئ"/);
});
