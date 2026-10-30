const { readPng, writePng, alphaBounds } = require("./normalize-tile-png");

const [, , sourcePath, outputPath, targetWidthArg, targetHeightArg] = process.argv;

if (!sourcePath || !outputPath || !targetWidthArg) {
  console.error(
    "Usage: node tools/normalize-footprint-building-png.js <source.png> <output.png> <targetWidth> [targetHeight]",
  );
  process.exit(1);
}

const targetWidth = Number.parseInt(targetWidthArg, 10);

if (!Number.isInteger(targetWidth) || targetWidth <= 0) {
  console.error(`Invalid target width: ${targetWidthArg}`);
  process.exit(1);
}

const source = readPng(sourcePath);
const sourceBox = alphaBounds(source);

if (!sourceBox) {
  console.error(`No non-transparent pixels found in ${sourcePath}`);
  process.exit(1);
}

const sourceWidth = sourceBox.maxX - sourceBox.minX + 1;
const sourceHeight = sourceBox.maxY - sourceBox.minY + 1;
const targetHeight = targetHeightArg === undefined
  ? Math.max(1, Math.round((sourceHeight * targetWidth) / sourceWidth))
  : Number(targetHeightArg);

if (!Number.isInteger(targetHeight) || targetHeight <= 0) {
  console.error(`Invalid target height: ${targetHeightArg}`);
  process.exit(1);
}

const output = {
  width: targetWidth,
  height: targetHeight,
  pixels: Buffer.alloc(targetWidth * targetHeight * 4),
};

for (let y = 0; y < targetHeight; y += 1) {
  for (let x = 0; x < targetWidth; x += 1) {
    const sourceX = sourceBox.minX + ((x + 0.5) / targetWidth) * sourceWidth - 0.5;
    const sourceY = sourceBox.minY + ((y + 0.5) / targetHeight) * sourceHeight - 0.5;
    const color = sampleBilinear(source, sourceX, sourceY);
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
    `sourceBox=${sourceBox.minX},${sourceBox.minY}-${sourceBox.maxX},${sourceBox.maxY}`,
    `output=${outputPath}`,
    `target=${output.width}x${output.height}`,
  ].join("\n"),
);

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
