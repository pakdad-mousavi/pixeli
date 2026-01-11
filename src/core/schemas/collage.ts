import z from 'zod';
import { VALIDATORS } from '../../validators/index.js';

export const collageSchema = z.strictObject({
  shuffle: VALIDATORS.shuffle.default(false),
  cornerRadius: VALIDATORS.cornerRadius.default(0),
  gap: VALIDATORS.gap.default(50),
  canvasColor: VALIDATORS.canvasColor.prefault('#fff'),
  format: VALIDATORS.format.default('png'),
  aspectRatio: VALIDATORS.aspectRatio.prefault('1:1'),
  imageWidth: VALIDATORS.imageWidth.optional(),
  columns: VALIDATORS.columns.default(4),
  overlapPercentage: VALIDATORS.overlapPercentage.default(10),
  rotationDegree: VALIDATORS.overlapPercentage.default(13),
  imageWidthVariation: VALIDATORS.imageWidthVariation.default(20),
});
