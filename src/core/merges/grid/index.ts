import type { GridMerge } from '../types.js';
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

export const gridMerge: GridMerge = async (imageInputs, options, onProgress) => {
  const context = {
    inputs: imageInputs,
    captions: [],
    composites: [],
    images: [],
    state: {} as GridState,
  };

  const gridMergePipeline = await MergePipeline.createPipeline<typeof gridSchema, typeof options, GridState>(
    gridSchema,
    options,
    context,
    onProgress
  );

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
