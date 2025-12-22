import path from 'node:path';
import z from 'zod';
import { SUPPORTED_OUTPUT_FORMATS, type SupportedOutputFormat } from '../core/helpers.js';

export const outputFileValidator = z.string().refine((outputPath) => {
  const extension = path.extname(outputPath).replace('.', '');
  return SUPPORTED_OUTPUT_FORMATS.includes(extension as SupportedOutputFormat);
}, '--output image format is invalid');
