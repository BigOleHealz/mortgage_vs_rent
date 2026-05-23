"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioResults } from "@/lib/engine";
import type { DisplayMode } from "@/lib/store/scenarioStore";
import { formatCompactCurrency, formatCurrency } from "./formatters";

interface NetWorthChartProps {
  results: ScenarioResults;
  compareResults?: ScenarioResults;
  displayMode: DisplayMode;
}

interface ChartRow {
  year: number;
  buyer: number;
  renter: number;
  delta: number;
  buyerB?: number;
  renterB?: number;
  deltaB?: number;
}

export function NetWorthChart({
  results,
  compareResults,
  displayMode,
}: NetWorthChartProps) {
  const data: ChartRow[] = results.comparison.map((row) => ({
    year: row.year,
    buyer: displayMode === "real" ? row.realBuyerNetWorth : row.buyerNetWorth,
    renter: displayMode === "real" ? row.realRenterNetWorth : row.renterNetWorth,
    delta: displayMode === "real" ? row.realDelta : row.delta,
  })).map((row) => {
    const comparisonB = compareResults?.comparison[row.year - 1];

    if (!comparisonB) {
      return row;
    }

    return {
      ...row,
      buyerB:
        displayMode === "real"
          ? comparisonB.realBuyerNetWorth
          : comparisonB.buyerNetWorth,
      renterB:
        displayMode === "real"
          ? comparisonB.realRenterNetWorth
          : comparisonB.renterNetWorth,
      deltaB: displayMode === "real" ? comparisonB.realDelta : comparisonB.delta,
    };
  });

  return (
    <section className="operator-panel rounded-sm p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="operator-kicker">Unified_Spectrum</p>
          <h2 className="operator-title mt-1 text-3xl">
            Buy Path vs. Rent + Invest Path
          </h2>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
          {displayMode === "real" ? "Inflation-adjusted" : "Nominal"} dollars
        </p>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ bottom: 8, left: 12, right: 20, top: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tickLine={false}
              width={72}
            />
            <Tooltip content={<ChartTooltip compareMode={Boolean(compareResults)} />} />
            <Legend />
            {results.breakEvenYear ? (
              <ReferenceLine
                label="Break-even"
                stroke="hsl(var(--accent))"
                x={results.breakEvenYear}
              />
            ) : null}
            <Line
              dataKey="buyer"
              dot={false}
              name={compareResults ? "A buyer net worth" : "Buyer net worth"}
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              type="monotone"
            />
            <Line
              dataKey="renter"
              dot={false}
              name={compareResults ? "A renter net worth" : "Renter net worth"}
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              type="monotone"
            />
            {compareResults ? (
              <>
                <Line
                  dataKey="buyerB"
                  dot={false}
                  name="B buyer net worth"
                  stroke="hsl(var(--primary) / 0.55)"
                  strokeDasharray="8 6"
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  dataKey="renterB"
                  dot={false}
                  name="B renter net worth"
                  stroke="hsl(var(--accent) / 0.55)"
                  strokeDasharray="8 6"
                  strokeWidth={3}
                  type="monotone"
                />
              </>
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  compareMode,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: number;
  compareMode: boolean;
}) {
  if (!active || !payload) {
    return null;
  }

  const buyer = payload.find((item) => item.dataKey === "buyer")?.value ?? 0;
  const renter = payload.find((item) => item.dataKey === "renter")?.value ?? 0;
  const buyerB = payload.find((item) => item.dataKey === "buyerB")?.value;
  const renterB = payload.find((item) => item.dataKey === "renterB")?.value;
  const delta = buyer - renter;

  return (
    <div className="rounded-sm border border-primary/30 bg-card/95 p-3 text-sm shadow-[0_0_28px_hsl(var(--primary)/0.16)]">
      <p className="font-semibold">Year {label}</p>
      <p>{compareMode ? "A buyer" : "Buyer"}: {formatCurrency(buyer)}</p>
      <p>{compareMode ? "A renter" : "Renter"}: {formatCurrency(renter)}</p>
      <p className="font-semibold">A delta: {formatCurrency(delta)}</p>
      {buyerB !== undefined && renterB !== undefined ? (
        <>
          <p>B buyer: {formatCurrency(buyerB)}</p>
          <p>B renter: {formatCurrency(renterB)}</p>
          <p className="font-semibold">B delta: {formatCurrency(buyerB - renterB)}</p>
        </>
      ) : null}
    </div>
  );
}
