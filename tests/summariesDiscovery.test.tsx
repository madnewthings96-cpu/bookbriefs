import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { createServer } from 'vite';

test('discover keeps search and topic filters without duplicate category guide links', async (t) => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false } });
  t.after(() => vite.close());
  const [{ default: SummariesPage }, { BooksProvider }, { LanguageProvider }] = await Promise.all([
    vite.ssrLoadModule('/pages/SummariesPage.tsx'),
    vite.ssrLoadModule('/contexts/BooksContext.tsx'),
    vite.ssrLoadModule('/contexts/LanguageContext.tsx'),
  ]);
  const markup = renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/dashboard/discover' },
      React.createElement(LanguageProvider, null,
        React.createElement(BooksProvider, null,
          React.createElement(SummariesPage, { surface: 'dashboard' }),
        ),
      ),
    ),
  );

  assert.match(markup, /id="summary-search"/);
  assert.match(markup, /aria-label="Filter by topic"/);
  assert.doesNotMatch(markup, /aria-label="Book category guides"/);
  assert.doesNotMatch(markup, /Trading Book Summaries/);
});
