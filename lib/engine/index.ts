import { calculateBuyPath } from "./buyPath";
import { comparePaths, findBreakEvenYear } from "./compare";
import { calculateRentPath } from "./rentPath";
import type { ScenarioInputs, ScenarioResults } from "./types";

export type {
  AmortizationSchedule,
  AnnualAmortizationRow,
  BuyYearResult,
  ComparisonYearResult,
  DownPaymentInput,
  FilingStatus,
  LumpSumPrepayment,
  MaintenanceInput,
  MonthlyAmortizationRow,
  PurchaseMode,
  RentYearResult,
  ScenarioInputs,
  ScenarioResults,
  TaxAssumptions,
} from "./types";

export {
  buildAmortizationSchedule,
  calculateMonthlyMortgagePayment,
} from "./amortization";
export {
  calculateBuyPath,
  calculateClosingCosts,
  calculateDownPayment,
  calculateHomeSaleCapitalGainsTax,
  calculateInitialBuyerCashOutlay,
  calculateMortgageInterestTaxBenefit,
} from "./buyPath";
export { comparePaths, findBreakEvenYear } from "./compare";
export { toNominalDollars, toRealDollars } from "./inflation";
export { calculateRentPath } from "./rentPath";

export function calculate(inputs: ScenarioInputs): ScenarioResults {
  if (inputs.horizonYears < 1 || inputs.horizonYears > 40) {
    throw new Error("horizonYears must be between 1 and 40.");
  }

  if (inputs.saleYear < 1 || inputs.saleYear > inputs.horizonYears) {
    throw new Error("saleYear must be within the scenario horizon.");
  }

  const buyPath = calculateBuyPath(inputs);
  const rentPath = calculateRentPath(inputs, buyPath);
  const comparison = comparePaths(buyPath, rentPath, inputs.macro.inflationRate);
  const breakEvenYear = findBreakEvenYear(comparison);
  const saleYearResult = comparison[inputs.saleYear - 1];

  return {
    inputs,
    buyPath,
    rentPath,
    comparison,
    breakEvenYear,
    saleYearResult,
  };
}
