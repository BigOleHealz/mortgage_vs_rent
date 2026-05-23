"use client";

import type { ScenarioResults } from "@/lib/engine";
import type { DisplayMode } from "@/lib/store/scenarioStore";
import { formatCurrency } from "./formatters";

interface YearByYearTableProps {
  results: ScenarioResults;
  displayMode: DisplayMode;
}

export function YearByYearTable({
  results,
  displayMode,
}: YearByYearTableProps) {
  return (
    <details className="rounded-2xl border bg-card shadow-sm">
      <summary className="cursor-pointer list-none px-5 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Details
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          Year-by-year output
        </h2>
      </summary>
      <div className="max-h-[520px] overflow-auto border-t">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-secondary text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3 text-right">Home value</th>
              <th className="px-4 py-3 text-right">Mortgage</th>
              <th className="px-4 py-3 text-right">Buy outflow</th>
              <th className="px-4 py-3 text-right">Rent outflow</th>
              <th className="px-4 py-3 text-right">Buyer NW</th>
              <th className="px-4 py-3 text-right">Renter NW</th>
              <th className="px-4 py-3 text-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {results.comparison.map((row) => {
              const buy = results.buyPath[row.year - 1];
              const rent = results.rentPath[row.year - 1];
              const buyerNetWorth =
                displayMode === "real" ? row.realBuyerNetWorth : row.buyerNetWorth;
              const renterNetWorth =
                displayMode === "real" ? row.realRenterNetWorth : row.renterNetWorth;
              const delta = displayMode === "real" ? row.realDelta : row.delta;

              return (
                <tr className="border-t" key={row.year}>
                  <td className="px-4 py-3 font-semibold">{row.year}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(buy.homeValue)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(buy.remainingMortgageBalance)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(buy.annualOutflow)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(rent.annualOutflow)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(buyerNetWorth)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(renterNetWorth)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(delta)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
