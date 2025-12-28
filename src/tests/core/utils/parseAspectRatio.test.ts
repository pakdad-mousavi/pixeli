import { describe, it, expect } from 'vitest';
import { parseAspectRatio } from '../../../core/utils/images/parseAspectRatio.js';

describe('parseAspectRatio', () => {
  it('returns a number when input is a numeric string', () => {
    expect(parseAspectRatio('1.5')).toBe(1.5);
    expect(parseAspectRatio('2')).toBe(2);
    expect(parseAspectRatio('16')).toBe(16);
  });

  it('parses slash-separated aspect ratios', () => {
    expect(parseAspectRatio('16/9')).toBeCloseTo(16 / 9);
    expect(parseAspectRatio('4/3')).toBeCloseTo(4 / 3);
  });

  it('parses colon-separated aspect ratios', () => {
    expect(parseAspectRatio('16:9')).toBeCloseTo(16 / 9);
  });

  it('parses x-separated aspect ratios (case-insensitive)', () => {
    expect(parseAspectRatio('21x9')).toBeCloseTo(21 / 9);
    expect(parseAspectRatio('21X9')).toBeCloseTo(21 / 9);
  });

  it('ignores surrounding whitespace', () => {
    expect(parseAspectRatio('  16 / 9  ')).toBeCloseTo(16 / 9);
  });

  it('returns false for invalid formats', () => {
    expect(parseAspectRatio('abc')).toBe(false);
    expect(parseAspectRatio('16/')).toBe(false);
    expect(parseAspectRatio('/9')).toBe(false);
    expect(parseAspectRatio('16//9')).toBe(false);
    expect(parseAspectRatio('')).toBe(false);
  });

  it('returns false when width or height is missing', () => {
    expect(parseAspectRatio('x9')).toBe(false);
    expect(parseAspectRatio('16x')).toBe(false);
  });

  it('handles zero values consistently', () => {
    expect(parseAspectRatio('0')).toBe(false);
    expect(parseAspectRatio('0/9')).toBe(false);
    expect(parseAspectRatio('16/0')).toBe(false);
  });
});
