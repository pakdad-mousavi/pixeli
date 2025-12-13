import z from 'zod';

export const inputImageValidation = z.union([
  z.instanceof(Buffer), // technically redundant, but verbose
  z.instanceof(Uint8Array),
]);
