import type { DataProvider, LookupContext } from "./types";

export class UserInputProvider<T> implements DataProvider<T> {
  source = "user" as const;
  isOverridden = true;

  constructor(private value: T) {}

  get(_context: LookupContext): T {
    return this.value;
  }

  override(value: T): void {
    this.value = value;
    this.isOverridden = true;
  }
}
