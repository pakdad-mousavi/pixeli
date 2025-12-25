import sharp from 'sharp';
import { escapeXML } from '../../helpers.js';

interface GetFontSizeOptions {
  text: string;
  maxWidth: number;
  maxHeight: number;
  initialFontSize?: number;
  minFontSize?: number;
}

export const getFontSize = async ({ text, maxWidth, maxHeight, initialFontSize = 100, minFontSize = 2 }: GetFontSizeOptions) => {
  const FONT_FAMILY = 'sans-serif';
  const THRESHOLD = 200;
  const SMALL_CHANGE = 2;
  const LARGE_CHANGE = 5;

  let fontSize = initialFontSize;

  while (fontSize >= minFontSize) {
    // No width or viewport given so that the actual size can be determined after rasterization
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <text
        x="${maxWidth / 2}"
        y="10"
        font-size="${fontSize}"
        font-family="${FONT_FAMILY}"
        fill="#000000"
        text-anchor="middle"
        dominant-baseline="middle">
        ${escapeXML(text)}
      </text>
    </svg>
    `;

    // Rasterize SVG: measure actual rendered size
    const raster = await sharp(Buffer.from(svg)).png().toBuffer();
    const meta = await sharp(raster).metadata();

    if (meta.width <= maxWidth && meta.height <= maxHeight) {
      return fontSize;
    }

    // If the difference is greater than the threshold, use large change
    if (meta.width - maxWidth > THRESHOLD || meta.height - maxHeight > THRESHOLD) {
      fontSize -= LARGE_CHANGE;
    } else {
      fontSize -= SMALL_CHANGE;
    }
  }

  return minFontSize;
};
