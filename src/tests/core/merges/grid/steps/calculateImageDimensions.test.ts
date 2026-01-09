import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { calculateImageDimensions } from '../../../../../core/merges/grid/steps/calculateImageDimensions.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

import * as trimmedMedianHelper from '../../../../../core/utils/math/trimmedMedian.js';

const sampleFileBuffer = await readFile('./src/tests/test-images/small-image.jpg');
const inputs = [sampleFileBuffer, sampleFileBuffer, sampleFileBuffer, sampleFileBuffer];

// Define context and context.state
let context: MergeContext<GridState> = {
  inputs,
  progressInfo: {
    completed: 0,
    total: 4,
    phase: '...',
  },
  captions: [],
  composites: [],
  images: inputs.map((b) => sharp(b)),
  state: {} as GridState,
};

// Reset properties which will be tested
afterEach(() => {
  context.images = inputs.map((b) => sharp(b));
  context.state = {} as GridState;

  vi.clearAllMocks();
});

// Set up spys
const trimmedMedianSpy = vi.spyOn(trimmedMedianHelper, 'trimmedMedian');

describe('calculateImageDimensions', async () => {
  it('throws a MergeError when context.images is empty', async () => {
    context.images = [];
    const res = calculateImageDimensions(context, { aspectRatio: 1 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError if trimmedMedian fails', async () => {
    // Set up spy implementation
    trimmedMedianSpy.mockImplementationOnce(() => {
      return null;
    });

    const res = calculateImageDimensions(context, { aspectRatio: 1 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'An internal error has occurred.',
      context: {
        type: 'internal',
        cause: 'trimmedMedian failed',
      },
    });
  });

  it('Correctly assigns imageWidth and imageHeight to context.state', async () => {
    await calculateImageDimensions(context, { aspectRatio: 1 });

    // Check for correct width and height values
    const meta = await sharp(inputs[0]).metadata();
    expect(context.state.imageWidth).toBe(meta.width);
    expect(context.state.imageHeight).toBe(meta.width);
  });

  it('Correctly assigns imageWidth and imageHeight to context.state with an imageWidth given', async () => {
    await calculateImageDimensions(context, { aspectRatio: 1, imageWidth: 500 });

    // Check for correct width and height values
    expect(context.state.imageWidth).toBe(500);
    expect(context.state.imageHeight).toBe(500);
  });
});
