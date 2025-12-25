import z from 'zod';
import { parseAspectRatio } from '../core/utils/images/parseAspectRatio.js';

export const aspectRatioValidator = z.coerce.string().transform((ratio, ctx) => {
  const result = parseAspectRatio(ratio);

  // Validate aspect ratio
  if (!result) {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid aspect ratio: Examples of valid ratios include 16/9, 2:3, 1x2, 1.77.',
      input: ratio,
    });
    return z.NEVER;
  }

  return result;
});
