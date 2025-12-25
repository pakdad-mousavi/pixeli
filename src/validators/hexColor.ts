import z from 'zod';
import { isValidHexColor } from '../core/helpers.js';
import { hexToRgba } from '../core/utils/colors/hexToRgba.js';

export const hexColorValidator = z.union(
  [
    z.string().transform((color, ctx) => {
      // Handle transparency
      if (color === 'transparent') {
        return hexToRgba('#00000000');
      }

      // Handle hex values
      if (!isValidHexColor(color)) {
        ctx.addIssue({
          code: 'custom',
          message: "Invalid color: must be 'transparent', #rgb, #rrggbb, #rrggbbaa, or object of {r, g, b, a}.",
          input: color,
        });

        return z.NEVER;
      }

      return hexToRgba(color);
    }),

    z.object(
      {
        r: z.number().int().min(0).max(255),
        g: z.number().int().min(0).max(255),
        b: z.number().int().min(0).max(255),
        alpha: z.number().min(0).max(1),
      },
      "Invalid color: must be 'transparent', #rgb, #rrggbb, #rrggbbaa, or object of {r, g, b, a}."
    ),
  ],
  "Invalid color: must be 'transparent', #rgb, #rrggbb, #rrggbbaa, or object of {r, g, b, a}."
);
