import { type Sharp } from 'sharp';

export const getImageHeights = async (images: Sharp[]) => {
  const heights = [];

  for (const image of images) {
    const meta = await image.metadata();
    heights.push(meta.height);
  }

  return heights;
};
