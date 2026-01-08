import type sharp from 'sharp';
import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { MasonryState } from '../index.js';
import { requireNonEmptyArray } from '../../../pipeline/guards.js';

interface HorizontalOptions {
  flow: 'horizontal';
  gap: number;
  canvasWidth: number;
  hAlign: 'justified' | 'left' | 'center' | 'right';
}

interface VerticalOptions {
  flow: 'vertical';
  gap: number;
  canvasHeight: number;
  vAlign: 'justified' | 'top' | 'middle' | 'bottom';
}

type Options = HorizontalOptions | VerticalOptions;

export const splitIntoLanes: MergeStep<Options, MasonryState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  // Split into lanes
  const lanes =
    options.flow === 'horizontal'
      ? await splitIntoRows(context.images, options.canvasWidth, options.gap, options.hAlign)
      : await splitIntoColumns(context.images, options.canvasHeight, options.gap, options.vAlign);

  // Assign lanes
  context.state.lanes = lanes;
};

const splitIntoRows = async (images: sharp.Sharp[], canvasWidth: number, gap: number, hAlign: HorizontalOptions['hAlign']) => {
  const rows = [];
  let currentRow = [];
  let currentWidth = gap; // initial leading gap

  for (const im of images) {
    const meta = await im.metadata();
    const nextWidth = currentWidth + meta.width + gap;

    if (hAlign === 'justified') {
      // Greedy: always push image, fix overflow later
      currentRow.push(im);
      currentWidth = nextWidth;

      if (currentWidth + gap >= canvasWidth) {
        rows.push(currentRow.slice());
        currentRow.length = 0;
        currentWidth = gap;
      }
    } else {
      // Non-greedy: break BEFORE adding image that doesn't fit
      if (nextWidth > canvasWidth && currentRow.length > 0) {
        rows.push(currentRow.slice());
        currentRow = [];
        currentWidth = gap;
      }

      // Add the image (may be first in a new row)
      currentRow.push(im);
      currentWidth += meta.width + gap;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

const splitIntoColumns = async (images: sharp.Sharp[], canvasHeight: number, gap: number, vAlign: VerticalOptions['vAlign']) => {
  const cols = [];
  const currentCol = [];
  let currentHeight = gap;

  for (const im of images) {
    const meta = await im.metadata();
    let nextHeight = currentHeight + meta.height + gap;

    if (vAlign === 'justified') {
      // Greedy: always push image, fix overflow later
      currentCol.push(im);
      currentHeight = nextHeight;

      if (currentHeight + gap >= canvasHeight) {
        cols.push(currentCol.slice());
        currentCol.length = 0;
        currentHeight = gap;
      }
    } else {
      // Non-greedy: break BEFORE adding image that doesn't fit
      if (nextHeight > canvasHeight && currentCol.length > 0) {
        cols.push(currentCol.slice());
        currentCol.length = 0;
        currentHeight = gap;
      }

      // Add the image (may be first in a new column)
      currentCol.push(im);
      currentHeight += meta.height + gap;
    }
  }

  if (currentCol.length > 0) {
    cols.push(currentCol);
  }

  return cols;
};
