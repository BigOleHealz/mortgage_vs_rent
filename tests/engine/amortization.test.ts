import { describe, expect, it } from "vitest";
import {
  buildAmortizationSchedule,
  calculateMonthlyMortgagePayment,
} from "@/lib/engine";

describe("amortization", () => {
  it("calculates the standard monthly mortgage payment", () => {
    expect(calculateMonthlyMortgagePayment(400_000, 0.07, 30)).toBeCloseTo(
      2661.21,
      2,
    );
  });

  it("supports zero-interest loans", () => {
    expect(calculateMonthlyMortgagePayment(120_000, 0, 10)).toBe(1_000);
  });

  it("applies a lump-sum prepayment at year 10", () => {
    const schedule = buildAmortizationSchedule({
      loanAmount: 400_000,
      homePrice: 500_000,
      annualInterestRate: 0.07,
      termYears: 30,
      extraMonthlyPayment: 0,
      lumpSumPrepayments: [{ year: 10, amount: 50_000 }],
      pmiRate: 0,
      horizonYears: 40,
    });

    expect(schedule.annualRows[9].lumpSumPaid).toBeCloseTo(50_000, 2);
    expect(schedule.annualRows[9].endingBalance).toBeLessThan(
      schedule.annualRows[8].endingBalance,
    );
  });

  it("drops PMI once the balance reaches 78% LTV", () => {
    const schedule = buildAmortizationSchedule({
      loanAmount: 450_000,
      homePrice: 500_000,
      annualInterestRate: 0.05,
      termYears: 30,
      extraMonthlyPayment: 2_000,
      lumpSumPrepayments: [],
      pmiRate: 0.005,
      horizonYears: 40,
    });

    const firstInactivePmiYear = schedule.annualRows.find(
      (row) => row.pmiPaid === 0,
    );

    expect(schedule.annualRows[0].pmiPaid).toBeGreaterThan(0);
    expect(firstInactivePmiYear?.endingBalance).toBeLessThanOrEqual(390_000);
  });
});
