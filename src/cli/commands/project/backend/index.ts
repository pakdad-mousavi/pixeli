import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';

import * as routers from './routers/index.js';
import type { AddressInfo } from 'node:net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Hono();

export const serveApp = (projectDir: string, cb: ((info: AddressInfo) => void) | null = null, port: number | null = null) => {
  // Serve frontend build
  app.use('/*', serveStatic({ root: path.join(__dirname, 'dist') }));
  app.get('*', serveStatic({ path: path.join(__dirname, 'dist/index.html') }));

  // Routes
  app.route('/fs', routers.createFsRouter(projectDir));
  app.route('/merge', routers.createMergeRouter(projectDir));

  // Serve

  // For specific ports (not required during build)
  if (port) {
    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => (cb ? cb(info) : console.log(`Project running at: http://localhost:${info.port}`)),
    );
    return;
  }

  serve(app, (info) => (cb ? cb(info) : console.log(`Project running at: http://localhost:${port}`)));
};

export type AppType = typeof app;
