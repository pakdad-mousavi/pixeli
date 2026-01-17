import sharp from 'sharp';
import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { isActualImage } from '../../utils/images/isActualImage.js';
import { MergeError } from '../../mergeError.js';
import { requireNonEmptyArray } from '../../pipeline/guards.js';

export const loadImages: MergeStep<any, any> = async (context, _options, progressTracker, onProgress) => {
  const PHASE = 'Loading images' as const;

  // Ensure inputs are provided
  requireNonEmptyArray(context.inputs, 'inputs');

  // Initialize phase and emit initial progressInfo
  progressTracker.setTotal(PHASE, context.inputs.length);
  onProgress?.(progressTracker.getProgressInfo('start'));

  const images: sharp.Sharp[] = [];
  for (let i = 0; i < context.inputs.length; i++) {
    // Ensure image is valid
    const input = context.inputs[i]!;
    const { isImage, reason } = await isActualImage(input);

    if (!isImage) {
      throw new MergeError(`Invalid image input at index ${i}`, {
        type: 'validation',
        cause: reason,
      });
    }

    images.push(sharp(input));

    progressTracker.incrementProgress('Loading images');
    onProgress?.(progressTracker.getProgressInfo());
  }

  // Ensure there's at least one image
  if (images.length <= 0) {
    throw new MergeError('No images provided to merge', { type: 'validation' });
  }

  context.images = images;
};
