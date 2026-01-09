import { describe, expect, it, afterEach } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { calculateCanvasDimensions } from '../../../../../core/merges/grid/steps/calculateCanvasDimensions.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

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
});

describe('calculateCanvasDimensions', async () => {
  it('throws a MergeError when imageWidth is not in context.state', async () => {
    // Set up context
    context.state.imageHeight = 400;
    context.state.areCaptionsProvided = true;

    const res = calculateCanvasDimensions(context, { columns: 4, gap: 50 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "imageWidth" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when imageHeight is not in context.state', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.areCaptionsProvided = true;

    const res = calculateCanvasDimensions(context, { columns: 4, gap: 50 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "imageHeight" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when areCaptionsProvided is not in context.state', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;

    const res = calculateCanvasDimensions(context, { columns: 4, gap: 50 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "areCaptionsProvided" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when context.images is empty', async () => {
    // Set up context
    context.images = [];
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.areCaptionsProvided = true;

    const res = calculateCanvasDimensions(context, { columns: 4, gap: 50 });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('correctly calculates the number of rows', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.areCaptionsProvided = true;

    await calculateCanvasDimensions(context, { columns: 3, gap: 50 });
    expect(context.state.rows).toBe(2);
  });

  it('correctly calculates the canvas width and height without captions', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.areCaptionsProvided = false;

    await calculateCanvasDimensions(context, { columns: 2, gap: 50 });
    expect(context.state.canvasWidth).toBe(950);
    expect(context.state.canvasHeight).toBe(950);
  });

  it('correctly calculates the canvas width and height with captions', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.areCaptionsProvided = true;

    await calculateCanvasDimensions(context, { columns: 2, gap: 50 });
    expect(context.state.canvasWidth).toBe(950);
    expect(context.state.canvasHeight).toBe(1026);
  });
});
