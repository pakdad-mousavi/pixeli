import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const cliProjectSchema = z.strictObject({
  dir: VALIDATORS.dir.optional().default('./'),
});
