export type DataSource = "user" | "zillow" | "fred" | "census" | "tax-table";

export interface LookupContext {
  zipCode?: string;
  filingStatus?: string;
  householdIncome?: number;
  state?: string;
}

export interface DataProvider<T> {
  source: DataSource;
  get(context: LookupContext): T;
  isOverridden: boolean;
  override(value: T): void;
}
