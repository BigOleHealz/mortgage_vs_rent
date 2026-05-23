"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { HeadlineResult } from "@/components/results/HeadlineResult";
import { YearByYearTable } from "@/components/results/YearByYearTable";
import { DisplayModeToggle } from "@/components/scenario/DisplayModeToggle";
import { ScenarioPicker } from "@/components/scenario/ScenarioPicker";
import { ThemeToggle } from "@/components/scenario/ThemeToggle";
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
  const themeMode = useScenarioStore((state) => state.themeMode);
  const results = useMemo(() => calculate(scenario), [scenario]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(ellipse_at_70%_0%,hsl(var(--primary)/0.24),transparent_38%),radial-gradient(ellipse_at_8%_18%,hsl(var(--accent)/0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute right-6 top-28 hidden h-40 w-px bg-primary/50 lg:block" />
      <p className="pointer-events-none fixed right-3 top-1/2 hidden origin-center rotate-90 text-[10px] font-bold uppercase tracking-[0.42em] text-primary/70 lg:block">
        Scroll Down
      </p>
      <div className="mx-auto max-w-[1440px]">
        <header className="sticky top-0 z-20 -mx-6 mb-6 border-b border-primary/20 bg-background/75 px-6 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div>
              <p className="operator-kicker">
                Operators · Analysts · Capital Strategy
              </p>
              <h1 className="operator-title text-4xl leading-none">
                Rent / Buy Spectrum
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <ScenarioPicker />
              <DisplayModeToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="relative grid gap-6 lg:grid-cols-[minmax(360px,35%)_1fr]">
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
