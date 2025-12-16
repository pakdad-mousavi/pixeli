import z from 'zod';
import { hexColorValidator } from './hexColor.js';
import { aspectRatioValidator } from './aspectRatio.js';
import { sharpImageValidation } from './sharpImageInput.js';
import { dirPathValidator, filePathValidator } from './path.js';
import { outputFileValidator } from './outputFile.js';
import { useNumberCoercion } from './coercion.js';

export const VALIDATORS = {
  // Inputs and outputs
  files: z.array(filePathValidator),
  template: filePathValidator,
  dir: dirPathValidator,
  output: outputFileValidator,
  imageInputs: z.array(sharpImageValidation),

  // Strings
  captions: z.array(z.string()),

  // Flags
  caption: z.boolean(),
  recursive: z.boolean(),
  shuffle: z.boolean(),

  // Colors
  canvasColor: hexColorValidator,
  captionColor: hexColorValidator,

  // Numbers
  cornerRadius: z.number().int().gte(0),
  gap: z.number().gte(0).int(),
  imageWidth: z.number().gt(0).int(),
  columns: z.number().gt(0).int(),
  maxCaptionSize: z.number().gt(0).int(),
  rowHeight: z.number().gt(0).int(),
  columnWidth: z.number().gt(0).int(),
  canvasWidth: z.number().gt(0).int(),
  canvasHeight: z.number().gt(0).int(),

  // Coerced Numbers
  cliCornerRadius: useNumberCoercion(z.number().int().gte(0)),
  cliGap: useNumberCoercion(z.number().gte(0).int()),
  cliImageWidth: useNumberCoercion(z.number().gt(0).int()).nullable(),
  cliColumns: useNumberCoercion(z.number().gt(0).int()),
  cliMaxCaptionSize: useNumberCoercion(z.number().gt(0).int()),
  cliRowHeight: useNumberCoercion(z.number().gt(0).int()),
  cliColumnWidth: useNumberCoercion(z.number().gt(0).int()),
  cliCanvasWidth: useNumberCoercion(z.number().gt(0).int()),
  cliCanvasHeight: useNumberCoercion(z.number().gt(0).int()),

  // Enumerations
  flow: z.enum(['horizontal', 'vertical']),
  hAlign: z.enum(['left', 'center', 'right', 'justified']),
  vAlign: z.enum(['top', 'middle', 'bottom', 'justified']),
  preset: z.enum(['instagram-grid', 'dashboard-shot', 'horizontal-book-spread', 'vertical-book-spread', 'art-gallery']),

  // Misc
  mapping: z.json(),
  aspectRatio: aspectRatioValidator,
};
