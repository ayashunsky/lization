const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outputSize = { width: 88, height: 44 };
const targetBoxes = {
  default: { minX: 16, minY: 8, maxX: 71, maxY: 41 },
  mushrooms: { minX: 16, minY: 8, maxX: 71, maxY: 41 },
  berries: { minX: 18, minY: 10, maxX: 69, maxY: 39 },
  grain: { minX: 10, minY: 2, maxX: 77, maxY: 42 },
};

if (require.main === module) {
  main();
}

function main() {
  const [, , sourcePath, outputPath, profile = "default"] = process.argv;

  if (!sourcePath || !outputPath) {
    console.error(
      "Usage: node tools/normalize-food-overlay-png.js <source.png> <output.png> [profile]",
    );
    process.exit(1);
  }

  const targetBox = targetBoxes[profile] || targetBoxes.default;
  const source = readPng(sourcePath);
  const prepared = stripBackgroundFromEdges(source);
  const sourceBox = alphaBounds(prepared);

  if (!sourceBox) {
    console.error(`No visible foreground found in ${sourcePath}`);
    process.exit(1);
  }

  const output = {
    width: outputSize.width,
    height: outputSize.height,
    pixels: Buffer.alloc(outputSize.width * outputSize.height * 4),
  };

  resampleContainAligned(prepared, sourceBox, output, targetBox);
  writePng(outputPath, output);

  console.log(
    [
      `source=${source.width}x${source.height}`,
      `foreground=${formatBox(sourceBox)}`,
      `output=${output.width}x${output.height}`,
      `target=${formatBox(targetBox)}`,
      `written=${outputPath}`,
    ].join("\n"),
  );
}

function stripBackgroundFromEdges(image) {
  const output = {
    width: image.width,
    height: image.height,
    pixels: Buffer.from(image.pixels),
  };

  const seeds = collectBorderSeedPixels(image);

  if (seeds.length === 0) {
    return output;
  }

  const reference = averageColor(seeds);
  const visited = new Uint8Array(image.width * image.height);
  const queue = [];

  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
    const index = y * image.width + x;
    if (visited[index]) return;
    visited[index] = 1;
    const color = getPixel(image, x, y);

    if (!isBackgroundCandidate(color, reference)) {
      return;
    }

    queue.push({ x, y });
  };

  for (let x = 0; x < image.width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, image.height - 1);
  }

  for (let y = 1; y < image.height - 1; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(image.width - 1, y);
  }

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    setPixelAlpha(output, x, y, 0);
    tryEnqueue(x - 1, y);
    tryEnqueue(x + 1, y);
    tryEnqueue(x, y - 1);
    tryEnqueue(x, y + 1);
  }

  return output;
}

function collectBorderSeedPixels(image) {
  const colors = [];

  for (let x = 0; x < image.width; x += 1) {
    colors.push(getPixel(image, x, 0));
    colors.push(getPixel(image, x, image.height - 1));
  }

  for (let y = 1; y < image.height - 1; y += 1) {
    colors.push(getPixel(image, 0, y));
    colors.push(getPixel(image, image.width - 1, y));
  }

  return colors.filter((color) => color[3] > 0);
}

function averageColor(colors) {
  const sum = [0, 0, 0, 0];

  for (const color of colors) {
    for (let i = 0; i < 4; i += 1) {
      sum[i] += color[i];
    }
  }

  return sum.map((value) => value / Math.max(1, colors.length));
}

function isBackgroundCandidate(color, reference) {
  const alphaDelta = Math.abs(color[3] - reference[3]);
  const rgbDistance = Math.hypot(
    color[0] - reference[0],
    color[1] - reference[1],
    color[2] - reference[2],
  );

  if (color[3] <= 12) {
    return true;
  }

  return alphaDelta <= 70 && rgbDistance <= 52;
}

function alphaBounds(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.pixels[(y * image.width + x) * 4 + 3];

      if (alpha <= 8) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return null;

  return { minX, minY, maxX, maxY };
}

function resampleContainAligned(source, sourceBox, output, targetBox) {
  const sourceWidth = sourceBox.maxX - sourceBox.minX + 1;
  const sourceHeight = sourceBox.maxY - sourceBox.minY + 1;
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const drawX = targetBox.minX + Math.floor((targetWidth - drawWidth) / 2);
  const drawY = targetBox.maxY - drawHeight + 1;

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const sourceX =
        sourceBox.minX + ((x + 0.5) / drawWidth) * sourceWidth - 0.5;
      const sourceY =
        sourceBox.minY + ((y + 0.5) / drawHeight) * sourceHeight - 0.5;
      const color = sampleBilinear(source, sourceX, sourceY);
      const targetOffset = ((drawY + y) * output.width + (drawX + x)) * 4;

      output.pixels[targetOffset] = color[0];
      output.pixels[targetOffset + 1] = color[1];
      output.pixels[targetOffset + 2] = color[2];
      output.pixels[targetOffset + 3] = color[3];
    }
  }
}

function readPng(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = buffer.subarray(0, 8);
  const expectedSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  if (!signature.equals(expectedSignature)) {
    throw new Error(`${filePath} is not a PNG file`);
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${filePath} must be an 8-bit RGBA PNG`);
  }

  const compressed = Buffer.concat(idat);
  const raw = zlib.inflateSync(compressed);
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * 4);
  let rawOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset];
    rawOffset += 1;
    const row = Buffer.from(raw.subarray(rawOffset, rawOffset + stride));
    rawOffset += stride;
    unfilter(row, previous, filter, bytesPerPixel);
    row.copy(pixels, y * stride);
    previous = row;
  }

  return { width, height, pixels };
}

function unfilter(row, previous, filter, bytesPerPixel) {
  for (let i = 0; i < row.length; i += 1) {
    const left = i >= bytesPerPixel ? row[i - bytesPerPixel] : 0;
    const up = previous[i] || 0;
    const upLeft = i >= bytesPerPixel ? previous[i - bytesPerPixel] || 0 : 0;

    if (filter === 1) {
      row[i] = (row[i] + left) & 255;
    } else if (filter === 2) {
      row[i] = (row[i] + up) & 255;
    } else if (filter === 3) {
      row[i] = (row[i] + Math.floor((left + up) / 2)) & 255;
    } else if (filter === 4) {
      row[i] = (row[i] + paeth(left, up, upLeft)) & 255;
    } else if (filter !== 0) {
      throw new Error(`Unsupported PNG filter type ${filter}`);
    }
  }
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
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

function setPixelAlpha(image, x, y, alpha) {
  const offset = (y * image.width + x) * 4 + 3;
  image.pixels[offset] = clamp(Math.round(alpha), 0, 255);
}

function writePng(filePath, image) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const raw = Buffer.alloc((image.width * 4 + 1) * image.height);

  for (let y = 0; y < image.height; y += 1) {
    const rowStart = y * (image.width * 4 + 1);
    raw[rowStart] = 0;
    image.pixels.copy(
      raw,
      rowStart + 1,
      y * image.width * 4,
      (y + 1) * image.width * 4,
    );
  }

  const chunks = [
    createChunk("IHDR", createIhdr(image.width, image.height)),
    createChunk("IDAT", zlib.deflateSync(raw)),
    createChunk("IEND", Buffer.alloc(0)),
  ];

  fs.writeFileSync(
    filePath,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      ...chunks,
    ]),
  );
}

function createIhdr(width, height) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatBox(box) {
  return `${box.minX},${box.minY}-${box.maxX},${box.maxY}`;
}
