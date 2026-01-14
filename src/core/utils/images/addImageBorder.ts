import sharp from 'sharp';
import type { RGBA } from '../colors/types.js';

interface Options {
  // Border options
  borderWidth: number;
  borderHeight: number;
  borderColor: RGBA;

  // Image details
  imageWidth: number;
  imageHeight: number;
}

export const addImageBorder = async (image: sharp.Sharp, options: Options) => {
  const background = sharp({
    create: {
      width: options.imageWidth,
      height: options.imageHeight,
      channels: 4,
      background: options.borderColor,
    },
  }).toFormat('png');

  const croppedImage = image.extract({
    top: options.borderWidth,
    left: options.borderHeight,
    width: options.imageWidth - options.borderWidth * 2,
    height: options.imageHeight - options.borderHeight * 2,
  });

  background.composite([
    {
      input: await croppedImage.toBuffer(),
      top: options.borderWidth,
      left: options.borderHeight,
    },
  ]);

  return sharp(await background.toBuffer());
};

// import type { MergeStep } from '../../../pipeline/mergePipeline.js';
// import type { CollageState } from '../index.js';

// import { requireNonEmptyArray, requireState } from '../../../pipeline/guards.js';

// import { randint } from '../../../utils/math/randint.js';
// import sharp from 'sharp';
// import { shuffleArray } from '../../../helpers.js';
// import type { RGBA } from '../../../utils/colors/types.js';

// interface Options {
//   // rotationDegree: number;
//   // overlapPercentage: number;

//   // columns: number;
//   // imageWidthVariance: number;
//   borderWidth: number;
//   borderColor: RGBA;
// }

// export const addBorders: MergeStep<Options, CollageState> = async (context, options, _onProgress) => {
//   requireState(context, 'imageWidth');
//   requireState(context, 'imageHeight');
//   requireNonEmptyArray(context.images, 'images');

//   for (let i = 0; i < context.images.length; i++) {
//     // Create background for border
//     const background = sharp({
//       create: {
//         width: context.state.imageWidth,
//         height: context.state.imageHeight,
//         channels: 4,
//         background: options.borderColor,
//       },
//     }).toFormat('png');

//     // Crop image
//     const croppedImage = context.images[i]!.extract({
//       top: options.borderWidth,
//       left: options.borderWidth,
//       width: context.state.imageWidth - options.borderWidth * 2,
//       height: context.state.imageHeight - options.borderWidth * 2,
//     });

//     // Add cropped image to background
//     background.composite([
//       {
//         input: await croppedImage.toBuffer(),
//         top: options.borderWidth,
//         left: options.borderWidth,
//       },
//     ]);

//     // Update image
//     context.images[i] = sharp(await background.toBuffer());
//   }

//   // for (let i = 0; i < context.images.length; i++) {
//   //   const image = context.images[i]!;

//   //   const background = sharp({
//   //     create: {
//   //       width: context.state.width,
//   //       height: context.state.height,
//   //       channels: 4,
//   //       background: { r: 255, g: 255, b: 255, alpha: 1 },
//   //     },
//   //   });

//   //   const croppedImage = image.extract({
//   //     top: options.borderWidth,
//   //     left: options.borderWidth,
//   //     width: context.state.width - options.borderWidth * 2,
//   //     height: context.state.height - options.borderWidth * 2,
//   //   });

//   //   background.composite([
//   //     {
//   //       input: await croppedImage.toBuffer(),
//   //       top: options.borderWidth,
//   //       left: options.borderWidth,
//   //     },
//   //   ]);

//   //   context.images[i] = sharp(await background.toFormat('png').toBuffer());
//   // }
// };
