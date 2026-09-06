import assert from 'node:assert/strict';
import test from 'node:test';

test('trading tab keyboard navigation wraps and supports Home and End', async () => {
  let navigation: typeof import('../components/trading/tradingTabNavigation');
  try {
    navigation = await import('../components/trading/tradingTabNavigation');
  } catch {
    assert.fail('trading tab keyboard navigation helper must exist');
  }

  assert.equal(navigation.getNextTradingTabIndex('ArrowRight', 5, 6), 0);
  assert.equal(navigation.getNextTradingTabIndex('ArrowLeft', 0, 6), 5);
  assert.equal(navigation.getNextTradingTabIndex('Home', 3, 6), 0);
  assert.equal(navigation.getNextTradingTabIndex('End', 2, 6), 5);
  assert.equal(navigation.getNextTradingTabIndex('Tab', 2, 6), null);
});
