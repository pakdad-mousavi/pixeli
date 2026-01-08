import { MergeError } from '../mergeError.js';
import type { MergeContext } from './mergePipeline.js';

// |-------------------|
// | Structural Guards |
// |-------------------|
export function requireState<TState, K extends keyof TState>(
  context: MergeContext<TState>,
  key: K
): asserts context is MergeContext<TState & Required<Pick<TState, K>>> {
  if (context.state[key] === undefined) {
    throw new MergeError(`State "${String(key)}" was not initialized`, { type: 'internal' });
  }
}

export function requireContextProp<TState, K extends keyof MergeContext<TState>>(
  context: MergeContext<TState>,
  key: K
): asserts context is MergeContext<TState> & Required<Pick<MergeContext<TState>, K>> {
  const value = context[key];
  if (value === undefined) {
    throw new MergeError(`Context "${String(key)}" was not initialized`, { type: 'internal' });
  }
}

// |------------------|
// | Invariant Guards |
// |------------------|
export function requireNonEmptyArray<T>(arr: readonly T[], name = 'Array'): asserts arr is readonly [T, ...T[]] {
  if (arr.length === 0) {
    throw new MergeError(`"${name}" must not be empty`, { type: 'internal' });
  }
}
