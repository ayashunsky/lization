const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

if (require.main === module) {
  main();
}

function main() {
  const [, , sourcePath, referencePath, outputPath] = process.argv;

  if (!sourcePath || !referencePath || !outputPath) {
    console.error(
      "Usage: node tools/normalize-tile-png.js <source.png> <reference.png> <output.png>",
    );
    process.exit(1);
  }

  const source = readPng(sourcePath);
  const reference = readPng(referencePath);
  const sourceBox = alphaBounds(source);
  const referenceBox = alphaBounds(reference);

  if (!sourceBox) {
    console.error(`No non-transparent pixels found in ${sourcePath}`);
    process.exit(1);
  }

  if (!referenceBox) {
    console.error(`No non-transparent pixels found in ${referencePath}`);
    process.exit(1);
  }

  const output = {
    width: reference.width,
    height: reference.height,
    pixels: Buffer.alloc(reference.width * reference.height * 4),
  };

  resampleBox(source, sourceBox, output, referenceBox);
  writePng(outputPath, output);

  console.log(
    [
      `source=${source.width}x${source.height}`,
      `sourceBox=${formatBox(sourceBox)}`,
      `reference=${reference.width}x${reference.height}`,
      `referenceBox=${formatBox(referenceBox)}`,
      `output=${outputPath}`,
    ].join("\n"),
  );
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

function resampleBox(source, sourceBox, output, targetBox) {
  const targetWidth = targetBox.maxX - targetBox.minX + 1;
  const targetHeight = targetBox.maxY - targetBox.minY + 1;
  const sourceWidth = sourceBox.maxX - sourceBox.minX + 1;
  const sourceHeight = sourceBox.maxY - sourceBox.minY + 1;

  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX =
        sourceBox.minX + ((x + 0.5) / targetWidth) * sourceWidth - 0.5;
      const sourceY =
        sourceBox.minY + ((y + 0.5) / targetHeight) * sourceHeight - 0.5;
      const color = sampleBilinear(source, sourceX, sourceY);
      const targetX = targetBox.minX + x;
      const targetY = targetBox.minY + y;
      const targetOffset = (targetY * output.width + targetX) * 4;

      output.pixels[targetOffset] = color[0];
      output.pixels[targetOffset + 1] = color[1];
      output.pixels[targetOffset + 2] = color[2];
      output.pixels[targetOffset + 3] = color[3];
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

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk("IHDR", makeIhdr(image.width, image.height)),
    makeChunk("IDAT", zlib.deflateSync(raw)),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
}

function makeIhdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
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

module.exports = {
  alphaBounds,
  readPng,
  resampleBox,
  writePng,
};
