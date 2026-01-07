export interface Canvas {
  width: number;
  height: number;
  columns: number;
  rows: number;
}

export interface Slot {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface Template {
  canvas: Canvas;
  slots: Slot[];
}

export interface Block {
  imageBuffer: Buffer;
  col: number;
  row: number;
}
