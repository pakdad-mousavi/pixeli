import { describe, expect, it } from 'vitest';
import { rgbaToHex } from '../../../core/utils/colors/rgbaToHex.js';

describe('rgbaToHex', () => {
  it('converts RGBA to 8-digit hex', () => {
    const result = rgbaToHex({
      r: 255,
      g: 0,
      b: 170,
      alpha: 0.5,
    });

    expect(result).toBe('#ff00aa80');
  });

  it('pads single-digit hex values with leading zeros', () => {
    const result = rgbaToHex({
      r: 5,
      g: 10,
      b: 15,
      alpha: 0.03,
    });

    expect(result).toBe('#050a0f08');
  });

  it('handles fully opaque alpha', () => {
    const result = rgbaToHex({
      r: 0,
      g: 0,
      b: 0,
      alpha: 1,
    });

    expect(result).toBe('#000000ff');
  });

  it('handles fully transparent alpha', () => {
    const result = rgbaToHex({
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    });

    expect(result).toBe('#00000000');
  });
});
