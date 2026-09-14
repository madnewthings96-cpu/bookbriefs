import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AdSlot,
  loadAdSenseScript,
  readAdSenseConfig,
  requestAdSenseAd,
  type AdSenseDocument,
  type AdSenseQueueHost,
} from '../components/news/AdSlot';

const createAdSenseDocument = () => {
  const scripts: HTMLScriptElement[] = [];
  const dataset: Record<string, string | undefined> = {};
  const document = {
    documentElement: { dataset },
    createElement: (tagName: string) => {
      assert.equal(tagName, 'script');
      return { dataset: {} } as unknown as HTMLScriptElement;
    },
    head: {
      appendChild: (script: HTMLScriptElement) => {
        scripts.push(script);
        return script;
      },
    },
  } as AdSenseDocument;

  return { document, scripts, dataset };
};

test('readAdSenseConfig enables ads only when both identifiers exist', () => {
  assert.deepEqual(readAdSenseConfig({
    VITE_ADSENSE_CLIENT_ID: 'ca-pub-1',
    VITE_ADSENSE_NEWS_SLOT_ID: '42',
  }), { client: 'ca-pub-1', slot: '42' });
  assert.deepEqual(readAdSenseConfig({
    VITE_ADSENSE_CLIENT_ID: 'ca-pub-1',
  }), { client: '', slot: '' });
  assert.deepEqual(readAdSenseConfig({
    VITE_ADSENSE_NEWS_SLOT_ID: '42',
  }), { client: '', slot: '' });
});

test('unconfigured ad slot reserves space without emitting an AdSense request', () => {
  const markup = renderToStaticMarkup(
    <AdSlot placement="news-index" config={{ client: '', slot: '' }} />,
  );

  assert.match(markup, /aria-label="Advertisements"/);
  assert.match(markup, /data-configured="false"/);
  assert.doesNotMatch(markup, /adsbygoogle/);
});

test('configured ad slot emits one responsive AdSense unit', () => {
  const markup = renderToStaticMarkup(
    <AdSlot
      placement="news-article"
      config={{ client: 'ca-pub-1', slot: '42' }}
    />,
  );

  assert.equal((markup.match(/class="adsbygoogle"/g) || []).length, 1);
  assert.match(markup, /data-ad-client="ca-pub-1"/);
  assert.match(markup, /data-ad-slot="42"/);
  assert.match(markup, /data-ad-format="auto"/);
  assert.match(markup, /data-full-width-responsive="true"/);
});

test('concurrent configured slots share one script and each emit one request', async () => {
  const { document, scripts, dataset } = createAdSenseDocument();
  const host: AdSenseQueueHost = {};
  const config = { client: 'ca-pub-1/2', slot: '42' };

  const firstRequest = requestAdSenseAd(config, document, host);
  const secondRequest = requestAdSenseAd(config, document, host);

  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].crossOrigin, 'anonymous');
  assert.equal(
    scripts[0].src,
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1%2F2',
  );
  assert.equal(host.adsbygoogle, undefined, 'requests wait until the script loads');

  scripts[0].onload?.(new Event('load'));

  assert.deepEqual(await Promise.all([firstRequest, secondRequest]), [true, true]);
  assert.deepEqual(host.adsbygoogle, [{}, {}]);
  assert.equal(dataset.adsenseLoaded, 'true');
});

test('a blocked AdSense script fails closed without throwing or queuing a request', async () => {
  const { document, scripts } = createAdSenseDocument();
  const host: AdSenseQueueHost = {};

  const request = requestAdSenseAd(
    { client: 'ca-pub-1', slot: '42' },
    document,
    host,
  );
  scripts[0].onerror?.(new Event('error'));

  assert.equal(await request, false);
  assert.equal(host.adsbygoogle, undefined);
  assert.equal(await loadAdSenseScript('ca-pub-1', document), false);
  assert.equal(scripts.length, 1, 'a blocked document does not churn script elements');
});

test('privacy policy discloses ad, consent, storage, and choice details', async () => {
  const source = await readFile(
    new URL('../pages/PrivacyPolicyPage.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /Google AdSense/);
  assert.match(source, /Firebase Storage/);
  assert.match(source, /cookies/i);
  assert.match(source, /local storage/i);
  assert.match(source, /personalized/i);
  assert.match(source, /non-personalized/i);
  assert.match(source, /Google Privacy &amp; Messaging/);
  assert.match(source, /consent/i);
  assert.match(source, /https:\/\/policies\.google\.com\/privacy/);
  assert.match(source, /https:\/\/adssettings\.google\.com/);
});
