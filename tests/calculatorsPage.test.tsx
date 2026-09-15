import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const renderCalculatorsPage = async () => {
  const { default: CalculatorsPage } = await import('../pages/CalculatorsPage');

  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location: '/calculators' },
      React.createElement(CalculatorsPage),
    ),
  );
};

test('the calculator page leads directly from a title-only header into the tool workspace', async () => {
  const markup = await renderCalculatorsPage();
  const headerMatch = markup.match(/<header[^>]*>([\s\S]*?)<\/header>/);

  assert.ok(headerMatch, 'expected a compact page header');
  const headerText = headerMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  assert.equal(headerText, 'Free trading and financial calculators');
  assert.equal((headerMatch[1].match(/<h1/g) || []).length, 1);
  assert.match(headerMatch[1], /text-2xl/);
  assert.match(headerMatch[1], /sm:text-3xl/);
  assert.match(headerMatch[1], /lg:text-4xl/);
  assert.match(markup, /id="calculator-workspace"/);
  assert.match(markup, /Position Sizing &amp; Risk Engine/);
});

test('mobile source order keeps calculator guidance ahead of the single ad placement', async () => {
  const markup = await renderCalculatorsPage();
  const calculatorIndex = markup.indexOf('Position Sizing &amp; Risk Engine');
  const principleIndex = markup.indexOf('Size the trade before you take the risk.');
  const checklistIndex = markup.indexOf('Before you use the result');
  const adIndex = markup.indexOf('aria-label="Advertisements"');

  assert.ok(calculatorIndex >= 0);
  assert.ok(principleIndex > calculatorIndex);
  assert.ok(checklistIndex > principleIndex);
  assert.ok(adIndex > checklistIndex);
  assert.equal((markup.match(/aria-label="Advertisements"/g) || []).length, 1);
});
