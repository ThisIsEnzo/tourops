/** Generic select-option shape and status-option builder. */
export interface Option<T extends string> { readonly value: T; readonly label: string; }
export function statusOptions<T extends string>(
  map: Readonly<Record<T, { readonly label: string }>>, allLabel: string,
): readonly Option<T | 'all'>[] {
  const all: Option<T | 'all'> = { value: 'all', label: allLabel };
  const rest = (Object.keys(map) as T[]).map((key): Option<T | 'all'> => ({ value: key, label: map[key].label }));
  return [all, ...rest];
}
