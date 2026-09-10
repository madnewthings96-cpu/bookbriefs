import assert from 'node:assert/strict';
import test from 'node:test';
import { UserScopedRealtimeStore } from '../contexts/userScopedRealtime';

const empty = () => ({
  records: [] as string[],
  error: null as string | null,
});

test('identity changes synchronously expose empty state for the next user', () => {
  const store = new UserScopedRealtimeStore(empty);

  store.observe('user-a');
  const tokenA = store.capture('user-a');
  assert.ok(tokenA);
  assert.equal(store.publish(tokenA, { records: ['A'], error: null }), true);
  assert.deepEqual(store.getExposedState('user-a'), { records: ['A'], error: null });

  store.observe('user-b');
  assert.deepEqual(store.getExposedState('user-b'), { records: [], error: null });
  assert.deepEqual(store.getExposedState('user-a'), { records: [], error: null });
});

test('logout clears private state and rejects writes captured for the old identity', () => {
  const store = new UserScopedRealtimeStore(empty);

  store.observe('user-a');
  const tokenA = store.capture('user-a');
  assert.ok(tokenA);
  store.publish(tokenA, { records: ['A'], error: null });

  store.observe(null);
  assert.deepEqual(store.getExposedState(null), { records: [], error: null });
  assert.equal(store.update(tokenA, (state) => ({ ...state, records: ['stale'] })), false);
});

test('late snapshots and errors from user A cannot publish after switching to user B', () => {
  const store = new UserScopedRealtimeStore(empty);
  let emitA: ((value: string[]) => void) | undefined;
  let failA: ((error: Error) => void) | undefined;
  const values: string[][] = [];
  const errors: string[] = [];

  store.observe('user-a');
  store.subscribe<string[]>(
    'user-a',
    (_token, onValue, onError) => {
      emitA = onValue;
      failA = onError;
      return () => undefined;
    },
    (value, token) => {
      values.push(value);
      store.publish(token, { records: value, error: null });
    },
    (error, token) => {
      errors.push(String(error));
      store.publish(token, { records: [], error: String(error) });
    },
  );

  store.observe('user-b');
  emitA?.(['A-late']);
  failA?.(new Error('A failed late'));

  assert.deepEqual(values, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(store.getExposedState('user-b'), { records: [], error: null });
});

test('the current subscription can publish a recoverable failure without leaking data', () => {
  const store = new UserScopedRealtimeStore(empty);

  store.observe('user-a');
  store.subscribe(
    'user-a',
    (_token, _onValue, onError) => {
      onError(new Error('temporary failure'));
      return () => undefined;
    },
    (_value, token) => {
      store.publish(token, { records: ['unexpected'], error: null });
    },
    (error, token) => {
      store.publish(token, { records: [], error: String(error) });
    },
  );

  assert.deepEqual(store.getExposedState('user-a'), {
    records: [],
    error: 'Error: temporary failure',
  });
});

test('subscription cleanup runs on identity change and returned cleanup is idempotent', () => {
  const store = new UserScopedRealtimeStore(empty);
  let cleanupCount = 0;

  store.observe('user-a');
  const dispose = store.subscribe(
    'user-a',
    () => () => {
      cleanupCount += 1;
    },
    () => undefined,
  );

  store.observe('user-b');
  assert.equal(cleanupCount, 1);
  dispose();
  assert.equal(cleanupCount, 1);
});

test('captured mutation tokens remain bound to their original UID and version', () => {
  const store = new UserScopedRealtimeStore(empty);

  store.observe('user-a');
  const tokenA = store.capture('user-a');
  assert.ok(tokenA);
  store.observe('user-b');
  const tokenB = store.capture('user-b');

  assert.equal(store.isCurrent(tokenA), false);
  assert.ok(tokenB);
  assert.equal(store.isCurrent(tokenB), true);
  assert.equal(store.update(tokenA, (state) => ({ ...state, records: ['A'] })), false);
  assert.equal(store.update(tokenB, (state) => ({ ...state, records: ['B'] })), true);
  assert.deepEqual(store.getExposedState('user-b'), { records: ['B'], error: null });
});

test('destroy invalidates retained async completions after a page unmounts', () => {
  const store = new UserScopedRealtimeStore(empty);
  store.observe('user-a');
  const token = store.capture('user-a');
  assert.ok(token);

  store.destroy();
  assert.equal(store.isCurrent(token), false);
  assert.equal(store.update(token, (state) => ({ ...state, records: ['late'] })), false);
});

test('a replayed setup can re-arm a destroyed store without reviving old tokens', () => {
  const store = new UserScopedRealtimeStore(empty);
  store.observe('user-a');
  const oldToken = store.capture('user-a');
  assert.ok(oldToken);
  store.destroy();

  store.observe('user-a');
  const newToken = store.capture('user-a');
  assert.ok(newToken);
  assert.equal(store.isCurrent(oldToken), false);
  assert.equal(store.isCurrent(newToken), true);
});
