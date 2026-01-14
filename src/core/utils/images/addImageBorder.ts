import sharp from 'sharp';
import type { RGBA } from '../colors/types.js';

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

export const addImageBorder = async (
  image: sharp.Sharp,
  { borderWidth, borderHeight, borderColor, imageWidth, imageHeight, cornerRadius = 0, finalizePipeline = false }: Options
) => {
  // Only add borders to an image if needed
  if (borderWidth <= 0) return image;

  // Create background to act as border
  const background = sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: borderColor,
    },
  }).toFormat('png');

  // Crop image
  const croppedImage = image.resize({
    width: imageWidth - borderWidth * 2,
    height: imageHeight - borderHeight * 2,
  });

  // Put cropped image on the background
  background.composite([
    {
      input: await croppedImage.toBuffer(),
      top: borderWidth,
      left: borderHeight,
    },
  ]);

  // Finalize image if needed
  if (finalizePipeline) {
    return sharp(await background.toBuffer());
  }

  return background;
};
