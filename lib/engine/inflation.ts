export function toRealDollars(
  nominalAmount: number,
  inflationRate: number,
  year: number,
): number {
  return nominalAmount / (1 + inflationRate) ** year;
}

export function toNominalDollars(
  realAmount: number,
  inflationRate: number,
  year: number,
): number {
  return realAmount * (1 + inflationRate) ** year;
}
