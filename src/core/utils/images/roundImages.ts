import sharp from 'sharp';

interface RoundImagesOptions {
  width: number;
  height: number;
  cornerRadius: number;
}

export const roundImages = async (images: sharp.Sharp[], { width, height, cornerRadius }: RoundImagesOptions) => {
  // Skip if the cornerRadius = zero
  if (!cornerRadius) return images;

  // Round images respectively
  return await Promise.all(
    images.map(async (image) => {
      const mask = Buffer.from(`
        <svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" />
          </svg>
      `);

      const buff = await image
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();
      return sharp(buff);
    })
  );
};
