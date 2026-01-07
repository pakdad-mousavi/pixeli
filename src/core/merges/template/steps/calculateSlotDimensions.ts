import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { Template } from '../types.js';
import type { TemplateState } from '../index.js';

interface Options {
  gap: number;
  template: Template;
}

export const calculateCanvasDimensions: MergeStep<Options, TemplateState> = async (context, options, _onProgress) => {
  // Calculate each column's width and height
  const workableCanvasWidth = options.template.canvas.width - options.gap * (options.template.canvas.columns + 1);
  const workableCanvasHeight = options.template.canvas.height - options.gap * (options.template.canvas.rows + 1);
  const slotWidth = workableCanvasWidth / options.template.canvas.columns;
  const slotHeight = workableCanvasHeight / options.template.canvas.rows;

  // Assign to state
  context.state.canvasWidth = options.template.canvas.width;
  context.state.canvasHeight = options.template.canvas.height;
  context.state.slotWidth = slotWidth;
  context.state.slotHeight = slotHeight;
};
