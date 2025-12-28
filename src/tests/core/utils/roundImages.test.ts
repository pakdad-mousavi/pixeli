import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { roundImages } from '../../../core/utils/images/roundImages.js';

describe('roundImages', () => {
  it('returns original images when cornerRadius is zero', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });
    const images = [image];

    const result = await roundImages(images, { width: 10, height: 10, cornerRadius: 0 });

    expect(result).toBe(images);
  });

  it('processes each image when cornerRadius > 0', async () => {
    const image1 = sharp({ create: { width: 20, height: 20, channels: 4, background: 'white' } });
    const image2 = sharp({ create: { width: 30, height: 30, channels: 4, background: 'black' } });

    const images = [image1, image2];
    const result = await roundImages(images, { width: 20, height: 20, cornerRadius: 5 });

    // Ensure all returned items are sharp instances
    expect(result.length).toBe(images.length);
    result.forEach((img) => {
      expect(img).toBeInstanceOf(sharp);
    });
  });

  it('handles empty image arrays gracefully', async () => {
    const images: sharp.Sharp[] = [];
    const result = await roundImages(images, { width: 10, height: 10, cornerRadius: 5 });

    expect(result).toEqual([]);
  });

  it('returns sharp instances with buffers', async () => {
    const image = sharp({ create: { width: 15, height: 15, channels: 4, background: 'white' } });
    const [processed] = await roundImages([image], { width: 15, height: 15, cornerRadius: 3 });

    const newBuffer = await processed!.png().toBuffer();
    expect(newBuffer).toBeInstanceOf(Buffer);
    expect(newBuffer.length).toBeGreaterThan(0);
  });

  it('handles non-integer cornerRadius', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });

    const [processed] = await roundImages([image], { width: 10, height: 10, cornerRadius: 2.7 });
    const buffer = await processed!.png().toBuffer();

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
