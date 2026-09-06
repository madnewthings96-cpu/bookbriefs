import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MarkdownRenderer from '../components/MarkdownRenderer';

test('summary markdown preserves the page heading hierarchy inside the article', () => {
  const markup = renderToStaticMarkup(
    React.createElement(MarkdownRenderer, {
      content: '# Book title\n\nOpening paragraph.\n\n## First principle\n\nSupporting paragraph.',
    }),
  );

  assert.doesNotMatch(markup, /<h1/);
  assert.match(markup, /<h3[^>]*id="book-title"/);
  assert.match(markup, /<h3[^>]*id="first-principle"/);
});
