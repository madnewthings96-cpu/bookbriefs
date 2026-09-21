import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const renderCalculatorsPage = async (location = '/calculators') => {
  const { default: CalculatorsPage } = await import('../pages/CalculatorsPage');

  return renderToStaticMarkup(
    React.createElement(
      StaticRouter,
      { location },
      React.createElement(CalculatorsPage),
    ),
  );
};

test('the calculator page introduces the tool with creator and last-editor credits', async () => {
  const markup = await renderCalculatorsPage();
  const headerMatch = markup.match(/<header[^>]*>([\s\S]*?)<\/header>/);

  assert.ok(headerMatch, 'expected a compact page header');
  const headerText = headerMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  assert.match(headerText, /Free trading and financial calculators/);
  assert.match(headerText, /Created by Omar/);
  assert.match(headerText, /Last edited by Layla/);
  assert.match(headerText, /Last updated September 2026/);
  assert.match(headerMatch[1], /src="\/images\/omar-profile\.webp"/);
  assert.match(headerMatch[1], /src="\/images\/layla-profile\.webp"/);
  assert.equal((headerMatch[1].match(/<h1/g) || []).length, 1);
  assert.match(headerMatch[1], /text-2xl/);
  assert.match(headerMatch[1], /sm:text-3xl/);
  assert.match(headerMatch[1], /lg:text-4xl/);
  assert.match(markup, /id="calculator-workspace"/);
  assert.match(markup, /Calculate Position Size/);
});

test('position size and pip value start directly with their forms and omit guidance cards', async () => {
  const positionMarkup = await renderCalculatorsPage('/calculators/position-size');
  const pipMarkup = await renderCalculatorsPage('/calculators/pip-value');

  assert.doesNotMatch(positionMarkup, /Position Sizing &amp; Risk Engine/);
  assert.doesNotMatch(positionMarkup, /Size the trade before you take the risk\./);
  assert.doesNotMatch(positionMarkup, /Before you use the result/);
  assert.match(positionMarkup, /Account Balance \(\$\)/);

  assert.doesNotMatch(pipMarkup, /Pip &amp; Point Value Calculator/);
  assert.doesNotMatch(pipMarkup, /Turn price points into tangible capital\./);
  assert.doesNotMatch(pipMarkup, /Before you use the result/);
  assert.match(pipMarkup, /Instrument \/ Pair/);
});

test('FIRE keeps calculator guidance ahead of the single ad placement', async () => {
  const markup = await renderCalculatorsPage('/calculators/fire');
  const calculatorIndex = markup.indexOf('Financial Independence Planner');
  const principleIndex = markup.indexOf('Calculate your financial independence number.');
  const checklistIndex = markup.indexOf('Before you use the result');
  const adIndex = markup.indexOf('aria-label="Advertisements"');

  assert.ok(calculatorIndex >= 0);
  assert.ok(principleIndex > calculatorIndex);
  assert.ok(checklistIndex > principleIndex);
  assert.ok(adIndex > checklistIndex);
  assert.equal((markup.match(/aria-label="Advertisements"/g) || []).length, 1);
});
