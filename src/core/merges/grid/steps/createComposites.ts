import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridPhase, GridState } from '../index.js';
import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';
import sharp from 'sharp';
import { createSvgTextBuffer } from '../../../utils/svg/createSvgTextBuffer.js';
import type { RGBA } from '../../../utils/colors/types.js';
import { rgbaToHex } from '../../../utils/colors/rgbaToHex.js';

interface Options {
  columns: number;
  gap: number;
  captionColor: RGBA;
}

export const createComposites: MergeStep<Options, GridState> = async (context, options, progressTracker, onProgress) => {
  requireState(context, 'areCaptionsProvided');
  requireState(context, 'captionHeight');
  requireState(context, 'imageWidth');
  requireState(context, 'imageHeight');
  requireState(context, 'rows');
  requireNonEmptyArray(context.images, 'images');

  // Set up phase
  const PHASE = 'Merging images' satisfies GridPhase;

  // Initialize phase and emit initial progressInfo
  progressTracker.setTotal(PHASE, context.images.length);
  onProgress?.(progressTracker.getProgressInfo());

  // Only needed when there are captions
  if (context.state.areCaptionsProvided) {
    requireState(context, 'fontSize');
  }

  const composites = [];

  let x = options.gap;
  let y = options.gap;

  for (let row = 0; row < context.state.rows; row++) {
    for (let col = 0; col < options.columns; col++) {
      const index = row * options.columns + col;
      if (index >= context.images.length) break;

      const image = context.images[index] as sharp.Sharp;

      composites.push({
        input: await image.toBuffer(),
        left: x,
        top: y,
      });

      // Add caption if required
      if (context.state.areCaptionsProvided) {
        // Create text
        const svgBuffer = createSvgTextBuffer({
          text: context.captions[index] as string,
          maxWidth: context.state.imageWidth,
          maxHeight: context.state.captionHeight,
          fontSize: context.state.fontSize,
          fill: rgbaToHex(options.captionColor),
        });

        // Add text to composites
        composites.push({
          input: svgBuffer,
          left: x,
          top: y + context.state.imageHeight,
        });
      }

      // Update coordinates
      x += context.state.imageWidth + options.gap;

      // Call the onProgress callback
      progressTracker.incrementProgress(PHASE);
      onProgress?.(progressTracker.getProgressInfo());
    }

    // Update coordinates
    y += context.state.areCaptionsProvided
      ? context.state.imageHeight + options.gap + context.state.captionHeight
      : context.state.imageHeight + options.gap;

    x = options.gap;
  }

  context.composites = composites;
};
