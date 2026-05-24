const { readPng, writePng } = require("./normalize-tile-png");

const [, , referencePath, sourcePath, outputPath] = process.argv;

if (!referencePath || !sourcePath || !outputPath) {
  console.error(
    "Usage: node tools/apply-reference-alpha-mask.js <reference-mask.png> <source.png> <output.png>",
  );
  process.exit(1);
}

const reference = readPng(referencePath);
const source = readPng(sourcePath);

if (reference.width !== source.width || reference.height !== source.height) {
  console.error("Reference and source must have the same dimensions");
  process.exit(1);
}

const opaqueSamples = collectOpaqueSamples(source);
const output = {
  width: source.width,
  height: source.height,
  pixels: Buffer.alloc(source.width * source.height * 4),
};

for (let y = 0; y < source.height; y += 1) {
  for (let x = 0; x < source.width; x += 1) {
    const offset = (y * source.width + x) * 4;
    const maskAlpha = reference.pixels[offset + 3];

    if (maskAlpha <= 8) continue;

    const color =
      source.pixels[offset + 3] > 8
        ? [
            source.pixels[offset],
            source.pixels[offset + 1],
            source.pixels[offset + 2],
          ]
        : nearestOpaqueColor(opaqueSamples, x, y);

    output.pixels[offset] = color[0];
    output.pixels[offset + 1] = color[1];
    output.pixels[offset + 2] = color[2];
    output.pixels[offset + 3] = maskAlpha;
  }
}

writePng(outputPath, output);
console.log(`${outputPath}: wrote ${source.width}x${source.height}`);

function collectOpaqueSamples(image) {
  const samples = [];

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;

      if (image.pixels[offset + 3] <= 8) continue;

      samples.push({
        x,
        y,
        color: [image.pixels[offset], image.pixels[offset + 1], image.pixels[offset + 2]],
      });
    }
  }

  if (samples.length === 0) {
    throw new Error("No opaque pixels found in source image");
  }

  return samples;
}

function nearestOpaqueColor(samples, x, y) {
  let best = samples[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const sample of samples) {
    const distance = (sample.x - x) ** 2 + (sample.y - y) ** 2;

    if (distance >= bestDistance) continue;

    best = sample;
    bestDistance = distance;
  }

  return best.color;
}
