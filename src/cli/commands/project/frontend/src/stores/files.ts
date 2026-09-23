import { defineStore } from "pinia";
import type { AppType } from "../../../backend";
import { hc } from "hono/client";
import { toRaw } from "vue";

const client = hc<AppType>("/");

interface Image {
  size: number;
  path: string;
  width: number;
  height: number;
}

export const useFilesStore = defineStore("files", {
  state: () => ({
    // LOADED STATE
    paths: new Set<string>(),
    images: new Map<string, Image>(),
    ignoredPaths: [] as string[],
    isLoaded: false,

    // IMAGE SELECTION
    selected: new Set<string>(),
  }),

  getters: {
    formattedImages: (state) => {
      const formatted = [];
      for (const image of state.images.values()) {
        const { path, ...rest } = image;
        const sections = path.replace(/\\/g, "/").split("/");
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
    // ---------
    //   FILES
    // ---------
    async loadFiles(recursive: boolean) {
      // Update settings if needed and begin loading
      this.isLoaded = false;

      try {
        const res = await client.fs.$get({
          query: {
            recursive: `${recursive}`,
          },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        const data = await res.json();

        const newPaths = new Set(data.images.map((i) => i.path));
        const pathsToRemove = toRaw(this.paths).difference(newPaths);

        data.images.forEach((image) => this.images.set(image.path, image));
        pathsToRemove.forEach((path) => {
          this.images.delete(path);
          this.selected.delete(path);
        });

        this.paths = newPaths;
        this.ignoredPaths = data.ignoredPaths;
        this.isLoaded = true;
      } catch (e) {
        console.log("xxx");
        console.log(e);
      }
    },

    removeAllFiles() {
      this.images.clear();
    },

    // ---------------------
    //    IMAGE SELECTION
    // ---------------------
    toggleImageSelection(path: string) {
      if (this.selected.has(path)) return this.selected.delete(path);
      this.selected.add(path);
    },

    selectAll() {
      this.paths.forEach((p) => this.selected.add(p));
    },

    deselectAll() {
      this.selected.clear();
    },
  },
});
