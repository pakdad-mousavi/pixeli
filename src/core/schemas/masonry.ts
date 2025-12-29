import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const masonrySchema = z
  .strictObject({
    shuffle: VALIDATORS.shuffle.default(false),
    cornerRadius: VALIDATORS.cornerRadius.default(0),
    gap: VALIDATORS.gap.default(50),
    canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
    format: VALIDATORS.format.default('png'),
    rowHeight: VALIDATORS.rowHeight.optional(),
    columnWidth: VALIDATORS.columnWidth.optional(),
    canvasWidth: VALIDATORS.canvasWidth.optional(),
    canvasHeight: VALIDATORS.canvasHeight.optional(),
    flow: VALIDATORS.flow.default('horizontal'),
    hAlign: VALIDATORS.hAlign.default('justified'),
    vAlign: VALIDATORS.vAlign.default('justified'),
  })
  .superRefine((opts, ctx) => {
    switch (opts.flow) {
      case 'horizontal':
        if (opts.canvasWidth === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Canvas width must be provided for a horizontal flow.',
            path: ['canvasWidth'],
          });
          break;
        }

        if (opts.canvasWidth <= opts.gap * 2) {
          ctx.addIssue({
            code: 'custom',
            message: "Canvas is too small to place images in. Increase 'canvasWidth'.",
            path: ['canvasWidth'],
          });
        }
        break;

      case 'vertical':
        if (opts.canvasHeight === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Canvas height must be provided for a vertical flow.',
            path: ['canvasHeight'],
          });
          break;
        }

        if (opts.canvasHeight <= opts.gap * 2) {
          ctx.addIssue({
            code: 'custom',
            message: "Canvas is too small to place images in. Increase 'canvasHeight'.",
            path: ['canvasWidth'],
          });
        }
        break;
    }
  });
