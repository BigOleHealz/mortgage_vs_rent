import { describe, expect, it } from "vitest";
import { calculateBuyPath, calculateRentPath } from "@/lib/engine";
import { baseScenario } from "./helpers";

describe("rent path", () => {
  it("invests the buyer cash outlay as the starting taxable portfolio", () => {
    const scenario = baseScenario({
      investment: {
        expectedAnnualReturn: 0,
        annualTaxDrag: 0,
        taxAdvantagedAccountPercent: 0,
      },
    });
    const buyPath = calculateBuyPath(scenario);
    const rentPath = calculateRentPath(scenario, buyPath);

    expect(rentPath[0].portfolioValue).toBeGreaterThan(115_000);
    expect(rentPath[0].taxableBasis).toBeGreaterThanOrEqual(115_000);
  });

  it("withdraws from the portfolio when renting costs more than owning", () => {
    const scenario = baseScenario({
      rent: {
        monthlyRent: 8_000,
        annualRentGrowthRate: 0.03,
        rentersInsuranceMonthly: 25,
      },
    });
    const buyPath = calculateBuyPath(scenario);
    const rentPath = calculateRentPath(scenario, buyPath);

    expect(rentPath[0].investedDifference).toBeLessThan(0);
    expect(rentPath[0].portfolioValue).toBeLessThan(115_000 * 1.065);
  });

  it("exempts tax-advantaged contributions from liquidation LTCG tax", () => {
    const taxableScenario = baseScenario({
      investment: {
        expectedAnnualReturn: 0.07,
        annualTaxDrag: 0,
        taxAdvantagedAccountPercent: 0,
      },
    });
    const advantagedScenario = baseScenario({
      investment: {
        expectedAnnualReturn: 0.07,
        annualTaxDrag: 0,
        taxAdvantagedAccountPercent: 1,
      },
    });

    const taxableRentPath = calculateRentPath(
      taxableScenario,
      calculateBuyPath(taxableScenario),
    );
    const advantagedRentPath = calculateRentPath(
      advantagedScenario,
      calculateBuyPath(advantagedScenario),
    );

    expect(advantagedRentPath[9].capitalGainsTax).toBeLessThan(
      taxableRentPath[9].capitalGainsTax,
    );
  });
});
