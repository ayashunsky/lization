import { clamp } from "./number-utils.js";

export function createTerrainRuntimeApi(deps) {
  const {
    terrain,
    baseTile,
    tile,
    ctx,
    tileImages,
    shoreOverlayImages,
    resourceOverlayImages,
    getCell,
    getEdgeNeighbor,
    getCornerNeighbor,
    getTileEdges,
    getTileCorners,
    getTerrainVariant,
    ensureCellVariant,
    getFoodOverlayDisplaySpec,
    hasFoodResource,
    isCellVisibleToPlayer,
    isoToScreen,
    drawDiamondPath,
  } = deps;

  const shoreOverlays = {
    edge: {
      northWest: "assets/tiles/shore/shore_edge_nw.png",
      northEast: "assets/tiles/shore/shore_edge_ne.png",
      southEast: "assets/tiles/shore/shore_edge_se.png",
      southWest: "assets/tiles/shore/shore_edge_sw.png",
    },
    corner: {
      north: "assets/tiles/shore/shore_corner_n.png",
      east: "assets/tiles/shore/shore_corner_e.png",
      south: "assets/tiles/shore/shore_corner_s.png",
      west: "assets/tiles/shore/shore_corner_w.png",
    },
  };

  const transitionRules = [
    {
      baseType: "water",
      neighborTypes: ["grass", "forest", "mountain"],
      drawEdge: drawShoreEdge,
      drawCorner: drawShoreCorner,
    },
  ];

  function getShoreOverlayPaths() {
    return [
      ...Object.values(shoreOverlays.edge),
      ...Object.values(shoreOverlays.corner),
    ];
  }

  function drawTileTerrain(cell) {
    if (!isCellVisibleToPlayer(cell)) {
      return;
    }

    const screen = isoToScreen(cell.x, cell.y);
    const spec = terrain[cell.type];
    const lift = 0;

    drawTileBase(cell, screen, lift, spec);
    drawTerrainTransitions(cell, screen, lift);
  }

  function drawTileBase(cell, screen, lift, spec) {
    const variantId = ensureCellVariant(cell);
    const variant = getTerrainVariant(cell.type, variantId);
    const image = variant ? tileImages[variant.image] : null;

    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(
        image,
        screen.x - tile.width / 2,
        screen.y - lift,
        tile.width,
        tile.height + tile.edge,
      );
      return;
    }

    drawProceduralTile(cell, screen, lift, spec);
  }

  function drawProceduralTile(cell, screen, lift, spec) {
    const left = screen.x - tile.width / 2;
    const right = screen.x + tile.width / 2;
    const midY = screen.y + tile.height / 2 - lift;
    const bottomY = screen.y + tile.height + tile.edge;

    ctx.beginPath();
    ctx.moveTo(screen.x - tile.width / 2, midY);
    ctx.lineTo(screen.x, screen.y + tile.height - lift);
    ctx.lineTo(screen.x, bottomY);
    ctx.lineTo(left, midY + tile.edge);
    ctx.closePath();
    ctx.fillStyle = shade(spec.side, -18);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(screen.x + tile.width / 2, midY);
    ctx.lineTo(screen.x, screen.y + tile.height - lift);
    ctx.lineTo(screen.x, bottomY);
    ctx.lineTo(right, midY + tile.edge);
    ctx.closePath();
    ctx.fillStyle = spec.side;
    ctx.fill();

    drawDiamondPath(screen.x, screen.y, lift);
    ctx.fillStyle = spec.top;
    ctx.fill();
    ctx.strokeStyle = spec.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    drawTerrainDetails(cell, screen, lift, spec);
  }

  function drawTerrainDetails(cell, screen, lift, spec) {
    const detailScale = tile.width / baseTile.width;
    const cx = screen.x;
    const cy = screen.y - lift;

    if (cell.type === "water") {
      ctx.strokeStyle = spec.detail;
      ctx.lineWidth = Math.max(1, 1.4 * detailScale);
      ctx.globalAlpha = 0.7;
      drawWave(cx - 18 * detailScale, cy + 20 * detailScale, 16 * detailScale);
      drawWave(cx + 4 * detailScale, cy + 29 * detailScale, 20 * detailScale);
      ctx.globalAlpha = 1;
      return;
    }

    if (cell.type === "forest") {
      drawTree(cx - 16 * detailScale, cy + 28 * detailScale, detailScale);
      drawTree(cx + 3 * detailScale, cy + 20 * detailScale, detailScale);
      drawTree(cx + 17 * detailScale, cy + 32 * detailScale, detailScale);
      return;
    }

    if (cell.type === "mountain") {
      ctx.strokeStyle = spec.detail;
      ctx.lineWidth = Math.max(1, 2 * detailScale);
      ctx.beginPath();
      ctx.moveTo(cx - 20 * detailScale, cy + 27 * detailScale);
      ctx.quadraticCurveTo(
        cx - 4 * detailScale,
        cy + 15 * detailScale,
        cx + 15 * detailScale,
        cy + 27 * detailScale,
      );
      ctx.stroke();
      ctx.lineWidth = Math.max(1, detailScale);
      ctx.beginPath();
      ctx.moveTo(cx - 12 * detailScale, cy + 36 * detailScale);
      ctx.quadraticCurveTo(
        cx + 5 * detailScale,
        cy + 27 * detailScale,
        cx + 25 * detailScale,
        cy + 36 * detailScale,
      );
      ctx.stroke();
      return;
    }

    ctx.strokeStyle = spec.detail;
    ctx.lineWidth = Math.max(1, 1.5 * detailScale);
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - 20 * detailScale, cy + 26 * detailScale);
    ctx.lineTo(cx - 12 * detailScale, cy + 23 * detailScale);
    ctx.moveTo(cx + 12 * detailScale, cy + 34 * detailScale);
    ctx.lineTo(cx + 22 * detailScale, cy + 30 * detailScale);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawCellResourceOverlay(cell, screen, lift) {
    if (!hasFoodResource(cell)) {
      return;
    }

    const overlaySpec = getFoodOverlayDisplaySpec(cell);

    if (overlaySpec?.imagePath && drawFoodOverlayImage(overlaySpec, screen, lift)) {
      return;
    }

    const scale = tile.width / baseTile.width;
    const cx = screen.x;
    const cy = screen.y - lift;

    ctx.save();

    if (cell.foodType === "grain") {
      ctx.strokeStyle = "rgba(229, 209, 107, 0.95)";
      ctx.lineWidth = Math.max(1, 1.4 * scale);
      drawGrainOverlay(cx, cy, scale);
      ctx.restore();
      return;
    }

    if (cell.foodType === "berries") {
      ctx.fillStyle = "rgba(188, 72, 94, 0.96)";
      ctx.strokeStyle = "rgba(111, 40, 60, 0.72)";
      ctx.lineWidth = Math.max(1, 0.8 * scale);
      drawBerriesOverlay(cx, cy, scale);
      ctx.restore();
      return;
    }

    if (cell.foodType === "mushrooms") {
      ctx.fillStyle = "rgba(210, 197, 170, 0.95)";
      ctx.strokeStyle = "rgba(125, 94, 73, 0.74)";
      ctx.lineWidth = Math.max(1, scale);
      drawMushroomOverlay(cx, cy, scale);
      ctx.restore();
    }
  }

  function drawFoodOverlayImage(overlaySpec, screen, lift) {
    const image = resourceOverlayImages[overlaySpec.imagePath];

    if (!image?.complete || image.naturalWidth <= 0) {
      return false;
    }

    const drawWidth = tile.width * overlaySpec.scale;
    const drawHeight = tile.height * overlaySpec.scale;
    const baseY = screen.y - lift + tile.height * overlaySpec.baseYFactor;

    ctx.save();
    ctx.globalAlpha = overlaySpec.opacity;
    ctx.drawImage(
      image,
      screen.x - drawWidth / 2,
      baseY - drawHeight,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
    return true;
  }

  function drawGrainOverlay(cx, cy, scale) {
    const stalks = [
      { x: -11, y: 34, tipX: -14, tipY: 18 },
      { x: -1, y: 36, tipX: -2, tipY: 16 },
      { x: 10, y: 34, tipX: 12, tipY: 19 },
    ];

    for (const stalk of stalks) {
      ctx.beginPath();
      ctx.moveTo(cx + stalk.x * scale, cy + stalk.y * scale);
      ctx.lineTo(cx + stalk.tipX * scale, cy + stalk.tipY * scale);
      ctx.stroke();
    }
  }

  function drawBerriesOverlay(cx, cy, scale) {
    const berries = [
      { x: -7, y: 26 },
      { x: 0, y: 20 },
      { x: 8, y: 27 },
      { x: -1, y: 31 },
    ];

    for (const berry of berries) {
      ctx.beginPath();
      ctx.arc(cx + berry.x * scale, cy + berry.y * scale, 3.6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawMushroomOverlay(cx, cy, scale) {
    const mushrooms = [
      { x: -7, y: 28, w: 7, h: 4 },
      { x: 6, y: 24, w: 8, h: 4.8 },
    ];

    for (const mushroom of mushrooms) {
      ctx.beginPath();
      ctx.ellipse(
        cx + mushroom.x * scale,
        cy + mushroom.y * scale,
        mushroom.w * scale,
        mushroom.h * scale,
        0,
        Math.PI,
        0,
        true,
      );
      ctx.stroke();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + (mushroom.x - 1) * scale, cy + mushroom.y * scale);
      ctx.lineTo(cx + (mushroom.x - 1) * scale, cy + (mushroom.y + 8) * scale);
      ctx.moveTo(cx + (mushroom.x + 2) * scale, cy + mushroom.y * scale);
      ctx.lineTo(cx + (mushroom.x + 2) * scale, cy + (mushroom.y + 8) * scale);
      ctx.stroke();
    }
  }

  function drawTerrainTransitions(cell, screen, lift) {
    for (const rule of transitionRules) {
      if (cell.type !== rule.baseType) {
        continue;
      }

      const edges = getTileEdges(screen, lift);

      for (const edge of edges) {
        const neighbor = getEdgeNeighbor(cell, edge.direction);

        if (!neighbor || !rule.neighborTypes.includes(neighbor.type)) {
          continue;
        }

        if (rule.drawEdge) {
          rule.drawEdge(edge, screen, lift);
        }
      }

      if (!rule.drawCorner) {
        continue;
      }

      for (const corner of getTileCorners(screen, lift)) {
        if (!shouldDrawCornerTransition(rule, cell, corner)) {
          continue;
        }

        rule.drawCorner(corner, screen, lift);
      }
    }
  }

  function shouldDrawCornerTransition(rule, cell, corner) {
    const cornerNeighbor = getCornerNeighbor(cell, corner.direction);

    if (!cornerNeighbor || !rule.neighborTypes.includes(cornerNeighbor.type)) {
      return false;
    }

    return corner.edgeDirections.every((edgeDirection) => {
      const edgeNeighbor = getEdgeNeighbor(cell, edgeDirection);
      return edgeNeighbor && edgeNeighbor.type === rule.baseType;
    });
  }

  function drawShoreEdge(edge, screen, lift) {
    if (drawShoreOverlay(shoreOverlays.edge[edge.direction], screen, lift)) {
      return;
    }

    drawProceduralShoreEdge(edge, screen, lift);
  }

  function drawProceduralShoreEdge(edge, screen, lift) {
    const scale = tile.width / baseTile.width;
    const shoreWidth = 10 * scale;
    const edgeMidpoint = {
      x: (edge.start.x + edge.end.x) / 2,
      y: (edge.start.y + edge.end.y) / 2,
    };
    const tileCenter = {
      x: screen.x,
      y: screen.y + tile.height / 2 - lift,
    };
    const inward = normalizeVector({
      x: tileCenter.x - edgeMidpoint.x,
      y: tileCenter.y - edgeMidpoint.y,
    });
    const innerStart = {
      x: edge.start.x + inward.x * shoreWidth,
      y: edge.start.y + inward.y * shoreWidth,
    };
    const innerEnd = {
      x: edge.end.x + inward.x * shoreWidth,
      y: edge.end.y + inward.y * shoreWidth,
    };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(edge.start.x, edge.start.y);
    ctx.lineTo(edge.end.x, edge.end.y);
    ctx.lineTo(innerEnd.x, innerEnd.y);
    ctx.lineTo(innerStart.x, innerStart.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(208, 190, 127, 0.9)";
    ctx.fill();

    ctx.strokeStyle = "rgba(245, 239, 198, 0.7)";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.beginPath();
    ctx.moveTo(innerStart.x, innerStart.y);
    ctx.lineTo(innerEnd.x, innerEnd.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawShoreCorner(corner, screen, lift) {
    if (drawShoreOverlay(shoreOverlays.corner[corner.direction], screen, lift)) {
      return;
    }

    drawProceduralShoreCorner(corner, screen, lift);
  }

  function drawShoreOverlay(imagePath, screen, lift) {
    const image = shoreOverlayImages[imagePath];

    if (!image?.complete || image.naturalWidth <= 0) {
      return false;
    }

    ctx.drawImage(
      image,
      screen.x - tile.width / 2,
      screen.y - lift,
      tile.width,
      tile.height + tile.edge,
    );

    return true;
  }

  function drawProceduralShoreCorner(corner, screen, lift) {
    const scale = tile.width / baseTile.width;
    const shoreLength = 15 * scale;
    const shoreDepth = 10 * scale;
    const tileCenter = {
      x: screen.x,
      y: screen.y + tile.height / 2 - lift,
    };
    const edgePointA = pointOnSegment(corner.point, corner.edgePoints[0], shoreLength);
    const edgePointB = pointOnSegment(corner.point, corner.edgePoints[1], shoreLength);
    const innerPoint = pointOnSegment(corner.point, tileCenter, shoreDepth);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(corner.point.x, corner.point.y);
    ctx.lineTo(edgePointA.x, edgePointA.y);
    ctx.quadraticCurveTo(innerPoint.x, innerPoint.y, edgePointB.x, edgePointB.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(208, 190, 127, 0.9)";
    ctx.fill();

    ctx.strokeStyle = "rgba(245, 239, 198, 0.7)";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.beginPath();
    ctx.moveTo(edgePointA.x, edgePointA.y);
    ctx.quadraticCurveTo(innerPoint.x, innerPoint.y, edgePointB.x, edgePointB.y);
    ctx.stroke();
    ctx.restore();
  }

  function pointOnSegment(start, end, distanceFromStart) {
    const direction = normalizeVector({
      x: end.x - start.x,
      y: end.y - start.y,
    });

    return {
      x: start.x + direction.x * distanceFromStart,
      y: start.y + direction.y * distanceFromStart,
    };
  }

  function normalizeVector(vector) {
    const length = Math.hypot(vector.x, vector.y) || 1;

    return {
      x: vector.x / length,
      y: vector.y / length,
    };
  }

  function drawWave(x, y, width) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + width * 0.25, y - 4, x + width * 0.5, y);
    ctx.quadraticCurveTo(x + width * 0.75, y + 4, x + width, y);
    ctx.stroke();
  }

  function drawTree(x, y, scale) {
    ctx.fillStyle = "#2a5032";
    ctx.beginPath();
    ctx.moveTo(x, y - 12 * scale);
    ctx.lineTo(x + 11 * scale, y + 9 * scale);
    ctx.lineTo(x - 11 * scale, y + 9 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#5b4330";
    ctx.fillRect(x - 2 * scale, y + 7 * scale, 4 * scale, 8 * scale);
  }

  function shade(hex, amount) {
    const value = Number.parseInt(hex.slice(1), 16);
    const r = clamp((value >> 16) + amount, 0, 255);
    const g = clamp(((value >> 8) & 255) + amount, 0, 255);
    const b = clamp((value & 255) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return {
    getShoreOverlayPaths,
    drawTileTerrain,
    drawCellResourceOverlay,
  };
}
