#!/usr/bin/env node

import { Command } from 'commander';
import gridCommand from './commands/grid.js';

const program = new Command();

program
  .name('pixeli')
  .description('A lightweight command-line tool for merging multiple images into customizable grid layouts.')
  .version('1.0.0');

program.addCommand(gridCommand);

try {
  program.parse();
} catch (e) {
  console.log(e);
}
