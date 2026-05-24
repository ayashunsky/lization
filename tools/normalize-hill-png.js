const {
  alphaBounds,
  readPng,
  resampleBox,
  writePng,
} = require("./normalize-tile-png");

const [, , sourcePath, referencePath, outputPath] = process.argv;

if (!sourcePath || !referencePath || !outputPath) {
  console.error(
    "Usage: node tools/normalize-hill-png.js <source.png> <reference.png> <output.png>",
  );
  process.exit(1);
}

const source = readPng(sourcePath);
const reference = readPng(referencePath);
const sourceBox = alphaBounds(source);
const referenceBox = alphaBounds(reference);

if (!sourceBox) {
  console.error(`No non-transparent pixels found in ${sourcePath}`);
  process.exit(1);
}

if (!referenceBox) {
  console.error(`No non-transparent pixels found in ${referencePath}`);
  process.exit(1);
}

const normalized = {
  width: reference.width,
  height: reference.height,
  pixels: Buffer.alloc(reference.width * reference.height * 4),
};

resampleBox(source, sourceBox, normalized, referenceBox);

const output = {
  width: normalized.width,
  height: normalized.height,
  pixels: Buffer.from(normalized.pixels),
};

const surfaceBottomY = findLeftRightCornerLine(reference);

for (let y = 0; y <= surfaceBottomY; y += 1) {
  const referenceRange = rowOpaqueRange(reference, y);
  const sourceRange = rowOpaqueRange(normalized, y);

  if (!referenceRange || !sourceRange) continue;

  for (let x = referenceRange.min; x <= referenceRange.max; x += 1) {
    const sourceX =
      sourceRange.min + ((x - referenceRange.min + 0.5) / referenceRange.width) * sourceRange.width - 0.5;
    const color = sampleHorizontal(normalized, y, sourceX);
    const offset = (y * output.width + x) * 4;

    output.pixels[offset] = color[0];
    output.pixels[offset + 1] = color[1];
    output.pixels[offset + 2] = color[2];
    output.pixels[offset + 3] = color[3];
  }
}

writePng(outputPath, output);
console.log(
  [
    `source=${source.width}x${source.height}`,
    `sourceBox=${formatBox(sourceBox)}`,
    `reference=${reference.width}x${reference.height}`,
    `referenceBox=${formatBox(referenceBox)}`,
    `surfaceBottomY=${surfaceBottomY}`,
    `output=${outputPath}`,
  ].join("\n"),
);

function findLeftRightCornerLine(image) {
  let minX = image.width;
  let maxX = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3] <= 8) continue;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }

  return Math.round((firstAlphaY(image, minX) + firstAlphaY(image, maxX)) / 2);
}

function firstAlphaY(image, x) {
  for (let y = 0; y < image.height; y += 1) {
    if (image.pixels[(y * image.width + x) * 4 + 3] > 8) return y;
  }

  return 0;
}

function rowOpaqueRange(image, y) {
  let min = image.width;
  let max = -1;

  for (let x = 0; x < image.width; x += 1) {
    if (image.pixels[(y * image.width + x) * 4 + 3] <= 8) continue;

    min = Math.min(min, x);
    max = Math.max(max, x);
  }

  if (max < min) return null;

  return {
    min,
    max,
    width: max - min + 1,
  };
}

function sampleHorizontal(image, y, x) {
  const x0 = clamp(Math.floor(x), 0, image.width - 1);
  const x1 = clamp(x0 + 1, 0, image.width - 1);
  const t = x - x0;
  const left = getPixel(image, x0, y);
  const right = getPixel(image, x1, y);

  return left.map((value, channel) => Math.round(lerp(value, right[channel], t)));
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
