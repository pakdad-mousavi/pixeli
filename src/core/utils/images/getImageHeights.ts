import sharp from 'sharp';

export const getImageHeights = async (images: sharp.Sharp[]) => {
  const heights = [];

  for (const image of images) {
    const meta = await image.metadata();
    heights.push(meta.height);
  }

  return heights;
};
