import { requireState } from '../../../pipeline/guards.js';
import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { MasonryState } from '../index.js';

import { scaleImages } from '../../../utils/images/scaleImages.js';

interface Options {
  flow: 'horizontal' | 'vertical';
}

export const resizeImages: MergeStep<Options, MasonryState> = async (context, options, _onProgress) => {
  // Require either rowHeight or columnWidth
  options.flow === 'horizontal' ? requireState(context, 'rowHeight') : requireState(context, 'columnWidth');

  // Rescale images to match rowHeight or columnWidth
  const scaleOptions =
    options.flow === 'horizontal'
      ? { height: context.state.rowHeight, finalizePipeline: true }
      : { width: context.state.columnWidth, finalizePipeline: true };
  context.images = await scaleImages(context.images, scaleOptions);
};
