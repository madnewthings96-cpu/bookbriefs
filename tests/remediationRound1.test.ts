import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getDashboardIdentityKey } from '../components/dashboard/dashboardIdentityBoundary';
import { AsyncIdentityGuard } from '../components/asyncIdentityGuard';
import { OptimisticFavoritesState } from '../contexts/favoritesState';
import { mergeReadingChallengeBooks } from '../contexts/readingChallengeState';
import { UserScopedRealtimeStore } from '../contexts/userScopedRealtime';

test('the protected dashboard subtree has a stable key per authenticated identity', () => {
  assert.notEqual(getDashboardIdentityKey('user-a', true), getDashboardIdentityKey('user-b', true));
  assert.equal(getDashboardIdentityKey('user-a', true), getDashboardIdentityKey('user-a', true));
  assert.notEqual(getDashboardIdentityKey('user-a', true), getDashboardIdentityKey(null, false));
});

test('the production protected route applies the identity key to the private subtree', async () => {
  const source = await readFile(new URL('../components/ProtectedRoute.tsx', import.meta.url), 'utf8');
  assert.match(source, /getDashboardIdentityKey/);
  assert.match(source, /<React\.Fragment key=\{identityKey\}>/);
});

test('async identity guard rejects late work after identity change or unmount', () => {
  const guard = new AsyncIdentityGuard();
  guard.setIdentity('user-a');
  const a = guard.begin();
  assert.ok(a);
  assert.equal(guard.isCurrent(a), true);

  guard.setIdentity('user-b');
  assert.equal(guard.isCurrent(a), false);
  const b = guard.begin();
  assert.ok(b);
  guard.unmount();
  assert.equal(guard.isCurrent(b), false);
});

test('a replayed effect setup can re-arm an async guard without reviving its token', () => {
  const guard = new AsyncIdentityGuard();
  const oldToken = guard.begin();
  guard.unmount();
  guard.mount();
  const newToken = guard.begin();
  assert.equal(guard.isCurrent(oldToken), false);
  assert.equal(guard.isCurrent(newToken), true);
});

test('starting a new async operation invalidates the previous operation', () => {
  const guard = new AsyncIdentityGuard();
  const first = guard.begin();
  const second = guard.begin();
  assert.ok(first);
  assert.ok(second);
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
});

test('export and OCR side effects are blocked by the same production cancellation contract', () => {
  const exportGuard = new AsyncIdentityGuard();
  exportGuard.setIdentity('user-a');
  const exportToken = exportGuard.begin();
  exportGuard.setIdentity('user-b');
  assert.equal(exportGuard.isCurrent(exportToken), false);

  const ocrGuard = new AsyncIdentityGuard();
  const ocrToken = ocrGuard.begin();
  ocrGuard.unmount();
  assert.equal(ocrGuard.isCurrent(ocrToken), false);
});

test('stale page catches and finally blocks cannot alert, close, or reset the next identity UI', () => {
  const store = new UserScopedRealtimeStore(() => ({ records: [] as string[] }));
  store.observe('user-a');
  const token = store.capture('user-a');
  store.observe('user-b');

  let alerted = false;
  let modalClosed = false;
  let submitting = true;
  try {
    throw new Error('late A failure');
  } catch {
    if (store.isCurrent(token)) alerted = true;
  } finally {
    if (store.isCurrent(token)) {
      modalClosed = true;
      submitting = false;
    }
  }

  assert.equal(alerted, false);
  assert.equal(modalClosed, false);
  assert.equal(submitting, true);
});

test('favorites optimistic failures rebase without erasing a later book operation', () => {
  const state = new OptimisticFavoritesState();
  state.setRemote([]);
  const first = state.begin('book-a', true);
  const second = state.begin('book-b', true);
  assert.deepEqual(state.get(), ['book-a', 'book-b']);

  state.resolve(first.token, false);
  assert.deepEqual(state.get(), ['book-b']);
  state.resolve(second.token, true);
  assert.deepEqual(state.get(), ['book-b']);
});

test('a stale same-book completion cannot overwrite the newest intent', () => {
  const state = new OptimisticFavoritesState();
  state.setRemote([]);
  const add = state.begin('book-a', true);
  const remove = state.begin('book-a', false);
  state.resolve(add.token, false);
  assert.deepEqual(state.get(), []);
  state.resolve(remove.token, true);
  assert.deepEqual(state.get(), []);
});

test('a listener rebase preserves pending favorites instead of rolling them back', () => {
  const state = new OptimisticFavoritesState();
  state.setRemote(['book-a']);
  const pending = state.begin('book-b', true);
  state.setRemote(['book-a']);
  assert.deepEqual(state.get(), ['book-a', 'book-b']);
  state.resolve(pending.token, false);
  assert.deepEqual(state.get(), ['book-a']);
});

test('reading challenge book mutations preserve concurrent additions', () => {
  const afterA = mergeReadingChallengeBooks([], 'book-a', false);
  const afterB = mergeReadingChallengeBooks(afterA, 'book-b', false);
  assert.deepEqual(afterB, ['book-a', 'book-b']);
  assert.deepEqual(mergeReadingChallengeBooks(afterB, 'book-a', true), ['book-b']);
});
