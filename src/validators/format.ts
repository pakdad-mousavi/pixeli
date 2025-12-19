import z from 'zod';
import { isSupportedOutputImage, SUPPORTED_OUTPUT_FORMATS } from '../core/helpers.js';

export const formatValidator = z.string().transform((extname, ctx) => {
  if (isSupportedOutputImage(extname)) {
    return extname;
  } else {
    ctx.addIssue({
      code: 'custom',
      path: ['format'],
      message: `Invalid format type. Valid output formats include: ${SUPPORTED_OUTPUT_FORMATS.join(', ')}`,
    });

    return z.NEVER;
  }
});
