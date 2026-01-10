import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { shuffleImagesAndCaptions } from '../../../../../core/merges/grid/steps/shuffleImagesAndCaptions.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

import * as helpers from '../../../../../core/helpers.js';

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
const shuffleArraySpy = vi.spyOn(helpers, 'shuffleArray');
const shuffleTogetherSpy = vi.spyOn(helpers, 'shuffleTogether');

describe('shuffleImagesAndCaptions', async () => {
  it('throws a merge error without the "areCaptionsProvided" state', async () => {
    const res = shuffleImagesAndCaptions(context, { shuffle: true });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "areCaptionsProvided" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a merge error with an empty "images" context prop', async () => {
    context.state.areCaptionsProvided = true;
    context.images = [];
    const res = shuffleImagesAndCaptions(context, { shuffle: true });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('shuffles both images and captions correctly', async () => {
    // Set up context variables
    context.state.areCaptionsProvided = true;
    context.captions = ['001', '002', '003', '004'];

    // Store originals for comparing later
    const originalImages = [...context.images];
    const originalCaptions = [...context.captions];

    await shuffleImagesAndCaptions(context, { shuffle: true });
    expect(shuffleTogetherSpy).toHaveBeenCalledExactlyOnceWith(originalImages, originalCaptions);
  });

  it('shuffles only images when "areCaptionsProvided" is false', async () => {
    // Set up context variables
    context.state.areCaptionsProvided = false;

    await shuffleImagesAndCaptions(context, { shuffle: true });
    expect(shuffleArraySpy).toBeCalled();
    expect(shuffleTogetherSpy).not.toBeCalled();
  });

  it('does nothing when "shuffle" is false', async () => {
    // Set up context variables
    context.state.areCaptionsProvided = true;

    const originalImages = [...context.images];

    await shuffleImagesAndCaptions(context, { shuffle: false });
    expect(context.images).toEqual(originalImages);
  });
});
