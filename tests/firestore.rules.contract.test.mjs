import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('reading challenge rules never grant a public read', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  const match = rules.match(/match \/reading_challenges\/\{challengeId\} \{([\s\S]*?)\n    \}/);
  assert.ok(match, 'reading_challenges match must remain explicit');
  assert.doesNotMatch(match[1], /allow\s+read\s*:\s*if\s+true\s*;/);
  assert.match(match[1], /allow\s+read\s*:\s*if\s+isAuthenticated\(\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid\s*;/);
});
