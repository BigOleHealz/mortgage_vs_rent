import federalTable from "./tax-tables/federal-2025.json";
import stateTable from "./tax-tables/state-2025.json";
import type { FilingStatus, TaxAssumptions } from "@/lib/engine";

export type StateCode = keyof typeof stateTable;

interface TaxBracket {
  over: number;
  rate: number;
}

interface StateTaxTable {
  name: string;
  ordinaryIncomeBrackets: TaxBracket[];
  flatOrdinaryRate: number | null;
  taxesCapitalGainsAsOrdinaryIncome: boolean;
  flatCapitalGainsRate: number | null;
  allowsMortgageInterestDeduction: boolean;
}

export function deriveTax(
  filingStatus: FilingStatus,
  income: number,
  state: StateCode,
): TaxAssumptions {
  const stateTax = stateTable[state] as StateTaxTable;
  const federalMarginalRate = findMarginalRate(
    federalTable.ordinaryIncomeBrackets[filingStatus],
    income,
  );
  const longTermCapitalGainsRate = findMarginalRate(
    federalTable.longTermCapitalGainsBrackets[filingStatus],
    income,
  );
  const stateMarginalRate =
    stateTax.flatOrdinaryRate ??
    findMarginalRate(stateTax.ordinaryIncomeBrackets, income);
  const stateCapitalGainsRate = stateTax.taxesCapitalGainsAsOrdinaryIncome
    ? stateMarginalRate
    : stateTax.flatCapitalGainsRate ?? 0;
  const niitRate =
    income > federalTable.niitThresholds[filingStatus]
      ? federalTable.niitRate
      : 0;

  return {
    filingStatus,
    householdIncome: income,
    standardDeduction: federalTable.standardDeduction[filingStatus],
    federalMarginalRate,
    stateMarginalRate,
    stateAllowsMortgageInterestDeduction:
      stateTax.allowsMortgageInterestDeduction,
    longTermCapitalGainsRate,
    stateCapitalGainsRate,
    niitRate,
  };
}

export function findMarginalRate(brackets: TaxBracket[], income: number): number {
  const sortedBrackets = [...brackets].sort((a, b) => a.over - b.over);
  let rate = 0;

  for (const bracket of sortedBrackets) {
    if (income >= bracket.over) {
      rate = bracket.rate;
    }
  }

  return rate;
}
