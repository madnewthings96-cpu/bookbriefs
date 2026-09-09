import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeDashboardCalculatorPath } from '../pages/CalculatorsPage';

test('dashboard calculator aliases normalize mixed-case paths before route selection', () => {
  assert.equal(
    normalizeDashboardCalculatorPath('/DASHBOARD/CALCULATORS/PIP-VALUE/'),
    '/calculators/pip-value',
  );
  assert.equal(
    normalizeDashboardCalculatorPath('/DaShBoArD/CaLcUlAtOrS/FiRe'),
    '/calculators/fire',
  );
});
