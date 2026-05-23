"use client";

import { NumberSliderInput } from "@/components/inputs/NumberSliderInput";
import { useScenarioStore } from "@/lib/store/scenarioStore";
import { SectionCard } from "./SectionCard";

export function RentSection() {
  const rent = useScenarioStore((state) => state.scenario.rent);
  const setRent = useScenarioStore((state) => state.setRent);

  return (
    <SectionCard eyebrow="Rental path" title="Rent">
      <NumberSliderInput
        format="currency"
        label="Current monthly rent"
        max={10_000}
        min={0}
        onChange={(value) => setRent("monthlyRent", value)}
        step={50}
        value={rent.monthlyRent}
      />
      <NumberSliderInput
        format="percent"
        label="Annual rent growth"
        max={10}
        min={0}
        onChange={(value) => setRent("annualRentGrowthRate", value / 100)}
        step={0.1}
        value={rent.annualRentGrowthRate * 100}
      />
      <NumberSliderInput
        format="currency"
        label="Renter's insurance monthly"
        max={250}
        min={0}
        onChange={(value) => setRent("rentersInsuranceMonthly", value)}
        step={5}
        value={rent.rentersInsuranceMonthly}
      />
    </SectionCard>
  );
}
