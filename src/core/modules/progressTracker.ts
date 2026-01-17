import type { ProgressInfo, ProgressLifecycle } from '../merges/types.js';

export type PhaseProgress =
  | {
      /** Whether progress has been made in this phase or not. */
      initialized: true;

      /** The total number of processes to be completed. */
      total: number;

      /** How many processes have been completed so far. */
      completed: number;
    }
  | {
      /** Whether progress has been made in this phase or not. */
      initialized: false;

      /** The total number of processes to be completed. */
      total?: never;

      /** How many processes have been completed so far. */
      completed: number;
    };

export class ProgressTracker<TPhase extends string> {
  private phases: Record<TPhase, PhaseProgress> = Object.create({});

  constructor(phases: readonly TPhase[]) {
    // Initialize phases
    for (const phase of phases) {
      this.phases[phase] = {
        initialized: false,
        completed: 0,
      };
    }
  }

  private getAllPhases() {
    return { ...this.phases };
  }

  private getOverallProgress(): { completed: number; total: number; percent: number | null } {
    let completed = 0;
    let total = 0;
    const allPhases = this.getAllPhases();

    for (const phaseProgress of Object.values<PhaseProgress>(allPhases)) {
      if (!phaseProgress.initialized) continue;

      completed += phaseProgress.completed;
      total += phaseProgress.total;
    }

    return {
      completed,
      total,
      percent: total > 0 ? completed / total : null,
    };
  }

  setTotal(phase: TPhase, total: number): PhaseProgress {
    this.ensurePhaseExists(phase);
    const prev = this.phases[phase];

    if (prev.initialized && prev.completed > total) {
      throw new Error(`Total cannot be less than completed for phase "${phase}".`);
    }

    this.phases[phase] = {
      initialized: true,
      total,
      completed: prev.completed,
    };

    return this.phases[phase];
  }

  incrementProgress(phase: TPhase, delta = 1): PhaseProgress {
    this.ensurePhaseExists(phase);
    const current = this.phases[phase];

    if (!current.initialized) {
      throw new Error(`Cannot increment progress for phase "${phase}" before setting total.`);
    }

    // Increment but don’t exceed total
    const completed = Math.min(current.completed + delta, current.total);

    const updated: PhaseProgress = {
      ...current,
      completed,
    };

    this.phases[phase] = updated;

    return updated;
  }

  getProgressInfo(progressLifecycle: ProgressLifecycle = 'update'): ProgressInfo<TPhase> {
    return {
      progressLifecycle,
      phases: this.getAllPhases(),
      overall: this.getOverallProgress(),
    };
  }

  updateAll(phases: Record<TPhase, PhaseProgress>) {
    for (const phase of Object.keys(phases) as TPhase[]) {
      const progress = phases[phase];
      if (progress.initialized) {
        const delta = progress.completed - (this.getCurrentProgress(phase) ?? 0);
        this.updatePhaseProgress(phase, delta);
      }
    }
  }

  private ensurePhaseExists(phase: string) {
    if (!(phase in this.phases)) {
      throw new Error(`"${phase}" does not exist in "${Object.keys(this.phases)}"`);
    }
  }
}
