import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState } from '../index.js';

import { MESSAGES } from '../../../modules/messages.js';
import { MergeError } from '../../../mergeError.js';
import { getImageWidths } from '../../../utils/images/getImageWidths.js';
import { trimmedMedian } from '../../../utils/math/trimmedMedian.js';
import { requireNonEmptyArray } from '../../../pipeline/guards.js';

interface Options {
  imageWidth?: number | undefined;
  aspectRatio: number;
}

export const calculateImageDimensions: MergeStep<Options, GridState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  // Calculate image width
  const width = options.imageWidth || trimmedMedian(await getImageWidths(context.images));
  if (width === null) {
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: 'trimmedMedian failed' });
  }

  // Calculate image height
  const height = Math.floor(width / options.aspectRatio);

  // Assign to context
  context.state.imageWidth = width;
  context.state.imageHeight = height;
};
