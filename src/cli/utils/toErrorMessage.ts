import z from 'zod';
import chalk from 'chalk';

import { MESSAGES } from '../modules/messages.js';
import { MergeError } from '../../core/mergeError.js';

export const toErrorMessage = (err: unknown) => {
  let errorMessage = MESSAGES.ERROR.INTERNAL;

  if (err instanceof z.ZodError && err.issues[0]) {
    const path = err.issues[0].path;
    const issue = err.issues[0].message;
    const errorText = path.length > 0 ? `Invalid value at '${path.join('/')}': ${issue}` : `Error: ${issue}`;

    errorMessage = {
      message: errorText,
      chalk: chalk.red,
    };
  }

  if (err instanceof MergeError) {
    errorMessage = {
      message: err.message,
      chalk: chalk.red,
    };
  }

  return errorMessage;
};
