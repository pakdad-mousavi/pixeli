import z from 'zod';
import { isValidHexColor, normalizeHexColor } from './utils.js';

export const hexColorValidator = z.string().transform((color, ctx) => {
  if (!isValidHexColor(color)) {
    ctx.addIssue({
      code: 'custom',
      message: "Invalid color: must be #rgb, #rrggbb, #rrggbbaa, or 'transparent'.",
      input: color,
    });

    return z.NEVER;
  }

  return normalizeHexColor(color);
});
