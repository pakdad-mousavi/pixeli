import z from 'zod';

export const useNumberCoercion = (schema: z.ZodNumber) => {
  return z.preprocess((val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') {
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }
    return val;
  }, schema);
};
