import assert from 'node:assert/strict';
import test from 'node:test';
import { getProtectedRouteDecision, getSafePostAuthDestination } from '../components/authRouteModel';

test('protected routes wait for auth before allowing or redirecting', () => {
  assert.equal(getProtectedRouteDecision(false, false), 'loading');
  assert.equal(getProtectedRouteDecision(false, true), 'loading');
  assert.equal(getProtectedRouteDecision(true, true), 'allow');
  assert.equal(getProtectedRouteDecision(true, false), 'redirect');
  assert.equal(getProtectedRouteDecision(true, true, 'observer failed'), 'redirect');
});

test('post-auth redirects accept dashboard paths only', () => {
  assert.equal(getSafePostAuthDestination('/dashboard/notes?book=atomic-habits'), '/dashboard/notes?book=atomic-habits');
  assert.equal(getSafePostAuthDestination('/DaShBoArD/Library'), '/DaShBoArD/Library');
  assert.equal(
    getSafePostAuthDestination('/DASHBOARD/Summary/atomic-habits?from=login#notes'),
    '/DASHBOARD/Summary/atomic-habits?from=login#notes',
  );
  assert.equal(getSafePostAuthDestination('/profile'), '/dashboard');
  assert.equal(getSafePostAuthDestination('https://evil.example'), '/dashboard');
  assert.equal(getSafePostAuthDestination('//evil.example/dashboard/notes'), '/dashboard');
  assert.equal(getSafePostAuthDestination(undefined), '/dashboard');
});

test('post-auth redirects validate dashboard membership after dot-segment normalization', () => {
  assert.equal(getSafePostAuthDestination('/dashboard/../summary/atomic-habits'), '/dashboard');
  assert.equal(
    getSafePostAuthDestination('/DASHBOARD/%2e%2e/Summary/atomic-habits?from=login#notes'),
    '/dashboard',
  );
  assert.equal(
    getSafePostAuthDestination('/DaShBoArD/./Summary/atomic-habits?from=login#notes'),
    '/DaShBoArD/./Summary/atomic-habits?from=login#notes',
  );
});
