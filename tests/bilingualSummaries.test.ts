import assert from 'node:assert/strict';
import { stripSummaryMarkdown } from '../components/summaryReadingModel';
import { arabicBookSummaries } from '../translations/arabicBookSummaries';
import test from 'node:test';
import { getBookSummaryTranslation } from '../translations/bookSummaries';
import { loadBookCatalog } from '../scripts/seoCatalog';
import { mergeBooksWithLocalFallbacks, getLocalBookSummary } from '../utils/localBookFallbacks';
import * as prerender from '../scripts/prerender-seo';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import SummaryLanguageSwitch from '../components/SummaryLanguageSwitch';
import { getSummaryPath } from '../utils/bookLocales';

const selected = ['atomic-habits', 'the-psychology-of-money', 'rich-dad-poor-dad', 'thinking-fast-and-slow', 'trading-in-the-zone',
  'never-finished', 'the-alchemist', 'the-four-agreements', 'the-intelligent-investor', 'the-laws-of-human-nature', 'the-simple-path-to-wealth', '100m-money-models', 'broken-money', 'finding-ultra', 'living-with-a-seal', 'the-alchemy-of-finance', 'the-black-swan', 'the-first-90-days', '100m-offers', 'the-book-on-managing-rental-properties', 'best-loser-wins', 'project-hail-mary', 'the-chatgpt-millionaire', 'educated', 'becoming', 'the-miracle-morning', 'sapiens', 'basic-economics', 'black-rednecks-and-white-liberals', 'the-mental-game-of-trading', 'dont-believe-everything-you-think', 'ask-and-it-is-given', 'technical-analysis-of-the-financial-markets', 'competition-demystified', 'the-book-on-rental-property-investing', 'buffetts-2-step-stock-market-strategy', 'cant-hurt-me', 'mastering-trading-psychology', 'situated', 'trading-technical-analysis-masterclass', 'be-less-zombie', 'one-up-on-wall-street', 'the-total-money-makeover', 'trade-like-a-stock-market-wizard', 'becoming-supernatural', 'market-wizards', 'the-playbook', 'your-best-year-ever', 'the-disciplined-trader', 'dune', 'how-i-made-2000000-in-the-stock-market', 'the-33-strategies-of-war', 'how-to-win-friends-and-influence-people', 'secrets-of-the-millionaire-mind', 'how-to-trade-in-stocks', 'influence', 'i-will-teach-you-to-be-rich', 'profit-first', 'the-power-of-one-more', 'the-book-on-investing-in-real-estate-with-no-and-low-money-down', 'the-richest-man-in-babylon', 'reminiscences-of-a-stock-operator', 'the-miracle-equation', 'the-science-of-self-discipline', 'the-zen-trader', 'think-and-grow-rich', 'signs', 'the-7-habits-of-highly-effective-people', 'the-little-book-of-common-sense-investing', 'manifest', 'the-5-second-rule', 'a-random-walk-down-wall-street', 'trading-for-a-living', 'unfuk-yourself', 'high-performance-habits', 'the-let-them-theory', 'a-beginners-guide-to-the-stock-market', 'how-to-day-trade-for-a-living', 'the-48-laws-of-power', 'the-little-book-that-still-beats-the-market', 'traction', 'the-mountain-is-you', 'leading-change', 'endure', 'one-good-trade', 'money-master-the-game', 'the-motivation-manifesto', 'relentless', 'the-courage-to-be-disliked', 'the-4-hour-workweek', 'the-subtle-art-of-not-giving-a-f', 'americas-bank', 'brainwashed-by-your-gut', 'the-way-of-men', '101-essays-that-will-change-the-way-you-think', 'the-confidence-code', 'indistractable', 'die-with-zero', 'never-split-the-difference', 'psycho-cybernetics', 'secrets-for-profiting-in-bull-and-bear-markets', 'the-daily-trading-coach', 'the-science-of-scaling', 'think-and-trade-like-a-champion', 'unreasonable-hospitality'];

test('reader language links return to the quick brief of the same book', () => {
  const books = mergeBooksWithLocalFallbacks([]);
  for (const id of selected) {
    const book = books.find(item => item.id === id)!;
    for (const language of ['en', 'ar'] as const) {
      const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: getSummaryPath(book, language) },
        React.createElement(SummaryLanguageSwitch, { book, language })));
      assert.ok(html.includes(`href="${getSummaryPath(book, 'ar')}#quick-brief"`), `${id}: Arabic link`);
      assert.ok(html.includes(`href="${getSummaryPath(book, 'en')}#quick-brief"`), `${id}: English link`);
      assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
    }
  }
});

test('Arabic summaries load Arabic without replacing English or falling back silently', () => {
  for (const id of selected) {
    const arabic = getBookSummaryTranslation(id, 'ar' as never);
    assert.ok(arabic, `Missing Arabic summary: ${id}`);
    assert.match(arabic.summary, /[\u0600-\u06FF]/);
    assert.ok(arabic.keyTakeaways.every(item => /[\u0600-\u06FF]/.test(item)));
  }
  assert.match(getBookSummaryTranslation('atomic-habits', 'en')!.summary, /Atomic Habits/);
  for (const id of selected) {
    assert.ok(getBookSummaryTranslation(id, 'en') || getLocalBookSummary(id, 'en'), `Missing English fallback: ${id}`);
  }
  assert.equal(getBookSummaryTranslation('untranslated-test-book', 'ar' as never), null);
});

test('translated books survive unavailable Firestore and enter the static catalog', async () => {
  const fallback = mergeBooksWithLocalFallbacks([]);
  const catalog = await loadBookCatalog();
  for (const book of catalog) {
    assert.ok(getBookSummaryTranslation(book.id, 'ar' as never), `Catalog book has no Arabic version: ${book.id}`);
  }
  for (const id of selected) {
    assert.ok(fallback.some(book => book.id === id), `Missing runtime fallback: ${id}`);
    assert.ok(catalog.some(book => book.id === id), `Missing static metadata: ${id}`);
  }
  const remote = { ...fallback.find(book => book.id === 'atomic-habits')!, title: 'Remote title' };
  assert.equal(mergeBooksWithLocalFallbacks([remote]).find(book => book.id === remote.id)!.title, 'Remote title');
});

test('static pages have self canonicals, reciprocal alternates and language navigation', async () => {
  const build = (prerender as any).bookPage;
  assert.equal(typeof build, 'function');
  const catalog = await loadBookCatalog();
  const book = catalog.find(book => book.id === 'atomic-habits')!;
  const template = '<html><head></head><body><div id="root"></div></body></html>';
  const arHtml = prerender.renderPage(template, build(book, 'ar'));
  const enHtml = prerender.renderPage(template, build(book, 'en'));
  const arUrl = 'https://www.ta7leel.pro/ar/summary/%D8%A7%D9%84%D8%B9%D8%A7%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%B0%D8%B1%D9%8A%D8%A9/';
  assert.match(arHtml, /<html lang="ar" dir="rtl">/);
  assert.ok(arHtml.includes(`<link rel="canonical" href="${arUrl}"`));
  for (const html of [arHtml, enHtml]) {
    assert.ok(html.includes(`hreflang="ar" href="${arUrl}"`));
    assert.match(html, /hreflang="en" href="https:\/\/www.ta7leel.pro\/summary\/atomic-habits\/"/);
  }
  assert.match(arHtml, /href="\/summary\/atomic-habits\/#quick-brief"/);
  assert.match(arHtml, /العادات الذرية/);
  assert.match(enHtml, /<html lang="en" dir="ltr">/);
  // A synthetic book retains coverage of the untranslated path now that the catalog is bilingual.
  const untranslated = { ...book, id: 'untranslated-test-book', arabicSlug: 'untranslated-test-book' };
  assert.doesNotMatch(prerender.renderPage(template, build(untranslated, 'en')), /hreflang/);
  assert.throws(() => build(untranslated, 'ar'), /translation/i);
});

const detailedBatch = ['becoming-supernatural', 'market-wizards', 'the-playbook', 'your-best-year-ever', 'the-disciplined-trader', 'dune', 'how-i-made-2000000-in-the-stock-market', 'the-33-strategies-of-war', 'how-to-win-friends-and-influence-people', 'secrets-of-the-millionaire-mind', 'how-to-trade-in-stocks', 'influence', 'i-will-teach-you-to-be-rich', 'profit-first', 'the-power-of-one-more', 'the-book-on-investing-in-real-estate-with-no-and-low-money-down', 'the-richest-man-in-babylon', 'reminiscences-of-a-stock-operator', 'the-miracle-equation', 'the-science-of-self-discipline', 'the-zen-trader', 'think-and-grow-rich', 'signs', 'the-7-habits-of-highly-effective-people', 'the-little-book-of-common-sense-investing', 'manifest', 'the-5-second-rule', 'a-random-walk-down-wall-street', 'trading-for-a-living', 'unfuk-yourself', 'high-performance-habits', 'the-let-them-theory', 'a-beginners-guide-to-the-stock-market', 'how-to-day-trade-for-a-living', 'the-48-laws-of-power', 'the-little-book-that-still-beats-the-market', 'traction', 'the-mountain-is-you', 'leading-change', 'endure', 'one-good-trade', 'money-master-the-game', 'the-motivation-manifesto', 'relentless', 'the-courage-to-be-disliked', 'the-4-hour-workweek', 'the-subtle-art-of-not-giving-a-f', 'americas-bank', 'brainwashed-by-your-gut', 'the-way-of-men', '101-essays-that-will-change-the-way-you-think', 'the-confidence-code', 'indistractable', 'die-with-zero', 'never-split-the-difference', 'psycho-cybernetics', 'secrets-for-profiting-in-bull-and-bear-markets', 'the-daily-trading-coach', 'the-science-of-scaling', 'think-and-trade-like-a-champion', 'unreasonable-hospitality'];

test('new Arabic adaptations remain substantial and keep takeaways and source attribution', () => {
  for (const id of detailedBatch) {
    const data = arabicBookSummaries[id];
    assert.ok(data, `Missing Arabic adaptation: ${id}`);
    const words = stripSummaryMarkdown(data.summary).split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 1000, `${id}: only ${words} reading words`);
    assert.equal(data.keyTakeaways.length, 10, `${id}: takeaways`);
    assert.ok((data.summary.match(/^## /gm) || []).length >= 10, `${id}: detailed sections`);
    assert.ok(data.sources.length > 0 && data.sources.every(source => source.url.startsWith('https://')), `${id}: source attribution`);
  }
});
