import { MergePipeline } from '../../pipeline/mergePipeline.js';
import { templateSchema } from '../../schemas/template.js';

import type { TemplateMerge } from '../types.js';
import type { Block } from './types.js';

import { loadImages } from '../shared-steps/loadImages.js';
import { applyComposites } from '../shared-steps/applyComposites.js';
import { createCanvas } from '../shared-steps/createCanvas.js';
import { exportCanvas } from '../shared-steps/exportCanvas.js';

import { calculateCanvasDimensions } from './steps/calculateSlotDimensions.js';
import { getBlocks } from './steps/getBlocks.js';
import { createComposites } from './steps/createComposites.js';

export interface TemplateState {
  // Dimensions and sizes
  slotWidth: number;
  slotHeight: number;
  canvasWidth: number;
  canvasHeight: number;

  // Layout
  blocks: Block[];
}

export const templateMerge: TemplateMerge = async (imageInputs, options, onProgress) => {
  const context = {
    inputs: imageInputs,
    captions: [],
    composites: [],
    images: [],
    state: {} as TemplateState,
  };

  const templateMergePipeline = await MergePipeline.createPipeline<typeof templateSchema, typeof options, TemplateState>(
    templateSchema,
    options,
    context,
    onProgress
  );

  templateMergePipeline
    .use(loadImages)
    .use(calculateCanvasDimensions)
    .use(getBlocks)
    .use(createCanvas)
    .use(createComposites)
    .use(applyComposites)
    .use(exportCanvas);

  return await templateMergePipeline.run();
};
