const { readPng, writePng } = require("./normalize-tile-png");

const [, , referencePath, targetPath, outputPath = targetPath] = process.argv;

if (!referencePath || !targetPath) {
  console.error("Usage: node tools/underlay-tile-body.js <reference-mask.png> <target.png> [output.png]");
  process.exit(1);
}

const reference = readPng(referencePath);
const target = readPng(targetPath);

if (reference.width !== target.width || reference.height !== target.height) {
  console.error("Reference and target must have the same dimensions");
  process.exit(1);
}

const palette = sampleGroundPalette(target);
const output = {
  width: target.width,
  height: target.height,
  pixels: Buffer.alloc(target.width * target.height * 4),
};

for (let y = 0; y < target.height; y += 1) {
  for (let x = 0; x < target.width; x += 1) {
    const offset = (y * target.width + x) * 4;
    const underlay = underlayPixel(reference, x, y, palette);
    const source = [
      target.pixels[offset],
      target.pixels[offset + 1],
      target.pixels[offset + 2],
      target.pixels[offset + 3],
    ];
    const color = composite(source, underlay);

    output.pixels[offset] = color[0];
    output.pixels[offset + 1] = color[1];
    output.pixels[offset + 2] = color[2];
    output.pixels[offset + 3] = color[3];
  }
}

writePng(outputPath, output);
console.log(`${outputPath}: underlay=${palette.top.join(",")} side=${palette.side.join(",")}`);

function sampleGroundPalette(image) {
  const samples = [];

  for (let y = Math.round(image.height * 0.38); y < Math.round(image.height * 0.68); y += 1) {
    for (let x = Math.round(image.width * 0.22); x < Math.round(image.width * 0.78); x += 1) {
      const offset = (y * image.width + x) * 4;
      const alpha = image.pixels[offset + 3];
      const red = image.pixels[offset];
      const green = image.pixels[offset + 1];
      const blue = image.pixels[offset + 2];

      if (alpha < 220) continue;
      if (green < 85 || green < red * 0.9 || green < blue * 1.15) continue;

      samples.push([red, green, blue]);
    }
  }

  const top = samples.length ? medianColor(samples) : [120, 168, 70];

  return {
    top,
    side: shade(top, -42),
    leftSide: shade(top, -58),
    stroke: shade(top, -75),
  };
}

function underlayPixel(reference, x, y, palette) {
  const offset = (y * reference.width + x) * 4;
  const alpha = reference.pixels[offset + 3];

  if (alpha <= 8) return [0, 0, 0, 0];

  let color = palette.top;

  if (isLeftSide(x, y, reference.width, reference.height)) {
    color = palette.leftSide;
  } else if (isRightSide(x, y, reference.width, reference.height)) {
    color = palette.side;
  } else if (isEdgePixel(x, y, reference.width, reference.height)) {
    color = palette.stroke;
  }

  return [color[0], color[1], color[2], alpha];
}

function isLeftSide(x, y, width) {
  const halfW = width / 2;
  const topHeight = halfW / 2;
  const sideHeight = Math.round(width * 0.136);
  const leftEdgeY = topHeight - x / 2;
  const bottomLeftY = topHeight + x / 2 + sideHeight;

  return y >= leftEdgeY && y <= bottomLeftY && x <= halfW && y > topHeight + x / 2 - 1;
}

function isRightSide(x, y, width) {
  const halfW = width / 2;
  const topHeight = halfW / 2;
  const sideHeight = Math.round(width * 0.136);
  const rightDistance = width - 1 - x;
  const rightEdgeY = topHeight - rightDistance / 2;
  const bottomRightY = topHeight + rightDistance / 2 + sideHeight;

  return (
    y >= rightEdgeY &&
    y <= bottomRightY &&
    x >= halfW &&
    y > topHeight + rightDistance / 2 - 1
  );
}

function isEdgePixel(x, y, width, height) {
  return x <= 1 || x >= width - 2 || y <= 1 || y >= height - 2;
}

function composite(source, destination) {
  const sourceAlpha = source[3] / 255;
  const destinationAlpha = destination[3] / 255;
  const outAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);

  if (outAlpha <= 0) return [0, 0, 0, 0];

  return [
    blendChannel(source[0], sourceAlpha, destination[0], destinationAlpha, outAlpha),
    blendChannel(source[1], sourceAlpha, destination[1], destinationAlpha, outAlpha),
    blendChannel(source[2], sourceAlpha, destination[2], destinationAlpha, outAlpha),
    Math.round(outAlpha * 255),
  ];
}

function blendChannel(source, sourceAlpha, destination, destinationAlpha, outAlpha) {
  return Math.round(
    (source * sourceAlpha + destination * destinationAlpha * (1 - sourceAlpha)) / outAlpha,
  );
}

function medianColor(samples) {
  return [0, 1, 2].map((channel) => {
    const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  });
}

function shade(color, amount) {
  return color.map((value) => clamp(value + amount, 0, 255));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
