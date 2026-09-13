import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const frontendDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(frontendDir, '../../../../../');

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist/cli/commands/project/backend/dist'),
    emptyOutDir: true,
  },
});
