import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const renderManifesto = async () => {
  const { default: AboutManifesto } = await import('../components/about/AboutManifesto');
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/' }, React.createElement(AboutManifesto)),
  );
};

test('about manifesto explains the path from books to applied ideas', async () => {
  const markup = await renderManifesto();
  const visibleText = markup.replace(/<[^>]+>/g, ' ');

  assert.match(markup, /<div[^>]*class="about-manifesto"/);
  assert.equal((markup.match(/<main/g) || []).length, 0);
  assert.match(visibleText, /Ideas are only useful when they\s+change what you do\./);
  assert.match(visibleText, /From pages to practice/);
  assert.match(visibleText, /How we choose and distill books/);
  assert.match(visibleText, /Protect the argument/);
  assert.match(visibleText, /Remove the noise/);
  assert.match(visibleText, /End with application/);
  assert.equal((markup.match(/<h1/g) || []).length, 1);
});

test('about manifesto preserves both product destinations and useful image descriptions', async () => {
  const markup = await renderManifesto();

  assert.match(markup, /href="\/summaries"/);
  assert.match(markup, /href="\/calculators"/);
  assert.match(markup, /alt="Ta7leel reading companion turning a book into an actionable idea"/);
  assert.match(markup, /alt="Ta7leel companion using a calculator to put an idea into practice"/);
  assert.match(markup, /alt="Ta7leel companion reaching the top of a mountain"/);
  assert.equal((markup.match(/href="\/summaries"/g) || []).length, 2);
  assert.equal((markup.match(/href="\/calculators"/g) || []).length, 2);
  assert.match(markup, /role="region"[^>]*aria-label="Ta7leel method"[^>]*tabindex="0"/);
  assert.match(markup, /role="region"[^>]*aria-label="How Ta7leel distills books"[^>]*tabindex="0"/);
  assert.match(markup, /role="region"[^>]*aria-label="Ta7leel focus areas"[^>]*tabindex="0"/);
  assert.doesNotMatch(markup, /<blockquote/);
});
