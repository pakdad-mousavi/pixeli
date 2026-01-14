import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

const baseMasonrySchema = z.object({
  shuffle: VALIDATORS.shuffle.default(false),
  cornerRadius: VALIDATORS.cornerRadius.default(0),
  gap: VALIDATORS.gap.default(50),
  canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
  format: VALIDATORS.format.default('png'),
  borderWidth: VALIDATORS.borderWidth.default(0),
  borderColor: VALIDATORS.borderColor.prefault('#000'),
});

const horizontalMasonrySchema = z.object({
  ...baseMasonrySchema.shape,
  flow: z.literal('horizontal'),
  rowHeight: VALIDATORS.rowHeight.optional(),
  canvasWidth: VALIDATORS.canvasWidth,
  hAlign: VALIDATORS.hAlign.default('justified'),
});

const verticalMasonrySchema = z.object({
  ...baseMasonrySchema.shape,
  flow: z.literal('vertical'),
  columnWidth: VALIDATORS.rowHeight.optional(),
  canvasHeight: VALIDATORS.canvasHeight,
  vAlign: VALIDATORS.vAlign.default('justified'),
});

export const masonrySchema = z
  .discriminatedUnion('flow', [horizontalMasonrySchema, verticalMasonrySchema])
  .superRefine((opts, ctx) => {
    if (opts.flow === 'horizontal' && opts.canvasWidth <= opts.gap * 2) {
      ctx.addIssue({
        code: 'custom',
        message: "Canvas is too small to place images in. Increase 'canvasWidth'.",
        path: ['canvasWidth'],
      });
    }

    if (opts.flow === 'vertical' && opts.canvasHeight <= opts.gap * 2) {
      ctx.addIssue({
        code: 'custom',
        message: "Canvas is too small to place images in. Increase 'canvasHeight'.",
        path: ['canvasHeight'],
      });
    }
  });
