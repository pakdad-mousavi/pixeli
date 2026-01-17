import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState, GridPhase } from '../index.js';
import type { RGBA } from '../../../utils/colors/types.js';

import { scaleImage } from '../../../utils/images/scaleImage.js';
import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';
import { handleImageEdges } from '../../../utils/images/handleImageEdges.js';

interface Options {
  cornerRadius: number;
  borderWidth: number;
  borderColor: RGBA;
}

export const prepareImages: MergeStep<Options, GridState> = async (context, options, progressTracker, onProgress) => {
  requireState(context, 'imageWidth');
  requireState(context, 'imageHeight');
  requireNonEmptyArray(context.images, 'images');

  // Set up phases
  const RESIZE_PHASE = 'Resizing images' satisfies GridPhase;
  const ROUNDING_PHASE = 'Rounding images' satisfies GridPhase;
  const BORDERING_PHASE = 'Bordering images' satisfies GridPhase;

  // Initialize phases and emit initial progressInfos
  progressTracker.setTotal(RESIZE_PHASE, context.images.length);
  onProgress?.(progressTracker.getProgressInfo());

  progressTracker.setTotal(ROUNDING_PHASE, context.images.length);
  onProgress?.(progressTracker.getProgressInfo());

  progressTracker.setTotal(BORDERING_PHASE, context.images.length);
  onProgress?.(progressTracker.getProgressInfo());

  // Get values from context and options
  const width = context.state.imageWidth;
  const height = context.state.imageHeight;
  const cornerRadius = options.cornerRadius;

  for (let i = 0; i < context.images.length; i++) {
    const image = context.images[i]!;

    // Resize image
    const resizedImage = await scaleImage(image, { width, height });
    progressTracker.incrementProgress(RESIZE_PHASE);
    onProgress?.(progressTracker.getProgressInfo());

    // Handle borders and corner rounding
    const borderedImage = await handleImageEdges(resizedImage, {
      imageWidth: width,
      imageHeight: height,
      borderWidth: options.borderWidth,
      borderHeight: options.borderWidth,
      borderColor: options.borderColor,
      cornerRadius,
      finalizePipeline: true,
    });

    progressTracker.incrementProgress(BORDERING_PHASE);
    onProgress?.(progressTracker.getProgressInfo());

    progressTracker.incrementProgress(ROUNDING_PHASE);
    onProgress?.(progressTracker.getProgressInfo());

    // Update context
    context.images[i] = borderedImage;
  }
};
