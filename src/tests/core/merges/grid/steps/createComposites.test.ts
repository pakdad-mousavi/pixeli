import { describe, expect, it, afterEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';

import { MergeError } from '../../../../../core/mergeError.js';
import { createComposites } from '../../../../../core/merges/grid/steps/createComposites.js';
import { MergeContext } from '../../../../../core/pipeline/mergePipeline.js';
import { GridState } from '../../../../../core/merges/grid/index.js';

import * as svgTextBufferUtils from '../../../../../core/utils/svg/createSvgTextBuffer.js';

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

// Set up spies
const createSvgTextBufferSpy = vi.spyOn(svgTextBufferUtils, 'createSvgTextBuffer');

describe('createComposites', async () => {
  it('throws a MergeError when imageWidth is not in context.state', async () => {
    // Set up context
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.state.rows = 1;

    const res = createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

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
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.state.rows = 1;

    const res = createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

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
    context.state.captionHeight = 38;
    context.state.rows = 1;

    const res = createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "areCaptionsProvided" was not initialized',
      context: {
        type: 'internal',
      },
    });
  });

  it('throws a MergeError when fontSize is not in context.state and areCaptionsProvided is true', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.rows = 1;
    context.state.areCaptionsProvided = true;

    const res = createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: 'State "fontSize" was not initialized',
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
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.state.rows = 1;

    const res = createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      message: '"images" must not be empty',
      context: {
        type: 'internal',
      },
    });
  });

  it('creates an svg text buffer with areCaptionsProvided as true', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.captions = ['001', '002', '003', '004'];
    context.state.rows = 1;
    context.state.fontSize = 100;

    await createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    expect(createSvgTextBufferSpy).toBeCalledTimes(4);
    expect(createSvgTextBufferSpy).toHaveBeenLastCalledWith({
      text: '004',
      maxWidth: 400,
      maxHeight: 38,
      fontSize: 100,
      fill: '#ffffffff',
    });
  });

  it('calls onProgress with correct information when provided', async () => {
    // Set up context
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.captions = ['001', '002', '003', '004'];
    context.state.rows = 1;
    context.state.fontSize = 100;

    const onProgressSpy = vi.fn();
    await createComposites(context, { columns: 4, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } }, onProgressSpy);

    expect(onProgressSpy).toBeCalledTimes(4);
    expect(onProgressSpy).toHaveBeenLastCalledWith({
      total: 4,
      completed: 4,
      phase: 'Merging images',
    });
  });

  it('creates composites properly without captions', async () => {
    // Set up context
    context.inputs = [sampleFileBuffer, sampleFileBuffer];
    context.images = [sharp(sampleFileBuffer), sharp(sampleFileBuffer)];
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = false;
    context.state.rows = 1;

    await createComposites(context, { columns: 2, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    expect(context.composites).toHaveLength(2);
    expect(context.composites).toStrictEqual([
      {
        input: await sharp(sampleFileBuffer).toBuffer(),
        top: 50,
        left: 50,
      },
      {
        input: await sharp(sampleFileBuffer).toBuffer(),
        top: 50,
        left: 500,
      },
    ]);
  });

  it('creates composites properly with captions', async () => {
    // Set up context
    context.inputs = [sampleFileBuffer, sampleFileBuffer];
    context.images = [sharp(sampleFileBuffer), sharp(sampleFileBuffer)];
    context.state.imageWidth = 400;
    context.state.imageHeight = 400;
    context.state.captionHeight = 38;
    context.state.areCaptionsProvided = true;
    context.captions = ['001', '002'];
    context.state.rows = 2;
    context.state.fontSize = 10;

    await createComposites(context, { columns: 1, gap: 50, captionColor: { r: 255, g: 255, b: 255, alpha: 1 } });

    expect(context.composites).toHaveLength(4);
    expect(context.composites[0]).toMatchObject({
      input: await sharp(sampleFileBuffer).toBuffer(),
      top: 50,
      left: 50,
    });
    expect(context.composites[2]).toMatchObject({
      input: await sharp(sampleFileBuffer).toBuffer(),
      top: 538,
      left: 50,
    });
  });
});
