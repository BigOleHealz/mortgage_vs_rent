import { describe, expect, it } from "vitest";
import { calculate } from "@/lib/engine";
import { deriveTax } from "@/lib/data/derive-tax";
import { baseScenario } from "./helpers";

describe("worked example", () => {
  it("calculates the requested 500K home / year 15 sale scenario", () => {
    const scenario = baseScenario({
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
      taxes: deriveTax("single", 175_000, "NY"),
      macro: {
        inflationRate: 0.03,
      },
    });

    const results = calculate(scenario);

    if (process.env.PRINT_WORKED_EXAMPLE === "1") {
      const rows = results.comparison.map((row) => {
        const buy = results.buyPath[row.year - 1];
        const rent = results.rentPath[row.year - 1];

        return {
          year: row.year,
          homeValue: Math.round(buy.homeValue),
          remainingMortgage: Math.round(buy.remainingMortgageBalance),
          buyerAnnualOutflow: Math.round(buy.annualOutflow),
          buyerNetWorth: Math.round(row.buyerNetWorth),
          rentAnnualOutflow: Math.round(rent.annualOutflow),
          investedDifference: Math.round(rent.investedDifference),
          renterNetWorth: Math.round(row.renterNetWorth),
          delta: Math.round(row.delta),
          realDelta: Math.round(row.realDelta),
        };
      });

      console.log(JSON.stringify({ breakEvenYear: results.breakEvenYear }, null, 2));
      console.table(rows);
    }

    expect(results.saleYearResult.year).toBe(15);
    expect(results.comparison).toHaveLength(40);
  });
});
