import sharp from 'sharp';

interface RoundImageOptions {
  width: number;
  height: number;
  cornerRadius: number;
  finalizePipeline?: boolean;
}

export const roundImage = async (
  image: sharp.Sharp,
  { width, height, cornerRadius, finalizePipeline = false }: RoundImageOptions
) => {
  // Skip if the cornerRadius = zero
  if (!cornerRadius) return image;

  // Create rounded svg mask
  const mask = Buffer.from(`
        <svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" />
          </svg>
      `);

  // Apply mask
  const roundedImage = image
    .composite([
      {
        input: mask,
        blend: 'dest-in',
      },
    ])
    .toFormat('png');

  // Finalize pipeline if needed
  if (finalizePipeline) {
    const buffer = await roundedImage.toBuffer();
    return sharp(buffer);
  }

  return roundedImage;
};
