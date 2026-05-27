const { readPng, writePng, alphaBounds } = require("./normalize-tile-png");

const [, , sourcePath, outputPath, profileName = "default"] = process.argv;

if (!sourcePath || !outputPath) {
  console.error(
    "Usage: node tools/normalize-building-png.js <source.png> <output.png> [default|complete|berry|abandoned|half|construct]",
  );
  process.exit(1);
}

const source = readPng(sourcePath);
const profile = getProfile(profileName);
const sourceBox = profile.getSourceBox(source);

if (!sourceBox) {
  console.error(`No non-transparent pixels found in ${sourcePath}`);
  process.exit(1);
}

const target = {
  width: 176,
  height: 112,
  box: profile.targetBox,
};

const output = {
  width: target.width,
  height: target.height,
  pixels: Buffer.alloc(target.width * target.height * 4),
};

if (profile.fitMode === "crop") {
  resampleIntoBox(source, sourceBox, output, target.box);
} else {
  resampleByAnchorBox(source, sourceBox, output, target.box);
}
writePng(outputPath, output);

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
  const fullTarget = {
    minX: 20,
    maxX: 155,
    minY: 4,
    maxY: 109,
  };
  const profiles = {
    default: {
      targetBox: fullTarget,
      getSourceBox: (image) => alphaBounds(image),
      fitMode: "crop",
    },
    complete: {
      targetBox: fullTarget,
      getSourceBox: getCompletedHouseCrop,
      fitMode: "anchor",
    },
    berry: {
      targetBox: {
        minX: 48,
        maxX: 127,
        minY: 43,
        maxY: 105,
      },
      getSourceBox: getCompletedHouseCrop,
      fitMode: "anchor",
    },
    abandoned: {
      targetBox: {
        minX: 34,
        maxX: 141,
        minY: 12,
        maxY: 109,
      },
      getSourceBox: (image) => getLargestComponentBox(image),
      fitMode: "anchor",
    },
    half: {
      targetBox: fullTarget,
      getSourceBox: (image) => getHalfHouseCrop(image),
      fitMode: "crop",
    },
    construct: {
      targetBox: {
        minX: 14,
        maxX: 161,
        minY: 28,
        maxY: 109,
      },
      getSourceBox: (image) => getConstructionAnchorBox(image),
      fitMode: "anchor",
    },
  };

  return profiles[name] || profiles.default;
}

function getCompletedHouseCrop(image) {
  const components = getOpaqueComponents(image);

  if (components.length === 0) {
    return alphaBounds(image);
  }

  const main = components[0];
  const chimney = components.find(
    (component) =>
      component !== main &&
      component.maxY < main.minY &&
      component.count > 200,
  );

  if (!chimney) {
    return {
      minX: main.minX,
      minY: main.minY,
      maxX: main.maxX,
      maxY: main.maxY,
    };
  }

  const chimneyTop = Math.max(chimney.minY, chimney.maxY - 72);

  return {
    minX: Math.min(main.minX, chimney.minX),
    minY: Math.min(main.minY, chimneyTop),
    maxX: Math.max(main.maxX, chimney.maxX),
    maxY: Math.max(main.maxY, chimney.maxY),
  };
}

function getLargestComponentBox(image) {
  const [main] = getOpaqueComponents(image);
  return main || alphaBounds(image);
}

function getHalfHouseCrop(image) {
  const main = getLargestComponentBox(image);

  if (!main) {
    return alphaBounds(image);
  }

  return {
    minX: clamp(main.minX + 56, main.minX, main.maxX),
    minY: main.minY,
    maxX: clamp(main.maxX - 128, main.minX, main.maxX),
    maxY: main.maxY,
  };
}

function getConstructionAnchorBox(image) {
  const main = getLargestComponentBox(image);

  if (!main) {
    return alphaBounds(image);
  }

  return {
    minX: clamp(main.minX + 70, main.minX, main.maxX),
    minY: main.minY,
    maxX: clamp(main.maxX - 80, main.minX, main.maxX),
    maxY: main.maxY,
  };
}

function getOpaqueComponents(image) {
  const visited = new Uint8Array(image.width * image.height);
  const components = [];

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const index = y * image.width + x;

      if (visited[index]) continue;
      visited[index] = 1;

      if (image.pixels[index * 4 + 3] <= 8) continue;

      components.push(floodOpaqueComponent(image, x, y, visited));
    }
  }

  components.sort((a, b) => b.count - a.count);
  return components;
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
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
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

function resampleByAnchorBox(sourceImage, anchorBox, outputImage, targetBox) {
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const sourceWidth = anchorBox.maxX - anchorBox.minX + 1;
  const sourceHeight = anchorBox.maxY - anchorBox.minY + 1;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const scaledWidth = Math.max(1, Math.round(sourceWidth * scale));
  const scaledHeight = Math.max(1, Math.round(sourceHeight * scale));
  const anchorDestMinX = targetBox.minX + Math.floor((targetWidth - scaledWidth) / 2);
  const anchorDestMinY = targetBox.maxY - scaledHeight + 1;
  const translateX = anchorDestMinX - anchorBox.minX * scale;
  const translateY = anchorDestMinY - anchorBox.minY * scale;

  for (let y = 0; y < outputImage.height; y += 1) {
    for (let x = 0; x < outputImage.width; x += 1) {
      const sourceX = (x - translateX + 0.5) / scale - 0.5;
      const sourceY = (y - translateY + 0.5) / scale - 0.5;

      if (
        sourceX < -0.5 ||
        sourceX > sourceImage.width - 0.5 ||
        sourceY < -0.5 ||
        sourceY > sourceImage.height - 0.5
      ) {
        continue;
      }

      const color = sampleBilinear(sourceImage, sourceX, sourceY);
      const offset = (y * outputImage.width + x) * 4;

      outputImage.pixels[offset] = color[0];
      outputImage.pixels[offset + 1] = color[1];
      outputImage.pixels[offset + 2] = color[2];
      outputImage.pixels[offset + 3] = color[3];
    }
  }
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

function formatBox(box) {
  return `${box.minX},${box.minY}-${box.maxX},${box.maxY}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
