import type { RGBA } from './types.js';

export const hexToRgba = (color: string): RGBA => {
  // 3. Normalize hex → RGBA
  let r, g, b, alpha;
  const hexValue = color.slice(1);

  // #rgb
  if (hexValue.length === 3) {
    r = parseInt(hexValue.charAt(0) + hexValue.charAt(0), 16);
    g = parseInt(hexValue.charAt(1) + hexValue.charAt(1), 16);
    b = parseInt(hexValue.charAt(2) + hexValue.charAt(2), 16);
    alpha = 1;
  } // #rrggbb
  else if (hexValue.length === 6) {
    r = parseInt(hexValue.slice(0, 2), 16);
    g = parseInt(hexValue.slice(2, 4), 16);
    b = parseInt(hexValue.slice(4, 6), 16);
    alpha = 1;
  } // #rrggbbaa
  else {
    r = parseInt(hexValue.slice(0, 2), 16);
    g = parseInt(hexValue.slice(2, 4), 16);
    b = parseInt(hexValue.slice(4, 6), 16);
    alpha = Number((parseInt(hexValue.slice(6, 8), 16) / 255).toFixed(2));
  }

  return { r, g, b, alpha };
};
