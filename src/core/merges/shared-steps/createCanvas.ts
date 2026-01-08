import type { MergeStep } from '../../pipeline/mergePipeline.js';
import type { RGBA } from '../../utils/colors/types.js';
import { requireState } from '../../pipeline/guards.js';

import sharp from 'sharp';

interface Options {
  canvasColor: RGBA;
}

interface State {
  canvasWidth: number;
  canvasHeight: number;
}

export const createCanvas: MergeStep<Options, State> = async (context, options, _onProgress) => {
  requireState(context, 'canvasWidth');
  requireState(context, 'canvasHeight');

  // Create canvas
  const canvas = sharp({
    limitInputPixels: false,
    create: {
      width: context.state.canvasWidth,
      height: context.state.canvasHeight,
      channels: 4,
      background: options.canvasColor,
    },
  });

  context.canvas = canvas;
};
