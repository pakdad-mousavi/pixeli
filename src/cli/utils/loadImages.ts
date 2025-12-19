import fs from 'node:fs/promises';
import path from 'node:path';
import { isSupportedInputImage } from '../../core/helpers.js';

export interface LoadImagesOptions {
  input: {
    files: string[] | undefined;
    dir: string | undefined;
  };
  recursive: boolean;
  count?: number;
}

const MAX_RECURSION_DEPTH = 10;

const hasDir = (input: { dir: string | undefined }): input is { dir: string } => {
  return typeof input.dir === 'string';
};

export const loadImages = async ({ input, recursive, count }: LoadImagesOptions) => {
  let ignoredFiles: string[] = [];
  let filepaths: string[] = [];
  let images: Buffer[] = [];

  if (input.files && input.files.length) {
    // Load directly from provided file list
    filepaths = input.files;
  } else if (hasDir(input)) {
    // Get all files from directory
    const { skippedFiles, paths } = await getFilesFromDirectory(input.dir, recursive);
    filepaths = paths;
    ignoredFiles = skippedFiles;
  }

  images = await loadFromFiles(filepaths, count);

  // Ensure filepaths and images match
  if (images.length !== filepaths.length) {
    filepaths = filepaths.slice(0, images.length);
  }

  return { images, filepaths, ignoredFiles };
};

const loadFromFiles = async (files: string[], count: number | undefined) => {
  const images = [];
  const total = count || files.length;
  for (let i = 0; i < total; i++) {
    // End the loop if count is higher than number of available files
    if (i >= files.length) break;

    // Load images
    const filepath = files[i]!;
    const image = await fs.readFile(filepath);

    images.push(image);
  }

  return images;
};

const getFilesFromDirectory = async (
  dir: string,
  recursive: boolean,
  depth = 0
): Promise<{ paths: string[]; skippedFiles: string[] }> => {
  // Use to collect warnings
  const skippedFiles = [];

  // Ensure recursiveness ends at the max recursion depth
  if (depth >= MAX_RECURSION_DEPTH) return { paths: [], skippedFiles: [] };

  // Get entries
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(entry.parentPath, entry.name);

    // If the entry is a valid image file, add it to the list
    const extname = path.extname(entry.name).replace('.', '');
    if (entry.isFile() && isSupportedInputImage(extname)) {
      files.push(file);
    }
    // If it is an invalid file format, add to skipped files
    else if (entry.isFile() && !isSupportedInputImage(extname) && entry.name !== '.DS_Store') {
      skippedFiles.push(entry.name);
    }
    // If it's a directory AND the recursive option is true,
    // recursively get all the files
    else if (recursive && entry.isDirectory() && !entry.isSymbolicLink()) {
      const dirpath = path.join(entry.parentPath, entry.name);
      const dirObj = await getFilesFromDirectory(dirpath, recursive, depth + 1);
      files.push(...dirObj?.paths);
      skippedFiles.push(...dirObj.skippedFiles);
    }
  }

  return { paths: files, skippedFiles };
};
