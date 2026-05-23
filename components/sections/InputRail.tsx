"use client";

import { AppreciationSection } from "./AppreciationSection";
import { InvestmentSection } from "./InvestmentSection";
import { LoanSection } from "./LoanSection";
import { MacroSection } from "./MacroSection";
import { OwnershipCostsSection } from "./OwnershipCostsSection";
import { PropertySection } from "./PropertySection";
import { RentSection } from "./RentSection";
import { TaxSection } from "./TaxSection";
import type { ScenarioId } from "@/lib/store/scenarioStore";

export function InputRail({ scenarioId }: { scenarioId: ScenarioId }) {
  return (
    <aside className="space-y-4">
      <PropertySection scenarioId={scenarioId} />
      <LoanSection scenarioId={scenarioId} />
      <OwnershipCostsSection scenarioId={scenarioId} />
      <AppreciationSection scenarioId={scenarioId} />
      <RentSection scenarioId={scenarioId} />
      <InvestmentSection scenarioId={scenarioId} />
      <TaxSection scenarioId={scenarioId} />
      <MacroSection scenarioId={scenarioId} />
    </aside>
  );
}
