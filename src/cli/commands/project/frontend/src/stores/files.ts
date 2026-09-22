import { defineStore } from 'pinia';
import type { AppType } from '../../../backend';
import { hc } from 'hono/client';
import type { FileSettings } from '@/types';
import { toRaw } from 'vue';

const client = hc<AppType>('/');

interface Image {
  size: number;
  path: string;
  width: number;
  height: number;
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    settings: {} as FileSettings,
    paths: new Set<string>(),
    images: new Map<string, Image>(),
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
    updateSettings(settings: FileSettings) {
      this.settings = settings;
    },

    async loadFiles(settings?: FileSettings) {
      // Update settings if needed and begin loading
      if (settings) this.updateSettings(settings);
      this.isLoaded = false;

      try {
        const res = await client.fs.$get();
        const data = await res.json();

        const newPaths = new Set(data.images.map((i) => i.path));
        console.log(newPaths);
        const pathsToRemove = toRaw(this.paths).difference(newPaths);
        console.log('weijhgfwekjhgfwhk');

        data.images.forEach((image) => this.images.set(image.path, image));
        pathsToRemove.forEach((path) => this.images.delete(path));

        this.paths = newPaths;
        this.ignoredPaths = data.ignoredPaths;
        this.isLoaded = true;
      } catch (e) {
        console.log('xxx');
        console.log(e);
      }
    },

    removeAllFiles() {
      this.images.clear();
    },
  },
});
