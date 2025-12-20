export const formatString = (str: string, ...args: (string | number)[]): string => {
  return str.replace(/{(\d+)}/g, (m, i) => (args[Number(i)] !== undefined ? String(args[Number(i)]) : m));
};
