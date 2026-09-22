export const capitalize = (text: string) => {
  const parts = text.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.join(' ');
};
