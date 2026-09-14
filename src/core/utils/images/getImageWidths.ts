import { type Sharp } from 'sharp';

export const getImageWidths = async (images: Sharp[]) => {
  const widths = [];

  for (const image of images) {
    const meta = await image.metadata();
    widths.push(meta.width);
  }

  return widths;
};
