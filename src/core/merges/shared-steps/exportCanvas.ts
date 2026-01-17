import { MESSAGES } from '../../modules/messages.js';
import type { SupportedOutputFormat } from '../../helpers.js';
import { MergeError } from '../../mergeError.js';
import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { requireContextProp } from '../../pipeline/guards.js';

interface Options {
  format: SupportedOutputFormat;
}

export const exportCanvas: MergeStep<Options, any> = async (context, options, progressTracker, onProgress) => {
  // Set up phase
  const PHASE = 'Writing to buffer';

  // Ensure canvas exists
  requireContextProp(context, 'canvas');

  // Set up phase total
  progressTracker.setTotal(PHASE, 1);
  onProgress?.(progressTracker.getProgressInfo());
  let res;

  try {
    res = await context.canvas.toFormat(options.format).toBuffer();
  } catch (err) {
    // Assuming ALL sharp errors are instances of the Error object
    const sharpError = err as Error;

    // SPECIFIC SHARP ERROR
    // occurs when trying to create a buffer that exceeds the limits of the current image format
    if (sharpError.message.includes('pixel limit') || sharpError.message.includes('Processed image is too large')) {
      const errText = `Error: image to large for "${options.format}" format, try a format that allows larger images`;
      throw new MergeError(errText, { type: 'image' });
    }

    // Other sharp errors
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: err,
    });
  } finally {
    progressTracker.incrementProgress(PHASE);
    onProgress?.(progressTracker.getProgressInfo('complete'));
  }

  return res;
};
