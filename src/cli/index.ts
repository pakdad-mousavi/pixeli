#!/usr/bin/env node

import { Command } from 'commander';
import { configureCommandErrors } from './utils/configureCommandErrors.js';

import gridCommand from './commands/grid.js';
import masonryCommand from './commands/masonry.js';

const program = new Command();

program
  .name('pixeli')
  .description('A lightweight command-line tool for merging multiple images into customizable grid layouts.')
  .version('1.0.0');

program.addCommand(gridCommand);
program.addCommand(masonryCommand);

configureCommandErrors(program);

try {
  program.parse();
} catch (e) {
  console.log(e);
}
