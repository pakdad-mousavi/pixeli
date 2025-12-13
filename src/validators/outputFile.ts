import path from 'node:path';
import z from 'zod';

const SUPPORTED_OUTPUT_FORMATS: readonly string[] = ['.webp', '.gif', '.jpeg', '.jpg', '.png', '.tiff', '.avif'];

export const outputFileValidator = z.string().refine((outputPath) => {
  const extension = path.extname(outputPath);
  return SUPPORTED_OUTPUT_FORMATS.includes(extension);
});
