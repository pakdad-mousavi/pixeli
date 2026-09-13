import { Hono } from 'hono';

export const createFsRouter = (projectDir: string) => {
  const fsRouter = new Hono();

  fsRouter.get('/', (c) => {
    return c.json({ files: [] });
  });

  return fsRouter;
};
