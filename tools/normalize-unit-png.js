const { readPng, writePng } = require("./normalize-tile-png");

const [, , sourcePath, outputPath, profileName = "default"] = process.argv;

if (!sourcePath || !outputPath) {
  console.error("Usage: node tools/normalize-unit-png.js <source.png> <output.png> [default|work|play|fishing|fishingNorth]");
  process.exit(1);
}

const profile = getProfile(profileName);
const source = profile.preprocess ? profile.preprocess(readPng(sourcePath)) : readPng(sourcePath);
const sourceBox = profile.getSourceBox(source);

if (!sourceBox) {
  console.error(`No non-transparent pixels found in ${sourcePath}`);
  process.exit(1);
}

const target =
  profile.target || {
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

if (profile.fitMode === "matchHeight") {
  resampleMatchHeightIntoBox(source, sourceBox, output, target.box);
} else {
  resampleIntoBox(source, sourceBox, output, target.box);
}

const finalOutput =
  profile.postprocess === "stretchOpaqueHeight" ? stretchOpaqueHeight(output, target.box) : output;

writePng(outputPath, finalOutput);

console.log(
  [
    `source=${source.width}x${source.height}`,
    `sourceBox=${formatBox(sourceBox)}`,
    `output=${outputPath}`,
    `target=${target.width}x${target.height}`,
    `profile=${profileName}`,
  ].join("\n"),
);

function getProfile(name) {
  const profiles = {
    default: {
      getSourceBox: primaryOpaqueBounds,
      fitMode: "contain",
    },
    work: {
      getSourceBox: getWorkFigureBounds,
      fitMode: "matchHeight",
      postprocess: "stretchOpaqueHeight",
    },
    play: {
      getSourceBox: primaryOpaqueBounds,
      fitMode: "matchHeight",
      postprocess: "stretchOpaqueHeight",
    },
    fishing: {
      getSourceBox: primaryOpaqueBounds,
      fitMode: "matchHeight",
      target: {
        width: 160,
        height: 88,
        // Left-align the figure so the fishing line can extend far past the unit tile.
        box: {
          minX: 0,
          maxX: 155,
          minY: 0,
          maxY: 87,
        },
      },
    },
    fishingNorth: {
      getSourceBox: primaryOpaqueBounds,
      fitMode: "matchHeight",
      target: {
        width: 72,
        height: 116,
        box: {
          minX: 11,
          maxX: 60,
          minY: 0,
          maxY: 115,
        },
      },
    },
  };

  return profiles[name] || profiles.default;
}

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

function resampleMatchHeightIntoBox(sourceImage, sourceCrop, outputImage, targetBox) {
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const sourceWidth = sourceCrop.maxX - sourceCrop.minX + 1;
  const sourceHeight = sourceCrop.maxY - sourceCrop.minY + 1;
  const scale = targetHeight / sourceHeight;
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

      if (targetX < 0 || targetX >= outputImage.width || targetY < 0 || targetY >= outputImage.height) {
        continue;
      }

      const offset = (targetY * outputImage.width + targetX) * 4;

      outputImage.pixels[offset] = color[0];
      outputImage.pixels[offset + 1] = color[1];
      outputImage.pixels[offset + 2] = color[2];
      outputImage.pixels[offset + 3] = color[3];
    }
  }
}

function stretchOpaqueHeight(image, targetBox) {
  const opaqueBox = alphaBoundsAtThreshold(image, 8);

  if (!opaqueBox) {
    return image;
  }

  const output = {
    width: image.width,
    height: image.height,
    pixels: Buffer.alloc(image.width * image.height * 4),
  };

  resampleMatchHeightIntoBox(image, opaqueBox, output, targetBox);
  return output;
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

function getWorkFigureBounds(image) {
  const referenceHeight = 535;
  let best = null;

  for (let threshold = 8; threshold <= 255; threshold += 1) {
    const bounds = alphaBoundsAtThreshold(image, threshold);

    if (!bounds) continue;

    const height = bounds.maxY - bounds.minY + 1;
    const heightError = Math.abs(height - referenceHeight);

    if (
      !best ||
      heightError < best.heightError ||
      (heightError === best.heightError && threshold > best.threshold)
    ) {
      best = { bounds, heightError, threshold };
    }
  }

  return best?.bounds || primaryOpaqueBounds(image);
}

function alphaBoundsAtThreshold(image, threshold) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.pixels[(y * image.width + x) * 4 + 3];

      if (alpha < threshold) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0) {
    return null;
  }

  return { minX, minY, maxX, maxY };
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
