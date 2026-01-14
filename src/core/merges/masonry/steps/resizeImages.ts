import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';
import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { MasonryState } from '../index.js';

import { scaleImage } from '../../../utils/images/scaleImage.js';

interface Options {
  flow: 'horizontal' | 'vertical';
}

export const resizeImages: MergeStep<Options, MasonryState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  // Require either rowHeight or columnWidth
  options.flow === 'horizontal' ? requireState(context, 'rowHeight') : requireState(context, 'columnWidth');

  // Rescale images to match rowHeight or columnWidth
  const scaleOptions =
    options.flow === 'horizontal'
      ? { height: context.state.rowHeight, finalizePipeline: true }
      : { width: context.state.columnWidth, finalizePipeline: true };

  for (let i = 0; i < context.images.length; i++) {
    context.images[i] = await scaleImage(context.images[i]!, scaleOptions);
  }
};
