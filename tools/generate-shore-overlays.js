const path = require("path");
const { readPng, writePng } = require("./normalize-tile-png");

const [
  ,
  ,
  sourcePath = "bck/tiles/alt_shoreline_normalized.png",
  outputDir = "game/assets/tiles/shore",
] = process.argv;

const source = readPng(sourcePath);
const geometry = getTileGeometry(source);
const edgeWidth = Math.round(source.width * 0.057);
const upperEdgeWidth = Math.round(source.width * 0.0525);
const edgeFeather = Math.max(3, Math.round(source.width * 0.02));

const edgeOverlays = {
  shore_edge_nw: { start: geometry.top, end: geometry.left, width: upperEdgeWidth },
  shore_edge_ne: { start: geometry.top, end: geometry.right, width: upperEdgeWidth },
  shore_edge_se: { start: geometry.right, end: geometry.bottom, width: edgeWidth },
  shore_edge_sw: { start: geometry.left, end: geometry.bottom, width: edgeWidth },
};

const cornerOverlays = {
  shore_corner_n: [edgeOverlays.shore_edge_nw, edgeOverlays.shore_edge_ne],
  shore_corner_e: [edgeOverlays.shore_edge_ne, edgeOverlays.shore_edge_se],
  shore_corner_s: [edgeOverlays.shore_edge_se, edgeOverlays.shore_edge_sw],
  shore_corner_w: [edgeOverlays.shore_edge_sw, edgeOverlays.shore_edge_nw],
};

for (const [name, edge] of Object.entries(edgeOverlays)) {
  writeOverlay(`${name}.png`, (point) => {
    if (!pointInPolygon(point, geometry.topDiamond)) return 0;

    const edgeMask = getEdgeStripMask(point, edge);

    if (edgeMask <= 0) return 0;

    return edgeMask;
  });
}

for (const [name, [edgeA, edgeB]] of Object.entries(cornerOverlays)) {
  writeOverlay(`${name}.png`, (point) => {
    if (!pointInPolygon(point, geometry.topDiamond)) return 0;

    return Math.min(getEdgeStripMask(point, edgeA), getEdgeStripMask(point, edgeB));
  });
}

function writeOverlay(fileName, getMaskAlpha) {
  const output = {
    width: source.width,
    height: source.height,
    pixels: Buffer.alloc(source.width * source.height * 4),
  };

  let pixelCount = 0;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const offset = (y * source.width + x) * 4;
      const sourceAlpha = source.pixels[offset + 3];

      if (sourceAlpha <= 8) continue;

      const maskAlpha = getMaskAlpha({ x: x + 0.5, y: y + 0.5 });

      if (maskAlpha <= 0) continue;

      output.pixels[offset] = source.pixels[offset];
      output.pixels[offset + 1] = source.pixels[offset + 1];
      output.pixels[offset + 2] = source.pixels[offset + 2];
      output.pixels[offset + 3] = Math.round(sourceAlpha * maskAlpha);
      pixelCount += 1;
    }
  }

  const outputPath = path.join(outputDir, fileName);
  writePng(outputPath, output);
  console.log(`${outputPath}: ${output.width}x${output.height}, pixels=${pixelCount}`);
}

function getTileGeometry(image) {
  const top = { x: image.width / 2, y: 0 };
  const right = { x: image.width, y: image.height * (44 / 112) };
  const bottom = { x: image.width / 2, y: image.height * (88 / 112) };
  const left = { x: 0, y: image.height * (44 / 112) };

  return {
    top,
    right,
    bottom,
    left,
    center: { x: image.width / 2, y: image.height * (44 / 112) },
    topDiamond: [top, right, bottom, left],
  };
}

function softMask(width, feather, distance) {
  if (distance <= width - feather) return 1;
  if (distance >= width + feather) return 0;

  return (width + feather - distance) / (feather * 2);
}

function getEdgeStripMask(point, edge) {
  const projection = projectOntoLine(point, edge.start, edge.end);

  return softMask(edge.width, edgeFeather, projection.distanceFromLine);
}

function projectOntoLine(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const length = Math.sqrt(lengthSquared);
  const t =
    lengthSquared === 0
      ? 0
      : ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  const closestX = start.x + dx * t;
  const closestY = start.y + dy * t;

  return {
    distanceAlong: t * length,
    distanceFromLine: Math.hypot(point.x - closestX, point.y - closestY),
    length,
  };
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
