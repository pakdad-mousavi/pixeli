import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { requireNonEmptyArray } from '../../pipeline/guards.js';
import sharp from 'sharp';

export const finalizeImagePipelines: MergeStep<any, any> = async (context, _options, _onProgress) => {
  requireNonEmptyArray(context.images);

  for (let i = 0; i < context.images.length; i++) {
    const buffer = await context.images[i]!.toBuffer();
    context.images[i] = sharp(buffer);
  }
};
