export default {
  canvas: {
    width: 2400,
    height: 3200,
    columns: 3,
    rows: 6,
  },
  slots: [
    { col: 1, row: 1, colSpan: 2, rowSpan: 2 },
    { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
    { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
    { col: 1, row: 3, colSpan: 1, rowSpan: 2 },
    { col: 2, row: 3, colSpan: 2, rowSpan: 2 },
    { col: 1, row: 5, colSpan: 3, rowSpan: 2 },
  ],
};
