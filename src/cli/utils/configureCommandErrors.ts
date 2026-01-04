import type { Command } from 'commander';
import { MessageRenderer } from '../../core/modules/messages.js';
import chalk from 'chalk';

export const configureCommandErrors = (cmd: Command) => {
  // Configure error message for the current command
  cmd.configureOutput({
    writeErr: (str) => {
      if (str.includes('error:')) {
        const errorMessage = {
          message: str.trim().replace('error', 'Error'),
          chalk: chalk.red,
        };

        const error = new MessageRenderer(errorMessage);
        return error.render();
      }

      process.stderr.write(str);
    },
  });

  // Recursively configure error messages for all subcommands
  for (const subCmd of cmd.commands) {
    configureCommandErrors(subCmd);
  }
};
