import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { CollageState } from '../index.js';

import { requireNonEmptyArray } from '../../../pipeline/guards.js';

import { randint } from '../../../utils/math/randint.js';

interface Options {
  rotationRange: number;
}

export const rotateImages: MergeStep<Options, CollageState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  for (let i = 0; i < context.images.length; i++) {
    const angle = randint(-options.rotationRange, options.rotationRange);
    context.images[i] = context.images[i]!.toFormat('png').rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }
};
