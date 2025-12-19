import z from 'zod';
import type { GridSchema } from '../schemas/grid.js';
import sharp from 'sharp';

interface ProgressInfo {
  completed: number;
  total: number;
  imageIndex: number;
}

interface MergeCommand<T extends z.ZodObject<any>> {
  (imageInputs: sharp.SharpInput[], options: z.infer<T>, onProgress?: (info: ProgressInfo) => void): Promise<Buffer>;
}

export type GridMerge = MergeCommand<GridSchema>;
