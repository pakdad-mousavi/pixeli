import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const gridSchema = z
  .strictObject({
    shuffle: VALIDATORS.shuffle.default(false),
    cornerRadius: VALIDATORS.cornerRadius.default(0),
    gap: VALIDATORS.gap.default(50),
    canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
    borderWidth: VALIDATORS.borderWidth.default(0),
    borderColor: VALIDATORS.borderColor.prefault('#000'),
    format: VALIDATORS.format.default('png'),
    aspectRatio: VALIDATORS.aspectRatio.prefault('1:1'),
    imageWidth: VALIDATORS.imageWidth.optional(),
    columns: VALIDATORS.columns.default(4),
    caption: VALIDATORS.caption.default(false),
    captions: VALIDATORS.captions.nonempty().optional(),
    captionColor: VALIDATORS.captionColor.prefault('#000'),
    maxCaptionSize: VALIDATORS.maxCaptionSize.default(100),
  })
  .superRefine((opts, ctx) => {
    // Ensure captions are given if caption is set to true
    if (opts.caption && (!opts.captions || opts.captions.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Caption texts must be provided.',
        path: ['captions'],
      });
    }
  });
