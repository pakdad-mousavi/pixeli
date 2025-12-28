import { describe, it, expect } from 'vitest';
import { isActualImage } from '../../../core/utils/images/isActualImage.js';
import { readFile } from 'node:fs/promises';

describe('isActualImage', async () => {
  const validImageInput = await readFile('./samples/images/001.jpg');

  it('returns "isImage = true" for a valid image with width and height', async () => {
    const { isImage, reason } = await isActualImage(validImageInput);

    expect(isImage).toBe(true);
    expect(reason).toBe('');
  });

  it('returns "isImage = false" when an invalid buffer is used', async () => {
    const imageBuffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

    const { isImage, reason } = await isActualImage(imageBuffer);

    expect(isImage).toBe(false);
    expect(reason).toBe('Input buffer contains unsupported image format');
  });

  it('returns "isImage = false" when an svg with no width or height is used', async () => {
    const svgString = '<svg></svg>';
    const svgBuffer = Buffer.from(svgString, 'utf8');

    const { isImage, reason } = await isActualImage(svgBuffer);

    expect(isImage).toBe(false);
    expect(reason).toBe('Input buffer has corrupt header: svgload_buffer: bad dimensions');
  });
});
