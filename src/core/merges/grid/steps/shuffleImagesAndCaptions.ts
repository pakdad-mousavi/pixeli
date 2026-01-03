import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState } from '../index.js';
import { shuffleArray, shuffleTogether } from '../../../helpers.js';
import { requireState } from '../../../pipeline/guards.js';

interface shuffleImagesAndCaptionsOptions {
  shuffle: boolean;
}

export const shuffleImagesAndCaptions: MergeStep<shuffleImagesAndCaptionsOptions, GridState> = async (
  context,
  options,
  _onProgress
) => {
  requireState(context.state, 'areCaptionsProvided');

  // If captions are given and shuffle is true
  if (context.state.areCaptionsProvided && options.shuffle) {
    const [shuffledImages, shuffledCaptions] = shuffleTogether(context.images, context.captions);
    context.images = shuffledImages;
    context.captions = shuffledCaptions;
  }
  // If there are no captions but shuffle is true
  else if (!context.state.areCaptionsProvided && options.shuffle) {
    const shuffledImages = shuffleArray(context.images);
    context.images = shuffledImages;
  }
};
