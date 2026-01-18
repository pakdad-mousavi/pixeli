// Merges
import * as mergeFunctions from '../merges/index.js';
import type * as mergeFunctionOptions from '../merges/index.js';

// Errors
import { MergeError } from '../mergeError.js';
import { MESSAGES } from '../modules/messages.js';

// Other
import { TypedEventEmitter } from '../modules/typedEventEmitter.js';
import { mergeJobSchema } from '../schemas/mergeJob.js';
import type { BatchOptions, MergeJob } from './types.js';
import type z from 'zod';

// Define the result of a merge
type MergeResult =
  | {
      index: number;
      success: true;
      buffer: Buffer;
    }
  | {
      index: number;
      success: false;
      error: MergeError;
    };

// Define all batch events
export interface BatchEvents {
  start: {
    totalJobs: number;
  };

  'job:start': {
    job: MergeJob;
    index: number;
  };

  'job:complete': {
    job: MergeJob;
    index: number;
    buffer: Buffer;
  };

  'job:error': {
    job: MergeJob;
    index: number;
    error: MergeError;
  };

  complete: {
    results: MergeResult[];
  };
}

export class BatchRunner extends TypedEventEmitter<BatchEvents> {
  private results: MergeResult[] = [];
  private validatedJobs: z.infer<typeof mergeJobSchema>[] = [];

  constructor(private jobs: MergeJob[]) {
    super();

    // Ensure all jobs are valid
    for (const job of jobs) {
      const validatedJob = this.validateJob(job);
      this.validatedJobs.push(validatedJob);
    }
  }

  async run(options: BatchOptions = {}) {
    const { stopOnError = false } = options;

    // Run jobs
    for (let i = 0; i < this.validatedJobs.length; i++) {
      const job = this.validatedJobs[i]!;

      try {
        // Emit job start event
        this.emit('job:start', {
          index: i,
          job: this.jobs[i]!,
        });

        // Run job
        const buffer = await this.runJob(job);

        // Emit job completion event
        this.emit('job:complete', {
          index: i,
          job: this.jobs[i]!,
          buffer,
        });

        this.results.push({ index: i, success: true, buffer: buffer });
      } catch (error) {
        // Emit job error event
        this.emit('job:error', {
          index: i,
          job: this.jobs[i]!,
          error: error as MergeError,
        });

        // Throw error if needed
        if (stopOnError) throw error;

        // Store error for later
        this.results.push({ index: i, success: false, error: error as MergeError });
      }
    }

    // Emit batch job completion event
    this.emit('complete', {
      results: this.results,
    });

    return this.results;
  }

  private async runJob(job: z.infer<typeof mergeJobSchema>) {
    // Run job and return resulting buffer
    switch (job.type) {
      case 'grid':
        return mergeFunctions.gridMerge(job.inputs, job.options as mergeFunctionOptions.GridMergeOptions);
      case 'masonry':
        return mergeFunctions.masonryMerge(job.inputs, job.options as mergeFunctionOptions.MasonryMergeOptions);
      case 'collage':
        return mergeFunctions.collageMerge(job.inputs, job.options as mergeFunctionOptions.CollageMergeOptions);
      case 'template':
        return mergeFunctions.templateMerge(job.inputs, job.options as mergeFunctionOptions.TemplateMergeOptions);
    }
  }

  private validateJob(job: MergeJob) {
    // Validate job format
    const { success, data, error } = mergeJobSchema.safeParse(job);
    if (!success) {
      const path = error.issues[0]?.path;
      const err = error.issues[0]?.message;
      if (!path || !err) {
        throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: error });
      }
      const errorText = path.length > 0 ? `Invalid value at ${path.join('/')}: ${err}` : `Error: ${err}`;
      throw new MergeError(errorText, { type: 'validation' });
    }

    return data;
  }
}
