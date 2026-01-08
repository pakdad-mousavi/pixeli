import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { applyComposites } from '../../../../core/merges/shared-steps/applyComposites.js';
import { MergeError } from '../../../../core/mergeError.js';
import { MergeContext } from '../../../../core/pipeline/mergePipeline.js';

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
  context.composites = [];
  context.canvas = undefined;
  context.state = {} as State;
});

describe('applyComposites', async () => {
  it('replaces canvas with applied composites when successful', async () => {
    context.canvas = sharp();

    // Create a mock composite function
    const spy = vi.fn(() => sharp());
    context.canvas.composite = spy;

    // Create composites
    context.composites = [
      {
        input: sampleFileBuffer,
        top: 632,
        left: 123,
      },
      {
        input: sampleFileBuffer,
        top: 34,
        left: 74,
      },
    ];

    await applyComposites(context, {});
    expect(spy).toHaveBeenCalledWith(context.composites);
  });

  it('throws a MergeError when canvas is undefined', async () => {
    const res = applyComposites(context, {});

    await expect(res).rejects.toMatchObject({
      message: 'Context "canvas" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when composite fails', async () => {
    context.canvas = sharp(sampleFileBuffer);
    context.composites = [
      {
        input: sampleFileBuffer,
        top: '100000' as unknown as number,
        left: 100000,
      },
    ];

    const res = applyComposites(context, {});

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'An internal error has occurred.',
      context: {
        type: 'internal',
      },
    });
  });
});
