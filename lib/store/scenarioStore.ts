"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deriveTax, type StateCode } from "@/lib/data/derive-tax";
import zipToState from "@/lib/data/zip-to-state.json";
import type {
  DownPaymentInput,
  FilingStatus,
  LumpSumPrepayment,
  MaintenanceInput,
  PurchaseMode,
  ScenarioInputs,
} from "@/lib/engine";
import { SCENARIO_STORAGE_KEY } from "./persistence";

export type DisplayMode = "nominal" | "real";
export type ThemeMode = "light" | "dark";

type ZipCode = keyof typeof zipToState;

interface ScenarioStoreState {
  scenario: ScenarioInputs;
  displayMode: DisplayMode;
  themeMode: ThemeMode;
  headlineYear: number;
  setDisplayMode: (displayMode: DisplayMode) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setHeadlineYear: (headlineYear: number) => void;
  setZipCode: (zipCode: string) => void;
  setHomePrice: (homePrice: number) => void;
  setClosingCostRate: (closingCostRate: number) => void;
  setCashPurchase: (cashPurchase: boolean) => void;
  setDownPayment: (downPayment: DownPaymentInput) => void;
  setMortgageField: (
    field: keyof Omit<Extract<PurchaseMode, { kind: "mortgage" }>, "kind" | "downPayment" | "lumpSumPrepayments">,
    value: number,
  ) => void;
  addLumpSumPrepayment: () => void;
  updateLumpSumPrepayment: (
    index: number,
    patch: Partial<LumpSumPrepayment>,
  ) => void;
  removeLumpSumPrepayment: (index: number) => void;
  setOwnershipCost: (
    field: Exclude<keyof ScenarioInputs["ownershipCosts"], "maintenance">,
    value: number,
  ) => void;
  setMaintenance: (maintenance: MaintenanceInput) => void;
  setAppreciation: (
    field: keyof ScenarioInputs["appreciation"],
    value: number,
  ) => void;
  setRent: (field: keyof ScenarioInputs["rent"], value: number) => void;
  setInvestment: (
    field: keyof ScenarioInputs["investment"],
    value: number,
  ) => void;
  setFilingStatus: (filingStatus: FilingStatus) => void;
  setHouseholdIncome: (householdIncome: number) => void;
  setInflationRate: (inflationRate: number) => void;
  setSaleYear: (saleYear: number) => void;
}

const DEFAULT_ZIP = "10001";
const DEFAULT_INCOME = 175_000;

export const defaultScenario: ScenarioInputs = {
  horizonYears: 40,
  saleYear: 15,
  property: {
    zipCode: DEFAULT_ZIP,
    homePrice: 500_000,
    purchaseMode: {
      kind: "mortgage",
      downPayment: { kind: "percent", value: 0.2 },
      mortgageRate: 0.07,
      loanTermYears: 30,
      pmiRate: 0.005,
      extraMonthlyPayment: 0,
      lumpSumPrepayments: [],
    },
    closingCostRate: 0.03,
  },
  ownershipCosts: {
    propertyTaxRate: 0.012,
    propertyTaxGrowthRate: 0,
    insuranceRate: 0.0035,
    insuranceGrowthRate: 0.03,
    hoaMonthly: 0,
    hoaGrowthRate: 0.03,
    maintenance: { kind: "percentOfHomeValue", rate: 0.01 },
    maintenanceGrowthRate: 0,
  },
  appreciation: {
    annualRate: 0.03,
    sellingCostRate: 0.07,
  },
  rent: {
    monthlyRent: 2_500,
    annualRentGrowthRate: 0.03,
    rentersInsuranceMonthly: 25,
  },
  investment: {
    expectedAnnualReturn: 0.07,
    annualTaxDrag: 0.005,
    taxAdvantagedAccountPercent: 0,
  },
  taxes: deriveTax("single", DEFAULT_INCOME, "NY"),
  macro: {
    inflationRate: 0.03,
  },
};

export const useScenarioStore = create<ScenarioStoreState>()(
  persist(
    (set) => ({
      scenario: defaultScenario,
      displayMode: "nominal",
      themeMode: "light",
      headlineYear: defaultScenario.saleYear,
      setDisplayMode: (displayMode) => set({ displayMode }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setHeadlineYear: (headlineYear) =>
        set((state) => ({
          headlineYear: clampYear(headlineYear, state.scenario.horizonYears),
        })),
      setZipCode: (zipCode) =>
        set((state) => {
          const stateCode = lookupState(zipCode);
          const taxes = stateCode
            ? deriveTax(
                state.scenario.taxes.filingStatus,
                state.scenario.taxes.householdIncome,
                stateCode,
              )
            : state.scenario.taxes;

          return {
            scenario: {
              ...state.scenario,
              property: { ...state.scenario.property, zipCode },
              taxes,
            },
          };
        }),
      setHomePrice: (homePrice) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            property: { ...state.scenario.property, homePrice },
          },
        })),
      setClosingCostRate: (closingCostRate) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            property: { ...state.scenario.property, closingCostRate },
          },
        })),
      setCashPurchase: (cashPurchase) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            property: {
              ...state.scenario.property,
              purchaseMode: cashPurchase
                ? { kind: "cash" }
                : ensureMortgageMode(state.scenario.property.purchaseMode),
            },
          },
        })),
      setDownPayment: (downPayment) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            property: {
              ...state.scenario.property,
              purchaseMode: {
                ...ensureMortgageMode(state.scenario.property.purchaseMode),
                downPayment,
              },
            },
          },
        })),
      setMortgageField: (field, value) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            property: {
              ...state.scenario.property,
              purchaseMode: {
                ...ensureMortgageMode(state.scenario.property.purchaseMode),
                [field]: value,
              },
            },
          },
        })),
      addLumpSumPrepayment: () =>
        set((state) => {
          const mortgage = ensureMortgageMode(state.scenario.property.purchaseMode);

          return {
            scenario: {
              ...state.scenario,
              property: {
                ...state.scenario.property,
                purchaseMode: {
                  ...mortgage,
                  lumpSumPrepayments: [
                    ...mortgage.lumpSumPrepayments,
                    { year: 10, amount: 10_000 },
                  ],
                },
              },
            },
          };
        }),
      updateLumpSumPrepayment: (index, patch) =>
        set((state) => {
          const mortgage = ensureMortgageMode(state.scenario.property.purchaseMode);

          return {
            scenario: {
              ...state.scenario,
              property: {
                ...state.scenario.property,
                purchaseMode: {
                  ...mortgage,
                  lumpSumPrepayments: mortgage.lumpSumPrepayments.map(
                    (prepayment, currentIndex) =>
                      currentIndex === index
                        ? {
                            ...prepayment,
                            ...patch,
                            year: clampYear(
                              patch.year ?? prepayment.year,
                              state.scenario.horizonYears,
                            ),
                            amount: Math.max(0, patch.amount ?? prepayment.amount),
                          }
                        : prepayment,
                  ),
                },
              },
            },
          };
        }),
      removeLumpSumPrepayment: (index) =>
        set((state) => {
          const mortgage = ensureMortgageMode(state.scenario.property.purchaseMode);

          return {
            scenario: {
              ...state.scenario,
              property: {
                ...state.scenario.property,
                purchaseMode: {
                  ...mortgage,
                  lumpSumPrepayments: mortgage.lumpSumPrepayments.filter(
                    (_prepayment, currentIndex) => currentIndex !== index,
                  ),
                },
              },
            },
          };
        }),
      setOwnershipCost: (field, value) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            ownershipCosts: {
              ...state.scenario.ownershipCosts,
              [field]: value,
            },
          },
        })),
      setMaintenance: (maintenance) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            ownershipCosts: {
              ...state.scenario.ownershipCosts,
              maintenance,
            },
          },
        })),
      setAppreciation: (field, value) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            appreciation: { ...state.scenario.appreciation, [field]: value },
          },
        })),
      setRent: (field, value) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            rent: { ...state.scenario.rent, [field]: value },
          },
        })),
      setInvestment: (field, value) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            investment: { ...state.scenario.investment, [field]: value },
          },
        })),
      setFilingStatus: (filingStatus) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            taxes: deriveTax(
              filingStatus,
              state.scenario.taxes.householdIncome,
              lookupState(state.scenario.property.zipCode) ?? "NY",
            ),
          },
        })),
      setHouseholdIncome: (householdIncome) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            taxes: deriveTax(
              state.scenario.taxes.filingStatus,
              householdIncome,
              lookupState(state.scenario.property.zipCode) ?? "NY",
            ),
          },
        })),
      setInflationRate: (inflationRate) =>
        set((state) => ({
          scenario: {
            ...state.scenario,
            macro: { ...state.scenario.macro, inflationRate },
          },
        })),
      setSaleYear: (saleYear) =>
        set((state) => ({
          headlineYear: clampYear(saleYear, state.scenario.horizonYears),
          scenario: {
            ...state.scenario,
            saleYear: clampYear(saleYear, state.scenario.horizonYears),
          },
        })),
    }),
    {
      name: SCENARIO_STORAGE_KEY,
      partialize: (state) => ({
        scenario: state.scenario,
        displayMode: state.displayMode,
        themeMode: state.themeMode,
        headlineYear: state.headlineYear,
      }),
    },
  ),
);

function ensureMortgageMode(
  purchaseMode: PurchaseMode,
): Extract<PurchaseMode, { kind: "mortgage" }> {
  if (purchaseMode.kind === "mortgage") {
    return purchaseMode;
  }

  return {
    kind: "mortgage",
    downPayment: { kind: "percent", value: 0.2 },
    mortgageRate: 0.07,
    loanTermYears: 30,
    pmiRate: 0.005,
    extraMonthlyPayment: 0,
    lumpSumPrepayments: [],
  };
}

function lookupState(zipCode: string): StateCode | null {
  if (zipCode in zipToState) {
    return zipToState[zipCode as ZipCode] as StateCode;
  }

  return null;
}

function clampYear(year: number, horizonYears: number): number {
  return Math.min(horizonYears, Math.max(1, Math.round(year)));
}
