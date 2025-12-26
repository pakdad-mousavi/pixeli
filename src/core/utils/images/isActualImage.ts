import sharp from 'sharp';

export const isActualImage = async (input: sharp.SharpInput): Promise<{ isImage: boolean; reason: string }> => {
  try {
    // Try to get metadata
    const metadata = await sharp(input).metadata();

    // Try to get width and height
    /* v8 ignore start */
    if (!metadata.width || !metadata.height) {
      return {
        isImage: false,
        reason: 'Image metadata missing width or height',
      };
    }
    /* v8 ignore stop */
  } catch (err) {
    return {
      isImage: false,
      reason: (err as Error).message,
    };
  }
  return {
    isImage: true,
    reason: '',
  };
};
