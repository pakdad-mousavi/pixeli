import { defineStore } from 'pinia';

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
  }),

  getters: {
    files: (state) => state.files,
  },

  actions: {
    addFiles(files: File[]) {
      this.files.push(...files);
    },

    removeFile(idx: number) {
      this.files.splice(idx, 1);
    },

    removeAllFiles() {
      this.files.length = 0;
    },
  },
});
