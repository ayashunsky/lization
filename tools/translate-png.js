const { readPng, writePng } = require("./normalize-tile-png");

const [, , sourcePath, outputPath, dxArg = "0", dyArg = "0"] = process.argv;

if (!sourcePath || !outputPath) {
  console.error("Usage: node tools/translate-png.js <source.png> <output.png> [dx] [dy]");
  process.exit(1);
}

const dx = Number.parseInt(dxArg, 10);
const dy = Number.parseInt(dyArg, 10);

if (!Number.isInteger(dx) || !Number.isInteger(dy)) {
  console.error("dx and dy must be integers");
  process.exit(1);
}

const source = readPng(sourcePath);
const output = {
  width: source.width,
  height: source.height,
  pixels: Buffer.alloc(source.width * source.height * 4),
};

for (let y = 0; y < source.height; y += 1) {
  for (let x = 0; x < source.width; x += 1) {
    const targetX = x + dx;
    const targetY = y + dy;

    if (targetX < 0 || targetX >= source.width || targetY < 0 || targetY >= source.height) {
      continue;
    }

    const sourceOffset = (y * source.width + x) * 4;
    const targetOffset = (targetY * output.width + targetX) * 4;

    output.pixels[targetOffset] = source.pixels[sourceOffset];
    output.pixels[targetOffset + 1] = source.pixels[sourceOffset + 1];
    output.pixels[targetOffset + 2] = source.pixels[sourceOffset + 2];
    output.pixels[targetOffset + 3] = source.pixels[sourceOffset + 3];
  }
}

writePng(outputPath, output);

console.log(
  [
    `source=${sourcePath}`,
    `output=${outputPath}`,
    `dx=${dx}`,
    `dy=${dy}`,
    `size=${source.width}x${source.height}`,
  ].join("\n"),
);
