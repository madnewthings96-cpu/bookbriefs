import assert from 'node:assert/strict';
import test from 'node:test';

test('the hero promise cycles through every phrase before wrapping', async () => {
  let rotation: typeof import('../components/heroPhraseRotation');

  try {
    rotation = await import('../components/heroPhraseRotation');
  } catch {
    assert.fail('the hero phrase rotation module must exist');
  }

  const expectedPhrases = [
    'Apply immediately.',
    'Think more clearly.',
    'Remember what matters.',
    'Decide with confidence.',
    'Build better habits.',
    'Put insight to work.',
  ];

  assert.deepEqual(rotation.HERO_PHRASES, expectedPhrases);

  let index = 0;
  const cycle = expectedPhrases.map(() => {
    const phrase = rotation.HERO_PHRASES[index];
    index = rotation.getNextHeroPhraseIndex(index);
    return phrase;
  });

  assert.deepEqual(cycle, expectedPhrases);
  assert.equal(index, 0);
});
