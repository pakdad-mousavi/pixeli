import type { RGBA } from './types.js';

export const rgbaToHex = (rgba: RGBA): string => {
  // Function to convert a number to a 2-digit hex string
  const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Convert r, g, b (0-255)
  const rHex = componentToHex(rgba.r);
  const gHex = componentToHex(rgba.g);
  const bHex = componentToHex(rgba.b);

  // Convert alpha (0-1) to 0-255 range, then to 2-digit hex
  const aVal = Math.round(rgba.alpha * 255);
  const aHex = componentToHex(aVal);

  return `#${rHex}${gHex}${bHex}${aHex}`;
};
