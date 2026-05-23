"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import type { FilingStatus } from "@/lib/engine";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

const filingStatuses: { label: string; value: FilingStatus }[] = [
  { label: "Single", value: "single" },
  { label: "Married filing jointly", value: "marriedFilingJointly" },
  { label: "Head of household", value: "headOfHousehold" },
];

export function TaxSection({ scenarioId }: { scenarioId: ScenarioId }) {
  const taxes = useScenarioStore((state) => state.scenarios[scenarioId].taxes);
  const setFilingStatus = useScenarioStore((state) => state.setFilingStatus);
  const setHouseholdIncome = useScenarioStore((state) => state.setHouseholdIncome);

  return (
    <SectionCard eyebrow="Derived from income and ZIP" title="Taxes">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Filing status</span>
        <select
          className="w-full rounded-md border bg-card px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-4"
          value={taxes.filingStatus}
          onChange={(event) =>
            setFilingStatus(event.target.value as FilingStatus, scenarioId)
          }
        >
          {filingStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <NumberSliderInput
        format="currency"
        label="Household income"
        max={1_000_000}
        min={0}
        onChange={(value) => setHouseholdIncome(value, scenarioId)}
        step={5_000}
        value={taxes.householdIncome}
      />
      <div className="grid grid-cols-2 gap-3 rounded-lg border bg-secondary/50 p-3 text-sm">
        <DerivedRate label="Federal marginal" value={taxes.federalMarginalRate} />
        <DerivedRate label="State marginal" value={taxes.stateMarginalRate} />
        <DerivedRate label="LTCG" value={taxes.longTermCapitalGainsRate} />
        <DerivedRate label="State cap gains" value={taxes.stateCapitalGainsRate} />
        <DerivedRate label="NIIT" value={taxes.niitRate} />
        <div>
          <p className="text-xs text-muted-foreground">Standard deduction</p>
          <p className="font-semibold tabular-nums">
            ${taxes.standardDeduction.toLocaleString()}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function DerivedRate({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{(value * 100).toFixed(2)}%</p>
    </div>
  );
}
