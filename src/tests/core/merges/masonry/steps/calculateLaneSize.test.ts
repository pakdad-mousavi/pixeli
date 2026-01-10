import { afterEach, describe, expect, it, vi } from 'vitest';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { MasonryState } from '../../../../../core/merges/masonry/index.js';

import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

import { calculateLaneSize } from '../../../../../core/merges/masonry/steps/calculateLaneSize.js';
import { MergeError } from '../../../../../core/mergeError.js';

import * as trimmedMedianUtil from '../../../../../core/utils/math/trimmedMedian.js';
import * as getImageHeightUtil from '../../../../../core/utils/images/getImageHeights.js';
import * as getImageWidthUtil from '../../../../../core/utils/images/getImageWidths.js';

const sampleFileBuffer = await readFile('./src/tests/test-images/small-image.jpg');
const inputs = [sampleFileBuffer, sampleFileBuffer, sampleFileBuffer, sampleFileBuffer];

// Define context and context.state
let context: MergeContext<MasonryState> = {
  inputs,
  progressInfo: {
    completed: 0,
    total: 4,
    phase: '...',
  },
  captions: [],
  composites: [],
  images: inputs.map((b) => sharp(b)),
  state: {} as MasonryState,
};

// Reset properties which will be tested
afterEach(() => {
  context.images = inputs.map((b) => sharp(b));
  context.state = {} as MasonryState;

  vi.clearAllMocks();
});

// Set up spies
const trimmedMedianSpy = vi.spyOn(trimmedMedianUtil, 'trimmedMedian');
const getImageHeightsSpy = vi.spyOn(getImageHeightUtil, 'getImageHeights');
const getImageWidthsSpy = vi.spyOn(getImageWidthUtil, 'getImageWidths');

describe('calculateLaneSize', () => {
  it('throws an error when context.images are empty', async () => {
    context.images = [];
    const res = calculateLaneSize(context, { flow: 'horizontal' });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws an error when trimmedMedian fails in horizontal flows', async () => {
    trimmedMedianSpy.mockImplementationOnce(() => {
      return null;
    });

    const res = calculateLaneSize(context, { flow: 'horizontal' });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'An internal error has occurred.',
      context: {
        type: 'internal',
        cause: 'trimmedMedian failed',
      },
    });
  });

  it('throws an error when trimmedMedian fails in vertical flows', async () => {
    trimmedMedianSpy.mockImplementationOnce(() => {
      return null;
    });

    const res = calculateLaneSize(context, { flow: 'vertical' });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'An internal error has occurred.',
      context: {
        type: 'internal',
        cause: 'trimmedMedian failed',
      },
    });
  });

  it('correctly uses getImageHeights in horizontal flows', async () => {
    await calculateLaneSize(context, { flow: 'horizontal' });
    expect(getImageHeightsSpy).toHaveBeenCalledExactlyOnceWith(context.images);
  });

  it('correctly uses getImageWidths in vertical flows', async () => {
    await calculateLaneSize(context, { flow: 'vertical' });
    expect(getImageWidthsSpy).toHaveBeenCalledExactlyOnceWith(context.images);
  });

  it('correctly assigns rowHeight in horizontal flows', async () => {
    await calculateLaneSize(context, { flow: 'horizontal', rowHeight: 400 });
    expect(context.state.rowHeight).toBe(400);
  });

  it('correctly assigns columnWidth in vertical flows', async () => {
    await calculateLaneSize(context, { flow: 'vertical', columnWidth: 200 });
    expect(context.state.columnWidth).toBe(200);
  });
});
