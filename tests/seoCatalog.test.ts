import assert from 'node:assert/strict';
import test from 'node:test';
import { absoluteUrl } from '../scripts/seoCatalog';
import { canonicalRoutePath, isPrivateSeoRoute } from '../utils/seoConfig';

test('absolute URLs preserve remote covers and encode Arabic paths exactly once', () => {
  assert.equal(absoluteUrl('https://www.ta7leel.pro', 'https://example.com/cover.jpg'), 'https://example.com/cover.jpg');
  const encoded = 'https://www.ta7leel.pro/summary/%D9%83%D8%AA%D8%A7%D8%A8/';
  assert.equal(absoluteUrl('https://www.ta7leel.pro', '/summary/كتاب/'), encoded);
  assert.equal(absoluteUrl('https://www.ta7leel.pro', '/summary/%D9%83%D8%AA%D8%A7%D8%A8/'), encoded);
});

test('canonical paths exclude tracking, search and fragment state', () => {
  assert.equal(canonicalRoutePath('/summaries?search=habits#results'), '/summaries/');
  assert.equal(canonicalRoutePath('/book-summaries/'), '/summaries/');
  assert.equal(canonicalRoutePath('/'), '/');
});

test('all dashboard paths are private without hiding similarly named public paths', () => {
  assert.equal(isPrivateSeoRoute('/dashboard'), true);
  assert.equal(isPrivateSeoRoute('/dashboard/library/'), true);
  assert.equal(isPrivateSeoRoute('/dashboard/summary/atomic-habits'), true);
  assert.equal(isPrivateSeoRoute('/DASHBOARD/LIBRARY'), true);
  assert.equal(isPrivateSeoRoute('/DaShBoArD/SuMmArY/atomic-habits/'), true);
  assert.equal(isPrivateSeoRoute('/dashboardish'), false);
});
