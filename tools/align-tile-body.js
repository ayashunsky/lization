const { readPng, writePng } = require("./normalize-tile-png");

const [, , referencePath, ...tilePaths] = process.argv;

if (!referencePath || tilePaths.length === 0) {
  console.error("Usage: node tools/align-tile-body.js <reference.png> <tile.png> [tile.png ...]");
  process.exit(1);
}

const reference = readPng(referencePath);
const referenceMetrics = edgeMetrics(reference);

for (const tilePath of tilePaths) {
  const image = readPng(tilePath);
  const sourceMetrics = edgeMetrics(image);
  const warped = verticalWarp(image, sourceMetrics, referenceMetrics);

  writePng(tilePath, warped);
  console.log(
    [
      tilePath,
      `sourceTop=${sourceMetrics.top.toFixed(2)}`,
      `targetTop=${referenceMetrics.top.toFixed(2)}`,
      `sourceBottom=${sourceMetrics.bottom.toFixed(2)}`,
      `targetBottom=${referenceMetrics.bottom.toFixed(2)}`,
    ].join(" "),
  );
}

function edgeMetrics(image) {
  const edgeWidth = 12;
  const xs = [];

  for (let x = 0; x < edgeWidth; x += 1) xs.push(x);
  for (let x = image.width - edgeWidth; x < image.width; x += 1) xs.push(x);

  const tops = [];
  const bottoms = [];

  for (const x of xs) {
    const ys = [];

    for (let y = 0; y < image.height; y += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3] > 8) {
        ys.push(y);
      }
    }

    if (ys.length === 0) continue;

    tops.push(ys[0]);
    bottoms.push(ys[ys.length - 1]);
  }

  return {
    top: average(tops),
    bottom: average(bottoms),
  };
}

function verticalWarp(image, sourceMetrics, targetMetrics) {
  const anchor = Math.min(24, targetMetrics.top - 4, sourceMetrics.top - 4);
  const sourceControls = [0, anchor, sourceMetrics.top, sourceMetrics.bottom, image.height - 1];
  const targetControls = [0, anchor, targetMetrics.top, targetMetrics.bottom, image.height - 1];
  const output = {
    width: image.width,
    height: image.height,
    pixels: Buffer.alloc(image.width * image.height * 4),
  };

  for (let y = 0; y < image.height; y += 1) {
    const sourceY = invertControls(y, sourceControls, targetControls);

    for (let x = 0; x < image.width; x += 1) {
      const color = sampleVertical(image, x, sourceY);
      const offset = (y * image.width + x) * 4;

      output.pixels[offset] = color[0];
      output.pixels[offset + 1] = color[1];
      output.pixels[offset + 2] = color[2];
      output.pixels[offset + 3] = color[3];
    }
  }

  return output;
}

function invertControls(targetY, sourceControls, targetControls) {
  for (let index = 0; index < targetControls.length - 1; index += 1) {
    const targetStart = targetControls[index];
    const targetEnd = targetControls[index + 1];

    if (targetY < targetStart || targetY > targetEnd) continue;

    const range = targetEnd - targetStart || 1;
    const t = (targetY - targetStart) / range;

    return sourceControls[index] + t * (sourceControls[index + 1] - sourceControls[index]);
  }

  return targetY;
}

function sampleVertical(image, x, y) {
  const y0 = clamp(Math.floor(y), 0, image.height - 1);
  const y1 = clamp(y0 + 1, 0, image.height - 1);
  const t = y - y0;
  const top = getPixel(image, x, y0);
  const bottom = getPixel(image, x, y1);

  return top.map((value, channel) => Math.round(lerp(value, bottom[channel], t)));
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

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
