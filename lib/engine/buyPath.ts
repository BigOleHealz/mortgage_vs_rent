import { buildAmortizationSchedule } from "./amortization";
import type {
  AnnualAmortizationRow,
  BuyYearResult,
  MaintenanceInput,
  ScenarioInputs,
} from "./types";

const SALT_CAP = 10_000;
const SINGLE_HOME_SALE_EXCLUSION = 250_000;
const MARRIED_HOME_SALE_EXCLUSION = 500_000;

export function calculateInitialBuyerCashOutlay(inputs: ScenarioInputs): number {
  return calculateDownPayment(inputs) + calculateClosingCosts(inputs);
}

export function calculateDownPayment(inputs: ScenarioInputs): number {
  const { homePrice, purchaseMode } = inputs.property;

  if (purchaseMode.kind === "cash") {
    return homePrice;
  }

  if (purchaseMode.downPayment.kind === "percent") {
    return homePrice * purchaseMode.downPayment.value;
  }

  return Math.min(homePrice, Math.max(0, purchaseMode.downPayment.value));
}

export function calculateClosingCosts(inputs: ScenarioInputs): number {
  return inputs.property.homePrice * inputs.property.closingCostRate;
}

export function calculateBuyPath(inputs: ScenarioInputs): BuyYearResult[] {
  const downPayment = calculateDownPayment(inputs);
  const loanAmount =
    inputs.property.purchaseMode.kind === "cash"
      ? 0
      : Math.max(0, inputs.property.homePrice - downPayment);
  const amortization =
    inputs.property.purchaseMode.kind === "cash"
      ? null
      : buildAmortizationSchedule({
          loanAmount,
          homePrice: inputs.property.homePrice,
          annualInterestRate: inputs.property.purchaseMode.mortgageRate,
          termYears: inputs.property.purchaseMode.loanTermYears,
          extraMonthlyPayment: inputs.property.purchaseMode.extraMonthlyPayment,
          lumpSumPrepayments: inputs.property.purchaseMode.lumpSumPrepayments,
          pmiRate: inputs.property.purchaseMode.pmiRate,
          horizonYears: inputs.horizonYears,
        });

  const closingCosts = calculateClosingCosts(inputs);
  let cumulativeOutflow = downPayment + closingCosts;
  const rows: BuyYearResult[] = [];

  for (let year = 1; year <= inputs.horizonYears; year += 1) {
    const annualAmortization = amortization?.annualRows[year - 1] ?? zeroAmortizationRow(year);
    const beginningHomeValue = valueAtYearStart(inputs.property.homePrice, inputs.appreciation.annualRate, year);
    const homeValue = valueAtYearEnd(inputs.property.homePrice, inputs.appreciation.annualRate, year);
    const propertyTaxPaid =
      beginningHomeValue *
      inputs.ownershipCosts.propertyTaxRate *
      growthFactor(inputs.ownershipCosts.propertyTaxGrowthRate, year);
    const insurancePaid =
      beginningHomeValue *
      inputs.ownershipCosts.insuranceRate *
      growthFactor(inputs.ownershipCosts.insuranceGrowthRate, year);
    const hoaPaid =
      inputs.ownershipCosts.hoaMonthly *
      12 *
      growthFactor(inputs.ownershipCosts.hoaGrowthRate, year);
    const maintenancePaid = calculateMaintenance(
      inputs.ownershipCosts.maintenance,
      beginningHomeValue,
      inputs.ownershipCosts.maintenanceGrowthRate,
      year,
    );
    const taxBenefit = calculateMortgageInterestTaxBenefit(
      annualAmortization.interestPaid,
      propertyTaxPaid,
      inputs,
    );
    const annualOutflow =
      annualAmortization.principalPaid +
      annualAmortization.interestPaid +
      annualAmortization.extraPrincipalPaid +
      annualAmortization.lumpSumPaid +
      annualAmortization.pmiPaid +
      propertyTaxPaid +
      insurancePaid +
      hoaPaid +
      maintenancePaid -
      taxBenefit;

    cumulativeOutflow += annualOutflow;

    const sellingCosts = homeValue * inputs.appreciation.sellingCostRate;
    const capitalGainsTax = calculateHomeSaleCapitalGainsTax(homeValue, inputs);
    const saleProceeds = Math.max(
      0,
      homeValue -
        annualAmortization.endingBalance -
        sellingCosts -
        capitalGainsTax,
    );

    rows.push({
      year,
      homeValue,
      remainingMortgageBalance: annualAmortization.endingBalance,
      mortgagePrincipalPaid:
        annualAmortization.principalPaid +
        annualAmortization.extraPrincipalPaid +
        annualAmortization.lumpSumPaid,
      mortgageInterestPaid: annualAmortization.interestPaid,
      pmiPaid: annualAmortization.pmiPaid,
      propertyTaxPaid,
      insurancePaid,
      hoaPaid,
      maintenancePaid,
      taxBenefit,
      annualOutflow,
      cumulativeOutflow,
      sellingCosts,
      capitalGainsTax,
      saleProceeds,
      netWorth: saleProceeds,
    });
  }

  return rows;
}

export function calculateMortgageInterestTaxBenefit(
  mortgageInterestPaid: number,
  propertyTaxPaid: number,
  inputs: ScenarioInputs,
): number {
  if (mortgageInterestPaid <= 0) {
    return 0;
  }

  const itemizedDeduction = mortgageInterestPaid + Math.min(propertyTaxPaid, SALT_CAP);
  const excessDeduction = Math.max(0, itemizedDeduction - inputs.taxes.standardDeduction);
  const marginalRate =
    inputs.taxes.federalMarginalRate +
    (inputs.taxes.stateAllowsMortgageInterestDeduction
      ? inputs.taxes.stateMarginalRate
      : 0);

  return excessDeduction * marginalRate;
}

export function calculateHomeSaleCapitalGainsTax(
  homeValue: number,
  inputs: ScenarioInputs,
): number {
  const gain = Math.max(0, homeValue - inputs.property.homePrice);
  const exclusion =
    inputs.taxes.filingStatus === "marriedFilingJointly"
      ? MARRIED_HOME_SALE_EXCLUSION
      : SINGLE_HOME_SALE_EXCLUSION;
  const taxableGain = Math.max(0, gain - exclusion);

  return (
    taxableGain *
    (inputs.taxes.longTermCapitalGainsRate +
      inputs.taxes.stateCapitalGainsRate +
      inputs.taxes.niitRate)
  );
}

function calculateMaintenance(
  maintenance: MaintenanceInput,
  homeValue: number,
  growthRate: number,
  year: number,
): number {
  if (maintenance.kind === "percentOfHomeValue") {
    return homeValue * maintenance.rate * growthFactor(growthRate, year);
  }

  return maintenance.amount * growthFactor(growthRate, year);
}

function valueAtYearStart(
  homePrice: number,
  appreciationRate: number,
  year: number,
): number {
  return homePrice * (1 + appreciationRate) ** (year - 1);
}

function valueAtYearEnd(
  homePrice: number,
  appreciationRate: number,
  year: number,
): number {
  return homePrice * (1 + appreciationRate) ** year;
}

function growthFactor(rate: number, year: number): number {
  return (1 + rate) ** (year - 1);
}

function zeroAmortizationRow(year: number): AnnualAmortizationRow {
  return {
    year,
    startingBalance: 0,
    principalPaid: 0,
    interestPaid: 0,
    extraPrincipalPaid: 0,
    lumpSumPaid: 0,
    endingBalance: 0,
    pmiPaid: 0,
    pmiActiveAtYearEnd: false,
  };
}
