import { calculateInitialBuyerCashOutlay } from "./buyPath";
import type { BuyYearResult, RentYearResult, ScenarioInputs } from "./types";

export function calculateRentPath(
  inputs: ScenarioInputs,
  buyPath: BuyYearResult[],
): RentYearResult[] {
  let taxablePortfolioValue = calculateInitialBuyerCashOutlay(inputs);
  let taxableBasis = taxablePortfolioValue;
  let taxAdvantagedPortfolioValue = 0;
  let taxAdvantagedBasis = 0;
  const rows: RentYearResult[] = [];

  for (let year = 1; year <= inputs.horizonYears; year += 1) {
    taxablePortfolioValue *= 1 + inputs.investment.expectedAnnualReturn;
    taxAdvantagedPortfolioValue *= 1 + inputs.investment.expectedAnnualReturn;
    taxablePortfolioValue *= 1 - inputs.investment.annualTaxDrag;

    const rentPaid =
      inputs.rent.monthlyRent *
      12 *
      (1 + inputs.rent.annualRentGrowthRate) ** (year - 1);
    const rentersInsurancePaid = inputs.rent.rentersInsuranceMonthly * 12;
    const annualOutflow = rentPaid + rentersInsurancePaid;
    const investedDifference = buyPath[year - 1].annualOutflow - annualOutflow;

    if (investedDifference >= 0) {
      const taxAdvantagedContribution =
        investedDifference * inputs.investment.taxAdvantagedAccountPercent;
      const taxableContribution = investedDifference - taxAdvantagedContribution;
      taxablePortfolioValue += taxableContribution;
      taxableBasis += taxableContribution;
      taxAdvantagedPortfolioValue += taxAdvantagedContribution;
      taxAdvantagedBasis += taxAdvantagedContribution;
    } else {
      const withdrawal = Math.min(
        -investedDifference,
        taxablePortfolioValue + taxAdvantagedPortfolioValue,
      );
      const taxableShare = calculateShare(
        taxablePortfolioValue,
        taxablePortfolioValue + taxAdvantagedPortfolioValue,
      );
      const taxableWithdrawal = Math.min(
        taxablePortfolioValue,
        withdrawal * taxableShare,
      );
      const taxAdvantagedWithdrawal = Math.min(
        taxAdvantagedPortfolioValue,
        withdrawal - taxableWithdrawal,
      );

      taxableBasis = reduceBasisForWithdrawal(
        taxableBasis,
        taxablePortfolioValue,
        taxableWithdrawal,
      );
      taxAdvantagedBasis = reduceBasisForWithdrawal(
        taxAdvantagedBasis,
        taxAdvantagedPortfolioValue,
        taxAdvantagedWithdrawal,
      );
      taxablePortfolioValue -= taxableWithdrawal;
      taxAdvantagedPortfolioValue -= taxAdvantagedWithdrawal;
    }

    const taxableGain = Math.max(0, taxablePortfolioValue - taxableBasis);
    const capitalGainsTax =
      taxableGain *
      (inputs.taxes.longTermCapitalGainsRate +
        inputs.taxes.stateCapitalGainsRate +
        inputs.taxes.niitRate);
    const portfolioValue = taxablePortfolioValue + taxAdvantagedPortfolioValue;

    rows.push({
      year,
      rentPaid,
      rentersInsurancePaid,
      annualOutflow,
      investedDifference,
      taxablePortfolioValue,
      taxAdvantagedPortfolioValue,
      portfolioValue,
      taxableBasis,
      capitalGainsTax,
      netWorth: portfolioValue - capitalGainsTax,
    });
  }

  return rows;
}

function calculateShare(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return value / total;
}

function reduceBasisForWithdrawal(
  basis: number,
  portfolioValue: number,
  withdrawal: number,
): number {
  if (portfolioValue <= 0) {
    return 0;
  }

  return Math.max(0, basis - basis * (withdrawal / portfolioValue));
}
