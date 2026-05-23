"use client";

import type { ScenarioResults } from "@/lib/engine";
import { useScenarioStore, type DisplayMode } from "@/lib/store/scenarioStore";
import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { formatCurrency } from "./formatters";

interface HeadlineResultProps {
  results: ScenarioResults;
  displayMode: DisplayMode;
}

export function HeadlineResult({ results, displayMode }: HeadlineResultProps) {
  const headlineYear = useScenarioStore((state) => state.headlineYear);
  const setHeadlineYear = useScenarioStore((state) => state.setHeadlineYear);
  const row = results.comparison[headlineYear - 1];
  const delta = displayMode === "real" ? row.realDelta : row.delta;
  const buyerWins = delta >= 0;

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        Headline result
      </p>
      <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
        At year {headlineYear}, buying nets you{" "}
        <span className={buyerWins ? "text-primary" : "text-accent"}>
          {formatCurrency(Math.abs(delta))}
        </span>{" "}
        {buyerWins ? "more" : "less"} than renting.
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Break-even year" value={results.breakEvenYear ?? "None"} />
        <Metric
          label="Buyer net worth"
          value={formatCurrency(
            displayMode === "real" ? row.realBuyerNetWorth : row.buyerNetWorth,
          )}
        />
        <Metric
          label="Renter net worth"
          value={formatCurrency(
            displayMode === "real" ? row.realRenterNetWorth : row.renterNetWorth,
          )}
        />
      </div>
      <div className="mt-6">
        <NumberSliderInput
          label="Headline year"
          max={results.inputs.horizonYears}
          min={1}
          onChange={setHeadlineYear}
          step={1}
          suffix="years"
          value={headlineYear}
        />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-secondary/50 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
