import { MESSAGES } from '../../modules/messages.js';
import { MergeError } from '../../mergeError.js';
import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { requireContextProp } from '../../pipeline/guards.js';

export const applyComposites: MergeStep<any, any> = async (context, _options, _onProgress) => {
  requireContextProp(context, 'canvas');

  // Ensure canvas exists
  if (!context.canvas) {
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: 'cannot apply composites on undefined canvas',
    });
  }

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
