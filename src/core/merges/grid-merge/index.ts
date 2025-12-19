import sharp from 'sharp';
import type { GridMerge } from '../types.js';
import { getSmallestImageDimensions } from '../../utils/getSmallestImageDimensions.js';
import { scaleImages } from '../../utils/scaleImages.js';
import { roundImages } from '../../utils/roundImages.js';
import { createSvgTextBuffer } from '../../utils/createSvgTextBuffer.js';
import { rgbaToHex } from '../../../validators/utils.js';
import { getFontSize } from '../../utils/getFontSize.js';
import { shuffleArray, shuffleTogether } from '../../helpers.js';
import { gridSchema } from '../../schemas/grid.js';

export const gridMerge: GridMerge = async (imageInputs, options, onProgress) => {
  const validationOptions = await gridSchema.parseAsync(options);

  // Load images from inputs
  const images = [];
  for (const imageInput of imageInputs) {
    try {
      images.push(sharp(imageInput));
    } catch (e) {
      console.log('------- ERROR -------');
      console.log(e);
    }
  }

  // Destructure params
  const {
    shuffle,
    aspectRatio,
    imageWidth,
    columns,
    gap,
    cornerRadius,
    canvasColor,
    caption,
    captions,
    captionColor,
    maxCaptionSize,
    format,
  } = validationOptions;

  // Update progress if needed
  const progressInfo = {
    completed: 0,
    total: images.length,
    phase: 'Initializing',
  };

  if (onProgress) {
    onProgress(progressInfo);
  }

  // Shuffle images and captions if needed
  let orderedImages = images;
  let orderedCaptions = captions || [];

  if (shuffle && caption && captions?.length) {
    [orderedImages, orderedCaptions] = shuffleTogether(images, captions);
  }

  if (shuffle && !caption) {
    orderedImages = shuffleArray(images);
  }

  // Prepare images
  const width = imageWidth || (await getSmallestImageDimensions(orderedImages)).smallestWidth;
  const height = Math.floor(width / aspectRatio);

  const resizedImages = await scaleImages(orderedImages, { width, height });
  const roundedImages = await roundImages(resizedImages, { width, height, cornerRadius });

  // Prepare canvas
  const CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO = 0.04;

  const rows = Math.ceil(roundedImages.length / columns);

  const canvasWidth = width * columns + (columns + 1) * gap;
  const captionHeight = Math.floor(canvasWidth * CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO);

  const minimumCanvasHeight = height * rows + (rows + 1) * gap;
  const canvasHeight = caption ? minimumCanvasHeight + rows * captionHeight : minimumCanvasHeight;

  // Calculate font size if needed
  let fontSize = null;
  if (caption) {
    const longestCaption = orderedCaptions.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    });

    fontSize = await getFontSize({
      text: longestCaption,
      maxWidth: width,
      maxHeight: captionHeight,
      initialFontSize: maxCaptionSize,
    });
  }

  // Create canvas
  const canvas = sharp({
    limitInputPixels: false,
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: canvasColor,
    },
  });

  // Collect composites
  const composites = [];

  let x = gap;
  let y = gap;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index >= roundedImages.length) break;

      const image = roundedImages[index] as sharp.Sharp;

      composites.push({
        input: await image.toBuffer(),
        left: x,
        top: y,
      });

      // Add caption if required
      if (caption) {
        // Create text
        const svgBuffer = createSvgTextBuffer({
          text: orderedCaptions[index] as string,
          maxWidth: width,
          maxHeight: captionHeight,
          fontSize: fontSize!,
          fill: rgbaToHex(captionColor),
        });

        // Add text to composites
        composites.push({
          input: svgBuffer,
          left: x,
          top: y + height,
        });
      }

      // Update coordinates
      x += width + gap;

      // Update progress if needed
      if (onProgress) {
        progressInfo.completed++;
        progressInfo.phase = 'Merging';
        onProgress(progressInfo);
      }
    }

    // Update coordinates
    y += caption ? height + gap + captionHeight : height + gap;
    x = gap;
  }

  // Create final grid
  canvas.composite(composites);

  return await canvas.toFormat(format).toBuffer();
};
