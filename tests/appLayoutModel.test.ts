import assert from 'node:assert/strict';
import test from 'node:test';

test('authentication routes use the focused standalone app shell', async () => {
  let model: typeof import('../components/appLayoutModel');

  try {
    model = await import('../components/appLayoutModel');
  } catch {
    assert.fail('the shared app layout model must exist');
  }

  assert.equal(model.isStandaloneAppRoute('/login'), true);
  assert.equal(model.isStandaloneAppRoute('/signup'), true);
  assert.equal(model.isStandaloneAppRoute('/login/'), true);
  assert.equal(model.isStandaloneAppRoute('/LOGIN'), true);
  assert.equal(model.isStandaloneAppRoute('/SignUp///'), true);
  assert.equal(model.isStandaloneAppRoute('/summaries'), false);
  assert.equal(model.isStandaloneAppRoute('/privacy-policy'), false);

  assert.equal(model.getAppLayoutFamily('/'), 'public');
  assert.equal(model.getAppLayoutFamily('/login'), 'standalone');
  assert.equal(model.getAppLayoutFamily('/dashboard'), 'dashboard');
  assert.equal(model.getAppLayoutFamily('/dashboard/library/'), 'dashboard');
  assert.equal(model.getAppLayoutFamily('/profile'), 'dashboard');
  assert.equal(model.getAppLayoutFamily('/finance-tracker'), 'dashboard');
  assert.equal(model.isDashboardAppRoute('/dashboardish'), false);
  assert.equal(model.isFocusedDashboardRoute('/dashboard/summary/atomic-habits'), true);
  assert.equal(model.isFocusedDashboardRoute('/summary/atomic-habits'), false);
});
