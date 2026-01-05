import { MergePipeline } from '../../pipeline/mergePipeline.js';
import { masonrySchema } from '../../schemas/masonry.js';

import type { MasonryMerge } from '../types.js';
import type sharp from 'sharp';

import { loadImages } from '../shared-steps/loadImages.js';
import { createCanvas } from '../shared-steps/createCanvas.js';
import { applyComposites } from '../shared-steps/applyComposites.js';
import { exportCanvas } from '../shared-steps/exportCanvas.js';

import { calculateLaneSize } from './steps/calculateLaneSize.js';
import { resizeImages } from './steps/resizeImages.js';
import { splitIntoLanes } from './steps/splitIntoLanes.js';
import { calculateCanvasDimensions } from './steps/calculateCanvasDimensions.js';
import { createComposites } from './steps/createComposites.js';

export interface MasonryState {
  // Dimensions
  rowHeight: number;
  columnWidth: number;
  canvasWidth: number;
  canvasHeight: number;

  // Layout
  lanes: sharp.Sharp[][];
}

export const masonryMerge: MasonryMerge = async (imageInputs, options, onProgress) => {
  const context = {
    inputs: imageInputs,
    captions: [],
    composites: [],
    images: [],
    state: {} as MasonryState,
  };

  const masonryMergePipeline = await MergePipeline.createPipeline<typeof masonrySchema, typeof options, MasonryState>(
    masonrySchema,
    options,
    context,
    onProgress
  );

  masonryMergePipeline
    .use(loadImages)
    .use(calculateLaneSize)
    .use(resizeImages)
    .use(splitIntoLanes)
    .use(calculateCanvasDimensions)
    .use(createCanvas)
    .use(createComposites)
    .use(applyComposites)
    .use(exportCanvas);

  return await masonryMergePipeline.run();
};
