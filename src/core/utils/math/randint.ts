interface Randint {
  (low: number, high: number): number;
  (value: number): number;
}

export const randint: Randint = (lowOrValue: number, high?: number) => {
  if (high === undefined) {
    return Math.round(Math.random() * lowOrValue);
  }

  let low = lowOrValue;
  if (high > low) {
    [low, high] = [high, low];
  }

  const range = high - low;
  return Math.round(low + Math.random() * range);
};
