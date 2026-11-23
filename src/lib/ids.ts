/**
 * Deterministic identifier allocation for the demo workflow.
 * No randomness and no clock: repeated runs produce identical ids, which keeps
 * tests reproducible and the walkthrough replayable.
 */

export function nextSequence(values: readonly string[], prefix: string, pad = 3): string {
  let max = 0;
  for (const value of values) {
    if (!value.startsWith(prefix)) continue;
    const suffix = Number.parseInt(value.slice(prefix.length), 10);
    if (Number.isFinite(suffix) && suffix > max) max = suffix;
  }
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}

export function nextSequences(values: readonly string[], prefix: string, count: number, pad = 3): readonly string[] {
  const first = nextSequence(values, prefix, pad);
  const start = Number.parseInt(first.slice(prefix.length), 10);
  return Array.from({ length: count }, (_unused, index) => `${prefix}${String(start + index).padStart(pad, '0')}`);
}