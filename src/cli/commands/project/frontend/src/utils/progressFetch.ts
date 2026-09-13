import { useDebounceFn } from '@vueuse/core';

export const progressFetch = async (
  method: string,
  url: string | URL,
  data: Document | XMLHttpRequestBodyInit,
  onProgress: ((progress: number) => void) | null = null,
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Listen to the upload progress event
    if (onProgress) {
      const update = useDebounceFn(
        (progress: number) => {
          requestAnimationFrame(() => onProgress(progress));
        },
        50,
        { maxWait: 50 },
      );

      let previousProgress = 0;
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          if ((previousProgress !== progress && progress - previousProgress >= 5) || progress === 100) {
            update(progress);
            previousProgress = progress;
          }
        }
      });
    }

    xhr.open(method, url, true);

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        console.log('xhr.status', xhr.status);
        reject(Error(xhr.responseText));
      }
    };

    xhr.send(data);
  });
};
