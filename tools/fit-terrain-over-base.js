const { readPng, writePng } = require("./normalize-tile-png");

const [, , referencePath, basePath, ...tilePaths] = process.argv;

if (!referencePath || !basePath || tilePaths.length === 0) {
  console.error(
    "Usage: node tools/fit-terrain-over-base.js <reference-mask.png> <fitted-base.png> <tile.png> [tile.png ...]",
  );
  process.exit(1);
}

const reference = readPng(referencePath);
const base = readPng(basePath);

assertSameSize(reference, base, "reference", "base");

const guide = findReferenceGuide(reference);
const splitY = guide.splitY;

for (const tilePath of tilePaths) {
  const tile = readPng(tilePath);
  assertSameSize(reference, tile, "reference", tilePath);

  const output = {
    width: reference.width,
    height: reference.height,
    pixels: Buffer.alloc(reference.width * reference.height * 4),
  };

  for (let y = 0; y < reference.height; y += 1) {
    for (let x = 0; x < reference.width; x += 1) {
      const offset = (y * reference.width + x) * 4;
      const referenceAlpha = reference.pixels[offset + 3];
      const composed = sourceOver(tile, base, offset, x, y, guide);
      const alpha = y >= splitY ? referenceAlpha : Math.max(referenceAlpha, composed[3]);

      if (alpha <= 8) continue;

      output.pixels[offset] = composed[0];
      output.pixels[offset + 1] = composed[1];
      output.pixels[offset + 2] = composed[2];
      output.pixels[offset + 3] = alpha;
    }
  }

  writePng(tilePath, output);
  console.log(`${tilePath}: splitY=${splitY} wrote ${output.width}x${output.height}`);
}

function assertSameSize(a, b, aLabel, bLabel) {
  if (a.width === b.width && a.height === b.height) return;

  throw new Error(
    `${aLabel} and ${bLabel} must have the same dimensions: ${a.width}x${a.height} vs ${b.width}x${b.height}`,
  );
}

function sourceOver(source, backdrop, offset, x, y, guide) {
  const sourceAlpha = getCleanSourceAlpha(source, offset, x, y, guide) / 255;
  const backdropAlpha = backdrop.pixels[offset + 3] / 255;
  const outputAlpha = sourceAlpha + backdropAlpha * (1 - sourceAlpha);

  if (outputAlpha <= 0) return [0, 0, 0, 0];

  const color = [0, 1, 2].map((channel) =>
    Math.round(
      (source.pixels[offset + channel] * sourceAlpha +
        backdrop.pixels[offset + channel] * backdropAlpha * (1 - sourceAlpha)) /
        outputAlpha,
    ),
  );

  return [color[0], color[1], color[2], Math.round(outputAlpha * 255)];
}

function getCleanSourceAlpha(source, offset, x, y, guide) {
  const alpha = source.pixels[offset + 3];

  if (alpha <= 8) return 0;
  if (!isLikelyOldTileBorder(source, offset, x, y, guide)) return alpha;

  return 0;
}

function isLikelyOldTileBorder(source, offset, x, y, guide) {
  const distanceToGuide = distanceToNearestGuideLine(x, y, guide);
  const nearReferenceEdge = isNearReferenceEdge(x, y, guide);

  if (distanceToGuide > 2.5 && !nearReferenceEdge) return false;

  const r = source.pixels[offset];
  const g = source.pixels[offset + 1];
  const b = source.pixels[offset + 2];
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const saturation = getSaturation(r, g, b);

  if (distanceToGuide <= 1.35) return true;
  if (distanceToGuide <= 2.5 && luma < 160) return true;
  if (nearReferenceEdge && luma < 145) return true;

  return luma < 155 && saturation < 0.35;
}

function getSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === 0) return 0;

  return (max - min) / max;
}

function distanceToNearestGuideLine(x, y, guide) {
  return guide.lines.reduce(
    (nearest, line) => Math.min(nearest, distanceToLineSegment(x, y, line.start, line.end)),
    Number.POSITIVE_INFINITY,
  );
}

function distanceToLineSegment(x, y, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : clamp(((x - start.x) * dx + (y - start.y) * dy) / lengthSquared, 0, 1);
  const closestX = start.x + dx * t;
  const closestY = start.y + dy * t;

  return Math.hypot(x - closestX, y - closestY);
}

function isNearReferenceEdge(x, y, guide) {
  if (!guide.referencePixels.has(`${x},${y}`)) return false;

  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const key = `${x + dx},${y + dy}`;

      if (!guide.referencePixels.has(key)) return true;
    }
  }

  return false;
}

function findReferenceGuide(image) {
  let minX = image.width;
  let maxX = -1;
  let minY = image.height;
  let maxY = -1;
  const referencePixels = new Set();

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.pixels[(y * image.width + x) * 4 + 3] <= 8) continue;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      referencePixels.add(`${x},${y}`);
    }
  }

  const left = { x: minX, y: firstAlphaY(image, minX) };
  const right = { x: maxX, y: firstAlphaY(image, maxX) };
  const splitY = Math.round((left.y + right.y) / 2);
  const centerX = Math.round((left.x + right.x) / 2);
  const top = { x: averageAlphaXAtY(image, minY), y: minY };
  const topSurfaceBottom = { x: centerX, y: Math.min(maxY, splitY * 2) };
  const bottom = { x: averageAlphaXAtY(image, maxY), y: maxY };

  return {
    splitY,
    referencePixels,
    lines: [
      { start: top, end: left },
      { start: top, end: right },
      { start: left, end: topSurfaceBottom },
      { start: right, end: topSurfaceBottom },
      { start: left, end: bottom },
      { start: right, end: bottom },
    ],
  };
}

function firstAlphaY(image, x) {
  for (let y = 0; y < image.height; y += 1) {
    if (image.pixels[(y * image.width + x) * 4 + 3] > 8) return y;
  }

  return 0;
}

function averageAlphaXAtY(image, y) {
  let total = 0;
  let count = 0;

  for (let x = 0; x < image.width; x += 1) {
    if (image.pixels[(y * image.width + x) * 4 + 3] <= 8) continue;

    total += x;
    count += 1;
  }

  if (count === 0) return Math.round((image.width - 1) / 2);

  return Math.round(total / count);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
