import { buildCommandFromSchema } from '../../utils/buildCommandFromSchema.js';

import { cliProjectSchema } from '../../schemas/project.js';

import { loadImages } from '../../modules/loadImages.js';
import { MergeProgressBar } from '../../modules/progressBar.js';
import { MessageRenderer, MESSAGES } from '../../../core/modules/messages.js';
import { toErrorMessage } from '../../utils/toErrorMessage.js';

import { serveApp } from './backend/index.js';

const projectCommand = buildCommandFromSchema(
  'project',
  'Starts a new project in the directory specified',
  cliProjectSchema,
  {
    dir: {
      flags: '[directory-path]',
      description: 'Directory to start a new project in, defaults to current working directory',
    },
  },
  {},
).action(async (dir) => {
  const input = { dir };
  try {
    const { dir: projectDir } = await cliProjectSchema.parseAsync(input);

    serveApp(
      projectDir,
      (info) => {
        console.log(`Server running at http://localhost:${info.port}`);
      },
      3000,
    );
    // console.log('xxx');
    // console.log('yyy');
    // console.log(5 + 5);

    // // Use load images module
    // const { images, imagePaths, ignoredPaths } = await loadImages({
    //   input: { files: validatedOptions.files, dir: validatedOptions.dir },
    //   recursive: validatedOptions.recursive,
    // });

    // // Ensure user knows about ignored files
    // if (ignoredPaths.length) {
    //   const warning = new MessageRenderer(MESSAGES.WARNINGS.IGNORED_FILES, ignoredPaths.join('\n') + '\n');

    //   const confirmation = await warning.confirm();
    //   if (!confirmation) return;
    // }

    // // Collect merge options
    // const { recursive, output, files, dir, ...cliOptions } = validatedOptions;
    // const format = path.extname(output).replace('.', '');
    // const captions = imagePaths.map((p) => path.basename(p));

    // const mergeOptions = {
    //   format,
    //   captions,
    //   ...cliOptions,
    // };

    // // Get grid buffer
    // const buffer = await gridMerge(images, mergeOptions, (progressInfo) => {
    //   if (!bar.progressBar.isActive) {
    //     bar.startBar(progressInfo.phase);
    //   } else {
    //     bar.updateBar(progressInfo);
    //   }
    // });

    // // Write file and display success message
    // await fs.writeFile(output, buffer);
    // bar.endBar();

    // const success = new MessageRenderer(MESSAGES.SUCCESS.OUTPUT, output);
    // success.render();
  } catch (err) {
    // Create and render error
    const errorMessage = toErrorMessage(err);
    const error = new MessageRenderer(errorMessage);
    error.render();
  }
});

export default projectCommand;
