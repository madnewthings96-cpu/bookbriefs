import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { readFile } from 'node:fs/promises';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

const renderIdeasPage = async () => {
  const { default: IdeasInTheWildPage } = await import('../pages/IdeasInTheWildPage');
  return renderToStaticMarkup(
    React.createElement(StaticRouter, { location: '/connections' }, React.createElement(IdeasInTheWildPage)),
  );
};

test('ideas page connects one real-world question to three book lenses', async () => {
  const markup = await renderIdeasPage();
  const visibleText = markup.replace(/<[^>]+>/g, ' ');

  assert.match(markup, /<div[^>]*class="wild-ideas"/);
  assert.equal((markup.match(/<h1/g) || []).length, 1);
  assert.match(visibleText, /Books are not the world/i);
  assert.match(markup, /aria-label="Book lens map"/);
  assert.equal((markup.match(/class="wild-lens"/g) || []).length, 3);
  assert.match(visibleText, /Where the lens bends/i);
  assert.match(visibleText, /Try this in real life/i);
  assert.match(markup, /href="\/summary\/indistractable"/);
});

test('connection topics are accessible and filter stories without mutating their order', async () => {
  const markup = await renderIdeasPage();
  const { filterConnectionStories } = await import('../components/connections/connectionsModel');
  const stories = [
    { id: 'first', category: 'Markets' },
    { id: 'second', category: 'Behavior' },
    { id: 'third', category: 'Markets' },
  ];

  assert.match(markup, /<nav[^>]*aria-label="Connection topics"/);
  assert.match(markup, /<button[^>]*aria-pressed="true"[^>]*>All<\/button>/);
  assert.deepEqual(filterConnectionStories(stories, 'Markets').map((story) => story.id), ['first', 'third']);
  assert.deepEqual(filterConnectionStories(stories, 'All').map((story) => story.id), ['first', 'second', 'third']);
});

test('connection cards expose useful next actions and related book destinations', async () => {
  const markup = await renderIdeasPage();

  assert.match(markup, /aria-label="Connections worth keeping"/);
  assert.match(markup, /Read the connected brief:/);
  assert.match(markup, /href="\/summary\/the-psychology-of-money"/);
  assert.match(markup, /href="\/summary\/broken-money"/);
  assert.match(markup, /href="\/summary\/100m-offers"/);
});

test('ideas page visual system remains responsive and motion-safe', async () => {
  let styles: string;
  try {
    styles = await readFile(new URL('../pages/IdeasInTheWildPage.css', import.meta.url), 'utf8');
  } catch {
    assert.fail('IdeasInTheWildPage.css must define the page visual system');
  }

  assert.match(styles, /--wild-electric:\s*#3157ff/i);
  assert.match(styles, /font-family:\s*['"]?Bricolage Grotesque/i);
  assert.match(styles, /@media\s*\(max-width:\s*720px\)/i);
  assert.match(styles, /prefers-reduced-motion/);
  assert.doesNotMatch(styles, /transition:\s*all/i);
});
