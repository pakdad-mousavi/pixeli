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

export type OnProgress = (info: ProgressInfo) => void;

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
  (imageInputs: sharp.SharpInput[], options: T, onProgress?: OnProgress): Promise<Buffer>;
}

interface BaseMergeOptions {
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
}

export interface GridMergeOptions extends BaseMergeOptions {
  /** Grid aspect ratio (e.g. "16:9" or 1.777). */
  aspectRatio?: string | number;

  /** Width of each image cell in pixels, uses the median image width if undefined. */
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

export interface MasonryMergeOptions extends BaseMergeOptions {
  /** The height of each row, defaults to the trimmed median image height if undefined. Only applied in horizontal flows. */
  rowHeight?: number | undefined;

  /** The width of each column, defaults to the trimmed median image width if undefined. Only applied in vertical flows. */
  columnWidth?: number | undefined;

  /** The width of the entire canvas. Only required in horizontal flows. */
  canvasWidth?: number | undefined;

  /** The width of the entire canvas. Only required in vertical flows. */
  canvasHeight?: number | undefined;

  /** The orientation of the masonry layout. */
  flow: 'horizontal' | 'vertical';

  /** The horizontal alignment of each row. Only applied in horizontal layouts. */
  hAlign?: 'left' | 'center' | 'right' | 'justified';

  /** The vertical alignment of each column. Only applied in vertical layouts. */
  vAlign?: 'top' | 'middle' | 'bottom' | 'justified';
}

export type GridMerge = MergeCommand<GridMergeOptions>;

export type MasonryMerge = MergeCommand<MasonryMergeOptions>;
