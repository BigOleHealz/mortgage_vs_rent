import { describe, expect, it } from "vitest";
import { toNominalDollars, toRealDollars } from "@/lib/engine";

describe("inflation", () => {
  it("converts nominal dollars to real dollars", () => {
    expect(toRealDollars(106.09, 0.03, 2)).toBeCloseTo(100, 2);
  });

  it("converts real dollars to nominal dollars", () => {
    expect(toNominalDollars(100, 0.03, 2)).toBeCloseTo(106.09, 2);
  });
});
