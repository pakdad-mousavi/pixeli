import sharp from 'sharp';
import z from 'zod';

import type { GridMerge } from './types.js';

import { getSmallestImageDimensions } from '../utils/images/getSmallestImageDimensions.js';
import { scaleImages } from '../utils/images/scaleImages.js';
import { roundImages } from '../utils/images/roundImages.js';
import { createSvgTextBuffer } from '../utils/svg/createSvgTextBuffer.js';
import { getFontSize } from '../utils/fonts/getFontSize.js';

import { rgbaToHex } from '../utils/colors/rgbaToHex.js';
import { shuffleArray, shuffleTogether } from '../helpers.js';
import { gridSchema } from '../schemas/grid.js';
import { MergeError } from '../mergeError.js';
import { MESSAGES } from '../../cli/modules/messages.js';
import { isActualImage } from '../utils/images/isActualImage.js';

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
  const { success, data, error } = await gridSchema.safeParseAsync(options);

  // Try to validate given options
  let validationOptions: z.infer<typeof gridSchema>;
  if (success) {
    validationOptions = data;
  } else if (error.issues[0]) {
    // Handles zod errors
    const path = error.issues[0].path;
    const err = error.issues[0].message;
    const errorText = path.length > 0 ? `Invalid value at ${path.join('/')}: ${err}` : `Error: ${err}`;
    throw new MergeError(errorText, { type: 'validation' });
  } else {
    // Handles non-zod errors
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: error,
    });
  }

  // Load images from inputs
  const images: sharp.Sharp[] = [];
  for (let i = 0; i < imageInputs.length; i++) {
    // Ensure image is valid
    const input = imageInputs[i]!;
    const { isImage, reason } = await isActualImage(input);

    if (!isImage) {
      throw new MergeError(`Invalid image input at index ${i}`, {
        type: 'validation',
        cause: reason,
      });
    }

    images.push(sharp(input));
  }

  // Ensure there's at least one image
  if (images.length <= 0) {
    throw new MergeError('No images provided to merge', { type: 'validation' });
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

  // Ensure caption length is not less than image length
  if (areCaptionsProvided(caption, captions) && captions.length < images.length) {
    throw new MergeError('Not enough captions provided', { type: 'validation' });
  }

  // Update progress if needed
  const progressInfo = {
    completed: 0,
    total: images.length,
    phase: 'Initializing',
  };

  if (onProgress) {
    onProgress({ ...progressInfo });
  }

  // Shuffle images and captions if needed
  let orderedImages = images;
  let orderedCaptions = captions || [];

  if (shuffle && areCaptionsProvided(caption, captions)) {
    [orderedImages, orderedCaptions] = shuffleTogether(images, captions);
  }

  if (shuffle && !areCaptionsProvided(caption, captions)) {
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
        onProgress({ ...progressInfo });
      }
    }

    // Update coordinates
    y += caption ? height + gap + captionHeight : height + gap;
    x = gap;
  }

  // Create final grid
  try {
    canvas.composite(composites);
  } catch (err) {
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: err,
    });
  }

  try {
    return await canvas.toFormat(format).toBuffer();
  } catch (err) {
    // SPECIFIC SHARP ERROR
    // occurs when trying to create a buffer that exceeds the limits of the current image format
    if ((err as Error)?.message?.includes('pixel limit') || (err as Error)?.message?.includes('Processed image is too large')) {
      const errText = `Error: image to large for '${format}' format, try a format that allows larger images`;
      throw new MergeError(errText, { type: 'image' });
    }

    // Other sharp errors
    throw new MergeError(MESSAGES.ERROR.INTERNAL.message, {
      type: 'internal',
      cause: err,
    });
  }
};

const areCaptionsProvided = (caption: boolean, captions: string[] | undefined): captions is string[] => {
  return caption;
};
