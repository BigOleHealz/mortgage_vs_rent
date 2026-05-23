import { toRealDollars } from "./inflation";
import type {
  BuyYearResult,
  ComparisonYearResult,
  RentYearResult,
} from "./types";

export function comparePaths(
  buyPath: BuyYearResult[],
  rentPath: RentYearResult[],
  inflationRate: number,
): ComparisonYearResult[] {
  return buyPath.map((buyYear, index) => {
    const rentYear = rentPath[index];
    const delta = buyYear.netWorth - rentYear.netWorth;

    return {
      year: buyYear.year,
      buyerNetWorth: buyYear.netWorth,
      renterNetWorth: rentYear.netWorth,
      delta,
      realBuyerNetWorth: toRealDollars(
        buyYear.netWorth,
        inflationRate,
        buyYear.year,
      ),
      realRenterNetWorth: toRealDollars(
        rentYear.netWorth,
        inflationRate,
        buyYear.year,
      ),
      realDelta: toRealDollars(delta, inflationRate, buyYear.year),
    };
  });
}

export function findBreakEvenYear(
  comparison: ComparisonYearResult[],
): number | null {
  const firstDurablePositiveYear = comparison.find((row, index) => {
    if (row.delta <= 0) {
      return false;
    }

    return comparison.slice(index).every((futureRow) => futureRow.delta > 0);
  });

  return firstDurablePositiveYear?.year ?? null;
}
