const spriteSourceIds = Object.freeze({
  idle: "idle",
  move: "move",
  work: "work",
  gatherFoodLand: "gatherFoodLand",
  gatherFoodFish: "gatherFoodFish",
  gatherMaterialsLumber: "gatherMaterialsLumber",
  gatherMaterialsStone: "gatherMaterialsStone",
  play: "play",
  research: "research",
});

const spriteDirectionFallbacks = Object.freeze({
  O: null,
  N: Object.freeze({ to: "W", mirror: false }),
  E: Object.freeze({ to: "W", mirror: true }),
  S: Object.freeze({ to: "E", mirror: false }),
  W: Object.freeze({ to: "O", mirror: false }),
  NE: Object.freeze({ to: "E", mirror: false }),
  NW: Object.freeze({ to: "W", mirror: false }),
  SE: Object.freeze({ to: "E", mirror: false }),
  SW: Object.freeze({ to: "W", mirror: false }),
});

const spriteDirectionAliases = Object.freeze({
  o: "O",
  origin: "O",
  no_direction: "O",
  n: "N",
  north: "N",
  e: "E",
  east: "E",
  s: "S",
  south: "S",
  w: "W",
  west: "W",
  ne: "NE",
  northeast: "NE",
  north_east: "NE",
  northEast: "NE",
  nw: "NW",
  northwest: "NW",
  north_west: "NW",
  northWest: "NW",
  se: "SE",
  southeast: "SE",
  south_east: "SE",
  southEast: "SE",
  sw: "SW",
  southwest: "SW",
  south_west: "SW",
  southWest: "SW",
});

const spriteAnimationNumericFields = Object.freeze([
  "workFrameDuration",
  "width",
  "height",
  "anchorX",
  "anchorY",
  "groundOffset",
  "moveDuration",
]);

const spriteDirectionalSourceCandidateSets = Object.freeze({
  stationary: Object.freeze([spriteSourceIds.idle]),
  move: Object.freeze([spriteSourceIds.move, spriteSourceIds.idle]),
});

export const spriteTaskSourceCandidateSets = Object.freeze({
  idle: Object.freeze([spriteSourceIds.idle]),
  work: Object.freeze([spriteSourceIds.work, spriteSourceIds.idle]),
  play: Object.freeze([spriteSourceIds.play, spriteSourceIds.work, spriteSourceIds.idle]),
  research: Object.freeze([spriteSourceIds.research, spriteSourceIds.work, spriteSourceIds.idle]),
});

const spriteSourceCandidateDefaultContextId = "default";
const cargoResourceTypes = new Set(["food", "stone", "lumber"]);

function getCargoSpriteSourceCandidates(currentUnit, variant) {
  if (variant === "Work") {
    return [];
  }

  const resourceType = currentUnit?.cargo?.resourceType;
  if (!cargoResourceTypes.has(resourceType) || !(Number(currentUnit?.cargo?.amount) > 0)) {
    return [];
  }

  const resourceName = resourceType[0].toUpperCase() + resourceType.slice(1);
  const variants = variant === "Move" ? ["Move", "Idle"] : ["Idle"];
  return variants.flatMap((name) => [`cargo${resourceName}${name}`, `cargo${name}`]);
}

function resolveAssetPath(path, manifestPath) {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  return new URL(path.trim(), new URL(manifestPath, window.location.href)).toString();
}

function normalizeSpriteDirectionId(direction) {
  if (typeof direction !== "string") {
    return "";
  }

  const trimmed = direction.trim();
  if (!trimmed) {
    return "";
  }

  const directUpper = trimmed.toUpperCase();
  if (spriteDirectionFallbacks[directUpper] || directUpper === "O") {
    return directUpper;
  }

  return spriteDirectionAliases[trimmed] || spriteDirectionAliases[trimmed.toLowerCase()] || "";
}

function getSpriteDirectionId(direction, fallback = "O") {
  return normalizeSpriteDirectionId(direction) || fallback;
}

function normalizeSpriteSourceId(sourceId) {
  if (typeof sourceId !== "string") {
    return "";
  }

  const trimmed = sourceId.trim();
  return trimmed || "";
}

function normalizeSpriteSourceCandidateList(value) {
  if (typeof value === "string") {
    const normalizedSourceId = normalizeSpriteSourceId(value);
    return normalizedSourceId ? [normalizedSourceId] : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((sourceId) => normalizeSpriteSourceId(sourceId))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSpriteFramePaths(value, imageResolver, manifestPath) {
  return Array.isArray(value)
    ? value.map((path) => imageResolver(path, manifestPath)).filter(Boolean)
    : undefined;
}

function normalizeSpriteSourceValue(
  value,
  kind,
  imageResolver,
  manifestPath,
) {
  if (kind === "image") {
    const resolved = imageResolver(value, manifestPath);
    return resolved ? { kind: "image", paths: [resolved] } : null;
  }

  const paths = normalizeSpriteFramePaths(value, imageResolver, manifestPath);
  return paths && paths.length > 0
    ? { kind: "frames", paths }
    : null;
}

function normalizeSpriteSourceDirectionValue(value, imageResolver, manifestPath) {
  if (typeof value === "string") {
    return normalizeSpriteSourceValue(value, "image", imageResolver, manifestPath);
  }

  if (Array.isArray(value)) {
    return normalizeSpriteSourceValue(value, "frames", imageResolver, manifestPath);
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (typeof value.image === "string") {
    return normalizeSpriteSourceValue(value.image, "image", imageResolver, manifestPath);
  }

  if (Array.isArray(value.frames)) {
    return normalizeSpriteSourceValue(value.frames, "frames", imageResolver, manifestPath);
  }

  return null;
}

function normalizeSpriteDirectionSourceEntries(
  entry,
  imageResolver,
  manifestPath,
) {
  if (!entry) {
    return {};
  }

  const normalized = {};
  const addDirectionEntry = (directionId, rawValue) => {
    const normalizedDirectionId = getSpriteDirectionId(directionId, "");
    const normalizedValue = normalizeSpriteSourceDirectionValue(rawValue, imageResolver, manifestPath);

    if (!normalizedDirectionId || !normalizedValue) {
      return;
    }

    normalized[normalizedDirectionId] = normalizedValue;
  };

  if (typeof entry === "string" || Array.isArray(entry)) {
    addDirectionEntry("O", entry);
    return normalized;
  }

  if (!entry || typeof entry !== "object") {
    return normalized;
  }

  if (Object.prototype.hasOwnProperty.call(entry, "image") || Object.prototype.hasOwnProperty.call(entry, "frames")) {
    addDirectionEntry("O", entry);
    return normalized;
  }

  for (const [directionId, rawValue] of Object.entries(entry)) {
    addDirectionEntry(directionId, rawValue);
  }

  return normalized;
}

function normalizeSpriteSources(entry, imageResolver, manifestPath) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return undefined;
  }

  const normalized = {};

  for (const [sourceKey, directionEntries] of Object.entries(entry)) {
    const normalizedSourceId = normalizeSpriteSourceId(sourceKey);
    if (!normalizedSourceId) {
      continue;
    }

    const normalizedDirections = normalizeSpriteDirectionSourceEntries(
      directionEntries,
      imageResolver,
      manifestPath,
    );

    if (Object.keys(normalizedDirections).length === 0) {
      continue;
    }

    normalized[normalizedSourceId] = normalizedDirections;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function mergeNestedSpriteValueObjects(baseEntries, overrideEntries) {
  const merged = { ...(baseEntries || {}) };

  for (const [key, value] of Object.entries(overrideEntries || {})) {
    merged[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? {
          ...((baseEntries && typeof baseEntries[key] === "object" && !Array.isArray(baseEntries[key]))
            ? baseEntries[key]
            : {}),
          ...value,
        }
        : value;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeSpriteSourceCatalogs(baseSources, overrideSources) {
  const merged = {};

  for (const [sourceId, directions] of Object.entries(baseSources || {})) {
    merged[sourceId] = { ...(directions || {}) };
  }

  for (const [sourceId, directions] of Object.entries(overrideSources || {})) {
    merged[sourceId] = {
      ...(merged[sourceId] || {}),
      ...(directions || {}),
    };
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function createSpriteRuntimeApi({
  state,
  manifests,
  world,
  render,
}) {
  const {
    getCurrentUnit,
    getUnitSpriteConfigs,
  } = state;
  const {
    unitManifestPath,
    vehicleManifestPath,
  } = manifests;
  const {
    getDefaultUnitTypeId,
    normalizeUnitTypeId,
    getResolvedUnitConfig,
    getUnitTypeId,
    getMountedVehicle,
    getConstructibleSpec,
    getUnitDisplayDirection,
    getBuildingAtCell,
    getVehicleAtCell,
    getCellMaterialResourceType,
    getUnitTaskTargetCell,
    getUnitTaskSpec,
    getUnitTaskInspectorPreviewMode,
    getMoveDirection,
    getUnitMoveProgress,
    getRawUnitTaskDirection,
    isUnitWorking,
    doesTaskUseTargetDirection,
    getTaskActionId,
  } = world;
  const {
    ctx,
    tile,
    zoomLevels,
    getZoomIndex,
    unitImages,
    getUnitGroundPoint,
  } = render;

  function resolveUnitAssetPath(path, manifestPath = unitManifestPath) {
    return resolveAssetPath(path, manifestPath);
  }

  function resolveVehicleAssetPath(path, manifestPath = vehicleManifestPath) {
    return resolveAssetPath(path, manifestPath);
  }

  function normalizeActionContextSourceCandidates(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return undefined;
    }

    const normalized = {};

    for (const [actionKey, contextEntries] of Object.entries(entry)) {
      const normalizedActionId = typeof actionKey === "string" ? actionKey.trim() : "";

      if (!normalizedActionId || !contextEntries || typeof contextEntries !== "object" || Array.isArray(contextEntries)) {
        continue;
      }

      const normalizedContexts = {};

      for (const [contextKey, sourceCandidates] of Object.entries(contextEntries)) {
        const normalizedContextKey = typeof contextKey === "string" ? contextKey.trim() : "";
        const normalizedSourceCandidates = normalizeSpriteSourceCandidateList(sourceCandidates);

        if (!normalizedContextKey || !normalizedSourceCandidates) {
          continue;
        }

        normalizedContexts[normalizedContextKey] = normalizedSourceCandidates;
      }

      if (Object.keys(normalizedContexts).length > 0) {
        normalized[normalizedActionId] = normalizedContexts;
      }
    }

    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  function normalizeSpriteAnimationConfig(
    entry,
    {
      manifestPath = unitManifestPath,
      imageResolver = resolveUnitAssetPath,
      extraNumericFields = [],
    } = {},
  ) {
    const spriteEntry = entry && typeof entry === "object" ? entry : {};
    const normalized = {};
    const numericFields = [...spriteAnimationNumericFields, ...extraNumericFields];
    const normalizedSources = normalizeSpriteSources(spriteEntry.sources, imageResolver, manifestPath);

    if (normalizedSources && Object.keys(normalizedSources).length > 0) {
      normalized.sources = normalizedSources;
    }

    for (const field of numericFields) {
      const value = Number(spriteEntry[field]);
      if (Number.isFinite(value)) {
        normalized[field] = value;
      }
    }

    if (Array.isArray(spriteEntry.moveFrameSequence)) {
      normalized.moveFrameSequence = spriteEntry.moveFrameSequence
        .map((value) => Math.floor(Number(value)))
        .filter((value) => Number.isFinite(value));
    }

    const actionContextSourceCandidates = normalizeActionContextSourceCandidates(spriteEntry.actionContextSourceCandidates);
    if (actionContextSourceCandidates) {
      normalized.actionContextSourceCandidates = actionContextSourceCandidates;
    }

    return normalized;
  }

  function normalizeUnitSpriteTypeConfig(entry, manifestPath = unitManifestPath) {
    return normalizeSpriteAnimationConfig(entry, {
      manifestPath,
      imageResolver: resolveUnitAssetPath,
    });
  }

  function normalizeMountedSpriteLayerConfig(entry, manifestPath = vehicleManifestPath) {
    const normalized = normalizeSpriteAnimationConfig(entry, {
      manifestPath,
      imageResolver: resolveVehicleAssetPath,
      extraNumericFields: ["offsetX", "offsetY"],
    });
    if (entry?.moveSource === "idle" || entry?.moveSource === "move") {
      normalized.moveSource = entry.moveSource;
    }
    return normalized;
  }

  function normalizeMountedRenderEntry(entry, manifestPath = vehicleManifestPath) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return undefined;
    }

    const unit = normalizeMountedSpriteLayerConfig(entry.unit, manifestPath);
    const vehicle = normalizeMountedSpriteLayerConfig(entry.vehicle, manifestPath);

    if (Object.keys(unit).length === 0 && Object.keys(vehicle).length === 0) {
      return undefined;
    }

    return {
      ...(Object.keys(unit).length > 0 ? { unit } : {}),
      ...(Object.keys(vehicle).length > 0 ? { vehicle } : {}),
    };
  }

  function normalizeMountedRenderVariants(entry, manifestPath = vehicleManifestPath) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return undefined;
    }

    const defaultRender = normalizeMountedRenderEntry(entry.default, manifestPath);
    const rawByUnitType = entry.byUnitType && typeof entry.byUnitType === "object" && !Array.isArray(entry.byUnitType)
      ? entry.byUnitType
      : {};
    const byUnitType = Object.fromEntries(
      Object.entries(rawByUnitType)
        .map(([unitTypeId, config]) => {
          const normalizedUnitTypeId = typeof unitTypeId === "string" ? unitTypeId.trim() : "";
          const normalizedConfig = normalizeMountedRenderEntry(config, manifestPath);
          return normalizedUnitTypeId && normalizedConfig
            ? [normalizedUnitTypeId, normalizedConfig]
            : null;
        })
        .filter(Boolean),
    );

    if (!defaultRender && Object.keys(byUnitType).length === 0) {
      return undefined;
    }

    return {
      ...(defaultRender ? { default: defaultRender } : {}),
      ...(Object.keys(byUnitType).length > 0 ? { byUnitType } : {}),
    };
  }

  function mergeSpriteConfigs(baseConfig, overrideConfig) {
    const base = baseConfig && typeof baseConfig === "object" ? baseConfig : {};
    const override = overrideConfig && typeof overrideConfig === "object" ? overrideConfig : {};

    return {
      ...base,
      ...override,
      sources: mergeSpriteSourceCatalogs(base.sources, override.sources),
      actionContextSourceCandidates: mergeNestedSpriteValueObjects(
        base.actionContextSourceCandidates,
        override.actionContextSourceCandidates,
      ),
    };
  }

  function getAllUnitSpriteConfigs() {
    const unitSpriteConfigs = getUnitSpriteConfigs();
    return unitSpriteConfigs && typeof unitSpriteConfigs === "object" ? unitSpriteConfigs : {};
  }

  function getDefinedUnitSpriteTypeIds() {
    return Object.keys(getAllUnitSpriteConfigs()).filter((spriteTypeId) => Boolean(spriteTypeId));
  }

  function getDefaultUnitSpriteTypeId() {
    const resolvedDefaultConfig = getResolvedUnitConfig(getDefaultUnitTypeId());
    const configured = typeof resolvedDefaultConfig.spriteTypeId === "string"
      ? resolvedDefaultConfig.spriteTypeId.trim()
      : "";

    if (configured && getAllUnitSpriteConfigs()[configured]) {
      return configured;
    }

    const [firstSpriteTypeId] = getDefinedUnitSpriteTypeIds();
    return firstSpriteTypeId || "default";
  }

  function getUnitSpriteTypeId(unitOrTypeId = getCurrentUnit()) {
    const typeId =
      typeof unitOrTypeId === "string"
        ? normalizeUnitTypeId(unitOrTypeId)
        : getUnitTypeId(unitOrTypeId);
    const resolvedConfig = getResolvedUnitConfig(typeId);
    const configured = typeof resolvedConfig.spriteTypeId === "string"
      ? resolvedConfig.spriteTypeId.trim()
      : "";

    if (configured && getAllUnitSpriteConfigs()[configured]) {
      return configured;
    }

    if (getAllUnitSpriteConfigs()[typeId]) {
      return typeId;
    }

    return getDefaultUnitSpriteTypeId();
  }

  function getUnitSpriteConfig(unitOrTypeId = getCurrentUnit()) {
    const allSpriteConfigs = getAllUnitSpriteConfigs();
    const defaultConfig = allSpriteConfigs[getDefaultUnitSpriteTypeId()] || Object.values(allSpriteConfigs)[0] || null;
    const specificConfig = allSpriteConfigs[getUnitSpriteTypeId(unitOrTypeId)] || defaultConfig;

    if (!defaultConfig || !specificConfig) {
      return null;
    }

    return mergeSpriteConfigs(defaultConfig, specificConfig);
  }

  function getDirectionalSpriteSourceCandidates(variant) {
    return spriteDirectionalSourceCandidateSets[variant] || [];
  }

  function getCargoSpriteSourceResolution(currentUnit, spriteConfig, variant, directionId) {
    const candidates = getCargoSpriteSourceCandidates(currentUnit, variant);
    if (candidates.length === 0) {
      return null;
    }

    const isMounted = Boolean(getMountedVehicle(currentUnit)) && currentUnit?.move?.mode !== "dismount";
    const mountedCatalog = isMounted ? getMountedSpriteLayerConfig(currentUnit, "unit") : null;
    return getFirstResolvedSpriteSource(mountedCatalog, candidates, directionId)
      || getFirstResolvedSpriteSource(spriteConfig, candidates, directionId);
  }

  function getMovementSpriteSourceResolution(currentUnit, spriteConfig, directionId) {
    const useIdle = spriteConfig?.moveSource === "idle";
    return getCargoSpriteSourceResolution(currentUnit, spriteConfig, useIdle ? "Idle" : "Move", directionId)
      || getFirstResolvedSpriteSource(
        spriteConfig,
        getDirectionalSpriteSourceCandidates(useIdle ? "stationary" : "move"),
        directionId,
      );
  }

  function getSpriteDefinedSourceEntry(
    spriteConfig,
    sourceId,
    directionId = "O",
  ) {
    return spriteConfig?.sources?.[sourceId]?.[directionId] || null;
  }

  function resolveSpriteSourceEntry(
    spriteConfig,
    sourceId,
    requestedDirectionId = "O",
  ) {
    const normalizedDirectionId = getSpriteDirectionId(requestedDirectionId, "O");
    let currentDirectionId = normalizedDirectionId;
    let mirror = false;
    const visited = new Set();

    while (currentDirectionId && !visited.has(currentDirectionId)) {
      visited.add(currentDirectionId);
      const entry = getSpriteDefinedSourceEntry(spriteConfig, sourceId, currentDirectionId);

      if (entry) {
        return {
          sourceId,
          requestedDirectionId: normalizedDirectionId,
          resolvedDirectionId: currentDirectionId,
          mirror,
          kind: entry.kind,
          paths: entry.paths || [],
        };
      }

      const fallback = spriteDirectionFallbacks[currentDirectionId];
      if (!fallback) {
        break;
      }

      mirror = fallback.mirror ? !mirror : mirror;
      currentDirectionId = fallback.to || "";
    }

    return null;
  }

  function getSpriteSourcePaths(spriteConfig, sourceId, requestedDirectionId = "O") {
    return resolveSpriteSourceEntry(spriteConfig, sourceId, requestedDirectionId)?.paths || [];
  }

  function getFirstResolvedSpriteSource(spriteConfig, sourceIds, requestedDirectionId = "O") {
    for (const sourceId of sourceIds || []) {
      if (!sourceId) {
        continue;
      }

      const resolved = resolveSpriteSourceEntry(spriteConfig, sourceId, requestedDirectionId);
      if (resolved && resolved.paths.length > 0) {
        return resolved;
      }
    }

    return null;
  }

  function getSpriteResolvedImagePath(sourceResolution, preferredFrameIndex = 0) {
    if (!sourceResolution || sourceResolution.paths.length === 0) {
      return "";
    }

    return sourceResolution.paths[preferredFrameIndex] || sourceResolution.paths[0] || "";
  }

  function getUnitSpriteIcon(unitOrTypeId = getCurrentUnit(), spriteConfig = getUnitSpriteConfig(unitOrTypeId)) {
    return getSpriteResolvedImagePath(
      getFirstResolvedSpriteSource(spriteConfig, spriteDirectionalSourceCandidateSets.stationary, "W"),
    );
  }

  function getMountedRenderConfig(currentUnit = getCurrentUnit()) {
    const mountedVehicle = getMountedVehicle(currentUnit);
    const mountedRenders = getConstructibleSpec("vehicle", mountedVehicle?.type)?.mountedRenders;

    if (!mountedVehicle || !mountedRenders) {
      return null;
    }

    const defaultRender = mountedRenders.default || null;
    const unitTypeRender = mountedRenders.byUnitType?.[getUnitTypeId(currentUnit)] || null;
    const mergedUnit =
      defaultRender?.unit || unitTypeRender?.unit
        ? mergeSpriteConfigs(defaultRender?.unit || {}, unitTypeRender?.unit || {})
        : null;
    const mergedVehicle =
      defaultRender?.vehicle || unitTypeRender?.vehicle
        ? mergeSpriteConfigs(defaultRender?.vehicle || {}, unitTypeRender?.vehicle || {})
        : null;

    if (!mergedUnit && !mergedVehicle) {
      return null;
    }

    return {
      ...(mergedUnit ? { unit: mergedUnit } : {}),
      ...(mergedVehicle ? { vehicle: mergedVehicle } : {}),
    };
  }

  function getMountedSpriteLayerConfig(currentUnit = getCurrentUnit(), layerKey = "unit") {
    const mountedRenderConfig = getMountedRenderConfig(currentUnit);
    return mountedRenderConfig?.[layerKey] || null;
  }

  function getRenderedSpriteConfig(
    currentUnit = getCurrentUnit(),
    {
      layerKey = "unit",
      baseConfig = null,
      suppressMountedLayer = false,
    } = {},
  ) {
    const resolvedBaseConfig =
      typeof baseConfig === "function"
        ? (baseConfig(currentUnit) || null)
        : (baseConfig || null);

    if (suppressMountedLayer) {
      return resolvedBaseConfig;
    }

    const mountedLayerConfig = getMountedSpriteLayerConfig(currentUnit, layerKey);
    if (!mountedLayerConfig) {
      return resolvedBaseConfig;
    }

    return resolvedBaseConfig
      ? mergeSpriteConfigs(resolvedBaseConfig, mountedLayerConfig)
      : mountedLayerConfig;
  }

  function getRenderedUnitSpriteConfig(currentUnit = getCurrentUnit()) {
    return getRenderedSpriteConfig(currentUnit, {
      layerKey: "unit",
      baseConfig: getUnitSpriteConfig,
      suppressMountedLayer: currentUnit?.move?.mode === "dismount",
    });
  }

  function getMountedVehicleSpriteConfig(currentUnit = getCurrentUnit()) {
    return getRenderedSpriteConfig(currentUnit, { layerKey: "vehicle" });
  }

  function getWorkingUnitFrameIndex(now = performance.now()) {
    const spriteConfig = getUnitSpriteConfig();
    const workFrames = getSpriteSourcePaths(spriteConfig, spriteSourceIds.work, "O");

    if (!spriteConfig || workFrames.length <= 1) {
      return 0;
    }

    return Math.floor(now / spriteConfig.workFrameDuration) % workFrames.length;
  }

  function pushUnitTaskSpriteContextId(contextIds, contextId) {
    const normalizedContextId = typeof contextId === "string" ? contextId.trim() : "";

    if (!normalizedContextId || contextIds.includes(normalizedContextId)) {
      return;
    }

    contextIds.push(normalizedContextId);
  }

  function getUnitTaskTargetSpriteContextIds(currentUnit) {
    const contextIds = [];
    const task = currentUnit?.task;
    const targetCell = getUnitTaskTargetCell(currentUnit);

    if (typeof task?.subjectKind === "string" && task.subjectKind) {
      pushUnitTaskSpriteContextId(contextIds, `subjectKind:${task.subjectKind}`);
    }

    if (typeof task?.subjectType === "string" && task.subjectType) {
      pushUnitTaskSpriteContextId(contextIds, `subjectType:${task.subjectType}`);

      if (typeof task?.subjectKind === "string" && task.subjectKind) {
        pushUnitTaskSpriteContextId(contextIds, `${task.subjectKind}:${task.subjectType}`);
      }
    }

    if (!targetCell) {
      return contextIds;
    }

    const building = getBuildingAtCell(targetCell.x, targetCell.y);
    if (building?.type) {
      pushUnitTaskSpriteContextId(contextIds, "constructible:building");
      pushUnitTaskSpriteContextId(contextIds, `building:${building.type}`);
    }

    const vehicle = getVehicleAtCell(targetCell.x, targetCell.y);
    if (vehicle?.type) {
      pushUnitTaskSpriteContextId(contextIds, "constructible:vehicle");
      pushUnitTaskSpriteContextId(contextIds, `vehicle:${vehicle.type}`);
    }

    if (typeof targetCell.foodType === "string" && targetCell.foodType) {
      pushUnitTaskSpriteContextId(contextIds, `food:${targetCell.foodType}`);
    }

    const materialType = getCellMaterialResourceType(targetCell);
    if (materialType) {
      pushUnitTaskSpriteContextId(contextIds, `material:${materialType}`);
    }

    if (typeof targetCell.type === "string" && targetCell.type) {
      pushUnitTaskSpriteContextId(contextIds, `terrain:${targetCell.type}`);
    }

    return contextIds;
  }

  function getTaskActionContextSourceCandidates(currentUnit, spriteConfig) {
    const actionId = getTaskActionId(currentUnit?.task);
    const actionContextEntries = actionId
      ? (spriteConfig?.actionContextSourceCandidates?.[actionId] || null)
      : null;

    if (!actionContextEntries) {
      return [];
    }

    for (const contextId of getUnitTaskTargetSpriteContextIds(currentUnit)) {
      const sourceCandidates = actionContextEntries[contextId];

      if (Array.isArray(sourceCandidates) && sourceCandidates.length > 0) {
        return sourceCandidates;
      }
    }

    return actionContextEntries[spriteSourceCandidateDefaultContextId] || actionContextEntries["*"] || [];
  }

  function getUnitTaskSpriteSourceCandidates(currentUnit, spriteConfig) {
    const configuredContextCandidates = getTaskActionContextSourceCandidates(currentUnit, spriteConfig);
    if (configuredContextCandidates.length > 0) {
      return configuredContextCandidates;
    }

    const spec = getUnitTaskSpec(currentUnit);

    if (spec?.getTaskSpriteSourceCandidates) {
      return spec.getTaskSpriteSourceCandidates(currentUnit, spriteConfig) || [];
    }

    if (spec?.countsAsWork) {
      return spriteTaskSourceCandidateSets.work;
    }

    return spriteTaskSourceCandidateSets.idle;
  }

  function getSpriteRenderDirection(currentUnit) {
    if (!currentUnit) {
      return "W";
    }

    if (currentUnit.move?.direction) {
      return getSpriteDirectionId(currentUnit.move.direction, "W");
    }

    if (currentUnit.task) {
      if (doesTaskUseTargetDirection(currentUnit.task)) {
        return getSpriteDirectionId(getRawUnitTaskDirection(currentUnit), "O");
      }

      return getSpriteDirectionId(currentUnit.facing || "west", "W");
    }

    return getSpriteDirectionId(getUnitDisplayDirection(currentUnit), "W");
  }

  function getUnitTaskSpriteSourceResolution(currentUnit, spriteConfig) {
    const directionId = getSpriteRenderDirection(currentUnit);
    const cargoSource = getCargoSpriteSourceResolution(currentUnit, spriteConfig, "Work", directionId);
    if (cargoSource) {
      return cargoSource;
    }

    return getFirstResolvedSpriteSource(
      spriteConfig,
      getUnitTaskSpriteSourceCandidates(currentUnit, spriteConfig),
      directionId,
    );
  }

  function getSpriteRenderSourceResolution(currentUnit, spriteConfig) {
    if (!spriteConfig) {
      return null;
    }

    if (!currentUnit) {
      return getFirstResolvedSpriteSource(spriteConfig, spriteTaskSourceCandidateSets.idle, "W");
    }

    if (currentUnit.move) {
      const directionId = getSpriteRenderDirection(currentUnit);
      return getMovementSpriteSourceResolution(currentUnit, spriteConfig, directionId);
    }

    if (isUnitWorking(currentUnit)) {
      return getUnitTaskSpriteSourceResolution(currentUnit, spriteConfig);
    }

    const directionId = getSpriteRenderDirection(currentUnit);
    return getCargoSpriteSourceResolution(currentUnit, spriteConfig, "Idle", directionId)
      || getFirstResolvedSpriteSource(
        spriteConfig,
        getDirectionalSpriteSourceCandidates("stationary"),
        directionId,
      );
  }

  function getAnimatedTaskFrameOffset(currentUnit) {
    if (!currentUnit) {
      return 0;
    }

    if (!Number.isInteger(currentUnit.animatedTaskFrameOffset)) {
      currentUnit.animatedTaskFrameOffset = Math.random() < 0.5 ? 1 : 0;
    }

    return currentUnit.animatedTaskFrameOffset;
  }

  function getAnimatedTaskSpriteImage(currentUnit, spriteConfig, frameIndex = 0) {
    const sourceResolution = getUnitTaskSpriteSourceResolution(currentUnit, spriteConfig);
    const frames = sourceResolution?.paths || [];
    const offsetFrameIndex = frameIndex + getAnimatedTaskFrameOffset(currentUnit);

    if (frames.length === 0) {
      return getSpriteResolvedImagePath(
        getFirstResolvedSpriteSource(spriteConfig, spriteTaskSourceCandidateSets.idle, "W"),
      );
    }

    return frames[offsetFrameIndex % frames.length] || frames[0] || "";
  }

  function getMovePreviewSpriteImage(currentUnit, spriteConfig) {
    const task = currentUnit?.task;
    const direction = currentUnit?.move?.direction || (
      getUnitTaskInspectorPreviewMode(currentUnit) === "move"
        ? getMoveDirection(currentUnit.x, currentUnit.y, task.toX, task.toY)
        : (currentUnit?.facing || "west")
    );
    const directionId = getSpriteDirectionId(direction, "W");
    const sourceResolution = getMovementSpriteSourceResolution(currentUnit, spriteConfig, directionId);
    return getSpriteResolvedImagePath(sourceResolution, 1);
  }

  function getMovePreviewUnitImage(currentUnit) {
    return getMovePreviewSpriteImage(currentUnit, getRenderedUnitSpriteConfig(currentUnit));
  }

  function getUnitInspectorSpriteImage(currentUnit) {
    if (!currentUnit) {
      return "";
    }

    if (currentUnit.move || getUnitTaskInspectorPreviewMode(currentUnit) === "move") {
      return getMovePreviewUnitImage(currentUnit);
    }

    if (getUnitTaskInspectorPreviewMode(currentUnit) === "animated") {
      return getAnimatedTaskSpriteImage(currentUnit, getRenderedUnitSpriteConfig(currentUnit), 0);
    }

    return getStationaryUnitImage(currentUnit, performance.now(), 0);
  }

  function getStationarySpriteImage(currentUnit, spriteConfig, now = performance.now(), explicitFrameIndex = null) {
    if (isUnitWorking(currentUnit)) {
      const frameIndex =
        explicitFrameIndex === null ? getWorkingUnitFrameIndex(now) : explicitFrameIndex;

      return getAnimatedTaskSpriteImage(currentUnit, spriteConfig, frameIndex);
    }

    const directionId = getSpriteRenderDirection(currentUnit);
    const sourceResolution = getCargoSpriteSourceResolution(currentUnit, spriteConfig, "Idle", directionId)
      || getFirstResolvedSpriteSource(
        spriteConfig,
        getDirectionalSpriteSourceCandidates("stationary"),
        directionId,
      );
    return getSpriteResolvedImagePath(sourceResolution);
  }

  function getStationaryUnitImage(currentUnit, now = performance.now(), explicitFrameIndex = null) {
    return getStationarySpriteImage(
      currentUnit,
      getRenderedUnitSpriteConfig(currentUnit),
      now,
      explicitFrameIndex,
    );
  }

  function getMovingSpriteImage(currentUnit, spriteConfig, direction = "west", now = performance.now()) {
    const directionId = getSpriteDirectionId(direction, "W");
    const sourceResolution = getMovementSpriteSourceResolution(currentUnit, spriteConfig, directionId);
    const moveFrames = sourceResolution?.paths || [];
    const fallbackImage = getSpriteResolvedImagePath(sourceResolution);
    const moveFrameSequence = Array.isArray(spriteConfig?.moveFrameSequence)
      ? spriteConfig.moveFrameSequence
      : [];

    if (
      !currentUnit?.move ||
      moveFrames.length === 0 ||
      !spriteConfig ||
      moveFrameSequence.length === 0 ||
      sourceResolution?.kind !== "frames"
    ) {
      return fallbackImage;
    }

    const progress = getUnitMoveProgress(currentUnit, now);
    const phaseIndex = Math.min(
      moveFrameSequence.length - 1,
      Math.floor(progress * moveFrameSequence.length),
    );
    const frameIndex = moveFrameSequence[phaseIndex];

    return moveFrames[frameIndex] || fallbackImage;
  }

  function getMovingUnitImage(currentUnit = getCurrentUnit(), direction = "west", now = performance.now()) {
    return getMovingSpriteImage(
      currentUnit,
      getRenderedUnitSpriteConfig(currentUnit),
      direction,
      now,
    );
  }

  function getSpriteRenderSpec(spriteConfig) {
    const baseOffsetX = spriteConfig?.offsetX ?? 0;
    const baseOffsetY = spriteConfig?.offsetY ?? 0;

    return {
      width:
        spriteConfig?.width,
      height:
        spriteConfig?.height,
      anchorX:
        spriteConfig?.anchorX,
      anchorY:
        spriteConfig?.anchorY,
      groundOffset:
        spriteConfig?.groundOffset
        ?? 0.75,
      offsetX:
        baseOffsetX,
      offsetY:
        baseOffsetY,
    };
  }

  function getUnitSpriteRenderSpec(currentUnit = getCurrentUnit()) {
    return getSpriteRenderSpec(getRenderedUnitSpriteConfig(currentUnit));
  }

  function shouldMirrorSpriteImage(
    imagePath,
    currentUnit = getCurrentUnit(),
    spriteConfig = getRenderedUnitSpriteConfig(currentUnit),
  ) {
    const sourceResolution = getSpriteRenderSourceResolution(currentUnit, spriteConfig);

    if (sourceResolution && sourceResolution.paths.includes(imagePath)) {
      return Boolean(sourceResolution.mirror);
    }

    return false;
  }

  function shouldMirrorUnitImage(imagePath, currentUnit = getCurrentUnit()) {
    return shouldMirrorSpriteImage(imagePath, currentUnit, getRenderedUnitSpriteConfig(currentUnit));
  }

  function drawSpriteAtScreen(
    screen,
    drawContext,
    imagePath,
    imageRegistry,
    spriteConfig,
    mirrorX = false,
  ) {
    const image = imageRegistry[imagePath];
    const renderSpec = getSpriteRenderSpec(spriteConfig);
    const zoomIndex = getZoomIndex();
    const zoom = zoomLevels[zoomIndex];
    const resolvedBaseWidth =
      Number.isFinite(renderSpec.width) && renderSpec.width > 0
        ? renderSpec.width
        : (image?.complete && image.naturalWidth > 0 ? image.naturalWidth / 2 : 36);
    const resolvedBaseHeight =
      Number.isFinite(renderSpec.height) && renderSpec.height > 0
        ? renderSpec.height
        : (image?.complete && image.naturalHeight > 0 ? image.naturalHeight / 2 : 44);
    const resolvedAnchorX =
      Number.isFinite(renderSpec.anchorX)
        ? renderSpec.anchorX
        : (resolvedBaseWidth / 2);
    const resolvedAnchorY =
      Number.isFinite(renderSpec.anchorY)
        ? renderSpec.anchorY
        : resolvedBaseHeight;
    const renderScreen = {
      x: screen.x + (renderSpec.offsetX || 0) * zoom,
      y: screen.y + (renderSpec.offsetY || 0) * zoom,
    };
    const drawWidth = resolvedBaseWidth * zoom;
    const drawHeight = resolvedBaseHeight * zoom;
    const drawX = renderScreen.x - resolvedAnchorX * zoom;
    const ground = getUnitGroundPoint(renderScreen, renderSpec.groundOffset);
    const groundY = ground.y;
    const drawY = groundY - resolvedAnchorY * zoom;

    drawContext.save();
    if (image?.complete && image.naturalWidth > 0) {
      if (mirrorX) {
        drawContext.translate(drawX + drawWidth, drawY);
        drawContext.scale(-1, 1);
        drawContext.drawImage(image, 0, 0, drawWidth, drawHeight);
      } else {
        drawContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      }
    } else {
      drawContext.fillStyle = "#d7b45b";
      drawContext.beginPath();
      drawContext.arc(
        renderScreen.x,
        groundY - tile.height * 0.32,
        tile.width * 0.12,
        0,
        Math.PI * 2,
      );
      drawContext.fill();
    }

    drawContext.restore();
  }

  function drawUnitAtScreen(
    screen,
    drawContext = ctx,
    imagePath = getSpriteResolvedImagePath(
      getFirstResolvedSpriteSource(getRenderedUnitSpriteConfig(), spriteTaskSourceCandidateSets.idle, "W"),
    ),
    mirrorX = false,
    currentUnit = getCurrentUnit(),
  ) {
    return drawSpriteAtScreen(
      screen,
      drawContext,
      imagePath,
      unitImages,
      getRenderedUnitSpriteConfig(currentUnit),
      mirrorX,
    );
  }

  function getSpriteAnimationImagePaths(spriteConfig) {
    if (!spriteConfig || typeof spriteConfig !== "object") {
      return [];
    }

    return [
      ...new Set(
        Object.values(spriteConfig.sources || {})
          .flatMap((directionEntries) => Object.values(directionEntries || {}))
          .flatMap((entry) => entry?.paths || [])
          .filter(Boolean),
      ),
    ];
  }

  function getMountedRenderLayerImagePaths(catalog, layerKey) {
    const paths = [];

    for (const spec of Object.values(catalog || {})) {
      const mountedRenders = spec?.mountedRenders || {};
      const renderEntries = [
        mountedRenders.default,
        ...Object.values(mountedRenders.byUnitType || {}),
      ].filter(Boolean);

      for (const renderEntry of renderEntries) {
        paths.push(...getSpriteAnimationImagePaths(renderEntry?.[layerKey]));
      }
    }

    return [...new Set(paths)];
  }

  return {
    normalizeUnitSpriteTypeConfig,
    normalizeMountedRenderVariants,
    getAllUnitSpriteConfigs,
    getUnitSpriteConfig,
    getUnitSpriteIcon,
    getRenderedUnitSpriteConfig,
    getMountedVehicleSpriteConfig,
    getWorkingUnitFrameIndex,
    getUnitInspectorSpriteImage,
    getStationarySpriteImage,
    getStationaryUnitImage,
    getMovingSpriteImage,
    getMovingUnitImage,
    getUnitSpriteRenderSpec,
    shouldMirrorSpriteImage,
    shouldMirrorUnitImage,
    drawSpriteAtScreen,
    drawUnitAtScreen,
    getSpriteAnimationImagePaths,
    getMountedRenderLayerImagePaths,
  };
}
