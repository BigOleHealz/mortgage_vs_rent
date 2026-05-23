"use client";

import { AppreciationSection } from "./AppreciationSection";
import { InvestmentSection } from "./InvestmentSection";
import { LoanSection } from "./LoanSection";
import { MacroSection } from "./MacroSection";
import { OwnershipCostsSection } from "./OwnershipCostsSection";
import { PropertySection } from "./PropertySection";
import { RentSection } from "./RentSection";
import { TaxSection } from "./TaxSection";

export function InputRail() {
  return (
    <aside className="space-y-4">
      <PropertySection />
      <LoanSection />
      <OwnershipCostsSection />
      <AppreciationSection />
      <RentSection />
      <InvestmentSection />
      <TaxSection />
      <MacroSection />
    </aside>
  );
}
