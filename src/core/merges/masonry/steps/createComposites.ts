import sharp from 'sharp';
import type { MasonryState } from '../index.js';
import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import { requireState } from '../../../pipeline/guards.js';

import type { RGBA } from '../../../utils/colors/types.js';
import { handleImageEdges } from '../../../utils/images/handleImageEdges.js';

// |----------------------|
// |----------------------|
// | ROW OFFSET FUNCTION |
// |----------------------|
// |----------------------|
const computeOffset = async (
  flow: 'horizontal' | 'vertical',
  lane: sharp.Sharp[],
  canvasSize: number,
  gap: number,
  alignment: 'justified' | ('left' | 'top') | ('middle' | 'center') | ('right' | 'bottom')
) => {
  // Calculate total row width
  let totalLaneLength = gap * (lane.length + 1);
  for (const im of lane) {
    const meta = await im.metadata();
    totalLaneLength += flow === 'horizontal' ? meta.width : meta.height;
  }

  // Get x offset
  switch (alignment) {
    case 'justified':
    case 'left':
    case 'top':
      return gap;
    case 'right':
    case 'bottom':
      return canvasSize - totalLaneLength + gap;
    case 'middle':
    case 'center':
      const canvasGap = gap * 2;
      return Math.floor((canvasSize + canvasGap - totalLaneLength) / 2);
  }
};

// |-----------------------------------------------------|
// |-----------------------------------------------------|
// | AXIS STRATEGY: used to define flow-specific methods |
// |-----------------------------------------------------|
// |-----------------------------------------------------|
interface AxisStrategy {
  flow: 'horizontal' | 'vertical';
  getPrimary(meta: sharp.Metadata): number;
  getCross(meta: sharp.Metadata): number;
  crop(meta: sharp.Metadata, overflow: number): sharp.ResizeOptions;
}

const horizontalAxis: AxisStrategy = {
  flow: 'horizontal',

  getPrimary: (meta) => meta.width,
  getCross: (meta) => meta.height,

  crop: (meta, overflow) => ({
    width: meta.width - overflow,
    height: meta.height,
    fit: 'cover',
  }),
};

const verticalAxis: AxisStrategy = {
  flow: 'vertical',

  getPrimary: (meta) => meta.height,
  getCross: (meta) => meta.width,

  crop: (meta, overflow) => ({
    width: meta.width,
    height: meta.height - overflow,
    fit: 'cover',
  }),
};

// |--------------------------|
// |--------------------------|
// | COMPOSITE OPTIONS NEEDED |
// |--------------------------|
// |--------------------------|
interface BaseOptions {
  flow: 'horizontal' | 'vertical';
  gap: number;
  cornerRadius: number;
  borderWidth: number;
  borderColor: RGBA;
}

interface HorizontalOptions extends BaseOptions {
  flow: 'horizontal';
  gap: number;
  canvasWidth: number;
  hAlign: 'justified' | 'left' | 'center' | 'right';
}

interface VerticalOptions extends BaseOptions {
  flow: 'vertical';
  gap: number;
  canvasHeight: number;
  vAlign: 'justified' | 'top' | 'middle' | 'bottom';
}

type Options = HorizontalOptions | VerticalOptions;

export const createComposites: MergeStep<Options, MasonryState> = async (context, options, onProgress) => {
  // Require needed states
  requireState(context, 'lanes');
  options.flow === 'horizontal' ? requireState(context, 'rowHeight') : requireState(context, 'columnWidth');

  // Initialize flow-dependent values
  const laneCrossSize = options.flow === 'horizontal' ? context.state.rowHeight : context.state.columnWidth;
  const axis = options.flow === 'horizontal' ? horizontalAxis : verticalAxis;
  const alignment = options.flow === 'horizontal' ? options.hAlign : options.vAlign;
  const primaryCanvasSize = options.flow === 'horizontal' ? options.canvasWidth : options.canvasHeight;

  // Define initial variables
  const composites: sharp.OverlayOptions[] = [];

  let primaryCursor = options.gap;
  let crossCursor = options.gap;

  for (const lane of context.state.lanes) {
    // Get the lanes vertical/horizontal offset
    let primary = await computeOffset(options.flow, lane, primaryCanvasSize, options.gap, alignment);
    let cross = crossCursor;

    for (const im of lane) {
      let finalizedImage = im;
      let meta = await im.metadata();

      // Update x/y position
      primaryCursor += axis.getPrimary(meta) + options.gap;

      // Handle image overflows for justified layouts
      if (primaryCursor >= primaryCanvasSize) {
        const overflow = primaryCursor - primaryCanvasSize;
        const buffer = await im.resize(axis.crop(meta, overflow)).toBuffer();

        finalizedImage = sharp(buffer);
        meta = await finalizedImage.metadata();
      }

      // Handle borders and corner rounding
      const borderedImage = await handleImageEdges(finalizedImage, {
        imageWidth: meta.width,
        imageHeight: meta.height,
        borderWidth: options.borderWidth,
        borderHeight: options.borderWidth,
        borderColor: options.borderColor,
        cornerRadius: options.cornerRadius,
      });

      // Create the composite
      composites.push({
        input: await borderedImage.toBuffer(),
        left: options.flow === 'horizontal' ? primary : cross,
        top: options.flow === 'horizontal' ? cross : primary,
      });

      primary += axis.getPrimary(meta) + options.gap;

      // Update progress
      if (onProgress) {
        context.progressInfo.phase = 'Merging images';
        context.progressInfo.completed += 1;
        onProgress({ ...context.progressInfo });
      }
    }

    primaryCursor = options.gap;
    crossCursor += laneCrossSize + options.gap;
  }

  // Update context.composites
  context.composites = composites;
};
