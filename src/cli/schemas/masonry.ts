import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

const baseCliMasonryOptions = z.object({
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
  flow: VALIDATORS.flow.default('horizontal'),
});

const horizontalCliMasonryOptions = z.object({
  ...baseCliMasonryOptions.shape,
  flow: z.literal('horizontal').default('horizontal'), // default() ensures proper command line defaults
  rowHeight: VALIDATORS.cliRowHeight.optional(),
  canvasWidth: VALIDATORS.cliCanvasWidth,
  hAlign: VALIDATORS.hAlign.default('justified'),
});

const verticalCliMasonryOptions = z.object({
  ...baseCliMasonryOptions.shape,
  flow: z.literal('vertical'),
  columnWidth: VALIDATORS.cliColumnWidth.optional(),
  canvasHeight: VALIDATORS.cliCanvasHeight,
  vAlign: VALIDATORS.vAlign.default('justified'),
});

export const cliMasonrySchema = z
  .discriminatedUnion('flow', [verticalCliMasonryOptions, horizontalCliMasonryOptions])
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
