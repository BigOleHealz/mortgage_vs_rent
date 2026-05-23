"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function OwnershipCostsSection({ scenarioId }: { scenarioId: ScenarioId }) {
  const scenario = useScenarioStore((state) => state.scenarios[scenarioId]);
  const setOwnershipCost = useScenarioStore((state) => state.setOwnershipCost);
  const setMaintenance = useScenarioStore((state) => state.setMaintenance);
  const costs = scenario.ownershipCosts;

  return (
    <SectionCard eyebrow="Annual carrying costs" title="Ownership Costs">
      <NumberSliderInput
        format="percent"
        label="Property tax rate"
        max={4}
        min={0}
        onChange={(value) => setOwnershipCost("propertyTaxRate", value / 100, scenarioId)}
        step={0.05}
        value={costs.propertyTaxRate * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Property tax growth"
        max={10}
        min={0}
        onChange={(value) =>
          setOwnershipCost("propertyTaxGrowthRate", value / 100, scenarioId)
        }
        step={0.1}
        value={costs.propertyTaxGrowthRate * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Insurance rate"
        max={2}
        min={0}
        onChange={(value) => setOwnershipCost("insuranceRate", value / 100, scenarioId)}
        step={0.05}
        value={costs.insuranceRate * 100}
      />
      <NumberSliderInput
        format="percent"
        label="Insurance growth"
        max={10}
        min={0}
        onChange={(value) => setOwnershipCost("insuranceGrowthRate", value / 100, scenarioId)}
        step={0.1}
        value={costs.insuranceGrowthRate * 100}
      />
      <NumberSliderInput
        format="currency"
        label="HOA monthly"
        max={3_000}
        min={0}
        onChange={(value) => setOwnershipCost("hoaMonthly", value, scenarioId)}
        step={25}
        value={costs.hoaMonthly}
      />
      <NumberSliderInput
        format="percent"
        label="HOA growth"
        max={10}
        min={0}
        onChange={(value) => setOwnershipCost("hoaGrowthRate", value / 100, scenarioId)}
        step={0.1}
        value={costs.hoaGrowthRate * 100}
      />
      <div className="space-y-3">
        <div className="flex rounded-lg border bg-secondary p-1 text-sm">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 ${
              costs.maintenance.kind === "percentOfHomeValue"
                ? "bg-card shadow-sm"
                : ""
            }`}
            type="button"
            onClick={() =>
              setMaintenance({
                kind: "percentOfHomeValue",
                rate:
                  costs.maintenance.kind === "percentOfHomeValue"
                    ? costs.maintenance.rate
                    : 0.01,
              }, scenarioId)
            }
          >
            Percent
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 ${
              costs.maintenance.kind === "annualAmount" ? "bg-card shadow-sm" : ""
            }`}
            type="button"
            onClick={() =>
              setMaintenance({
                kind: "annualAmount",
                amount:
                  costs.maintenance.kind === "annualAmount"
                    ? costs.maintenance.amount
                    : 5_000,
              }, scenarioId)
            }
          >
            Dollars
          </button>
        </div>
        <NumberSliderInput
          format={
            costs.maintenance.kind === "percentOfHomeValue"
              ? "percent"
              : "currency"
          }
          label="Maintenance"
          max={costs.maintenance.kind === "percentOfHomeValue" ? 5 : 50_000}
          min={0}
          onChange={(value) =>
            setMaintenance(
              costs.maintenance.kind === "percentOfHomeValue"
                ? { kind: "percentOfHomeValue", rate: value / 100 }
                : { kind: "annualAmount", amount: value },
              scenarioId,
            )
          }
          step={costs.maintenance.kind === "percentOfHomeValue" ? 0.1 : 250}
          value={
            costs.maintenance.kind === "percentOfHomeValue"
              ? costs.maintenance.rate * 100
              : costs.maintenance.amount
          }
        />
      </div>
      <NumberSliderInput
        format="percent"
        label="Maintenance growth"
        max={10}
        min={0}
        onChange={(value) => setOwnershipCost("maintenanceGrowthRate", value / 100, scenarioId)}
        step={0.1}
        value={costs.maintenanceGrowthRate * 100}
      />
    </SectionCard>
  );
}
