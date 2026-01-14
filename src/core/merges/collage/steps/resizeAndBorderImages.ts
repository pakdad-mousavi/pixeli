import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { CollageState } from '../index.js';

import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';

import { randint } from '../../../utils/math/randint.js';
import type { RGBA } from '../../../utils/colors/types.js';
import { scaleImage } from '../../../utils/images/scaleImage.js';
import { handleImageEdges } from '../../../utils/images/handleImageEdges.js';

interface Options {
  imageWidthVariance: number;
  aspectRatio: number;
  borderWidth: number;
  cornerRadius: number;
  borderColor: RGBA;
}

export const resizeAndBorderImages: MergeStep<Options, CollageState> = async (context, options, _onProgress) => {
  requireState(context, 'imageWidth');
  requireState(context, 'imageHeight');
  requireNonEmptyArray(context.images, 'images');

  for (let i = 0; i < context.images.length; i++) {
    const varianceWidth = randint(-options.imageWidthVariance, options.imageWidthVariance);
    const width = context.state.imageWidth + varianceWidth;

    const varianceHeight = Math.floor(varianceWidth / options.aspectRatio);
    const height = context.state.imageHeight + varianceHeight;

    const resizedImage = await scaleImage(context.images[i]!, { width, height });

    const borderedImage = await handleImageEdges(resizedImage, {
      imageWidth: width,
      imageHeight: height,
      borderWidth: options.borderWidth,
      borderHeight: options.borderWidth,
      borderColor: options.borderColor,
      cornerRadius: options.cornerRadius,
      finalizePipeline: true,
    });

    context.images[i] = borderedImage;
  }
};
