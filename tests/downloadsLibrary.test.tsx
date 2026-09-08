import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const loadLibrary = async () => {
  try {
    return await import('../components/downloads/DownloadsLibrary');
  } catch {
    assert.fail('the downloads library component must exist');
  }
};

const notionResource = {
  id: 'journal',
  title: 'Ta7leel Trading Journal — Standard',
  description: 'Track every trade and turn review into a repeatable practice.',
  fileUrl: 'https://www.notion.so/example',
  kind: 'notion' as const,
  format: 'Notion template',
  category: 'Trading',
  updatedAt: '2026-09-08',
  featured: true,
};

const renderLibrary = async (resources = [notionResource]) => {
  const { default: DownloadsLibrary } = await loadLibrary();
  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: '/downloads' },
      React.createElement(DownloadsLibrary, { resources }),
    ),
  );
};

test('the resource cabinet has one page heading and an accessible discovery surface', async () => {
  const markup = await renderLibrary();

  assert.equal((markup.match(/<h1/g) || []).length, 1);
  assert.match(markup, /<section[^>]*aria-labelledby="resource-library-title"/);
  assert.match(markup, /<label[^>]*for="resource-search"/);
  assert.match(markup, /<nav[^>]*aria-label="Filter resources by format"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /role="status"[^>]*aria-live="polite"/);
  assert.match(markup, /Resource cabinet/);
});

test('an external Notion resource communicates its format and opens safely', async () => {
  const markup = await renderLibrary();

  assert.match(markup, /Ta7leel Trading Journal/);
  assert.match(markup, /Notion template/);
  assert.match(markup, /Updated<\/dt><dd>Sep 2026/);
  assert.match(markup, /href="https:\/\/www\.notion\.so\/example"/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.match(markup, />Open in Notion</);
});

test('an empty cabinet gives the reader a useful next step', async () => {
  const markup = await renderLibrary([]);

  assert.match(markup, /New resources are being prepared/);
  assert.match(markup, /href="\/summaries"/);
  assert.match(markup, /Browse book summaries/);
});
