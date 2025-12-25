import sharp from 'sharp';

// Width and height do not necessarily have to be from the same image
export const getSmallestImageDimensions = async (images: sharp.Sharp[]) => {
  const metas = await Promise.all(images.map((img) => img.metadata()));

  return metas.reduce(
    (acc, meta) => ({
      smallestWidth: Math.min(acc.smallestWidth, meta.width),
      smallestHeight: Math.min(acc.smallestHeight, meta.height),
    }),
    { smallestWidth: Infinity, smallestHeight: Infinity }
  );
};
