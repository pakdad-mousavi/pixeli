import path from 'node:path';
import fs from 'node:fs/promises';

import { buildCommandFromSchema } from '../../utils/buildCommandFromSchema.js';
import { collageMerge } from '../../../core/merges/collage/index.js';

import { loadImages } from '../../modules/loadImages.js';
import { MergeProgressBar } from '../../modules/progressBar.js';
import { MessageRenderer, MESSAGES } from '../../../core/modules/messages.js';
import { toErrorMessage } from '../../utils/toErrorMessage.js';
import { cliCollageSchema } from '../../schemas/collage.js';

const collageCommand = buildCommandFromSchema(
  'collage',
  'Arranges images in a messy, photo wall style grid.',
  cliCollageSchema,
  {
    files: {
      flags: '[files...]',
      description: 'Image filepaths to merge (use --dir for directories)',
    },
  },
  {
    dir: {
      flags: '-d, --dir <path>',
      description: 'Directory of images to merge',
    },
    recursive: {
      flags: '-r, --recursive',
      description: 'Recursively include subdirectories',
    },
    shuffle: {
      flags: '--sh, --shuffle',
      description: 'Shuffle up images to randomize order in the grid',
    },
    cornerRadius: {
      flags: '--cr, --corner-radius <px>',
      description: 'How much to round the corners of each image',
    },
    gap: {
      flags: '-g, --gap <px>',
      description: 'Gap between images',
    },
    canvasColor: {
      flags: '--bg, --canvas-color <hex|transparent>',
      description: 'Background color for canvas',
    },
    borderWidth: {
      flags: '--bw, --border-width <px>',
      description: 'Width of the border around each image. Borders are placed internally in each image',
    },
    borderColor: {
      flags: '--bc, --border-color <hex>',
      description: 'Color of the border around each image',
    },
    output: {
      flags: '-o, --output <file>',
      description: 'Output file path',
    },
    aspectRatio: {
      flags: '--ar, --aspect-ratio <width/height|number>',
      description: 'The aspect ratio of all the images (examples: 16/9, 4:3, 1.777)',
    },
    imageWidth: {
      flags: '-w, --image-width <px>',
      description: 'The width of each image, defaults to the smallest image',
    },
    columns: {
      flags: '-c, --columns <n>',
      description: 'The number of columns',
    },
    overlapPercentage: {
      flags: '--op, --overlap-percentage <percent>',
      description: 'The estimated percentage of overlap for every image pair. A higher percentage creates a tighter collage',
    },
    rotationRange: {
      flags: '--rr, --rotation-range <deg>',
      description: 'The maximum and minimum degrees to randomly rotate each image',
    },
    imageWidthVariance: {
      flags: '--wv, --image-width-variance <px>',
      description: 'The number of pixels to potentially variate imageWidth by. Used to create random-sized images in the collage',
    },
  }
).action(async (files, opts) => {
  const input = { files, ...opts };

  // Use progress bar module to track progress
  const bar = new MergeProgressBar();

  try {
    const validatedOptions = await cliCollageSchema.parseAsync(input);

    // Use load images module
    const { images, ignoredPaths } = await loadImages({
      input: { files: validatedOptions.files, dir: validatedOptions.dir },
      recursive: validatedOptions.recursive,
    });

    // Ensure user knows about ignored files
    if (ignoredPaths.length) {
      const warning = new MessageRenderer(MESSAGES.WARNINGS.IGNORED_FILES, ignoredPaths.join('\n') + '\n');

      const confirmation = await warning.confirm();
      if (!confirmation) return;
    }

    // Collect merge options
    const { recursive, output, files, dir, ...cliOptions } = validatedOptions;
    const format = path.extname(output).replace('.', '');

    const mergeOptions = {
      format,
      ...cliOptions,
    };

    // Get grid buffer
    const buffer = await collageMerge(images, mergeOptions, (progressInfo) => {
      if (!bar.progressBar.isActive) {
        bar.startBar(progressInfo.phase);
      } else {
        bar.updateBar(progressInfo);
      }
    });

    // Write file and display success message
    await fs.writeFile(output, buffer);
    bar.endBar();

    const success = new MessageRenderer(MESSAGES.SUCCESS.OUTPUT, output);
    success.render();
  } catch (err) {
    // End the progress bar
    bar.endBar();

    // Create and render error
    const errorMessage = toErrorMessage(err);
    const error = new MessageRenderer(errorMessage);
    error.render();
  }
});

export default collageCommand;
