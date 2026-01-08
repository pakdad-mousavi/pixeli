import { describe, expect, it, afterEach } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { createCanvas } from '../../../../core/merges/shared-steps/createCanvas.js';
import { MergeContext } from '../../../../core/pipeline/mergePipeline.js';

// Get sample inputs
const sampleFileBuffer = await readFile('./src/tests/test-images/small-image.jpg');
const inputs = [sampleFileBuffer, sampleFileBuffer, sampleFileBuffer, sampleFileBuffer];

// Define context and context.state
interface State {
  canvasWidth: number;
  canvasHeight: number;
}

let context: MergeContext<State> = {
  inputs,
  progressInfo: {
    completed: 0,
    total: 4,
    phase: '...',
  },
  captions: [],
  composites: [],
  images: inputs.map((b) => sharp(b)),
  state: {} as State,
};

afterEach(() => {
  context.state = {} as State;
});

describe('createCanvas', async () => {
  it('creates a canvas with the given canvas width, height, and color', async () => {
    // Create canvas
    context.state.canvasWidth = 256;
    context.state.canvasHeight = 512;
    await createCanvas(context, { canvasColor: { r: 126, g: 182, b: 219, alpha: 1 } });

    // Ensure canvas is set correctly
    expect(context.canvas).toBeInstanceOf(sharp);

    // Ensure canvas dimensions are correct
    const meta = await context.canvas!.metadata();
    expect(meta.width).toBe(256);
    expect(meta.height).toBe(512);

    // Ensure first corner pixel of the image is the corrct color
    const raw = await context.canvas!.raw().toBuffer({ resolveWithObject: true });
    const rgb = { r: raw.data[0], g: raw.data[1], b: raw.data[2] };
    expect(rgb).toStrictEqual({ r: 126, g: 182, b: 219 });
  });

  it('fails when canvasWidth is not provided', async () => {
    // Create canvas with no canvasWidth
    context.state.canvasHeight = 512;
    const res = createCanvas(context, { canvasColor: { r: 126, g: 182, b: 219, alpha: 1 } });

    await expect(res).rejects.toMatchObject({
      message: 'State "canvasWidth" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('fails when canvasHeight is not provided', async () => {
    // Create canvas
    context.state.canvasWidth = 256;
    const res = createCanvas(context, { canvasColor: { r: 126, g: 182, b: 219, alpha: 1 } });

    await expect(res).rejects.toMatchObject({
      message: 'State "canvasHeight" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });
});
