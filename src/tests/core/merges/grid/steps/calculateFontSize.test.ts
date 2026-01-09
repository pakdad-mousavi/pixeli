import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { calculateFontSize } from '../../../../../core/merges/grid/steps/calculateFontSize.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

import * as fontSizeUtil from '../../../../../core/utils/fonts/getFontSize.js';

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
const getFontSizeSpy = vi.spyOn(fontSizeUtil, 'getFontSize');

describe('calculateFontSize', async () => {
  it('throws a MergeError when imageWidth is not in context.state', async () => {
    context.state.captionHeight = 38;
    const res = calculateFontSize(context, { maxCaptionSize: 100 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "imageWidth" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when captionHeight is not in context.state', async () => {
    context.state.imageWidth = 950;
    const res = calculateFontSize(context, { maxCaptionSize: 100 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "captionHeight" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when context.captions is empty', async () => {
    context.state.imageWidth = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    const res = calculateFontSize(context, { maxCaptionSize: 100 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"captions" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('uses getFontSize with the longest caption to calculate the correct font size', async () => {
    context.captions = ['tiny', 'very very long caption', 'small', 'medium'];
    context.state.imageWidth = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    await calculateFontSize(context, { maxCaptionSize: 120 });

    expect(getFontSizeSpy).toHaveBeenCalledExactlyOnceWith({
      text: 'very very long caption',
      maxWidth: 400,
      maxHeight: 38,
      initialFontSize: 120,
    });
  });
});
