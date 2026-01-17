import sharp from 'sharp';
import type { Color } from '../utils/colors/types.js';
import type { Template } from './template/types.js';
import type { PhaseProgress } from '../modules/progressTracker.js';

export type ProgressLifecycle = 'start' | 'update' | 'complete';

export interface ProgressInfo<TPhase extends string> {
  /** The current event lifecycle type. The values of the progress lifecycle is one of the following values:
   *
   * - `start` represents the very first update of the very first phase.
   * - `update` represents when progress has been made or a total has been set.
   * - `complete` represents the very last update of the very last phase.
   */
  progressLifecycle: ProgressLifecycle;

  /** Progress per logical phase. */
  phases: Record<TPhase, PhaseProgress>;

  overall: {
    /** The total number of operations that have been completed. */
    completed: number;

    /** The total number of operations that need to be completed (so far). */
    total: number;

    /** Calculated as `completed / total`, may return null if `total = 0`. */
    percent: number | null;
  };
}

export type OnProgress<TPhase extends string> = (info: ProgressInfo<TPhase>) => void;

/**
 * Generic image merge command.
 *
 * @template T - Merge-specific configuration options
 * @param imageInputs - Input images to merge
 * @param options - Merge options
 * @param onProgress - Optional progress callback
 * @returns A Promise resolving to the merged image buffer
 */
export interface MergeCommand<T, TPhase extends string> {
  (imageInputs: sharp.SharpInput[], options: T, onProgress?: OnProgress<TPhase>): Promise<Buffer>;
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

  /** Width of the border around each image. Borders are placed internally in each image. */
  borderWidth?: number;

  /** Color of the border around each image. */
  borderColor?: Color;

  /** Output image format (png, jpeg, webp). */
  format?: string;
}

export interface GridMergeOptions extends BaseMergeOptions {
  /** The aspect ratio of each image. Used to calculate image height based on given width.
   *
   * Examples include `16:9`, `3x2` or `1.777`. */
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

interface TemplateMergeOptions extends BaseMergeOptions {
  template: Template;
}

interface CollageMergeOptions extends Omit<BaseMergeOptions, 'gap'> {
  /** Width of each image cell in pixels, uses the median image width if undefined. */
  imageWidth?: number | undefined;

  /** The aspect ratio of each image. Used to calculate image height based on given width.
   *
   * Examples include `16:9`, `3x2` or `1.777`. */
  aspectRatio?: string | number;

  /** Number of columns in the collage grid. */
  columns?: number;

  /** The number of pixels to potentially variate `imageWidth` by. Used to create random-sized images in the collage.
   *
   *  For example, a value of `50` results in images being up to `50` pixels wider or narrower than the given `imageWidth`. */
  imageWidthVariance?: number;

  /** The estimated percentage of overlap for every image pair. A higher percentage creates a tighter collage. */
  overlapPercentage?: number;

  /** The maximum and minimum degree to rotate each image.
   *
   * For example, a value of `10` will result in a random degree being picked from `-10` to `+10` degrees. */
  rotationRange?: number;
}

// export type GridMerge = MergeCommand<GridMergeOptions>;

export type MasonryMerge = MergeCommand<MasonryMergeOptions>;

export type TemplateMerge = MergeCommand<TemplateMergeOptions>;

export type CollageMerge = MergeCommand<CollageMergeOptions>;
