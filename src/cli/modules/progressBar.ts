import { MultiBar, SingleBar } from 'cli-progress';
import chalk from 'chalk';
import type { ProgressInfo } from '../../core/merges/types.js';
import type { PhaseProgress } from '../../core/modules/progressTracker.js';
import { objectKeys } from '../../core/helpers.js';

const title = chalk.gray('Creating Image:');
const bar = chalk.blue('{bar}');
const percentage = chalk.yellow('{percentage}%');
const eta = chalk.blue('ETA: ') + chalk.yellow('{eta_formatted}');
const phase = chalk.gray('{phase}...');
const divider = chalk.blue('|');

// {
//   'Loading images': { initialized: true, total: 16, completed: 0 },
//   'Resizing images': { initialized: false, completed: 0 },
//   'Rounding images': { initialized: false, completed: 0 },
//   'Bordering images': { initialized: false, completed: 0 },
//   'Merging images': { initialized: false, completed: 0 },
//   'Writing to buffer': { initialized: false, completed: 0 }
// }

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

export class MergeProgressBarV2<TPhase extends string> {
  private multibar: MultiBar | null = null;
  private bars: Partial<Record<TPhase, SingleBar>> = {};
  private phaseProgress: Record<TPhase, number> = {} as Record<TPhase, number>;
  private phaseTotals: Record<TPhase, number> = {} as Record<TPhase, number>;

  constructor() {}

  initializeBar(phases: Record<TPhase, PhaseProgress>) {
    this.multibar = new MultiBar({
      format: `${title} ${divider}${bar}${divider} ${percentage} ${divider} ${eta} ${divider} ${phase}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      stopOnComplete: true,
      barsize: 40,
      etaBuffer: 50,
    });

    for (const phase of objectKeys(phases)) {
      const total = phases[phase].total ?? 1;
      this.phaseTotals[phase] = total;
      this.phaseProgress[phase] = 0;

      const bar = this.multibar.create(100, 0, { phase });
      this.bars[phase] = bar;
    }
  }

  updatePhaseProgress(phase: TPhase, completed: number) {
    const bar = this.bars[phase];
    if (!bar) return;

    const delta = completed - (this.phaseProgress[phase] ?? 0);
    if (delta > 0) {
      const value = Math.floor((completed / (this.phaseTotals[phase] ?? 1)) * 100);
      bar.update(value);
      this.phaseProgress[phase] = completed;
    }
  }

  updateAll(phases: Record<TPhase, PhaseProgress>) {
    for (const phase of objectKeys(phases)) {
      const progress = phases[phase];
      if (progress.initialized) {
        this.updatePhaseProgress(phase, progress.completed);
      }
    }
  }

  stopAllBars() {
    this.multibar?.stop();
  }
}

// const multibar = new MultiBar({
//   format: `${title} ${divider}${bar}${divider} ${percentage} ${divider} ${eta} ${divider} ${phase} `,
//   barCompleteChar: '\u2588',
//   barIncompleteChar: '\u2591',
//   stopOnComplete: true,
//   barsize: 40,
//   etaBuffer: 50,
// });

// const bar1 = multibar.create(100, 0, { phase: 'foo' });
// const bar2 = multibar.create(100, 0, { phase: 'bar' });
