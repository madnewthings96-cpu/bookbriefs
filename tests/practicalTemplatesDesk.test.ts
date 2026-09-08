import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const loadPracticalTemplatesDesk = async () => {
  try {
    return await import('../components/PracticalTemplatesDesk');
  } catch {
    assert.fail('the practical templates desk component must exist');
  }
};

const loadPracticalTemplatesModel = async () => {
  try {
    return await import('../components/practicalTemplatesModel');
  } catch {
    assert.fail('the practical templates clipboard model must exist');
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

test('copyPracticalTemplate writes the selected framework to the clipboard', async () => {
  const { copyPracticalTemplate } = await loadPracticalTemplatesModel();
  const writes: string[] = [];

  const result = await copyPracticalTemplate('After I [current habit], I will [new habit].', {
    writeText: async (text: string) => {
      writes.push(text);
    },
  });

  assert.equal(result, 'Copied');
  assert.deepEqual(writes, ['After I [current habit], I will [new habit].']);
});

test('copyPracticalTemplate reports an unavailable clipboard without throwing', async () => {
  const { copyPracticalTemplate } = await loadPracticalTemplatesModel();

  const result = await copyPracticalTemplate('A useful template', undefined);

  assert.equal(result, 'Copy failed');
});

test('the desk offers three reusable templates with paths to their source briefs', async () => {
  const { default: PracticalTemplatesDesk } = await loadPracticalTemplatesDesk();
  const markup = renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: '/' },
      React.createElement(PracticalTemplatesDesk),
    ),
  );

  assert.match(markup, /<section[^>]*aria-labelledby="practical-templates-title"/);
  assert.equal((markup.match(/aria-label="Copy [^"]+ template"/g) || []).length, 3);
  assert.match(markup, /href="\/summary\/atomic-habits"/);
  assert.match(markup, /href="\/summary\/the-4-hour-workweek"/);
  assert.match(markup, /href="\/summary\/be-less-zombie"/);
});

test('the homepage replaces the distillation explainer with the practical templates desk', async () => {
  const markup = await renderHomepage();

  assert.match(markup, /aria-labelledby="practical-templates-title"/);
  assert.doesNotMatch(markup, /The Distillation Engine/);
});

test('the homepage hero accessibility label matches the updated primary promise', async () => {
  const markup = await renderHomepage();

  assert.match(markup, /aria-label="Read less\. Understand more\. Act on it\."/);
});
