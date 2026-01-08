import { MESSAGES } from '../../modules/messages.js';
import { MergeError } from '../../mergeError.js';
import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { requireContextProp } from '../../pipeline/guards.js';

export const applyComposites: MergeStep<any, any> = async (context, _options, _onProgress) => {
  requireContextProp(context, 'canvas');

  // Create final grid
  try {
    context.canvas = context.canvas.composite(context.composites);
  } catch (err) {
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: err,
    });
  }
};
