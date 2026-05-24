const path = require("path");
const { readPng, writePng } = require("./normalize-tile-png");

const sourcePath = path.join(__dirname, "..", "bck", "tiles", "obs", "forest_normalized.png");
const outDir = path.join(__dirname, "..", "game", "assets", "tiles");

const variants = [
  {
    file: "forest_01.png",
    red: 1,
    green: 1,
    blue: 1,
    add: 0,
    noise: 0,
    seed: 11,
  },
  {
    file: "forest_02.png",
    red: 0.9,
    green: 1.08,
    blue: 0.94,
    add: -4,
    noise: 8,
    seed: 29,
  },
];

const source = readPng(sourcePath);

for (const variant of variants) {
  const output = {
    width: source.width,
    height: source.height,
    pixels: Buffer.from(source.pixels),
  };

  applyColorVariant(output, variant);
  writePng(path.join(outDir, variant.file), output);
  console.log(`wrote game/assets/tiles/${variant.file}`);
}

function applyColorVariant(image, variant) {
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const offset = (y * image.width + x) * 4;
      const alpha = image.pixels[offset + 3];

      if (alpha === 0) continue;

      const jitter = (hash2d(x, y, variant.seed) - 0.5) * variant.noise;
      image.pixels[offset] = clamp(
        image.pixels[offset] * variant.red + variant.add + jitter,
        0,
        255,
      );
      image.pixels[offset + 1] = clamp(
        image.pixels[offset + 1] * variant.green + variant.add + jitter,
        0,
        255,
      );
      image.pixels[offset + 2] = clamp(
        image.pixels[offset + 2] * variant.blue + variant.add + jitter,
        0,
        255,
      );
    }
  }
}

function hash2d(x, y, seed) {
  let value = x * 374761393 + y * 668265263 + seed * 2147483647;
  value = (value ^ (value >> 13)) * 1274126177;
  value ^= value >> 16;
  return (value >>> 0) / 4294967295;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
