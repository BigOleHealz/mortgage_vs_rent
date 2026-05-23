import { describe, expect, it } from "vitest";
import { deriveTax, findMarginalRate } from "@/lib/data/derive-tax";
import { UserInputProvider } from "@/lib/data/providers";

describe("deriveTax", () => {
  it("derives federal ordinary and LTCG rates below NIIT threshold", () => {
    const tax = deriveTax("single", 180_000, "TX");

    expect(tax.standardDeduction).toBe(15_000);
    expect(tax.federalMarginalRate).toBe(0.24);
    expect(tax.longTermCapitalGainsRate).toBe(0.15);
    expect(tax.stateMarginalRate).toBe(0);
    expect(tax.stateCapitalGainsRate).toBe(0);
    expect(tax.niitRate).toBe(0);
  });

  it("triggers NIIT at filing status thresholds", () => {
    expect(deriveTax("single", 200_001, "TX").niitRate).toBe(0.038);
    expect(deriveTax("marriedFilingJointly", 250_001, "TX").niitRate).toBe(
      0.038,
    );
    expect(deriveTax("headOfHousehold", 200_001, "TX").niitRate).toBe(0.038);
  });

  it("derives bracket, flat, and no-tax state rates", () => {
    expect(deriveTax("single", 250_000, "CA").stateMarginalRate).toBe(0.093);
    expect(deriveTax("single", 250_000, "NY").stateMarginalRate).toBe(0.0685);
    expect(deriveTax("single", 250_000, "FL").stateMarginalRate).toBe(0);
    expect(deriveTax("single", 250_000, "WA").stateCapitalGainsRate).toBe(0.07);
  });

  it("finds the marginal rate from sorted or unsorted brackets", () => {
    expect(
      findMarginalRate(
        [
          { over: 100_000, rate: 0.2 },
          { over: 0, rate: 0.1 },
        ],
        120_000,
      ),
    ).toBe(0.2);
  });
});

describe("UserInputProvider", () => {
  it("returns and overrides manual values", () => {
    const provider = new UserInputProvider(10);

    expect(provider.source).toBe("user");
    expect(provider.get({})).toBe(10);
    provider.override(12);
    expect(provider.get({})).toBe(12);
    expect(provider.isOverridden).toBe(true);
  });
});
