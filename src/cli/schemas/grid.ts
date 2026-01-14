import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const cliGridSchema = z
  .strictObject({
    files: VALIDATORS.files.optional(),
    dir: VALIDATORS.dir.optional(),
    recursive: VALIDATORS.recursive.default(false),
    shuffle: VALIDATORS.shuffle.default(false),
    cornerRadius: VALIDATORS.cliCornerRadius.default(0),
    gap: VALIDATORS.cliGap.default(50),
    canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
    output: VALIDATORS.output.default('./pixeli.png'),
    aspectRatio: VALIDATORS.aspectRatio.prefault('1:1'),
    imageWidth: VALIDATORS.cliImageWidth.optional(),
    columns: VALIDATORS.cliColumns.default(4),
    caption: VALIDATORS.caption.default(false),
    captionColor: VALIDATORS.captionColor.prefault('#000'),
    borderWidth: VALIDATORS.cliBorderWidth.default(0),
    borderColor: VALIDATORS.borderColor.prefault("#000"),
    maxCaptionSize: VALIDATORS.cliMaxCaptionSize.default(100),
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
