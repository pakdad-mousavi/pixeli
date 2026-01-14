import path from 'node:path';
import fs from 'node:fs/promises';

import { buildCommandFromSchema } from '../../utils/buildCommandFromSchema.js';
import { masonryMerge } from '../../../core/merges/masonry/index.js';

import { cliMasonrySchema } from '../../schemas/masonry.js';

import { loadImages } from '../../modules/loadImages.js';
import { MergeProgressBar } from '../../modules/progressBar.js';
import { MessageRenderer, MESSAGES } from '../../../core/modules/messages.js';
import { toErrorMessage } from '../../utils/toErrorMessage.js';

const masonryCommand = buildCommandFromSchema(
  'masonry',
  "Use a ragged-grid layout, preserves images' aspect ratios",
  cliMasonrySchema,
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
    rowHeight: {
      flags: '--rh, --row-height <px>',
      description:
        'The height of each row, defaults to the trimmed median image height if undefined. Only applied in horizontal flows.',
    },
    columnWidth: {
      flags: '--cw, --column-width <px>',
      description:
        'The width of each column, defaults to the trimmed median image width if undefined. Only applied in vertical flows.',
    },
    canvasWidth: {
      flags: '--cvw, --canvas-width <px>',
      description: 'The width of the entire canvas. Only required in horizontal flows.',
    },
    canvasHeight: {
      flags: '--cvh, --canvas-height <px>',
      description: 'The width of the entire canvas. Only required in vertical flows.',
    },
    flow: {
      flags: '-f, --flow <horizontal|vertical>',
      description: 'The orientation of the masonry layout.',
    },
    hAlign: {
      flags: '--ha, --h-align <left|center|right|justified>',
      description: 'The horizontal alignment of each row. Only applied in horizontal layouts.',
    },
    vAlign: {
      flags: '--va, --v-align <top|middle|bottom|justified>',
      description: 'The vertical alignment of each column. Only applied in vertical layouts.',
    },
  }
).action(async (files, opts) => {
  const input = { files, ...opts };

  // Use progress bar module to track progress
  const bar = new MergeProgressBar();

  try {
    const validatedOptions = await cliMasonrySchema.parseAsync(input);

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
    let mergeOptions = {
      format,
      ...cliOptions,
    };

    // Get grid buffer
    const buffer = await masonryMerge(images, mergeOptions, (progressInfo) => {
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

export default masonryCommand;
