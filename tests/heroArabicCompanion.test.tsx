import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

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

test('the hero introduces the Arabic reading companion after its calls to action', async () => {
  const markup = await renderHomepage();
  const ctaIndex = markup.indexOf('Risk Calculator');
  const companionIndex = markup.indexOf('رفيقك الذكي لفهم الكتب');

  assert.match(markup, /href="\/calculators\/position-size"[^>]*>.*Risk Calculator/s);
  assert.ok(companionIndex > ctaIndex, 'the Arabic companion should follow the hero CTAs');
  assert.match(markup, /lang="ar" dir="rtl"/);
  assert.match(markup, /أهم الأفكار، نماذج ذهنية واضحة، وخطوات عملية قابلة للتطبيق/);
  assert.match(markup, /src="\/images\/ta7leel-super-reader-v1\.png" alt=""/);
});
