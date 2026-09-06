import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import sharp from 'sharp';

const logoPath = path.resolve('public/images/ta7leel-navbar-logo-mind-leaf.png');

test('the navbar brand asset is a wide transparent PNG', async () => {
  assert.equal(existsSync(logoPath), true, 'the selected navbar logo must exist');

  const metadata = await sharp(logoPath).metadata();

  assert.equal(metadata.format, 'png');
  assert.equal(metadata.hasAlpha, true);
  assert.ok(metadata.width && metadata.height);
  assert.ok(metadata.width / metadata.height >= 2.5, 'the logo must fit a horizontal navbar slot');
});
