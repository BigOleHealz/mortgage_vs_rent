import { describe, expect, it } from "vitest";
import { calculate } from "@/lib/engine";
import { baseScenario } from "./helpers";

describe("calculate", () => {
  it("returns complete scenario results for the selected sale year", () => {
    const results = calculate(baseScenario({ saleYear: 15 }));

    expect(results.buyPath).toHaveLength(40);
    expect(results.rentPath).toHaveLength(40);
    expect(results.comparison).toHaveLength(40);
    expect(results.saleYearResult.year).toBe(15);
  });

  it("rejects invalid horizons", () => {
    expect(() => calculate(baseScenario({ horizonYears: 0 }))).toThrow(
      "horizonYears",
    );
  });

  it("rejects sale years outside the horizon", () => {
    expect(() =>
      calculate(baseScenario({ horizonYears: 10, saleYear: 11 })),
    ).toThrow("saleYear");
  });
});
