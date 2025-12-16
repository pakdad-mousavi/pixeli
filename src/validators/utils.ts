export const isValidHexColor = (hex: string) => {
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  return hexRegex.test(hex);
};

export const normalizeHexColor = (color: string) => {
  // 3. Normalize hex → RGBA
  let r, g, b, a;
  const hexValue = color.slice(1);

  // #rgb
  if (hexValue.length === 3) {
    r = parseInt(hexValue.charAt(0) + hexValue.charAt(0), 16);
    g = parseInt(hexValue.charAt(1) + hexValue.charAt(1), 16);
    b = parseInt(hexValue.charAt(2) + hexValue.charAt(2), 16);
    a = 1;
  } // #rrggbb
  else if (hexValue.length === 6) {
    r = parseInt(hexValue.slice(0, 2), 16);
    g = parseInt(hexValue.slice(2, 4), 16);
    b = parseInt(hexValue.slice(4, 6), 16);
    a = 1;
  } // #rrggbbaa
  else {
    r = parseInt(hexValue.slice(0, 2), 16);
    g = parseInt(hexValue.slice(2, 4), 16);
    b = parseInt(hexValue.slice(4, 6), 16);
    a = Number(parseFloat(String((hexValue.slice(6, 8), 16) / 255)).toFixed(2));
  }

  return { r, g, b, a };
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
