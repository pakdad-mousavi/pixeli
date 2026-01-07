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
  let filepaths: string[] = [];
  let images: Buffer[] = [];

  // Get all file paths
  if (input.files && input.files.length) {
    filepaths = input.files;
  } else if (hasDir(input)) {
    filepaths = await getFilepathsFromDirectory(input.dir, recursive);
  }

  // Load valid image paths
  const { ignoredPaths, imagePaths } = validateFilepaths(filepaths);
  images = await loadFromFiles(imagePaths, count);

  // Ensure filepaths and images match
  if (images.length !== filepaths.length) {
    filepaths = filepaths.slice(0, images.length);
  }

  return { images, imagePaths, ignoredPaths };
};

export const loadFromFiles = async (files: string[], count: number | undefined) => {
  const loadedFiles = [];
  const total = count || files.length;
  for (let i = 0; i < total; i++) {
    // End the loop if count is higher than number of available files
    if (i >= files.length) break;

    // Load images
    const filepath = files[i]!;
    const file = await fs.readFile(filepath);

    loadedFiles.push(file);
  }

  return loadedFiles;
};

export const getFilepathsFromDirectory = async (dir: string, recursive: boolean, depth = 0): Promise<string[]> => {
  // Ensure recursiveness ends at the max recursion depth
  if (depth >= MAX_RECURSION_DEPTH) return [];

  // Get entries
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(entry.parentPath, entry.name);

    // If the entry is a file, add it to the list
    if (entry.isFile()) {
      files.push(file);
    }
    // If it's a directory AND the recursive option is true,
    // recursively get all the files
    else if (recursive && entry.isDirectory() && !entry.isSymbolicLink()) {
      const dirPath = path.join(entry.parentPath, entry.name);
      const paths = await getFilepathsFromDirectory(dirPath, recursive, depth + 1);
      files.push(...paths);
    }
  }

  return files;
};

const validateFilepaths = (filepaths: string[]) => {
  const ignoredPaths = [];
  const imagePaths = [];

  for (const filepath of filepaths) {
    if (path.basename(filepath) === '.DS_Store') continue;

    const extname = path.extname(filepath).replace('.', '');
    isSupportedInputImage(extname) ? imagePaths.push(filepath) : ignoredPaths.push(filepath);
  }

  return { ignoredPaths, imagePaths };
};
