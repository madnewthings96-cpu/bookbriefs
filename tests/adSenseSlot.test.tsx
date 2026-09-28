import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const loadAdSenseSlot = async () => {
  try {
    return await import('../components/AdSenseSlot');
  } catch {
    assert.fail('the shared AdSense slot component must exist');
  }
};

test('AdSense configuration requires both the publisher and calculator slot IDs', async () => {
  const { readCalculatorAdSenseConfig } = await loadAdSenseSlot();

  assert.deepEqual(
    readCalculatorAdSenseConfig({
      VITE_ADSENSE_CLIENT_ID: 'ca-pub-123',
      VITE_ADSENSE_CALCULATOR_SLOT_ID: '456',
    }),
    { client: 'ca-pub-123', slot: '456' },
  );
  assert.deepEqual(
    readCalculatorAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-123' }),
    { client: '', slot: '' },
  );
});

test('an unconfigured placement reserves space without emitting an ad request', async () => {
  const { default: AdSenseSlot } = await loadAdSenseSlot();
  const markup = renderToStaticMarkup(
    React.createElement(AdSenseSlot, { config: { client: '', slot: '' } }),
  );

  assert.match(markup, /aria-label="Advertisements"/);
  assert.match(markup, /Advertisement/);
  assert.doesNotMatch(markup, /adsbygoogle/);
});

test('a configured placement emits one responsive AdSense unit', async () => {
  const { default: AdSenseSlot } = await loadAdSenseSlot();
  const markup = renderToStaticMarkup(
    React.createElement(AdSenseSlot, {
      config: { client: 'ca-pub-123', slot: '456' },
    }),
  );

  assert.equal((markup.match(/class="adsbygoogle"/g) || []).length, 1);
  assert.match(markup, /data-ad-client="ca-pub-123"/);
  assert.match(markup, /data-ad-slot="456"/);
  assert.match(markup, /data-ad-format="auto"/);
  assert.match(markup, /data-full-width-responsive="true"/);
});
