const { readPng, writePng } = require("./normalize-tile-png");

const [, , maskPath, sourcePath, targetPath, outputPath = targetPath] = process.argv;

if (!maskPath || !sourcePath || !targetPath) {
  console.error(
    "Usage: node tools/patch-tile-underlay-from-source.js <mask.png> <source-texture.png> <target.png> [output.png]",
  );
  process.exit(1);
}

const mask = readPng(maskPath);
const source = readPng(sourcePath);
const target = readPng(targetPath);

if (
  mask.width !== target.width ||
  mask.height !== target.height ||
  source.width !== target.width ||
  source.height !== target.height
) {
  console.error("All images must have the same dimensions");
  process.exit(1);
}

const groundSamples = collectGroundSamples(source);
const output = {
  width: target.width,
  height: target.height,
  pixels: Buffer.from(target.pixels),
};

let patched = 0;

for (let y = 0; y < target.height; y += 1) {
  for (let x = 0; x < target.width; x += 1) {
    const offset = (y * target.width + x) * 4;
    const maskAlpha = mask.pixels[offset + 3];
    const targetAlpha = target.pixels[offset + 3];

    if (maskAlpha <= 8 || targetAlpha > 40) continue;

    const sourceColor = sampleSourceGround(source, groundSamples, x, y);
    output.pixels[offset] = sourceColor[0];
    output.pixels[offset + 1] = sourceColor[1];
    output.pixels[offset + 2] = sourceColor[2];
    output.pixels[offset + 3] = maskAlpha;
    patched += 1;
  }
}

writePng(outputPath, output);
console.log(`${outputPath}: patched=${patched}`);

function collectGroundSamples(image) {
  const samples = [];

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const red = image.pixels[offset];
      const green = image.pixels[offset + 1];
      const blue = image.pixels[offset + 2];
      const alpha = image.pixels[offset + 3];

      if (alpha < 220) continue;
      if (!isGroundLike(red, green, blue)) continue;

      samples.push({ x, y, color: [red, green, blue, alpha] });
    }
  }

  if (samples.length === 0) {
    throw new Error("No source ground-like pixels found");
  }

  return samples;
}

function sampleSourceGround(source, samples, x, y) {
  const offset = (y * source.width + x) * 4;
  const direct = [
    source.pixels[offset],
    source.pixels[offset + 1],
    source.pixels[offset + 2],
    source.pixels[offset + 3],
  ];

  if (direct[3] > 220 && isGroundLike(direct[0], direct[1], direct[2])) {
    return direct;
  }

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

function isGroundLike(red, green, blue) {
  return green >= 90 && green > red * 0.86 && green > blue * 1.08 && red >= 40;
}
