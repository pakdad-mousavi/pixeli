import sharp from 'sharp';
import z from 'zod';

import type { GridMerge } from '../types.js';

import { getSmallestImageDimensions } from '../../utils/images/getSmallestImageDimensions.js';
import { scaleImages } from '../../utils/images/scaleImages.js';
import { roundImages } from '../../utils/images/roundImages.js';
import { createSvgTextBuffer } from '../../utils/svg/createSvgTextBuffer.js';
import { getFontSize } from '../../utils/fonts/getFontSize.js';

import { rgbaToHex } from '../../utils/colors/rgbaToHex.js';
import { shuffleArray, shuffleTogether } from '../../helpers.js';
import { gridSchema } from '../../schemas/grid.js';
import { MergeError } from '../../mergeError.js';
import { MESSAGES } from '../../../cli/modules/messages.js';

/**
 * Merges multiple images into a grid layout. Note that each image is resized to
 * `options.imageWidth` or to the smallest image width.
 *
 * @param imageInputs - Input images (buffers, file paths, or streams supported by sharp)
 * @param options - Grid merge configuration options
 * @param onProgress - Callback function which is called everytime progress is made
 *
 * @returns A Promise that resolves to the merged image buffer
 *
 * @example
 * ```ts
 * const buffer = await gridMerge(images, {
 *   columns: 3,
 *   gap: 12,
 *   captions: ['A', 'B', 'C'],
 *   format: 'png'
 * });
 * ```
 */

export const gridMerge: GridMerge = async (imageInputs, options, onProgress) => {
  let validationOptions!: z.infer<typeof gridSchema>;

  try {
    validationOptions = await gridSchema.parseAsync(options);
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError && err.issues[0]) {
      const path = err.issues[0].path;
      const error = err.issues[0].message;
      const errorText = path.length > 0 ? `Invalid value at ${path.join('/')}: ${error}` : `Error: ${error}`;

      throw new MergeError('validation', errorText);
    }

    // Handle internal errors
    throw new MergeError('internal', 'Error: an internal error has occured');
  }

  // Load images from inputs
  const images: sharp.Sharp[] = [];
  imageInputs.forEach((imageInput, idx) => {
    try {
      images.push(sharp(imageInput));
    } catch (e) {
      throw new MergeError('validation', `Invalid image input at index ${idx}`);
    }
  });

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
  try {
    canvas.composite(composites);
  } catch (e) {
    console.log('YYYYYYY');
  }

  try {
    return await canvas.toFormat(format).toBuffer();
  } catch (e) {
    // An error which should never occur, for type safety
    if (!(e instanceof Error)) {
      throw new MergeError('internal', MESSAGES.ERROR.INTERNAL.message);
    }

    // SPECIFIC SHARP ERROR
    // occurs when trying to create a buffer that exceeds the limits of the current image format
    if (e.message.includes('pixel limit')) {
      const errText = `Error: image to large for '${format}' format, try a format that allows larger images`;
      throw new MergeError('image', errText);
    }

    // Other sharp errors
    throw new MergeError('image', MESSAGES.ERROR.INTERNAL.message);
  }
};
