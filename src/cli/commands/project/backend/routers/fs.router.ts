import { Hono } from 'hono';
import { loadImages } from '../../../../modules/loadImages.js';
import path from 'node:path';
import sharp from 'sharp';

interface ImageData {
  size: number;
  path: string;
  width: number;
  height: number;
}

export const createFsRouter = (projectDir: string) => {
  const fsRouter = new Hono()
    // Chaining methods for type inference
    .get('/', async (c) => {
      const {
        images: buffers,
        imagePaths,
        ignoredPaths,
      } = await loadImages({
        input: { dir: projectDir, files: undefined },
        recursive: true,
      });

      const images = buffers.map(async (buff, index): Promise<ImageData> => {
        const { width, height } = await sharp(buff, { limitInputPixels: false }).metadata();
        const relativePath = path.relative(projectDir, imagePaths[index]!);

        return { size: buff.length, path: relativePath, width, height };
      });

      return c.json({ images: await Promise.all(images), ignoredPaths }, 200);
    })
    .get('/preview', async (c) => {
      const filePath = c.req.query('path');
      const absolutePath = path.resolve(projectDir, filePath!);
      const buffer = await sharp(absolutePath, { limitInputPixels: false }).resize(256).toBuffer();

      return new Response(buffer, { headers: { 'Content-Type': 'image/jpeg' } });
    });

  return fsRouter;
};
