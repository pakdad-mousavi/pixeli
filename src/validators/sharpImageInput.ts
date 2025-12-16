import z from 'zod';

export const sharpImageValidation = z.union([
  z.string(),
  z.instanceof(Buffer), // technically redundant, but verbose
  z.instanceof(Uint8Array),
]);

export type SharpImageInput = z.infer<typeof sharpImageValidation>;
