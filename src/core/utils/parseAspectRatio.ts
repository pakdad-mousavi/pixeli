export const parseAspectRatio = (aspectRatio: string): number | false => {
  // return ratio straight away if its just a number
  const ratio = Number(aspectRatio);
  if (ratio) {
    return ratio;
  }

  const ratioRegex = /^\s*(\d+)\s*(\/|:|x)\s*(\d+)\s*$/i;
  const match = aspectRatio.match(ratioRegex);

  // Ensure match exists
  if (!match) return false;

  // Ensures absolute type safety
  const [, wStr, , hStr] = match;
  if (!wStr || !hStr) return false;

  // Return aspect ratio
  const width = parseInt(wStr, 10);
  const height = parseInt(hStr, 10);

  return width / height;
};
