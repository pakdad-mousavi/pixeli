import { Hono } from 'hono';

export const createMergeRouter = (projectDir: string) => {
  const mergeRouter = new Hono();

  mergeRouter.get('/', (c) => {
    return c.json({ file: null });
  });

  return mergeRouter;
};
