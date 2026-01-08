import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState } from '../index.js';

import { scaleImages } from '../../../utils/images/scaleImages.js';
import { roundImages } from '../../../utils/images/roundImages.js';
import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';

interface Options {
  cornerRadius: number;
}

export const prepareImages: MergeStep<Options, GridState> = async (context, options, _onProgress) => {
  requireState(context, 'imageWidth');
  requireState(context, 'imageHeight');
  requireNonEmptyArray(context.images, 'images');

  // Get values from context and options
  const width = context.state.imageWidth;
  const height = context.state.imageHeight;
  const cornerRadius = options.cornerRadius;

  // Prepare images
  const resizedImages = await scaleImages(context.images, { width, height });
  const roundedImages = await roundImages(resizedImages, { width, height, cornerRadius });

  // Update context
  context.images = roundedImages;
};
