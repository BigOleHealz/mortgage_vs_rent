"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { HeadlineResult } from "@/components/results/HeadlineResult";
import { YearByYearTable } from "@/components/results/YearByYearTable";
import { DisplayModeToggle } from "@/components/scenario/DisplayModeToggle";
import { ScenarioPicker } from "@/components/scenario/ScenarioPicker";
import { InputRail } from "@/components/sections/InputRail";
import { calculate } from "@/lib/engine";
import { useScenarioStore } from "@/lib/store/scenarioStore";

const NetWorthChart = dynamic(
  () =>
    import("@/components/results/NetWorthChart").then(
      (module) => module.NetWorthChart,
    ),
  {
    ssr: false,
  },
);

export function CalculatorApp() {
  const scenario = useScenarioStore((state) => state.scenario);
  const displayMode = useScenarioStore((state) => state.displayMode);
  const results = useMemo(() => calculate(scenario), [scenario]);

  return (
    <main className="min-h-screen px-6 py-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="sticky top-0 z-20 -mx-6 mb-6 border-b bg-background/95 px-6 py-4 backdrop-blur lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                Rent vs. Buy
              </p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">
                Financial Calculator
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ScenarioPicker />
              <DisplayModeToggle />
            </div>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(360px,35%)_1fr]">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
            <InputRail />
          </div>
          <section className="space-y-6">
            <HeadlineResult displayMode={displayMode} results={results} />
            <NetWorthChart displayMode={displayMode} results={results} />
            <YearByYearTable displayMode={displayMode} results={results} />
          </section>
        </div>
      </div>
    </main>
  );
}
