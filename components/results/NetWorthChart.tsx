"use client";

import { useState } from "react";
import type { ScenarioResults } from "@/lib/engine";
import type { DisplayMode } from "@/lib/store/scenarioStore";
import { formatCompactCurrency, formatCurrency } from "./formatters";

const CHART_COLORS = {
  axis: "#5d6b6b",
  buyer: "#08aebd",
  buyerCompare: "#79d7df",
  grid: "#b8c9c7",
  renter: "#10bfa8",
  renterCompare: "#7de0d1",
};

const SVG_WIDTH = 820;
const SVG_HEIGHT = 320;
const PLOT = {
  bottom: 44,
  left: 74,
  right: 20,
  top: 18,
};

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
  const [hoveredRow, setHoveredRow] = useState<ChartRow | null>(null);
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
  const yValues = data.flatMap((row) =>
    [row.buyer, row.renter, row.buyerB, row.renterB].filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value),
    ),
  );
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPadding = Math.max((yMax - yMin) * 0.08, 10_000);
  const yDomain: [number, number] = [yMin - yPadding, yMax + yPadding];
  const maxYear = data[data.length - 1]?.year ?? 1;
  const xForYear = (year: number) =>
    PLOT.left +
    ((year - 1) / Math.max(1, maxYear - 1)) *
      (SVG_WIDTH - PLOT.left - PLOT.right);
  const yForValue = (value: number) =>
    PLOT.top +
    ((yDomain[1] - value) / Math.max(1, yDomain[1] - yDomain[0])) *
      (SVG_HEIGHT - PLOT.top - PLOT.bottom);
  const yTicks = Array.from({ length: 5 }, (_item, index) => {
    const value = yDomain[0] + ((yDomain[1] - yDomain[0]) / 4) * index;
    return { value, y: yForValue(value) };
  }).reverse();
  const xTicks = Array.from({ length: 9 }, (_item, index) => {
    const year = 1 + Math.round(((maxYear - 1) / 8) * index);
    return { x: xForYear(year), year };
  });
  const hoveredX = hoveredRow ? xForYear(hoveredRow.year) : null;
  const tooltipX = hoveredX !== null && hoveredX > SVG_WIDTH - 250 ? hoveredX - 218 : (hoveredX ?? 0) + 14;
  const tooltipY =
    hoveredRow !== null
      ? Math.max(PLOT.top + 8, Math.min(yForValue(Math.max(hoveredRow.buyer, hoveredRow.renter)) - 54, SVG_HEIGHT - 118))
      : 0;

  return (
    <section className="operator-panel min-w-0 rounded-sm p-5">
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
      <div className="w-full overflow-x-auto">
        <div className="min-w-[760px]">
          <svg
            aria-label="Buy path versus rent and invest path chart"
            className="block h-auto w-[820px]"
            role="img"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            onMouseLeave={() => setHoveredRow(null)}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const cursorX =
                ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * SVG_WIDTH;
              const nearestRow = data.reduce((nearest, row) =>
                Math.abs(xForYear(row.year) - cursorX) <
                Math.abs(xForYear(nearest.year) - cursorX)
                  ? row
                  : nearest,
              );
              setHoveredRow(nearestRow);
            }}
          >
            <rect fill="transparent" height={SVG_HEIGHT} width={SVG_WIDTH} />
            {yTicks.map((tick) => (
              <g key={tick.value}>
                <line
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  x1={PLOT.left}
                  x2={SVG_WIDTH - PLOT.right}
                  y1={tick.y}
                  y2={tick.y}
                />
                <text
                  fill={CHART_COLORS.axis}
                  fontSize={11}
                  textAnchor="end"
                  x={PLOT.left - 10}
                  y={tick.y + 4}
                >
                  {formatCompactCurrency(tick.value)}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <g key={tick.year}>
                <line
                  stroke={CHART_COLORS.grid}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  x1={tick.x}
                  x2={tick.x}
                  y1={PLOT.top}
                  y2={SVG_HEIGHT - PLOT.bottom}
                />
                <text
                  fill={CHART_COLORS.axis}
                  fontSize={11}
                  textAnchor="middle"
                  x={tick.x}
                  y={SVG_HEIGHT - 18}
                >
                  {tick.year}
                </text>
              </g>
            ))}
            {results.breakEvenYear ? (
              <g>
                <line
                  stroke={CHART_COLORS.renter}
                  strokeWidth={1.5}
                  x1={xForYear(results.breakEvenYear)}
                  x2={xForYear(results.breakEvenYear)}
                  y1={PLOT.top}
                  y2={SVG_HEIGHT - PLOT.bottom}
                />
                <text
                  fill={CHART_COLORS.axis}
                  fontSize={11}
                  textAnchor="middle"
                  x={xForYear(results.breakEvenYear)}
                  y={(SVG_HEIGHT - PLOT.bottom + PLOT.top) / 2}
                >
                  Break-even
                </text>
              </g>
            ) : null}
            <ChartLine
              color={CHART_COLORS.buyer}
              points={data.map((row) => ({
                x: xForYear(row.year),
                y: yForValue(row.buyer),
              }))}
            />
            <ChartLine
              color={CHART_COLORS.renter}
              points={data.map((row) => ({
                x: xForYear(row.year),
                y: yForValue(row.renter),
              }))}
            />
            {compareResults ? (
              <>
                <ChartLine
                  color={CHART_COLORS.buyerCompare}
                  dashArray="8 6"
                  points={data
                    .filter((row) => typeof row.buyerB === "number")
                    .map((row) => ({
                      x: xForYear(row.year),
                      y: yForValue(row.buyerB ?? 0),
                    }))}
                />
                <ChartLine
                  color={CHART_COLORS.renterCompare}
                  dashArray="8 6"
                  points={data
                    .filter((row) => typeof row.renterB === "number")
                    .map((row) => ({
                      x: xForYear(row.year),
                      y: yForValue(row.renterB ?? 0),
                    }))}
                />
              </>
            ) : null}
            {hoveredRow ? (
              <g>
                <line
                  stroke="#e7ffff"
                  strokeOpacity={0.72}
                  strokeWidth={1.5}
                  x1={hoveredX ?? 0}
                  x2={hoveredX ?? 0}
                  y1={PLOT.top}
                  y2={SVG_HEIGHT - PLOT.bottom}
                />
                <HoverPoint
                  color={CHART_COLORS.buyer}
                  x={hoveredX ?? 0}
                  y={yForValue(hoveredRow.buyer)}
                />
                <HoverPoint
                  color={CHART_COLORS.renter}
                  x={hoveredX ?? 0}
                  y={yForValue(hoveredRow.renter)}
                />
                {typeof hoveredRow.buyerB === "number" ? (
                  <HoverPoint
                    color={CHART_COLORS.buyerCompare}
                    x={hoveredX ?? 0}
                    y={yForValue(hoveredRow.buyerB)}
                  />
                ) : null}
                {typeof hoveredRow.renterB === "number" ? (
                  <HoverPoint
                    color={CHART_COLORS.renterCompare}
                    x={hoveredX ?? 0}
                    y={yForValue(hoveredRow.renterB)}
                  />
                ) : null}
                <ChartTooltip
                  compareMode={Boolean(compareResults)}
                  row={hoveredRow}
                  x={tooltipX}
                  y={tooltipY}
                />
              </g>
            ) : null}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <LegendItem color={CHART_COLORS.buyer} label={compareResults ? "A buyer net worth" : "Buyer net worth"} />
            <LegendItem color={CHART_COLORS.renter} label={compareResults ? "A renter net worth" : "Renter net worth"} />
            {compareResults ? (
              <>
                <LegendItem color={CHART_COLORS.buyerCompare} label="B buyer net worth" />
                <LegendItem color={CHART_COLORS.renterCompare} label="B renter net worth" />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChartLine({
  color,
  dashArray,
  points,
}: {
  color: string;
  dashArray?: string;
  points: Array<{ x: number; y: number }>;
}) {
  return (
    <g>
      <polyline
        fill="none"
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        stroke={color}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
      />
      {points.map((point, index) =>
        index % 5 === 0 || index === points.length - 1 ? (
          <circle
            cx={point.x}
            cy={point.y}
            fill={color}
            key={`${point.x}-${point.y}`}
            r={3.5}
          />
        ) : null,
      )}
    </g>
  );
}

function HoverPoint({ color, x, y }: { color: string; x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      fill={color}
      r={5}
      stroke="#e7ffff"
      strokeWidth={1.5}
    />
  );
}

function ChartTooltip({
  compareMode,
  row,
  x,
  y,
}: {
  compareMode: boolean;
  row: ChartRow;
  x: number;
  y: number;
}) {
  const lines = [
    `Year ${row.year}`,
    `${compareMode ? "A buyer" : "Buyer"}: ${formatCurrency(row.buyer)}`,
    `${compareMode ? "A renter" : "Renter"}: ${formatCurrency(row.renter)}`,
    `Delta: ${formatCurrency(row.delta)}`,
  ];

  if (compareMode && typeof row.buyerB === "number" && typeof row.renterB === "number") {
    lines.push(`B buyer: ${formatCurrency(row.buyerB)}`);
    lines.push(`B renter: ${formatCurrency(row.renterB)}`);
    lines.push(`B delta: ${formatCurrency(row.deltaB ?? row.buyerB - row.renterB)}`);
  }

  return (
    <g>
      <rect
        fill="#061314"
        height={24 + lines.length * 16}
        opacity={0.96}
        rx={4}
        stroke={CHART_COLORS.buyer}
        strokeWidth={1}
        width={204}
        x={x}
        y={y}
      />
      {lines.map((line, index) => (
        <text
          fill={index === 0 ? CHART_COLORS.buyer : "#dff7f4"}
          fontSize={index === 0 ? 12 : 11}
          fontWeight={index === 0 ? 700 : 500}
          key={line}
          x={x + 12}
          y={y + 18 + index * 16}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block h-0.5 w-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
