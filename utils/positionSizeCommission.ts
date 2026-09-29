export type CommissionBasis = 'perSide' | 'roundTrip';

interface PositionSizeInputs {
  riskAmount: number;
  stopLoss: number;
  pipValue: number;
  includeCommission: boolean;
  commissionPerLot: number;
  commissionBasis: CommissionBasis;
}

export const calculatePositionSizeWithCommission = ({
  riskAmount,
  stopLoss,
  pipValue,
  includeCommission,
  commissionPerLot,
  commissionBasis,
}: PositionSizeInputs) => {
  if (![riskAmount, stopLoss, pipValue].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Risk, stop loss, and pip value must be finite positive numbers.');
  }
  if (includeCommission && (!Number.isFinite(commissionPerLot) || commissionPerLot < 0)) {
    throw new Error('Commission must be a finite non-negative number.');
  }

  const roundTripCommissionPerLot = includeCommission
    ? commissionPerLot * (commissionBasis === 'perSide' ? 2 : 1)
    : 0;
  const lossPerLot = stopLoss * pipValue + roundTripCommissionPerLot;
  if (!Number.isFinite(lossPerLot) || lossPerLot <= 0) {
    throw new Error('The loss per lot is outside the supported range.');
  }
  const calculatedLots = riskAmount / lossPerLot;
  // The UI displays hundredths of a standard lot. Round down when costs are
  // included so the displayed executable size stays within the risk budget.
  const standardLots = includeCommission ? Math.floor(calculatedLots * 100) / 100 : calculatedLots;
  const estimatedCommission = standardLots * roundTripCommissionPerLot;
  const stopLossAmount = standardLots * stopLoss * pipValue;

  return {
    standardLots,
    estimatedCommission,
    stopLossAmount,
    totalLossAtStop: stopLossAmount + estimatedCommission,
  };
};
