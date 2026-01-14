import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const templateSchema = z
  .strictObject({
    shuffle: VALIDATORS.shuffle.default(false),
    cornerRadius: VALIDATORS.cornerRadius.default(0),
    gap: VALIDATORS.gap.default(50),
    canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
    format: VALIDATORS.format.default('png'),
    template: VALIDATORS.template,
    borderWidth: VALIDATORS.borderWidth.default(0),
    borderColor: VALIDATORS.borderColor.prefault('#000'),
  })
  .superRefine((opts, ctx) => {
    // Ensure canvas is wide enough for at least a single 1px column
    if (opts.template.canvas.width <= opts.gap * 2) {
      ctx.addIssue({
        code: 'custom',
        message: `Canvas width must be greater than ${opts.gap * 2}.`,
        path: ['template', 'canvas', 'width'],
      });
    }

    // Ensure canvas is long enough for at least a single 1px row
    if (opts.template.canvas.height <= opts.gap * 2) {
      ctx.addIssue({
        code: 'custom',
        message: `Canvas height must be greater than ${opts.gap * 2}.`,
        path: ['template', 'canvas', 'height'],
      });
    }

    // Calculate column width and row height
    const workableCanvasWidth = opts.template.canvas.width - opts.gap * (opts.template.canvas.columns + 1);
    const workableCanvasHeight = opts.template.canvas.height - opts.gap * (opts.template.canvas.rows + 1);
    const columnWidth = Math.floor(workableCanvasWidth / opts.template.canvas.columns);
    const rowHeight = Math.floor(workableCanvasHeight / opts.template.canvas.rows);

    // Ensure columns are thick enough
    if (columnWidth <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Columns are too thin. Increase canvas width, reduce gap, or reduce number of columns.`,
        path: ['template', 'canvas', 'columns'],
      });
    }

    // Ensure rows are thick enough
    if (rowHeight <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Rows are too thin. Increase canvas height or reduce number of rows.`,
        path: ['template', 'canvas', 'rows'],
      });
    }

    // For each slot...
    for (let i = 0; i < opts.template.slots.length; i++) {
      const slot = opts.template.slots[i]!;

      // Ensure slot is placed inside given canvas columns
      if (slot.col > opts.template.canvas.columns) {
        ctx.addIssue({
          code: 'custom',
          message: `"col" must be between 1 and ${opts.template.canvas.columns}.`,
          path: ['template', 'slots', i, 'col'],
        });
      }

      // Ensure slot is placed inside given canvas rows
      if (slot.row > opts.template.canvas.rows) {
        ctx.addIssue({
          code: 'custom',
          message: `"row" must be between 1 and ${opts.template.canvas.rows}.`,
          path: ['template', 'slots', i, 'row'],
        });
      }

      // Ensure slot spans within given canvas columns
      if (slot.col + slot.colSpan - 1 > opts.template.canvas.columns) {
        ctx.addIssue({
          code: 'custom',
          message: `slot spans past the right edge of the grid (col + colSpan exceeds columns).`,
          path: ['template', 'slots', i],
        });
      }

      // Ensure slot spans within given canvas rows
      if (slot.row + slot.rowSpan - 1 > opts.template.canvas.rows) {
        ctx.addIssue({
          code: 'custom',
          message: `slot spans past the bottom edge of the grid (row + rowSpan exceeds rows).`,
          path: ['template', 'slots', i],
        });
      }
    }
  });
