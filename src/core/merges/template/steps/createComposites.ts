import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { Template } from '../types.js';
import type { TemplateState } from '../index.js';

import { requireState } from '../../../pipeline/guards.js';

interface Options {
  template: Template;
  gap: number;
  cornerRadius: number;
}

export const createComposites: MergeStep<Options, TemplateState> = async (context, options, onProgress) => {
  // Require needed states
  requireState(context, 'blocks');
  requireState(context, 'slotWidth');
  requireState(context, 'slotHeight');

  // Collect composites
  const composites = [];

  for (const block of context.state.blocks) {
    const x = (block.col - 1) * context.state.slotWidth + block.col * options.gap;
    const y = (block.row - 1) * context.state.slotHeight + block.row * options.gap;

    composites.push({
      input: block.imageBuffer,
      left: Math.floor(x),
      top: Math.floor(y),
    });

    // Update progress
    if (onProgress) {
      context.progressInfo.phase = 'Merging images';
      context.progressInfo.completed += 1;
      onProgress({ ...context.progressInfo });
    }
  }

  context.composites = composites;
};
