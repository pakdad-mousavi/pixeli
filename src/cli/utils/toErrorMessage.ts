import z from 'zod';
import chalk from 'chalk';

import { MESSAGES } from '../../core/modules/messages.js';
import { MergeError } from '../../core/mergeError.js';

export const toErrorMessage = (err: unknown) => {
  let errorMessage = MESSAGES.ERROR.INTERNAL;

  // Schema errors
  if (err instanceof z.ZodError) {
    errorMessage = {
      message: z.prettifyError(err),
      chalk: chalk.red,
    };
  }

  // Merge errors
  if (err instanceof MergeError) {
    errorMessage = {
      message: err.message,
      chalk: chalk.red,
    };
  }

  return errorMessage;
};
