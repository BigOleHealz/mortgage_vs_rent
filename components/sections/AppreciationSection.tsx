"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function AppreciationSection({ scenarioId }: { scenarioId: ScenarioId }) {
  const appreciation = useScenarioStore(
    (state) => state.scenarios[scenarioId].appreciation,
  );
  const setAppreciation = useScenarioStore((state) => state.setAppreciation);

  return (
    <SectionCard eyebrow="Exit assumptions" title="Home Appreciation">
      <NumberSliderInput
        format="percent"
        label="Annual appreciation"
        max={10}
        min={-2}
        onChange={(value) => setAppreciation("annualRate", value / 100, scenarioId)}
        step={0.1}
        value={appreciation.annualRate * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Selling costs"
        max={10}
        min={0}
        onChange={(value) => setAppreciation("sellingCostRate", value / 100, scenarioId)}
        step={0.1}
        value={appreciation.sellingCostRate * 100}
      />
    </SectionCard>
  );
}
