import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { Block, Template } from '../types.js';
import type { TemplateState } from '../index.js';

import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';
import { handleImageEdges } from '../../../utils/images/handleImageEdges.js';
import type { RGBA } from '../../../utils/colors/types.js';

interface Options {
  template: Template;
  gap: number;

  borderWidth: number;
  borderColor: RGBA;
  cornerRadius: number;
}

export const getBlocks: MergeStep<Options, TemplateState> = async (context, options, _onProgress) => {
  // Require needed states
  requireState(context, 'slotWidth');
  requireState(context, 'slotHeight');
  requireNonEmptyArray(context.images, 'images');

  const blocks: Block[] = [];

  for (let i = 0; i < options.template.slots.length && i < context.images.length; i++) {
    const slot = options.template.slots[i]!;
    const image = context.images[i]!;

    // Calculate image width and height
    const width = Math.floor(slot.colSpan * context.state.slotWidth + (slot.colSpan - 1) * options.gap);
    const height = Math.floor(slot.rowSpan * context.state.slotHeight + (slot.rowSpan - 1) * options.gap);

    // Resize image
    const resizedImage = image.resize({ width, height });

    const borderedImage = await handleImageEdges(resizedImage, {
      borderWidth: options.borderWidth,
      borderHeight: options.borderWidth,
      borderColor: options.borderColor,
      cornerRadius: options.cornerRadius,
      imageWidth: width,
      imageHeight: height,
    });

    blocks.push({ imageBuffer: await borderedImage.toBuffer(), col: slot.col, row: slot.row });
  }

  context.state.blocks = blocks;
};
