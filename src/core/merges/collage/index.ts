import type { CollageMerge } from '../types.js';
import { collageSchema } from '../../schemas/collage.js';
import { MergePipeline } from '../../pipeline/mergePipeline.js';
import sharp from 'sharp';

import { loadImages } from '../shared-steps/loadImages.js';
import { applyComposites } from '../shared-steps/applyComposites.js';
import { createCanvas } from '../shared-steps/createCanvas.js';
import { exportCanvas } from '../shared-steps/exportCanvas.js';
import { finalizeImagePipelines } from '../shared-steps/finalizeImagePipelines.js';

import { loadImages as loadImagesUtil } from '../../../cli/modules/loadImages.js';
import { writeFileSync } from 'node:fs';

import { calculateImageDimensions } from './steps/calculateImageDimensions.js';
import { resizeAndBorderImages } from './steps/resizeAndBorderImages.js';
import { rotateImages } from './steps/rotateImages.js';
import { createComposites } from './steps/createComposites.js';

export interface CollageState {
  // Dimensions and sizes
  imageWidth: number;
  imageHeight: number;

  canvasWidth: number;
  canvasHeight: number;

  rows: number;
}

export const collageMerge: CollageMerge = async (imageInputs, options, onProgress) => {
  const context = {
    inputs: imageInputs,
    captions: [],
    composites: [],
    images: [],
    state: {} as CollageState,
  };

  const collageMergePipeline = await MergePipeline.createPipeline<typeof collageSchema, typeof options, CollageState>(
    collageSchema,
    options,
    context,
    onProgress
  );

  collageMergePipeline
    .use(loadImages)
    .use(calculateImageDimensions)
    .use(resizeAndBorderImages)
    .use(rotateImages)
    .use(finalizeImagePipelines)
    .use(createComposites)
    .use(createCanvas)
    .use(applyComposites)
    .use(exportCanvas);

  return await collageMergePipeline.run();
};

const { images } = await loadImagesUtil({ input: { dir: './samples/images', files: undefined }, recursive: true });
const x = await collageMerge(images, {
  imageWidth: 400,
  imageWidthVariance: 10,
  overlapPercentage: 25,
  rotationRange: 7,
  borderWidth: 10,
  canvasColor: '#fff',
  columns: 8,
  cornerRadius: 100,
});

writeFileSync('test.png', x);
