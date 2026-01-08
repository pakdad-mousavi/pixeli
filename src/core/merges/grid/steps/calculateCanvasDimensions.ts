import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState } from '../index.js';
import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';

interface Options {
  columns: number;
  gap: number;
}

export const calculateCanvasDimensions: MergeStep<Options, GridState> = async (context, options, _onProgress) => {
  requireState(context, 'imageWidth');
  requireState(context, 'imageHeight');
  requireState(context, 'areCaptionsProvided');
  requireNonEmptyArray(context.images, 'images');

  const CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO = 0.04;
  const rows = Math.ceil(context.images.length / options.columns);

  const canvasWidth = context.state.imageWidth * options.columns + (options.columns + 1) * options.gap;
  const captionHeight = Math.floor(canvasWidth * CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO);

  const minimumCanvasHeight = context.state.imageHeight * rows + (rows + 1) * options.gap;
  const canvasHeight = context.state.areCaptionsProvided ? minimumCanvasHeight + rows * captionHeight : minimumCanvasHeight;

  // Assign values to state
  context.state.rows = rows;
  context.state.canvasWidth = canvasWidth;
  context.state.canvasHeight = canvasHeight;
  context.state.captionHeight = captionHeight;
};
