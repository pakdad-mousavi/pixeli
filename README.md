
# Pixeli (Pre-release) [![npm version](https://img.shields.io/github/package-json/version/pakdad-mousavi/pixeli)](https://www.npmjs.com/package/pixeli) [![License](https://img.shields.io/github/license/pakdad-mousavi/pixeli)](./LICENSE)

<img src="./assets/logo.svg" width="150" align="right">

**Pixeli** is a lightweight and flexible command-line tool for merging multiple images into clean, customizable grid layouts. It’s designed for speed and simplicity, making it ideal for generating collages, previews, gallery layouts, inspiration boards, and composite images without relying on heavy desktop software.

Pixeli uses Sharp, a Node.js wrapper for the libvips library which is based on C. This makes it an extremely fast tool with support for PNG, JPG, GIF, SVG, AVIF, etc.

The tool currently supports four main layout modes: ***Grid***, ***Masonry*** (horizontal / vertical), ***Template***, and ***Collage***. Each of them provide a distinct visual style to match a project's needs, for example:

| Grid (1:1 images) | Contact Sheet Grid |
|---|---|
| <img src="samples/grid.jpg" width="400"> | <img src="samples/grid-with-captions.jpg" width="400"> |
| **Masonry (Horizontal)** | **Masonry (Vertical)** |
| <img src="samples/masonry-horizontal.jpg" width="400"> | <img src="samples/masonry-vertical.jpg" width="400"> |
| **Template (Instagram Grid)** | **Template (Vertical Book Spread)** |
| <img src="samples/instagram-grid.jpg" width="400"> | <img src="samples/vertical-book-spread.jpg" width="400"> |
| **Template (Horizontal Book Spread)** | **Template (Dashboard Shot)** |
| <img src="samples/horizontal-book-spread.jpg" width="400"> | <img src="samples/dashboard-shot.jpg" width="400"> |
| **Template (Art Gallery)** | **Collage** |
| <img src="samples/art-gallery.jpg" width="400"> | <img src="samples/collage.jpg" width="400"> | 

## Installation
Pixeli can be installed using npm. Simply run the following command to install it globally on your machine:
```bash
npm i -g pixeli
```

If you're interested in the library functions and not the CLI, you can add it to your project instead of a global install:
```bash
npm i pixeli
```

You can also run pixeli directly with npx without installing it globally. This is convenient for quick experiments or one-off usage:
```bash
npx pixeli merge <subcommand> [options] <files...>
```

## Quick CLI Examples
To run these examples, you can visit the [GitHub Repository](https://github.com/pakdad-mousavi/pixeli) and use the images in the [Samples](https://github.com/pakdad-mousavi/pixeli/blob/main/samples/) directory, if you don't already have your own set of images.

All merge commands are under `pixeli` and can be used like so: `pixeli [merge-mode] [options]`

### Basic Grid
To create a basic grid with 1:1 images, you can use the grid merge command. You'll also need to provide the individual filepaths to use, or use the `-rd` (--recursive and --directory) flags to get all the images from the specified directory:
```bash
pixeli grid -rd ./samples/images
```

Without the `-r` flag, only the images in the directory will be scanned, and any sub-directories will be ignored.

### Grid with Rectangular Images
To create a grid with images that all have the same aspect ratio, you can specify the aspect ratio to use for all images using the `--ar` flag:
```bash
pixeli grid -rd ./samples/images --ar 16:9
```

### Grid with 8 Columns
You can also customize the number of columns that you'd like the final image to have using the `-c` flag, followed by the number of columns:
```bash
pixeli grid -rd ./samples/images -c 8
```

### Contact Sheet
Contact sheet style grids can also be made using pixeli. To include each file name under its respective image, the `--ca` flag can be used:
```bash
pixeli grid -rd ./samples/images --ca
```

The caption color can also be specified using the `--cc` flag, followed by a hex color:
```bash
pixeli grid -rd ./samples/images --ca --cc "#ff0000"
```

### Masonry Layout
To create a masonry style image, you can use the masonry merge command. The `-rd` flag is used to specify which directory to use, and the canvas width can be specified using the `--cvw` flag:
```bash
pixeli masonry -rd ./samples/images --cvw 4000
```

By default, the masonry merge command uses a horizontal flow, but a vertical one can be specified using the `-f` flag, followed by the `--cvh` to specify the canvas height:
```bash
pixeli merge masonry -rd ./samples/images -f vertical --cvh 4000
```

Note that the masonry command always requires either the `--cvw` or `--cvh` option, depending on the flow.

### Template Layout
Collage layouts require a JSON template which describe your specific layout. The `-t` flag is used to specify the path to a JSON template:
```bash
pixeli template -rd ./samples/images -t ./template.json
```

You could also use one of the presets provided using the `-p` flag:
```bash
pixeli template -rd ./samples/images -p instagram-grid
```

To learn about the JSON template, see [templates](#templates).

## Full CLI Documentation

### pixeli
Usage: `pixeli <subcommand> [options] <input...> -o <output>`

The `pixeli` command is what allows you to create grids and mosaics with your images.
| Subcommand | Description                                                                                                                                       | Options                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `grid`     | Merge images into a **uniform rows × columns grid**, optionally with captions and per-image aspect ratios.                                        | See [grid options table](#pixeli-grid)                           |
| `masonry`  | Merge images into a **dynamic masonry layout**, preserving natural image proportions. Supports vertical or horizontal flow and alignment options. | See [masonry options table](#pixeli-masonry)                     |
| `template` | Merge images into a **pre-defined layout**, based on the template provided, or the preset used.                                                   | See [template options table](#pixeli-template)                   |
| `collage`  | Merge images into a **messy, photo-wall style grid**, great for posters or aesthetic layouts.                                                     | See [collage options table](#pixeli-collage)                     |

The following options and flags are shared for all of the subcommands under the `pixeli` command:
| Option                         | Default        | Description                                                                                                                        |
| ------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `[files...]`                   | —              | Image file paths to merge. You can specify multiple files or if you prefer directories, use `--dir`.                               |
| `-d`, `--dir <path>`           | —              | Path to a **directory containing images** to merge. Can be used instead of listing files individually.                             |
| `-r`, `--recursive`            | `false`        | Include **images in all subdirectories** of the specified directory recursively.                                                   |
| `--sh`, `--shuffle`            | `false`        | **Randomize the order** of images before merging. Useful for creating visually varied grids or collages.                           |
| `-g`, `--gap <px>`             | `50`           | **Spacing (in pixels) between images** in the layout. Applies to both horizontal and vertical gaps.                                |
| `--cr`, `--corner-radius <px>` | `0`            | How much to **round the corners** of each image in pixels.                                                                         |
| `--bg`, `--canvas-color <hex>` | `#ffffff`      | Sets the **background color of the canvas**. Accepts HEX values (e.g., `#000000` for black).                                       |
| `--bw`, `--border-width <px>`  | `0`            | Sets the **width of the border** in pixels.                                                                                        |
| `--bc`, `--border-color <hex>` | `#000`         | Sets the **color of the border, if any**. Accepts HEX values (e.g., `#000000` for black).                                          |
| `-o`, `--output <file>`        | `./pixeli.png` | Path for the **merged output image**. The format is inferred from the file extension (`.png`, `.jpg`, `.webp`, etc.).              |


### pixeli grid
Usage: `pixeli grid [options] [files...]`

The grid merge arranges images into a clean, uniform grid with fixed columns and automatic row calculation. The table below displays all of the options available to this command:
| Option/Flag                                     | Default                | Description                                                                                                                                                                              |
| ----------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ar`, `--aspect-ratio <width/height\|number>` | `1:1`                  | Sets the **per-image aspect ratio**. Accepts ratio expressions (`16/9`, `4:3`) or decimal values (`1.777`). Images are scaled as needed to match this ratio before placement.            |
| `-w`, `--image-width <px>`                      | *smallest input width* | Sets the **final width of each processed image** in the grid. The height is derived automatically based on the chosen aspect ratio.                                                      |
| `-c`, `--columns <n>`                           | `4`                    | Defines how many **images per row** are placed in the grid. The total number of rows is calculated from the number of inputs.                                                            |
| `--ca`, `--caption`                             | `false`                | Enables **automatic captions** under each image. Captions are derived from the filename (with extensions).                                                                               |
| `--cc`, `--caption-color <hex>`                 | `#000000`              | HEX color value for caption text (e.g., `#ffffff`, `#ff9900`). Affects all captions uniformly.                                                                                           |
| `--mcs`, `--max-caption-size <pt>`              | `100`                  | Sets the **maximum allowed caption font size**. Useful when images are extremely large and the caption is not big enough. The renderer may auto-reduce the font size if necessary.       |

### pixeli masonry
Usage: `pixeli masonry [options] [files...]`

The masonry merge preserves each image’s natural shape, creating an organic brick-wall layout similar to Pinterest boards.

| Option/Flag                                          | Default                 | Description                                                                                                                                            |
| ---------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--rh`, `--row-height <px>`                          | *smallest input height* | Sets the **target height for all images in a row** when using `horizontal` flow. Images are scaled proportionally based on this height.                |
| `--cw`, `--column-width <px>`                        | *smallest input width*  | Sets the **target width for all images in a column** when using `vertical` flow. Images are scaled proportionally based on this width.                 |
| `--cvw`, `--canvas-width <px>`                       | –                       | Sets the **fixed width** of the final output canvas. Required when using a `horizontal` flow to know when to break a row.                              |
| `--cvh`, `--canvas-height <px>`                      | –                       | Sets the **fixed height** of the final output canvas. Required when using a `vertical` flow to know when to break a column.                            |
| `-f`, `--flow <horizontal\|vertical>`                | `horizontal`            | Determines the **flow direction** of the masonry layout. `horizontal` creates rows of varying widths; `vertical` creates columns of varying heights.   |
| `--ha`, `--h-align <left\|center\|right\|justified>` | `justified`             | Controls **horizontal alignment** of rows when in `horizontal` flow. `justified` overfills each row and crops the final image to fill up the canvas.   |
| `--va`, `--v-align <top\|middle\|bottom\|justified>` | `justified`             | Controls **vertical alignment** of columns when in `vertical` flow. `justified` overfills each column and crops the final image to fill up the canvas. |

### pixeli template
Usage: `pixeli template [options] [files...]`

The template merge requires a specified JSON template file, or JSON string. Images will be placed as per the template. If a preset ID is provided, both `--template` and `--mapping` are ignored.

| Option/Flag                                          | Default                 | Description                                                                                                                                                                                  |
| ---------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-t`, `--template <path>`                            | `null`                  | Sets the **path to the JSON template file** which will be used to arrange the collage. Either use `--template` or `--preset`.                                                                |
| `-p`, `--preset <preset-id>`                         | `null`                  | Use a **pre-defined collage preset** instead of providing your own. Available preset IDs: `instagram-grid`, `dashboardShot`, `horizontal-book-spread`, `vertical-book-spread`, `art-gallery` |

## Other

### JSON Templates
JSON templates used with template merge accept a JSON object that defines a grid-based canvas layout and how content occupies it.

The layout consists of:

- A canvas definition (overall grid size)
- A list of slots describing how items are placed inside the grid

Logical checks are performed on the values after the template is validated. This is to ensure the mosaic can be created, for example, without any overlaps or 0 pixel-wide images.

#### canvas

The **canvas** object defines the size and structure of the grid:
```json
{
  "canvas": {
    "width": 1200,
    "height": 800,
    "columns": 4,
    "rows": 3
  }
}
```

| Field     | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `width`   | number | Canvas width in pixels. Must be a positive integer.  |
| `height`  | number | Canvas height in pixels. Must be a positive integer. |
| `columns` | number | Number of grid columns. Must be a positive integer.  |
| `rows`    | number | Number of grid rows. Must be a positive integer.     |

#### slots

The **slots** array contains a series of slots, where each slot defines where an item should appear in the grid and how many grid cells it occupies:

```json
{
  "slots": [
    { "col": 1, "row": 1, "colSpan": 2, "rowSpan": 1 },
    { "col": 3, "row": 2, "colSpan": 1, "rowSpan": 2 }
  ]
}
```

| Field     | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `col`     | number | Starting column index (1-based).  |
| `row`     | number | Starting row index (1-based).     |
| `colSpan` | number | Number of columns the slot spans. |
| `rowSpan` | number | Number of rows the slot spans.    |

#### Slot Rules

- All values must be positive integers.
- Slots must fit within the grid:
```
col + colSpan - 1 ≤ columns
row + rowSpan - 1 ≤ rows
```
- Overlapping slots will be rejected.
- Slot indices start at 1, not 0.

#### Sample

This is an example of a full JSON template:
```json
{
  "canvas": {
    "width": 1200,
    "height": 1600,
    "columns": 3,
    "rows": 6,
  },
  "slots": [
    { "col": 1, "row": 1, "colSpan": 2, "rowSpan": 2 },
    { "col": 3, "row": 1, "colSpan": 1, "rowSpan": 1 },
    { "col": 3, "row": 2, "colSpan": 1, "rowSpan": 1 },
    { "col": 1, "row": 3, "colSpan": 1, "rowSpan": 2 },
    { "col": 2, "row": 3, "colSpan": 2, "rowSpan": 2 },
    { "col": 1, "row": 5, "colSpan": 3, "rowSpan": 2 }
  ]
}
```

Note that the `canvas.background` and `canvas.gap` properties are optional. If they are not provided, the defaults from the CLI options will be used. If both the CLI and template options exists, the template options take priority.

### All Supported Input Formats

- ***webp***
- ***gif***
- ***jpeg***
- ***jpg***
- ***png*** 
- ***tiff***
- ***avif***
- ***svg***

### All Supported Output Formats

- ***webp***
- ***gif***
- ***jpeg***
- ***jpg***
- ***png*** 
- ***tiff***
- ***avif***

### Pixel Limits

Generating extremely large images significantly reduces speed, and may also lead to pixel limit errors. All image formats have a maximum width and height, and if the created image exceeds those resolution limits, you will receive an error:

| Format                       | Typical Extension(s) | Max Width × Height                                   | Notes                                                                                              |
| ---------------------------- | -------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **JPEG / JPG**               | `.jpg`, `.jpeg`      | **65,535 × 65,535 px**                               | Standard limit from JFIF/JPEG. No alpha.                                                           |
| **PNG**                      | `.png`               | **~2,147,483,647 × 2,147,483,647 px**                | Theoretical spec limit; real-world memory limits apply. Supports transparency.                     |
| **WebP**                     | `.webp`              | **16,383 × 16,383 px**                               | Format standard limit — smaller than PNG/JPEG.                                                     |
| **GIF**                      | `.gif`               | **65,536 × 65,536 px**                               | -                                                                                                  |
| **BMP**                      | `.bmp`               | **32,767×32,767 or ~2,147,483,647×2,147,483,647 px** | Depends on version/fields.                                                                         |
| **TIFF**                     | `.tif`, `.tiff`      | **4,294,967,295 × 4,294,967,295 px** (theoretical)   | Very large; may be limited by software or memory.                                                  |

### Colors and Transparency

#### CLI
Hex colors are used in the CLI.

For fully transparent images, a value of `transparent` is allowed. Note that the transparency of the canvas itself is depends on the output format; `jpg`, for example, does not have an alpha channel.

Semi-transparency is also allowed, and can be achieved with hex colors of the format `#rrggbbaa`, where the last two hex values represent the transparency.

#### Library
Colors in the library functions are objects, and require the following format:

```javascript
const color = {
  r: 255,
  g: 255,
  b: 255,
  alpha: 1
}
```

`color.r`, `color.g`, and `color.b` are values ranging from 0 to 255, while `color.alpha` is a value ranging from 0 to 1. 

## License
This project is licensed under the [MIT License](./LICENSE).