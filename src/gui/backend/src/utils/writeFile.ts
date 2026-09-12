import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

interface SaveFile {
  (file: File): Promise<{ success: true; path: string } | { success: false; error: Error }>;
}

export const saveFile: SaveFile = async (file: File) => {
  try {
    // Create 'pixeli' dir in /tmp if it doesn't exist
    const targetDir = path.join(os.tmpdir(), 'pixeli');
    await mkdir(targetDir, { recursive: true });

    // Create random id for file
    const uniqueId = crypto.randomUUID();
    const uniqueFilename = `${uniqueId}-${file.name}`;
    const filepath = path.join(targetDir, uniqueFilename);

    // Write via stream
    const destinationStream = createWriteStream(filepath);
    await pipeline(file.stream(), destinationStream);

    return { success: true, path: filepath };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
