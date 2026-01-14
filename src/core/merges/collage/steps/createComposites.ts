import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { CollageState } from '../index.js';

import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';

import { shuffleArray } from '../../../helpers.js';

interface Options {
  overlapPercentage: number;
  columns: number;
}

export const createComposites: MergeStep<Options, CollageState> = async (context, options, onProgress) => {
  requireState(context, 'rows');
  requireNonEmptyArray(context.images, 'images');

  // Used to track canvas bounds
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < context.state.rows; i++) {
    for (let j = 0; j < options.columns; j++) {
      const index = i * options.columns + j;
      if (index >= context.images.length) {
        break;
      }
      const image = context.images[index]!;
      const meta = await image.metadata();

      // Calculate overlap
      const widthOverlap = context.state.imageWidth * (options.overlapPercentage / 100);
      const heightOverlap = context.state.imageHeight * (options.overlapPercentage / 100);

      // Calculate image center
      const cx = context.state.imageWidth * i - widthOverlap * i + context.state.imageWidth / 2;
      const cy = context.state.imageHeight * j - heightOverlap * j + context.state.imageHeight / 2;

      // Re-center rotated bitmap on original image center
      const top = Math.round(cx - meta.width / 2);
      const left = Math.round(cy - meta.height / 2);

      // Add to composites
      context.composites.push({
        input: await image.toBuffer(),
        left,
        top,
      });

      // Update bounds
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + meta.width);
      maxY = Math.max(maxY, top + meta.height);

      if (onProgress) {
        context.progressInfo.completed += 1;
        context.progressInfo.phase = 'Merging images';
        onProgress({ ...context.progressInfo });
      }
    }
  }

  // Offset all coords to avoid negatives
  const offsetX = -minX;
  const offsetY = -minY;

  for (const c of context.composites) {
    c.left! += offsetX;
    c.top! += offsetY;
  }

  // Update composites
  context.composites = shuffleArray(context.composites);

  // Update canvas width and height
  context.state.canvasWidth = Math.ceil(maxX - minX);
  context.state.canvasHeight = Math.ceil(maxY - minY);
};
