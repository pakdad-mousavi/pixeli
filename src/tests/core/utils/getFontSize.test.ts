import { describe, it, expect } from 'vitest';
import { getFontSize } from '../../../core/utils/fonts/getFontSize.js';

describe('getFontSize', () => {
  it('returns initialFontSize if text fits within maxWidth and maxHeight', async () => {
    const fontSize = await getFontSize({
      text: 'Short text',
      maxWidth: 1000,
      maxHeight: 500,
      initialFontSize: 50,
      minFontSize: 10,
    });

    expect(fontSize).toBe(50);
  });

  it('reduces font size with small jumps if text does not fit', async () => {
    const fontSize = await getFontSize({
      text: 'A very very long text string that will not fit',
      maxWidth: 50,
      maxHeight: 20,
      initialFontSize: 50,
      minFontSize: 10,
    });

    expect(fontSize).toBeGreaterThanOrEqual(10);
    expect(fontSize).toBeLessThan(50);
  });

  it('reduces font size with large jumps if text does not fit', async () => {
    const fontSize = await getFontSize({
      text: 'A very very long text string that will not fit',
      maxWidth: 50,
      maxHeight: 20,
      minFontSize: 10,
    });

    expect(fontSize).toBeGreaterThanOrEqual(10);
    expect(fontSize).toBeLessThan(50);
  });

  it('returns minFontSize if text cannot fit even at minFontSize', async () => {
    const fontSize = await getFontSize({
      text: 'Extremely long text that cannot possibly fit',
      maxWidth: 1,
      maxHeight: 1,
      initialFontSize: 50,
      minFontSize: 5,
    });

    expect(fontSize).toBe(5);
  });

  it('respects custom initialFontSize and minFontSize', async () => {
    const fontSize = await getFontSize({
      text: 'Some text',
      maxWidth: 10,
      maxHeight: 10,
      initialFontSize: 30,
      minFontSize: 8,
    });

    expect(fontSize).toBeGreaterThanOrEqual(8);
    expect(fontSize).toBeLessThanOrEqual(30);
  });

  it('returns initialFontSize if maxWidth and maxHeight are very large', async () => {
    const fontSize = await getFontSize({
      text: 'Sample',
      maxWidth: 10000,
      maxHeight: 10000,
      initialFontSize: 42,
      minFontSize: 2,
    });

    expect(fontSize).toBe(42);
  });

  it('handles non-integer initialFontSize', async () => {
    const fontSize = await getFontSize({
      text: 'Text',
      maxWidth: 10,
      maxHeight: 10,
      initialFontSize: 12.5,
      minFontSize: 5,
    });

    expect(fontSize).toBeGreaterThanOrEqual(5);
    expect(fontSize).toBeLessThanOrEqual(12.5);
  });
});
