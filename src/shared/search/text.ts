/** Case-insensitive substring matching over fields supplied by the calling domain. */
export function normalizeQuery(value: string): string { return value.trim().toLowerCase(); }
export function matchesQuery(query: string, fields: readonly (string | number | null | undefined)[]): boolean {
  const needle = normalizeQuery(query);
  if (needle === '') return true;
  return fields.some(field => field !== null && field !== undefined && String(field).toLowerCase().includes(needle));
}
