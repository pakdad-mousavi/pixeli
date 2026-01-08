import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { GridState } from '../index.js';
import { requireState } from '../../../pipeline/guards.js';
import { getFontSize } from '../../../utils/fonts/getFontSize.js';

interface Options {
  maxCaptionSize: number;
}

export const calculateFontSize: MergeStep<Options, GridState> = async (context, options, _onProgress) => {
  if (!context.state.areCaptionsProvided) return;

  requireState(context, 'imageWidth');
  requireState(context, 'captionHeight');

  const longestCaption = context.captions.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  });

  context.state.fontSize = await getFontSize({
    text: longestCaption,
    maxWidth: context.state.imageWidth,
    maxHeight: context.state.captionHeight,
    initialFontSize: options.maxCaptionSize,
  });
};
