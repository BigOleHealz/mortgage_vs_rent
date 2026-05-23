import type { ScenarioInputs } from "@/lib/engine";

export function baseScenario(overrides: Partial<ScenarioInputs> = {}): ScenarioInputs {
  const scenario: ScenarioInputs = {
    horizonYears: 40,
    saleYear: 15,
    property: {
      zipCode: "10001",
      homePrice: 500_000,
      purchaseMode: {
        kind: "mortgage",
        downPayment: { kind: "percent", value: 0.2 },
        mortgageRate: 0.07,
        loanTermYears: 30,
        pmiRate: 0.005,
        extraMonthlyPayment: 0,
        lumpSumPrepayments: [],
      },
      closingCostRate: 0.03,
    },
    ownershipCosts: {
      propertyTaxRate: 0.012,
      propertyTaxGrowthRate: 0,
      insuranceRate: 0.0035,
      insuranceGrowthRate: 0.03,
      hoaMonthly: 0,
      hoaGrowthRate: 0.03,
      maintenance: { kind: "percentOfHomeValue", rate: 0.01 },
      maintenanceGrowthRate: 0,
    },
    appreciation: {
      annualRate: 0.03,
      sellingCostRate: 0.07,
    },
    rent: {
      monthlyRent: 2_500,
      annualRentGrowthRate: 0.03,
      rentersInsuranceMonthly: 25,
    },
    investment: {
      expectedAnnualReturn: 0.07,
      annualTaxDrag: 0.005,
      taxAdvantagedAccountPercent: 0,
    },
    taxes: {
      filingStatus: "single",
      householdIncome: 175_000,
      standardDeduction: 15_000,
      federalMarginalRate: 0.24,
      stateMarginalRate: 0.06,
      stateAllowsMortgageInterestDeduction: true,
      longTermCapitalGainsRate: 0.15,
      stateCapitalGainsRate: 0.06,
      niitRate: 0,
    },
    macro: {
      inflationRate: 0.03,
    },
  };

  return {
    ...scenario,
    ...overrides,
    property: { ...scenario.property, ...overrides.property },
    ownershipCosts: {
      ...scenario.ownershipCosts,
      ...overrides.ownershipCosts,
    },
    appreciation: { ...scenario.appreciation, ...overrides.appreciation },
    rent: { ...scenario.rent, ...overrides.rent },
    investment: { ...scenario.investment, ...overrides.investment },
    taxes: { ...scenario.taxes, ...overrides.taxes },
    macro: { ...scenario.macro, ...overrides.macro },
  };
}
