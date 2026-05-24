const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const scale = 2;
const tile = {
  width: 88 * scale,
  height: 44 * scale,
  edge: 12 * scale,
};
const outDir = path.join(__dirname, "..", "game", "assets", "tiles");

const terrains = {
  water: {
    top: "#3d8bb4",
    side: "#27627f",
    stroke: "#23536b",
    detail: "#b7dcec",
  },
  grass: {
    top: "#77a85b",
    side: "#4e7a42",
    stroke: "#426b39",
    detail: "#cae386",
  },
  forest: {
    top: "#4d8a54",
    side: "#315f3c",
    stroke: "#2d5435",
    detail: "#1f4f32",
  },
  hill: {
    top: "#a79569",
    side: "#7b684d",
    stroke: "#68583f",
    detail: "#e0d2a1",
  },
};

class Bitmap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = Buffer.alloc(width * height * 4);
  }

  setPixel(x, y, color) {
    const px = Math.round(x);
    const py = Math.round(y);

    if (px < 0 || px >= this.width || py < 0 || py >= this.height) return;

    const offset = (py * this.width + px) * 4;
    const sourceAlpha = color[3] / 255;
    const targetAlpha = this.pixels[offset + 3] / 255;
    const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

    if (outAlpha <= 0) return;

    for (let channel = 0; channel < 3; channel += 1) {
      this.pixels[offset + channel] = Math.round(
        (color[channel] * sourceAlpha +
          this.pixels[offset + channel] * targetAlpha * (1 - sourceAlpha)) /
          outAlpha,
      );
    }

    this.pixels[offset + 3] = Math.round(outAlpha * 255);
  }

  fillPolygon(points, color) {
    const minX = Math.floor(Math.min(...points.map((point) => point.x)));
    const maxX = Math.ceil(Math.max(...points.map((point) => point.x)));
    const minY = Math.floor(Math.min(...points.map((point) => point.y)));
    const maxY = Math.ceil(Math.max(...points.map((point) => point.y)));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (pointInPolygon({ x: x + 0.5, y: y + 0.5 }, points)) {
          this.setPixel(x, y, color);
        }
      }
    }
  }

  drawLine(start, end, color, width = 1) {
    const minX = Math.floor(Math.min(start.x, end.x) - width);
    const maxX = Math.ceil(Math.max(start.x, end.x) + width);
    const minY = Math.floor(Math.min(start.y, end.y) - width);
    const maxY = Math.ceil(Math.max(start.y, end.y) + width);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (distanceToSegment({ x, y }, start, end) <= width / 2) {
          this.setPixel(x, y, color);
        }
      }
    }
  }

  fillCircle(center, radius, color) {
    const minX = Math.floor(center.x - radius);
    const maxX = Math.ceil(center.x + radius);
    const minY = Math.floor(center.y - radius);
    const maxY = Math.ceil(center.y + radius);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (Math.hypot(x - center.x, y - center.y) <= radius) {
          this.setPixel(x, y, color);
        }
      }
    }
  }
}

function makeTile(type, spec) {
  const bitmap = new Bitmap(tile.width, tile.height + tile.edge);
  const top = { x: tile.width / 2, y: 0 };
  const right = { x: tile.width, y: tile.height / 2 };
  const bottom = { x: tile.width / 2, y: tile.height };
  const left = { x: 0, y: tile.height / 2 };
  const lowerBottom = { x: tile.width / 2, y: tile.height + tile.edge };
  const lowerLeft = { x: 0, y: tile.height / 2 + tile.edge };
  const lowerRight = { x: tile.width, y: tile.height / 2 + tile.edge };
  const topColor = parseHex(spec.top);
  const sideColor = parseHex(spec.side);
  const strokeColor = parseHex(spec.stroke);
  const detailColor = parseHex(spec.detail);

  bitmap.fillPolygon([left, bottom, lowerBottom, lowerLeft], shade(sideColor, -18));
  bitmap.fillPolygon([right, bottom, lowerBottom, lowerRight], sideColor);
  bitmap.fillPolygon([top, right, bottom, left], topColor);

  addTerrainTexture(bitmap, type, detailColor);

  for (const [start, end] of [
    [top, right],
    [right, bottom],
    [bottom, left],
    [left, top],
    [left, lowerLeft],
    [right, lowerRight],
    [lowerLeft, lowerBottom],
    [lowerBottom, lowerRight],
  ]) {
    bitmap.drawLine(start, end, strokeColor, 1.4 * scale);
  }

  return bitmap;
}

function addTerrainTexture(bitmap, type, detailColor) {
  if (type === "water") {
    drawWave(bitmap, 26, 23, 22, detailColor);
    drawWave(bitmap, 74, 35, 30, detailColor);
    drawWave(bitmap, 112, 53, 24, detailColor);
    return;
  }

  if (type === "forest") {
    drawTree(bitmap, 50, 57, 1.15, detailColor);
    drawTree(bitmap, 88, 42, 1.3, detailColor);
    drawTree(bitmap, 122, 62, 1.05, detailColor);
    return;
  }

  if (type === "hill") {
    drawSoftLine(bitmap, [
      { x: 48 * scale, y: 27 * scale },
      { x: 65 * scale, y: 17 * scale },
      { x: 88 * scale, y: 26 * scale },
    ], detailColor, 2.3 * scale);
    drawSoftLine(bitmap, [
      { x: 60 * scale, y: 38 * scale },
      { x: 84 * scale, y: 30 * scale },
      { x: 116 * scale, y: 38 * scale },
    ], detailColor, 1.6 * scale);
    return;
  }

  drawGrass(bitmap, 42, 52, detailColor);
  drawGrass(bitmap, 70, 37, detailColor);
  drawGrass(bitmap, 116, 55, detailColor);
}

function drawWave(bitmap, x, y, width, color) {
  const points = [
    { x: x * scale, y: y * scale },
    { x: (x + width * 0.5) * scale, y: (y - 4) * scale },
    { x: (x + width) * scale, y: y * scale },
  ];
  drawSoftLine(bitmap, points, [...color.slice(0, 3), 190], 1.4 * scale);
}

function drawTree(bitmap, x, y, size, color) {
  const trunk = parseHex("#5b4330");
  const crown = parseHex("#1f4f32");
  const sx = x * scale;
  const sy = y * scale;
  const treeScale = size * scale;

  bitmap.fillPolygon(
    [
      { x: sx, y: sy - 13 * treeScale },
      { x: sx + 12 * treeScale, y: sy + 8 * treeScale },
      { x: sx - 12 * treeScale, y: sy + 8 * treeScale },
    ],
    crown,
  );
  bitmap.fillPolygon(
    [
      { x: sx - 2.2 * treeScale, y: sy + 6 * treeScale },
      { x: sx + 2.2 * treeScale, y: sy + 6 * treeScale },
      { x: sx + 2.2 * treeScale, y: sy + 14 * treeScale },
      { x: sx - 2.2 * treeScale, y: sy + 14 * treeScale },
    ],
    trunk,
  );
  bitmap.drawLine(
    { x: sx - 7 * treeScale, y: sy + 3 * treeScale },
    { x: sx + 7 * treeScale, y: sy + 3 * treeScale },
    [...color.slice(0, 3), 100],
    1,
  );
}

function drawGrass(bitmap, x, y, color) {
  const sx = x * scale;
  const sy = y * scale;

  bitmap.drawLine({ x: sx, y: sy }, { x: sx + 10 * scale, y: sy - 5 * scale }, color, 1.4 * scale);
  bitmap.drawLine(
    { x: sx + 4 * scale, y: sy + 3 * scale },
    { x: sx + 14 * scale, y: sy - 1 * scale },
    [...color.slice(0, 3), 150],
    1.2 * scale,
  );
}

function drawSoftLine(bitmap, points, color, width) {
  for (let i = 0; i < points.length - 1; i += 1) {
    bitmap.drawLine(points[i], points[i + 1], color, width);
  }
}

function writePng(filePath, bitmap) {
  const raw = Buffer.alloc((bitmap.width * 4 + 1) * bitmap.height);

  for (let y = 0; y < bitmap.height; y += 1) {
    const rowStart = y * (bitmap.width * 4 + 1);
    raw[rowStart] = 0;
    bitmap.pixels.copy(
      raw,
      rowStart + 1,
      y * bitmap.width * 4,
      (y + 1) * bitmap.width * 4,
    );
  }

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk("IHDR", makeIhdr(bitmap.width, bitmap.height)),
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

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };

  return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function parseHex(hex) {
  const value = Number.parseInt(hex.slice(1), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

function shade(color, amount) {
  return [
    clamp(color[0] + amount, 0, 255),
    clamp(color[1] + amount, 0, 255),
    clamp(color[2] + amount, 0, 255),
    color[3],
  ];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

fs.mkdirSync(outDir, { recursive: true });

for (const [type, spec] of Object.entries(terrains)) {
  writePng(path.join(outDir, `${type}.png`), makeTile(type, spec));
}
