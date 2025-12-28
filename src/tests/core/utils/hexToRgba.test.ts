import { describe, expect, it } from 'vitest';
import { hexToRgba } from '../../../core/utils/colors/hexToRgba.js';

describe('hexToRgba', () => {
  it('converts 3-digit hex (#rgb) to RGBA', () => {
    const result = hexToRgba('#f0a');

    expect(result).toEqual({
      r: 255,
      g: 0,
      b: 170,
      alpha: 1,
    });
  });

  it('converts 6-digit hex (#rrggbb) to RGBA', () => {
    const result = hexToRgba('#ff00aa');

    expect(result).toEqual({
      r: 255,
      g: 0,
      b: 170,
      alpha: 1,
    });
  });

  it('converts 8-digit hex (#rrggbbaa) to RGBA', () => {
    const result = hexToRgba('#ff00aa80');

    expect(result).toEqual({
      r: 255,
      g: 0,
      b: 170,
      alpha: 0.5,
    });
  });

  it('handles fully transparent alpha', () => {
    const result = hexToRgba('#00000000');

    expect(result.alpha).toBe(0);
  });

  it('handles fully opaque alpha', () => {
    const result = hexToRgba('#000000ff');

    expect(result.alpha).toBe(1);
  });
});
