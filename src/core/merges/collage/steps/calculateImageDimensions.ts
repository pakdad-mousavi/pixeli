import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import { requireNonEmptyArray } from '../../../pipeline/guards.js';
import type { CollageState } from '../index.js';

import { MESSAGES } from '../../../modules/messages.js';
import { MergeError } from '../../../mergeError.js';

import { getImageWidths } from '../../../utils/images/getImageWidths.js';
import { trimmedMedian } from '../../../utils/math/trimmedMedian.js';

interface Options {
  imageWidth?: number | undefined;
  aspectRatio: number;
  imageWidthVariance: number;

  gap: number;
  columns: number;
  overlapPercentage: number;
}

export const calculateImageDimensions: MergeStep<Options, CollageState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  // Calculate image width
  const width = options.imageWidth || trimmedMedian(await getImageWidths(context.images));
  if (width === null) {
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: 'trimmedMedian failed' });
  }

  const height = Math.floor(width / options.aspectRatio);
  const rows = Math.ceil(context.images.length / options.columns);

  context.state.imageWidth = width;
  context.state.imageHeight = height;
  context.state.rows = rows;
};
