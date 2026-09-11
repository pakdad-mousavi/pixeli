import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';

const app = new Hono();
app.use(cors());

app.post(
  '/upload',
  bodyLimit({
    maxSize: 1000 * 1024 * 1024,
  }),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!(file instanceof File)) {
      return c.text('File is required', 400);
    }

    return c.json({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  },
);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
