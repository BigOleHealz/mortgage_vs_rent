"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { type ScenarioId, useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function LoanSection({ scenarioId }: { scenarioId: ScenarioId }) {
  const scenario = useScenarioStore((state) => state.scenarios[scenarioId]);
  const setClosingCostRate = useScenarioStore((state) => state.setClosingCostRate);
  const setMortgageField = useScenarioStore((state) => state.setMortgageField);
  const addLumpSumPrepayment = useScenarioStore(
    (state) => state.addLumpSumPrepayment,
  );
  const updateLumpSumPrepayment = useScenarioStore(
    (state) => state.updateLumpSumPrepayment,
  );
  const removeLumpSumPrepayment = useScenarioStore(
    (state) => state.removeLumpSumPrepayment,
  );
  const purchaseMode = scenario.property.purchaseMode;

  if (purchaseMode.kind === "cash") {
    return (
      <SectionCard eyebrow="Hidden in cash mode" title="Loan">
        <p className="text-sm text-muted-foreground">
          Mortgage inputs are hidden because this scenario buys the home in cash.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard eyebrow="Mortgage" title="Loan">
      <NumberSliderInput
        format="percent"
        label="Mortgage interest rate"
        max={15}
        min={0}
        onChange={(value) => setMortgageField("mortgageRate", value / 100, scenarioId)}
        step={0.05}
        value={purchaseMode.mortgageRate * 100}
      />
      <NumberSliderInput
        label="Loan term"
        max={40}
        min={5}
        onChange={(value) => setMortgageField("loanTermYears", value, scenarioId)}
        step={1}
        suffix="years"
        value={purchaseMode.loanTermYears}
      />
      <NumberSliderInput
        format="percent"
        label="Closing costs"
        max={10}
        min={0}
        onChange={(value) => setClosingCostRate(value / 100, scenarioId)}
        step={0.1}
        value={scenario.property.closingCostRate * 100}
      />
      <NumberSliderInput
        format="percent"
        label="PMI rate"
        max={2}
        min={0}
        onChange={(value) => setMortgageField("pmiRate", value / 100, scenarioId)}
        step={0.05}
        value={purchaseMode.pmiRate * 100}
      />
      <NumberSliderInput
        format="currency"
        label="Extra monthly payment"
        max={5_000}
        min={0}
        onChange={(value) => setMortgageField("extraMonthlyPayment", value, scenarioId)}
        step={50}
        value={purchaseMode.extraMonthlyPayment}
      />
      <div className="space-y-3 rounded-lg border px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Lump-sum prepayments</h3>
          <button
            className="rounded-md border px-3 py-1 text-xs font-semibold"
            type="button"
            onClick={() => addLumpSumPrepayment(scenarioId)}
          >
            Add
          </button>
        </div>
        {purchaseMode.lumpSumPrepayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lump sums added.</p>
        ) : null}
        {purchaseMode.lumpSumPrepayments.map((prepayment, index) => (
          <div className="space-y-3 rounded-md bg-secondary/60 p-3" key={index}>
            <NumberSliderInput
              label="Prepayment year"
              max={40}
              min={1}
              onChange={(value) =>
                updateLumpSumPrepayment(index, { year: value }, scenarioId)
              }
              step={1}
              value={prepayment.year}
            />
            <NumberSliderInput
              format="currency"
              label="Prepayment amount"
              max={250_000}
              min={0}
              onChange={(value) =>
                updateLumpSumPrepayment(index, { amount: value }, scenarioId)
              }
              step={1_000}
              value={prepayment.amount}
            />
            <button
              className="text-xs font-semibold text-muted-foreground"
              type="button"
              onClick={() => removeLumpSumPrepayment(index, scenarioId)}
            >
              Remove prepayment
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
