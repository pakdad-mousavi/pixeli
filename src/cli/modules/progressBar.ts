import { SingleBar } from 'cli-progress';
import chalk from 'chalk';
import type { ProgressInfo } from '../../core/merges/types.js';

const title = chalk.gray('Creating Image:');
const bar = chalk.blue('{bar}');
const percentage = chalk.yellow('{percentage}%');
const eta = chalk.blue('ETA: ') + chalk.yellow('{eta_formatted}');
const phase = chalk.gray('{phase}...');
const divider = chalk.blue('|');

export class MergeProgressBar {
  #PROCESSING_WEIGHT = 0.95;

  public progressBar: SingleBar;

  constructor() {
    // Initialize progress bar
    this.progressBar = new SingleBar({
      format: `${title} ${divider}${bar}${divider} ${percentage} ${divider} ${eta} ${divider} ${phase} `,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      stopOnComplete: true,
      barsize: 40,
      etaBuffer: 50,
    });
  }

  startBar(phase: string) {
    this.progressBar.start(100, 0, { phase });
  }

  updateBar(progressInfo: ProgressInfo) {
    const processing = progressInfo.completed / progressInfo.total;
    const progress = processing * this.#PROCESSING_WEIGHT;

    this.progressBar.update(progress * 100, { phase: processing === 1 ? 'Writing to file' : progressInfo.phase });
  }

  endBar() {
    this.progressBar.update(100);
  }
}
