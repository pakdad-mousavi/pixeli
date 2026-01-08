import type { MergeStep } from '../../../pipeline/mergePipeline.js';
import type { MasonryState } from '../index.js';

import { trimmedMedian } from '../../../utils/math/trimmedMedian.js';
import { getImageWidths } from '../../../utils/images/getImageWidths.js';
import { getImageHeights } from '../../../utils/images/getImageHeights.js';

import { MESSAGES } from '../../../modules/messages.js';
import { MergeError } from '../../../mergeError.js';
import { requireNonEmptyArray } from '../../../pipeline/guards.js';

interface Options {
  rowHeight?: number | undefined;
  columnWidth?: number | undefined;
  flow: 'horizontal' | 'vertical';
}

export const calculateLaneSize: MergeStep<Options, MasonryState> = async (context, options, _onProgress) => {
  requireNonEmptyArray(context.images, 'images');

  if (options.flow === 'horizontal') {
    // Calculate rowHeight
    const rowHeight = options.rowHeight || trimmedMedian(await getImageHeights(context.images));
    if (rowHeight === null) {
      throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: 'trimmedMedian failed' });
    }

    // Set rowHeight
    context.state.rowHeight = rowHeight;
  } else {
    // Calculate columnWidth
    const columnWidth = options.columnWidth || trimmedMedian(await getImageWidths(context.images));
    if (columnWidth === null) {
      throw new MergeError(MESSAGES.ERROR.INTERNAL.message, { type: 'internal', cause: 'trimmedMedian failed' });
    }

    // Set columnWidth
    context.state.columnWidth = columnWidth;
  }
};
