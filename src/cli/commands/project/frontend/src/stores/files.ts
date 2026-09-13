import { progressFetch } from '@/utils/progressFetch';
import { defineStore } from 'pinia';

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    thumbnails: [] as (string | null)[],
    uploadProgresses: [] as number[],
  }),

  actions: {
    async addFiles(files: File[] | FileList) {
      const currentRequestBatch = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        this.files.push(file);

        if (file.size / 1024 / 1024 / 5 < 5) {
          this.thumbnails.push(URL.createObjectURL(file));
        } else {
          this.thumbnails.push(null);
        }
        this.uploadProgresses.push(0);

        const formData = new FormData();
        formData.set('file', file);
        const index = this.uploadProgresses.length - 1;
        currentRequestBatch.push(
          progressFetch('POST', 'http://localhost:3000/file', formData, (progress) => {
            this.uploadProgresses.splice(index, 1, progress);
            console.log('Image at ' + index, progress);
          }),
        );

        const isLastItem = i === files.length - 1;
        if (currentRequestBatch.length - (1 % 5) === 0 || isLastItem) {
          await Promise.all(currentRequestBatch);
          currentRequestBatch.length = 0;
        }
      }
    },

    removeFile(idx: number) {
      if (idx < 0 || idx === this.files.length) {
        throw Error('Attempting to remove file at invalid index');
      }

      this.files.splice(idx, 1);
      this.uploadProgresses.splice(idx, 1);
      const fileUrl = this.thumbnails.splice(idx, 1)[0];

      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    },

    removeAllFiles() {
      this.files.length = 0;
      this.thumbnails.length = 0;
      this.uploadProgresses.length = 0;

      for (const fileUrl of this.thumbnails) {
        if (fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
      }
    },
  },
});
