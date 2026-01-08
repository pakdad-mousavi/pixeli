import { describe, expect, it, afterEach } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { loadImages } from '../../../../core/merges/shared-steps/loadImages.js';
import { MergeError } from '../../../../core/mergeError.js';

const sampleFileBuffer = await readFile('./src/tests/test-images/small-image.jpg');

let context = {
  inputs: [sampleFileBuffer, sampleFileBuffer, sampleFileBuffer, sampleFileBuffer],
  progressInfo: {
    completed: 0,
    total: 4,
    phase: '...',
  },
  captions: [],
  composites: [],
  images: [],
  state: {} as Record<string, any>,
};

afterEach(() => {
  context.state = {};
  context.images = [];
});

describe('loadImages', async () => {
  it('creates sharp images from valid buffers', async () => {
    await loadImages(context, {});

    expect(context.images).toHaveLength(4);
    for (const image of context.images) {
      expect(image).toBeInstanceOf(sharp);
    }
  });

  it('creates sharp images from valid buffers with any context.state', async () => {
    context.state.someValue = 100;
    context.state.foobar = ['a', 'b', 'c'];

    await loadImages(context, {});

    expect(context.images).toHaveLength(4);
    for (const image of context.images) {
      expect(image).toBeInstanceOf(sharp);
    }
  });

  it('creates sharp images from valid buffers with any options', async () => {
    await loadImages(context, { foo: 'abc', bar: 456 });

    expect(context.images).toHaveLength(4);
    for (const image of context.images) {
      expect(image).toBeInstanceOf(sharp);
    }
  });

  it('creates sharp images from valid buffers with any context.state', async () => {
    context.state.someValue = 100;
    context.state.foobar = ['a', 'b', 'c'];

    await loadImages(context, {});

    expect(context.images).toHaveLength(4);
    for (const image of context.images) {
      expect(image).toBeInstanceOf(sharp);
    }
  });

  it('to throw mergeError when given an invalid image buffer', async () => {
    context.inputs[2] = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

    const res = loadImages(context, {});

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      name: 'MergeError',
      message: 'Invalid image input at index 2',
      context: {
        cause: 'Input buffer contains unsupported image format',
        type: 'validation',
      },
    });
  });

  it('to throw mergeError when given an empty input array', async () => {
    context.inputs = [];

    const res = loadImages(context, {});

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      name: 'MergeError',
      message: '"inputs" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });
});
