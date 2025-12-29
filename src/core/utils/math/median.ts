export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid] ?? null;
  }

  const a = sorted[mid - 1];
  const b = sorted[mid];

  return a !== undefined && b !== undefined ? (a + b) / 2 : null;
}
