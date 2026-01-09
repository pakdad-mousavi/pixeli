export const SUPPORTED_INPUT_FORMATS = ['webp', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'avif', 'svg'] as const;
export type SupportedInputFormat = (typeof SUPPORTED_INPUT_FORMATS)[number];

export const SUPPORTED_OUTPUT_FORMATS = ['webp', 'gif', 'jpeg', 'jpg', 'png', 'tiff', 'avif'] as const;
export type SupportedOutputFormat = (typeof SUPPORTED_OUTPUT_FORMATS)[number];

export const escapeXML = (str: string) => {
  return str.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      }[c]!)
  );
};

export const shuffleTogether = <T, U>(a: T[], b: U[]): [T[], U[]] => {
  if (a.length !== b.length) {
    throw new Error('Arrays must have the same length');
  }

  const indices = [...a.keys()];
  shuffleArray(indices);

  return [indices.map((i) => a[i]!), indices.map((i) => b[i]!)];
};

export const shuffleArray = <T>(array: T[]) => {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex]!, array[currentIndex]!];
  }

  return array;
};

export const isSupportedInputImage = (extname: string): extname is SupportedInputFormat => {
  return (SUPPORTED_INPUT_FORMATS as readonly string[]).includes(extname);
};

export const isSupportedOutputImage = (extname: string): extname is SupportedOutputFormat => {
  return (SUPPORTED_OUTPUT_FORMATS as readonly string[]).includes(extname);
};

export const isValidHexColor = (hex: string) => {
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  return hexRegex.test(hex);
};
