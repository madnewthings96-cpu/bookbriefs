import assert from 'node:assert/strict';
import test from 'node:test';
import { getProtectedRouteDecision, getSafePostAuthDestination } from '../components/authRouteModel';

test('protected routes wait for auth before allowing or redirecting', () => {
  assert.equal(getProtectedRouteDecision(false, false), 'loading');
  assert.equal(getProtectedRouteDecision(false, true), 'loading');
  assert.equal(getProtectedRouteDecision(true, true), 'allow');
  assert.equal(getProtectedRouteDecision(true, false), 'redirect');
});

test('post-auth redirects accept dashboard paths only', () => {
  assert.equal(getSafePostAuthDestination('/dashboard/notes?book=atomic-habits'), '/dashboard/notes?book=atomic-habits');
  assert.equal(getSafePostAuthDestination('/profile'), '/dashboard');
  assert.equal(getSafePostAuthDestination('https://evil.example'), '/dashboard');
  assert.equal(getSafePostAuthDestination(undefined), '/dashboard');
});
