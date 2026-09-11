import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('reading challenge rules never grant a public read', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  const match = rules.match(/match \/reading_challenges\/\{challengeId\} \{([\s\S]*?)\n    \}/);
  assert.ok(match, 'reading_challenges match must remain explicit');
  assert.doesNotMatch(match[1], /allow\s+read\s*:\s*if\s+true\s*;/);
  assert.match(match[1], /allow\s+read\s*:\s*if\s+isReadingChallengePathForUser\(challengeId\)/);
  assert.match(rules, /challengeId\.size\(\)\s*==\s*request\.auth\.uid\.size\(\)\s*\+\s*5/);
  assert.match(rules, /challengeId\[0:request\.auth\.uid\.size\(\)\]\s*==\s*request\.auth\.uid/);
  assert.match(rules, /challengeId\[request\.auth\.uid\.size\(\)\]\s*==\s*'_'/);
  assert.match(rules, /challengeId\[request\.auth\.uid\.size\(\)\s*\+\s*1:request\.auth\.uid\.size\(\)\s*\+\s*5\][\s\S]*\.matches\('\^\(20\(2\[0-9\]\|\[3-9\]\[0-9\]\)\|2100\)\$'\)/);
  assert.match(match[1], /request\.resource\.data\.userId\s*==\s*request\.auth\.uid/);
  assert.match(match[1], /resource\.data\.userId\s*==\s*request\.auth\.uid/);
  assert.match(match[1], /string\(request\.resource\.data\.year\)/);
  assert.match(match[1], /string\(resource\.data\.year\)/);
});

test('reading challenge reads and writes are UID-namespaced by the document ID', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert.match(rules, /isReadingChallengePathForUser\(challengeId\)/g);
  const match = rules.match(/match \/reading_challenges\/\{challengeId\} \{([\s\S]*?)\n    \}/);
  assert.ok(match);
  assert.doesNotMatch(match[1], /allow\s+read\s*:\s*if\s*true/);
});
