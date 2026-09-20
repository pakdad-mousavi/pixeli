import { defineStore } from 'pinia';
import type { AppType } from '../../../backend';
import { hc } from 'hono/client';

const client = hc<AppType>('/');

interface Image {
  size: number;
  path: string;
  width: number;
  height: number;
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    images: new Map() as Map<string, Image>,
    ignoredPaths: [] as string[],
    isLoaded: false,
  }),

  getters: {
    formattedImages: (state) => {
      const formatted = [];
      for (const image of state.images.values()) {
        const { path, ...rest } = image;
        const sections = path.replace(/\\/g, '/').split('/');
        const name = sections.pop()!;
        formatted.push({
          sections,
          name,
          path,
          ...rest,
        });
      }

      return formatted;
    },
  },

  actions: {
    async loadFiles() {
      this.isLoaded = false;
      try {
        const res = await client.fs.$get();
        const data = await res.json();
        console.log(data);

        for (const image of data.images) {
          this.images.set(image.path, image);
        }
        this.ignoredPaths = data.ignoredPaths;

        this.isLoaded = true;
      } catch (e) {
        console.log('xxx');
        console.log(e);
      }
    },

    removeFile(path: string) {
      this.images.delete(path);
    },

    removeAllFiles() {
      this.images.clear();
    },
  },
});
