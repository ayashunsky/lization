import { clampInteger } from "./number-utils.js";

export function createOverlayRuntimeApi({
  map,
  baseTile,
  tile,
  ctx,
  getCell,
  getEdgeNeighbor,
  getCornerNeighbor,
  getNeighborByDirection,
  areCellsAdjacent,
  createCellKey,
  getPathWellKnownVisitsThreshold,
  getPathPreviewVisitsThreshold,
  isCellVisibleToPlayer,
  isPlayMode,
  isoToScreen,
}) {
  let pathRenderableCells = new Map();

  function doesSeasonSuppressPathEffects(cell) {
    return Boolean(cell) && cell.type === "grass" && cell.season === "winter2";
  }

  function getCellPathWellKnownVisitsThreshold(cell) {
    return getPathWellKnownVisitsThreshold(cell);
  }

  function getCellPathPreviewVisitsThreshold(cell) {
    return getPathPreviewVisitsThreshold(cell);
  }

  function getCellVisitsCount(cell) {
    if (!cell || cell.type !== "grass") {
      return 0;
    }

    return Math.max(0, clampInteger(cell.visitsCount, 0, getCellPathWellKnownVisitsThreshold(cell), 0));
  }

  function isWellKnownPathCell(cell) {
    return Boolean(cell) && cell.type === "grass" && getCellVisitsCount(cell) >= getCellPathWellKnownVisitsThreshold(cell);
  }

  function isPreviewPathCell(cell) {
    return Boolean(cell) && cell.type === "grass" && getCellVisitsCount(cell) >= getCellPathPreviewVisitsThreshold(cell);
  }

  function shouldIndexPathRenderableCell(cell) {
    return isPreviewPathCell(cell);
  }

  function syncPathRenderableCellIndexForCell(cell) {
    if (!cell || !Number.isInteger(cell.x) || !Number.isInteger(cell.y)) {
      return false;
    }

    const key = createCellKey(cell.x, cell.y);
    const shouldIndex = shouldIndexPathRenderableCell(cell);
    const hadEntry = pathRenderableCells.has(key);

    if (shouldIndex) {
      pathRenderableCells.set(key, cell);
      return !hadEntry || pathRenderableCells.get(key) !== cell;
    }

    if (hadEntry) {
      pathRenderableCells.delete(key);
      return true;
    }

    return false;
  }

  function rebuildPathRenderableCellIndex(cells = map.cells) {
    pathRenderableCells = new Map();

    if (!Array.isArray(cells)) {
      return pathRenderableCells;
    }

    for (const row of cells) {
      if (!Array.isArray(row)) {
        continue;
      }

      for (const cell of row) {
        if (shouldIndexPathRenderableCell(cell)) {
          pathRenderableCells.set(createCellKey(cell.x, cell.y), cell);
        }
      }
    }

    return pathRenderableCells;
  }

  function getPathStateBetween(fromCell, toCell) {
    if (!fromCell || !toCell || !areCellsAdjacent(fromCell.x, fromCell.y, toCell.x, toCell.y)) {
      return null;
    }

    if (doesSeasonSuppressPathEffects(fromCell) || doesSeasonSuppressPathEffects(toCell)) {
      return null;
    }

    if (isWellKnownPathCell(fromCell) && isWellKnownPathCell(toCell)) {
      return "full";
    }

    if (isPreviewPathCell(fromCell) && isPreviewPathCell(toCell)) {
      return "preview";
    }

    return null;
  }

  function hasFullPathBetween(fromCell, toCell) {
    return getPathStateBetween(fromCell, toCell) === "full";
  }

  function getPathCompletionPercent(cell) {
    return clampInteger(
      Math.round((getCellVisitsCount(cell) / getCellPathWellKnownVisitsThreshold(cell)) * 100),
      0,
      100,
      0,
    );
  }

  function getTileEdges(screen, lift) {
    const top = { x: screen.x, y: screen.y - lift };
    const right = {
      x: screen.x + tile.width / 2,
      y: screen.y + tile.height / 2 - lift,
    };
    const bottom = { x: screen.x, y: screen.y + tile.height - lift };
    const left = {
      x: screen.x - tile.width / 2,
      y: screen.y + tile.height / 2 - lift,
    };

    return [
      { direction: "northWest", start: top, end: left },
      { direction: "northEast", start: top, end: right },
      { direction: "southEast", start: right, end: bottom },
      { direction: "southWest", start: left, end: bottom },
    ];
  }

  function getTileCorners(screen, lift) {
    const top = { x: screen.x, y: screen.y - lift };
    const right = {
      x: screen.x + tile.width / 2,
      y: screen.y + tile.height / 2 - lift,
    };
    const bottom = { x: screen.x, y: screen.y + tile.height - lift };
    const left = {
      x: screen.x - tile.width / 2,
      y: screen.y + tile.height / 2 - lift,
    };

    return [
      {
        direction: "north",
        point: top,
        edgePoints: [left, right],
        edgeDirections: ["northWest", "northEast"],
      },
      {
        direction: "east",
        point: right,
        edgePoints: [top, bottom],
        edgeDirections: ["northEast", "southEast"],
      },
      {
        direction: "south",
        point: bottom,
        edgePoints: [right, left],
        edgeDirections: ["southEast", "southWest"],
      },
      {
        direction: "west",
        point: left,
        edgePoints: [bottom, top],
        edgeDirections: ["southWest", "northWest"],
      },
    ];
  }

  function getTileTopCenter(screen, lift = 0) {
    return {
      x: screen.x,
      y: screen.y + tile.height / 2 - lift,
    };
  }

  function getPathCurveMiddleControlPoint(fromPoint, toPoint, direction) {
    const midX = (fromPoint.x + toPoint.x) / 2;
    const midY = (fromPoint.y + toPoint.y) / 2;
    const bend = tile.width * 0.25;

    switch (direction) {
      case "east":
        return { x: midX, y: midY - bend * 0.5 };
      case "south":
        return { x: midX + bend * 0.55, y: midY };
      case "southEast":
        return { x: midX + bend * 0.65, y: midY - bend * 0.3 };
      case "southWest":
        return { x: midX - bend * 0.65, y: midY - bend * 0.3 };
      default:
        return { x: midX, y: midY };
    }
  }

  function drawPathNode(point, pathState) {
    if (pathState !== "full") {
      return;
    }

    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(3.4, tile.width * 0.06), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(12, 11, 10, 0.92)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1.8, tile.width * 0.04), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(254, 232, 111, 1)";
    ctx.fill();
  }

  function drawPathIntersectionCap(point, pathState) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1.3, tile.width * 0.055), 0, Math.PI * 2);
    ctx.fillStyle = pathState === "full" ? "rgba(254, 232, 111, 1)" : "rgba(151, 124, 82, 0.28)";
    ctx.fill();
  }

  function drawInspectorPathOverlay(context, isFull) {
    if (!context) {
      return;
    }

    const centerX = baseTile.width / 2;
    const centerY = baseTile.height / 2;

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    if (isFull) {
      context.strokeStyle = "rgba(12, 11, 10, 0.92)";
      context.lineWidth = Math.max(3.2, baseTile.width * 0.08);
      context.beginPath();
      context.moveTo(18, centerY + 1);
      context.quadraticCurveTo(centerX, centerY - 7, 70, centerY + 1);
      context.stroke();

      context.strokeStyle = "rgba(254, 232, 111, 1)";
      context.lineWidth = Math.max(2, baseTile.width * 0.05);
      context.beginPath();
      context.moveTo(18, centerY + 1);
      context.quadraticCurveTo(centerX, centerY - 7, 70, centerY + 1);
      context.stroke();

      context.beginPath();
      context.arc(centerX, centerY - 1, Math.max(1.8, baseTile.width * 0.026), 0, Math.PI * 2);
      context.fillStyle = "rgba(254, 232, 111, 1)";
      context.fill();
    } else {
      context.strokeStyle = "rgba(151, 124, 82, 0.28)";
      context.lineWidth = Math.max(1.4, baseTile.width * 0.04);
      context.beginPath();
      context.moveTo(18, centerY + 1);
      context.quadraticCurveTo(centerX, centerY - 7, 70, centerY + 1);
      context.stroke();

      context.beginPath();
      context.arc(centerX, centerY - 1, Math.max(1.5, baseTile.width * 0.022), 0, Math.PI * 2);
      context.fillStyle = "rgba(151, 124, 82, 0.28)";
      context.fill();
    }

    context.restore();
  }

  function drawFogBorders(cell, screen, lift) {
    if (!isPlayMode()) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "rgba(9, 12, 11, 0.52)";
    ctx.lineWidth = Math.max(10, tile.width * 0.19);
    ctx.lineCap = "round";

    for (const edge of getTileEdges(screen, lift)) {
      const neighbor = getEdgeNeighbor(cell, edge.direction);

      if (!neighbor || isCellVisibleToPlayer(neighbor)) {
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(edge.start.x, edge.start.y);
      ctx.lineTo(edge.end.x, edge.end.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function getVisiblePathStateBetween(fromCell, toCell) {
    if (!fromCell || !toCell || !isCellVisibleToPlayer(fromCell) || !isCellVisibleToPlayer(toCell)) {
      return null;
    }

    return getPathStateBetween(fromCell, toCell);
  }

  function getPathCrossingDescriptorsAtCorner(cell, cornerDirection) {
    switch (cornerDirection) {
      case "north":
        return {
          vertical: {
            fromCell: getCornerNeighbor(cell, "north"),
            toCell: cell,
            direction: "south",
          },
          horizontal: {
            fromCell: getEdgeNeighbor(cell, "northWest"),
            toCell: getEdgeNeighbor(cell, "northEast"),
            direction: "east",
          },
        };
      case "east":
        return {
          vertical: {
            fromCell: getEdgeNeighbor(cell, "northEast"),
            toCell: getEdgeNeighbor(cell, "southEast"),
            direction: "south",
          },
          horizontal: {
            fromCell: cell,
            toCell: getCornerNeighbor(cell, "east"),
            direction: "east",
          },
        };
      case "south":
        return {
          vertical: {
            fromCell: cell,
            toCell: getCornerNeighbor(cell, "south"),
            direction: "south",
          },
          horizontal: {
            fromCell: getEdgeNeighbor(cell, "southWest"),
            toCell: getEdgeNeighbor(cell, "southEast"),
            direction: "east",
          },
        };
      case "west":
        return {
          vertical: {
            fromCell: getEdgeNeighbor(cell, "northWest"),
            toCell: getEdgeNeighbor(cell, "southWest"),
            direction: "south",
          },
          horizontal: {
            fromCell: getCornerNeighbor(cell, "west"),
            toCell: cell,
            direction: "east",
          },
        };
      default:
        return null;
    }
  }

  function getPathDescriptorState(descriptor) {
    if (!descriptor) {
      return null;
    }

    return getVisiblePathStateBetween(descriptor.fromCell, descriptor.toCell);
  }

  function getPathDescriptorPoints(descriptor) {
    if (!descriptor?.fromCell || !descriptor?.toCell) {
      return null;
    }

    return getQuarticBezierPathPoints(
      getTileTopCenter(isoToScreen(descriptor.fromCell.x, descriptor.fromCell.y)),
      getTileTopCenter(isoToScreen(descriptor.toCell.x, descriptor.toCell.y)),
      descriptor.direction,
    );
  }

  function getSegmentIntersectionPoint(aStart, aEnd, bStart, bEnd) {
    const r = {
      x: aEnd.x - aStart.x,
      y: aEnd.y - aStart.y,
    };
    const s = {
      x: bEnd.x - bStart.x,
      y: bEnd.y - bStart.y,
    };
    const denominator = r.x * s.y - r.y * s.x;

    if (Math.abs(denominator) < 0.0001) {
      return null;
    }

    const startDelta = {
      x: bStart.x - aStart.x,
      y: bStart.y - aStart.y,
    };
    const u = (startDelta.x * r.y - startDelta.y * r.x) / denominator;
    const t = (startDelta.x * s.y - startDelta.y * s.x) / denominator;

    if (t < 0 || t > 1 || u < 0 || u > 1) {
      return null;
    }

    return {
      x: aStart.x + t * r.x,
      y: aStart.y + t * r.y,
    };
  }

  function findPolylineIntersectionPoint(firstPoints, secondPoints) {
    if (!Array.isArray(firstPoints) || !Array.isArray(secondPoints)) {
      return null;
    }

    for (let firstIndex = 0; firstIndex < firstPoints.length - 1; firstIndex += 1) {
      for (let secondIndex = 0; secondIndex < secondPoints.length - 1; secondIndex += 1) {
        const intersection = getSegmentIntersectionPoint(
          firstPoints[firstIndex],
          firstPoints[firstIndex + 1],
          secondPoints[secondIndex],
          secondPoints[secondIndex + 1],
        );

        if (intersection) {
          return intersection;
        }
      }
    }

    return null;
  }

  function getPathCrossingAtCorner(cell, corner) {
    const descriptors = getPathCrossingDescriptorsAtCorner(cell, corner.direction);

    if (!descriptors) {
      return null;
    }

    const verticalState = getPathDescriptorState(descriptors.vertical);
    const horizontalState = getPathDescriptorState(descriptors.horizontal);

    if (verticalState !== "full" || horizontalState !== "full") {
      return null;
    }

    return {
      pathState: "full",
      point:
        findPolylineIntersectionPoint(
          getPathDescriptorPoints(descriptors.vertical),
          getPathDescriptorPoints(descriptors.horizontal),
        ) || corner.point,
    };
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

  function trimSegmentEndpoints(fromPoint, toPoint, trimDistance = 0) {
    if (trimDistance <= 0) {
      return { fromPoint, toPoint };
    }

    const segmentLength = Math.hypot(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);
    const clampedTrim = Math.min(trimDistance, Math.max(0, segmentLength / 2 - 1));

    if (clampedTrim <= 0) {
      return { fromPoint, toPoint };
    }

    return {
      fromPoint: pointOnSegment(fromPoint, toPoint, clampedTrim),
      toPoint: pointOnSegment(toPoint, fromPoint, clampedTrim),
    };
  }

  function getQuarticBezierPathPoints(fromPoint, toPoint, direction, trimDistance = 0) {
    const trimmed = trimSegmentEndpoints(fromPoint, toPoint, trimDistance);
    const start = trimmed.fromPoint;
    const end = trimmed.toPoint;
    const tangent = normalizeVector({
      x: end.x - start.x,
      y: end.y - start.y,
    });
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y);
    const handleDistance = segmentLength * 0.24;
    const controlPoint = getPathCurveMiddleControlPoint(start, end, direction);
    const p1 = {
      x: start.x + tangent.x * handleDistance,
      y: start.y + tangent.y * handleDistance,
    };
    const p3 = {
      x: end.x - tangent.x * handleDistance,
      y: end.y - tangent.y * handleDistance,
    };
    const points = [];
    const steps = Math.max(12, Math.round(segmentLength / Math.max(8, tile.width * 0.12)));

    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      const inverse = 1 - t;
      const weight0 = inverse ** 4;
      const weight1 = 4 * inverse ** 3 * t;
      const weight2 = 6 * inverse ** 2 * t ** 2;
      const weight3 = 4 * inverse * t ** 3;
      const weight4 = t ** 4;

      points.push({
        x:
          weight0 * start.x +
          weight1 * p1.x +
          weight2 * controlPoint.x +
          weight3 * p3.x +
          weight4 * end.x,
        y:
          weight0 * start.y +
          weight1 * p1.y +
          weight2 * controlPoint.y +
          weight3 * p3.y +
          weight4 * end.y,
      });
    }

    return points;
  }

  function strokePathSegment(fromPoint, toPoint, direction, style) {
    const pathPoints = getQuarticBezierPathPoints(
      fromPoint,
      toPoint,
      direction,
      Number(style.trimDistance) || 0,
    );

    ctx.strokeStyle = style.strokeStyle;
    ctx.lineWidth = style.lineWidth;
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

    for (let index = 1; index < pathPoints.length; index += 1) {
      ctx.lineTo(pathPoints[index].x, pathPoints[index].y);
    }

    ctx.stroke();
  }

  function shouldRenderPathDirectionFromCell(cell, direction) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (direction === "southEast") {
      return !(
        (
          getPathStateBetween(cell, getCornerNeighbor(cell, "south")) &&
          getPathStateBetween(cell, getCornerNeighbor(cell, "east"))
        ) ||
        (
          neighbor &&
          getPathStateBetween(neighbor, getCornerNeighbor(neighbor, "north")) &&
          getPathStateBetween(neighbor, getCornerNeighbor(neighbor, "west"))
        )
      );
    }

    if (direction === "southWest") {
      return !(
        (
          getPathStateBetween(cell, getCornerNeighbor(cell, "south")) &&
          getPathStateBetween(cell, getCornerNeighbor(cell, "west"))
        ) ||
        (
          neighbor &&
          getPathStateBetween(neighbor, getCornerNeighbor(neighbor, "north")) &&
          getPathStateBetween(neighbor, getCornerNeighbor(neighbor, "east"))
        )
      );
    }

    return true;
  }

  function drawPaths() {
    const renderedDirections = ["east", "south", "southEast", "southWest"];
    const segments = [];
    const nodeStates = new Map();
    const nodeTouchCounts = new Map();
    const nodePoints = new Map();
    const crossingCaps = new Map();

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const cell of pathRenderableCells.values()) {
      if (!cell || !isCellVisibleToPlayer(cell) || doesSeasonSuppressPathEffects(cell)) {
        continue;
      }

      const screen = isoToScreen(cell.x, cell.y);
      const fromPoint = getTileTopCenter(screen);

      for (const direction of renderedDirections) {
        if (!shouldRenderPathDirectionFromCell(cell, direction)) {
          continue;
        }

        const neighbor = getNeighborByDirection(cell, direction);
        const pathState = getPathStateBetween(cell, neighbor);

        if (!neighbor || !pathState || !isCellVisibleToPlayer(neighbor)) {
          continue;
        }

        const toPoint = getTileTopCenter(isoToScreen(neighbor.x, neighbor.y));

        segments.push({
          direction,
          pathState,
          fromPoint,
          toPoint,
        });

        for (const endpointCell of [cell, neighbor]) {
          const nodeKey = createCellKey(endpointCell.x, endpointCell.y);
          const currentNodeState = nodeStates.get(nodeKey) || null;
          const currentTouchCount = nodeTouchCounts.get(nodeKey) || 0;

          nodeTouchCounts.set(nodeKey, currentTouchCount + 1);
          nodePoints.set(nodeKey, getTileTopCenter(isoToScreen(endpointCell.x, endpointCell.y)));

          if (pathState === "full" || !currentNodeState) {
            nodeStates.set(nodeKey, pathState);
          }
        }
      }

      for (const corner of getTileCorners(screen, 0)) {
        const crossing = getPathCrossingAtCorner(cell, corner);

        if (!crossing) {
          continue;
        }

        const capKey = `${corner.point.x.toFixed(2)},${corner.point.y.toFixed(2)}`;
        const existingCap = crossingCaps.get(capKey) || null;

        if (crossing.pathState === "full" || !existingCap) {
          crossingCaps.set(capKey, {
            point: crossing.point,
            pathState: crossing.pathState,
          });
        }
      }
    }

    for (const [nodeKey, nodeState] of nodeStates.entries()) {
      const touchCount = nodeTouchCounts.get(nodeKey) || 0;
      const point = nodePoints.get(nodeKey) || null;

      if (!nodeState || touchCount < 2 || !point) {
        continue;
      }

      drawPathNode(point, nodeState);
    }

    for (const segment of segments) {
      if (segment.pathState === "full") {
        strokePathSegment(segment.fromPoint, segment.toPoint, segment.direction, {
          strokeStyle: "rgba(12, 11, 10, 0.92)",
          lineWidth: Math.max(3.8, tile.width * 0.095),
          trimDistance: tile.width * 0.06,
        });
        strokePathSegment(segment.fromPoint, segment.toPoint, segment.direction, {
          strokeStyle: "rgba(254, 232, 111, 1)",
          lineWidth: Math.max(2.2, tile.width * 0.065),
        });
      } else {
        strokePathSegment(segment.fromPoint, segment.toPoint, segment.direction, {
          strokeStyle: "rgba(151, 124, 82, 0.28)",
          lineWidth: Math.max(1.5, tile.width * 0.045),
        });
      }
    }

    for (const cap of crossingCaps.values()) {
      drawPathIntersectionCap(cap.point, cap.pathState);
    }

    ctx.restore();
  }

  return {
    doesSeasonSuppressPathEffects,
    getCellPathWellKnownVisitsThreshold,
    getCellPathPreviewVisitsThreshold,
    getCellVisitsCount,
    isWellKnownPathCell,
    isPreviewPathCell,
    getPathCompletionPercent,
    syncPathRenderableCellIndexForCell,
    rebuildPathRenderableCellIndex,
    getPathStateBetween,
    hasFullPathBetween,
    drawInspectorPathOverlay,
    drawFogBorders,
    getTileEdges,
    getTileCorners,
    drawPaths,
  };
}
