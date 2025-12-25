import { escapeXML } from '../../helpers.js';

interface CreateSvgTextBufferOptions {
  text: string;
  maxWidth: number;
  maxHeight: number;
  fontSize: number;
  fill?: string;
}

export const createSvgTextBuffer = ({ text, maxWidth, maxHeight, fontSize, fill = '#000000' }: CreateSvgTextBufferOptions) => {
  // Width and viewport are assigned to this svg
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${maxWidth}" height="${maxHeight}"
         viewBox="0 0 ${maxWidth} ${maxHeight}">
      <text
        x="${maxWidth / 2}"
        y="${maxHeight / 2}"
        font-size="${fontSize}"
        font-family="sans-serif"
        fill="${fill}"
        text-anchor="middle"
        dominant-baseline="middle">
        ${escapeXML(text)}
      </text>
    </svg>
    `;

  return Buffer.from(svg);
};
