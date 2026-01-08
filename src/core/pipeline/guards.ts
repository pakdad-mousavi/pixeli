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

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export function requireContextProp<TState, K extends OptionalKeys<MergeContext<TState>>>(
  context: MergeContext<TState>,
  key: K
): asserts context is MergeContext<TState> & Required<Pick<MergeContext<TState>, K>> {
  const value = context[key];
  if (value === undefined) {
    throw new MergeError(`Context "${String(key)}" was not initialized`, { type: 'internal' });
  }
}
