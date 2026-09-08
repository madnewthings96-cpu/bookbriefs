import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const renderMarketDesk = async () => {
  const { default: NewsPage } = await import('../pages/NewsPage');
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/news' }, React.createElement(NewsPage)),
  );
};

test('market desk gives traders a briefing before the economic calendar', async () => {
  const markup = await renderMarketDesk();
  const visibleText = markup.replace(/<[^>]+>/g, ' ');

  assert.match(markup, /<div[^>]*class="market-desk"/);
  assert.equal((markup.match(/<main/g) || []).length, 0);
  assert.equal((markup.match(/<h1/g) || []).length, 1);
  assert.match(visibleText, /Know what can move the market/);
  assert.match(visibleText, /Trading day brief/);
  assert.match(visibleText, /Event radar/i);
  assert.ok(markup.indexOf('id="briefing"') < markup.indexOf('id="calendar"'));
  assert.match(markup, /lang="ar"[^>]*dir="rtl"/);
});

test('market desk preserves the MQL5 calendar and exposes accessible navigation', async () => {
  const markup = await renderMarketDesk();

  assert.match(markup, /href="#calendar"/);
  assert.match(markup, /href="#briefing"/);
  assert.match(markup, /id="economicCalendarWidget"/);
  assert.match(markup, /aria-label="Economic calendar"/);
  assert.match(markup, /MQL5 Algo Trading Community/);
  assert.match(
    markup,
    /class="market-signals__rail"[^>]*role="region"[^>]*aria-label="Market preparation signals"[^>]*tabindex="0"/,
  );
  assert.match(markup, /alt="Financial market collage with institutions, scales, and price charts"/);
  assert.match(markup, /alt="Trader climbing a steep market mountain before the session"/);
});

test('market desk stylesheet includes its responsive and motion-safe visual system', async () => {
  let styles: string;
  try {
    styles = await readFile(new URL('../pages/NewsPage.css', import.meta.url), 'utf8');
  } catch {
    assert.fail('NewsPage.css must define the Market Desk visual system');
  }

  assert.match(styles, /--market-forest:\s*#12382b/i);
  assert.match(styles, /--market-brass:\s*#c89a49/i);
  assert.match(styles, /font-variant-numeric:\s*tabular-nums/i);
  assert.match(styles, /@media\s*\(max-width:\s*720px\)/i);
  assert.match(styles, /prefers-reduced-motion/);
  assert.doesNotMatch(styles, /transition:\s*all/i);
  assert.doesNotMatch(styles, /will-change:\s*all/i);
  assert.match(styles, /@keyframes\s+market-enter[\s\S]*?translate:/i);
  assert.doesNotMatch(styles, /transform:\s*translateY\(16px\)/i);

  const globalStyles = await readFile(new URL('../styles/globals.css', import.meta.url), 'utf8');
  assert.doesNotMatch(globalStyles, /NewsPage\.css/);

  const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.match(
    appSource,
    /Promise\.all\(\[import\('\.\/pages\/NewsPage\.css'\), import\('\.\/pages\/NewsPage'\)\]\)/,
  );
});
