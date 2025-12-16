import { buildCommandFromSchema } from './buildCommandFromSchema.js';
import { cliGridSchema } from '../schemas/grid.js';
import z from 'zod';

const gridCommand = buildCommandFromSchema(
  'grid',
  'Arranges images in an organized grid.',
  cliGridSchema,
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
    caption: {
      flags: '--ca, --caption',
      description: 'Whether to caption each image',
    },
    captionColor: {
      flags: '--cc, --caption-color <hex>',
      description: 'Image Caption color',
    },
    maxCaptionSize: {
      flags: '--mcs, --max-caption-size <pt>',
      description: 'The maximum allowed caption size',
    },
  }
).action(async (files, opts) => {
  const input = { files, ...opts };
  try {
    const validatedOptions = await cliGridSchema.parseAsync(input);
    console.log(validatedOptions);
    // Run core grid merge

  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.issues);
    }
  }

});

export default gridCommand;
