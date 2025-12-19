import z from 'zod';
import sharp from 'sharp';
import type { GridSchema } from '../schemas/grid.js';

export interface ProgressInfo {
  completed: number;
  total: number;
  phase: string;
}

interface MergeCommand<T extends z.ZodObject<any>> {
  (imageInputs: sharp.SharpInput[], options: z.infer<T>, onProgress?: (info: ProgressInfo) => void): Promise<Buffer>;
}

export type GridMerge = MergeCommand<GridSchema>;
