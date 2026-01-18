import z from 'zod';

export const mergeJobSchema = z.strictObject({
  type: z.enum(['grid', 'masonry', 'collage', 'template']),
  inputs: z.array(z.string()).min(1),
  options: z.record(z.string(), z.any()).optional(),
});
