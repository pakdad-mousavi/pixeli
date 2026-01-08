import { describe, expect, it, afterEach } from 'vitest';
import { readFile } from 'node:fs/promises';

import sharp from 'sharp';
import { validateCaptions } from '../../../../core/merges/shared-steps/validateCaptions.js';
import { GridState } from '../../../../core/merges/grid/index.js';
import { MergeError } from '../../../../core/mergeError.js';

const sampleFileBuffer = await readFile('./src/tests/test-images/small-image.jpg');
const inputs = [sampleFileBuffer, sampleFileBuffer, sampleFileBuffer, sampleFileBuffer];

let context = {
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

afterEach(() => {
  context.captions = [];
  context.state = {} as GridState;
});

describe('validateCaptions', async () => {
  it('sets state properties correctly when captions are provided', async () => {
    const options = {
      caption: true,
      captions: ['001', '002', '003', '004'],
    };

    await validateCaptions(context, options);

    expect(context.state.areCaptionsProvided).toBe(true);
    expect(context.captions).toStrictEqual(['001', '002', '003', '004']);
  });

  it('sets state properties correctly when captions are not provided', async () => {
    const options = {
      caption: false,
    };

    await validateCaptions(context, options);

    expect(context.state.areCaptionsProvided).toBe(false);
    expect(context.captions).toStrictEqual([]);
  });
  it('throws merge error when captions.length !== images.length', async () => {
    const options = {
      caption: true,
      captions: ['001', '002', '003', '004', '005'],
    };

    const res = validateCaptions(context, options);

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toMatchObject({
      name: 'MergeError',
      message: 'The same number of captions and images must be provided',
      context: {
        type: 'validation',
      },
    });
  });
});
