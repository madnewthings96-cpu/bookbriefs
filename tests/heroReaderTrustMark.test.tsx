import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const loadTrustMark = async () => {
  try {
    return await import('../components/HeroReaderTrustMark');
  } catch {
    assert.fail('the hero reader trust mark component must exist');
  }
};

const renderHomepage = async () => {
  const { default: HomePage } = await import('../pages/HomePage');
  const testGlobal = globalThis as typeof globalThis & { window?: Window };
  const previousWindow = testGlobal.window;
  Object.defineProperty(testGlobal, 'window', {
    configurable: true,
    value: { location: { origin: 'https://www.ta7leel.pro' } },
  });

  try {
    return renderToStaticMarkup(
      React.createElement(
        StaticRouter,
        { location: '/' },
        React.createElement(HomePage),
      ),
    );
  } finally {
    if (previousWindow) {
      Object.defineProperty(testGlobal, 'window', { configurable: true, value: previousWindow });
    } else {
      delete testGlobal.window;
    }
  }
};

test('the trust mark gives the reader count one clear accessible description', async () => {
  const { default: HeroReaderTrustMark } = await loadTrustMark();
  const markup = renderToStaticMarkup(React.createElement(HeroReaderTrustMark));

  assert.match(markup, /role="img"/);
  assert.match(markup, /aria-label="Rated five stars by 5,000\+ active readers"/);
  assert.equal((markup.match(/data-reader-star="true"/g) || []).length, 5);
  assert.equal((markup.match(/data-laurel="true"/g) || []).length, 2);
});

test('the homepage replaces both hero pills with the centered reader trust mark', async () => {
  const markup = await renderHomepage();

  assert.match(markup, /aria-label="Rated five stars by 5,000\+ active readers"/);
  assert.doesNotMatch(markup, /Distilled Wisdom/);
  assert.equal((markup.match(/5,000\+ Active Readers/g) || []).length, 1);
});

test('the homepage hero no longer shows the retired metric bar', async () => {
  const markup = await renderHomepage();

  assert.doesNotMatch(markup, /Distilled Books/);
  assert.doesNotMatch(markup, /Average Read/);
  assert.doesNotMatch(markup, /Actionable Signal/);
});
