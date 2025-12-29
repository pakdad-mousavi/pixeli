import sharp from 'sharp';

export const getImageWidths = async (images: sharp.Sharp[]) => {
  const widths = [];

  for (const image of images) {
    const meta = await image.metadata();
    widths.push(meta.width);
  }

  return widths;
};
