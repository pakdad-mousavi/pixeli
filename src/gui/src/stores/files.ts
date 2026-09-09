import { defineStore } from 'pinia';

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    thumbnails: [] as string[],
  }),

  actions: {
    addFiles(files: File[] | FileList) {
      for (const file of files) {
        this.files.push(file);
        this.thumbnails.push(URL.createObjectURL(file));
      }
    },

    removeFile(idx: number) {
      if (idx < 0 || idx === this.files.length) {
        throw Error('Attempting to remove file at invalid index');
      }

      this.files.splice(idx, 1);
      const fileUrl = this.thumbnails.splice(idx, 1)[0];
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    },

    removeAllFiles() {
      this.files.length = 0;

      for (const fileUrl of this.thumbnails) {
        URL.revokeObjectURL(fileUrl);
      }
      this.thumbnails.length = 0;
    },
  },
});
