import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readConfig = () => readFile('netlify.toml', 'utf8');

const extractBlocks = (source: string, opening: string) => {
  const lines = source.split(/\r?\n/);
  const starts = lines.reduce<number[]>((matches, line, index) => {
    if (line.trim() === opening) matches.push(index);
    return matches;
  }, []);

  return starts.map((start, index) => lines.slice(start, starts[index + 1]).join('\n'));
};

const getTomlString = (block: string, key: string) =>
  new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'm').exec(block)?.[1];

test('dashboard SPA rewrites are explicit and precede the 404 fallback', async () => {
  const config = await readConfig();
  const redirects = extractBlocks(config, '[[redirects]]');
  const exactIndex = redirects.findIndex(block => getTomlString(block, 'from') === '/dashboard');
  const wildcardIndex = redirects.findIndex(block => getTomlString(block, 'from') === '/dashboard/*');
  const fallbackIndex = redirects.findIndex(block => getTomlString(block, 'from') === '/*');

  assert.ok(exactIndex >= 0, 'Expected an exact /dashboard rewrite');
  assert.ok(wildcardIndex >= 0, 'Expected a wildcard /dashboard/* rewrite');
  assert.ok(fallbackIndex >= 0, 'Expected the existing /* fallback');
  assert.ok(exactIndex < fallbackIndex, 'Exact dashboard rewrite must precede the /* fallback');
  assert.ok(wildcardIndex < fallbackIndex, 'Wildcard dashboard rewrite must precede the /* fallback');

  for (const index of [exactIndex, wildcardIndex]) {
    assert.equal(getTomlString(redirects[index], 'to'), '/index.html');
    assert.match(redirects[index], /^\s*status\s*=\s*200\s*$/m);
  }
});

test('dashboard responses carry scoped noindex headers without changing the public security block', async () => {
  const config = await readConfig();
  const headers = extractBlocks(config, '[[headers]]');
  const exactIndex = headers.findIndex(block => getTomlString(block, 'for') === '/dashboard');
  const wildcardIndex = headers.findIndex(block => getTomlString(block, 'for') === '/dashboard/*');
  const publicIndex = headers.findIndex(block => getTomlString(block, 'for') === '/*');
  const exactHeader = headers.find(block => getTomlString(block, 'for') === '/dashboard');
  const wildcardHeader = headers.find(block => getTomlString(block, 'for') === '/dashboard/*');
  const publicHeader = headers.find(block => getTomlString(block, 'for') === '/*');
  const robotsHeader = 'X-Robots-Tag = "noindex, nofollow, noarchive"';
  const requiredSecurityHeaders = [
    'Content-Security-Policy = """',
    'X-Frame-Options = "SAMEORIGIN"',
    'X-Content-Type-Options = "nosniff"',
    'X-XSS-Protection = "1; mode=block"',
    'Referrer-Policy = "strict-origin-when-cross-origin"',
    'Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"',
    'Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"',
  ];

  assert.ok(exactIndex >= 0, 'Expected an exact /dashboard response header block');
  assert.ok(wildcardIndex >= 0, 'Expected a wildcard /dashboard/* response header block');
  assert.ok(publicIndex >= 0, 'Expected the existing public security header block');
  assert.ok(exactIndex < publicIndex, 'Exact dashboard headers must precede the /* header block');
  assert.ok(wildcardIndex < publicIndex, 'Wildcard dashboard headers must precede the /* header block');
  assert.ok(exactHeader, 'Expected an exact /dashboard response header block');
  assert.ok(wildcardHeader, 'Expected a wildcard /dashboard/* response header block');
  for (const header of [exactHeader, wildcardHeader]) {
    for (const requiredHeader of requiredSecurityHeaders) assert.ok(header.includes(requiredHeader), requiredHeader);
    assert.ok(header.includes(robotsHeader));
  }
  assert.ok(publicHeader, 'Expected the existing public security header block');
  assert.doesNotMatch(publicHeader, /X-Robots-Tag\s*=/);
});
