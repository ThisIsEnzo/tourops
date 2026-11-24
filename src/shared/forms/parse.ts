/** Shared controlled-input parsing. Domain/workflow code remains authoritative for validation. */
export function minorUnitsFromInput(raw: string, digits = 2): number {
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? Math.round(value * (10 ** digits)) : 0;
}
export function integerFromInput(raw: string): number {
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : 0;
}
