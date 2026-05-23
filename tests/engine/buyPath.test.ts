import { describe, expect, it } from "vitest";
import {
  calculateBuyPath,
  calculateDownPayment,
  calculateHomeSaleCapitalGainsTax,
  calculateInitialBuyerCashOutlay,
  calculateMortgageInterestTaxBenefit,
} from "@/lib/engine";
import { baseScenario } from "./helpers";

describe("buy path", () => {
  it("handles cash purchases without mortgage costs", () => {
    const scenario = baseScenario({
      property: {
        ...baseScenario().property,
        purchaseMode: { kind: "cash" },
      },
    });
    const buyPath = calculateBuyPath(scenario);

    expect(calculateDownPayment(scenario)).toBe(500_000);
    expect(calculateInitialBuyerCashOutlay(scenario)).toBe(515_000);
    expect(buyPath[0].mortgageInterestPaid).toBe(0);
    expect(buyPath[0].pmiPaid).toBe(0);
    expect(buyPath[0].remainingMortgageBalance).toBe(0);
  });

  it("supports zero down mortgages", () => {
    const scenario = baseScenario({
      property: {
        ...baseScenario().property,
        purchaseMode: {
          kind: "mortgage",
          downPayment: { kind: "percent", value: 0 },
          mortgageRate: 0.07,
          loanTermYears: 30,
          pmiRate: 0.005,
          extraMonthlyPayment: 0,
          lumpSumPrepayments: [],
        },
      },
    });
    const buyPath = calculateBuyPath(scenario);

    expect(calculateDownPayment(scenario)).toBe(0);
    expect(buyPath[0].pmiPaid).toBeGreaterThan(0);
    expect(buyPath[0].remainingMortgageBalance).toBeGreaterThan(490_000);
  });

  it("computes sale proceeds in year 1", () => {
    const scenario = baseScenario({ saleYear: 1 });
    const buyPath = calculateBuyPath(scenario);

    expect(buyPath[0].saleProceeds).toBeGreaterThan(0);
    expect(buyPath[0].sellingCosts).toBeCloseTo(500_000 * 1.03 * 0.07, 2);
  });

  it("handles negative appreciation", () => {
    const scenario = baseScenario({
      appreciation: { annualRate: -0.02, sellingCostRate: 0.07 },
    });
    const buyPath = calculateBuyPath(scenario);

    expect(buyPath[4].homeValue).toBeLessThan(500_000);
    expect(buyPath[4].capitalGainsTax).toBe(0);
  });

  it("only gives a mortgage interest benefit above the standard deduction", () => {
    const scenario = baseScenario();

    expect(calculateMortgageInterestTaxBenefit(5_000, 4_000, scenario)).toBe(0);
    expect(calculateMortgageInterestTaxBenefit(25_000, 8_000, scenario)).toBeCloseTo(
      (25_000 + 8_000 - 15_000) * 0.3,
      2,
    );
  });

  it("applies home sale capital gains exclusions by filing status", () => {
    const singleScenario = baseScenario({
      appreciation: { annualRate: 0.08, sellingCostRate: 0.07 },
    });
    const marriedScenario = baseScenario({
      appreciation: { annualRate: 0.08, sellingCostRate: 0.07 },
      taxes: {
        ...baseScenario().taxes,
        filingStatus: "marriedFilingJointly",
      },
    });
    const homeValue = 900_000;

    expect(calculateHomeSaleCapitalGainsTax(homeValue, singleScenario)).toBeCloseTo(
      150_000 * 0.21,
      2,
    );
    expect(calculateHomeSaleCapitalGainsTax(homeValue, marriedScenario)).toBe(0);
  });
});
