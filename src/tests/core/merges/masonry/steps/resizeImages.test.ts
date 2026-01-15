import { afterEach, describe, expect, it, vi } from 'vitest';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { MasonryState } from '../../../../../core/merges/masonry/index.js';

import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

import { resizeImages } from '../../../../../core/merges/masonry/steps/resizeImages.js';
import { MergeError } from '../../../../../core/mergeError.js';

import * as scaleImagesUtil from '../../../../../core/utils/images/scaleImages.js';

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
const scaleImagesSpy = vi.spyOn(scaleImagesUtil, 'scaleImages');

describe('calculateLaneSize', () => {
  it('throws an error when context.images are empty', async () => {
    context.images = [];
    const res = resizeImages(context, { flow: 'horizontal' });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws when rowHeight missing for horizontal flow', async () => {
    const res = resizeImages(context, { flow: 'horizontal' });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "rowHeight" was not initialized',
      context: { type: 'internal' },
    });
  });

  it('throws when columnWidth missing for vertical flow', async () => {
    const res = resizeImages(context, { flow: 'vertical' });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "columnWidth" was not initialized',
      context: { type: 'internal' },
    });
  });

  it.skip('calls the scaleImages with the correct configuration for horizontal flow', async () => {
    context.state.rowHeight = 400;
    const originalImages = [...context.images];

    await resizeImages(context, { flow: 'horizontal' });

    expect(scaleImagesSpy).toHaveBeenCalledExactlyOnceWith(originalImages, {
      height: 400,
      finalizePipeline: true,
    });
  });

  it.skip('calls the scaleImages with the correct configuration for vertical flow', async () => {
    context.state.columnWidth = 200;
    const originalImages = [...context.images];

    await resizeImages(context, { flow: 'vertical' });

    expect(scaleImagesSpy).toHaveBeenCalledExactlyOnceWith(originalImages, {
      width: 200,
      finalizePipeline: true,
    });
  });
});
