import sharp from 'sharp';
import type z from 'zod';
import { MergeError } from '../mergeError.js';
import { MESSAGES } from '../modules/messages.js';
import type { OnProgress, ProgressInfo } from '../merges/types.js';
import chalk from 'chalk';

export interface MergeContext<TState> {
  inputs: sharp.SharpInput[];
  progressInfo: ProgressInfo;
  images: sharp.Sharp[];
  canvas?: sharp.Sharp;
  composites: sharp.OverlayOptions[];
  captions: string[];
  state: TState;
}

export type MergeStep<TOptions, TState> = (
  context: MergeContext<TState>,
  options: TOptions,
  onProgress?: OnProgress
) => Promise<Buffer | void>;

/**
 * Pipeline orchestrator for running a sequence of merge steps that
 * progressively build or modify a final merged image.
 *
 * Generic type parameters:
 * - TOptions: the shape of the validated options object passed to each step.
 * - TState: the shape of the pipeline's runtime state held in MergeContext.
 *
 * The pipeline:
 * - Validates incoming options via a Zod schema (see createPipeline).
 * - Maintains an ordered list of MergeStep functions to execute.
 * - Provides optional progress reporting via an OnProgress callback.
 *
 * Usage:
 * - Create an instance via createPipeline to ensure options are validated and
 *   progressInfo is initialized on the supplied MergeContext.
 * - Register steps with use(...).
 * - Execute with run() — in normal usage this returns a Buffer containing the
 *   final image. When run in "test" mode (testOptions supplied) the pipeline
 *   may perform a dry-run and return void.
 *
 * Errors:
 * - Validation-related errors thrown from createPipeline are surfaced as
 *   MergeError instances with type 'validation' or 'internal'.
 * - During execution, any thrown non-MergeError is converted into a runtime
 *   Error indicating the offending step name.
 *
 * @template TOptions - Validated options shape used by registered steps.
 * @template TState - Context/state shape managed by the pipeline.
 */
export class MergePipeline<TOptions, TState> {
  private steps: MergeStep<TOptions, TState>[] = [];
  private optionsCounter = 0;
  private stateCounter = 0;

  constructor(private options: TOptions, private context: MergeContext<TState>, private onProgress?: OnProgress) {}

  static async createPipeline<TZodSchema extends z.ZodType, TOptions, TState>(
    schema: TZodSchema,
    options: TOptions,
    context: Omit<MergeContext<TState>, 'progressInfo'>,
    onProgress?: OnProgress
  ) {
    const { success, data, error } = await schema.safeParseAsync(options);
    if (success) {
      // Initialize progressInfo
      const progressInfo = {
        completed: 0,
        total: context.inputs.length,
        phase: 'Initializing',
      };

      // Initialize mergeContext
      const mergeContext = {
        ...context,
        progressInfo,
      };

      // Return the pipeline
      return new MergePipeline<typeof data, TState>(data, mergeContext, onProgress);
    } else {
      const path = error.issues[0]?.path;
      const err = error.issues[0]?.message;

      if (!path || !err) {
        throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: error });
      }

      const errorText = path.length > 0 ? `Invalid value at ${path.join('/')}: ${err}` : `Error: ${err}`;
      throw new MergeError(errorText, { type: 'validation' });
    }
  }

  use(step: MergeStep<TOptions, TState>) {
    this.steps.push(step);
    return this;
  }

  async run(): Promise<Buffer>;
  async run(testOptions: { logOptions?: boolean; logContext?: boolean }): Promise<Buffer | void>;

  async run(testOptions?: { logOptions?: boolean; logContext?: boolean }): Promise<Buffer | void> {
    let finalImage: Buffer | undefined;

    if (testOptions) this.logForDebugging(testOptions);

    for (const step of this.steps) {
      // Use a copy of this.options to ensure that merge steps cannot mutate the original
      const result = await step(this.context, { ...this.options }, this.onProgress);
      if (testOptions) this.logForDebugging(testOptions);

      // If the result is a sharp instance, update finalImage
      if (result instanceof Buffer) {
        finalImage = result;
      }
    }

    // If finalImage has a value, return it
    if (finalImage) {
      return finalImage;
    }

    // During a dry run, void returns are allowed (for debugging)
    if (testOptions) {
      return;
    }

    // Normal runs must have a final sharp image produced.
    throw new Error('No merge step produced a final Sharp image.');
  }

  private logForDebugging(testOptions: { logOptions?: boolean; logContext?: boolean }) {
    if (testOptions.logOptions) {
      // Log
      console.log(chalk.bgBlueBright(` OPTIONS ${this.optionsCounter++}: `));
      console.log(this.options);
    }

    // Whitespace
    if (testOptions.logOptions && testOptions.logContext) console.log();

    if (testOptions.logContext) {
      // Replace images and inputs with their lengths to make context readable
      const { images, inputs, ...trimmedContext } = this.context;
      const modifiedContext = { totalImages: images.length, totalInputs: inputs.length, ...trimmedContext };

      // Log
      console.log(chalk.bgGreen(` CONTEXT ${this.stateCounter++}: `));
      console.log(modifiedContext);
    }
    console.log();
  }
}
