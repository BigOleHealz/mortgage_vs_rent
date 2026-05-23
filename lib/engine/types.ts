export type FilingStatus = "single" | "marriedFilingJointly" | "headOfHousehold";

export type DownPaymentInput =
  | { kind: "percent"; value: number }
  | { kind: "amount"; value: number };

export type PurchaseMode =
  | {
      kind: "mortgage";
      downPayment: DownPaymentInput;
      mortgageRate: number;
      loanTermYears: number;
      pmiRate: number;
      extraMonthlyPayment: number;
      lumpSumPrepayments: LumpSumPrepayment[];
    }
  | { kind: "cash" };

export type MaintenanceInput =
  | { kind: "percentOfHomeValue"; rate: number }
  | { kind: "annualAmount"; amount: number };

export interface LumpSumPrepayment {
  year: number;
  amount: number;
}

export interface TaxAssumptions {
  filingStatus: FilingStatus;
  householdIncome: number;
  standardDeduction: number;
  federalMarginalRate: number;
  stateMarginalRate: number;
  stateAllowsMortgageInterestDeduction: boolean;
  longTermCapitalGainsRate: number;
  stateCapitalGainsRate: number;
  niitRate: number;
}

export interface ScenarioInputs {
  horizonYears: number;
  saleYear: number;
  property: {
    zipCode: string;
    homePrice: number;
    purchaseMode: PurchaseMode;
    closingCostRate: number;
  };
  ownershipCosts: {
    propertyTaxRate: number;
    propertyTaxGrowthRate: number;
    insuranceRate: number;
    insuranceGrowthRate: number;
    hoaMonthly: number;
    hoaGrowthRate: number;
    maintenance: MaintenanceInput;
    maintenanceGrowthRate: number;
  };
  appreciation: {
    annualRate: number;
    sellingCostRate: number;
  };
  rent: {
    monthlyRent: number;
    annualRentGrowthRate: number;
    rentersInsuranceMonthly: number;
  };
  investment: {
    expectedAnnualReturn: number;
    annualTaxDrag: number;
    taxAdvantagedAccountPercent: number;
  };
  taxes: TaxAssumptions;
  macro: {
    inflationRate: number;
  };
}

export interface MonthlyAmortizationRow {
  month: number;
  year: number;
  startingBalance: number;
  scheduledPayment: number;
  interestPayment: number;
  principalPayment: number;
  extraPrincipalPayment: number;
  lumpSumPayment: number;
  endingBalance: number;
  pmiPayment: number;
  pmiActive: boolean;
}

export interface AnnualAmortizationRow {
  year: number;
  startingBalance: number;
  principalPaid: number;
  interestPaid: number;
  extraPrincipalPaid: number;
  lumpSumPaid: number;
  endingBalance: number;
  pmiPaid: number;
  pmiActiveAtYearEnd: boolean;
}

export interface AmortizationSchedule {
  monthlyPayment: number;
  monthlyRows: MonthlyAmortizationRow[];
  annualRows: AnnualAmortizationRow[];
  payoffMonth: number | null;
}

export interface BuyYearResult {
  year: number;
  homeValue: number;
  remainingMortgageBalance: number;
  mortgagePrincipalPaid: number;
  mortgageInterestPaid: number;
  pmiPaid: number;
  propertyTaxPaid: number;
  insurancePaid: number;
  hoaPaid: number;
  maintenancePaid: number;
  taxBenefit: number;
  annualOutflow: number;
  cumulativeOutflow: number;
  sellingCosts: number;
  capitalGainsTax: number;
  saleProceeds: number;
  netWorth: number;
}

export interface RentYearResult {
  year: number;
  rentPaid: number;
  rentersInsurancePaid: number;
  annualOutflow: number;
  investedDifference: number;
  taxablePortfolioValue: number;
  taxAdvantagedPortfolioValue: number;
  portfolioValue: number;
  taxableBasis: number;
  capitalGainsTax: number;
  netWorth: number;
}

export interface ComparisonYearResult {
  year: number;
  buyerNetWorth: number;
  renterNetWorth: number;
  delta: number;
  realBuyerNetWorth: number;
  realRenterNetWorth: number;
  realDelta: number;
}

export interface ScenarioResults {
  inputs: ScenarioInputs;
  buyPath: BuyYearResult[];
  rentPath: RentYearResult[];
  comparison: ComparisonYearResult[];
  breakEvenYear: number | null;
  saleYearResult: ComparisonYearResult;
}
