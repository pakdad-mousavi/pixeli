import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { MasonryState } from '../index.js';
import { requireState } from '../../../pipeline/guards.js';

interface CalculateCanvasDimensionsVerticalOptions {
  flow: 'horizontal';
  gap: number;
  canvasWidth: number;
}

interface CalculateCanvasDimensionsHorizontalOptions {
  flow: 'vertical';
  gap: number;
  canvasHeight: number;
}

type CalculateCanvasDimensionsOptions = CalculateCanvasDimensionsVerticalOptions | CalculateCanvasDimensionsHorizontalOptions;

export const calculateCanvasDimensions: MergeStep<CalculateCanvasDimensionsOptions, MasonryState> = async (
  context,
  options,
  _onProgress
) => {
  // Mandatory regardless of flow
  requireState(context.state, 'lanes');

  // Put both canvas width and height in context state
  const totalLanes = context.state.lanes.length;
  if (options.flow === 'horizontal') {
    requireState(context.state, 'rowHeight');
    context.state.canvasWidth = options.canvasWidth;
    context.state.canvasHeight = totalLanes * context.state.rowHeight + (totalLanes + 1) * options.gap;
  } else {
    requireState(context.state, 'columnWidth');
    context.state.canvasHeight = options.canvasHeight;
    context.state.canvasWidth = totalLanes * context.state.columnWidth + (totalLanes + 1) * options.gap;
  }
};
