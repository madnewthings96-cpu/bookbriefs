import assert from 'node:assert/strict';
import test from 'node:test';
import { SummaryVisitTracker } from '../components/summaryVisitModel';
import { UserScopedStore } from '../contexts/userScopedPersistence';

test('summary visit tracker waits for hydration and records one event per identity/book visit', () => {
  const tracker = new SummaryVisitTracker();
  tracker.observe('a');

  assert.equal(tracker.shouldRecord('a', 'atomic-habits', false), false);
  assert.equal(tracker.shouldRecord('a', 'atomic-habits', true), true);
  assert.equal(tracker.shouldRecord('a', 'atomic-habits', true), false);
  assert.equal(tracker.shouldRecord('a', 'atomic-habits', true), false);

  tracker.observe('b');
  assert.equal(tracker.shouldRecord('b', 'atomic-habits', false), false);
  assert.equal(tracker.shouldRecord('b', 'atomic-habits', true), true);
  assert.equal(tracker.shouldRecord('b', 'atomic-habits', true), false);
});

test('summary visit tracker survives StrictMode-like effect repeats and permits a new visit after logout', () => {
  const tracker = new SummaryVisitTracker();
  tracker.observe('a');

  const firstEffect = tracker.shouldRecord('a', 'deep-work', true);
  const strictModeRepeat = tracker.shouldRecord('a', 'deep-work', true);
  assert.equal(firstEffect, true);
  assert.equal(strictModeRepeat, false);

  tracker.observe(null);
  tracker.observe('a');
  assert.equal(tracker.shouldRecord('a', 'deep-work', true), true);
});

test('the first summary event is applied after the matching identity finishes hydration', async () => {
  const tracker = new SummaryVisitTracker();
  const store = new UserScopedStore(() => ({ events: [] as string[] }));
  tracker.observe('a');
  store.observe('a');

  const hydration = store.hydrate('a', async () => {
    await Promise.resolve();
    return { events: [] };
  });

  assert.equal(tracker.shouldRecord('a', 'atomic-habits', store.canWrite('a')), false);
  await hydration;
  assert.equal(tracker.shouldRecord('a', 'atomic-habits', store.canWrite('a')), true);
  assert.equal(store.update('a', (state) => ({ events: [...state.events, 'atomic-habits'] })), true);
  assert.deepEqual(store.getExposedState('a'), { events: ['atomic-habits'] });
});
