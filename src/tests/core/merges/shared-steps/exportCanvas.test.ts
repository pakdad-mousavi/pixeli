import { describe, expect, it, afterEach } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { exportCanvas } from '../../../../core/merges/shared-steps/exportCanvas.js';
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

describe('exportCanvas', async () => {
  it('throws an error when canvas is not given', async () => {
    const res = exportCanvas(context, { format: 'jpg' });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'Context "canvas" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws an error when toBuffer() fails', async () => {
    context.canvas = sharp(sampleFileBuffer);
    const res = exportCanvas(context, { format: 'some random format' as 'jpg' });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      context: {
        type: 'internal',
        cause: {
          message:
            'Expected one of: heic, heif, avif, jpeg, jpg, jpe, tile, dz, png, raw, tiff, tif, webp, gif, jp2, jpx, j2k, j2c, jxl for format but received some random format of type string',
        },
      },
    });
  });

  it('throws an error when toBuffer() fails', async () => {
    context.canvas = sharp(sampleFileBuffer).resize(16_400, 16_400);
    const res = exportCanvas(context, { format: 'webp' });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'Error: image to large for "webp" format, try a format that allows larger images',
      context: {
        type: 'image',
      },
    });
  });
});
