import sharp from 'sharp';

interface ScaleImageOptions {
  width?: number;
  height?: number;
  finalizePipeline?: boolean;
}

export const scaleImage = async (image: sharp.Sharp, { width, height, finalizePipeline = false }: ScaleImageOptions) => {
  // Ensure either width or height is provided
  if (width == undefined && height === undefined) {
    throw new Error('You must provide either width or height.');
  }

  let targetWidth, targetHeight;
  const meta = await image.metadata();

  // Set target width and height using size factor
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

  // Resize the image
  const resizedImage = image.resize(targetWidth, targetHeight);

  // Only finalize changes in the image pipeline if needed
  if (finalizePipeline) {
    // Use jpg format if possible for less memory usage
    const formatPipe = meta.channels === 4 ? resizedImage.toFormat('png') : resizedImage.toFormat('jpg');
    const buffer = await formatPipe.toBuffer();
    return sharp(buffer);
  } else {
    return resizedImage;
  }
};
