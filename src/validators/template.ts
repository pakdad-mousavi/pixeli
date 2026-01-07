import z from 'zod';
import type { Slot } from '../core/merges/template/types.js';

export const templateValidator = z
  .object({
    canvas: z.object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      columns: z.number().int().positive(),
      rows: z.number().int().positive(),
    }),
    slots: z.array(
      z.object({
        col: z.number().int().positive(),
        row: z.number().int().positive(),
        colSpan: z.number().int().positive(),
        rowSpan: z.number().int().positive(),
      })
    ),
  })
  .superRefine((opts, ctx) => {
    // Ensure slots do not overlap
    const result = validateSlotOverlaps(opts.slots);
    if (!result.success) {
      const [i, j] = result.overlaps;
      ctx.addIssue({ code: 'custom', message: `slot ${i} overlaps with slot ${j}` });
    }
  });

type ValidateSlotOverlapsResult = { success: true } | { success: false; overlaps: readonly [number, number] };

const validateSlotOverlaps = (slots: Slot[]): ValidateSlotOverlapsResult => {
  for (let i = 0; i < slots.length; i++) {
    const A = slots[i]!;

    const A_right = A.col + A.colSpan - 1;
    const A_bottom = A.row + A.rowSpan - 1;

    for (let j = i + 1; j < slots.length; j++) {
      const B = slots[j]!;

      const B_right = B.col + B.colSpan - 1;
      const B_bottom = B.row + B.rowSpan - 1;

      const overlap = A.col <= B_right && A_right >= B.col && A.row <= B_bottom && A_bottom >= B.row;

      if (overlap) {
        return { success: false, overlaps: [i, j] };
      }
    }
  }

  return { success: true };
};
