import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { Block, Template } from '../types.js';
import type { TemplateState } from '../index.js';

import { roundImages } from '../../../utils/images/roundImages.js';
import { requireState } from '../../../pipeline/guards.js';

interface Options {
  template: Template;
  gap: number;
  cornerRadius: number;
}

export const getBlocks: MergeStep<Options, TemplateState> = async (context, options, _onProgress) => {
  // Require needed states
  requireState(context, 'slotWidth');
  requireState(context, 'slotHeight');

  const blocks: Block[] = [];

  for (let i = 0; i < options.template.slots.length && i < context.images.length; i++) {
    const slot = options.template.slots[i]!;
    const image = context.images[i]!;
    let imageBuffer;

    // Calculate image width and height
    const width = slot.colSpan * context.state.slotWidth + (slot.colSpan - 1) * options.gap;
    const height = slot.rowSpan * context.state.slotHeight + (slot.rowSpan - 1) * options.gap;

    // Resize image respectively
    const resizedImage = image.resize({ width: Math.floor(width), height: Math.floor(height) });

    // Round corners of images if needed
    if (options.cornerRadius > 0) {
      const roundingOptions = {
        width: Math.floor(width),
        height: Math.floor(height),
        cornerRadius: options.cornerRadius,
      };

      const roundedImage = (await roundImages([resizedImage], roundingOptions))[0]!;
      imageBuffer = await roundedImage.toBuffer();
    } else {
      imageBuffer = await resizedImage.toBuffer();
    }

    blocks.push({ imageBuffer, col: slot.col, row: slot.row });
  }

  context.state.blocks = blocks;
};
