export const traverseFileTree = (entry: FileSystemEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    // If the entry is a single file, resolve immediately
    if (entry.isFile) {
      (entry as FileSystemFileEntry).file((file) => {
        resolve([file]);
      });
    }

    // If the entry is a directory, recursively resolve subdirectories
    if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      dirReader.readEntries(async (entries) => {
        const subfiles = [];
        for (const subEntry of entries) {
          subfiles.push(await traverseFileTree(subEntry));
        }
        resolve(subfiles.flat());
      });
    }
  });
};
