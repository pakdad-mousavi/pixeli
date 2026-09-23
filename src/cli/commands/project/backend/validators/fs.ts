import z from 'zod';

export const fsGetQuerySchema = z.object({
  recursive: z.enum(['true', 'false']),
});

export const fsPreviewGetQuerySchema = z.object({
  path: z.string(),
  size: z.coerce.number().default(256),
});
