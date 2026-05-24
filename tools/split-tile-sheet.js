const path = require("path");
const { readPng, writePng } = require("./normalize-tile-png");

const [, , sourcePath, referencePath, ...outputPaths] = process.argv;

if (!sourcePath || !referencePath || outputPaths.length === 0) {
  console.error(
    "Usage: node tools/split-tile-sheet.js <sheet.png> <reference.png> <out1.png> [out2.png ...]",
  );
  process.exit(1);
}

const source = readPng(sourcePath);
const reference = readPng(referencePath);
const referenceBox = alphaBounds(reference);
const runs = findAlphaColumnRuns(source);

if (!referenceBox) {
  console.error(`No non-transparent pixels found in ${referencePath}`);
  process.exit(1);
}

if (runs.length !== outputPaths.length) {
  console.error(
    `Expected ${outputPaths.length} tile components, found ${runs.length}: ${runs
      .map((run) => `${run.minX}-${run.maxX}`)
      .join(", ")}`,
  );
  process.exit(1);
}

runs.forEach((run, index) => {
  const sourceBox = alphaBounds(source, run);
  const output = {
    width: reference.width,
    height: reference.height,
    pixels: Buffer.alloc(reference.width * reference.height * 4),
  };

  resampleBox(source, sourceBox, output, referenceBox);
  writePng(outputPaths[index], output);
  console.log(
    `${path.basename(outputPaths[index])}: sourceBox=${formatBox(sourceBox)} referenceBox=${formatBox(
      referenceBox,
    )}`,
  );
});

function findAlphaColumnRuns(image) {
  const columns = [];

  for (let x = 0; x < image.width; x += 1) {
    let alphaPixels = 0;

    for (let y = 0; y < image.height; y += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3] > 8) {
        alphaPixels += 1;
      }
    }

    columns.push(alphaPixels);
  }

  const runs = [];
  let minX = null;

  for (let x = 0; x < columns.length; x += 1) {
    if (columns[x] > 0 && minX === null) {
      minX = x;
    }

    if ((columns[x] === 0 || x === columns.length - 1) && minX !== null) {
      runs.push({ minX, maxX: columns[x] === 0 ? x - 1 : x });
      minX = null;
    }
  }

  return runs;
}

function alphaBounds(image, xRange = { minX: 0, maxX: image.width - 1 }) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = xRange.minX; x <= xRange.maxX; x += 1) {
      const alpha = image.pixels[(y * image.width + x) * 4 + 3];

      if (alpha <= 8) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return null;

  return { minX, minY, maxX, maxY };
}

function resampleBox(source, sourceBox, output, targetBox) {
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const sourceWidth = sourceBox.maxX - sourceBox.minX + 1;
  const sourceHeight = sourceBox.maxY - sourceBox.minY + 1;

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX =
        sourceBox.minX + ((x + 0.5) / targetWidth) * sourceWidth - 0.5;
      const sourceY =
        sourceBox.minY + ((y + 0.5) / targetHeight) * sourceHeight - 0.5;
      const color = sampleBilinear(source, sourceX, sourceY);
      const targetX = targetBox.minX + x;
      const targetY = targetBox.minY + y;
      const targetOffset = (targetY * output.width + targetX) * 4;

      output.pixels[targetOffset] = color[0];
      output.pixels[targetOffset + 1] = color[1];
      output.pixels[targetOffset + 2] = color[2];
      output.pixels[targetOffset + 3] = color[3];
    }
  }
}

function sampleBilinear(image, x, y) {
  const x0 = clamp(Math.floor(x), 0, image.width - 1);
  const y0 = clamp(Math.floor(y), 0, image.height - 1);
  const x1 = clamp(x0 + 1, 0, image.width - 1);
  const y1 = clamp(y0 + 1, 0, image.height - 1);
  const tx = x - x0;
  const ty = y - y0;
  const c00 = getPixel(image, x0, y0);
  const c10 = getPixel(image, x1, y0);
  const c01 = getPixel(image, x0, y1);
  const c11 = getPixel(image, x1, y1);

  return c00.map((_, channel) =>
    Math.round(
      lerp(
        lerp(c00[channel], c10[channel], tx),
        lerp(c01[channel], c11[channel], tx),
        ty,
      ),
    ),
  );
}

function getPixel(image, x, y) {
  const offset = (y * image.width + x) * 4;

  return [
    image.pixels[offset],
    image.pixels[offset + 1],
    image.pixels[offset + 2],
    image.pixels[offset + 3],
  ];
}

function formatBox(box) {
  return `${box.minX},${box.minY}-${box.maxX},${box.maxY}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
