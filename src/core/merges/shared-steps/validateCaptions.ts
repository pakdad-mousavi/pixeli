import type { MergeStep } from '../../pipeline/mergePipeline.js';
import { MergeError } from '../../mergeError.js';

interface ValidateCaptionsOptions {
  caption: boolean;
  captions?: string[] | undefined;
}

interface ValidateCaptionsState {
  areCaptionsProvided: boolean;
}

export const validateCaptions: MergeStep<ValidateCaptionsOptions, ValidateCaptionsState> = async (
  context,
  options,
  _onProgress
) => {
  // Initially set to false
  context.state.areCaptionsProvided = false;

  // Update context
  if (areCaptionsProvided(options.caption, options.captions)) {
    context.state.areCaptionsProvided = true;
    context.captions = options.captions as string[];
  }

  // Ensure caption length is not less than image length
  if (areCaptionsProvided(options.caption, options.captions) && options.captions.length !== context.images.length) {
    throw new MergeError('The same number of captions and images must be provided', { type: 'validation' });
  }
};

const areCaptionsProvided = (caption: boolean, captions: string[] | undefined): captions is string[] => {
  return caption;
};
