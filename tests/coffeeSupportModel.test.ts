import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COFFEE_SUPPORT_ACTIVE_DELAY_MS,
  COFFEE_SUPPORT_COOLDOWN_MS,
  hasMeaningfulCoffeeSupportScroll,
  shouldRevealCoffeeSupport,
} from '../components/coffeeSupportModel';

const NOW = Date.UTC(2026, 8, 8, 22, 0, 0);

test('reveals only after five minutes of visible time and meaningful engagement', () => {
  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS - 1,
      hasMeaningfulEngagement: true,
      lastShownAt: null,
      now: NOW,
    }),
    false,
  );

  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: false,
      lastShownAt: null,
      now: NOW,
    }),
    false,
  );

  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt: null,
      now: NOW,
    }),
    true,
  );
});

test('does not reveal again during the fourteen-day cooldown', () => {
  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt: NOW - COFFEE_SUPPORT_COOLDOWN_MS + 1,
      now: NOW,
    }),
    false,
  );

  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt: NOW - COFFEE_SUPPORT_COOLDOWN_MS,
      now: NOW,
    }),
    true,
  );
});

test('ignores invalid or future timestamps instead of hiding the card forever', () => {
  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt: Number.NaN,
      now: NOW,
    }),
    true,
  );

  assert.equal(
    shouldRevealCoffeeSupport({
      activeTimeMs: COFFEE_SUPPORT_ACTIVE_DELAY_MS,
      hasMeaningfulEngagement: true,
      lastShownAt: NOW + 1,
      now: NOW,
    }),
    true,
  );
});

test('treats scrolling through thirty-five percent of the page as meaningful engagement', () => {
  assert.equal(
    hasMeaningfulCoffeeSupportScroll({
      scrollY: 349,
      viewportHeight: 800,
      documentHeight: 1800,
    }),
    false,
  );

  assert.equal(
    hasMeaningfulCoffeeSupportScroll({
      scrollY: 350,
      viewportHeight: 800,
      documentHeight: 1800,
    }),
    true,
  );

  assert.equal(
    hasMeaningfulCoffeeSupportScroll({
      scrollY: 100,
      viewportHeight: 800,
      documentHeight: 800,
    }),
    false,
  );
});
