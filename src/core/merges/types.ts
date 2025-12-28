import sharp from 'sharp';
import type { Color } from '../utils/colors/types.js';

export interface ProgressInfo {
  /** How many images have been processed so far */
  completed: number;

  /** The total number of images to be processed */
  total: number;

  /** The current phase of the merge */
  phase: string;
}

/**
 * Generic image merge command.
 *
 * @template T - Merge-specific configuration options
 * @param imageInputs - Input images to merge
 * @param options - Merge options
 * @param onProgress - Optional progress callback
 * @returns A Promise resolving to the merged image buffer
 */
interface MergeCommand<T> {
  (imageInputs: sharp.SharpInput[], options: T, onProgress?: (info: ProgressInfo) => void): Promise<Buffer>;
}

export interface GridMergeOptions {
  /** Whether to randomize image order before merging. */
  shuffle?: boolean;

  /** Rounded corner radius in pixels. */
  cornerRadius?: number;

  /** Gap between images in pixels. */
  gap?: number;

  /** Background canvas color. */
  canvasColor?: Color;

  /** Output image format (png, jpeg, webp). */
  format?: string;

  /** Grid aspect ratio (e.g. "16:9" or 1.777). */
  aspectRatio?: string | number;

  /** Width of each image cell in pixels, uses the smallest image width if undefined. */
  imageWidth?: number | undefined;

  /** Number of columns in the grid. */
  columns?: number;

  /** Enable captions under images. */
  caption?: boolean;

  /** Captions text (one per image, in order). */
  captions?: string[];

  /** Caption text color. */
  captionColor?: Color;

  /** Maximum caption font size in pixels. */
  maxCaptionSize?: number;
}

export type GridMerge = MergeCommand<GridMergeOptions>;
