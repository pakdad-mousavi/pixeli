import type { GridMergeOptions, MergeCommand, ProgressInfo } from '../types.js';
import { gridSchema } from '../../schemas/grid.js';
import { MergePipeline } from '../../pipeline/mergePipeline.js';

import { loadImages } from '../shared-steps/loadImages.js';
import { validateCaptions } from '../shared-steps/validateCaptions.js';
import { applyComposites } from '../shared-steps/applyComposites.js';
import { createCanvas } from '../shared-steps/createCanvas.js';
import { exportCanvas } from '../shared-steps/exportCanvas.js';

import { shuffleImagesAndCaptions } from './steps/shuffleImagesAndCaptions.js';
import { calculateImageDimensions } from './steps/calculateImageDimensions.js';
import { prepareImages } from './steps/prepareImages.js';
import { calculateCanvasDimensions } from './steps/calculateCanvasDimensions.js';
import { calculateFontSize } from './steps/calculateFontSize.js';
import { createComposites } from './steps/createComposites.js';

export interface GridState {
  // Flags
  areCaptionsProvided: boolean;

  // Dimensions and sizes
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  captionHeight: number;
  fontSize: number;

  // Layout
  rows: number;
}

const gridPhases = [
  'Loading images',
  'Resizing images',
  'Rounding images',
  'Bordering images',
  'Merging images',
  'Writing to buffer',
] as const;

export type GridPhase = (typeof gridPhases)[number];

export const gridMerge: MergeCommand<GridMergeOptions, (typeof gridPhases)[number]> = async (
  imageInputs,
  options,
  onProgress,
) => {
  const context = {
    inputs: imageInputs,
    captions: [],
    composites: [],
    images: [],
    state: {} as GridState,
  };

  const gridMergePipeline = await MergePipeline.createPipeline(gridSchema, options, context, gridPhases, onProgress);

  gridMergePipeline
    .use(loadImages)
    .use(validateCaptions)
    .use(shuffleImagesAndCaptions)
    .use(calculateImageDimensions)
    .use(prepareImages)
    .use(calculateCanvasDimensions)
    .use(calculateFontSize)
    .use(createCanvas)
    .use(createComposites)
    .use(applyComposites)
    .use(exportCanvas);

  return await gridMergePipeline.run();
};
