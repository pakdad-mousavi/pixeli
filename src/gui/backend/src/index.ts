import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { saveFile } from './utils/writeFile.js';
import { HonoResponse } from './utils/HonoResponse.js';

const app = new Hono();
app.use(cors());

app.post(
  '/file',
  bodyLimit({
    maxSize: 1000 * 1024 * 1024,
  }),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!(file instanceof File)) {
      return c.text('File is required', 400);
    }

    const writeResult = await saveFile(file);
    let response;
    if (writeResult.success) {
      response = new HonoResponse({
        success: writeResult.success,
        message: `Successfully uploaded ${file.name}.`,
        payload: {
          path: writeResult.path,
        },
      });
    } else {
      response = new HonoResponse({
        success: writeResult.success,
        message: `Could not upload ${file.name}.`,
        payload: {
          error: writeResult.error,
        },
      });
    }

    return c.json(response);
  },
);

app.delete('/file', (c) => {
  return c.json({ success: true });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
