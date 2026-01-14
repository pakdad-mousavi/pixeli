import path from 'node:path';
import fs, { readFile } from 'node:fs/promises';

import { buildCommandFromSchema } from '../../utils/buildCommandFromSchema.js';
import { templateMerge } from '../../../core/merges/template/index.js';

import { cliTemplateSchema } from '../../schemas/template.js';

import { PRESETS } from './presets.js';
import { loadImages } from '../../modules/loadImages.js';
import { MergeProgressBar } from '../../modules/progressBar.js';
import { MessageRenderer, MESSAGES } from '../../../core/modules/messages.js';
import { toErrorMessage } from '../../utils/toErrorMessage.js';
import type { Template } from '../../../core/merges/template/types.js';

const templateCommand = buildCommandFromSchema(
  'template',
  'Use JSON layouts to build custom collages',
  cliTemplateSchema,
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
    template: {
      flags: '-t, --template <path>',
      description: 'The path to the JSON file describing the template',
    },
    preset: {
      flags: '-p, --preset <preset-id>',
      description: `Template preset ID to use. Available collage IDs: ${Object.keys(PRESETS).join(', ')}`,
    },
  }
).action(async (files, opts) => {
  const input = { files, ...opts };

  // Use progress bar module to track progress
  const bar = new MergeProgressBar();

  try {
    const validatedOptions = await cliTemplateSchema.parseAsync(input);

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
    const { recursive, output, files, dir, template, preset, ...cliOptions } = validatedOptions;

    // Get the template file
    let templateObj: Template;
    if (validatedOptions.template !== undefined) {
      const templateJson = await readFile(validatedOptions.template, 'utf-8');
      templateObj = JSON.parse(templateJson);
    } else if (validatedOptions.preset !== undefined) {
      templateObj = PRESETS[validatedOptions.preset];
    } else {
      throw new Error(MESSAGES.ERROR.INTERNAL.message);
    }

    const format = path.extname(output).replace('.', '');
    let mergeOptions = {
      format,
      template: templateObj,
      ...cliOptions,
    };

    // Get grid buffer
    const buffer = await templateMerge(images, mergeOptions, (progressInfo) => {
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

export default templateCommand;
