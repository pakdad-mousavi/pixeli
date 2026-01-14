import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const cliCollageSchema = z
  .strictObject({
    files: VALIDATORS.files.optional(),
    dir: VALIDATORS.dir.optional(),
    recursive: VALIDATORS.recursive.default(false),
    shuffle: VALIDATORS.shuffle.default(false),
    cornerRadius: VALIDATORS.cliCornerRadius.default(0),
    gap: VALIDATORS.cliGap.default(50),
    canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
    borderWidth: VALIDATORS.cliBorderWidth.default(0),
    borderColor: VALIDATORS.borderColor.prefault('#000'),
    output: VALIDATORS.output.default('./pixeli.png'),
    aspectRatio: VALIDATORS.aspectRatio.prefault('1:1'),
    imageWidth: VALIDATORS.cliImageWidth.optional(),
    columns: VALIDATORS.cliColumns.default(4),
    overlapPercentage: VALIDATORS.cliOverlapPercentage.default(25),
    rotationRange: VALIDATORS.cliRotationRange.default(7),
    imageWidthVariance: VALIDATORS.cliImageWidthVariance.default(10),
  })
  .superRefine((opts, ctx) => {
    // files XOR dir
    if (opts.files && !opts.files.length && !opts.dir) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must provide either --files or --dir',
        path: [],
      });
    }

    if (opts.files && opts.files.length && opts.dir) {
      ctx.addIssue({
        code: 'custom',
        message: 'You cannot use --files and --dir together',
        path: [],
      });
    }
  });
