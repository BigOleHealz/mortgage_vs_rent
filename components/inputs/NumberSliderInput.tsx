"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberSliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: "currency" | "percent" | "number";
  suffix?: string;
  description?: string;
  className?: string;
}

export function NumberSliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = "number",
  suffix,
  description,
  className,
}: NumberSliderInputProps) {
  const id = useId();
  const [draftValue, setDraftValue] = useState(formatDraftValue(value, step));

  useEffect(() => {
    setDraftValue(formatDraftValue(value, step));
  }, [step, value]);

  useEffect(() => {
    const numericValue = Number(draftValue);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onChange(clampToRange(numericValue, min, max));
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [draftValue, max, min, onChange]);

  const displayValue = Number.isFinite(Number(draftValue))
    ? clampToRange(Number(draftValue), min, max)
    : min;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="text-sm font-semibold" htmlFor={id}>
            {label}
          </label>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center rounded-md border bg-card px-2 py-1 shadow-sm">
          {format === "currency" ? (
            <span className="text-sm text-muted-foreground">$</span>
          ) : null}
          <input
            id={id}
            className="w-24 bg-transparent text-right text-sm font-semibold tabular-nums outline-none"
            inputMode="decimal"
            type="number"
            min={min}
            max={max}
            step={step}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
          />
          {format === "percent" ? (
            <span className="pl-1 text-sm text-muted-foreground">%</span>
          ) : null}
          {suffix ? (
            <span className="pl-1 text-sm text-muted-foreground">{suffix}</span>
          ) : null}
        </div>
      </div>
      <input
        aria-label={`${label} slider`}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={(event) => setDraftValue(event.target.value)}
      />
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{formatTick(min, format, suffix)}</span>
        <span>{formatTick(max, format, suffix)}</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Manual
      </p>
    </div>
  );
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatDraftValue(value: number, step: number): string {
  const decimals = decimalPlaces(step);
  if (decimals === 0) {
    return String(Math.round(value));
  }

  return value
    .toFixed(decimals)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
}

function decimalPlaces(value: number): number {
  const [, decimals = ""] = String(value).split(".");
  return decimals.length;
}

function formatTick(
  value: number,
  format: NonNullable<NumberSliderInputProps["format"]>,
  suffix: string | undefined,
): string {
  if (format === "currency") {
    return `$${value.toLocaleString()}`;
  }

  if (format === "percent") {
    return `${value}%`;
  }

  return `${value.toLocaleString()}${suffix ? ` ${suffix}` : ""}`;
}
