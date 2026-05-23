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
    <section className="operator-panel rounded-sm p-6">
      <p className="operator-kicker">SYS.STATUS: headline result</p>
      <h2 className="operator-title mt-3 text-5xl leading-[0.92]">
        At year {headlineYear}, buying nets you{" "}
        <span className={buyerWins ? "text-primary" : "text-accent drop-shadow-[0_0_18px_hsl(var(--accent)/0.35)]"}>
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
    <div className="rounded-sm border border-primary/15 bg-secondary/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
