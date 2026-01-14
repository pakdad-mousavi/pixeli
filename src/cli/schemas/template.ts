import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const cliTemplateSchema = z
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
    template: VALIDATORS.cliTemplate.optional(),
    preset: VALIDATORS.preset.optional(),
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

    // template XOR preset
    if (!opts.template && !opts.preset) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must provide either --template or --preset',
        path: [],
      });
    }

    if (opts.template && opts.preset) {
      ctx.addIssue({
        code: 'custom',
        message: 'You cannot use --template and --preset together',
        path: [],
      });
    }
  });
