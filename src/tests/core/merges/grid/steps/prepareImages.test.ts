import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { prepareImages } from '../../../../../core/merges/grid/steps/prepareImages.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

import * as imageUtils from '../../../../../core/utils/images/scaleImages.js';
import * as roundUtils from '../../../../../core/utils/images/roundImages.js';

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
const scaleImagesSpy = vi.spyOn(imageUtils, 'scaleImages');
const roundImagesSpy = vi.spyOn(roundUtils, 'roundImages');

describe('calculateImageDimensions', async () => {
  it('throws a MergeError when "imageWidth" is not in state', async () => {
    const res = prepareImages(context, { cornerRadius: 0 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "imageWidth" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when "imageHeight" is not in state', async () => {
    context.state.imageWidth = 400;
    const res = prepareImages(context, { cornerRadius: 0 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "imageHeight" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when "context.images" is empty', async () => {
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.images = [];
    const res = prepareImages(context, { cornerRadius: 0 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it.skip('scales images correctly', async () => {
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;

    const images = [...context.images];
    await prepareImages(context, { cornerRadius: 0 });

    expect(scaleImagesSpy).toHaveBeenCalledExactlyOnceWith(images, { width: 400, height: 400 });
  });

  it.skip('rounds images correctly', async () => {
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;

    const images = [...context.images];
    await prepareImages(context, { cornerRadius: 30 });

    expect(roundImagesSpy).toHaveBeenCalledExactlyOnceWith(images, { width: 400, height: 400, cornerRadius: 30 });
  });
});
