#!/usr/bin/env node

import { Command } from 'commander';
import { configureCommandErrors } from './utils/configureCommandErrors.js';

import gridCommand from './commands/grid/index.js';
import masonryCommand from './commands/masonry/index.js';
import templateCommand from './commands/template/index.js';
import collageCommand from './commands/collage/index.js';

import pkg from '../../package.json' with { type: 'json' };

const program = new Command();

program
  .name('pixeli')
  .description('A lightweight command-line tool for merging multiple images into customizable grid layouts.')
  .version(pkg.version);

program.addCommand(gridCommand);
program.addCommand(masonryCommand);
program.addCommand(templateCommand);
program.addCommand(collageCommand);

configureCommandErrors(program);

try {
  program.parse();
} catch (e) {
  console.log(e);
}
