import readline from 'node:readline';
import chalk from 'chalk';
import { formatString } from '../../cli/utils/stringFormatter.js';

interface Message {
  message: string;
  chalk?: (text: string) => string;
}

export const MESSAGES = {
  WARNINGS: {
    IGNORED_FILES: {
      message: '{0}\nThe following files will be ignored. Proceed?',
      chalk: chalk.yellow,
    },
  },
  SUCCESS: {
    OUTPUT: {
      message: 'Image created at {0}.',
      chalk: chalk.blue,
    },
  },
  ERROR: {
    INTERNAL: {
      message: 'An internal error has occurred.',
      chalk: chalk.red,
    },
  },
};

export class MessageRenderer {
  #formattedMessage: string;
  #message: Message;

  constructor(public message: Message, ...inputs: (string | number)[]) {
    this.#message = message;

    const base = formatString(message.message, ...inputs);
    this.#formattedMessage = message.chalk ? message.chalk(base) : base;
  }

  render() {
    console.log(this.#formattedMessage);
  }

  confirm(defaultAnswer: boolean = true) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const options = defaultAnswer ? '(Y/n)' : '(y/N)';
    const question = this.#message.chalk
      ? `${this.#formattedMessage} ${this.#message.chalk(options)} `
      : `${this.#formattedMessage} ${options} `;

    return new Promise<boolean>((resolve) => {
      rl.question(question, (value) => {
        const cleanedValue = value.toLowerCase().trim();
        resolve((!cleanedValue.length && !!defaultAnswer) || cleanedValue === 'y');
        rl.close();
      });
    });
  }
}
