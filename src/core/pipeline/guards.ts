import { MergeError } from '../mergeError.js';
import type { MergeContext } from './mergePipeline.js';

export function requireState<TState, K extends keyof TState>(
  context: MergeContext<TState>,
  key: K
): asserts context is MergeContext<TState & Required<Pick<TState, K>>> {
  if (context.state[key] === undefined) {
    throw new MergeError(`State "${String(key)}" was not initialized`, { type: 'internal' });
  }
}
