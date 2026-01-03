import { MergeError } from '../mergeError.js';

export function requireState<TState, K extends keyof TState>(
  state: TState,
  key: K
): asserts state is TState & Required<Pick<TState, K>> {
  if (state[key] === undefined) {
    throw new MergeError(`State "${String(key)}" was not initialized`, { type: 'internal' });
  }
}
