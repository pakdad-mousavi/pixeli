import { median } from './median.js';

export const trimmedMedian = (values: number[], trimRatio = 0.1) => {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * trimRatio);

  // Prevent trimming everything
  if (trim * 2 >= sorted.length) {
    return median(sorted);
  }

  return median(sorted.slice(trim, sorted.length - trim));
};
