import path from 'node:path';
import sharp from 'sharp';

import { Hono } from 'hono';

import { loadImages } from '../../../../modules/loadImages.js';
import { zValidator } from '@hono/zod-validator';
import { fsGetQuerySchema, fsPreviewGetQuerySchema } from '../validators/fs.js';

interface ImageData {
  size: number;
  path: string;
  width: number;
  height: number;
}

export const createFsRouter = (projectDir: string) => {
  const fsRouter = new Hono()
    // Chaining methods for type inference
    .get(
      '/',
      zValidator('query', fsGetQuerySchema, (result, c) => {
        if (!result.success) {
          const currentIssue = result.error.issues[0]!;
          return c.json({ error: currentIssue.message, at: currentIssue.path.join('.') }, 400);
        }
      }),
      async (c) => {
        const params = c.req.valid('query');

        const {
          images: buffers,
          imagePaths,
          ignoredPaths,
        } = await loadImages({
          input: { dir: projectDir, files: undefined },
          recursive: params.recursive === 'true',
        });

        const images = buffers.map(async (buff, index): Promise<ImageData> => {
          const { width, height } = await sharp(buff, { limitInputPixels: false }).metadata();
          const relativePath = path.relative(projectDir, imagePaths[index]!);

          return { size: buff.length, path: relativePath, width, height };
        });

        return c.json({ images: await Promise.all(images), ignoredPaths }, 200);
      },
    )
    .get(
      '/preview',
      zValidator('query', fsPreviewGetQuerySchema, (result, c) => {
        if (!result.success) {
          const currentIssue = result.error.issues[0]!;
          return c.json({ error: currentIssue.message, at: currentIssue.path.join('.') }, 400);
        }
      }),
      async (c) => {
        const { path: filePath, size } = c.req.valid('query');
        const absolutePath = path.resolve(projectDir, filePath!);
        const buffer = await sharp(absolutePath, { limitInputPixels: false }).resize(size).toBuffer();

        return new Response(buffer, { headers: { 'Content-Type': 'image/jpeg' } });
      },
    );

  return fsRouter;
};
