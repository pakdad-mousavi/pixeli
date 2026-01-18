import type sharp from 'sharp';
import type { MergeTypeOptions } from '../merges/types.js';

export type MergeJob = {
  /** File paths to all of the images to load. */
  inputs: sharp.SharpInput[];
} & MergeTypeOptions;

export interface BatchOptions {
  /** Throws a `MergeError` instantly and stops the process if true. */
  stopOnError?: boolean;
}
