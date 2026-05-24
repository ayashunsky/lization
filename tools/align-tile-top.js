const { readPng, writePng } = require("./normalize-tile-png");

const [, , referencePath, ...tilePaths] = process.argv;

if (!referencePath || tilePaths.length === 0) {
  console.error("Usage: node tools/align-tile-top.js <reference.png> <tile.png> [tile.png ...]");
  process.exit(1);
}

const reference = readPng(referencePath);
const referenceTop = centerBandTop(reference);

for (const tilePath of tilePaths) {
  const image = readPng(tilePath);
  const sourceTop = centerBandTop(image);
  const deltaY = referenceTop - sourceTop;
  const shifted = shiftImage(image, deltaY);

  writePng(tilePath, shifted);
  console.log(`${tilePath}: sourceTop=${sourceTop} referenceTop=${referenceTop} shiftY=${deltaY}`);
}

function centerBandTop(image) {
  const centerX = Math.floor(image.width / 2);
  const bandRadius = Math.max(4, Math.round(image.width * 0.025));
  const minX = Math.max(0, centerX - bandRadius);
  const maxX = Math.min(image.width - 1, centerX + bandRadius);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3] > 8) {
        return y;
      }
    }
  }

  return 0;
}

function shiftImage(image, deltaY) {
  const output = {
    width: image.width,
    height: image.height,
    pixels: Buffer.alloc(image.width * image.height * 4),
  };

  for (let y = 0; y < image.height; y += 1) {
    const targetY = y + deltaY;

    if (targetY < 0 || targetY >= image.height) continue;

    image.pixels.copy(
      output.pixels,
      targetY * image.width * 4,
      y * image.width * 4,
      (y + 1) * image.width * 4,
    );
  }

  return output;
}
