import {
  clamp,
  clampInteger,
  clampNumber,
  clampNonNegativeNumber,
} from "./number-utils.js";

export function createConstructiblesApi(deps) {
  const {
    rules,
    map,
    tile,
    zoomLevels,
    ctx,
    buildingImages,
    vehicleImages,
    getZoomIndex,
    getBuildings,
    getVehicles,
    getBuildingCatalog,
    getVehicleCatalog,
    getCell,
    getNeighborByDirection,
    getMovementDirections,
    createCellKey,
    getRuleContext,
    matchesRequirements,
    hasSufficientQuantity,
    getCurrentStockpileAmount,
    spendFromStockpile,
    canPlaceNewBuildingConstructionOnCell,
    canPlaceNewVehicleConstructionOnCell,
    markCellVisited,
    normalizeLinkedEntityId,
    normalizeBuildingState,
    getVehicleCargoCapacity,
    normalizeVehicleCargo,
    drawNativeSingleCellImageAtCell,
    isoToScreen,
  } = deps;

  function normalizeConstructibleKind(kind) {
    return kind === "vehicle" ? "vehicle" : "building";
  }

  function getConstructibleCollectionForKind(kind) {
    return normalizeConstructibleKind(kind) === "vehicle" ? getVehicles() : getBuildings();
  }

  function getConstructibleRulesForKind(kind, type) {
    return normalizeConstructibleKind(kind) === "vehicle"
      ? (rules.vehicles?.[type] || null)
      : (rules.buildings?.[type] || null);
  }

  function cloneBuildingRulesForEvaluation(rulesEntry) {
    const base = rulesEntry && typeof rulesEntry === "object" ? rulesEntry : {};

    return {
      ...base,
      buildCost: base.buildCost ? { ...base.buildCost } : undefined,
      resourceStorageCapacities: base.resourceStorageCapacities ? { ...base.resourceStorageCapacities } : undefined,
      constructionVisualThresholds: base.constructionVisualThresholds ? { ...base.constructionVisualThresholds } : undefined,
      availability: base.availability ? { ...base.availability } : undefined,
      limits: base.limits ? { ...base.limits } : undefined,
      modifiers: Array.isArray(base.modifiers) ? [...base.modifiers] : undefined,
    };
  }

  function applyBuildingRulesModifiers(rulesEntry, context = getRuleContext()) {
    const resolved = cloneBuildingRulesForEvaluation(rulesEntry);
    const modifiers = Array.isArray(resolved.modifiers) ? resolved.modifiers : [];

    for (const modifier of modifiers) {
      if (!modifier || !matchesRequirements(modifier.when, context)) {
        continue;
      }

      const set = modifier.set && typeof modifier.set === "object" ? modifier.set : null;

      if (!set) {
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(set, "walkable")) {
        resolved.walkable = Boolean(set.walkable);
      }

      if (Object.prototype.hasOwnProperty.call(set, "foundationActionAvailable")) {
        resolved.foundationActionAvailable = Boolean(set.foundationActionAvailable);
      }

      if (Number.isFinite(set.constructionCost)) {
        resolved.constructionCost = set.constructionCost;
      }

      if (set.buildCost && typeof set.buildCost === "object") {
        resolved.buildCost = {
          ...(resolved.buildCost || {}),
          ...set.buildCost,
        };
      }

      if (set.resourceStorageCapacities && typeof set.resourceStorageCapacities === "object") {
        resolved.resourceStorageCapacities = {
          ...(resolved.resourceStorageCapacities || {}),
          ...set.resourceStorageCapacities,
        };
      }

      if (set.constructionVisualThresholds && typeof set.constructionVisualThresholds === "object") {
        resolved.constructionVisualThresholds = {
          ...(resolved.constructionVisualThresholds || {}),
          ...set.constructionVisualThresholds,
        };
      }

      if (Number.isFinite(set.abandonedDecayPerTurn)) {
        resolved.abandonedDecayPerTurn = set.abandonedDecayPerTurn;
      }

      if (Number.isFinite(set.happinessPerTurn)) {
        resolved.happinessPerTurn = set.happinessPerTurn;
      }
    }

    return resolved;
  }

  function getEffectiveConstructibleRulesForKind(kind, type, context = getRuleContext()) {
    return applyBuildingRulesModifiers(getConstructibleRulesForKind(kind, type), context);
  }

  function getConstructibleSpecForKind(kind, type) {
    const catalog = normalizeConstructibleKind(kind) === "vehicle"
      ? getVehicleCatalog()
      : getBuildingCatalog();
    return catalog[type] || null;
  }

  function getDefinedConstructibleTypesForKind(kind) {
    const catalog = normalizeConstructibleKind(kind) === "vehicle"
      ? getVehicleCatalog()
      : getBuildingCatalog();
    return Object.keys(catalog).filter((type) => Boolean(type) && Boolean(getConstructibleRulesForKind(kind, type)));
  }

  function getConstructibleCountsByTypeForKind(kind, { includeConstruction = true } = {}) {
    const counts = {};

    for (const constructible of getConstructibleCollectionForKind(kind)) {
      if (!constructible) {
        continue;
      }

      if (!includeConstruction && constructible.state === "construction") {
        continue;
      }

      counts[constructible.type] = (counts[constructible.type] || 0) + 1;
    }

    return counts;
  }

  function getConstructibleImageRegistryForKind(kind) {
    return normalizeConstructibleKind(kind) === "vehicle" ? vehicleImages : buildingImages;
  }

  function getConstructibleRenderModeForKind(kind, type) {
    return getConstructibleSpecForKind(kind, type)?.renderMode || "singleTile";
  }

  function getConstructibleSubtypeVariantsForKind(kind, type) {
    return getConstructibleSpecForKind(kind, type)?.subtypes || [];
  }

  function chooseConstructibleSubtypeForKind(kind, type) {
    const variants = getConstructibleSubtypeVariantsForKind(kind, type);

    if (variants.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * variants.length);
    return variants[index].id;
  }

  function getDefaultConstructibleDimensionForKind(kind, dimension) {
    const defaults = normalizeConstructibleKind(kind) === "vehicle"
      ? rules.vehicles?.default
      : rules.buildings?.default;
    return Math.max(1, clampInteger(defaults?.[dimension], 1, 16, 1));
  }

  function getConstructibleBottomRowForKind(kind, constructible) {
    if (!constructible) {
      return -1;
    }

    const occupiedCells = getConstructibleOccupiedCellsForKind(kind, constructible);

    if (occupiedCells.length === 0) {
      return constructible.y;
    }

    return Math.max(...occupiedCells.map((cell) => cell.y));
  }

  function getConstructibleDimensionForKind(kind, type, dimension) {
    return Math.max(
      1,
      clampInteger(
        getConstructibleRulesForKind(kind, type)?.[dimension],
        1,
        16,
        getDefaultConstructibleDimensionForKind(kind, dimension),
      ),
    );
  }

  function normalizeConstructibleFootprintStep(direction) {
    return getMovementDirections().includes(direction) ? direction : null;
  }

  function getReverseConstructibleFootprintStep(direction) {
    const reverseDirections = {
      north: "south",
      northEast: "southWest",
      east: "west",
      southEast: "northWest",
      south: "north",
      southWest: "northEast",
      west: "east",
      northWest: "southEast",
    };

    return reverseDirections[direction] || null;
  }

  function getConstructibleFootprintPathsForKind(kind, type) {
    const rawFootprint = getConstructibleRulesForKind(kind, type)?.footprint;

    if (!Array.isArray(rawFootprint) || rawFootprint.length === 0) {
      return null;
    }

    const normalized = rawFootprint
      .map((path) => {
        if (!Array.isArray(path)) {
          return null;
        }

        const steps = path.map(normalizeConstructibleFootprintStep);
        return steps.every(Boolean) ? steps : null;
      })
      .filter(Boolean);

    return normalized.length > 0 ? normalized : null;
  }

  function getConstructiblePlacementTerrainRulesForKind(kind, type) {
    const placementTerrains = getConstructibleRulesForKind(kind, type)?.placementTerrains;

    if (!Array.isArray(placementTerrains) || placementTerrains.length === 0) {
      return null;
    }

    return placementTerrains.map((terrainList) =>
      Array.isArray(terrainList)
        ? terrainList.filter((terrainType) => typeof terrainType === "string" && terrainType.trim())
        : null,
    );
  }

  function getConstructiblePlacementEntriesForKind(kind, originCell, type) {
    if (!originCell) {
      return [];
    }

    const footprintPaths = getConstructibleFootprintPathsForKind(kind, type);
    const placementTerrainRules = getConstructiblePlacementTerrainRulesForKind(kind, type);

    if (!footprintPaths) {
      const width = getConstructibleDimensionForKind(kind, type, "width");
      const height = getConstructibleDimensionForKind(kind, type, "height");
      const entries = [];
      let placementIndex = 0;

      for (let offsetY = 0; offsetY < height; offsetY += 1) {
        for (let offsetX = 0; offsetX < width; offsetX += 1) {
          const cell = getCell(
            originCell.x + offsetX,
            originCell.y + offsetY * 2,
          );

          if (!cell) {
            return [];
          }

          entries.push({
            cell,
            allowedTerrains: placementTerrainRules?.[placementIndex] || null,
          });
          placementIndex += 1;
        }
      }

      return entries;
    }

    const entries = [];
    const seenKeys = new Set();

    footprintPaths.forEach((path, pathIndex) => {
      let currentCell = originCell;

      for (const direction of path) {
        currentCell = getNeighborByDirection(currentCell, direction);

        if (!currentCell) {
          return;
        }
      }

      if (!currentCell) {
        return;
      }

      const cellKey = createCellKey(currentCell.x, currentCell.y);

      if (seenKeys.has(cellKey)) {
        return;
      }

      seenKeys.add(cellKey);
      entries.push({
        cell: currentCell,
        allowedTerrains: placementTerrainRules?.[pathIndex] || null,
      });
    });

    return entries.length === footprintPaths.length ? entries : [];
  }

  function getConstructiblePlacementCellsForKind(kind, originCell, type) {
    return getConstructiblePlacementEntriesForKind(kind, originCell, type).map((entry) => entry.cell);
  }

  function getConstructibleCandidateOriginsForPlacementCellForKind(kind, placementCell, type) {
    if (!placementCell) {
      return [];
    }

    const footprintPaths = getConstructibleFootprintPathsForKind(kind, type);
    const origins = [];
    const seenKeys = new Set();
    const addOriginCell = (cell) => {
      if (!cell) {
        return;
      }

      const key = createCellKey(cell.x, cell.y);

      if (seenKeys.has(key)) {
        return;
      }

      seenKeys.add(key);
      origins.push(cell);
    };

    if (!footprintPaths) {
      const width = getConstructibleDimensionForKind(kind, type, "width");
      const height = getConstructibleDimensionForKind(kind, type, "height");

      for (let offsetY = 0; offsetY < height; offsetY += 1) {
        for (let offsetX = 0; offsetX < width; offsetX += 1) {
          addOriginCell(getCell(
            placementCell.x - offsetX,
            placementCell.y - offsetY * 2,
          ));
        }
      }

      return origins;
    }

    for (const path of footprintPaths) {
      let currentCell = placementCell;

      for (let index = path.length - 1; index >= 0; index -= 1) {
        const reverseDirection = getReverseConstructibleFootprintStep(path[index]);

        if (!reverseDirection) {
          currentCell = null;
          break;
        }

        currentCell = getNeighborByDirection(currentCell, reverseDirection);

        if (!currentCell) {
          break;
        }
      }

      addOriginCell(currentCell);
    }

    return origins;
  }

  function getConstructibleOccupiedCellsForKind(kind, constructible) {
    if (!constructible) {
      return [];
    }

    const originCell = getCell(constructible.x, constructible.y);

    return getConstructiblePlacementCellsForKind(kind, originCell, constructible.type);
  }

  function getConstructiblePlacementIndexAtCellForKind(kind, constructible, x, y) {
    if (!constructible) {
      return -1;
    }

    const originCell = getCell(constructible.x, constructible.y);

    if (!originCell) {
      return -1;
    }

    return getConstructiblePlacementEntriesForKind(kind, originCell, constructible.type).findIndex(
      ({ cell }) => cell.x === x && cell.y === y,
    );
  }

  function createFoundationConstructibleDescriptor(kind, type) {
    const normalizedKind = kind === "vehicle" ? "vehicle" : "building";
    const normalizedType = typeof type === "string" ? type.trim() : "";

    if (!normalizedType) {
      return null;
    }

    return {
      kind: normalizedKind,
      type: normalizedType,
      id: `${normalizedKind}:${normalizedType}`,
    };
  }

  function parseFoundationConstructibleId(id) {
    if (typeof id !== "string") {
      return null;
    }

    const [kind, ...rest] = id.split(":");
    return createFoundationConstructibleDescriptor(kind, rest.join(":"));
  }

  function getConstructibleBuildCostForKind(kind, type, context = getRuleContext()) {
    const buildCost = getEffectiveConstructibleRulesForKind(kind, type, context)?.buildCost || {};
    const defaults = normalizeConstructibleKind(kind) === "vehicle"
      ? { stone: 0, lumber: 0 }
      : { stone: 20, lumber: 30 };

    return {
      stone: clampNonNegativeNumber(buildCost.stone, 999999, defaults.stone),
      lumber: clampNonNegativeNumber(buildCost.lumber, 999999, defaults.lumber),
    };
  }

  function getConstructibleBuildCostStatusForKind(kind, type, context = getRuleContext()) {
    const buildCost = getConstructibleBuildCostForKind(kind, type, context);
    const entries = [
      {
        resourceType: "stone",
        required: buildCost.stone,
        available: getCurrentStockpileAmount("stone"),
      },
      {
        resourceType: "lumber",
        required: buildCost.lumber,
        available: getCurrentStockpileAmount("lumber"),
      },
    ].map((entry) => ({
      ...entry,
      missing: Math.max(0, entry.required - entry.available),
      affordable: hasSufficientQuantity(entry.available, entry.required),
    }));

    return {
      type,
      entries,
      affordable: entries.every((entry) => entry.affordable),
    };
  }

  function getBuildingCompleteness(building) {
    const completeness = Number(building?.completeness);

    if (!Number.isFinite(completeness)) {
      return 1;
    }

    return clamp(completeness, 0, 1);
  }

  function getConstructibleConstructionCostForKind(kind, type, context = getRuleContext()) {
    return Math.max(
      1,
      clampNumber(getEffectiveConstructibleRulesForKind(kind, type, context)?.constructionCost, 1, 999999, 100),
    );
  }

  function isConstructibleWalkableForKind(kind, type, context = getRuleContext()) {
    return Boolean(getEffectiveConstructibleRulesForKind(kind, type, context)?.walkable);
  }

  function getConstructibleConstructionThresholdsForKind(kind, type, context = getRuleContext()) {
    const thresholds = getEffectiveConstructibleRulesForKind(kind, type, context)?.constructionVisualThresholds || {};
    const initialValue = Number(thresholds.initialMax);
    const halfValue = Number(thresholds.halfMax);
    const initialMax = Number.isFinite(initialValue) ? clamp(initialValue, 0, 1) : 0.34;
    const halfMax = Number.isFinite(halfValue) ? clamp(halfValue, initialMax, 1) : 0.79;

    return {
      initialMax,
      halfMax,
    };
  }

  function serializeConstructibleForKind(kind, constructible, width = map.width, height = map.height) {
    if (!constructible) {
      return null;
    }

    const normalizedKind = normalizeConstructibleKind(kind);
    const x = clampInteger(constructible.x, 0, width - 1, 0);
    const y = clampInteger(constructible.y, 0, height - 1, 0);

    return {
      id: constructible.id || `${normalizedKind}_01`,
      type: constructible.type,
      subtype: constructible.subtype,
      x,
      y,
      width: Math.max(
        1,
        clampInteger(
          constructible.width,
          1,
          width - x,
          getDefaultConstructibleDimensionForKind(normalizedKind, "width"),
        ),
      ),
      height: Math.max(
        1,
        clampInteger(
          constructible.height,
          1,
          height - y,
          getDefaultConstructibleDimensionForKind(normalizedKind, "height"),
        ),
      ),
      state: constructible.state || "complete",
      walkable: Boolean(constructible.walkable),
      completeness: getBuildingCompleteness(constructible),
      constructionCost: getConstructibleConstructionCostForKind(normalizedKind, constructible.type),
      ...(normalizedKind === "vehicle"
        ? {
          riderUnitId: normalizeLinkedEntityId(constructible.riderUnitId),
          ...(getVehicleCargoCapacity(constructible.type) > 0
            ? { cargo: normalizeVehicleCargo(constructible.cargo, constructible.type) }
            : {}),
        }
        : {}),
    };
  }

  function createConstructibleIdForKind(kind, items = getConstructibleCollectionForKind(kind)) {
    const normalizedKind = normalizeConstructibleKind(kind);
    let maxIndex = 0;

    for (const constructible of items) {
      const match = new RegExp(`^${normalizedKind}_(\\d+)$`).exec(constructible?.id || "");

      if (!match) {
        continue;
      }

      maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10) || 0);
    }

    return `${normalizedKind}_${String(maxIndex + 1).padStart(2, "0")}`;
  }

  function markConstructibleCellsVisitedForKind(kind, constructible) {
    if (!constructible) {
      return;
    }

    for (const cell of getConstructibleOccupiedCellsForKind(kind, constructible)) {
      markCellVisited(cell, { invalidate: false });
    }
  }

  function createConstructibleConstructionAtCellForKind(kind, cell, type, { spendResources = true } = {}) {
    const normalizedKind = normalizeConstructibleKind(kind);
    const canPlace = normalizedKind === "vehicle"
      ? canPlaceNewVehicleConstructionOnCell(cell, type)
      : canPlaceNewBuildingConstructionOnCell(cell, type);

    if (!canPlace) {
      return null;
    }

    const buildCost = getConstructibleBuildCostForKind(normalizedKind, type);
    const buildCostStatus = getConstructibleBuildCostStatusForKind(normalizedKind, type);

    if (spendResources && !buildCostStatus.affordable) {
      return null;
    }

    if (
      spendResources &&
      (!spendFromStockpile("stone", buildCost.stone) || !spendFromStockpile("lumber", buildCost.lumber))
    ) {
      return null;
    }

    const constructible = {
      id: createConstructibleIdForKind(normalizedKind),
      type,
      subtype: chooseConstructibleSubtypeForKind(normalizedKind, type) || `${type}_01`,
      x: cell.x,
      y: cell.y,
      width: getConstructibleDimensionForKind(normalizedKind, type, "width"),
      height: getConstructibleDimensionForKind(normalizedKind, type, "height"),
      state: "construction",
      walkable: isConstructibleWalkableForKind(normalizedKind, type),
      completeness: 0,
      constructionCost: getConstructibleConstructionCostForKind(normalizedKind, type),
      ...(normalizedKind === "vehicle"
        ? {
          riderUnitId: null,
          ...(getVehicleCargoCapacity(type) > 0 ? { cargo: null } : {}),
        }
        : {}),
    };

    getConstructibleCollectionForKind(normalizedKind).push(constructible);
    markConstructibleCellsVisitedForKind(normalizedKind, constructible);
    return constructible;
  }

  function normalizeConstructibleSubtypeForKind(kind, type, subtype) {
    const variants = getConstructibleSubtypeVariantsForKind(kind, type);

    if (variants.some((variant) => variant.id === subtype)) {
      return subtype;
    }

    return variants[0]?.id || null;
  }

  function normalizeConstructiblesStateForKind(kind, rawConstructibles) {
    if (!Array.isArray(rawConstructibles)) {
      throw new Error(`Missing ${normalizeConstructibleKind(kind)} data.`);
    }

    const normalizedKind = normalizeConstructibleKind(kind);

    return rawConstructibles.map((sourceConstructible, index) => {
      const type = sourceConstructible?.type;

      if (!getConstructibleSpecForKind(normalizedKind, type) || !getConstructibleRulesForKind(normalizedKind, type)) {
        throw new Error(`Unsupported ${normalizedKind} type: ${type}`);
      }

      const x = clampInteger(sourceConstructible.x, 0, map.width - 1, 0);
      const y = clampInteger(sourceConstructible.y, 0, map.height - 1, 0);
      const width = Math.max(
        1,
        Math.min(
          map.width - x,
          clampInteger(
            sourceConstructible.width,
            1,
            map.width,
            getDefaultConstructibleDimensionForKind(normalizedKind, "width"),
          ),
        ),
      );
      const height = Math.max(
        1,
        Math.min(
          map.height - y,
          clampInteger(
            sourceConstructible.height,
            1,
            map.height,
            getDefaultConstructibleDimensionForKind(normalizedKind, "height"),
          ),
        ),
      );

      return {
        id: typeof sourceConstructible.id === "string" ? sourceConstructible.id : `${normalizedKind}_${index + 1}`,
        type,
        subtype: normalizeConstructibleSubtypeForKind(normalizedKind, type, sourceConstructible.subtype),
        x,
        y,
        width,
        height,
        state: normalizeBuildingState(sourceConstructible.state),
        walkable: typeof sourceConstructible.walkable === "boolean"
          ? sourceConstructible.walkable
          : isConstructibleWalkableForKind(normalizedKind, type),
        completeness: getBuildingCompleteness(sourceConstructible),
        constructionCost: getConstructibleConstructionCostForKind(normalizedKind, type),
        ...(normalizedKind === "vehicle"
          ? {
            riderUnitId: normalizeLinkedEntityId(sourceConstructible.riderUnitId),
            ...(getVehicleCargoCapacity(type) > 0
              ? { cargo: normalizeVehicleCargo(sourceConstructible.cargo, type) }
              : {}),
          }
          : {}),
      };
    });
  }

  function constructibleOccupiesCell(kind, constructible, x, y) {
    return getConstructibleOccupiedCellsForKind(kind, constructible).some((cell) => cell.x === x && cell.y === y);
  }

  function doesConstructibleMatchCellQuery(kind, constructible, x, y, { excludeConstructibleId = null, predicate = null } = {}) {
    return Boolean(
      constructible &&
      constructible.id !== excludeConstructibleId &&
      constructibleOccupiesCell(kind, constructible, x, y) &&
      (typeof predicate !== "function" || predicate(constructible)),
    );
  }

  function getConstructiblesAtCellForKind(kind, x, y, options = {}) {
    return getConstructibleCollectionForKind(kind).filter((constructible) =>
      doesConstructibleMatchCellQuery(kind, constructible, x, y, options),
    );
  }

  function findConstructibleAtCellForKind(kind, x, y, options = {}) {
    return (
      getConstructibleCollectionForKind(kind).find((constructible) =>
        doesConstructibleMatchCellQuery(kind, constructible, x, y, options),
      ) || null
    );
  }

  function isConstructibleInstanceWalkableForKind(_kind, constructible) {
    return Boolean(constructible?.walkable) && constructible.state === "complete";
  }

  function getBlockingConstructibleAtCellForKind(kind, x, y, { excludeConstructibleId = null } = {}) {
    return findConstructibleAtCellForKind(kind, x, y, {
      excludeConstructibleId,
      predicate: (constructible) => !isConstructibleInstanceWalkableForKind(kind, constructible),
    });
  }

  function getWalkableConstructibleAtCellForKind(kind, x, y, { excludeConstructibleId = null } = {}) {
    return findConstructibleAtCellForKind(kind, x, y, {
      excludeConstructibleId,
      predicate: (constructible) => isConstructibleInstanceWalkableForKind(kind, constructible),
    });
  }

  function hasWalkableConstructibleAtCellForKind(kind, x, y, options = {}) {
    return Boolean(getWalkableConstructibleAtCellForKind(kind, x, y, options));
  }

  function getConstructibleVisualForKind(kind, constructible) {
    const spec = getConstructibleSpecForKind(kind, constructible?.type);

    if (!spec) {
      return null;
    }

    if (constructible.state === "abandoned") {
      return {
        image: spec.abandonedImage,
        alpha: clamp(0.28 + getBuildingCompleteness(constructible) * 0.72, 0.2, 1),
      };
    }

    if (constructible.state === "construction") {
      const completeness = getBuildingCompleteness(constructible);
      const thresholds = getConstructibleConstructionThresholdsForKind(kind, constructible.type);

      if (completeness < thresholds.initialMax) {
        const initialStageVisual = spec.constructionStages?.initial || {};
        return {
          image: spec.constructionImages.initial,
          ...(Array.isArray(initialStageVisual.tileImages) ? { tileImages: initialStageVisual.tileImages } : {}),
          alpha: 1,
          yOffsetFactor: Number.isFinite(initialStageVisual.yOffsetFactor) ? initialStageVisual.yOffsetFactor : 0.2,
          renderMode: initialStageVisual.renderMode || "perTile",
        };
      }

      if (completeness < thresholds.halfMax) {
        const halfStageVisual = spec.constructionStages?.half || {};
        return {
          image: spec.constructionImages.half,
          ...(Array.isArray(halfStageVisual.tileImages) ? { tileImages: halfStageVisual.tileImages } : {}),
          alpha: 1,
          ...(Number.isFinite(halfStageVisual.yOffsetFactor) ? { yOffsetFactor: halfStageVisual.yOffsetFactor } : {}),
          renderMode: halfStageVisual.renderMode || spec.constructionRenderMode || spec.renderMode,
        };
      }
    }

    const subtype = spec.subtypes.find((variant) => variant.id === constructible.subtype) || spec.subtypes[0];

    return subtype
      ? {
          image: subtype.image,
          alpha: 1,
        }
      : null;
  }

  function getConstructibleFootprintVisualBoundsForKind(kind, constructible, visual) {
    const occupiedCells = getConstructibleOccupiedCellsForKind(kind, constructible);

    if (occupiedCells.length === 0) {
      return null;
    }

    let minLeft = Number.POSITIVE_INFINITY;
    let minTop = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;

    for (const cell of occupiedCells) {
      const screen = isoToScreen(cell.x, cell.y);
      const drawY =
        screen.y - tile.edge - tile.height * 0.32 + tile.height * (visual.yOffsetFactor || 0);
      const drawBottom = drawY + tile.height + tile.edge;

      minLeft = Math.min(minLeft, screen.x - tile.width / 2);
      minTop = Math.min(minTop, drawY);
      maxRight = Math.max(maxRight, screen.x + tile.width / 2);
      maxBottom = Math.max(maxBottom, drawBottom);
    }

    if (!Number.isFinite(minLeft) || !Number.isFinite(minTop) || !Number.isFinite(maxRight) || !Number.isFinite(maxBottom)) {
      return null;
    }

    return {
      x: minLeft,
      y: minTop,
      width: maxRight - minLeft,
      height: maxBottom - minTop,
    };
  }

  function getConstructibleFootprintImageNativeDrawBoxForKind(kind, constructible, image, visual) {
    const bounds = getConstructibleFootprintVisualBoundsForKind(kind, constructible, visual);
    const spec = getConstructibleSpecForKind(kind, constructible?.type);
    const baseScale = Number(spec?.nativeScaleAt100Zoom);
    const baseOffsetY = Number(spec?.nativeOffsetYAt100Zoom);

    if (!bounds || !image?.naturalWidth || !image?.naturalHeight) {
      return null;
    }

    const zoomScale = zoomLevels[getZoomIndex()] * (Number.isFinite(baseScale) ? baseScale : 0.5);
    const drawWidth = image.naturalWidth * zoomScale;
    const drawHeight = image.naturalHeight * zoomScale;
    const centerX = bounds.x + bounds.width / 2;
    const offsetY = zoomLevels[getZoomIndex()] * (Number.isFinite(baseOffsetY) ? baseOffsetY : 0);

    return {
      x: centerX - drawWidth / 2,
      y: bounds.y + bounds.height - drawHeight + offsetY,
      width: drawWidth,
      height: drawHeight,
    };
  }

  function drawConstructibleForKind(kind, constructible, drawContext = ctx) {
    const visual = getConstructibleVisualForKind(kind, constructible);

    if (!visual) {
      return;
    }

    const imageRegistry = getConstructibleImageRegistryForKind(kind);
    const renderMode = visual.renderMode || getConstructibleRenderModeForKind(kind, constructible.type);
    const occupiedCells = renderMode === "perTile"
      ? getConstructibleOccupiedCellsForKind(kind, constructible)
      : null;

    drawContext.save();
    drawContext.globalAlpha = visual.alpha ?? 1;

    if (kind === "vehicle" && renderMode === "singleTile" && constructible.state === "complete" && constructible.cargo?.amount > 0) {
      const overlayPath = getConstructibleSpecForKind(kind, constructible.type)?.cargoOverlay?.unmounted;
      const overlayImage = overlayPath && imageRegistry[overlayPath];
      if (overlayImage?.complete && overlayImage.naturalWidth > 0) {
        drawNativeSingleCellImageAtCell(overlayImage, getCell(constructible.x, constructible.y), drawContext);
      }
    }

    if (renderMode === "perTile") {
      const tileImages = Array.isArray(visual.tileImages) ? visual.tileImages : null;

      if (tileImages && tileImages.length > 0) {
        occupiedCells.forEach((cell, index) => {
          const imagePath = index < tileImages.length ? tileImages[index] : visual.image;

          if (!imagePath) {
            return;
          }

          const tileImage = imageRegistry[imagePath];

          if (!tileImage?.complete || tileImage.naturalWidth <= 0) {
            return;
          }

          drawNativeSingleCellImageAtCell(tileImage, cell, drawContext);
        });
      } else {
        if (!visual.image) {
          drawContext.restore();
          return;
        }

        const image = imageRegistry[visual.image];

        if (!image?.complete || image.naturalWidth <= 0) {
          drawContext.restore();
          return;
        }

        for (const cell of occupiedCells) {
          drawNativeSingleCellImageAtCell(image, cell, drawContext);
        }
      }
    } else if (renderMode === "footprintImageNative") {
      if (!visual.image) {
        drawContext.restore();
        return;
      }

      const image = imageRegistry[visual.image];

      if (!image?.complete || image.naturalWidth <= 0) {
        drawContext.restore();
        return;
      }

      const drawBox = getConstructibleFootprintImageNativeDrawBoxForKind(kind, constructible, image, visual);

      if (drawBox) {
        drawContext.drawImage(
          image,
          drawBox.x,
          drawBox.y,
          drawBox.width,
          drawBox.height,
        );
      }
    } else if (renderMode === "footprintImage") {
      if (!visual.image) {
        drawContext.restore();
        return;
      }

      const image = imageRegistry[visual.image];

      if (!image?.complete || image.naturalWidth <= 0) {
        drawContext.restore();
        return;
      }

      const bounds = getConstructibleFootprintVisualBoundsForKind(kind, constructible, visual);

      if (bounds) {
        drawContext.drawImage(
          image,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
        );
      }
    } else {
      if (!visual.image) {
        drawContext.restore();
        return;
      }

      const image = imageRegistry[visual.image];

      if (!image?.complete || image.naturalWidth <= 0) {
        drawContext.restore();
        return;
      }

      drawNativeSingleCellImageAtCell(image, getCell(constructible.x, constructible.y), drawContext);
    }

    drawContext.restore();
  }

  return {
    normalizeConstructibleKind,
    getConstructibleCollectionForKind,
    getConstructibleRulesForKind,
    getEffectiveConstructibleRulesForKind,
    getConstructibleSpecForKind,
    getDefinedConstructibleTypesForKind,
    getConstructibleCountsByTypeForKind,
    getConstructibleImageRegistryForKind,
    getConstructibleRenderModeForKind,
    chooseConstructibleSubtypeForKind,
    getDefaultConstructibleDimensionForKind,
    getConstructibleBottomRowForKind,
    getConstructibleDimensionForKind,
    getConstructibleFootprintPathsForKind,
    getConstructiblePlacementTerrainRulesForKind,
    getConstructiblePlacementEntriesForKind,
    getConstructiblePlacementCellsForKind,
    getConstructibleCandidateOriginsForPlacementCellForKind,
    getConstructibleOccupiedCellsForKind,
    getConstructiblePlacementIndexAtCellForKind,
    createFoundationConstructibleDescriptor,
    parseFoundationConstructibleId,
    getConstructibleBuildCostForKind,
    getConstructibleBuildCostStatusForKind,
    getBuildingCompleteness,
    getConstructibleConstructionCostForKind,
    isConstructibleWalkableForKind,
    serializeConstructibleForKind,
    createConstructibleIdForKind,
    createConstructibleConstructionAtCellForKind,
    normalizeConstructiblesStateForKind,
    constructibleOccupiesCell,
    getConstructiblesAtCellForKind,
    findConstructibleAtCellForKind,
    isConstructibleInstanceWalkableForKind,
    getBlockingConstructibleAtCellForKind,
    getWalkableConstructibleAtCellForKind,
    hasWalkableConstructibleAtCellForKind,
    getConstructibleVisualForKind,
    drawConstructibleForKind,
  };
}
