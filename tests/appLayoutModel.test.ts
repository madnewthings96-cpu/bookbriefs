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
});
