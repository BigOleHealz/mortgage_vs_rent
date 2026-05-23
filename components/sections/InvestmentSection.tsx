"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function InvestmentSection({ scenarioId }: { scenarioId: ScenarioId }) {
  const investment = useScenarioStore(
    (state) => state.scenarios[scenarioId].investment,
  );
  const setInvestment = useScenarioStore((state) => state.setInvestment);

  return (
    <SectionCard eyebrow="Opportunity cost" title="Investment">
      <NumberSliderInput
        format="percent"
        label="Expected nominal return"
        max={12}
        min={0}
        onChange={(value) => setInvestment("expectedAnnualReturn", value / 100, scenarioId)}
        step={0.1}
        value={investment.expectedAnnualReturn * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Investment tax drag"
        max={3}
        min={0}
        onChange={(value) => setInvestment("annualTaxDrag", value / 100, scenarioId)}
        step={0.05}
        value={investment.annualTaxDrag * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Tax-advantaged account share"
        max={100}
        min={0}
        onChange={(value) =>
          setInvestment("taxAdvantagedAccountPercent", value / 100, scenarioId)
        }
        step={1}
        value={investment.taxAdvantagedAccountPercent * 100}
      />
    </SectionCard>
  );
}
