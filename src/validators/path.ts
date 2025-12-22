import { stat } from 'node:fs/promises';
import z from 'zod';

export const filePathValidator = z.string().refine(
  async (path) => {
    try {
      return (await stat(path)).isFile();
    } catch {
      return false;
    }
  },
  { error: 'File path does not exist or is invalid.' }
);

export const dirPathValidator = z.string().refine(
  async (path) => {
    try {
      return (await stat(path)).isDirectory();
    } catch {
      return false;
    }
  },
  { error: 'Directory path does not exist or is invalid.', abort: true }
);
