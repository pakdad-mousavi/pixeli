import { describe, it, expect, vi, afterEach } from 'vitest';
import { gridMerge } from '../../../../core/merges/grid-merge/index.js';
import { MergeError } from '../../../../core/mergeError.js';
import { readFile, writeFile } from 'node:fs/promises';

import * as imageUtils from '../../../../core/utils/images/scaleImages.js';
import * as dimensionsUtils from '../../../../core/utils/images/getSmallestImageDimensions.js';
import * as roundUtils from '../../../../core/utils/images/roundImages.js';
import * as svgUtils from '../../../../core/utils/svg/createSvgTextBuffer.js';
import * as fontUtils from '../../../../core/utils/fonts/getFontSize.js';
import * as colorUtils from '../../../../core/utils/colors/rgbaToHex.js';
import * as helpers from '../../../../core/helpers.js';
import sharp from 'sharp';

// Create spies for all utils and helpers
const scaleImagesSpy = vi.spyOn(imageUtils, 'scaleImages');
const getSmallestImageDimensionsSpy = vi.spyOn(dimensionsUtils, 'getSmallestImageDimensions');
const roundImagesSpy = vi.spyOn(roundUtils, 'roundImages');
const createSvgTextBufferSpy = vi.spyOn(svgUtils, 'createSvgTextBuffer');
const getFontSizeSpy = vi.spyOn(fontUtils, 'getFontSize');
const shuffleArraySpy = vi.spyOn(helpers, 'shuffleArray');
const shuffleTogetherSpy = vi.spyOn(helpers, 'shuffleTogether');
const rgbaToHexSpy = vi.spyOn(colorUtils, 'rgbaToHex');

// Reset all spies for each
afterEach(() => {
  vi.clearAllMocks();
});

describe('gridMerge', async () => {
  const smallImage = await readFile('./src/tests/test-images/small-image.jpg');
  const largeImage = await readFile('./src/tests/test-images/large-image.jpg');
  const smallImageMetadata = await sharp(smallImage).metadata();
  const largeImageMetadata = await sharp(largeImage).metadata();

  // ----------------
  // ----------------
  // INPUT VALIDATION
  // ----------------
  // ----------------
  it('throws validation MergeError for invalid options', async () => {
    const res = gridMerge([smallImage], { columns: 'invalid' } as any);
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toHaveProperty('context.type', 'validation');
  });

  it('throws validation MergeError for empty image input', async () => {
    const res = gridMerge([], { columns: 1 });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toHaveProperty('context.type', 'validation');
    await expect(res).rejects.toHaveProperty('message', 'No images provided to merge');
  });

  it('throws validation MergeError for corrupted image input', async () => {
    const res = gridMerge([smallImage, Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])], { columns: 1 });
    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toHaveProperty('context.type', 'validation');
    await expect(res).rejects.toHaveProperty('context.cause', 'Input buffer contains unsupported image format');
    await expect(res).rejects.toHaveProperty('message', 'Invalid image input at index 1');
  });

  it('returns buffer for valid inputs', async () => {
    const buffer = await gridMerge([smallImage, smallImage], { columns: 2, format: 'png' });
    expect(buffer).toBeInstanceOf(Buffer);
  });

  // -----------------
  // -----------------
  // PROGRESS CALLBACK
  // -----------------
  // -----------------
  it('to call its callback images + 1 times', async () => {
    const onProgress = vi.fn((progessInfo) => progessInfo);
    await gridMerge([smallImage, smallImage], { columns: 2, format: 'png' }, onProgress);

    expect(onProgress).toBeCalledTimes(3);
  });

  it('to call its callback with correct properties', async () => {
    const onProgress = vi.fn((progessInfo) => progessInfo);
    await gridMerge([smallImage, smallImage], { columns: 2, format: 'png' }, onProgress);

    expect(onProgress).toHaveNthReturnedWith(1, {
      completed: 0,
      phase: 'Initializing',
      total: 2,
    });

    expect(onProgress).toHaveNthReturnedWith(2, {
      completed: 1,
      phase: 'Merging',
      total: 2,
    });

    expect(onProgress).toHaveNthReturnedWith(3, {
      completed: 2,
      phase: 'Merging',
      total: 2,
    });
  });

  // -------------
  // -------------
  // SHUFFLE LOGIC
  // -------------
  // -------------
  it('to not shuffle both images and captions with "shuffle=false"', async () => {
    await gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      shuffle: false,
    });

    expect(shuffleTogetherSpy).not.toBeCalled();
    expect(shuffleArraySpy).not.toBeCalled();
  });

  it('to shuffle both images and captions with "shuffle=true"', async () => {
    await gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      caption: true,
      captions: ['Image 1', 'Image 2', 'Image 3'],
      shuffle: true,
    });

    expect(shuffleTogetherSpy).toBeCalled();
    expect(shuffleArraySpy).not.toBeCalled();
  });

  it('to shuffle both only images with "shuffle=true"', async () => {
    await gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      shuffle: true,
    });

    expect(shuffleTogetherSpy).not.toBeCalled();
    expect(shuffleArraySpy).toBeCalled();
  });

  // -------------
  // -------------
  // CAPTION LOGIC
  // -------------
  // -------------
  it('to throw a validation merge error when caption=true with no captions', async () => {
    const res = gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      caption: true,
    });

    await expect(res).rejects.toBeInstanceOf(MergeError);
    await expect(res).rejects.toHaveProperty('context.type', 'validation');
    await expect(res).rejects.toThrow('Invalid value at captions: Caption texts must be provided.');
  });

  it('to handle captions.length > images.length', async () => {
    const res = await gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      caption: true,
      captions: ['Image 1', 'Image 2', 'Image 3', 'Image 4'],
    });

    expect(res).toBeInstanceOf(Buffer);
  });

  it('to handle images.length > captions.length', async () => {
    const res = gridMerge([smallImage, smallImage, smallImage], {
      columns: 3,
      format: 'png',
      caption: true,
      captions: ['Image 1', 'Image 2'],
    });

    await expect(res).rejects.toThrow('Not enough captions provided');
  });

  // --------------------
  // --------------------
  // DIMENSION RESOLUTION
  // --------------------
  // --------------------
  it('to properly resize images when imageWidth is provided', async () => {
    const res = await gridMerge([smallImage, smallImage, smallImage, smallImage], {
      columns: 2,
      format: 'png',
      imageWidth: 400,
      gap: 0,
    });

    const meta = await sharp(res).metadata();

    expect(res).toBeInstanceOf(Buffer);
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(800);
  });

  it('to use getSmallestImageDimensions when imageWidth is not provided', async () => {
    await gridMerge([smallImage, smallImage, largeImage, smallImage], {
      columns: 2,
      format: 'png',
      gap: 0,
    });

    expect(getSmallestImageDimensionsSpy).toBeCalled();
    expect(getSmallestImageDimensionsSpy).toHaveResolvedWith({
      smallestWidth: smallImageMetadata.width,
      smallestHeight: smallImageMetadata.height,
    });
  });

  it('to calculate final image dimensions correctly', async () => {
    const res = await gridMerge([smallImage, smallImage, largeImage, smallImage], {
      columns: 2,
      format: 'png',
      gap: 0,
    });

    const meta = await sharp(res).metadata();

    expect(meta.width).toBe(smallImageMetadata.width * 2); // 2 columns
    expect(meta.height).toBe(smallImageMetadata.width * 2); // 2 columns
  });

  it('to use scaleImages to resize images', async () => {
    await gridMerge([smallImage, smallImage, largeImage, smallImage], {
      columns: 2,
      format: 'png',
      gap: 0,
    });

    expect(scaleImagesSpy).toHaveBeenLastCalledWith(expect.anything(), {
      width: smallImageMetadata.width,
      height: smallImageMetadata.width,
    });
  });

  it('to not round images when corner radius is not given', async () => {
    await gridMerge([smallImage, smallImage, largeImage, smallImage], {
      columns: 2,
      format: 'png',
      gap: 0,
    });

    expect(roundImagesSpy).toHaveBeenLastCalledWith(expect.anything(), {
      width: smallImageMetadata.width,
      height: smallImageMetadata.width,
      cornerRadius: 0,
    });
  });

  it('to round images when corner radius is given', async () => {
    await gridMerge([smallImage, smallImage, largeImage, smallImage], {
      columns: 2,
      format: 'png',
      gap: 0,
      cornerRadius: 100,
    });

    expect(roundImagesSpy).toHaveBeenLastCalledWith(expect.anything(), {
      width: smallImageMetadata.width,
      height: smallImageMetadata.width,
      cornerRadius: 100,
    });
  });

  // -------------
  // -------------
  //     FONTS
  // -------------
  // -------------
  it('to calculate font size properly when "caption=true"', async () => {
    await gridMerge([smallImage, smallImage], {
      columns: 2,
      format: 'png',
      caption: true,
      captions: ['short caption', 'looooooooooong caption'],
      gap: 0,
    });

    expect(getFontSizeSpy).toHaveBeenLastCalledWith({
      text: 'looooooooooong caption',
      maxWidth: smallImageMetadata.width,
      maxHeight: expect.anything(),
      initialFontSize: 100,
    });
  });

  it('to skip font size calculation when "caption=false"', async () => {
    await gridMerge([smallImage, smallImage], {
      columns: 2,
      format: 'png',
      caption: false,
      gap: 0,
    });

    expect(getFontSizeSpy).not.toBeCalled();
  });

  // ----------------------
  // ----------------------
  // FINAL IMAGE GENERATION
  // ----------------------
  // ----------------------
  it("it's output image to be the expected width and height", async () => {
    const gap = 50;
    const totalGap = gap * 3;
    const res = await gridMerge([smallImage, smallImage, smallImage, smallImage], {
      columns: 2,
      format: 'png',
      caption: false,
      gap,
    });

    const meta = await sharp(res).metadata();

    expect(meta.width).toBe(smallImageMetadata.width * 2 + totalGap);
    expect(meta.height).toBe(smallImageMetadata.width * 2 + totalGap);
  });

  it('to acknowledge the pixel limit for image formats', async () => {
    const res = gridMerge([largeImage, largeImage, largeImage, largeImage, largeImage, largeImage, largeImage, largeImage], {
      columns: 1,
      format: 'jpg',
      imageWidth: 8200,
      gap: 0,
    });

    await expect(res).rejects.toThrow("Error: image to large for 'jpg' format, try a format that allows larger images");
    await expect(res).rejects.toHaveProperty('context.type', 'image');
  }, 60_000);
});
