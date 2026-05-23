"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function MacroSection() {
  const scenario = useScenarioStore((state) => state.scenario);
  const setInflationRate = useScenarioStore((state) => state.setInflationRate);
  const setSaleYear = useScenarioStore((state) => state.setSaleYear);

  return (
    <SectionCard eyebrow="Display assumptions" title="Macro & Horizon">
      <NumberSliderInput
        format="percent"
        label="Inflation rate"
        max={10}
        min={0}
        onChange={(value) => setInflationRate(value / 100)}
        step={0.1}
        value={scenario.macro.inflationRate * 100}
      />
      <NumberSliderInput
        label="Display year"
        max={scenario.horizonYears}
        min={1}
        onChange={setSaleYear}
        step={1}
        suffix="years"
        value={scenario.saleYear}
      />
    </SectionCard>
  );
}
