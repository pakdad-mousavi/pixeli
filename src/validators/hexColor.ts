import z from 'zod';
import { isValidHexColor, hexToRgba } from './utils.js';

export const hexColorValidator = z.union([
  z.string().transform((color, ctx) => {
    if (!isValidHexColor(color)) {
      ctx.addIssue({
        code: 'custom',
        message: "Invalid color: must be #rgb, #rrggbb, #rrggbbaa, or 'transparent'.",
        input: color,
      });

      return z.NEVER;
    }

    return hexToRgba(color);
  }),

  z.object({
    r: z.number().int().min(0).max(255),
    g: z.number().int().min(0).max(255),
    b: z.number().int().min(0).max(255),
    alpha: z.number().min(0).max(1),
  }),
]);
