export const isValidHexColor = (hex: string) => {
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  return hexRegex.test(hex);
};

export const hexToRgba = (color: string) => {
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

export const rgbaToHex = (rgba: { r: number; g: number; b: number; alpha: number }) => {
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

export const parseAspectRatio = (aspectRatio: string): number | false => {
  // return ratio straight away if its just a number
  const ratio = Number(aspectRatio);
  if (ratio) {
    return ratio;
  }

  const ratioRegex = /^\s*(\d+)\s*(\/|:|x)\s*(\d+)\s*$/i;
  const match = aspectRatio.match(ratioRegex);

  // Ensure match exists
  if (!match) return false;

  // Ensures absolute type safety
  const [, wStr, , hStr] = match;
  if (!wStr || !hStr) return false;

  // Return aspect ratio
  const width = parseInt(wStr, 10);
  const height = parseInt(hStr, 10);

  return width / height;
};
