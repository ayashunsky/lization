const { readPng, writePng } = require("./normalize-tile-png");

const [, , sourcePath, outputPath] = process.argv;

if (!sourcePath || !outputPath) {
  console.error("Usage: node tools/normalize-unit-png.js <source.png> <output.png>");
  process.exit(1);
}

const source = readPng(sourcePath);
const sourceBox = primaryOpaqueBounds(source);

if (!sourceBox) {
  console.error(`No non-transparent pixels found in ${sourcePath}`);
  process.exit(1);
}

const target = {
  width: 72,
  height: 88,
  box: {
    minX: 4,
    maxX: 67,
    minY: 0,
    maxY: 87,
  },
};

const output = {
  width: target.width,
  height: target.height,
  pixels: Buffer.alloc(target.width * target.height * 4),
};

resampleIntoBox(source, sourceBox, output, target.box);
writePng(outputPath, output);

console.log(
  [
    `source=${source.width}x${source.height}`,
    `sourceBox=${formatBox(sourceBox)}`,
    `output=${outputPath}`,
    `target=${target.width}x${target.height}`,
  ].join("\n"),
);

function resampleIntoBox(sourceImage, sourceCrop, outputImage, targetBox) {
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const sourceWidth = sourceCrop.maxX - sourceCrop.minX + 1;
  const sourceHeight = sourceCrop.maxY - sourceCrop.minY + 1;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const scaledWidth = Math.max(1, Math.round(sourceWidth * scale));
  const scaledHeight = Math.max(1, Math.round(sourceHeight * scale));
  const offsetX = targetBox.minX + Math.floor((targetWidth - scaledWidth) / 2);
  const offsetY = targetBox.maxY - scaledHeight + 1;

  for (let y = 0; y < scaledHeight; y += 1) {
    for (let x = 0; x < scaledWidth; x += 1) {
      const sourceX = sourceCrop.minX + ((x + 0.5) / scaledWidth) * sourceWidth - 0.5;
      const sourceY = sourceCrop.minY + ((y + 0.5) / scaledHeight) * sourceHeight - 0.5;
      const color = sampleBilinear(sourceImage, sourceX, sourceY);
      const targetX = offsetX + x;
      const targetY = offsetY + y;
      const offset = (targetY * outputImage.width + targetX) * 4;

      outputImage.pixels[offset] = color[0];
      outputImage.pixels[offset + 1] = color[1];
      outputImage.pixels[offset + 2] = color[2];
      outputImage.pixels[offset + 3] = color[3];
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

function primaryOpaqueBounds(image) {
  const visited = new Uint8Array(image.width * image.height);
  let best = null;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = y * image.width + x;

      if (visited[index]) continue;
      visited[index] = 1;

      if (image.pixels[index * 4 + 3] <= 8) continue;

      const component = floodOpaqueComponent(image, x, y, visited);

      if (!best || component.count > best.count) {
        best = component;
      }
    }
  }

  if (!best) return null;

  return {
    minX: best.minX,
    minY: best.minY,
    maxX: best.maxX,
    maxY: best.maxY,
  };
}

function floodOpaqueComponent(image, startX, startY, visited) {
  const queue = [[startX, startY]];
  let head = 0;
  let count = 0;
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;

  while (head < queue.length) {
    const [x, y] = queue[head];
    head += 1;
    count += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nextX = x + dx;
      const nextY = y + dy;

      if (nextX < 0 || nextX >= image.width || nextY < 0 || nextY >= image.height) {
        continue;
      }

      const nextIndex = nextY * image.width + nextX;

      if (visited[nextIndex]) continue;
      visited[nextIndex] = 1;

      if (image.pixels[nextIndex * 4 + 3] <= 8) continue;

      queue.push([nextX, nextY]);
    }
  }

  return { count, minX, minY, maxX, maxY };
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
