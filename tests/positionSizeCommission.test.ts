import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePositionSizeWithCommission } from '../utils/positionSizeCommission';

const defaults = {
  riskAmount: 100,
  stopLoss: 20,
  pipValue: 10,
  includeCommission: false,
  commissionPerLot: 7,
  commissionBasis: 'roundTrip' as const,
};

test('disabled commission preserves the original position size and ignores the saved fee', () => {
  const result = calculatePositionSizeWithCommission({ ...defaults, commissionPerLot: NaN });
  assert.equal(result.standardLots, 0.5);
  assert.equal(result.estimatedCommission, 0);
  assert.equal(result.totalLossAtStop, 100);
});

test('round-trip commission reduces the executable lot size and stays within budget', () => {
  const result = calculatePositionSizeWithCommission({ ...defaults, includeCommission: true });
  assert.equal(result.standardLots, 0.48);
  assert.ok(Math.abs(result.estimatedCommission - 3.36) < 1e-10);
  assert.equal(result.stopLossAmount, 96);
  assert.ok(Math.abs(result.totalLossAtStop - 99.36) < 1e-10);
  assert.ok(result.totalLossAtStop <= defaults.riskAmount);
});

test('a per-side rate includes both opening and closing fees', () => {
  const roundTrip = calculatePositionSizeWithCommission({ ...defaults, includeCommission: true });
  const perSide = calculatePositionSizeWithCommission({
    ...defaults, includeCommission: true, commissionPerLot: 3.5, commissionBasis: 'perSide',
  });
  assert.deepEqual(perSide, roundTrip);
});

test('zero commission is accepted and a too-small budget does not recommend an oversized minimum lot', () => {
  assert.equal(calculatePositionSizeWithCommission({ ...defaults, includeCommission: true, commissionPerLot: 0 }).standardLots, 0.5);
  assert.equal(calculatePositionSizeWithCommission({ ...defaults, includeCommission: true, riskAmount: 1 }).standardLots, 0);
});

test('negative and non-finite fees are rejected when commission is enabled', () => {
  for (const commissionPerLot of [-1, NaN, Infinity]) {
    assert.throws(() => calculatePositionSizeWithCommission({ ...defaults, includeCommission: true, commissionPerLot }));
  }
});

test('commission uses the supplied account-currency pip value and monetary risk budget', () => {
  const result = calculatePositionSizeWithCommission({ ...defaults, riskAmount: 250, pipValue: 8, includeCommission: true, commissionPerLot: 6 });
  assert.equal(result.standardLots, 1.5);
  assert.equal(result.estimatedCommission, 9);
  assert.equal(result.totalLossAtStop, 249);
});
