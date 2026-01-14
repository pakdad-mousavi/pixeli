import sharp from 'sharp';
import type { RGBA } from '../colors/types.js';
import { rgbaToHex } from '../colors/rgbaToHex.js';

interface Options {
  // Border options
  borderWidth: number;
  borderHeight: number;
  borderColor: RGBA;
  cornerRadius: number;

  // Image details
  imageWidth: number;
  imageHeight: number;

  // Finalization
  finalizePipeline?: boolean;
}

export const handleImageEdges = async (
  image: sharp.Sharp,
  { borderWidth, borderHeight, borderColor, imageWidth, imageHeight, cornerRadius = 0, finalizePipeline = false }: Options
) => {
  // Only change the image's edges if needed
  if (borderWidth <= 0 && borderHeight <= 0 && cornerRadius <= 0) return image;

  const maxBorderX = imageWidth / 2;
  const maxBorderY = imageHeight / 2;

  const effectiveBorderWidth = Math.min(borderWidth, maxBorderX);
  const effectiveBorderHeight = Math.min(borderHeight, maxBorderY);

  // Step 1 — Round corners mask
  const mask = `
    <svg width="${imageWidth}" height="${imageHeight}">
      <rect x="0" y="0" width="${imageWidth}" height="${imageHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
    </svg>
  `;

  // Step 2 — Optional border layer (draw inside the image)
  const border = `
    <svg width="${imageWidth}" height="${imageHeight}">
      <rect x="${effectiveBorderWidth / 2}" y="${effectiveBorderHeight / 2}" width="${
    imageWidth - effectiveBorderWidth
  }" height="${imageHeight - effectiveBorderHeight}" rx="${cornerRadius}" ry="${cornerRadius}" 
        fill="none" stroke="${rgbaToHex(borderColor)}" stroke-width="${Math.max(effectiveBorderWidth, effectiveBorderHeight)}"/>
    </svg>
  `;

  // Only pick needed composites
  const composites: sharp.OverlayOptions[] = [];

  if (cornerRadius > 0) {
    composites.push({ input: Buffer.from(mask), blend: 'dest-in', top: 0, left: 0 });
  }

  if (effectiveBorderWidth > 0 || effectiveBorderHeight > 0) {
    composites.push({ input: Buffer.from(border), blend: 'over', top: 0, left: 0 });
  }

  // Step 3 — Composite mask and border
  const processed = composites.length > 0 ? image.toFormat('png').composite(composites) : image;

  // Finalize image if needed
  if (finalizePipeline) {
    return sharp(await processed.toBuffer());
  }

  return processed;
};
