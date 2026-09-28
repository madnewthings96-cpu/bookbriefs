import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const loadTemplate = () =>
  readFile(new URL('../email-templates/ta7leel-market-brief-ar.html', import.meta.url), 'utf8');

test('market brief invites readers to support Ta7leel through Ko-fi', async () => {
  const html = await loadTemplate();

  assert.match(html, /استفدت من الموجز؟/);
  assert.match(html, /href="https:\/\/ko-fi\.com\/ta7leel"/);
  assert.match(html, />ادعم Ta7leel على Ko-fi</);
});

test('market brief links to every active Ta7leel social channel', async () => {
  const html = await loadTemplate();

  assert.match(html, /role="navigation"[^>]*aria-label="تابع Ta7leel"/);
  assert.match(html, /href="https:\/\/x\.com\/Ta7leel007"/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/ta7leel007"/);
  assert.match(html, /href="https:\/\/www\.youtube\.com\/@ta7leeel"/);
  assert.match(html, /href="https:\/\/t\.me\/MadMarkets"/);
});

test('market brief footer keeps legal and subscription controls accessible', async () => {
  const html = await loadTemplate();

  assert.match(html, /href="https:\/\/ta7leel\.site\/privacy-policy"/);
  assert.match(html, /href="https:\/\/ta7leel\.site\/terms-of-use"/);
  assert.match(html, /href="\{\$unsubscribe\}"/);
  assert.match(html, /هذا المحتوى تعليمي ولا يمثل توصية بالشراء أو البيع/);
});

test('market brief frames the XAUUSD idea as a conditional, evidence-based setup', async () => {
  const html = await loadTemplate();

  assert.match(html, /data-section="xauusd-decision"/);
  assert.match(html, /الانحياز الحالي/);
  assert.match(html, /القراءة الأساسية/);
  assert.match(html, /القراءة الفنية/);
  assert.match(html, /شرط التأكيد/);
  assert.match(html, /إبطال السيناريو/);
  assert.match(html, /قراءة تحليلية وليست توصية تداول/);
});
