import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { scaleImages } from '../../../core/utils/images/scaleImages.js';

describe('scaleImages', () => {
  it('throws if neither width nor height is provided', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });
    await expect(scaleImages([image], {})).rejects.toThrow('You must provide either width or height.');
  });

  it('resizes images to exact width and height if both are provided', async () => {
    const image = sharp({ create: { width: 20, height: 10, channels: 4, background: 'white' } });
    const [result] = await scaleImages([image], { width: 40, height: 20, finalizePipeline: true });

    const meta = await result!.metadata();
    expect(meta.width).toBe(40);
    expect(meta.height).toBe(20);
  });

  it('resizes images preserving aspect ratio when only width is provided', async () => {
    const image = sharp({ create: { width: 20, height: 10, channels: 4, background: 'white' } });
    const [result] = await scaleImages([image], { width: 40, finalizePipeline: true });

    const meta = await result!.metadata();
    expect(meta.width).toBe(40);
    expect(meta.height).toBe(20); // 10 * (40/20)
  });

  it('resizes images preserving aspect ratio when only height is provided', async () => {
    const image = sharp({ create: { width: 20, height: 10, channels: 4, background: 'white' } });
    const [result] = await scaleImages([image], { height: 20, finalizePipeline: true });

    const meta = await result!.metadata();
    expect(meta.width).toBe(40); // 20 * (20/10)
    expect(meta.height).toBe(20);
  });

  it('returns new sharp instances when finalizePipeline is true', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });
    const [result] = await scaleImages([image], { width: 20, finalizePipeline: true });

    // Should be a sharp instance
    expect(result).toBeInstanceOf(sharp);

    // To ensure buffer pipeline finalized
    const buffer = await result!.png().toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('returns resize pipeline directly when finalizePipeline is false', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 4, background: 'white' } });
    const [result] = await scaleImages([image], { width: 20 });

    const buffer = await result!.png().toBuffer();
    const meta = await result!.metadata();

    // Still a sharp instance (pipeline)
    expect(result).toBeInstanceOf(sharp);
    expect(buffer.length).toBeGreaterThan(0);
    expect(meta.width).toBe(10);
    expect(meta.height).toBe(10);
  });

  it('returns a buffer in jpg format when image has 3 channels', async () => {
    const image = sharp({ create: { width: 10, height: 10, channels: 3, background: 'white' } });
    const [result] = await scaleImages([image], { width: 20, finalizePipeline: true });

    const buffer = await result!.png().toBuffer();
    const meta = await result!.metadata();

    expect(result).toBeInstanceOf(sharp);
    expect(buffer.length).toBeGreaterThan(0);
    expect(meta.format).toBe('jpeg');
  });

  it('handles empty images array gracefully', async () => {
    const result = await scaleImages([], { width: 10 });
    expect(result).toEqual([]);
  });

  it('handles multiple images', async () => {
    const img1 = sharp({ create: { width: 20, height: 10, channels: 4, background: 'white' } });
    const img2 = sharp({ create: { width: 30, height: 15, channels: 4, background: 'black' } });

    const results = await scaleImages([img1, img2], { width: 40, finalizePipeline: true });
    expect(results.length).toBe(2);

    const meta1 = await results[0]!.metadata();
    const meta2 = await results[1]!.metadata();

    expect(meta1.width).toBe(40);
    expect(meta1.height).toBe(20);
    expect(meta2.width).toBe(40);
    expect(meta2.height).toBe(20);
  });
});
