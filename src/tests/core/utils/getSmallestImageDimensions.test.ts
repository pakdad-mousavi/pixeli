import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { getSmallestImageDimensions } from '../../../core/utils/images/getSmallestImageDimensions.js';

describe('getSmallestImageDimensions', () => {
  it('returns smallest width and height from multiple images', async () => {
    const img1 = sharp({ create: { width: 20, height: 10, channels: 4, background: 'white' } });
    const img2 = sharp({ create: { width: 15, height: 12, channels: 4, background: 'black' } });
    const img3 = sharp({ create: { width: 25, height: 8, channels: 4, background: 'red' } });

    const result = await getSmallestImageDimensions([img1, img2, img3]);

    expect(result).toEqual({ smallestWidth: 15, smallestHeight: 8 });
  });

  it('returns width and height of single image', async () => {
    const img = sharp({ create: { width: 10, height: 5, channels: 4, background: 'white' } });

    const result = await getSmallestImageDimensions([img]);

    expect(result).toEqual({ smallestWidth: 10, smallestHeight: 5 });
  });

  it('returns Infinity for empty array', async () => {
    const result = await getSmallestImageDimensions([]);
    expect(result).toEqual({ smallestWidth: Infinity, smallestHeight: Infinity });
  });

  it('handles images with equal dimensions', async () => {
    const img1 = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });
    const img2 = sharp({ create: { width: 10, height: 10, channels: 4, background: 'black' } });

    const result = await getSmallestImageDimensions([img1, img2]);

    expect(result).toEqual({ smallestWidth: 10, smallestHeight: 10 });
  });
});
