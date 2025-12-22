import sharp from 'sharp';

interface ScaleImagesOptions {
  width?: number;
  height?: number;
  finalizePipeline?: boolean;
}

export const scaleImages = async (
  images: sharp.Sharp[],
  { width, height, finalizePipeline = false }: ScaleImagesOptions = {}
) => {
  // Ensure either width or height is provided
  if (width == undefined && height === undefined) {
    throw new Error('You must provide either width or height.');
  }

  // Return scaled images
  const scaledImages = await Promise.all(
    images.map(async (image) => {
      const meta = await image.metadata();

      let targetWidth, targetHeight;

      if (width !== undefined && height !== undefined) {
        targetWidth = width;
        targetHeight = height;
      } else if (width !== undefined) {
        const f = width / meta.width;
        targetWidth = width;
        targetHeight = Math.floor(meta.height * f);
      } else {
        const f = (height as number) / meta.height;
        targetHeight = height;
        targetWidth = Math.floor(meta.width * f);
      }

      const newImage = image.resize(targetWidth, targetHeight);

      // Only finalize changes in the image pipeline if needed
      if (finalizePipeline) {
        // Use jpg format if possible for less memory usage
        const formatPipe = meta.channels === 4 ? newImage.toFormat('png') : newImage.toFormat('jpg');
        const buffer = await formatPipe.toBuffer();
        return sharp(buffer);
      } else {
        return newImage;
      }
    })
  );

  return scaledImages;
};
