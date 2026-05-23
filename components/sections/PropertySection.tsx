"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function PropertySection() {
  const scenario = useScenarioStore((state) => state.scenario);
  const setZipCode = useScenarioStore((state) => state.setZipCode);
  const setHomePrice = useScenarioStore((state) => state.setHomePrice);
  const setCashPurchase = useScenarioStore((state) => state.setCashPurchase);
  const setDownPayment = useScenarioStore((state) => state.setDownPayment);
  const purchaseMode = scenario.property.purchaseMode;
  const downPayment =
    purchaseMode.kind === "mortgage"
      ? purchaseMode.downPayment
      : { kind: "percent" as const, value: 100 };

  return (
    <SectionCard eyebrow="Inputs" title="Property">
      <label className="block space-y-2">
        <span className="text-sm font-semibold">ZIP code</span>
        <input
          className="w-full rounded-md border bg-card px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-4"
          value={scenario.property.zipCode}
          onChange={(event) => setZipCode(event.target.value)}
        />
        <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Manual
        </span>
      </label>
      <NumberSliderInput
        format="currency"
        label="Home price"
        max={2_500_000}
        min={50_000}
        onChange={setHomePrice}
        step={5_000}
        value={scenario.property.homePrice}
      />
      <label className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm font-semibold">
        Buy in cash
        <input
          checked={purchaseMode.kind === "cash"}
          className="h-4 w-4 accent-primary"
          type="checkbox"
          onChange={(event) => setCashPurchase(event.target.checked)}
        />
      </label>
      {purchaseMode.kind === "mortgage" ? (
        <div className="space-y-3">
          <div className="flex rounded-lg border bg-secondary p-1 text-sm">
            <button
              className={`flex-1 rounded-md px-3 py-1.5 ${
                downPayment.kind === "percent" ? "bg-card shadow-sm" : ""
              }`}
              type="button"
              onClick={() =>
                setDownPayment({
                  kind: "percent",
                  value:
                    downPayment.kind === "percent"
                      ? downPayment.value
                      : downPayment.value / scenario.property.homePrice,
                })
              }
            >
              Percent
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-1.5 ${
                downPayment.kind === "amount" ? "bg-card shadow-sm" : ""
              }`}
              type="button"
              onClick={() =>
                setDownPayment({
                  kind: "amount",
                  value:
                    downPayment.kind === "amount"
                      ? downPayment.value
                      : downPayment.value * scenario.property.homePrice,
                })
              }
            >
              Dollars
            </button>
          </div>
          <NumberSliderInput
            format={downPayment.kind === "percent" ? "percent" : "currency"}
            label="Down payment"
            max={downPayment.kind === "percent" ? 100 : scenario.property.homePrice}
            min={0}
            onChange={(value) =>
              setDownPayment(
                downPayment.kind === "percent"
                  ? { kind: "percent", value: value / 100 }
                  : { kind: "amount", value },
              )
            }
            step={downPayment.kind === "percent" ? 1 : 1_000}
            value={
              downPayment.kind === "percent"
                ? downPayment.value * 100
                : downPayment.value
            }
          />
        </div>
      ) : null}
    </SectionCard>
  );
}
