import { createConstructiblesApi } from "./constructibles.js";
import { createBookContentApi } from "./book-content.js";
import { createBookRuntimeApi } from "./book-runtime.js";
import { createEditorUiApi } from "./editor-ui.js";
import {
  clamp,
  clampInteger,
  clampNumber,
  clampNonNegativeNumber,
} from "./number-utils.js";

const canvas = document.querySelector("#mapCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.querySelector(".viewport");
const appShell = document.querySelector(".app-shell");
const topBarsContainer = document.querySelector(".top-bars");
const mainMenuOverlay = document.querySelector("#mainMenuOverlay");
const mainMenuLoadingElements = [...document.querySelectorAll('[data-role="main-menu-loading"]')];
const playInspector = document.querySelector("#playInspector");
const editInspector = document.querySelector("#editInspector");
const bookOverlay = document.querySelector("#bookOverlay");
const bookTransientHint = document.querySelector("#bookTransientHint");
const bookTransientHintTextElements = [...document.querySelectorAll('[data-role="book-transient-hint-text"]')];
const bookVisual = document.querySelector(".book-visual");
const bookBookmarkBackBar = document.querySelector("#bookBookmarkBarBack");
const bookBookmarkFrontBar = document.querySelector("#bookBookmarkBarFront");
const bookBookmarkBars = [bookBookmarkBackBar, bookBookmarkFrontBar].filter(Boolean);
const unitActionBar = document.querySelector("#unitActionBar");
const foundationActionMenu = document.querySelector("#foundationActionMenu");
const gameActionMenu = document.querySelector("#gameActionMenu");
const saveSlotOverlay = document.querySelector("#saveSlotOverlay");
const saveSlotPanel = document.querySelector("#saveSlotPanel");
const saveSlotTitle = document.querySelector("#saveSlotTitle");
const saveSlotInput = document.querySelector("#saveSlotInput");
const saveSlotList = document.querySelector("#saveSlotList");
const saveSlotEmpty = document.querySelector("#saveSlotEmpty");
const editorResearchOverlay = document.querySelector("#editorResearchOverlay");
const editorResearchPanel = document.querySelector("#editorResearchPanel");
const editorResearchList = document.querySelector("#editorResearchList");
const editorResearchEmpty = document.querySelector("#editorResearchEmpty");
const appTitleElements = [...document.querySelectorAll('[data-role="app-title"]')];
const appSubtitleElements = [...document.querySelectorAll('[data-role="app-subtitle"]')];
const storesTitleElements = [...document.querySelectorAll('[data-role="stores-title"]')];
const topBars = {
  menu: document.querySelector('[data-bar-mode="menu"]'),
  play: document.querySelector('[data-bar-mode="play"]'),
  edit: document.querySelector('[data-bar-mode="edit"]'),
};
const hoverReadouts = [...document.querySelectorAll('[data-role="hover-readout"]')];
const mapSizeReadouts = [...document.querySelectorAll('[data-role="map-size"]')];
const tileMenu = document.querySelector("#tileMenu");
const tileMenuTitle = document.querySelector("#tileMenuTitle");
const variantMenuTitle = document.querySelector("#variantMenuTitle");
const terrainMenuOptions = document.querySelector("#terrainMenuOptions");
const variantMenu = document.querySelector("#variantMenu");
const variantMenuOptions = document.querySelector("#variantMenuOptions");
const foodMenuOptions = document.querySelector("#foodMenuOptions");
const buildingMenuOptions = document.querySelector("#buildingMenuOptions");
const vehicleMenuOptions = document.querySelector("#vehicleMenuOptions");
const unitMenuOptions = document.querySelector("#unitMenuOptions");
const unitActionMenuOptions = document.querySelector("#unitActionMenuOptions");
const editorDropdownToggleButtons = [...document.querySelectorAll('[data-action="toggle-editor-dropdown"]')];
const editorDropdownMenuElements = [...document.querySelectorAll('[data-role="editor-dropdown-menu"]')];
const editorTerrainLabelElements = [...document.querySelectorAll('[data-role="editor-terrain-label"]')];
const editorVisualLabelElements = [...document.querySelectorAll('[data-role="editor-visual-label"]')];
const editorFoodLabelElements = [...document.querySelectorAll('[data-role="editor-food-label"]')];
const editorBuildingLabelElements = [...document.querySelectorAll('[data-role="editor-building-label"]')];
const editorVehicleLabelElements = [...document.querySelectorAll('[data-role="editor-vehicle-label"]')];
const editorUnitLabelElements = [...document.querySelectorAll('[data-role="editor-unit-label"]')];
const editorUnitActionLabelElements = [...document.querySelectorAll('[data-role="editor-unit-action-label"]')];
const openEditorResearchButtons = [...document.querySelectorAll('[data-action="open-editor-research"]')];
const closeEditorResearchButtons = [...document.querySelectorAll('[data-action="close-editor-research"]')];
const clearEditorResearchGoalButtons = [...document.querySelectorAll('[data-action="clear-editor-research-goal"]')];
const editorResearchTitleElements = [...document.querySelectorAll('[data-role="editor-research-title"]')];
const editorResearchGoalElements = [...document.querySelectorAll('[data-role="editor-research-goal"]')];
const editorResourcePanels = [...document.querySelectorAll('[data-role="editor-resource-panel"]')];
const editorResourceTitleElements = [...document.querySelectorAll('[data-role="editor-resource-title"]')];
const editorResourceSeparators = [...document.querySelectorAll('[data-role="editor-resource-separator"]')];
const editorResourceCurrentFields = [...document.querySelectorAll('[data-role="editor-resource-current-field"]')];
const editorResourceTotalFields = [...document.querySelectorAll('[data-role="editor-resource-total-field"]')];
const editorFoodPanels = [...document.querySelectorAll('[data-role="editor-food-panel"]')];
const editorBuildingPanels = [...document.querySelectorAll('[data-role="editor-building-panel"]')];
const editorVehiclePanels = [...document.querySelectorAll('[data-role="editor-vehicle-panel"]')];
const editorCurrentLabelElements = [...document.querySelectorAll('[data-role="editor-current-label"]')];
const editorTotalLabelElements = [...document.querySelectorAll('[data-role="editor-total-label"]')];
const editorCompletionLabelElements = [...document.querySelectorAll('[data-role="editor-completion-label"]')];
const editorAbandonedLabelElements = [...document.querySelectorAll('[data-role="editor-abandoned-label"]')];
const editorResourceCurrentInput = document.querySelector('[data-action="editor-resource-current"]');
const editorResourceTotalInput = document.querySelector('[data-action="editor-resource-total"]');
const editorFoodCurrentInput = document.querySelector('[data-action="editor-food-current"]');
const editorFoodTotalInput = document.querySelector('[data-action="editor-food-total"]');
const editorBuildingCompletionInput = document.querySelector('[data-action="editor-building-completion"]');
const editorBuildingAbandonedInput = document.querySelector('[data-action="editor-building-abandoned"]');
const editorVehicleCompletionInput = document.querySelector('[data-action="editor-vehicle-completion"]');
const editorVehicleAbandonedInput = document.querySelector('[data-action="editor-vehicle-abandoned"]');
const zoomControlGroups = [...document.querySelectorAll(".zoom-controls")];
const gameMenuToggleButtons = [...document.querySelectorAll('[data-action="toggle-game-menu"]')];
const newRandomMapButtons = [...document.querySelectorAll('[data-action="new-random-map"]')];
const newEmptyMapButtons = [...document.querySelectorAll('[data-action="new-empty-map"]')];
const loadStateButtons = [...document.querySelectorAll('[data-action="load-state"]')];
const saveStateButtons = [...document.querySelectorAll('[data-action="save-state"]')];
const saveStateAsButtons = [...document.querySelectorAll('[data-action="save-state-as"]')];
const openMainMenuButtons = [...document.querySelectorAll('[data-action="main-menu"]')];
const dismissSlotPanelButtons = [...document.querySelectorAll('[data-action="close-slot-panel"], [data-action="cancel-slot-panel"]')];
const cancelSlotPanelButtons = [...document.querySelectorAll('[data-action="cancel-slot-panel"]')];
const closeSlotPanelIconButtons = [...document.querySelectorAll('[data-action="close-slot-panel"]')];
const confirmSlotPanelButtons = [...document.querySelectorAll('[data-action="confirm-slot-panel"]')];
const importSlotPanelButtons = [...document.querySelectorAll('[data-action="import-slot-panel"]')];
const zoomOutButtons = [...document.querySelectorAll('[data-action="zoom-out"]')];
const zoomInButtons = [...document.querySelectorAll('[data-action="zoom-in"]')];
const zoomLevelReadouts = [...document.querySelectorAll('[data-role="zoom-level"]')];
const fileDirtyMarkers = [...document.querySelectorAll('[data-role="file-dirty-marker"]')];
const tileInspectorTitleElements = [...document.querySelectorAll('[data-role="tile-inspector-title"]')];
const tileInfoPrimaryItems = [...document.querySelectorAll('[data-role="tile-info-primary"]')];
const tileInfoPrimaryCanvases = [...document.querySelectorAll('[data-role="tile-info-primary-canvas"]')];
const tileInfoPrimaryCaptions = [...document.querySelectorAll('[data-role="tile-info-primary-caption"]')];
const tileInfoSecondaryItems = [...document.querySelectorAll('[data-role="tile-info-secondary"]')];
const tileInfoSecondaryCanvases = [...document.querySelectorAll('[data-role="tile-info-secondary-canvas"]')];
const tileInfoSecondaryCaptions = [...document.querySelectorAll('[data-role="tile-info-secondary-caption"]')];
const unitTitleReadouts = [...document.querySelectorAll('[data-role="unit-title"]')];
const unitActionSpriteImages = [...document.querySelectorAll('[data-role="unit-action-sprite"]')];
const unitActionProgressReadouts = [...document.querySelectorAll('[data-role="unit-action-progress"]')];
const unitTaskRows = [...document.querySelectorAll('[data-role="unit-task-row"]')];
const turnReadouts = [...document.querySelectorAll('[data-role="turn-readout"]')];
const situationMessageDisplays = [...document.querySelectorAll('[data-role="situation-message-display"]')];
const situationMessageBubbleElements = [...document.querySelectorAll('[data-role="situation-message-bubble"]')];
const situationSpeakerHeadElements = [...document.querySelectorAll('[data-role="situation-speaker-head"]')];
const situationMessageTextElements = [...document.querySelectorAll('[data-role="situation-message-text"]')];
const situationMessageToggleLabelElements = [...document.querySelectorAll('[data-role="situation-message-toggle-label"]')];
const resourceStoneCanvases = [...document.querySelectorAll('[data-role="resource-stone-canvas"]')];
const resourceStoneCaptions = [...document.querySelectorAll('[data-role="resource-stone-caption"]')];
const resourceLumberCanvases = [...document.querySelectorAll('[data-role="resource-lumber-canvas"]')];
const resourceLumberCaptions = [...document.querySelectorAll('[data-role="resource-lumber-caption"]')];
const resourceFoodCanvases = [...document.querySelectorAll('[data-role="resource-food-canvas"]')];
const resourceFoodCaptions = [...document.querySelectorAll('[data-role="resource-food-caption"]')];
const fileReadouts = [...document.querySelectorAll('[data-role="file-readout"]')];
const nextTurnButtons = [...document.querySelectorAll('[data-action="next-turn"]')];
const nextUnitButtons = [...document.querySelectorAll('[data-action="select-next-unit"]')];
const autoPassInputs = [...document.querySelectorAll('[data-action="auto-pass"]')];
const musicEnabledInputs = [...document.querySelectorAll('[data-action="music-enabled"]')];
const musicVolumeInputs = [...document.querySelectorAll('[data-action="music-volume"]')];
const cancelUnitTaskButtons = [...document.querySelectorAll('[data-action="cancel-unit-task"]')];
const openBookOverlayButtons = [...document.querySelectorAll('[data-action="open-book-overlay"]')];
const closeBookOverlayButtons = [...document.querySelectorAll('[data-action="close-book-overlay"]')];
const previousBookPageButtons = [...document.querySelectorAll('[data-action="turn-book-page-previous"]')];
const nextBookPageButtons = [...document.querySelectorAll('[data-action="turn-book-page-next"]')];
const bookPageLayers = [...document.querySelectorAll('[data-book-page-layer]')];
const toggleSituationMessageButtons = [...document.querySelectorAll('[data-action="toggle-situation-message"]')];
const previousSituationMessageButtons = [...document.querySelectorAll('[data-action="previous-situation-message"]')];
const nextSituationMessageButtons = [...document.querySelectorAll('[data-action="next-situation-message"]')];
const unitActionButtons = [...document.querySelectorAll('[data-action="select-unit-action"]')];
const autoPassLabels = [...document.querySelectorAll('[data-role="auto-pass-label"]')];
const musicToggleLabelElements = [...document.querySelectorAll('[data-role="music-toggle-label"]')];
const musicVolumeLabelElements = [...document.querySelectorAll('[data-role="music-volume-label"]')];
const slotNameLabels = [...document.querySelectorAll('[data-role="slot-name-label"]')];
const slotListTitles = [...document.querySelectorAll('[data-role="slot-list-title"]')];
const languageSelectorGroups = [...document.querySelectorAll('[data-role="language-selector"]')];
const languageOptionButtons = [...document.querySelectorAll('[data-action="set-language"]')];
const mainMenuItems = {
  watchIntro: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="watch-intro"]'),
  startNewGame: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="start-new-game"]'),
  play: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="play"]'),
  loadGame: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="load-game"]'),
  edit: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="edit"]'),
  importExport: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="import-export"]'),
};
const staticLayerCanvas = document.createElement("canvas");
const staticLayerCtx = staticLayerCanvas.getContext("2d");
const staticUnitsLayerCanvases = [document.createElement("canvas"), document.createElement("canvas")];
const staticUnitsLayerContexts = staticUnitsLayerCanvases.map((layerCanvas) => layerCanvas.getContext("2d"));
const backgroundMusic = new Audio("assets/audio/music.mp3");
const introMusic = new Audio("assets/audio/intro.mp3");
const researchBookBookmarkId = "techs";

const rules = window.APP_RULES;
const localization = window.APP_LOCALIZATION;
const languageStorageKey = "schtroumpfilization:language:v1";
const availableLanguages = localization?.languages || {};
const currentLanguage = loadCurrentLanguage();
const strings = availableLanguages[currentLanguage];

if (!rules) {
  throw new Error("Missing game rules.");
}

if (!strings) {
  throw new Error(`Missing localization strings for language: ${currentLanguage}`);
}

const canvasPadding = 64;

const baseTile = {
  width: 88,
  height: 44,
  edge: 12,
};

const tile = { ...baseTile };
const nativeSingleCellAssetScaleAt100Zoom = 0.5;

const zoomLevels = [0.5, 1, 2];
const interactionModes = {
  edit: "edit",
  play: "play",
};
const unitActions = {
  walk: "walk",
  dismount: "dismount",
  layFoundation: "layFoundation",
  play: "play",
  research: "research",
  gatherFood: "gatherFood",
  gatherMaterials: "gatherMaterials",
  buildHouse: "buildHouse",
  demolish: "demolish",
};
const unitUiActions = Object.freeze({
  work: "work",
});
const editorSupportedUnitActions = Object.freeze([
  unitActions.play,
  unitActions.research,
]);
const orderedUnitActions = Object.freeze(Object.values(unitActions));
const unitActionSpecs = Object.freeze({
  [unitActions.walk]: Object.freeze({
    id: unitActions.walk,
    taskType: "move",
    inspectorPreview: "move",
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "move",
      toX: destinationCell.x,
      toY: destinationCell.y,
    } : null,
    serializeTask: (task) => serializeTargetedUnitTask(task, "move"),
    preserveTask: (task) => serializeTargetedUnitTask(task, "move"),
    normalizeTask: (task, options) => normalizeMoveUnitTask(task, options),
    resolveTask: (currentUnit) => resolveMoveTaskForTurn(currentUnit),
    queueTask: (options) => queueWalkUnitAction(options),
  }),
  [unitActions.dismount]: Object.freeze({
    id: unitActions.dismount,
    taskType: "dismount",
    inspectorPreview: "move",
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "dismount",
      toX: destinationCell.x,
      toY: destinationCell.y,
    } : null,
    serializeTask: (task) => serializeTargetedUnitTask(task, "dismount"),
    preserveTask: (task) => serializeTargetedUnitTask(task, "dismount"),
    normalizeTask: (task, options) => normalizeDismountUnitTask(task, options),
    resolveTask: (currentUnit) => resolveDismountTask(currentUnit),
    queueTask: (options) => queueDismountUnitAction(options),
  }),
  [unitActions.layFoundation]: Object.freeze({
    id: unitActions.layFoundation,
    taskType: "layFoundation",
    createTask: ({ destinationCell, constructible } = {}) => (
      destinationCell && constructible ? {
        type: "layFoundation",
        toX: destinationCell.x,
        toY: destinationCell.y,
        subjectKind: constructible.kind === "vehicle" ? "vehicle" : "building",
        subjectType: constructible.type || "house",
      } : null
    ),
    serializeTask: (task) => serializeLayFoundationUnitTask(task, "layFoundation"),
    preserveTask: (task) => serializeLayFoundationUnitTask(task, "layFoundation"),
    normalizeTask: (task, options) => normalizeLayFoundationUnitTask(task, options),
    resolveTask: (currentUnit) => resolveLayFoundationTask(currentUnit),
    queueTask: (options) => queueLayFoundationUnitAction(options),
  }),
  [unitActions.play]: Object.freeze({
    id: unitActions.play,
    taskType: "perform",
    countsAsWork: true,
    createTask: () => ({ type: "perform" }),
    serializeTask: () => serializeSimpleUnitTask("perform"),
    preserveTask: () => serializeSimpleUnitTask("perform"),
    normalizeTask: () => serializeSimpleUnitTask("perform"),
    resolveTask: (currentUnit) => resolvePerformTask(currentUnit),
    queueTask: (options) => queuePlayUnitAction(options),
    getTaskSpriteSourceCandidates: () => spriteTaskSourceCandidateSets.play,
  }),
  [unitActions.research]: Object.freeze({
    id: unitActions.research,
    taskType: "research",
    countsAsWork: true,
    createTask: () => ({ type: "research" }),
    serializeTask: () => serializeSimpleUnitTask("research"),
    preserveTask: () => serializeSimpleUnitTask("research"),
    normalizeTask: () => serializeSimpleUnitTask("research"),
    resolveTask: (currentUnit) => resolveResearchTask(currentUnit),
    queueTask: (options) => queueResearchUnitAction(options),
    getTaskSpriteSourceCandidates: () => spriteTaskSourceCandidateSets.research,
  }),
  [unitActions.gatherFood]: Object.freeze({
    id: unitActions.gatherFood,
    taskType: "gatherFood",
    countsAsWork: true,
    usesTargetTaskDirection: true,
    usesTargetGroundPoint: true,
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "gatherFood",
      toX: destinationCell.x,
      toY: destinationCell.y,
      turnsRemaining: getGatherTaskDurationTurns(),
    } : null,
    serializeTask: (task) => serializeGatherUnitTask(task, "gatherFood"),
    preserveTask: (task) => serializeGatherUnitTask(task, "gatherFood"),
    normalizeTask: (task, options) => normalizeGatherFoodUnitTask(task, options),
    resolveTask: (currentUnit) => resolveGatherFoodTask(currentUnit),
    queueTask: (options) => queueGatherFoodUnitAction(options),
    getInspectorProgressText: (currentUnit) => getGatherTaskProgressText(currentUnit?.task),
  }),
  [unitActions.gatherMaterials]: Object.freeze({
    id: unitActions.gatherMaterials,
    taskType: "gatherMaterials",
    countsAsWork: true,
    usesTargetTaskDirection: true,
    usesTargetGroundPoint: true,
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "gatherMaterials",
      toX: destinationCell.x,
      toY: destinationCell.y,
      turnsRemaining: getGatherTaskDurationTurns(),
    } : null,
    serializeTask: (task) => serializeGatherUnitTask(task, "gatherMaterials"),
    preserveTask: (task) => serializeGatherUnitTask(task, "gatherMaterials"),
    normalizeTask: (task, options) => normalizeGatherMaterialsUnitTask(task, options),
    resolveTask: (currentUnit) => resolveGatherMaterialsTask(currentUnit),
    queueTask: (options) => queueGatherMaterialsUnitAction(options),
    getInspectorProgressText: (currentUnit) => getGatherTaskProgressText(currentUnit?.task),
  }),
  [unitActions.buildHouse]: Object.freeze({
    id: unitActions.buildHouse,
    taskType: "buildHouse",
    countsAsWork: true,
    usesTargetTaskDirection: true,
    usesTargetGroundPoint: true,
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "buildHouse",
      toX: destinationCell.x,
      toY: destinationCell.y,
    } : null,
    serializeTask: (task) => serializeTargetedUnitTask(task, "buildHouse"),
    preserveTask: (task) => serializeTargetedUnitTask(task, "buildHouse"),
    normalizeTask: (task, options) => normalizeBuildHouseUnitTask(task, options),
    resolveTask: (currentUnit) => resolveBuildHouseTask(currentUnit),
    queueTask: (options) => queueBuildHouseUnitAction(options),
  }),
  [unitActions.demolish]: Object.freeze({
    id: unitActions.demolish,
    taskType: "demolish",
    countsAsWork: true,
    usesTargetTaskDirection: true,
    usesTargetGroundPoint: true,
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "demolish",
      toX: destinationCell.x,
      toY: destinationCell.y,
    } : null,
    serializeTask: (task) => serializeTargetedUnitTask(task, "demolish"),
    preserveTask: (task) => serializeTargetedUnitTask(task, "demolish"),
    normalizeTask: (task, options) => normalizeDemolishUnitTask(task, options),
    resolveTask: (currentUnit) => resolveDemolishTask(currentUnit),
    queueTask: (options) => queueDemolishUnitAction(options),
  }),
});
const unitActionIdsByTaskType = Object.freeze(
  Object.fromEntries(
    Object.values(unitActionSpecs).map((spec) => [spec.taskType, spec.id]),
  ),
);
let unitSpriteConfigs = createDefaultUnitSpriteConfigs();

const map = {
  width: 42,
  height: 64,
  cells: [],
};
const defaultMapConfig = {
  width: map.width,
  height: map.height,
};

const terrain = {
  water: {
    label: strings.terrain.water,
    image: "assets/tiles/water_01.png",
    variants: [
      {
        id: "water_01",
        label: strings.terrainVariants.water_01,
        image: "assets/tiles/water_01.png",
        weight: 1,
      },
      {
        id: "water_02",
        label: strings.terrainVariants.water_02,
        image: "assets/tiles/water_02.png",
        weight: 9,
      },
    ],
    top: "#3d8bb4",
    side: "#27627f",
    detail: "#b7dcec",
    stroke: "#23536b",
  },
  grass: {
    label: strings.terrain.grass,
    image: "assets/tiles/grass_01.png",
    variants: [
      { id: "grass_01", label: strings.terrainVariants.grass_01, image: "assets/tiles/grass_01.png" },
      { id: "grass_02", label: strings.terrainVariants.grass_02, image: "assets/tiles/grass_02.png" },
    ],
    top: "#77a85b",
    side: "#4e7a42",
    detail: "#cae386",
    stroke: "#426b39",
  },
  forest: {
    label: strings.terrain.forest,
    image: "assets/tiles/forest_01.png",
    variants: [
      {
        id: "forest_01",
        label: strings.terrainVariants.forest_01,
        image: "assets/tiles/forest_01.png",
      },
      {
        id: "forest_02",
        label: strings.terrainVariants.forest_02,
        image: "assets/tiles/forest_02.png",
      },
    ],
    top: "#4d8a54",
    side: "#315f3c",
    detail: "#1f4f32",
    stroke: "#2d5435",
  },
  mountain: {
    label: strings.terrain.mountain,
    image: "assets/tiles/hill_01.png",
    variants: [
      {
        id: "mountain_01",
        label: strings.terrainVariants.mountain_01,
        image: "assets/tiles/hill_01.png",
        weight: 1,
      },
      {
        id: "mountain_02",
        label: strings.terrainVariants.mountain_02,
        image: "assets/tiles/hill_02.png",
        weight: 9,
      },
    ],
    top: "#a79569",
    side: "#7b684d",
    detail: "#e0d2a1",
    stroke: "#68583f",
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

// Visual transitions are derived from neighbors; they are not stored in map.cells.
let origin = { x: 0, y: 0 };
let hoverCell = null;
let playHoverCell = null;
let activeCell = null;
let openEditorDropdownId = null;
let drawList = [];
let didCenterInitialView = false;
let zoomIndex = 1;
let interactionMode = null;
let mainMenuOpen = true;
let units = [];
let unitOccupancyIndex = new Map();
let unit = null;
let buildings = [];
let vehicles = [];
let animationFrameId = 0;
let animationTimerId = 0;
let scheduledAnimationIntervalMs = 0;
let lastAnimationFrameAt = 0;
let staticLayerDirty = true;
let staticUnitsLayerDirty = true;
let currentDpr = 1;
let currentTurn = 1;
let autoAdvanceTurns = true;
let autoAdvanceQueued = false;
let autoAdvanceFrameId = 0;
const playPhases = {
  ordering: "ordering",
  replaying: "replaying",
};
let playPhase = playPhases.ordering;
let replayPauseTimeoutId = 0;
let turnReplayQueue = [];
let turnReplayHadWork = false;
let turnReplayHadMove = false;
let turnReplayStartStates = new Map();
let turnReplayFinalStates = new Map();
let turnReplayVehicleStartStates = new Map();
let turnReplayVehicleFinalStates = new Map();
let turnReplayMoveTargets = new Map();
let selectedUnitAction = unitActions.walk;
let selectedFoundationConstructibleId = null;
let inspectedPlayCell = null;
let stockpile = { stone: 0, lumber: 0, food: 0 };
let foodShortageTurns = 0;
let situationMessages = [];
let situationMessageVisible = false;
let situationMessageViewIndex = -1;
let situationMessageTypingTimeoutId = 0;
let situationMessageTypingToken = 0;
let bookOverlayTriggerButton = null;
let bookOverlayRestoreState = null;
let bookOverlayIntroMode = false;
let bookPageTurnAnimation = null;
let bookPageTurnAnimationTimeoutId = 0;
let bookSequencePlayback = null;
let bookSequencePlaybackTimeoutId = 0;
let introMusicSegmentPlaybackActive = false;
let visualAssetsLoaded = false;
let visualAssetsLoadPromise = null;
let activeGameMenuButton = null;
let slotPanelState = null;
const tileImages = {};
const buildingImages = {};
const vehicleImages = {};
const shoreOverlayImages = {};
const resourceOverlayImages = {};
const resourceIconImages = {};
const unitImages = {};
const imageLoadPromises = new WeakMap();
const saveVersion = 9;
const storageKeys = {
  filePrefix: "schtroumpfilization:save-file:v1:",
  currentFile: {
    edit: "schtroumpfilization:current-file:edit:v1",
    play: "schtroumpfilization:current-file:play:v1",
  },
  audioSettings: "schtroumpfilization:audio-settings:v1",
};
const currentFileNames = {
  edit: null,
  play: null,
};
const autosaveSlotName = "autosave";
const situationMessageTypingDelayMs = 18;
let bookTotalPageCount = 24;
const bookVisiblePageLayerCount = 8;
const bookEntityHiddenClass = "book-entity-hidden";
const bookLayerWithSpineClass = "book-layer-with-spine";
const bookPagePlaceholderClass = "book-page-placeholder";
const bookPageContentClass = "book-page-content";
const bookPageContentHiddenClass = "book-page-content-hidden";
const bookPageTurnOverlayClass = "book-page-turn-overlay";
const bookPageTurnFramesPerPhase = 8;
const bookPageTurnFrameDurationMs = 38;
const bookPageTurnCollapsedScale = 0.52;
const bookMinimumPageCount = 16;
const bookIntroSequenceId = "intro";
const bookSequenceInitialPauseMs = 10000;
const bookSequenceTurnPauseMs = 14000;
const buildingManifestPath = "data/buildings.json";
const vehicleManifestPath = "data/vehicles.json";
const unitManifestPath = "data/units.json";
const technologyManifestPath = "data/technologies.json";
const introMusicSegmentStartTime = 16;
const introMusicSegmentEndTime = 101;
const julianTurnEpoch = {
  year: 1468,
  month: 5,
  day: 31,
};
const workTurnDisplayDelayMs = 720;
const animatedUiFrameIntervalMs = 1000 / 15;
const moveAnimationFrameIntervalMs = 1000 / 60;
const resourceUiIcons = {
  stone: "assets/resources/stone_icon.png",
  lumber: "assets/resources/lumber_icon.png",
  food: "assets/resources/food_icon.png",
};
const stockpileResourceTypes = ["stone", "lumber", "food"];
const defaultAudioSettings = {
  musicEnabled: true,
  volume: 0.55,
};
let audioSettings = loadAudioSettings();

backgroundMusic.loop = true;
backgroundMusic.preload = "auto";
backgroundMusic.volume = audioSettings.volume;
introMusic.loop = false;
introMusic.preload = "auto";
introMusic.volume = audioSettings.volume;
introMusic.addEventListener("timeupdate", () => {
  if (!introMusicSegmentPlaybackActive) {
    return;
  }

  if (introMusic.currentTime >= introMusicSegmentEndTime) {
    completeIntroMusicSegmentPlayback();
  }
});
introMusic.addEventListener("ended", () => {
  completeIntroMusicSegmentPlayback();
});

const julianTurnEpochJdn = getJulianDayNumber(
  julianTurnEpoch.year,
  julianTurnEpoch.month,
  julianTurnEpoch.day,
);

let bookDocument = null;
let bookContentLoadPromise = null;
let bookState = null;
let technologyCatalog = createDefaultTechnologyCatalog();
let technologyCatalogLoadPromise = null;
let buildingCatalog = createDefaultBuildingCatalog();
let buildingDefinitionsLoadPromise = null;
let vehicleCatalog = createDefaultBuildingCatalog();
let vehicleDefinitionsLoadPromise = null;
let vehicleDefinitionsLoaded = false;
let unitDefinitionsLoadPromise = null;
let unitSpawnRules = [];
let researchState = createDefaultResearchState();
let editStateDirty = false;
let editorResearchReturnFocusButton = null;
let pendingBookResearchAssignmentUnitId = null;

const {
  normalizeConstructibleKind,
  getConstructibleCollectionForKind,
  getConstructibleRulesForKind,
  getEffectiveConstructibleRulesForKind,
  getConstructibleSpecForKind,
  getDefinedConstructibleTypesForKind,
  getConstructibleCountsByTypeForKind,
  getConstructibleImageRegistryForKind,
  getConstructibleRenderModeForKind,
  getConstructibleSubtypeVariantsForKind,
  chooseConstructibleSubtypeForKind,
  getDefaultConstructibleDimensionForKind,
  getConstructibleBottomRowForKind,
  getConstructibleDimensionForKind,
  getConstructiblePlacementEntriesForKind,
  getConstructiblePlacementCellsForKind,
  getConstructibleOccupiedCellsForKind,
  getConstructiblePlacementIndexAtCellForKind,
  createFoundationConstructibleDescriptor,
  parseFoundationConstructibleId,
  getConstructibleBuildCostForKind,
  getConstructibleBuildCostStatusForKind,
  getBuildingCompleteness,
  getConstructibleConstructionCostForKind,
  isConstructibleWalkableForKind,
  getConstructibleConstructionThresholdsForKind,
  serializeConstructibleForKind,
  markConstructibleCellsVisitedForKind,
  createConstructibleConstructionAtCellForKind,
  normalizeConstructibleSubtypeForKind,
  normalizeConstructiblesStateForKind,
  constructibleOccupiesCell,
  getConstructiblesAtCellForKind,
  findConstructibleAtCellForKind,
  isConstructibleInstanceWalkableForKind,
  getWalkableConstructibleAtCellForKind,
  getConstructibleVisualForKind,
  drawConstructibleForKind,
} = createConstructiblesApi({
  rules,
  map,
  tile,
  zoomLevels,
  ctx,
  buildingImages,
  vehicleImages,
  getZoomIndex: () => zoomIndex,
  getBuildings: () => buildings,
  getVehicles: () => vehicles,
  getBuildingCatalog: () => buildingCatalog,
  getVehicleCatalog: () => vehicleCatalog,
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
  normalizeLinkedEntityId,
  normalizeBuildingState,
  drawNativeSingleCellImageAtCell,
  isoToScreen,
});

function setTextContent(elements, text) {
  for (const element of elements) {
    element.textContent = text;
  }
}

function setDisabledState(elements, disabled) {
  for (const element of elements) {
    element.disabled = disabled;
  }
}

function setHiddenState(elements, hidden) {
  for (const element of elements) {
    element.hidden = hidden;
  }
}

function setCheckedState(elements, checked) {
  for (const element of elements) {
    element.checked = checked;
  }
}

function updateWatchIntroButton() {
  if (!mainMenuItems.watchIntro) {
    return;
  }

  if (!bookDocument?.loaded) {
    mainMenuItems.watchIntro.disabled = false;
    return;
  }

  const sequencePages = bookDocument?.sequences?.[bookIntroSequenceId];
  mainMenuItems.watchIntro.disabled = !Array.isArray(sequencePages) || sequencePages.length < 2;
}

function setAttributeForElements(elements, name, value) {
  for (const element of elements) {
    element.setAttribute(name, value);
  }
}

const {
  createDefaultBookDocument,
  loadBookManifestDocument,
  fillBookPageSideContent,
  getBookTargetPageIdFromLink,
  getBookTechWidgetTechnologyId,
} = createBookContentApi({
  localizationApi: {
    localization,
    availableLanguages,
    getCurrentLanguage: () => currentLanguage,
    bookMinimumPageCount,
    getBookTotalPageCount: () => bookTotalPageCount,
  },
  bindingApi: {
    strings,
    rules,
    formatDisplayedNumber,
    resourceUiIcons,
    getDefaultUnitTypeId,
    normalizeUnitTypeId,
    hasDefinedUnitType,
    getResolvedUnitConfig,
    getUnitSpriteConfig,
    getUnitSpriteIcon,
    getDefaultUnitName,
    getTechnologyDefinition,
    getTechnologyLabel,
    getTechnologyDisplayState,
    getTechnologyProgressPercent,
    getSelectedResearchGoalTechnologyId,
    canSelectResearchGoal,
    getConstructibleRules,
    getConstructibleSpec,
    getConstructibleLabel,
    getFoodDefinition,
    getResourceLabel,
  },
  pageApi: {
    bookPageContentHiddenClass,
    getBookPageDefinition,
    getBookPageNumberById,
  },
});

bookDocument = createDefaultBookDocument();

const {
  createInitialBookState,
  ensureBookContentLoaded,
  closeBookOverlay,
  initializeBookPageContent,
  updateBookPageStack,
  jumpBookToPageId,
  openBookOverlayAtBookmark,
  openBookOverlayPanel,
  playBookSequence,
  startBookPageTurnAnimation,
} = createBookRuntimeApi({
  state: {
    getBookDocument: () => bookDocument,
    setBookDocument: (documentDefinition) => {
      bookDocument = documentDefinition;
    },
    getBookContentLoadPromise: () => bookContentLoadPromise,
    setBookContentLoadPromise: (promise) => {
      bookContentLoadPromise = promise;
    },
    getBookTotalPageCount: () => bookTotalPageCount,
    setBookTotalPageCount: (pageCount) => {
      bookTotalPageCount = pageCount;
    },
    getBookState: () => bookState,
    setBookState: (state) => {
      bookState = state;
    },
    getBookOverlayTriggerButton: () => bookOverlayTriggerButton,
    setBookOverlayTriggerButton: (button) => {
      bookOverlayTriggerButton = button;
    },
    getBookOverlayRestoreState: () => bookOverlayRestoreState,
    setBookOverlayRestoreState: (restoreState) => {
      bookOverlayRestoreState = restoreState;
    },
    getBookOverlayIntroMode: () => bookOverlayIntroMode,
    setBookOverlayIntroMode: (introMode) => {
      bookOverlayIntroMode = introMode;
    },
    getBookPageTurnAnimation: () => bookPageTurnAnimation,
    setBookPageTurnAnimation: (animation) => {
      bookPageTurnAnimation = animation;
    },
    getBookPageTurnAnimationTimeoutId: () => bookPageTurnAnimationTimeoutId,
    setBookPageTurnAnimationTimeoutId: (timeoutId) => {
      bookPageTurnAnimationTimeoutId = timeoutId;
    },
    getBookSequencePlayback: () => bookSequencePlayback,
    setBookSequencePlayback: (playback) => {
      bookSequencePlayback = playback;
    },
    getBookSequencePlaybackTimeoutId: () => bookSequencePlaybackTimeoutId,
    setBookSequencePlaybackTimeoutId: (timeoutId) => {
      bookSequencePlaybackTimeoutId = timeoutId;
    },
    getMainMenuOpen: () => mainMenuOpen,
    setMainMenuOpen: (open) => {
      mainMenuOpen = open;
    },
    getInteractionMode: () => interactionMode,
    setInteractionMode: (mode) => {
      interactionMode = mode;
    },
  },
  dom: {
    bookOverlay,
    bookVisual,
    bookBookmarkBackBar,
    bookBookmarkFrontBar,
    bookBookmarkBars,
    previousBookPageButtons,
    nextBookPageButtons,
    bookPageLayers,
    mainMenuOverlay,
  },
  config: {
    bookVisiblePageLayerCount,
    bookEntityHiddenClass,
    bookLayerWithSpineClass,
    bookPagePlaceholderClass,
    bookPageContentClass,
    bookPageContentHiddenClass,
    bookPageTurnOverlayClass,
    bookPageTurnFramesPerPhase,
    bookPageTurnFrameDurationMs,
    bookPageTurnCollapsedScale,
    bookIntroSequenceId,
    bookSequenceInitialPauseMs,
    bookSequenceTurnPauseMs,
    interactionModes,
  },
  callbacks: {
    loadBookManifestDocument,
    updateWatchIntroButton,
    fillBookPageSideContent,
    closeGameActionMenu,
    closeSaveSlotPanel,
    hideTileMenu: (...args) => hideTileMenu(...args),
    ensureTechnologyCatalogLoaded,
    ensureBuildingDefinitionsLoaded,
    ensureVehicleDefinitionsLoaded,
    ensureUnitDefinitionsLoaded,
    updateInteractionModeUi,
    draw,
    hideBookTransientHint,
    clearPendingBookResearchAssignment,
    startIntroMusicSegmentPlayback,
    stopIntroMusicSegmentPlayback,
    isPlayMode,
    getCurrentLanguage: () => currentLanguage,
    getBookPageDefinition,
    getBookPageNumberById,
  },
});

bookState = createInitialBookState();

const {
  populateTerrainMenu,
  closeEditorDropdowns,
  updateEditorDropdownMenus,
  updateEditorResearchPanel,
  openEditorResearchPanel,
  closeEditorResearchPanel,
  applyEditorResearchStateChange,
  clearEditHoverState,
  updateEditInspector,
  openTileMenu,
  hideTileMenu,
  handleEditCanvasMove,
  handleEditCanvasClick,
  handleEditCanvasLeave,
  canEditFoodSelection,
  canEditBuildingSelection,
  canEditVehicleSelection,
  getEditorResourceMode,
  getEditorIntegerInputValue,
  getEditorNumberInputValue,
  bindEvents: bindEditorUiEvents,
} = createEditorUiApi({
  strings,
  terrain,
  rules,
  unitActions,
  editorSupportedUnitActions,
  getEditorLabel,
  state: {
    getHoverCell: () => hoverCell,
    setHoverCell: (cell) => {
      hoverCell = cell;
    },
    getActiveCell: () => activeCell,
    setActiveCell: (cell) => {
      activeCell = cell;
    },
    getOpenDropdownId: () => openEditorDropdownId,
    setOpenDropdownId: (dropdownId) => {
      openEditorDropdownId = dropdownId;
    },
    getEditorResearchReturnFocusButton: () => editorResearchReturnFocusButton,
    setEditorResearchReturnFocusButton: (button) => {
      editorResearchReturnFocusButton = button;
    },
    getResearchState: () => researchState,
    setResearchState: (state) => {
      researchState = state;
    },
    getMainMenuOpen: () => mainMenuOpen,
  },
  dom: {
    elements: {
      canvas,
      editInspector,
      hoverReadouts,
      editorResearchOverlay,
      editorResearchPanel,
      editorResearchList,
      editorResearchEmpty,
      tileMenuTitle,
      terrainMenuOptions,
      variantMenuOptions,
      foodMenuOptions,
      buildingMenuOptions,
      vehicleMenuOptions,
      unitMenuOptions,
      unitActionMenuOptions,
      editorDropdownToggleButtons,
      editorDropdownMenuElements,
      editorTerrainLabelElements,
      editorVisualLabelElements,
      editorFoodLabelElements,
      editorBuildingLabelElements,
      editorVehicleLabelElements,
      editorUnitLabelElements,
      editorUnitActionLabelElements,
      openEditorResearchButtons,
      closeEditorResearchButtons,
      clearEditorResearchGoalButtons,
      editorResearchTitleElements,
      editorResearchGoalElements,
      editorResourcePanels,
      editorResourceTitleElements,
      editorResourceSeparators,
      editorResourceTotalFields,
      editorFoodPanels,
      editorBuildingPanels,
      editorVehiclePanels,
      editorCurrentLabelElements,
      editorTotalLabelElements,
      editorCompletionLabelElements,
      editorAbandonedLabelElements,
      editorResourceCurrentInput,
      editorResourceTotalInput,
      editorFoodCurrentInput,
      editorFoodTotalInput,
      editorBuildingCompletionInput,
      editorBuildingAbandonedInput,
      editorVehicleCompletionInput,
      editorVehicleAbandonedInput,
    },
    setTextContent,
    setAttributeForElements,
    setDisabledState,
    setHiddenState,
    roundDisplayedQuantity,
    formatDisplayedQuantity,
    formatDisplayedNumber,
  },
  research: {
    getTechnologyCatalog: () => technologyCatalog,
    normalizeResearchState,
    ensureTechnologyCatalogLoaded,
    getSelectedResearchGoalTechnologyId,
    setSelectedResearchGoalTechnologyId,
    getTechnologyDisplayState,
    getTechnologyLabel,
    isTechnologyDiscovered,
    canSelectResearchGoal,
    getTechnologyProgress,
    getTechnologyDefinition,
    serializeResearchState,
    updateResearchPresentation,
  },
  world: {
    isEditMode,
    draw,
    resetTileReadout,
    getTerrainVariant,
    ensureCellVariant,
    getTerrainVariants,
    hasFoodResource,
    getBuildingAtCell,
    getVehicleAtCell,
    getUnitAtCell,
    getDefinedBuildingTypes,
    getDefinedVehicleTypes,
    getDefinedUnitTypeIds,
    canPlaceEditorBuildingAtCell,
    canPlaceEditorVehicleAtCell,
    canPlaceEditorUnitTypeAtCell,
    getCellVisitsCount,
    getCellPathWellKnownVisitsThreshold,
    getResourceLabel,
    getCellFoodMaxAmount,
    getBuildingCompleteness,
    getBuildingLabel,
    getVehicleLabel,
    getDefaultUnitName,
    getUnitTypeId,
    getUnitActionLabel,
    getFoundationBuildingTypeIcon,
    getVehicleTypeIcon,
    canUnitUseAction,
    getTaskActionId,
    serializeCell,
    pickTile,
  },
  mutations: {
    invalidateStaticLayer,
    setEditStateDirty,
    syncCellResourcesWithVariant,
    applyTerrainSelection,
    applyEditorFoodSelection,
    applyEditorBuildingSelection,
    applyEditorVehicleSelection,
    applyEditorUnitSelection,
    applyEditorUnitActionSelection,
    applyEditorResourceCurrentValue,
    applyEditorResourceTotalValue,
    applyEditorFoodCurrentValue,
    applyEditorFoodTotalValue,
    applyEditorBuildingCompletionValue,
    applyEditorBuildingAbandonedValue,
    applyEditorVehicleCompletionValue,
    applyEditorVehicleAbandonedValue,
  },
});

function resolveBuildingAssetPath(path, manifestPath = buildingManifestPath) {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  return new URL(path.trim(), new URL(manifestPath, window.location.href)).toString();
}

function resolveVehicleAssetPath(path, manifestPath = vehicleManifestPath) {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  return new URL(path.trim(), new URL(manifestPath, window.location.href)).toString();
}

function resolveUnitAssetPath(path, manifestPath = unitManifestPath) {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  return new URL(path.trim(), new URL(manifestPath, window.location.href)).toString();
}

function createDefaultUnitSpriteConfigs() {
  return {};
}

function createDefaultUnitRulesConfig() {
  return {
    default: {
      typeId: "",
    },
    types: {},
  };
}

function createDefaultUnitSpawnRules() {
  return [];
}

function normalizeLocalizedLabelsMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([languageId, label]) => [
        typeof languageId === "string" ? languageId.trim() : "",
        typeof label === "string" ? label.trim() : "",
      ])
      .filter(([languageId, label]) => languageId && label),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function resolveLocalizedLabel(labels, fallback = "", languageId = currentLanguage) {
  const normalizedLanguageId = typeof languageId === "string" && languageId.trim()
    ? languageId.trim()
    : currentLanguage;
  const defaultLanguageId = typeof localization?.defaultLanguage === "string" && localization.defaultLanguage.trim()
    ? localization.defaultLanguage.trim()
    : "fr";
  const resolved =
    labels?.[normalizedLanguageId] ||
    labels?.[defaultLanguageId] ||
    Object.values(labels || {}).find((label) => typeof label === "string" && label.trim()) ||
    fallback;

  return typeof resolved === "string" ? resolved.trim() : "";
}

function normalizeUnitActionList(actions) {
  return Array.isArray(actions)
    ? actions
      .map((action) => (typeof action === "string" ? action.trim() : ""))
      .filter(Boolean)
    : undefined;
}

function normalizeVehicleMountedRulesConfig(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return undefined;
  }

  const allowedActions = normalizeUnitActionList(entry.allowedActions);
  const movementTerrains = Array.isArray(entry.movementTerrains)
    ? [...new Set(
      entry.movementTerrains
        .map((terrainType) => (typeof terrainType === "string" ? terrainType.trim() : ""))
        .filter(Boolean),
    )]
    : undefined;
  const multipliersEntry = entry.multipliers && typeof entry.multipliers === "object" && !Array.isArray(entry.multipliers)
    ? entry.multipliers
    : null;
  const moveCostMultiplier = Number(multipliersEntry?.moveCost);
  const workPointsPerTurnMultipliers = normalizeUnitWorkPointsConfig(multipliersEntry?.workPointsPerTurn);
  const multipliers =
    Number.isFinite(moveCostMultiplier) || workPointsPerTurnMultipliers
      ? {
        ...(Number.isFinite(moveCostMultiplier) ? { moveCost: Math.max(0, moveCostMultiplier) } : {}),
        ...(workPointsPerTurnMultipliers ? { workPointsPerTurn: workPointsPerTurnMultipliers } : {}),
      }
      : undefined;

  if (!allowedActions && (!movementTerrains || movementTerrains.length === 0) && !multipliers) {
    return undefined;
  }

  return {
    ...(allowedActions ? { allowedActions } : {}),
    ...(movementTerrains && movementTerrains.length > 0 ? { movementTerrains } : {}),
    ...(multipliers ? { multipliers } : {}),
  };
}

function normalizeUnitWorkPointsConfig(workPoints) {
  if (!workPoints || typeof workPoints !== "object" || Array.isArray(workPoints)) {
    return undefined;
  }

  const entries = Object.fromEntries(
    Object.entries(workPoints)
      .map(([taskType, value]) => {
        const normalizedTaskType = typeof taskType === "string" ? taskType.trim() : "";
        const normalizedValue = Number(value);
        return normalizedTaskType && Number.isFinite(normalizedValue)
          ? [normalizedTaskType, normalizedValue]
          : null;
      })
      .filter(Boolean),
  );

  return Object.keys(entries).length > 0 ? entries : undefined;
}

function normalizeUnitModifiers(entries) {
  if (!Array.isArray(entries)) {
    return undefined;
  }

  const normalized = entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const when = normalizeRuleRequirements(entry.when);
      const set = normalizeUnitRulesConfig(entry.set);
      const addActions = normalizeUnitActionList(entry.addActions);
      const removeActions = normalizeUnitActionList(entry.removeActions);

      if (
        Object.keys(when).length === 0 &&
        Object.keys(set).length === 0 &&
        !addActions &&
        !removeActions
      ) {
        return null;
      }

      return {
        ...(Object.keys(when).length > 0 ? { when } : {}),
        ...(Object.keys(set).length > 0 ? { set } : {}),
        ...(addActions ? { addActions } : {}),
        ...(removeActions ? { removeActions } : {}),
      };
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeUnitRulesConfig(entry) {
  const unitEntry = entry && typeof entry === "object" ? entry : {};
  const normalized = {};
  const spriteTypeId = typeof unitEntry.spriteTypeId === "string" ? unitEntry.spriteTypeId.trim() : "";
  const name = typeof unitEntry.name === "string" ? unitEntry.name.trim() : "";
  const labels = normalizeLocalizedLabelsMap(unitEntry.labels);
  const stamina = Number(unitEntry.stamina);
  const foodConsumptionPerTurn = Number(unitEntry.foodConsumptionPerTurn);
  const researchPointsPerTurn = Number(unitEntry.researchPointsPerTurn);
  const allowedActions = normalizeUnitActionList(unitEntry.allowedActions);
  const workPointsPerTurn = normalizeUnitWorkPointsConfig(unitEntry.workPointsPerTurn);
  const availability = normalizeRuleRequirements(unitEntry.availability);
  const rawActionRequirements =
    unitEntry.actionRequirements && typeof unitEntry.actionRequirements === "object" && !Array.isArray(unitEntry.actionRequirements)
      ? unitEntry.actionRequirements
      : null;
  const actionRequirements = rawActionRequirements
    ? Object.fromEntries(
      Object.entries(rawActionRequirements)
        .map(([actionId, requirements]) => {
          const normalizedActionId = normalizePendingUnitAction(actionId);
          const normalizedRequirements = normalizeRuleRequirements(requirements);
          return normalizedActionId && Object.keys(normalizedRequirements).length > 0
            ? [normalizedActionId, normalizedRequirements]
            : null;
        })
        .filter(Boolean),
    )
    : undefined;
  const modifiers = normalizeUnitModifiers(unitEntry.modifiers);

  if (spriteTypeId) {
    normalized.spriteTypeId = spriteTypeId;
  }

  if (name) {
    normalized.name = name;
  }

  if (labels) {
    normalized.labels = labels;
  }

  if (Number.isFinite(stamina)) {
    normalized.stamina = stamina;
  }

  if (Number.isFinite(foodConsumptionPerTurn)) {
    normalized.foodConsumptionPerTurn = foodConsumptionPerTurn;
  }

  if (Number.isFinite(researchPointsPerTurn)) {
    normalized.researchPointsPerTurn = researchPointsPerTurn;
  }

  if (allowedActions) {
    normalized.allowedActions = allowedActions;
  }

  if (workPointsPerTurn) {
    normalized.workPointsPerTurn = workPointsPerTurn;
  }

  if (Object.keys(availability).length > 0) {
    normalized.availability = availability;
  }

  if (actionRequirements && Object.keys(actionRequirements).length > 0) {
    normalized.actionRequirements = actionRequirements;
  }

  if (modifiers) {
    normalized.modifiers = modifiers;
  }

  return normalized;
}

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
const spriteTaskSourceCandidateSets = Object.freeze({
  idle: Object.freeze([spriteSourceIds.idle]),
  work: Object.freeze([spriteSourceIds.work, spriteSourceIds.idle]),
  play: Object.freeze([spriteSourceIds.play, spriteSourceIds.work, spriteSourceIds.idle]),
  research: Object.freeze([spriteSourceIds.research, spriteSourceIds.work, spriteSourceIds.idle]),
});
const spriteSourceCandidateDefaultContextId = "default";

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

function normalizeSpriteFramePaths(value, imageResolver, manifestPath) {
  return Array.isArray(value)
    ? value.map((path) => imageResolver(path, manifestPath)).filter(Boolean)
    : undefined;
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

function normalizeNumericObject(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return undefined;
  }

  const normalized = {};

  for (const [key, value] of Object.entries(entry)) {
    const normalizedKey = typeof key === "string" ? key.trim() : "";
    const normalizedValue = Number(value);

    if (!normalizedKey || !Number.isFinite(normalizedValue)) {
      continue;
    }

    normalized[normalizedKey] = normalizedValue;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
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

function normalizeUnitSpriteTypeConfig(entry, manifestPath = unitManifestPath) {
  return normalizeSpriteAnimationConfig(entry, {
    manifestPath,
    imageResolver: resolveUnitAssetPath,
  });
}

function normalizeMountedSpriteLayerConfig(entry, manifestPath = vehicleManifestPath) {
  return normalizeSpriteAnimationConfig(entry, {
    manifestPath,
    imageResolver: resolveVehicleAssetPath,
    extraNumericFields: ["offsetX", "offsetY"],
  });
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

function normalizeUnitDefinitionsManifest(manifest, manifestPath = unitManifestPath) {
  const normalizedRules = createDefaultUnitRulesConfig();
  const defaultEntry = manifest?.default && typeof manifest.default === "object" ? manifest.default : {};
  const configuredDefaultTypeId = typeof defaultEntry.typeId === "string" ? defaultEntry.typeId.trim() : "";

  normalizedRules.default = {
    typeId: configuredDefaultTypeId || normalizedRules.default.typeId,
    ...normalizeUnitRulesConfig(defaultEntry),
  };

  const types = manifest?.types && typeof manifest.types === "object" && !Array.isArray(manifest.types)
    ? manifest.types
    : {};

  for (const [typeId, entry] of Object.entries(types)) {
    const normalizedTypeId = typeof typeId === "string" ? typeId.trim() : "";
    if (!normalizedTypeId || !entry || typeof entry !== "object") {
      continue;
    }

    normalizedRules.types[normalizedTypeId] = normalizeUnitRulesConfig(entry);
  }

  if (!normalizedRules.types[normalizedRules.default.typeId]) {
    const [firstTypeId] = Object.keys(normalizedRules.types);
    normalizedRules.default.typeId = firstTypeId || normalizedRules.default.typeId || "default";
  }

  const rawSpriteTypes = manifest?.spriteTypes && typeof manifest.spriteTypes === "object" && !Array.isArray(manifest.spriteTypes)
    ? manifest.spriteTypes
    : {};
  const normalizedSpriteTypes = createDefaultUnitSpriteConfigs();

  for (const [spriteTypeId, entry] of Object.entries(rawSpriteTypes)) {
    const normalizedSpriteTypeId = typeof spriteTypeId === "string" ? spriteTypeId.trim() : "";
    if (!normalizedSpriteTypeId || !entry || typeof entry !== "object") {
      continue;
    }

    normalizedSpriteTypes[normalizedSpriteTypeId] = normalizeUnitSpriteTypeConfig(entry, manifestPath);
  }

  const rawSpawnRules = Array.isArray(manifest?.spawnRules) ? manifest.spawnRules : [];
  const normalizedSpawnRules = rawSpawnRules
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const when = normalizeRuleRequirements(entry.when);
      const rawChoices = Array.isArray(entry.choices) ? entry.choices : [];
      const choices = rawChoices
        .map((choice) => {
          if (!choice || typeof choice !== "object") {
            return null;
          }

          const type = typeof choice.type === "string" ? choice.type.trim() : "";
          const weight = Math.max(0, Number(choice.weight) || 0);
          const requirements = normalizeRuleRequirements(choice.requirements);

          return type
            ? {
              id: type,
              weight,
              ...(Object.keys(requirements).length > 0 ? { requirements } : {}),
            }
            : null;
        })
        .filter(Boolean);

      return choices.length > 0
        ? {
          ...(Object.keys(when).length > 0 ? { when } : {}),
          choices,
        }
        : null;
    })
    .filter(Boolean);

  return {
    rules: normalizedRules,
    spriteTypes: normalizedSpriteTypes,
    spawnRules: normalizedSpawnRules,
  };
}

async function loadUnitDefinitions() {
  const response = await fetch(unitManifestPath, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load unit manifest: ${response.status}`);
  }

  return normalizeUnitDefinitionsManifest(await response.json(), unitManifestPath);
}

async function ensureUnitDefinitionsLoaded() {
  if (Object.keys(unitSpriteConfigs).length > 0 && Object.keys(rules.units?.types || {}).length > 0) {
    return {
      rules: rules.units,
      spriteTypes: unitSpriteConfigs,
    };
  }

  if (!unitDefinitionsLoadPromise) {
    unitDefinitionsLoadPromise = loadUnitDefinitions()
      .then((definitions) => {
        rules.units = definitions.rules;
        unitSpriteConfigs = definitions.spriteTypes;
        unitSpawnRules = definitions.spawnRules || createDefaultUnitSpawnRules();
        return definitions;
      })
      .finally(() => {
        unitDefinitionsLoadPromise = null;
      });
  }

  return unitDefinitionsLoadPromise;
}

function createDefaultBuildingCatalog() {
  return {};
}

function createDefaultBuildingRulesConfig() {
  return {
    default: {
      width: 1,
      height: 1,
    },
  };
}

function normalizeRuleIdList(value) {
  const normalized = Array.isArray(value)
    ? [...new Set(value.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean))]
    : [];

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeRuleCountMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([key, amount]) => {
        const normalizedKey = typeof key === "string" ? key.trim() : "";
        const normalizedAmount = Math.max(0, Math.floor(Number(amount) || 0));
        return normalizedKey ? [normalizedKey, normalizedAmount] : null;
      })
      .filter(Boolean),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeRuleQuantityMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([key, amount]) => {
        const normalizedKey = typeof key === "string" ? key.trim() : "";
        const normalizedAmount = clampNonNegativeNumber(amount, 999999, 0);
        return normalizedKey ? [normalizedKey, normalizedAmount] : null;
      })
      .filter(Boolean),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeRuleRequirements(entry) {
  const requirements = entry && typeof entry === "object" ? entry : {};
  const nextUnitNumberEquals = Number(requirements.nextUnitNumberEquals);
  const normalized = {
    requiredTechs: normalizeRuleIdList(requirements.requiredTechs),
    requiredEvents: normalizeRuleIdList(requirements.requiredEvents),
    requiredBuildingsMin: normalizeRuleCountMap(requirements.requiredBuildingsMin),
    requiredUnitsPresent: normalizeRuleIdList(requirements.requiredUnitsPresent),
    requiredUnitsAbsent: normalizeRuleIdList(requirements.requiredUnitsAbsent),
    ...(Number.isFinite(nextUnitNumberEquals) ? { nextUnitNumberEquals: Math.max(0, Math.floor(nextUnitNumberEquals)) } : {}),
  };

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
}

function normalizeRuleLimits(entry) {
  const limits = entry && typeof entry === "object" ? entry : {};
  const maxCount = Number(limits.maxCount);
  const rawCountByBuilding = limits.countByBuilding && typeof limits.countByBuilding === "object"
    ? limits.countByBuilding
    : null;
  const countByBuildingType = typeof rawCountByBuilding?.building === "string" ? rawCountByBuilding.building.trim() : "";
  const countByBuildingBase = Math.max(0, Math.floor(Number(rawCountByBuilding?.base) || 0));
  const countByBuildingPerBuilding = Math.max(0, Math.floor(Number(rawCountByBuilding?.perBuilding) || 0));
  const normalized = {};

  if (Number.isFinite(maxCount)) {
    normalized.maxCount = Math.max(0, Math.floor(maxCount));
  }

  if (countByBuildingType) {
    normalized.countByBuilding = {
      building: countByBuildingType,
      base: countByBuildingBase,
      perBuilding: countByBuildingPerBuilding,
    };
  }

  return normalized;
}

function normalizeBuildingRulesModifierSet(entry) {
  const rulesEntry = entry && typeof entry === "object" ? entry : {};
  const normalized = {};

  if (Object.prototype.hasOwnProperty.call(rulesEntry, "walkable")) {
    normalized.walkable = Boolean(rulesEntry.walkable);
  }

  if (Object.prototype.hasOwnProperty.call(rulesEntry, "foundationActionAvailable")) {
    normalized.foundationActionAvailable = Boolean(rulesEntry.foundationActionAvailable);
  }

  if (Number.isFinite(Number(rulesEntry.constructionCost))) {
    normalized.constructionCost = Math.max(1, clampNumber(rulesEntry.constructionCost, 1, 999999, 100));
  }

  if (rulesEntry.buildCost && typeof rulesEntry.buildCost === "object") {
    const buildCost = {};

    if (Number.isFinite(Number(rulesEntry.buildCost.stone))) {
      buildCost.stone = clampNonNegativeNumber(rulesEntry.buildCost.stone, 999999, 0);
    }

    if (Number.isFinite(Number(rulesEntry.buildCost.lumber))) {
      buildCost.lumber = clampNonNegativeNumber(rulesEntry.buildCost.lumber, 999999, 0);
    }

    if (Object.keys(buildCost).length > 0) {
      normalized.buildCost = buildCost;
    }
  }

  const resourceStorageCapacities = normalizeRuleQuantityMap(rulesEntry.resourceStorageCapacities);
  if (resourceStorageCapacities) {
    normalized.resourceStorageCapacities = resourceStorageCapacities;
  }

  if (rulesEntry.constructionVisualThresholds && typeof rulesEntry.constructionVisualThresholds === "object") {
    const constructionVisualThresholds = {};
    const initialMax = Number(rulesEntry.constructionVisualThresholds.initialMax);
    const halfMax = Number(rulesEntry.constructionVisualThresholds.halfMax);

    if (Number.isFinite(initialMax)) {
      constructionVisualThresholds.initialMax = clamp(initialMax, 0, 1);
    }

    if (Number.isFinite(halfMax)) {
      constructionVisualThresholds.halfMax = clamp(halfMax, 0, 1);
    }

    if (Object.keys(constructionVisualThresholds).length > 0) {
      normalized.constructionVisualThresholds = constructionVisualThresholds;
    }
  }

  if (Number.isFinite(Number(rulesEntry.abandonedDecayPerTurn))) {
    normalized.abandonedDecayPerTurn = clamp(Number(rulesEntry.abandonedDecayPerTurn), 0, 1);
  }

  return normalized;
}

function normalizeBuildingRuleModifiers(entries) {
  if (!Array.isArray(entries)) {
    return undefined;
  }

  const normalized = entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const when = normalizeRuleRequirements(entry.when);
      const set = normalizeBuildingRulesModifierSet(entry.set);

      if (Object.keys(when).length === 0 && Object.keys(set).length === 0) {
        return null;
      }

      return {
        ...(Object.keys(when).length > 0 ? { when } : {}),
        ...(Object.keys(set).length > 0 ? { set } : {}),
      };
    })
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeBuildingSubtypeVariant(entry, manifestPath = buildingManifestPath) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const imageResolver = manifestPath === vehicleManifestPath ? resolveVehicleAssetPath : resolveBuildingAssetPath;
  const image = imageResolver(entry.image, manifestPath);

  if (!id || !image) {
    return null;
  }

  return { id, image };
}

function normalizeBuildingUnitRenderOffsetEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const x = Number(entry.x);
  const y = Number(entry.y);

  if (!Number.isFinite(x) && !Number.isFinite(y)) {
    return null;
  }

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  };
}

function normalizeBuildingStageTileImages(entries, manifestPath = buildingManifestPath) {
  if (!Array.isArray(entries)) {
    return undefined;
  }

  return entries.map((entry) => {
    if (typeof entry !== "string") {
      return null;
    }

    const imageResolver = manifestPath === vehicleManifestPath ? resolveVehicleAssetPath : resolveBuildingAssetPath;
    const resolvedPath = imageResolver(entry, manifestPath);
    return resolvedPath || null;
  });
}

function normalizeBuildingVisualConfig(entry, manifestPath = buildingManifestPath) {
  const visual = entry && typeof entry === "object" ? entry : {};
  const allowedRenderModes = new Set(["singleTile", "footprintImage", "footprintImageNative", "perTile"]);
  const renderMode = typeof visual.renderMode === "string" && allowedRenderModes.has(visual.renderMode)
    ? visual.renderMode
    : "singleTile";
  const constructionRenderMode = typeof visual.constructionRenderMode === "string" && allowedRenderModes.has(visual.constructionRenderMode)
    ? visual.constructionRenderMode
    : undefined;
  const imageResolver = manifestPath === vehicleManifestPath ? resolveVehicleAssetPath : resolveBuildingAssetPath;
  const subtypes = Array.isArray(visual.subtypes)
    ? visual.subtypes.map((subtype) => normalizeBuildingSubtypeVariant(subtype, manifestPath)).filter(Boolean)
    : [];
  const abandonedImage = imageResolver(visual.abandonedImage, manifestPath);
  const initialConstructionImage = imageResolver(visual.constructionImages?.initial, manifestPath);
  const halfConstructionImage = imageResolver(visual.constructionImages?.half, manifestPath);
  const nativeScaleAt100Zoom = Number(visual.nativeScaleAt100Zoom);
  const nativeOffsetYAt100Zoom = Number(visual.nativeOffsetYAt100Zoom);
  const initialConstructionStage = visual.constructionStages?.initial;
  const halfConstructionStage = visual.constructionStages?.half;
  const unitRenderOffsets = Array.isArray(visual.unitRenderOffsets)
    ? visual.unitRenderOffsets.map((offset) => normalizeBuildingUnitRenderOffsetEntry(offset))
    : undefined;
  const initialConstructionStageTileImages = normalizeBuildingStageTileImages(initialConstructionStage?.tileImages, manifestPath);
  const halfConstructionStageTileImages = normalizeBuildingStageTileImages(halfConstructionStage?.tileImages, manifestPath);
  const initialConstructionStageRenderMode =
    typeof initialConstructionStage?.renderMode === "string" && allowedRenderModes.has(initialConstructionStage.renderMode)
      ? initialConstructionStage.renderMode
      : undefined;
  const halfConstructionStageRenderMode =
    typeof halfConstructionStage?.renderMode === "string" && allowedRenderModes.has(halfConstructionStage.renderMode)
      ? halfConstructionStage.renderMode
      : undefined;
  const initialConstructionStageYOffsetFactor = Number(initialConstructionStage?.yOffsetFactor);
  const halfConstructionStageYOffsetFactor = Number(halfConstructionStage?.yOffsetFactor);
  const mountedRenders =
    manifestPath === vehicleManifestPath
      ? normalizeMountedRenderVariants(visual.mountedRenders, manifestPath)
      : undefined;

  return {
    renderMode,
    ...(constructionRenderMode ? { constructionRenderMode } : {}),
    ...(Number.isFinite(nativeScaleAt100Zoom) ? { nativeScaleAt100Zoom } : {}),
    ...(Number.isFinite(nativeOffsetYAt100Zoom) ? { nativeOffsetYAt100Zoom } : {}),
    subtypes,
    ...(unitRenderOffsets && unitRenderOffsets.some(Boolean) ? { unitRenderOffsets } : {}),
    ...(abandonedImage ? { abandonedImage } : {}),
    constructionImages: {
      ...(initialConstructionImage ? { initial: initialConstructionImage } : {}),
      ...(halfConstructionImage ? { half: halfConstructionImage } : {}),
    },
    constructionStages: {
      initial: {
        ...(initialConstructionStageRenderMode ? { renderMode: initialConstructionStageRenderMode } : {}),
        ...(Number.isFinite(initialConstructionStageYOffsetFactor) ? { yOffsetFactor: initialConstructionStageYOffsetFactor } : {}),
        ...(initialConstructionStageTileImages ? { tileImages: initialConstructionStageTileImages } : {}),
      },
      half: {
        ...(halfConstructionStageRenderMode ? { renderMode: halfConstructionStageRenderMode } : {}),
        ...(Number.isFinite(halfConstructionStageYOffsetFactor) ? { yOffsetFactor: halfConstructionStageYOffsetFactor } : {}),
        ...(halfConstructionStageTileImages ? { tileImages: halfConstructionStageTileImages } : {}),
      },
    },
    ...(mountedRenders ? { mountedRenders } : {}),
  };
}

function normalizeBuildingUiConfig(entry, labels = undefined) {
  const ui = entry && typeof entry === "object" ? entry : {};
  const icon = typeof ui.icon === "string" ? ui.icon.trim() : "";

  return {
    icon: icon || "•",
    ...(labels ? { labels } : {}),
  };
}

function normalizeBuildingRulesEntry(entry) {
  const rulesEntry = entry && typeof entry === "object" ? entry : {};
  const width = Math.max(1, Math.floor(Number(rulesEntry.width) || 1));
  const height = Math.max(1, Math.floor(Number(rulesEntry.height) || 1));
  const footprint = Array.isArray(rulesEntry.footprint)
    ? rulesEntry.footprint
      .map((path) => Array.isArray(path)
        ? path.map((direction) => (typeof direction === "string" ? direction.trim() : "")).filter(Boolean)
        : null)
      .filter(Boolean)
    : undefined;
  const placementTerrains = Array.isArray(rulesEntry.placementTerrains)
    ? rulesEntry.placementTerrains
      .map((terrainList) => {
        if (typeof terrainList === "string") {
          const normalizedTerrain = terrainList.trim();
          return normalizedTerrain ? [normalizedTerrain] : null;
        }

        if (!Array.isArray(terrainList)) {
          return null;
        }

        const normalizedTerrains = [...new Set(
          terrainList
            .map((terrainType) => (typeof terrainType === "string" ? terrainType.trim() : ""))
            .filter(Boolean),
        )];

        return normalizedTerrains.length > 0 ? normalizedTerrains : null;
      })
    : undefined;
  const buildCostStone = clampNonNegativeNumber(rulesEntry.buildCost?.stone, 999999, 0);
  const buildCostLumber = clampNonNegativeNumber(rulesEntry.buildCost?.lumber, 999999, 0);
  const resourceStorageCapacities = rulesEntry.resourceStorageCapacities && typeof rulesEntry.resourceStorageCapacities === "object"
    ? Object.fromEntries(
      Object.entries(rulesEntry.resourceStorageCapacities)
        .map(([resourceType, value]) => {
          const normalizedResourceType = typeof resourceType === "string" ? resourceType.trim() : "";
          const normalizedValue = clampNonNegativeNumber(value, 999999, 0);
          return normalizedResourceType ? [normalizedResourceType, normalizedValue] : null;
        })
        .filter(Boolean),
    )
    : undefined;
  const constructionCost = Math.max(1, clampNumber(rulesEntry.constructionCost, 1, 999999, 100));
  const initialMax = Number(rulesEntry.constructionVisualThresholds?.initialMax);
  const halfMax = Number(rulesEntry.constructionVisualThresholds?.halfMax);
  const abandonedDecayPerTurn = Number(rulesEntry.abandonedDecayPerTurn);
  const mounted = normalizeVehicleMountedRulesConfig(rulesEntry.mounted);

  return {
    width,
    height,
    ...(footprint && footprint.length > 0 ? { footprint } : {}),
    ...(placementTerrains && placementTerrains.some((terrainList) => Array.isArray(terrainList) && terrainList.length > 0)
      ? { placementTerrains }
      : {}),
    walkable: Boolean(rulesEntry.walkable),
    foundationActionAvailable: Boolean(rulesEntry.foundationActionAvailable),
    constructionCost,
    buildCost: {
      stone: buildCostStone,
      lumber: buildCostLumber,
    },
    ...(resourceStorageCapacities && Object.keys(resourceStorageCapacities).length > 0 ? { resourceStorageCapacities } : {}),
    ...(mounted ? { mounted } : {}),
    constructionVisualThresholds: {
      initialMax: Number.isFinite(initialMax) ? initialMax : 0.34,
      halfMax: Number.isFinite(halfMax) ? halfMax : 0.79,
    },
    abandonedDecayPerTurn: Number.isFinite(abandonedDecayPerTurn) ? abandonedDecayPerTurn : 0,
  };
}

function normalizeBuildingDefinitionsManifest(manifest, manifestPath = buildingManifestPath) {
  const normalizedRules = createDefaultBuildingRulesConfig();
  const defaultEntry = manifest?.default && typeof manifest.default === "object" ? manifest.default : {};

  normalizedRules.default = {
    width: Math.max(1, Math.floor(Number(defaultEntry.width) || normalizedRules.default.width)),
    height: Math.max(1, Math.floor(Number(defaultEntry.height) || normalizedRules.default.height)),
  };

  const types = manifest?.types && typeof manifest.types === "object" && !Array.isArray(manifest.types)
    ? manifest.types
    : {};
  const normalizedVisuals = createDefaultBuildingCatalog();

  for (const [typeId, definition] of Object.entries(types)) {
    const normalizedTypeId = typeof typeId === "string" ? typeId.trim() : "";
    if (!normalizedTypeId || !definition || typeof definition !== "object") {
      continue;
    }

    const labels = normalizeLocalizedLabelsMap(definition.labels);
    const availability = normalizeRuleRequirements(definition.availability);
    const limits = normalizeRuleLimits(definition.limits);
    const modifiers = normalizeBuildingRuleModifiers(definition.modifiers);

    normalizedRules[normalizedTypeId] = {
      ...normalizeBuildingRulesEntry(definition.rules),
      ...(Object.keys(availability).length > 0 ? { availability } : {}),
      ...(Object.keys(limits).length > 0 ? { limits } : {}),
      ...(modifiers ? { modifiers } : {}),
    };
    normalizedVisuals[normalizedTypeId] = {
      ...normalizeBuildingVisualConfig(definition.visual, manifestPath),
      ...normalizeBuildingUiConfig(definition.ui, labels),
    };
  }

  return {
    rules: normalizedRules,
    visuals: normalizedVisuals,
  };
}

async function loadBuildingDefinitions() {
  const response = await fetch(buildingManifestPath, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load building manifest: ${response.status}`);
  }

  return normalizeBuildingDefinitionsManifest(await response.json(), buildingManifestPath);
}

async function ensureBuildingDefinitionsLoaded() {
  if (Object.keys(buildingCatalog).length > 0 && Object.keys(rules.buildings || {}).length > 1) {
    return {
      rules: rules.buildings,
      visuals: buildingCatalog,
    };
  }

  if (!buildingDefinitionsLoadPromise) {
    buildingDefinitionsLoadPromise = loadBuildingDefinitions()
      .then((definitions) => {
        rules.buildings = definitions.rules;
        buildingCatalog = definitions.visuals;
        return definitions;
      })
      .finally(() => {
        buildingDefinitionsLoadPromise = null;
      });
  }

  return buildingDefinitionsLoadPromise;
}

function normalizeVehicleDefinitionsManifest(manifest, manifestPath = vehicleManifestPath) {
  return normalizeBuildingDefinitionsManifest(manifest, manifestPath);
}

async function loadVehicleDefinitions() {
  const response = await fetch(vehicleManifestPath, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load vehicle manifest: ${response.status}`);
  }

  return normalizeVehicleDefinitionsManifest(await response.json(), vehicleManifestPath);
}

async function ensureVehicleDefinitionsLoaded() {
  if (vehicleDefinitionsLoaded) {
    return {
      rules: rules.vehicles,
      visuals: vehicleCatalog,
    };
  }

  if (!vehicleDefinitionsLoadPromise) {
    vehicleDefinitionsLoadPromise = loadVehicleDefinitions()
      .then((definitions) => {
        rules.vehicles = definitions.rules;
        vehicleCatalog = definitions.visuals;
        vehicleDefinitionsLoaded = true;
        return definitions;
      })
      .finally(() => {
        vehicleDefinitionsLoadPromise = null;
      });
  }

  return vehicleDefinitionsLoadPromise;
}

function resolveTechnologyAssetPath(path, manifestPath = technologyManifestPath) {
  return new URL(path, new URL(manifestPath, window.location.href)).toString();
}

function createDefaultTechnologyCatalog() {
  return {
    loaded: false,
    manifestPath: null,
    technologies: [],
    byId: {},
  };
}

function createDefaultResearchState() {
  return {
    discoveredTechIds: [],
    progressByTechId: {},
    selectedGoalTechId: null,
    eventFlags: {},
  };
}

function normalizeResearchProgressByTechId(rawProgressByTechId) {
  if (!rawProgressByTechId || typeof rawProgressByTechId !== "object" || Array.isArray(rawProgressByTechId)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawProgressByTechId)
      .map(([technologyId, progress]) => {
        const normalizedTechnologyId = typeof technologyId === "string" ? technologyId.trim() : "";
        const normalizedProgress = clampNonNegativeNumber(progress, 999999999, 0);
        return normalizedTechnologyId ? [normalizedTechnologyId, normalizedProgress] : null;
      })
      .filter(Boolean),
  );
}

function normalizeResearchEventFlags(rawEventFlags) {
  if (!rawEventFlags || typeof rawEventFlags !== "object" || Array.isArray(rawEventFlags)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawEventFlags)
      .map(([eventId, value]) => {
        const normalizedEventId = typeof eventId === "string" ? eventId.trim() : "";
        return normalizedEventId ? [normalizedEventId, Boolean(value)] : null;
      })
      .filter(Boolean),
  );
}

function normalizeResearchState(rawState) {
  const state = rawState && typeof rawState === "object" ? rawState : {};
  const discoveredTechIds = Array.isArray(state.discoveredTechIds)
    ? [...new Set(state.discoveredTechIds.map((technologyId) => (typeof technologyId === "string" ? technologyId.trim() : "")).filter(Boolean))]
    : [];
  const discoveredTechIdSet = new Set(discoveredTechIds);
  const selectedGoalTechId = typeof state.selectedGoalTechId === "string" && state.selectedGoalTechId.trim()
    ? state.selectedGoalTechId.trim()
    : null;
  const progressByTechId = Object.fromEntries(
    Object.entries(normalizeResearchProgressByTechId(state.progressByTechId))
      .filter(([technologyId]) => !discoveredTechIdSet.has(technologyId)),
  );

  return {
    discoveredTechIds,
    progressByTechId,
    selectedGoalTechId:
      selectedGoalTechId && !discoveredTechIdSet.has(selectedGoalTechId)
        ? selectedGoalTechId
        : null,
    eventFlags: normalizeResearchEventFlags(state.eventFlags),
  };
}

function normalizeTechnologyManifestEntry(entry, index, manifestPath = technologyManifestPath) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const cost = clampNonNegativeNumber(entry.cost, 999999999, 0);
  const icon = typeof entry.icon === "string" && entry.icon.trim()
    ? resolveTechnologyAssetPath(entry.icon.trim(), manifestPath)
    : null;
  const labels = normalizeLocalizedLabelsMap(entry.labels);
  const rawPrerequisites = entry.prerequisites && typeof entry.prerequisites === "object" ? entry.prerequisites : {};
  const prerequisiteTechIds = Array.isArray(rawPrerequisites.tech)
    ? rawPrerequisites.tech.map((value) => (typeof value === "string" ? value.trim() : "")).filter(Boolean)
    : [];
  const prerequisiteEventIds = Array.isArray(rawPrerequisites.events)
    ? rawPrerequisites.events.map((value) => (typeof value === "string" ? value.trim() : "")).filter(Boolean)
    : [];

  if (!id) {
    console.warn(`Ignoring technology entry ${index + 1}: missing id.`);
    return null;
  }

  return {
    id,
    cost,
    icon,
    labels,
    prerequisites: {
      tech: [...new Set(prerequisiteTechIds)],
      events: [...new Set(prerequisiteEventIds)],
    },
  };
}

function normalizeTechnologyCatalog(manifest, manifestPath = technologyManifestPath) {
  const technologies = [];
  const seenIds = new Set();
  const rawTechnologies = Array.isArray(manifest?.technologies) ? manifest.technologies : [];

  for (const [index, entry] of rawTechnologies.entries()) {
    const normalizedEntry = normalizeTechnologyManifestEntry(entry, index, manifestPath);

    if (!normalizedEntry) {
      continue;
    }

    if (seenIds.has(normalizedEntry.id)) {
      console.warn(`Ignoring duplicate technology id "${normalizedEntry.id}".`);
      continue;
    }

    seenIds.add(normalizedEntry.id);
    technologies.push(normalizedEntry);
  }

  const knownTechnologyIds = new Set(technologies.map((technology) => technology.id));

  for (const technology of technologies) {
    const validPrerequisites = technology.prerequisites.tech.filter((technologyId) => {
      const isKnown = knownTechnologyIds.has(technologyId);

      if (!isKnown) {
        console.warn(`Technology "${technology.id}" references unknown prerequisite "${technologyId}".`);
      }

      return isKnown;
    });

    technology.prerequisites.tech = validPrerequisites;
  }

  return {
    loaded: true,
    manifestPath,
    technologies,
    byId: Object.fromEntries(technologies.map((technology) => [technology.id, technology])),
  };
}

async function loadTechnologyCatalog() {
  const response = await fetch(technologyManifestPath, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Failed to load technology manifest: ${response.status}`);
  }

  return normalizeTechnologyCatalog(await response.json(), technologyManifestPath);
}

async function ensureTechnologyCatalogLoaded() {
  if (technologyCatalog.loaded) {
    return technologyCatalog;
  }

  if (!technologyCatalogLoadPromise) {
    technologyCatalogLoadPromise = loadTechnologyCatalog()
      .then((catalog) => {
        technologyCatalog = catalog;

        if (bookOverlay && !bookOverlay.hidden) {
          updateBookPageStack(bookState);
        }

        return technologyCatalog;
      })
      .catch((error) => {
        console.warn("Failed to load technology catalog.", error);
        technologyCatalog = createDefaultTechnologyCatalog();
        return technologyCatalog;
      })
      .finally(() => {
        technologyCatalogLoadPromise = null;
      });
  }

  return technologyCatalogLoadPromise;
}

function getTechnologyDefinition(technologyId) {
  if (typeof technologyId !== "string" || !technologyId.trim()) {
    return null;
  }

  return technologyCatalog.byId?.[technologyId.trim()] || null;
}

function getTechnologyLabel(technologyOrId, languageId = currentLanguage) {
  const technology = typeof technologyOrId === "string"
    ? getTechnologyDefinition(technologyOrId)
    : technologyOrId;

  if (!technology || typeof technology.id !== "string" || !technology.id.trim()) {
    return typeof technologyOrId === "string" ? technologyOrId.trim() : "";
  }

  return resolveLocalizedLabel(technology.labels, technology.id, languageId) || technology.id;
}

function isTechnologyDiscovered(technologyId, state = researchState) {
  return Boolean(technologyId) && Array.isArray(state?.discoveredTechIds) && state.discoveredTechIds.includes(technologyId);
}

function areTechnologyEventPrerequisitesSatisfied(technology, state = researchState) {
  if (!technology) {
    return false;
  }

  return technology.prerequisites.events.every((eventId) => Boolean(state?.eventFlags?.[eventId]));
}

function areTechnologyTechPrerequisitesSatisfied(technology, state = researchState) {
  if (!technology) {
    return false;
  }

  return technology.prerequisites.tech.every((technologyId) => isTechnologyDiscovered(technologyId, state));
}

function getTechnologyDisplayState(technologyId, state = researchState) {
  const technology = getTechnologyDefinition(technologyId);

  if (!technology) {
    return "missing";
  }

  if (isTechnologyDiscovered(technology.id, state)) {
    return "discovered";
  }

  if (areTechnologyTechPrerequisitesSatisfied(technology, state) && areTechnologyEventPrerequisitesSatisfied(technology, state)) {
    return "available";
  }

  return "locked";
}

function getTechnologyProgress(technologyId, state = researchState) {
  if (typeof technologyId !== "string" || !technologyId.trim()) {
    return 0;
  }

  return Math.max(
    0,
    clampNonNegativeNumber(state?.progressByTechId?.[technologyId.trim()], 999999999, 0),
  );
}

function getTechnologyProgressPercent(technologyId, state = researchState) {
  const technology = getTechnologyDefinition(technologyId);

  if (!technology) {
    return 0;
  }

  if (isTechnologyDiscovered(technology.id, state)) {
    return 100;
  }

  const cost = clampNonNegativeNumber(technology.cost, 999999999, 0);

  if (cost <= 0) {
    return 0;
  }

  return clamp((getTechnologyProgress(technology.id, state) / cost) * 100, 0, 100);
}

function canSelectResearchGoal(technologyId, state = researchState) {
  return getTechnologyDisplayState(technologyId, state) === "available";
}

function getSelectedResearchGoalTechnologyId(state = researchState, { requireAvailable = true } = {}) {
  const technologyId =
    typeof state?.selectedGoalTechId === "string" && state.selectedGoalTechId.trim()
      ? state.selectedGoalTechId.trim()
      : null;

  if (!technologyId) {
    return null;
  }

  if (!getTechnologyDefinition(technologyId)) {
    return null;
  }

  if (isTechnologyDiscovered(technologyId, state)) {
    return null;
  }

  if (requireAvailable && !canSelectResearchGoal(technologyId, state)) {
    return null;
  }

  return technologyId;
}

function updateResearchPresentation() {
  if (bookOverlay && !bookOverlay.hidden) {
    updateBookPageStack(bookState);
  }

  updateEditorResearchPanel();
  clampStockpileToCapacity();
  updateUnitActionControls();
  updateUnitReadout();
  updateTurnControls();
  draw();
}

function setSelectedResearchGoalTechnologyId(technologyId, { refresh = true } = {}) {
  const normalizedTechnologyId =
    typeof technologyId === "string" && technologyId.trim() ? technologyId.trim() : null;
  const nextGoalTechnologyId = normalizedTechnologyId && canSelectResearchGoal(normalizedTechnologyId)
    ? normalizedTechnologyId
    : null;

  if (researchState.selectedGoalTechId === nextGoalTechnologyId) {
    return Boolean(nextGoalTechnologyId);
  }

  researchState.selectedGoalTechId = nextGoalTechnologyId;

  if (nextGoalTechnologyId) {
    hideBookTransientHint();
  }

  if (refresh) {
    updateResearchPresentation();
  }

  return Boolean(nextGoalTechnologyId);
}

function clearSelectedResearchGoalTechnologyId(options) {
  return setSelectedResearchGoalTechnologyId(null, options);
}

function markTechnologyDiscovered(technologyId, { refresh = true } = {}) {
  const technology = getTechnologyDefinition(technologyId);

  if (!technology || isTechnologyDiscovered(technology.id)) {
    return false;
  }

  researchState.discoveredTechIds = [...new Set([...(researchState.discoveredTechIds || []), technology.id])];

  if (researchState.progressByTechId && typeof researchState.progressByTechId === "object") {
    delete researchState.progressByTechId[technology.id];
  }

  if (researchState.selectedGoalTechId === technology.id) {
    researchState.selectedGoalTechId = null;
  }

  if (refresh) {
    updateResearchPresentation();
  }

  return true;
}

function addResearchProgressToTechnology(technologyId, amount, { refresh = true } = {}) {
  const technology = getTechnologyDefinition(technologyId);
  const normalizedAmount = clampNonNegativeNumber(amount, 999999999, 0);

  if (!technology || normalizedAmount <= 0 || isTechnologyDiscovered(technology.id)) {
    return false;
  }

  const currentProgress = getTechnologyProgress(technology.id);
  const nextProgress = currentProgress + normalizedAmount;
  const cost = clampNonNegativeNumber(technology.cost, 999999999, 0);

  if (cost > 0 && nextProgress >= cost) {
    markTechnologyDiscovered(technology.id, { refresh });
    return true;
  }

  researchState.progressByTechId = {
    ...(researchState.progressByTechId || {}),
    [technology.id]: nextProgress,
  };

  if (refresh) {
    updateResearchPresentation();
  }

  return true;
}

function getJulianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
}

function getJulianCalendarDateFromDayNumber(dayNumber) {
  const c = dayNumber + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: d - 4800 + Math.floor(m / 10),
  };
}

function getJulianTurnDate(turnNumber) {
  const elapsedDays = Math.max(0, clampInteger(turnNumber, 1, 999999, 1) - 1);
  return getJulianCalendarDateFromDayNumber(julianTurnEpochJdn + elapsedDays);
}

function formatJulianTurnDate(turnNumber) {
  const date = getJulianTurnDate(turnNumber);
  const monthLabels = strings.calendar?.julianMonthsShort;
  const monthLabel = Array.isArray(monthLabels) && monthLabels[date.month - 1]
    ? monthLabels[date.month - 1]
    : String(date.month);
  return `${date.day} ${monthLabel} ${date.year}`;
}

function setValueForElements(elements, value) {
  for (const element of elements) {
    element.value = value;
  }
}

function loadCurrentLanguage() {
  const defaultLanguage = localization?.defaultLanguage || "en";

  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);

    if (storedLanguage && availableLanguages[storedLanguage]) {
      return storedLanguage;
    }
  } catch {
    // Ignore language persistence failures.
  }

  if (availableLanguages[defaultLanguage]) {
    return defaultLanguage;
  }

  return Object.keys(availableLanguages)[0] || "en";
}

function saveCurrentLanguage(language) {
  if (!availableLanguages[language]) {
    return;
  }

  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Ignore language persistence failures.
  }
}

function getNextSituationMessageId() {
  return situationMessages.reduce(
    (maxId, entry) => Math.max(maxId, clampInteger(entry?.id, 0, 999999999, 0)),
    0,
  ) + 1;
}

function createSituationMessageEntry(kind, data = {}, turn = currentTurn, id = getNextSituationMessageId()) {
  const normalizedTurn = Math.max(1, clampInteger(turn, 1, 999999, 1));
  const entry = {
    id: Math.max(1, clampInteger(id, 1, 999999999, 1)),
    kind,
    turn: normalizedTurn,
  };

  if (typeof data.unitName === "string" && data.unitName.trim()) {
    entry.unitName = normalizeUnitName(data.unitName);
  }

  if (Number.isFinite(data.current)) {
    entry.current = Math.max(0, clampInteger(data.current, 0, 999999, 0));
  }

  if (Number.isFinite(data.threshold)) {
    entry.threshold = Math.max(0, clampInteger(data.threshold, 0, 999999, 0));
  }

  return entry;
}

function getSituationMessageText(entry) {
  if (!entry) {
    return "";
  }

  const template = strings.situationMessages || {};

  if (entry.kind === "intro") {
    return template.intro || "";
  }

  if (entry.kind === "houseStarted") {
    return template.houseStarted || "";
  }

  if (entry.kind === "houseCompleted") {
    return typeof template.houseCompleted === "function"
      ? template.houseCompleted(entry.unitName || getDefaultUnitName())
      : "";
  }

  if (entry.kind === "foodShortage") {
    return typeof template.foodShortage === "function"
      ? template.foodShortage(
          Math.max(0, clampInteger(entry.current, 0, 999999, 0)),
          Math.max(0, clampInteger(entry.threshold, 0, 999999, 0)),
        )
      : "";
  }

  if (entry.kind === "foodRecovered") {
    return template.foodRecovered || "";
  }

  if (entry.kind === "unitLeft") {
    return typeof template.unitLeft === "function"
      ? template.unitLeft(entry.unitName || getDefaultUnitName())
      : "";
  }

  if (entry.kind === "researchGoalMissing") {
    return template.researchGoalMissing || "";
  }

  return "";
}

function clearSituationMessageTyping() {
  if (situationMessageTypingTimeoutId) {
    window.clearTimeout(situationMessageTypingTimeoutId);
    situationMessageTypingTimeoutId = 0;
  }

  situationMessageTypingToken += 1;
}

function getViewedSituationMessage() {
  if (situationMessageViewIndex < 0 || situationMessageViewIndex >= situationMessages.length) {
    return null;
  }

  return situationMessages[situationMessageViewIndex] || null;
}

function setSituationMessageVisibility(visible) {
  situationMessageVisible = visible && situationMessages.length > 0;
}

function setSituationMessageText(text) {
  setTextContent(situationMessageTextElements, text);
}

function setBookTransientHintText(text) {
  setTextContent(bookTransientHintTextElements, text);
}

function hideBookTransientHint() {
  if (bookTransientHint) {
    bookTransientHint.hidden = true;
  }

  setBookTransientHintText("");
}

function showBookTransientHint(text) {
  const normalizedText = typeof text === "string" ? text.trim() : "";

  if (!bookTransientHint || !normalizedText) {
    hideBookTransientHint();
    return false;
  }

  setBookTransientHintText(normalizedText);
  bookTransientHint.hidden = false;
  return true;
}

function updateSituationMessageToggleButton() {
  const hasMessages = situationMessages.length > 0;
  const isVisible = situationMessageVisible && Boolean(getViewedSituationMessage());
  const label = isVisible ? strings.actions.hideMessage : strings.actions.showLastMessage;
  const iconText = "👁";
  const mode = isVisible ? "hide" : "show";

  setDisabledState(toggleSituationMessageButtons, !hasMessages);
  setTextContent(situationMessageToggleLabelElements, iconText);
  setAttributeForElements(situationMessageToggleLabelElements, "data-mode", mode);
  setAttributeForElements(toggleSituationMessageButtons, "aria-label", label);
  setAttributeForElements(toggleSituationMessageButtons, "title", label);
}

function updateSituationMessageControls() {
  const hasMessages = situationMessages.length > 0;
  const canGoBack = hasMessages && situationMessageViewIndex > 0;
  const canGoForward = hasMessages && situationMessageViewIndex >= 0 && situationMessageViewIndex < situationMessages.length - 1;

  updateSituationMessageToggleButton();
  setDisabledState(previousSituationMessageButtons, !canGoBack);
  setDisabledState(nextSituationMessageButtons, !canGoForward);
}

function updateSituationMessagePanel({ restartTyping = false } = {}) {
  const viewedMessage = getViewedSituationMessage();
  const shouldShowMessage = situationMessageVisible && Boolean(viewedMessage);

  for (const display of situationMessageDisplays) {
    display.hidden = false;
  }

  for (const bubble of situationMessageBubbleElements) {
    bubble.hidden = !shouldShowMessage;
  }

  for (const head of situationSpeakerHeadElements) {
    head.hidden = !shouldShowMessage;
  }

  if (!shouldShowMessage) {
    clearSituationMessageTyping();
    setSituationMessageText("");
    updateSituationMessageControls();
    return;
  }

  const fullText = getSituationMessageText(viewedMessage);

  if (!restartTyping) {
    setSituationMessageText(fullText);
    updateSituationMessageControls();
    return;
  }

  clearSituationMessageTyping();
  setSituationMessageText("");

  const token = situationMessageTypingToken;
  let nextLength = 0;

  const typeNextCharacter = () => {
    if (token !== situationMessageTypingToken) {
      return;
    }

    nextLength += 1;
    setSituationMessageText(fullText.slice(0, nextLength));

    if (nextLength >= fullText.length) {
      situationMessageTypingTimeoutId = 0;
      updateSituationMessageControls();
      return;
    }

    situationMessageTypingTimeoutId = window.setTimeout(typeNextCharacter, situationMessageTypingDelayMs);
  };

  if (!fullText) {
    updateSituationMessageControls();
    return;
  }

  situationMessageTypingTimeoutId = window.setTimeout(typeNextCharacter, situationMessageTypingDelayMs);
  updateSituationMessageControls();
}

function showSituationMessageAtIndex(index, { restartTyping = true } = {}) {
  if (situationMessages.length === 0) {
    situationMessageViewIndex = -1;
    setSituationMessageVisibility(false);
    updateSituationMessagePanel();
    return false;
  }

  situationMessageViewIndex = clampInteger(index, 0, situationMessages.length - 1, situationMessages.length - 1);
  setSituationMessageVisibility(true);
  updateSituationMessagePanel({ restartTyping });
  return true;
}

function revealLatestSituationMessage({ restartTyping = true } = {}) {
  if (situationMessages.length === 0) {
    return false;
  }

  return showSituationMessageAtIndex(situationMessages.length - 1, { restartTyping });
}

function hideSituationMessage() {
  if (!situationMessageVisible) {
    return false;
  }

  setSituationMessageVisibility(false);
  updateSituationMessagePanel();
  return true;
}

function addSituationMessage(kind, data = {}, { reveal = true } = {}) {
  const entry = createSituationMessageEntry(kind, data);

  situationMessages.push(entry);

  if (reveal) {
    revealLatestSituationMessage({ restartTyping: true });
  } else {
    updateSituationMessageControls();
  }

  return entry;
}

function loadAudioSettings() {
  try {
    const raw = window.localStorage.getItem(storageKeys.audioSettings);

    if (!raw) {
      return { ...defaultAudioSettings };
    }

    const parsed = JSON.parse(raw);

    return {
      musicEnabled: parsed?.musicEnabled !== false,
      volume: clampNumber(Number(parsed?.volume), 0, 1, defaultAudioSettings.volume),
    };
  } catch {
    return { ...defaultAudioSettings };
  }
}

function saveAudioSettings() {
  try {
    window.localStorage.setItem(storageKeys.audioSettings, JSON.stringify(audioSettings));
  } catch {
    // Ignore settings persistence failures.
  }
}

function updateAudioControls() {
  setCheckedState(musicEnabledInputs, audioSettings.musicEnabled);
  setValueForElements(musicVolumeInputs, String(Math.round(audioSettings.volume * 100)));
}

function shouldPlayBackgroundMusic() {
  return isPlayMode() && !mainMenuOpen && !bookOverlayIntroMode && audioSettings.musicEnabled;
}

function completeIntroMusicSegmentPlayback() {
  if (!introMusicSegmentPlaybackActive) {
    return;
  }

  introMusicSegmentPlaybackActive = false;
  introMusic.pause();

  try {
    introMusic.currentTime = introMusicSegmentEndTime;
  } catch {
    // Ignore metadata readiness issues on teardown.
  }

  if (!bookSequencePlayback || bookSequencePlayback.sequenceId !== bookIntroSequenceId) {
    return;
  }

  bookSequencePlayback.awaitingAudioCompletion = false;

  if (bookSequencePlayback.pendingCloseAfterAudio) {
    closeBookOverlay();
  }
}

function stopIntroMusicSegmentPlayback() {
  introMusicSegmentPlaybackActive = false;
  introMusic.pause();

  try {
    introMusic.currentTime = introMusicSegmentStartTime;
  } catch {
    // Ignore metadata readiness issues on teardown.
  }
}

async function startIntroMusicSegmentPlayback() {
  stopIntroMusicSegmentPlayback();

  introMusic.volume = audioSettings.volume;

  try {
    introMusic.currentTime = introMusicSegmentStartTime;
  } catch {
    // Ignore metadata readiness issues; playback will still be attempted.
  }

  introMusicSegmentPlaybackActive = true;

  try {
    await introMusic.play();
    return true;
  } catch {
    introMusicSegmentPlaybackActive = false;
    return false;
  }
}

async function syncBackgroundMusicPlayback() {
  backgroundMusic.volume = audioSettings.volume;
  introMusic.volume = audioSettings.volume;

  if (!shouldPlayBackgroundMusic()) {
    backgroundMusic.pause();
    return;
  }

  try {
    await backgroundMusic.play();
  } catch {
    // Ignore autoplay restrictions; the next user gesture will retry.
  }
}

function clearQueuedAutoAdvanceFrame() {
  if (autoAdvanceFrameId) {
    cancelAnimationFrame(autoAdvanceFrameId);
    autoAdvanceFrameId = 0;
  }

  autoAdvanceQueued = false;
}

function clearPendingAutoAdvance() {
  clearQueuedAutoAdvanceFrame();

  if (replayPauseTimeoutId) {
    window.clearTimeout(replayPauseTimeoutId);
    replayPauseTimeoutId = 0;
  }

  if (isReplayPhase()) {
    commitReplayFinalState();
    resetTurnReplayState();
  }
}

function isReplayPhase() {
  return playPhase === playPhases.replaying;
}

function isKnownUnitAction(action) {
  return orderedUnitActions.includes(action);
}

function getTaskActionId(task) {
  const taskType = typeof task?.type === "string" ? task.type : "";

  return unitActionIdsByTaskType[taskType] || null;
}

function getUnitActionSpec(actionOrTask) {
  if (typeof actionOrTask === "string") {
    return isKnownUnitAction(actionOrTask) ? unitActionSpecs[actionOrTask] || null : null;
  }

  const actionId = getTaskActionId(actionOrTask);

  return actionId ? unitActionSpecs[actionId] || null : null;
}

function getUnitTaskSpec(currentUnit) {
  return getUnitActionSpec(currentUnit?.task);
}

function isTaskAction(task, action) {
  return getTaskActionId(task) === action;
}

function createUnitTaskForAction(action, options = {}) {
  const spec = getUnitActionSpec(action);

  return spec?.createTask ? spec.createTask(options) : null;
}

function queueUnitAction(action, options = {}) {
  const spec = getUnitActionSpec(action);

  return spec?.queueTask ? spec.queueTask(options) : false;
}

function getUnitTaskInspectorPreviewMode(currentUnit) {
  const spec = getUnitTaskSpec(currentUnit);

  if (spec?.inspectorPreview === "move") {
    return "move";
  }

  if (spec?.countsAsWork) {
    return "animated";
  }

  return "stationary";
}

function getUnitTaskInspectorProgressText(currentUnit) {
  const spec = getUnitTaskSpec(currentUnit);

  return spec?.getInspectorProgressText ? spec.getInspectorProgressText(currentUnit) : "";
}

function isWorkingTask(task) {
  return Boolean(getUnitActionSpec(task)?.countsAsWork);
}

function doesTaskUseTargetDirection(task) {
  return Boolean(getUnitActionSpec(task)?.usesTargetTaskDirection);
}

function doesTaskUseTargetGroundPoint(task) {
  return Boolean(getUnitActionSpec(task)?.usesTargetGroundPoint);
}

function normalizeUnitAction(action) {
  return isKnownUnitAction(action) ? action : unitActions.walk;
}

function normalizePendingUnitAction(action) {
  return isKnownUnitAction(action) ? action : null;
}

function normalizeSelectableUnitAction(action) {
  if (action === unitUiActions.work) {
    return unitUiActions.work;
  }

  return normalizeUnitAction(action);
}

function normalizePendingSelectableUnitAction(action) {
  if (action === unitUiActions.work) {
    return unitUiActions.work;
  }

  return normalizePendingUnitAction(action);
}

function isUnitWorkRepresentedAction(action) {
  return action === unitActions.gatherMaterials || action === unitActions.buildHouse;
}

function canUnitUseWorkUiAction(currentUnit = unit, context = getRuleContext()) {
  return canUnitUseAction(currentUnit, unitActions.gatherMaterials, context)
    || canUnitUseAction(currentUnit, unitActions.buildHouse, context);
}

function getWorkUiTargetCells(currentUnit = unit, context = getRuleContext()) {
  if (!currentUnit) {
    return [];
  }

  const keyedCells = new Map();

  if (canUnitUseAction(currentUnit, unitActions.buildHouse, context)) {
    for (const cell of getBuildableAdjacentCells(currentUnit)) {
      keyedCells.set(`${cell.x},${cell.y}`, cell);
    }
  }

  if (canUnitUseAction(currentUnit, unitActions.gatherMaterials, context)) {
    for (const cell of getGatherMaterialsCells(currentUnit)) {
      keyedCells.set(`${cell.x},${cell.y}`, cell);
    }
  }

  return [...keyedCells.values()];
}

function canUnitUseSelectableAction(currentUnit = unit, action, context = getRuleContext()) {
  const normalizedAction = normalizePendingSelectableUnitAction(action);

  if (!normalizedAction) {
    return false;
  }

  if (normalizedAction === unitUiActions.work) {
    return canUnitUseWorkUiAction(currentUnit, context);
  }

  return canUnitUseAction(currentUnit, normalizedAction, context);
}

function getSelectableUnitActions(currentUnit = unit, context = getRuleContext()) {
  const selectableActions = [
    unitActions.walk,
    unitActions.dismount,
    unitActions.layFoundation,
    unitActions.play,
    unitActions.research,
    unitActions.gatherFood,
    unitUiActions.work,
    unitActions.demolish,
  ];

  return selectableActions.filter((action) => canUnitUseSelectableAction(currentUnit, action, context));
}

function doesSelectedUnitActionMatchTaskAction(selectedAction, taskAction) {
  return selectedAction === taskAction || (
    selectedAction === unitUiActions.work &&
    isUnitWorkRepresentedAction(taskAction)
  );
}

function getUnitAllowedActions(currentUnit = unit, context = getRuleContext()) {
  if (!currentUnit) {
    return orderedUnitActions.filter((action) => action !== unitActions.dismount);
  }

  const configured = getEffectiveUnitConfig(currentUnit, context).allowedActions;
  const mountedVehicle = getMountedVehicle(currentUnit);
  const mountedRules = mountedVehicle ? getMountedVehicleRules(currentUnit, context) : null;
  const mountedConfigured = Array.isArray(mountedRules?.allowedActions)
    ? mountedRules.allowedActions
    : null;
  const mountedConfiguredSet = mountedConfigured
    ? new Set(mountedConfigured.map((action) => normalizePendingUnitAction(action)).filter(Boolean))
    : null;

  if (!Array.isArray(configured)) {
    const fallbackActions = orderedUnitActions.filter((action) => action !== unitActions.dismount);
    const fallbackSet = new Set(fallbackActions);

    if (!mountedVehicle) {
      return fallbackActions;
    }

    const mountedFallbackSet = mountedConfiguredSet
      ? new Set(fallbackActions.filter((action) => mountedConfiguredSet.has(action)))
      : fallbackSet;
    mountedFallbackSet.add(unitActions.dismount);
    return orderedUnitActions.filter((action) => mountedFallbackSet.has(action));
  }

  const configuredSet = new Set(configured.map((action) => normalizePendingUnitAction(action)).filter(Boolean));

  if (mountedConfiguredSet) {
    for (const action of [...configuredSet]) {
      if (!mountedConfiguredSet.has(action)) {
        configuredSet.delete(action);
      }
    }
  }

  if (mountedVehicle) {
    configuredSet.add(unitActions.dismount);
  }

  const allowed = orderedUnitActions.filter((action) => configuredSet.has(action));

  return allowed;
}

function canUnitUseAction(currentUnit = unit, action, context = getRuleContext()) {
  const normalizedAction = normalizePendingUnitAction(action);

  if (!currentUnit || !normalizedAction) {
    return false;
  }

  if (!getUnitAllowedActions(currentUnit, context).includes(normalizedAction)) {
    return false;
  }

  if (normalizedAction === unitActions.dismount) {
    return getUnitDismountTargetCells(currentUnit).length > 0;
  }

  if (normalizedAction === unitActions.research && getUnitResearchPointsPerTurn(currentUnit, context) <= 0) {
    return false;
  }

  return matchesRequirements(getUnitActionRequirements(currentUnit, normalizedAction, context), context);
}

function getUnitResearchPointsPerTurn(currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(currentUnit, context).researchPointsPerTurn);

  if (!Number.isFinite(configured)) {
    return 0;
  }

  return Math.max(0, configured);
}

function getPreferredUnitAction(currentUnit = getSelectedUnit(), preferredAction = unitActions.walk) {
  const normalizedPreferred = normalizePendingSelectableUnitAction(preferredAction);

  if (!currentUnit) {
    return normalizedPreferred || unitActions.walk;
  }

  if (normalizedPreferred && canUnitUseSelectableAction(currentUnit, normalizedPreferred)) {
    return normalizedPreferred;
  }

  return getSelectableUnitActions(currentUnit)[0] || null;
}

function isCellTargetUnitAction(action) {
  return (
    action === unitActions.walk ||
    action === unitActions.dismount ||
    action === unitActions.layFoundation ||
    action === unitActions.gatherFood ||
    action === unitUiActions.work ||
    action === unitActions.gatherMaterials ||
    action === unitActions.buildHouse ||
    action === unitActions.demolish
  );
}

function getUnitActionLabel(action) {
  if (action === unitActions.dismount) {
    return strings.actions.dismount;
  }

  if (action === unitActions.layFoundation) {
    return strings.actions.layFoundation;
  }

  if (action === unitActions.play) {
    return strings.actions.play;
  }

  if (action === unitActions.research) {
    return strings.actions.research;
  }

  if (action === unitActions.gatherFood) {
    return strings.actions.gatherFood;
  }

  if (action === unitUiActions.work) {
    return strings.actions.work;
  }

  if (action === unitActions.gatherMaterials) {
    return strings.actions.gatherMaterials;
  }

  if (action === unitActions.buildHouse) {
    return strings.actions.buildHouse;
  }

  if (action === unitActions.demolish) {
    return strings.actions.demolish;
  }

  return strings.actions.walk;
}

function ensureFoundationActionMenuButtons() {
  if (!foundationActionMenu) {
    return;
  }

  foundationActionMenu.replaceChildren();

  for (const constructible of getFoundationConstructibleOptions()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "foundation-action-button";
    button.dataset.action = "select-foundation-constructible";
    button.dataset.foundationId = constructible.id;
    button.dataset.foundationKind = constructible.kind;
    button.dataset.foundationType = constructible.type;
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = `<span aria-hidden="true">${getFoundationConstructibleIcon(constructible)}</span>`;
    foundationActionMenu.append(button);
  }
}

function updateFoundationActionMenu() {
  if (!foundationActionMenu) {
    return;
  }

  ensureFoundationActionMenuButtons();

  const selectedUnit = getSelectedUnit();
  const shouldShow =
    isPlayMode() &&
    !mainMenuOpen &&
    Boolean(selectedUnit) &&
    getCurrentSelectedUnitAction(selectedUnit) === unitActions.layFoundation &&
    canUnitUseAction(selectedUnit, unitActions.layFoundation) &&
    getFoundationConstructibleOptions().length > 0;

  foundationActionMenu.hidden = !shouldShow;

  const selectedConstructible = getSelectedFoundationConstructible();

  for (const button of foundationActionMenu.querySelectorAll("[data-foundation-id]")) {
    const option = parseFoundationConstructibleId(button.dataset.foundationId);
    const isSelected = option?.id === selectedConstructible?.id;
    button.hidden = !option || !getFoundationConstructibleOptions().some((constructible) => constructible.id === option.id);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.setAttribute("aria-label", getFoundationConstructibleLabel(option));
    button.title = getFoundationConstructibleLabel(option);
  }

  if (!shouldShow) {
    foundationActionMenu.style.left = "";
    return;
  }

  const actionButton = unitActionBar?.querySelector('[data-unit-action="layFoundation"]:not([hidden])');

  if (actionButton) {
    foundationActionMenu.style.left = `${actionButton.offsetLeft + actionButton.offsetWidth / 2}px`;
  } else {
    foundationActionMenu.style.left = "50%";
  }
}

function applyStaticText() {
  document.documentElement.lang = currentLanguage;
  document.title = strings.app.title;
  viewport.setAttribute("aria-label", strings.aria.viewport);
  terrainMenuOptions.setAttribute("aria-label", strings.aria.terrainMenu);
  variantMenuOptions.setAttribute("aria-label", strings.aria.variantMenu);
  gameActionMenu?.setAttribute("aria-label", strings.aria.gameMenu);
  saveSlotPanel?.setAttribute("aria-label", strings.aria.saveSlots);
  mainMenuOverlay?.setAttribute("aria-label", strings.aria.mainMenu);
  unitActionBar?.setAttribute("aria-label", strings.aria.unitActions);
  setTextContent(appTitleElements, strings.app.title);
  setTextContent(storesTitleElements, strings.play.storesTitle);
  setTextContent(tileInspectorTitleElements, "");
  setTextContent(gameMenuToggleButtons, strings.actions.menu);
  setTextContent(newRandomMapButtons, strings.actions.newRandomMap);
  setTextContent(newEmptyMapButtons, strings.actions.newEmptyMap);
  setTextContent(loadStateButtons, strings.actions.load);
  setTextContent(saveStateButtons, strings.actions.save);
  setTextContent(saveStateAsButtons, strings.actions.saveAs);
  setTextContent(openMainMenuButtons, strings.actions.mainMenu);
  setTextContent(nextTurnButtons, strings.actions.nextTurn);
  setTextContent(autoPassLabels, strings.toggles.autoPass);
  setTextContent(musicToggleLabelElements, strings.audio.musicToggle);
  setTextContent(musicVolumeLabelElements, strings.audio.volume);
  setTextContent(slotNameLabels, strings.saveSlots.slotName);
  setTextContent(slotListTitles, strings.saveSlots.existingSlots);
  setTextContent(confirmSlotPanelButtons, strings.actions.save);
  setTextContent(importSlotPanelButtons, strings.actions.importFile);
  setTextContent(cancelSlotPanelButtons, strings.actions.cancel);
  setAttributeForElements(closeSlotPanelIconButtons, "aria-label", strings.actions.close);
  if (saveSlotEmpty) {
    saveSlotEmpty.textContent = strings.saveSlots.empty;
  }
  setTextContent([mainMenuItems.watchIntro], strings.menu.watchIntro);
  setTextContent([mainMenuItems.startNewGame], strings.menu.startNewGame);
  setTextContent([mainMenuItems.play], strings.menu.play);
  setTextContent([mainMenuItems.loadGame], strings.menu.loadGame);
  setTextContent([mainMenuItems.edit], strings.menu.edit);
  setTextContent([mainMenuItems.importExport], strings.menu.importExport);
  setTextContent(mainMenuLoadingElements, strings.menu.loading);
  setTextContent([variantMenuTitle], strings.menu.visual);
  setTextContent(editorCurrentLabelElements, strings.editor.current);
  setTextContent(editorTotalLabelElements, strings.editor.total);
  setTextContent(editorCompletionLabelElements, strings.editor.completion);
  setTextContent(editorAbandonedLabelElements, strings.editor.abandoned);
  setTextContent(openEditorResearchButtons, getEditorLabel("technologies"));
  setTextContent(editorResearchTitleElements, getEditorLabel("technologies"));
  setTextContent(clearEditorResearchGoalButtons, getEditorLabel("clearGoal"));
  setAttributeForElements(closeEditorResearchButtons, "aria-label", strings.actions.close);
  if (editorResearchEmpty) {
    editorResearchEmpty.textContent = getEditorLabel("noTechnologies");
  }
  setAttributeForElements(languageSelectorGroups, "aria-label", strings.language.selectorLabel);
  setAttributeForElements(zoomControlGroups, "aria-label", strings.aria.zoomControls);
  setAttributeForElements(zoomOutButtons, "aria-label", strings.aria.zoomOut);
  setAttributeForElements(zoomInButtons, "aria-label", strings.aria.zoomIn);
  setAttributeForElements(musicEnabledInputs, "aria-label", strings.aria.musicToggle);
  setAttributeForElements(musicVolumeInputs, "aria-label", strings.aria.musicVolume);
  setAttributeForElements(musicEnabledInputs, "title", strings.aria.musicToggle);
  setAttributeForElements(musicVolumeInputs, "title", strings.aria.musicVolume);
  updateWatchIntroButton();
  setAttributeForElements(nextUnitButtons, "aria-label", strings.actions.nextUnit);
  setAttributeForElements(nextUnitButtons, "title", strings.actions.nextUnit);
  setAttributeForElements(cancelUnitTaskButtons, "aria-label", strings.actions.cancel);
  setAttributeForElements(cancelUnitTaskButtons, "title", strings.actions.cancel);
  setAttributeForElements(openBookOverlayButtons, "aria-label", strings.actions.openBook);
  setAttributeForElements(openBookOverlayButtons, "title", strings.actions.openBook);
  setAttributeForElements(closeBookOverlayButtons, "aria-label", strings.actions.closeBook);
  setAttributeForElements(closeBookOverlayButtons, "title", strings.actions.closeBook);
  setAttributeForElements(previousBookPageButtons, "aria-label", strings.actions.previousPage);
  setAttributeForElements(previousBookPageButtons, "title", strings.actions.previousPage);
  setAttributeForElements(nextBookPageButtons, "aria-label", strings.actions.nextPage);
  setAttributeForElements(nextBookPageButtons, "title", strings.actions.nextPage);
  setAttributeForElements(previousSituationMessageButtons, "aria-label", strings.actions.previousMessage);
  setAttributeForElements(previousSituationMessageButtons, "title", strings.actions.previousMessage);
  setAttributeForElements(nextSituationMessageButtons, "aria-label", strings.actions.nextMessage);
  setAttributeForElements(nextSituationMessageButtons, "title", strings.actions.nextMessage);

  for (const button of unitActionButtons) {
    const action = normalizeSelectableUnitAction(button.dataset.unitAction);
    const label = getUnitActionLabel(action);

    button.setAttribute("aria-label", label);
    button.title = label;
  }

  updateFoundationActionMenu();

  for (const button of languageOptionButtons) {
    const language = button.dataset.language;
    const label = strings.language?.[language] || language || "";
    const isSelected = language === currentLanguage;

    button.setAttribute("aria-label", label);
    button.title = label;
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.classList.toggle("is-selected", isSelected);
  }

  updateAudioControls();
  updateSituationMessagePanel();
  updateEditInspector();
  updateEditorResearchPanel();
}

function setMainMenuLoadingState(isLoading) {
  if (!mainMenuOverlay) {
    return;
  }

  mainMenuOverlay.classList.toggle("is-loading", isLoading);

  for (const element of mainMenuLoadingElements) {
    element.hidden = !isLoading;
  }
}

async function runMainMenuLoadingAction(action) {
  setMainMenuLoadingState(true);

  try {
    await action();
  } finally {
    setMainMenuLoadingState(false);
  }
}

function sanitizeFileName(fileName) {
  if (typeof fileName !== "string") return "";
  return fileName.trim();
}

function getCurrentFileKey(mode) {
  return storageKeys.currentFile[mode] || null;
}

function getSaveFileKey(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return null;
  return `${storageKeys.filePrefix}${encodeURIComponent(normalizedName)}`;
}

function readCurrentFileName(mode) {
  if (currentFileNames[mode]) return currentFileNames[mode];

  const storageKey = getCurrentFileKey(mode);

  if (!storageKey) return null;

  try {
    const fileName = sanitizeFileName(window.localStorage.getItem(storageKey) || "");
    currentFileNames[mode] = fileName || null;
    return currentFileNames[mode];
  } catch (error) {
    console.warn(`Could not read current file name for ${mode}.`, error);
    return null;
  }
}

function writeCurrentFileName(mode, fileName) {
  const storageKey = getCurrentFileKey(mode);
  const normalizedName = sanitizeFileName(fileName);

  currentFileNames[mode] = normalizedName || null;

  if (!storageKey) return;

  try {
    if (normalizedName) {
      window.localStorage.setItem(storageKey, normalizedName);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.warn(`Could not write current file name for ${mode}.`, error);
  }
}

function getCurrentFileName(mode = interactionMode) {
  return mode ? readCurrentFileName(mode) : null;
}

function updateFileReadout() {
  const fileName = getCurrentFileName();

  setTextContent(
    fileReadouts,
    fileName ? strings.readouts.file(fileName) : strings.readouts.fileNone,
  );

  for (const marker of fileDirtyMarkers) {
    marker.hidden = !(interactionMode === interactionModes.edit && editStateDirty);
  }
}

function setEditStateDirty(isDirty) {
  const nextDirty = Boolean(isDirty);

  if (editStateDirty === nextDirty) {
    return;
  }

  editStateDirty = nextDirty;
  updateFileReadout();
}

function clearResourceCanvas(canvas) {
  const context = canvas?.getContext?.("2d");

  if (!context || !canvas) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  return context;
}

function drawResourceIconOnCanvas(canvas, imagePath) {
  const context = clearResourceCanvas(canvas);
  const image = resourceIconImages[imagePath];

  if (!context || !image?.complete || image.naturalWidth <= 0) {
    return;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function drawShortageIndicatorOnCanvas(canvas, currentTurns, thresholdTurns) {
  const context = clearResourceCanvas(canvas);

  if (!context) {
    return;
  }

  const normalizedCurrent = clampInteger(currentTurns, 0, thresholdTurns, 0);
  const normalizedThreshold = Math.max(1, clampInteger(thresholdTurns, 1, 999999, 3));
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.33;
  const sectorAngle = (Math.PI * 2) / normalizedThreshold;

  context.save();
  context.fillStyle = "rgba(48, 20, 24, 0.36)";
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();

  for (let index = 0; index < normalizedThreshold; index += 1) {
    const startAngle = -Math.PI / 2 + sectorAngle * index;
    const endAngle = startAngle + sectorAngle;

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      false,
    );
    context.closePath();
    context.fillStyle = index < normalizedCurrent
      ? "rgba(188, 44, 54, 0.96)"
      : "rgba(48, 20, 24, 0.18)";
    context.fill();
  }

  context.strokeStyle = "rgba(71, 12, 16, 0.92)";
  context.lineWidth = Math.max(2, canvas.width * 0.03);
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.stroke();

  context.lineWidth = Math.max(1.1, canvas.width * 0.02);
  for (let index = 0; index < normalizedThreshold; index += 1) {
    const angle = -Math.PI / 2 + sectorAngle * index;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    );
    context.stroke();
  }
  context.restore();
}

function updateStockpileReadout() {
  const stoneAmount = getCurrentStockpileAmount("stone");
  const lumberAmount = getCurrentStockpileAmount("lumber");
  const foodAmount = getCurrentStockpileAmount("food");
  const stoneCapacity = getResourceStorageCapacity("stone");
  const lumberCapacity = getResourceStorageCapacity("lumber");
  const foodCapacity = getResourceStorageCapacity("food");
  const shortageThreshold = getFoodShortageThreshold();

  for (const canvas of resourceStoneCanvases) {
    drawResourceIconOnCanvas(canvas, resourceUiIcons.stone);
  }

  for (const canvas of resourceLumberCanvases) {
    drawResourceIconOnCanvas(canvas, resourceUiIcons.lumber);
  }

  if (foodShortageTurns > 0) {
    for (const canvas of resourceFoodCanvases) {
      drawShortageIndicatorOnCanvas(canvas, foodShortageTurns, shortageThreshold);
    }
  } else {
    for (const canvas of resourceFoodCanvases) {
      drawResourceIconOnCanvas(canvas, resourceUiIcons.food);
    }
  }

  setTextContent(resourceStoneCaptions, `${formatDisplayedQuantity(stoneAmount)}/${formatDisplayedQuantity(stoneCapacity)}`);
  setTextContent(resourceLumberCaptions, `${formatDisplayedQuantity(lumberAmount)}/${formatDisplayedQuantity(lumberCapacity)}`);
  setTextContent(
    resourceFoodCaptions,
    foodShortageTurns > 0
      ? `${foodShortageTurns}/${shortageThreshold}`
      : `${formatDisplayedQuantity(foodAmount)}/${formatDisplayedQuantity(foodCapacity)}`,
  );
}

function getPathCompletionPercent(cell) {
  return clampInteger(
    Math.round((getCellVisitsCount(cell) / getCellPathWellKnownVisitsThreshold(cell)) * 100),
    0,
    100,
    0,
  );
}

function getTileInspectorInfoEntries(cell) {
  if (!cell) {
    return [];
  }

  const entries = [];
  const building = getBuildingAtCell(cell.x, cell.y);
  const vehicle = getVehicleAtCell(cell.x, cell.y);
  const materialType = getCellMaterialResourceType(cell);
  const pathProgressEligible = cell.type === "grass" && getCellVisitsCount(cell) >= getCellPathPreviewVisitsThreshold(cell);

  if (building) {
    const completeness = Math.round(getBuildingCompleteness(building) * 100);
    const resident = completeness >= 100 ? getBuildingResident(building) : null;
    const buildingLabel = getBuildingLabel(building.type);
    const residentLabel =
      resident?.name && typeof strings.play?.houseResident === "function"
        ? strings.play.houseResident(resident.name, getUnitTypeId(resident))
        : resident?.name || "";
    entries.push({
      kind: "building",
      cell,
      building,
      label: completeness >= 100 ? residentLabel || buildingLabel : `${buildingLabel} ${completeness}%`,
    });
  } else {
    if (vehicle) {
      const completeness = Math.round(getBuildingCompleteness(vehicle) * 100);
      const vehicleLabel = getVehicleLabel(vehicle.type);
      entries.push({
        kind: "vehicle",
        cell,
        vehicle,
        label: completeness >= 100 ? vehicleLabel : `${vehicleLabel} ${completeness}%`,
      });
    }

    if (hasFoodResource(cell)) {
      entries.push({
        kind: "food",
        cell,
        label: `${formatDisplayedQuantity(cell.foodAmount)}/${formatDisplayedQuantity(getCellFoodMaxAmount(cell))}`,
      });
    }
  }

  if (materialType) {
    entries.push({
      kind: "material",
      cell,
      materialType,
      label: formatDisplayedQuantity(cell.materialAmount),
    });
  } else if (pathProgressEligible) {
    const completionPercent = getPathCompletionPercent(cell);
    entries.push({
      kind: "path",
      cell,
      label: completionPercent >= 100 ? "" : `${completionPercent}%`,
    });
  }

  if (entries.length === 0 && (cell.type === "grass" || cell.type === "water")) {
    entries.push({
      kind: "tile",
      cell,
      label: "",
    });
  }

  return entries.slice(0, 2);
}

function clearInspectorCanvas(canvas) {
  const context = canvas?.getContext?.("2d");

  if (!context || !canvas) {
    return null;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  return context;
}

function drawInspectorTileBase(context, cell) {
  if (!context || !cell) {
    return;
  }

  const canvas = context.canvas;
  const variantId = ensureCellVariant(cell);
  const variant = getTerrainVariant(cell.type, variantId);
  const image = variant ? tileImages[variant.image] : null;

  if (image?.complete && image.naturalWidth > 0) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return;
  }

  const spec = terrain[cell.type];

  if (!spec) {
    return;
  }

  context.save();
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width, canvas.height * 0.39);
  context.lineTo(canvas.width / 2, canvas.height * 0.79);
  context.lineTo(0, canvas.height * 0.39);
  context.closePath();
  context.fillStyle = spec.top;
  context.fill();
  context.strokeStyle = spec.stroke;
  context.lineWidth = 1;
  context.stroke();

  context.beginPath();
  context.moveTo(0, canvas.height * 0.39);
  context.lineTo(canvas.width / 2, canvas.height * 0.79);
  context.lineTo(canvas.width, canvas.height * 0.39);
  context.lineTo(canvas.width / 2, canvas.height);
  context.closePath();
  context.fillStyle = spec.side;
  context.fill();
  context.restore();
}

function drawInspectorFoodOverlay(context, cell) {
  if (!context || !cell || !hasFoodResource(cell)) {
    return;
  }

  const overlayImagePath = getFoodOverlayImagePath(cell.foodType);

  if (!overlayImagePath) {
    return;
  }

  const image = resourceOverlayImages[overlayImagePath];

  if (!image?.complete || image.naturalWidth <= 0) {
    return;
  }

  const renderSpec = getFoodOverlayRenderSpec(cell.foodType);
  const drawWidth = baseTile.width * renderSpec.scale;
  const drawHeight = baseTile.height * renderSpec.scale;
  const baseY = baseTile.height * renderSpec.baseYFactor;

  context.drawImage(
    image,
    baseTile.width / 2 - drawWidth / 2,
    baseY - drawHeight,
    drawWidth,
    drawHeight,
  );
}

function drawInspectorConstructibleOverlayForKind(kind, context, constructible) {
  if (!context || !constructible) {
    return;
  }

  const visual = getConstructibleVisualForKind(kind, constructible);
  const imageRegistry = getConstructibleImageRegistryForKind(kind);
  const image = visual?.image ? imageRegistry[visual.image] : null;
  const renderMode = visual?.renderMode || getConstructibleRenderModeForKind(kind, constructible.type);

  if (!image?.complete || image.naturalWidth <= 0) {
    return;
  }

  context.save();
  context.globalAlpha = visual.alpha ?? 1;

  if (renderMode === "footprintImageNative" || renderMode === "footprintImage") {
    const canvas = context.canvas;
    const maxWidth = canvas.width * 0.9;
    const maxHeight = canvas.height * 0.9;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = canvas.height - drawHeight - 2;

    context.drawImage(
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );
  } else {
    const drawBox = getNativeSingleCellDrawBox(
      baseTile.width / 2,
      baseTile.height,
      image,
      1,
    );

    if (!drawBox) {
      context.restore();
      return;
    }

    context.drawImage(
      image,
      drawBox.x,
      drawBox.y,
      drawBox.width,
      drawBox.height,
    );
  }

  context.restore();
}

function drawInspectorBuildingOverlay(context, building) {
  drawInspectorConstructibleOverlayForKind("building", context, building);
}

function drawInspectorVehicleOverlay(context, vehicle) {
  drawInspectorConstructibleOverlayForKind("vehicle", context, vehicle);
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

function renderTileInspectorInfoItem(canvas, entry) {
  const context = clearInspectorCanvas(canvas);

  if (!context || !entry?.cell) {
    return;
  }

  const shouldDrawTileBase = !(
    (entry.kind === "food" &&
      entry.cell.foodType &&
      entry.cell.foodType !== "fish") ||
    entry.kind === "building" ||
    entry.kind === "vehicle"
  );

  if (shouldDrawTileBase) {
    drawInspectorTileBase(context, entry.cell);
  }

  if (entry.kind === "food") {
    drawInspectorFoodOverlay(context, entry.cell);
    return;
  }

  if (entry.kind === "building") {
    drawInspectorBuildingOverlay(context, entry.building);
    return;
  }

  if (entry.kind === "vehicle") {
    drawInspectorVehicleOverlay(context, entry.vehicle);
    return;
  }

  if (entry.kind === "path") {
    drawInspectorPathOverlay(context, isWellKnownPathCell(entry.cell));
  }
}

function setTileInspectorInfoSlot(slotIndex, entry = null) {
  const itemCollections = [tileInfoPrimaryItems, tileInfoSecondaryItems];
  const canvasCollections = [tileInfoPrimaryCanvases, tileInfoSecondaryCanvases];
  const captionCollections = [tileInfoPrimaryCaptions, tileInfoSecondaryCaptions];
  const items = itemCollections[slotIndex] || [];
  const canvases = canvasCollections[slotIndex] || [];
  const captions = captionCollections[slotIndex] || [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const canvas = canvases[index];
    const caption = captions[index];

    item.hidden = !entry;

    if (!entry) {
      if (canvas) {
        clearInspectorCanvas(canvas);
      }

      if (caption) {
        caption.textContent = "";
      }

      continue;
    }

    renderTileInspectorInfoItem(canvas, entry);

    if (caption) {
      caption.textContent = entry.label || "";
    }
  }
}

function getInspectedPlayCell() {
  const selectedUnit = getSelectedUnit();

  if (selectedUnit) {
    return getCell(selectedUnit.x, selectedUnit.y);
  }

  if (inspectedPlayCell && isCellVisibleToPlayer(inspectedPlayCell)) {
    return inspectedPlayCell;
  }

  return null;
}

function isPlayTileInspectionActive() {
  return isPlayMode() && !mainMenuOpen && !getSelectedUnit() && Boolean(inspectedPlayCell);
}

function updateTileInspectorReadout() {
  const inspectedCell = getInspectedPlayCell();

  if (!isPlayMode() || !inspectedCell) {
    setTextContent(tileInspectorTitleElements, "");
    setTileInspectorInfoSlot(0, null);
    setTileInspectorInfoSlot(1, null);
    return;
  }

  setTextContent(tileInspectorTitleElements, terrain[inspectedCell.type].label);
  const entries = getTileInspectorInfoEntries(inspectedCell);
  setTileInspectorInfoSlot(0, entries[0] || null);
  setTileInspectorInfoSlot(1, entries[1] || null);
}

function getAppSubtitleText() {
  if (mainMenuOpen || !interactionMode) return "";
  if (interactionMode === interactionModes.edit) return strings.app.editorSubtitle;
  return "";
}

function updatePersistenceControls() {
  const disabled =
    !interactionMode ||
    isReplayPhase() ||
    getUnits().some((currentUnit) => isUnitAnimating(currentUnit));

  setDisabledState(loadStateButtons, disabled);
  setDisabledState(saveStateButtons, disabled);
  setDisabledState(saveStateAsButtons, disabled);
  updateFileReadout();
}

function getDefaultUnitStamina(unitTypeId = getDefaultUnitTypeId(), context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(unitTypeId, context).stamina);

  if (!Number.isFinite(configured)) {
    return 2;
  }

  return Math.max(1, clampNumber(configured, 1, 999, 2));
}

function getDefaultUnitName(unitTypeId = getDefaultUnitTypeId(), context = getRuleContext()) {
  const normalizedTypeId = normalizeUnitTypeId(unitTypeId);
  const resolvedConfig = getEffectiveUnitConfig(normalizedTypeId, context);
  const localizedDefault = normalizedTypeId === getDefaultUnitTypeId() && typeof strings.units?.defaultName === "string"
    ? strings.units.defaultName.trim()
    : "";
  const localizedSpecific = typeof strings.units?.types?.[normalizedTypeId]?.defaultName === "string"
    ? strings.units.types[normalizedTypeId].defaultName.trim()
    : "";
  const configured = typeof resolvedConfig.name === "string"
    ? resolvedConfig.name.trim()
    : "";
  return resolveLocalizedLabel(
    resolvedConfig.labels,
    localizedSpecific || localizedDefault || configured || "Schtroumpf",
  ) || "Schtroumpf";
}

function normalizeUnitName(name, unitTypeId = getDefaultUnitTypeId()) {
  const normalized = typeof name === "string" ? name.trim() : "";
  return normalized || getDefaultUnitName(unitTypeId);
}

function getUnitHomeBuildingId(currentUnit) {
  return typeof currentUnit?.homeBuildingId === "string" && currentUnit.homeBuildingId
    ? currentUnit.homeBuildingId
    : null;
}

function getBuildingResident(buildingOrId) {
  const buildingId =
    typeof buildingOrId === "string"
      ? buildingOrId
      : typeof buildingOrId?.id === "string" && buildingOrId.id
        ? buildingOrId.id
        : null;

  if (!buildingId) {
    return null;
  }

  return getUnits().find((currentUnit) => getUnitHomeBuildingId(currentUnit) === buildingId) || null;
}

function getUnitMaxStamina(currentUnit = unit, context = getRuleContext()) {
  return Math.max(1, clampNumber(getDefaultUnitStamina(getUnitTypeId(currentUnit), context), 1, 999, 2));
}

function getUnitStamina(currentUnit = unit) {
  return Math.max(0, clampNumber(currentUnit?.stamina, 0, 999, getUnitMaxStamina(currentUnit)));
}

function getPathWellKnownVisitsThreshold() {
  return Math.max(1, clampInteger(rules.movement?.paths?.wellKnownVisits, 1, 999999, 10));
}

function getPathPreviewVisitsThreshold() {
  const threshold = getPathWellKnownVisitsThreshold();
  return Math.max(
    1,
    clampInteger(rules.movement?.paths?.previewVisits, 1, threshold, Math.ceil(threshold / 2)),
  );
}

function getPathMoveCost() {
  return Math.max(0, clampNumber(rules.movement?.paths?.moveCost, 0, 999, 0.7));
}

function getCellPathWellKnownVisitsThreshold(cell) {
  return getPathWellKnownVisitsThreshold();
}

function getCellPathPreviewVisitsThreshold(cell) {
  return getPathPreviewVisitsThreshold();
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

function getPathStateBetween(fromCell, toCell) {
  if (!fromCell || !toCell || !areCellsAdjacent(fromCell.x, fromCell.y, toCell.x, toCell.y)) {
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

function getTerrainMoveCost(cell, fromCell = null) {
  if (!cell) return Number.POSITIVE_INFINITY;

  if (fromCell && hasFullPathBetween(fromCell, cell)) {
    return getPathMoveCost();
  }

  const configuredCost = rules.movement?.terrainCost?.[cell.type];

  if (!Number.isFinite(configuredCost)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(1, configuredCost);
}

function getMountedMoveCostMultiplier(currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getMountedVehicleRules(currentUnit, context)?.multipliers?.moveCost);

  if (!Number.isFinite(configured)) {
    return 1;
  }

  return Math.max(0, configured);
}

function getUnitMoveCost(cell, fromCell = null, currentUnit = unit, context = getRuleContext()) {
  const baseCost = getTerrainMoveCost(cell, fromCell);

  if (!Number.isFinite(baseCost)) {
    return baseCost;
  }

  return Math.max(0, baseCost * getMountedMoveCostMultiplier(currentUnit, context));
}

function getMountedWorkPointsMultiplier(taskType, currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getMountedVehicleRules(currentUnit, context)?.multipliers?.workPointsPerTurn?.[taskType]);

  if (!Number.isFinite(configured)) {
    return 1;
  }

  return Math.max(0, configured);
}

function getUnitWorkPointsPerTurn(taskType, currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(currentUnit, context).workPointsPerTurn?.[taskType]);

  if (!Number.isFinite(configured)) {
    return 0;
  }

  return Math.max(0, configured * getMountedWorkPointsMultiplier(taskType, currentUnit, context));
}

function getGatherTaskDurationTurns() {
  const configured = Number(rules.resources?.gathering?.durationTurns);

  if (!Number.isFinite(configured)) {
    return 3;
  }

  return Math.max(1, Math.floor(configured));
}

function getUnitFoodConsumptionPerTurn(currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(currentUnit, context).foodConsumptionPerTurn);

  if (!Number.isFinite(configured)) {
    return 1;
  }

  return Math.max(0, configured);
}

function createEmptyStockpile() {
  const initial = rules.resources?.stockpile?.initial || {};

  return {
    stone: clampNonNegativeNumber(initial.stone, 999999, 0),
    lumber: clampNonNegativeNumber(initial.lumber, 999999, 0),
    food: clampNonNegativeNumber(initial.food, 999999, 0),
  };
}

function getMaterialAmountForTerrain(type) {
  if (type === "mountain") {
    return clampNonNegativeNumber(rules.resources?.materials?.mountainStonePerTile, 999999, 260);
  }

  if (type === "forest") {
    return clampNonNegativeNumber(rules.resources?.materials?.forestLumberPerTile, 999999, 220);
  }

  return 0;
}

function getBuildingResourceStorageCapacity(type, resourceType, context = getRuleContext()) {
  if (!type || !resourceType) {
    return 0;
  }

  return Math.max(
    0,
    clampNumber(getEffectiveConstructibleRules("building", type, context)?.resourceStorageCapacities?.[resourceType], 0, 999999, 0),
  );
}

function getResourceStorageCapacity(resourceType, context = getRuleContext()) {
  if (!resourceType) {
    return 0;
  }

  let totalCapacity = 0;

  for (const building of buildings) {
    if (!building || building.state === "construction") {
      continue;
    }

    totalCapacity += getBuildingResourceStorageCapacity(building.type, resourceType, context);
  }

  return totalCapacity;
}

function getFoodShortageThreshold() {
  return Math.max(
    1,
    clampInteger(rules.resources?.starvation?.thresholdTurns, 1, 999999, 3),
  );
}

function getFoodShortageResetTurns() {
  return Math.max(
    0,
    clampInteger(rules.resources?.starvation?.resetAfterUnitLeaves, 0, 999999, 0),
  );
}

function getConstructibleBuildCost(kind, type, context = getRuleContext()) {
  return getConstructibleBuildCostForKind(kind, type, context);
}

function getConstructibleBuildCostStatus(kind, type, context = getRuleContext()) {
  return getConstructibleBuildCostStatusForKind(kind, type, context);
}

function getFoodDefinition(foodType) {
  return rules.resources?.foodTypes?.[foodType] || null;
}

function getFoodTypeMaxAmount(foodType) {
  const maxAmount = Number(getFoodDefinition(foodType)?.max);

  if (!Number.isFinite(maxAmount)) {
    return 0;
  }

  return Math.max(0, maxAmount);
}

function getFoodTypeRegrowth(foodType) {
  const regrowth = Number(getFoodDefinition(foodType)?.regrowthPerTurn);

  if (!Number.isFinite(regrowth)) {
    return 0;
  }

  return Math.max(0, regrowth);
}

function getFoodOverlayImagePath(foodType) {
  const overlayImage = getFoodDefinition(foodType)?.overlayImage;
  return typeof overlayImage === "string" && overlayImage ? overlayImage : null;
}

function getFoodOverlayRenderSpec(foodType) {
  const definition = getFoodDefinition(foodType) || {};
  const overlayScale = Number(definition.overlayScale);
  const overlayBaseYFactor = Number(definition.overlayBaseYFactor);

  return {
    scale: Number.isFinite(overlayScale) && overlayScale > 0 ? overlayScale : 1,
    baseYFactor: Number.isFinite(overlayBaseYFactor) ? overlayBaseYFactor : 1,
  };
}

function getCellFoodMaxAmount(cell) {
  if (!cell?.foodType) {
    return 0;
  }

  return clampNonNegativeNumber(cell.foodCapacity, 999999, getFoodTypeMaxAmount(cell.foodType));
}

function getResourceLabel(resourceType) {
  return strings.resources?.[resourceType] || resourceType;
}

function getCellMaterialResourceType(cell) {
  if (!cell || cell.materialAmount <= 0) return null;

  if (cell.type === "mountain") return "stone";
  if (cell.type === "forest") return "lumber";
  return null;
}

function hasFoodResource(cell) {
  return Boolean(cell?.foodType) && getCellFoodMaxAmount(cell) > 0;
}

function hasGatherableFoodResource(cell) {
  return hasFoodResource(cell) && cell.foodAmount > 0;
}

function hasMaterialResource(cell) {
  return Boolean(getCellMaterialResourceType(cell));
}

function getCurrentStockpileAmount(resourceType) {
  return clampNonNegativeNumber(stockpile?.[resourceType], 999999, 0);
}

function addToStockpile(resourceType, amount) {
  const normalizedAmount = clampNonNegativeNumber(amount, 999999, 0);
  const capacity = getResourceStorageCapacity(resourceType);
  const currentAmount = getCurrentStockpileAmount(resourceType);
  const nextAmount = clamp(currentAmount + normalizedAmount, 0, capacity);
  const stored = nextAmount - currentAmount;

  stockpile[resourceType] = nextAmount;
  return stored;
}

function clampStockpileToCapacity() {
  for (const resourceType of stockpileResourceTypes) {
    const capacity = getResourceStorageCapacity(resourceType);
    stockpile[resourceType] = clamp(getCurrentStockpileAmount(resourceType), 0, capacity);
  }
}

function spendFromStockpile(resourceType, amount) {
  const normalizedAmount = clampNonNegativeNumber(amount, 999999, 0);
  const currentAmount = getCurrentStockpileAmount(resourceType);

  if (!hasSufficientQuantity(currentAmount, normalizedAmount)) {
    return false;
  }

  stockpile[resourceType] = clamp(currentAmount - normalizedAmount, 0, getResourceStorageCapacity(resourceType));
  return true;
}

function canAffordConstructibleType(kind, type, context = getRuleContext()) {
  const buildCost = getConstructibleBuildCost(kind, type, context);

  return (
    hasSufficientQuantity(getCurrentStockpileAmount("stone"), buildCost.stone) &&
    hasSufficientQuantity(getCurrentStockpileAmount("lumber"), buildCost.lumber)
  );
}

function getSelectedUnit() {
  return units.find((currentUnit) => currentUnit?.selected) || null;
}

function syncActiveUnit(preferredUnitId = unit?.id || null) {
  const selectedUnit = getSelectedUnit();

  if (selectedUnit) {
    unit = selectedUnit;
    return unit;
  }

  if (preferredUnitId) {
    const preferredUnit = units.find((currentUnit) => currentUnit?.id === preferredUnitId) || null;

    if (preferredUnit) {
      unit = preferredUnit;
      return unit;
    }
  }

  unit = units[0] || null;
  return unit;
}

function getUnitById(unitId) {
  return units.find((currentUnit) => currentUnit?.id === unitId) || null;
}

function getVehicleById(vehicleId) {
  return vehicles.find((vehicle) => vehicle?.id === vehicleId) || null;
}

function getMountedVehicle(currentUnit = unit) {
  const mountedVehicleId = normalizeLinkedEntityId(currentUnit?.mountedVehicleId);
  return mountedVehicleId ? getVehicleById(mountedVehicleId) : null;
}

function createUnitId(items = units) {
  let maxIndex = 0;

  for (const currentUnit of items) {
    const match = /^unit_(\d+)$/.exec(currentUnit?.id || "");

    if (!match) continue;
    maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10) || 0);
  }

  return `unit_${String(maxIndex + 1).padStart(2, "0")}`;
}

function getConstructibleRules(kind, type) {
  return getConstructibleRulesForKind(kind, type);
}

function getEffectiveConstructibleRules(kind, type, context = getRuleContext()) {
  return getEffectiveConstructibleRulesForKind(kind, type, context);
}

function getMountedVehicleRules(currentUnit = unit, context = getRuleContext()) {
  return getEffectiveConstructibleRules("vehicle", getMountedVehicle(currentUnit)?.type, context)?.mounted || null;
}

function getConstructibleSpec(kind, type) {
  return getConstructibleSpecForKind(kind, type);
}

function getDefinedConstructibleTypes(kind) {
  return getDefinedConstructibleTypesForKind(kind);
}

function getUnitAvailability(unitOrTypeId = getDefaultUnitTypeId()) {
  return getResolvedUnitConfig(unitOrTypeId).availability || {};
}

function isUnitTypeAvailable(unitOrTypeId = getDefaultUnitTypeId(), context = getRuleContext()) {
  const typeId =
    typeof unitOrTypeId === "string"
      ? normalizeUnitTypeId(unitOrTypeId)
      : getUnitTypeId(unitOrTypeId);

  if (!hasDefinedUnitType(typeId)) {
    return false;
  }

  return matchesRequirements(getUnitAvailability(typeId), context);
}

function getUnitActionRequirements(currentUnit = unit, action, context = getRuleContext()) {
  const normalizedAction = normalizePendingUnitAction(action);

  if (!normalizedAction) {
    return {};
  }

  return getEffectiveUnitConfig(currentUnit, context)?.actionRequirements?.[normalizedAction] || {};
}

function getCountForRuleMap(map, key) {
  if (!key || !map || typeof map !== "object") {
    return 0;
  }

  return Math.max(0, clampInteger(map[key], 0, 999999, 0));
}

function getLivingUnitCountsByType() {
  const counts = {};

  for (const currentUnit of getUnits()) {
    const typeId = getUnitTypeId(currentUnit);
    counts[typeId] = (counts[typeId] || 0) + 1;
  }

  return counts;
}

function getConstructibleCountsByType(kind, { includeConstruction = true } = {}) {
  return getConstructibleCountsByTypeForKind(kind, { includeConstruction });
}

function getRuleContext() {
  return {
    discoveredTechIds: new Set(
      Array.isArray(researchState?.discoveredTechIds)
        ? researchState.discoveredTechIds.map((technologyId) => (typeof technologyId === "string" ? technologyId.trim() : "")).filter(Boolean)
        : [],
    ),
    eventFlags: researchState?.eventFlags && typeof researchState.eventFlags === "object"
      ? researchState.eventFlags
      : {},
    completeBuildingCountsByType: getConstructibleCountsByType("building", { includeConstruction: false }),
    anyBuildingCountsByType: getConstructibleCountsByType("building", { includeConstruction: true }),
    completeVehicleCountsByType: getConstructibleCountsByType("vehicle", { includeConstruction: false }),
    anyVehicleCountsByType: getConstructibleCountsByType("vehicle", { includeConstruction: true }),
    livingUnitCountsByType: getLivingUnitCountsByType(),
    nextUnitNumber: getUnits().length + 1,
  };
}

function matchesRequirements(requirements, context = getRuleContext()) {
  const normalizedRequirements = requirements && typeof requirements === "object" ? requirements : {};

  for (const technologyId of normalizedRequirements.requiredTechs || []) {
    if (!context.discoveredTechIds?.has(technologyId)) {
      return false;
    }
  }

  for (const eventId of normalizedRequirements.requiredEvents || []) {
    if (!context.eventFlags?.[eventId]) {
      return false;
    }
  }

  for (const [buildingType, requiredCount] of Object.entries(normalizedRequirements.requiredBuildingsMin || {})) {
    if (getCountForRuleMap(context.completeBuildingCountsByType, buildingType) < requiredCount) {
      return false;
    }
  }

  for (const unitType of normalizedRequirements.requiredUnitsPresent || []) {
    if (getCountForRuleMap(context.livingUnitCountsByType, unitType) <= 0) {
      return false;
    }
  }

  for (const unitType of normalizedRequirements.requiredUnitsAbsent || []) {
    if (getCountForRuleMap(context.livingUnitCountsByType, unitType) > 0) {
      return false;
    }
  }

  if (
    Number.isFinite(normalizedRequirements.nextUnitNumberEquals) &&
    context.nextUnitNumber !== normalizedRequirements.nextUnitNumberEquals
  ) {
    return false;
  }

  return true;
}

function evaluateCountLimits(limits, subjectType, context = getRuleContext(), { subjectCountsByType = context.anyBuildingCountsByType } = {}) {
  const normalizedLimits = limits && typeof limits === "object" ? limits : {};
  const subjectCount = getCountForRuleMap(subjectCountsByType, subjectType);
  const maxCount = Number(normalizedLimits.maxCount);

  if (Number.isFinite(maxCount) && subjectCount >= Math.max(0, Math.floor(maxCount))) {
    return false;
  }

  const countByBuilding = normalizedLimits.countByBuilding && typeof normalizedLimits.countByBuilding === "object"
    ? normalizedLimits.countByBuilding
    : null;

  if (countByBuilding?.building) {
    const providerCount = getCountForRuleMap(context.completeBuildingCountsByType, countByBuilding.building);
    const base = Math.max(0, Math.floor(Number(countByBuilding.base) || 0));
    const perBuilding = Math.max(0, Math.floor(Number(countByBuilding.perBuilding) || 0));
    const allowedCount = base + providerCount * perBuilding;

    if (subjectCount >= allowedCount) {
      return false;
    }
  }

  return true;
}

function getConstructibleAvailability(kind, type) {
  return getConstructibleRulesForKind(kind, type)?.availability || {};
}

function getConstructibleLimits(kind, type) {
  return getConstructibleRulesForKind(kind, type)?.limits || {};
}

function isConstructibleTypeAvailable(kind, type, context = getRuleContext(), { ignoreRequirements = false, ignoreLimits = false } = {}) {
  const normalizedKind = normalizeConstructibleKind(kind);

  if (!getConstructibleRulesForKind(normalizedKind, type) || !getConstructibleSpecForKind(normalizedKind, type)) {
    return false;
  }

  if (!ignoreRequirements && !matchesRequirements(getConstructibleAvailability(normalizedKind, type), context)) {
    return false;
  }

  const subjectCountsByType = normalizedKind === "vehicle"
    ? context.anyVehicleCountsByType
    : context.anyBuildingCountsByType;

  if (!ignoreLimits && !evaluateCountLimits(getConstructibleLimits(normalizedKind, type), type, context, { subjectCountsByType })) {
    return false;
  }

  return true;
}

function isBuildingTypeAvailable(type, context = getRuleContext(), options = {}) {
  return isConstructibleTypeAvailable("building", type, context, options);
}

function isVehicleTypeAvailable(type, context = getRuleContext(), options = {}) {
  return isConstructibleTypeAvailable("vehicle", type, context, options);
}

function getAvailableConstructibleTypes(kind, context = getRuleContext()) {
  return getDefinedConstructibleTypesForKind(kind).filter((type) => isConstructibleTypeAvailable(kind, type, context));
}

function getBuildingLabel(type) {
  return getConstructibleLabel("building", type);
}

function getVehicleLabel(type) {
  return getConstructibleLabel("vehicle", type);
}

function getDefinedBuildingTypes() {
  return getDefinedConstructibleTypes("building");
}

function getDefinedVehicleTypes() {
  return getDefinedConstructibleTypes("vehicle");
}

function getConstructibleLabel(kind, type) {
  const normalizedKind = normalizeConstructibleKind(kind);
  const fallback = normalizedKind === "building"
    ? (strings.buildings?.[type] || type)
    : type;

  return resolveLocalizedLabel(getConstructibleSpecForKind(normalizedKind, type)?.labels, fallback) || type;
}

function getConstructibleTypeIcon(kind, type) {
  return getConstructibleSpecForKind(kind, type)?.icon || "•";
}

function getConstructibleFoundationActionTypes(kind, context = getRuleContext()) {
  return getAvailableConstructibleTypes(kind, context)
    .filter((type) => Boolean(getEffectiveConstructibleRulesForKind(kind, type, context)?.foundationActionAvailable));
}

function getFoundationBuildingTypeIcon(type) {
  return getConstructibleTypeIcon("building", type);
}

function getVehicleTypeIcon(type) {
  return getConstructibleTypeIcon("vehicle", type);
}

function getBuildingFootprintRowStep() {
  return 2;
}

function getMaxBuildingHeightAtY(y, mapHeight = map.height) {
  const normalizedY = clampInteger(y, 0, Math.max(0, mapHeight - 1), 0);
  return Math.max(1, Math.floor((mapHeight - 1 - normalizedY) / getBuildingFootprintRowStep()) + 1);
}

function getBuildingWidth(type) {
  return getConstructibleDimensionForKind("building", type, "width");
}

function getBuildingHeight(type) {
  return getConstructibleDimensionForKind("building", type, "height");
}

function getVehicleWidth(type) {
  return getConstructibleDimensionForKind("vehicle", type, "width");
}

function getVehicleHeight(type) {
  return getConstructibleDimensionForKind("vehicle", type, "height");
}

function getFoundationConstructibleOptions(context = getRuleContext()) {
  return [
    ...getConstructibleFoundationActionTypes("building", context)
      .map((type) => createFoundationConstructibleDescriptor("building", type)),
    ...getConstructibleFoundationActionTypes("vehicle", context)
      .map((type) => createFoundationConstructibleDescriptor("vehicle", type)),
  ].filter(Boolean);
}

function getFoundationConstructibleIcon(constructible) {
  if (!constructible) {
    return "•";
  }

  return constructible.kind === "vehicle"
    ? getVehicleTypeIcon(constructible.type)
    : getFoundationBuildingTypeIcon(constructible.type);
}

function getFoundationConstructibleLabel(constructible) {
  if (!constructible) {
    return "";
  }

  return constructible.kind === "vehicle"
    ? getVehicleLabel(constructible.type)
    : getBuildingLabel(constructible.type);
}

function getSelectedFoundationConstructible() {
  const availableOptions = getFoundationConstructibleOptions();

  if (availableOptions.length === 0) {
    return null;
  }

  if (!availableOptions.some((option) => option.id === selectedFoundationConstructibleId)) {
    selectedFoundationConstructibleId = availableOptions[0].id;
  }

  return availableOptions.find((option) => option.id === selectedFoundationConstructibleId) || availableOptions[0];
}

function setSelectedFoundationConstructible(id) {
  const normalized = parseFoundationConstructibleId(id);

  if (!normalized || !getFoundationConstructibleOptions().some((option) => option.id === normalized.id)) {
    return false;
  }

  selectedFoundationConstructibleId = normalized.id;
  updateFoundationActionMenu();
  draw();
  return true;
}

function getConstructibleConstructionCost(kind, type, context = getRuleContext()) {
  return getConstructibleConstructionCostForKind(kind, type, context);
}

function isConstructibleTypeWalkable(kind, type, context = getRuleContext()) {
  return isConstructibleWalkableForKind(kind, type, context);
}

function getBuildingAbandonedDecay(type, context = getRuleContext()) {
  const decay = Number(getEffectiveConstructibleRules("building", type, context)?.abandonedDecayPerTurn);

  if (!Number.isFinite(decay)) {
    return 0;
  }

  return clamp(decay, 0, 1);
}

function getBuildingWorkCompletenessDelta(taskType, buildingType) {
  const workPoints = getUnitWorkPointsPerTurn(taskType);
  const cost = getConstructibleConstructionCost("building", buildingType);

  if (workPoints <= 0 || cost <= 0) {
    return 0;
  }

  return clamp(workPoints / cost, 0, 1);
}

function getConstructionWorkCompletenessDelta(taskType, structure) {
  if (!structure) {
    return 0;
  }

  const workPoints = getUnitWorkPointsPerTurn(taskType);
  const cost = getConstructibleConstructionCost(structure.riderUnitId !== undefined ? "vehicle" : "building", structure.type);

  if (workPoints <= 0 || cost <= 0) {
    return 0;
  }

  return clamp(workPoints / cost, 0, 1);
}

function getSaveSlotNames() {
  return getSaveSlotEntries().map((entry) => entry.name);
}

function getSaveSlotEntries() {
  const entries = [];

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (!key || !key.startsWith(storageKeys.filePrefix)) continue;

      const name = decodeURIComponent(key.slice(storageKeys.filePrefix.length));
      const raw = window.localStorage.getItem(key);
      let parsed = null;
      let isValidJson = false;

      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw);
          isValidJson = true;
        } catch (error) {
          parsed = null;
        }
      }

      entries.push({
        name,
        raw: typeof raw === "string" ? raw : null,
        parsed,
        isValidJson,
        isCompatible: isCompatibleSaveState(parsed),
      });
    }
  } catch (error) {
    console.warn("Could not enumerate save slots.", error);
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name, currentLanguage));
}

function closeGameActionMenu({ restoreFocus = false } = {}) {
  if (gameActionMenu) {
    gameActionMenu.hidden = true;
  }

  for (const button of gameMenuToggleButtons) {
    button.setAttribute("aria-expanded", "false");
  }

  if (restoreFocus && activeGameMenuButton) {
    activeGameMenuButton.focus({ preventScroll: true });
  }

  activeGameMenuButton = null;
}

function positionGameActionMenu(button) {
  if (!button || !gameActionMenu) return;

  const rect = button.getBoundingClientRect();
  const margin = 8;
  const menuWidth = gameActionMenu.offsetWidth || 180;
  const menuHeight = gameActionMenu.offsetHeight || 152;
  const left = clamp(rect.right - menuWidth, margin, window.innerWidth - menuWidth - margin);
  const top = clamp(rect.bottom + 8, margin, window.innerHeight - menuHeight - margin);

  gameActionMenu.style.left = `${left}px`;
  gameActionMenu.style.top = `${top}px`;
}

function openGameActionMenu(button) {
  if (!button || !gameActionMenu) return;

  activeGameMenuButton = button;
  gameActionMenu.hidden = false;
  positionGameActionMenu(button);

  for (const toggleButton of gameMenuToggleButtons) {
    toggleButton.setAttribute("aria-expanded", toggleButton === button ? "true" : "false");
  }

  gameActionMenu.querySelector('.game-action-item:not([hidden]):not(:disabled)')?.focus({ preventScroll: true });
}

function toggleGameActionMenu(button) {
  if (!button || !gameActionMenu) return;

  if (!gameActionMenu.hidden && activeGameMenuButton === button) {
    closeGameActionMenu({ restoreFocus: true });
    return;
  }

  openGameActionMenu(button);
}

function closeSaveSlotPanel({ restoreFocus = false } = {}) {
  if (saveSlotOverlay) {
    saveSlotOverlay.hidden = true;
  }

  if (restoreFocus && slotPanelState?.returnFocusButton) {
    slotPanelState.returnFocusButton.focus({ preventScroll: true });
  }

  slotPanelState = null;
}

function getBookPageDefinition(pageNumber) {
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return null;
  }

  return bookDocument.pages[pageNumber - 1] || null;
}

function getBookPageNumberById(pageId) {
  if (typeof pageId !== "string" || !pageId.trim()) {
    return null;
  }

  const index = bookDocument.pages.findIndex((page) => page?.id === pageId.trim());
  return index >= 0 ? index + 1 : null;
}

function renderSaveSlotList() {
  if (!saveSlotList || !saveSlotEmpty) return;

  const saveEntries = getSaveSlotEntries();
  saveSlotList.replaceChildren();
  saveSlotEmpty.hidden = saveEntries.length > 0;

  for (const entry of saveEntries) {
    const button = document.createElement("button");
    const isSelected = slotPanelState?.value === entry.name;
    const nameSpan = document.createElement("span");
    const metaSpan = document.createElement("span");
    let metaText = "";

    button.type = "button";
    button.className = "slot-panel-item";
    nameSpan.className = "slot-panel-item-name";
    nameSpan.textContent = entry.name;
    metaSpan.className = "slot-panel-item-meta";

    if (!entry.isValidJson) {
      metaText = strings.saveSlots.invalidTag;
    } else if (!entry.isCompatible) {
      metaText = strings.saveSlots.obsoleteTag;
    }

    metaSpan.textContent = metaText;
    button.dataset.slotName = entry.name;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", isSelected ? "true" : "false");
    button.append(nameSpan);

    if (metaText) {
      button.append(metaSpan);
    }

    saveSlotList.append(button);
  }
}

function updateSaveSlotPanel() {
  if (!slotPanelState || !saveSlotOverlay || !saveSlotTitle || !saveSlotInput) return;

  if (slotPanelState.mode === "load") {
    saveSlotTitle.textContent = strings.saveSlots.loadTitle;
    setTextContent(confirmSlotPanelButtons, strings.actions.load);
  } else if (slotPanelState.mode === "export") {
    saveSlotTitle.textContent = strings.saveSlots.importExportTitle;
    setTextContent(confirmSlotPanelButtons, strings.actions.export);
  } else {
    saveSlotTitle.textContent = strings.saveSlots.saveAsTitle;
    setTextContent(confirmSlotPanelButtons, strings.actions.save);
  }

  for (const button of importSlotPanelButtons) {
    button.hidden = slotPanelState.mode !== "export";
  }

  saveSlotInput.value = slotPanelState.value || "";
  renderSaveSlotList();
}

function openSaveSlotPanel(mode, { targetMode = interactionMode, initialValue = null } = {}) {
  const returnFocusButton = activeGameMenuButton;
  closeGameActionMenu();

  slotPanelState = {
    mode,
    targetMode,
    value: initialValue ?? getCurrentFileName(targetMode) ?? "",
    returnFocusButton,
  };

  if (saveSlotOverlay) {
    saveSlotOverlay.hidden = false;
  }

  updateSaveSlotPanel();
  requestAnimationFrame(() => {
    saveSlotInput?.focus({ preventScroll: true });
    saveSlotInput?.select();
  });
}

async function commitSaveSlotPanel() {
  if (!slotPanelState) return false;

  const targetMode = slotPanelState.targetMode || interactionMode;

  if (!targetMode) return false;

  const fileName = sanitizeFileName(saveSlotInput?.value || slotPanelState.value || "");

  if (!fileName) {
    window.alert(strings.messages.missingSaveName);
    return false;
  }

  if (slotPanelState.mode === "load") {
    const existingState = readSaveFile(fileName);

    if (!existingState) {
      window.alert(strings.messages.saveNotFound(fileName));
      return false;
    }

    if (!isCompatibleSaveState(existingState)) {
      window.alert(strings.messages.obsoleteSave(fileName));
      return false;
    }

    await ensureVisualAssetsLoaded();

    if ((mainMenuOpen || interactionMode !== targetMode) && Object.values(interactionModes).includes(targetMode)) {
      setInteractionMode(targetMode);
    }

    if (!loadFileIntoMode(fileName, targetMode)) {
      window.alert(strings.messages.obsoleteSave(fileName));
      return false;
    }
  } else if (slotPanelState.mode === "export") {
    if (!(await exportSaveFile(fileName))) {
      return false;
    }
  } else {
    if (!saveStateToFile(fileName, targetMode)) {
      return false;
    }
  }

  closeSaveSlotPanel();
  return true;
}

async function requestPersistentStorage() {
  if (typeof navigator.storage?.persist !== "function") return false;

  try {
    return await navigator.storage.persist();
  } catch (error) {
    console.warn("Could not request persistent storage.", error);
    return false;
  }
}

const quantityEpsilon = 1e-6;

function roundDisplayedNumber(value, fallback = 0) {
  const number = Number(value);
  return Math.round(Number.isFinite(number) ? number : fallback);
}

function roundDisplayedQuantity(value, fallback = 0) {
  return Math.max(0, roundDisplayedNumber(value, fallback));
}

function formatDisplayedNumber(value, fallback = 0) {
  return String(roundDisplayedNumber(value, fallback));
}

function formatDisplayedQuantity(value, fallback = 0) {
  return String(roundDisplayedQuantity(value, fallback));
}

function hasSufficientQuantity(available, required) {
  return Number(available) + quantityEpsilon >= Number(required);
}

function getConfiguredUnitTypes() {
  const configured = rules.units?.types;
  return configured && typeof configured === "object" ? configured : {};
}

function mergeRuleRequirements(baseRequirements, overrideRequirements) {
  const base = baseRequirements && typeof baseRequirements === "object" ? baseRequirements : {};
  const override = overrideRequirements && typeof overrideRequirements === "object" ? overrideRequirements : {};
  const requiredTechs = [...new Set([...(base.requiredTechs || []), ...(override.requiredTechs || [])])];
  const requiredEvents = [...new Set([...(base.requiredEvents || []), ...(override.requiredEvents || [])])];
  const requiredUnitsPresent = [...new Set([...(base.requiredUnitsPresent || []), ...(override.requiredUnitsPresent || [])])];
  const requiredUnitsAbsent = [...new Set([...(base.requiredUnitsAbsent || []), ...(override.requiredUnitsAbsent || [])])];
  const requiredBuildingsMin = {
    ...(base.requiredBuildingsMin || {}),
    ...(override.requiredBuildingsMin || {}),
  };

  return {
    ...(requiredTechs.length > 0 ? { requiredTechs } : {}),
    ...(requiredEvents.length > 0 ? { requiredEvents } : {}),
    ...(Object.keys(requiredBuildingsMin).length > 0 ? { requiredBuildingsMin } : {}),
    ...(requiredUnitsPresent.length > 0 ? { requiredUnitsPresent } : {}),
    ...(requiredUnitsAbsent.length > 0 ? { requiredUnitsAbsent } : {}),
    ...(Number.isFinite(override.nextUnitNumberEquals)
      ? { nextUnitNumberEquals: override.nextUnitNumberEquals }
      : Number.isFinite(base.nextUnitNumberEquals)
        ? { nextUnitNumberEquals: base.nextUnitNumberEquals }
        : {}),
  };
}

function mergeUnitActionRequirements(baseRequirements, overrideRequirements) {
  const base = baseRequirements && typeof baseRequirements === "object" ? baseRequirements : {};
  const override = overrideRequirements && typeof overrideRequirements === "object" ? overrideRequirements : {};
  const merged = {};

  for (const actionId of new Set([...Object.keys(base), ...Object.keys(override)])) {
    const requirements = mergeRuleRequirements(base[actionId], override[actionId]);

    if (Object.keys(requirements).length > 0) {
      merged[actionId] = requirements;
    }
  }

  return merged;
}

function cloneUnitConfigForEvaluation(config) {
  const base = config && typeof config === "object" ? config : {};

  return {
    ...base,
    allowedActions: Array.isArray(base.allowedActions) ? [...base.allowedActions] : undefined,
    availability: base.availability ? { ...base.availability } : undefined,
    actionRequirements: base.actionRequirements
      ? Object.fromEntries(
        Object.entries(base.actionRequirements).map(([actionId, requirements]) => [
          actionId,
          requirements ? { ...requirements } : {},
        ]),
      )
      : undefined,
    workPointsPerTurn: base.workPointsPerTurn ? { ...base.workPointsPerTurn } : undefined,
    modifiers: Array.isArray(base.modifiers) ? [...base.modifiers] : undefined,
  };
}

function applyUnitConfigModifiers(config, context = getRuleContext()) {
  const resolved = cloneUnitConfigForEvaluation(config);
  const modifiers = Array.isArray(resolved.modifiers) ? resolved.modifiers : [];

  for (const modifier of modifiers) {
    if (!modifier || !matchesRequirements(modifier.when, context)) {
      continue;
    }

    const set = modifier.set && typeof modifier.set === "object" ? modifier.set : null;

    if (set) {
      if (typeof set.name === "string" && set.name.trim()) {
        resolved.name = set.name.trim();
      }

      if (Number.isFinite(set.stamina)) {
        resolved.stamina = set.stamina;
      }

      if (Number.isFinite(set.foodConsumptionPerTurn)) {
        resolved.foodConsumptionPerTurn = set.foodConsumptionPerTurn;
      }

      if (Number.isFinite(set.researchPointsPerTurn)) {
        resolved.researchPointsPerTurn = set.researchPointsPerTurn;
      }

      if (Array.isArray(set.allowedActions)) {
        resolved.allowedActions = [...set.allowedActions];
      }

      if (set.workPointsPerTurn && typeof set.workPointsPerTurn === "object") {
        resolved.workPointsPerTurn = {
          ...(resolved.workPointsPerTurn || {}),
          ...set.workPointsPerTurn,
        };
      }

      if (set.actionRequirements && typeof set.actionRequirements === "object") {
        resolved.actionRequirements = mergeUnitActionRequirements(
          resolved.actionRequirements,
          set.actionRequirements,
        );
      }
    }

    if (Array.isArray(modifier.addActions) && modifier.addActions.length > 0) {
      resolved.allowedActions = [
        ...new Set([...(Array.isArray(resolved.allowedActions) ? resolved.allowedActions : []), ...modifier.addActions]),
      ];
    }

    if (Array.isArray(modifier.removeActions) && modifier.removeActions.length > 0) {
      const removed = new Set(modifier.removeActions);
      resolved.allowedActions = (Array.isArray(resolved.allowedActions) ? resolved.allowedActions : []).filter(
        (action) => !removed.has(action),
      );
    }
  }

  return resolved;
}

function getDefinedUnitTypeIds() {
  return Object.keys(getConfiguredUnitTypes()).filter((typeId) => Boolean(typeId));
}

function hasDefinedUnitType(typeId) {
  return typeof typeId === "string" && getDefinedUnitTypeIds().includes(typeId.trim());
}

function getDefaultUnitTypeId() {
  const configured = typeof rules.units?.default?.typeId === "string" ? rules.units.default.typeId.trim() : "";

  if (configured && hasDefinedUnitType(configured)) {
    return configured;
  }

  const [firstTypeId] = getDefinedUnitTypeIds();
  return firstTypeId || "default";
}

function normalizeUnitTypeId(unitTypeId) {
  const normalized = typeof unitTypeId === "string" ? unitTypeId.trim() : "";

  if (normalized && hasDefinedUnitType(normalized)) {
    return normalized;
  }

  return getDefaultUnitTypeId();
}

function getUnitTypeId(currentUnit = unit) {
  return normalizeUnitTypeId(currentUnit?.unitType);
}

function getResolvedUnitConfig(unitOrTypeId = getDefaultUnitTypeId()) {
  const typeId =
    typeof unitOrTypeId === "string"
      ? normalizeUnitTypeId(unitOrTypeId)
      : getUnitTypeId(unitOrTypeId);
  const defaultConfig = rules.units?.default && typeof rules.units.default === "object"
    ? rules.units.default
    : {};
  const typeConfig = getConfiguredUnitTypes()[typeId] || {};

  return {
    ...defaultConfig,
    ...typeConfig,
    availability: mergeRuleRequirements(defaultConfig.availability, typeConfig.availability),
    actionRequirements: mergeUnitActionRequirements(defaultConfig.actionRequirements, typeConfig.actionRequirements),
    workPointsPerTurn: {
      ...(defaultConfig.workPointsPerTurn || {}),
      ...(typeConfig.workPointsPerTurn || {}),
    },
    modifiers: [
      ...(Array.isArray(defaultConfig.modifiers) ? defaultConfig.modifiers : []),
      ...(Array.isArray(typeConfig.modifiers) ? typeConfig.modifiers : []),
    ],
  };
}

function getEffectiveUnitConfig(unitOrTypeId = getDefaultUnitTypeId(), context = getRuleContext()) {
  return applyUnitConfigModifiers(getResolvedUnitConfig(unitOrTypeId), context);
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

function getUnitSpriteTypeId(unitOrTypeId = unit) {
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

function getUnitSpriteConfig(unitOrTypeId = unit) {
  const allSpriteConfigs = getAllUnitSpriteConfigs();
  const defaultConfig = allSpriteConfigs[getDefaultUnitSpriteTypeId()] || Object.values(allSpriteConfigs)[0] || null;
  const specificConfig = allSpriteConfigs[getUnitSpriteTypeId(unitOrTypeId)] || defaultConfig;

  if (!defaultConfig || !specificConfig) {
    return null;
  }

  return mergeSpriteConfigs(defaultConfig, specificConfig);
}

function getUnitSpriteIcon(unitOrTypeId = unit, spriteConfig = getUnitSpriteConfig(unitOrTypeId)) {
  return getSpriteResolvedImagePath(
    getFirstResolvedSpriteSource(spriteConfig, spriteDirectionalSourceCandidateSets.stationary, "W"),
  );
}

function getMountedRenderConfig(currentUnit = unit) {
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

function getMountedSpriteLayerConfig(currentUnit = unit, layerKey = "unit") {
  const mountedRenderConfig = getMountedRenderConfig(currentUnit);
  return mountedRenderConfig?.[layerKey] || null;
}

function getMountedVehicleSpriteConfig(currentUnit = unit) {
  return getRenderedSpriteConfig(currentUnit, { layerKey: "vehicle" });
}

function getRenderedSpriteConfig(
  currentUnit = unit,
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

function getRenderedUnitSpriteConfig(currentUnit = unit) {
  return getRenderedSpriteConfig(currentUnit, {
    layerKey: "unit",
    baseConfig: getUnitSpriteConfig,
    suppressMountedLayer: currentUnit?.move?.mode === "dismount",
  });
}

function serializeCell(cell) {
  return {
    type: cell.type,
    variant: ensureCellVariant(cell),
    visited: Boolean(cell.visited),
    visitsCount: Math.max(0, clampInteger(cell.visitsCount, 0, getCellPathWellKnownVisitsThreshold(cell), 0)),
    materialAmount: clampNonNegativeNumber(cell.materialAmount, 999999, 0),
    foodType: typeof cell.foodType === "string" && cell.foodType ? cell.foodType : null,
    foodCapacity: getCellFoodMaxAmount(cell),
    foodAmount: clampNonNegativeNumber(cell.foodAmount, 999999, 0),
  };
}

function serializeSimpleUnitTask(taskType) {
  return { type: taskType };
}

function serializeTargetedUnitTask(task, taskType) {
  return {
    type: taskType,
    toX: clampInteger(task?.toX, 0, map.width - 1, 0),
    toY: clampInteger(task?.toY, 0, map.height - 1, 0),
  };
}

function serializeGatherUnitTask(task, taskType) {
  return {
    type: taskType,
    toX: clampInteger(task?.toX, 0, map.width - 1, 0),
    toY: clampInteger(task?.toY, 0, map.height - 1, 0),
    turnsRemaining: clampInteger(task?.turnsRemaining, 1, getGatherTaskDurationTurns(), getGatherTaskDurationTurns()),
  };
}

function normalizeLayFoundationTaskSubject(task) {
  return {
    subjectKind: task?.subjectKind === "vehicle" ? "vehicle" : "building",
    subjectType:
      typeof task?.subjectType === "string" && task.subjectType.trim()
        ? task.subjectType.trim()
        : (typeof task?.buildingType === "string" ? task.buildingType : "house"),
  };
}

function serializeLayFoundationUnitTask(task, taskType) {
  const { subjectKind, subjectType } = normalizeLayFoundationTaskSubject(task);

  return {
    ...serializeTargetedUnitTask(task, taskType),
    subjectKind,
    subjectType,
  };
}

function serializeTask(task) {
  const spec = getUnitActionSpec(task);

  return spec?.serializeTask ? spec.serializeTask(task) : null;
}

function serializeStockpileState() {
  return {
    stone: getCurrentStockpileAmount("stone"),
    lumber: getCurrentStockpileAmount("lumber"),
    food: getCurrentStockpileAmount("food"),
  };
}

function serializeSituationMessage(entry) {
  if (!entry || typeof entry.kind !== "string") {
    return null;
  }

  return createSituationMessageEntry(
    entry.kind,
    {
      unitName: entry.unitName,
      current: entry.current,
      threshold: entry.threshold,
    },
    clampInteger(entry.turn, 1, 999999, currentTurn),
    clampInteger(entry.id, 1, 999999999, 1),
  );
}

function serializeSituationMessages(entries = situationMessages) {
  return entries.map((entry) => serializeSituationMessage(entry)).filter(Boolean);
}

function serializeResearchState(state = researchState) {
  return {
    discoveredTechIds: Array.isArray(state?.discoveredTechIds) ? [...state.discoveredTechIds] : [],
    progressByTechId: normalizeResearchProgressByTechId(state?.progressByTechId),
    selectedGoalTechId:
      typeof state?.selectedGoalTechId === "string" && state.selectedGoalTechId.trim()
        ? state.selectedGoalTechId.trim()
        : null,
    eventFlags: normalizeResearchEventFlags(state?.eventFlags),
  };
}

function serializeUnit(currentUnit) {
  if (!currentUnit) return null;

  if (currentUnit.move) {
    const didReachDestination =
      isTaskAction(currentUnit.task, unitActions.walk) &&
      currentUnit.task.toX === currentUnit.move.toX &&
      currentUnit.task.toY === currentUnit.move.toY;

    return {
      id: currentUnit.id || "unit_01",
      unitType: getUnitTypeId(currentUnit),
      name: normalizeUnitName(currentUnit.name),
      x: currentUnit.move.toX,
      y: currentUnit.move.toY,
      facing: currentUnit.move.direction || currentUnit.facing || "west",
      homeBuildingId: getUnitHomeBuildingId(currentUnit),
      mountedVehicleId: normalizeLinkedEntityId(currentUnit.mountedVehicleId),
      staminaMax: getUnitMaxStamina(currentUnit),
      stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
      task: didReachDestination ? null : serializeTask(currentUnit.task),
    };
  }

  return {
    id: currentUnit.id || "unit_01",
    unitType: getUnitTypeId(currentUnit),
    name: normalizeUnitName(currentUnit.name),
    x: currentUnit.x,
    y: currentUnit.y,
    facing: currentUnit.facing || "west",
    homeBuildingId: getUnitHomeBuildingId(currentUnit),
    mountedVehicleId: normalizeLinkedEntityId(currentUnit.mountedVehicleId),
    staminaMax: getUnitMaxStamina(currentUnit),
    stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
    task: serializeTask(currentUnit.task),
  };
}

function serializeCells(cells = map.cells) {
  return cells.map((row) => row.map((cell) => serializeCell(cell)));
}

function serializeConstructibles(kind, items = getConstructibleCollectionForKind(kind), width = map.width, height = map.height) {
  return items.map((constructible) => serializeConstructibleForKind(kind, constructible, width, height)).filter(Boolean);
}

function serializeCurrentState() {
  return {
    version: saveVersion,
    map: {
      width: map.width,
      height: map.height,
      cells: serializeCells(),
    },
    buildings: serializeConstructibles("building"),
    vehicles: serializeConstructibles("vehicle"),
    units: getUnits().map((currentUnit) => serializeUnit(currentUnit)).filter(Boolean),
    stockpile: serializeStockpileState(),
    research: serializeResearchState(),
    situationMessages: serializeSituationMessages(),
    foodShortageTurns: Math.max(0, clampInteger(foodShortageTurns, 0, 999999, 0)),
    turn: currentTurn,
    autoAdvanceTurns,
  };
}

function writeSaveFile(fileName, state) {
  const storageKey = getSaveFileKey(fileName);

  if (!storageKey) return false;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn(`Could not save file ${fileName}.`, error);
    return false;
  }
}

function writeRawSaveFile(fileName, rawContents) {
  const storageKey = getSaveFileKey(fileName);

  if (!storageKey || typeof rawContents !== "string") return false;

  try {
    window.localStorage.setItem(storageKey, rawContents);
    return true;
  } catch (error) {
    console.warn(`Could not write raw save file ${fileName}.`, error);
    return false;
  }
}

function saveStateToFile(fileName, mode = interactionMode) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return false;

  const didSave = writeSaveFile(normalizedName, serializeCurrentState());

  if (!didSave) return false;

  writeCurrentFileName(mode, normalizedName);
  if (mode === interactionModes.edit) {
    setEditStateDirty(false);
  }
  updatePersistenceControls();
  return true;
}

function readSaveFile(fileName) {
  const storageKey = getSaveFileKey(fileName);

  if (!storageKey) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not load file ${fileName}.`, error);
    return null;
  }
}

function readRawSaveFile(fileName) {
  const storageKey = getSaveFileKey(fileName);

  if (!storageKey) return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    return typeof raw === "string" ? raw : null;
  } catch (error) {
    console.warn(`Could not load raw save file ${fileName}.`, error);
    return null;
  }
}

function isCompatibleSaveState(state) {
  return Boolean(state) && state.version === saveVersion;
}

async function showImportFilePicker() {
  if (typeof window.showOpenFilePicker === "function") {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: "JSON save files",
          accept: { "application/json": [".json"] },
        },
      ],
    });

    if (!handle) return null;

    const file = await handle.getFile();
    return file || null;
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.append(input);

    const cleanup = () => {
      input.remove();
    };

    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0] || null;
        cleanup();
        resolve(file);
      },
      { once: true },
    );
    input.addEventListener(
      "cancel",
      () => {
        cleanup();
        resolve(null);
      },
      { once: true },
    );

    input.click();
  });
}

async function saveTextFileToDisk(fileName, rawContents) {
  if (typeof window.showSaveFilePicker === "function") {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${fileName}.json`,
      types: [
        {
          description: "JSON save files",
          accept: { "application/json": [".json"] },
        },
      ],
    });

    if (!handle) return false;

    const writable = await handle.createWritable();
    await writable.write(rawContents);
    await writable.close();
    return true;
  }

  const blob = new Blob([rawContents], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `${fileName}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
  return true;
}

async function exportSaveFile(fileName) {
  const raw = readRawSaveFile(fileName);

  if (!raw) {
    window.alert(strings.messages.saveNotFound(fileName));
    return false;
  }

  try {
    await saveTextFileToDisk(fileName, raw);
    return true;
  } catch (error) {
    console.warn(`Could not export save file ${fileName}.`, error);
    return false;
  }
}

async function importSaveIntoSlot(fileName) {
  let file = null;

  try {
    file = await showImportFilePicker();
  } catch (error) {
    console.warn("Could not open import file picker.", error);
    return false;
  }

  if (!file) {
    return false;
  }

  const fallbackName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const normalizedName = sanitizeFileName(fileName) || fallbackName;

  if (!normalizedName) {
    window.alert(strings.messages.missingSaveName);
    return false;
  }

  let rawContents = "";

  try {
    rawContents = await file.text();
  } catch (error) {
    console.warn("Could not read imported save file.", error);
    return false;
  }

  let parsed = null;

  try {
    parsed = JSON.parse(rawContents);
  } catch (error) {
    window.alert(strings.messages.invalidImportFile);
    return false;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    window.alert(strings.messages.invalidSaveData);
    return false;
  }

  if (!writeRawSaveFile(normalizedName, JSON.stringify(parsed, null, 2))) {
    return false;
  }

  if (slotPanelState) {
    slotPanelState.value = normalizedName;
    saveSlotInput.value = normalizedName;
  }

  renderSaveSlotList();
  updatePersistenceControls();
  return true;
}

function buildGeneratedMapCells(
  width = defaultMapConfig.width,
  height = defaultMapConfig.height,
) {
  const cells = [];

  for (let y = 0; y < height; y += 1) {
    const row = [];

    for (let x = 0; x < width; x += 1) {
      const riverCenter = 8 + Math.sin(y * 0.38) * 4 + y * 0.34;
      const lakeA = distance(x, y, 31, 13) < 4.2;
      const lakeB = distance(x, y, 9, 42) < 3.5;
      const river = Math.abs(x - riverCenter) < 1.1 && y > 3 && y < height - 3;
      const northWater = y < 3 && x < 18 + y * 3;
      const eastWater = x > width - 5 && y > 19 && y < 34;
      const mountainBand =
        (x > 24 && y > 24 && (x + y) % 3 !== 0) ||
        (x > 17 && x < 27 && y > 6 && y < 13 && (x + y) % 4 !== 0);
      const forestBand =
        ((x + y) % 7 === 0 && y > 4) ||
        (x > 4 && x < 15 && y > 20 && y < 52 && (x * 2 + y) % 5 !== 0);

      let type = "grass";
      if (river || lakeA || lakeB || northWater || eastWater) type = "water";
      else if (mountainBand) type = "mountain";
      else if (forestBand) type = "forest";

      row.push(createCell(x, y, type));
    }

    cells.push(row);
  }

  return cells;
}

function buildEmptyMapCells(
  width = defaultMapConfig.width,
  height = defaultMapConfig.height,
) {
  const cells = [];

  for (let y = 0; y < height; y += 1) {
    const row = [];

    for (let x = 0; x < width; x += 1) {
      row.push(initializeCellResources(createCell(x, y, "grass"), { rollFood: false }));
    }

    cells.push(row);
  }

  return cells;
}

function getCellInCells(cells, width, height, x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return null;
  return cells[y]?.[x] || null;
}

function getNeighborCellInCells(cells, width, height, cell, direction) {
  if (!cell) return null;

  if (["northWest", "northEast", "southEast", "southWest"].includes(direction)) {
    const isOddRow = cell.y % 2 === 1;
    const offsets = {
      northWest: { x: isOddRow ? 0 : -1, y: -1 },
      northEast: { x: isOddRow ? 1 : 0, y: -1 },
      southEast: { x: isOddRow ? 1 : 0, y: 1 },
      southWest: { x: isOddRow ? 0 : -1, y: 1 },
    };
    const offset = offsets[direction];

    return getCellInCells(cells, width, height, cell.x + offset.x, cell.y + offset.y);
  }

  if (["north", "east", "south", "west"].includes(direction)) {
    const offsets = {
      north: { x: 0, y: -2 },
      east: { x: 1, y: 0 },
      south: { x: 0, y: 2 },
      west: { x: -1, y: 0 },
    };
    const offset = offsets[direction];

    return getCellInCells(cells, width, height, cell.x + offset.x, cell.y + offset.y);
  }

  return null;
}

function markCellsVisitedByUnits(cells, units) {
  if (!Array.isArray(cells) || !Array.isArray(units)) return;

  for (const currentUnit of units) {
    if (!currentUnit) continue;

    const cell = cells[currentUnit.y]?.[currentUnit.x];

    if (cell) {
      markCellVisitedByUnit(cell, { invalidate: false });
    }
  }
}

function createDefaultUnitState(cells, width, height, unitTypeId = getDefaultUnitTypeId()) {
  const unitType = normalizeUnitTypeId(unitTypeId);
  const spawn = findNearestPassableCellInCells(
    cells,
    width,
    height,
    Math.floor(width / 2),
    Math.floor(height / 2),
  );

  return spawn
      ? {
          id: "unit_01",
          unitType,
          name: getDefaultUnitName(unitType),
          x: spawn.x,
          y: spawn.y,
          facing: "west",
          homeBuildingId: null,
          mountedVehicleId: null,
          staminaMax: getDefaultUnitStamina(unitType),
          stamina: getDefaultUnitStamina(unitType),
          task: null,
          turnRoute: null,
        }
    : null;
}

function canCellHostConstructiblePlacement(kind, cell, allowedTerrains = null) {
  if (!cell) {
    return false;
  }

  const normalizedAllowedTerrains = Array.isArray(allowedTerrains) && allowedTerrains.length > 0
    ? allowedTerrains
    : ["grass"];

  return (
    normalizedAllowedTerrains.includes(cell.type) &&
    (normalizeConstructibleKind(kind) === "vehicle" || !hasFoodResource(cell)) &&
    !getBuildingAtCell(cell.x, cell.y) &&
    !getVehicleAtCell(cell.x, cell.y) &&
    !getUnitAtCell(cell.x, cell.y)
  );
}

function canPlaceNewConstructibleConstructionOnCellForKind(kind, originCell, type) {
  const placementEntries = getConstructiblePlacementEntriesForKind(kind, originCell, type);

  if (placementEntries.length === 0) {
    return false;
  }

  return placementEntries.every(({ cell, allowedTerrains }) => canCellHostConstructiblePlacement(kind, cell, allowedTerrains));
}

function canPlaceNewBuildingConstructionOnCell(originCell, type, currentUnit = null) {
  return canPlaceNewConstructibleConstructionOnCellForKind("building", originCell, type, currentUnit);
}

function canPlaceNewVehicleConstructionOnCell(originCell, type, currentUnit = null) {
  return canPlaceNewConstructibleConstructionOnCellForKind("vehicle", originCell, type, currentUnit);
}

function markBuildingCellsVisited(building) {
  markConstructibleCellsVisitedForKind("building", building);
}

function markVehicleCellsVisited(vehicle) {
  markConstructibleCellsVisitedForKind("vehicle", vehicle);
}

function createBuildingConstructionAtCell(cell, type = "house", { spendResources = true } = {}) {
  return createConstructibleConstructionAtCellForKind("building", cell, type, { spendResources });
}

function createHouseConstructionAtCell(cell) {
  return createBuildingConstructionAtCell(cell, "house");
}

function createVehicleConstructionAtCell(cell, type, { spendResources = true } = {}) {
  return createConstructibleConstructionAtCellForKind("vehicle", cell, type, { spendResources });
}

function canAffordConstructibleConstruction(constructible, context = getRuleContext()) {
  if (!constructible) {
    return false;
  }

  return canAffordConstructibleType(constructible.kind, constructible.type, context);
}

function canPlaceNewConstructibleConstructionOnCell(originCell, constructible, currentUnit = null) {
  if (!constructible) {
    return false;
  }

  return constructible.kind === "vehicle"
    ? canPlaceNewVehicleConstructionOnCell(originCell, constructible.type, currentUnit)
    : canPlaceNewBuildingConstructionOnCell(originCell, constructible.type, currentUnit);
}

function getConstructiblePlacementCells(originCell, constructible) {
  if (!constructible) {
    return [];
  }

  return getConstructiblePlacementCellsForKind(constructible.kind, originCell, constructible.type);
}

function isMultiTileConstructible(constructible) {
  if (!constructible) {
    return false;
  }

  return getConstructibleDimensionForKind(constructible.kind, constructible.type, "width") > 1
    || getConstructibleDimensionForKind(constructible.kind, constructible.type, "height") > 1;
}

function createConstructibleConstructionAtCell(cell, constructible, options = {}) {
  if (!constructible) {
    return null;
  }

  return createConstructibleConstructionAtCellForKind(constructible.kind, cell, constructible.type, options);
}

function markCellVisitedByUnit(cell, { invalidate = true } = {}) {
  if (!cell) {
    return false;
  }

  let changed = false;

  if (!cell.visited) {
    cell.visited = true;
    changed = true;
  }

  if (cell.type === "grass") {
      const nextVisitsCount = Math.min(
      getCellPathWellKnownVisitsThreshold(cell),
      getCellVisitsCount(cell) + 1,
    );

    if (nextVisitsCount !== getCellVisitsCount(cell)) {
      cell.visitsCount = nextVisitsCount;
      changed = true;
    }
  }

  if (changed && invalidate) {
    invalidateStaticLayer();
  }

  return changed;
}

function createDefaultBuildingsState(cells, width, height, units) {
  const spawnUnit = Array.isArray(units) ? units[0] : null;

  if (!spawnUnit) return [];

  const spawnCell = getCellInCells(cells, width, height, spawnUnit.x, spawnUnit.y);

  if (!spawnCell) return [];

  const placementDirections = [
    "east",
    "west",
    "southEast",
    "southWest",
    "northEast",
    "northWest",
    "south",
    "north",
  ];
  const placementCells = [];
  const occupied = new Set([`${spawnUnit.x},${spawnUnit.y}`]);

  for (const direction of placementDirections) {
    const neighbor = getNeighborCellInCells(cells, width, height, spawnCell, direction);

    if (!getUnitCellPassabilityState(neighbor).terrainOrStructurePassable) continue;
    const key = `${neighbor.x},${neighbor.y}`;

    if (occupied.has(key)) continue;

    occupied.add(key);
    placementCells.push(neighbor);
  }

  if (placementCells.length === 0) return [];

  const previewBuildings = [
    {
      state: "complete",
      subtype: chooseConstructibleSubtypeForKind("building", "house") || "house_01",
      completeness: 1,
    },
  ];

  return previewBuildings
    .slice(0, placementCells.length)
    .map((preview, index) => {
      const cell = placementCells[index];

      return {
        id: `building_${String(index + 1).padStart(2, "0")}`,
        type: "house",
        subtype: preview.subtype,
        x: cell.x,
        y: cell.y,
        width: getDefaultConstructibleDimensionForKind("building", "width"),
        height: getDefaultConstructibleDimensionForKind("building", "height"),
        state: preview.state,
        walkable: isConstructibleTypeWalkable("building", "house"),
        completeness: preview.completeness,
        constructionCost: getConstructibleConstructionCost("building", "house"),
      };
    });
}

function markCellsVisitedByBuildings(cells, buildingsState) {
  if (!Array.isArray(cells) || !Array.isArray(buildingsState)) return;

  for (const building of buildingsState) {
    for (const occupiedCell of getConstructibleOccupiedCellsForKind("building", building)) {
      const cell = cells[occupiedCell.y]?.[occupiedCell.x];

      if (cell) {
        cell.visited = true;
      }
    }
  }
}

function createGeneratedState(mode, buildCells = buildGeneratedMapCells) {
  const width = defaultMapConfig.width;
  const height = defaultMapConfig.height;
  const cells = buildCells(width, height);
  const defaultUnit = createDefaultUnitState(cells, width, height);
  const units = defaultUnit ? [defaultUnit] : [];
  const defaultBuildings = createDefaultBuildingsState(cells, width, height, units);

  if (units[0] && defaultBuildings[0]) {
    units[0].homeBuildingId = defaultBuildings[0].id;
  }

  markCellsVisitedByUnits(cells, units);
  markCellsVisitedByBuildings(cells, defaultBuildings);

  return {
    version: saveVersion,
    map: {
      width,
      height,
      cells: serializeCells(cells),
    },
    buildings: serializeConstructibles("building", defaultBuildings, width, height),
    vehicles: [],
    units,
    stockpile: createEmptyStockpile(),
    research: createDefaultResearchState(),
    situationMessages: [createSituationMessageEntry("intro", {}, 1, 1)],
    foodShortageTurns: 0,
    turn: 1,
    autoAdvanceTurns: true,
  };
}

function createDefaultState(mode) {
  return createGeneratedState(mode, buildGeneratedMapCells);
}

function normalizeMapState(rawMap) {
  const width = clampInteger(rawMap?.width, 1, 512, defaultMapConfig.width);
  const height = clampInteger(rawMap?.height, 1, 512, defaultMapConfig.height);
  const generatedCells = buildGeneratedMapCells(width, height);

  if (!Array.isArray(rawMap?.cells)) {
    throw new Error("Missing map cell data.");
  }

  for (let y = 0; y < height; y += 1) {
    const sourceRow = Array.isArray(rawMap.cells[y]) ? rawMap.cells[y] : null;

    if (!sourceRow) {
      throw new Error("Missing map row.");
    }

    for (let x = 0; x < width; x += 1) {
      const sourceCell = sourceRow[x];

      if (!sourceCell || !terrain[sourceCell.type]) {
        throw new Error("Missing map cell.");
      }

      const cell = generatedCells[y][x];
      cell.type = sourceCell.type;
      if (typeof sourceCell.visited !== "boolean") {
        throw new Error("Missing explored state in map cell.");
      }
      cell.visited = sourceCell.visited;
      if (!Number.isFinite(sourceCell.visitsCount)) {
        throw new Error("Missing visits count in map cell.");
      }
      if (!Number.isFinite(sourceCell.materialAmount)) {
        throw new Error("Missing material amount in map cell.");
      }
      if (!(typeof sourceCell.foodType === "string" || sourceCell.foodType === null)) {
        throw new Error("Missing food type in map cell.");
      }
      if (!Number.isFinite(sourceCell.foodAmount)) {
        throw new Error("Missing food amount in map cell.");
      }

      const variants = getTerrainVariants(cell.type);
      const foodCapacity =
        typeof sourceCell.foodType === "string" && sourceCell.foodType
          ? clampNonNegativeNumber(sourceCell.foodCapacity, 999999, getFoodTypeMaxAmount(sourceCell.foodType))
          : 0;
      cell.variant = variants.some((variant) => variant.id === sourceCell.variant)
        ? sourceCell.variant
        : chooseTerrainVariant(cell.type);
      cell.visitsCount = Math.max(0, clampInteger(sourceCell.visitsCount, 0, getPathWellKnownVisitsThreshold(), 0));
      cell.materialAmount = clampNonNegativeNumber(sourceCell.materialAmount, 999999, 0);
      cell.foodType = sourceCell.foodType;
      cell.foodCapacity = foodCapacity;
      cell.foodAmount = clampNonNegativeNumber(sourceCell.foodAmount, 999999, 0);
      if (cell.foodAmount > foodCapacity) {
        cell.foodAmount = foodCapacity;
      }

      if (cell.foodType && !getFoodDefinition(cell.foodType)) {
        throw new Error("Unsupported food type in map cell.");
      }

      if (cell.foodType && getFoodDefinition(cell.foodType)?.terrain !== cell.type) {
        throw new Error("Food type does not match terrain.");
      }

      if (!cell.foodType && cell.foodAmount > 0) {
        throw new Error("Food amount present without food type.");
      }

      if (cell.type === "water" && cell.variant !== "water_01" && cell.foodType) {
        throw new Error("Food resource present on unsupported water tile.");
      }

      if (!["forest", "mountain"].includes(cell.type) && cell.materialAmount > 0) {
        throw new Error("Material resource present on unsupported terrain.");
      }
    }
  }

  return {
    width,
    height,
    cells: generatedCells,
  };
}

function findNearestPassableCellInCells(cells, width, height, startX, startY) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[y]?.[x];

      if (!getUnitCellPassabilityState(cell).terrainOrStructurePassable) continue;

      const cellDistance = distance(x, y, startX, startY);

      if (cellDistance >= bestDistance) continue;

      best = cell;
      bestDistance = cellDistance;
    }
  }

  return best;
}

function normalizeDirection(direction) {
  return [
    "northWest",
    "northEast",
    "southEast",
    "southWest",
    "north",
    "east",
    "south",
    "west",
  ].includes(direction)
    ? direction
    : "west";
}

function getNormalizedUnitTaskDestination(task, currentX, currentY) {
  const toX = clampInteger(task?.toX, 0, map.width - 1, currentX);
  const toY = clampInteger(task?.toY, 0, map.height - 1, currentY);
  const destinationCell = getCell(toX, toY);

  if (!destinationCell) {
    return null;
  }

  return { toX, toY, destinationCell };
}

function normalizeMoveUnitTask(task, { currentX, currentY, currentUnit } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!canAssignUnitMoveTarget(destinationCell, currentUnit)) {
    return null;
  }

  if (toX === currentX && toY === currentY) {
    return null;
  }

  return serializeTargetedUnitTask({ toX, toY }, "move");
}

function normalizeDismountUnitTask(task, { currentX, currentY, currentUnit } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
    return null;
  }

  if (
    !currentUnit?.mountedVehicleId ||
    !getUnitCellPassabilityState(destinationCell, currentUnit, {
      requireUnmounted: true,
      forbidVehicles: true,
    }).canOccupy
  ) {
    return null;
  }

  return serializeTargetedUnitTask({ toX, toY }, "dismount");
}

function normalizeGatherFoodUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY) || !hasGatherableFoodResource(destinationCell)) {
    return null;
  }

  return serializeGatherUnitTask({ ...task, toX, toY }, "gatherFood");
}

function normalizeGatherMaterialsUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY) || !hasMaterialResource(destinationCell)) {
    return null;
  }

  return serializeGatherUnitTask({ ...task, toX, toY }, "gatherMaterials");
}

function normalizeBuildHouseUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
    return null;
  }

  const structure = getConstructionEntityAtCell(destinationCell);

  if (!structure || structure.state !== "construction") {
    return null;
  }

  return serializeTargetedUnitTask({ toX, toY }, "buildHouse");
}

function normalizeLayFoundationUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
    return null;
  }

  const { subjectKind, subjectType } = normalizeLayFoundationTaskSubject(task);
  const hasValidSubject = Boolean(getConstructibleRules(subjectKind, subjectType));
  const validatedSubjectKind = hasValidSubject ? subjectKind : "building";
  const validatedSubjectType = hasValidSubject ? subjectType : "house";
  const structure = getConstructionEntityAtCell(destinationCell, {
    kind: validatedSubjectKind,
    type: validatedSubjectType,
  });

  if (!structure || structure.state !== "construction") {
    return null;
  }

  return serializeLayFoundationUnitTask({
    toX,
    toY,
    subjectKind: validatedSubjectKind,
    subjectType: validatedSubjectType,
  }, "layFoundation");
}

function normalizeDemolishUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY } = destination;

  if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
    return null;
  }

  const building = getBuildingAtCell(toX, toY);

  if (!building || building.state !== "abandoned") {
    return null;
  }

  return serializeTargetedUnitTask({ toX, toY }, "demolish");
}

function normalizeTask(task, currentX, currentY, currentUnit = null) {
  const spec = getUnitActionSpec(task);

  return spec?.normalizeTask
    ? spec.normalizeTask(task, { currentX, currentY, currentUnit })
    : null;
}

function preserveTask(task) {
  const spec = getUnitActionSpec(task);

  return spec?.preserveTask ? spec.preserveTask(task) : null;
}

function normalizeSituationMessage(entry, index = 0) {
  if (!entry || typeof entry.kind !== "string") {
    throw new Error("Missing situation message entry.");
  }

  if (!["intro", "houseStarted", "houseCompleted", "foodShortage", "foodRecovered", "unitLeft", "researchGoalMissing"].includes(entry.kind)) {
    throw new Error(`Unsupported situation message kind: ${entry.kind}`);
  }

  return createSituationMessageEntry(
    entry.kind,
    {
      unitName: entry.unitName,
      current: entry.current,
      threshold: entry.threshold,
    },
    clampInteger(entry.turn, 1, 999999, 1),
    clampInteger(entry.id, 1, 999999999, index + 1),
  );
}

function normalizeSituationMessagesState(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    throw new Error("Missing situation message data.");
  }

  return rawMessages.map((entry, index) => normalizeSituationMessage(entry, index));
}

function normalizeStockpileState(rawStockpile) {
  return {
    stone: clampNonNegativeNumber(rawStockpile?.stone, 999999, 0),
    lumber: clampNonNegativeNumber(rawStockpile?.lumber, 999999, 0),
    food: clampNonNegativeNumber(rawStockpile?.food, 999999, 0),
  };
}

function normalizeBuildingState(state) {
  return ["complete", "construction", "abandoned"].includes(state)
    ? state
    : "complete";
}

function normalizeConstructiblesState(kind, rawConstructibles, options = {}) {
  return normalizeConstructiblesStateForKind(kind, rawConstructibles, options);
}

function normalizeLinkedEntityId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeUnitsState(rawUnits, mode) {
  const sourceUnits = Array.isArray(rawUnits) ? rawUnits : [];

  if (sourceUnits.length === 0) {
    if (mode !== interactionModes.play) return [];

    const fallbackUnit = createDefaultUnitState(map.cells, map.width, map.height);
    return fallbackUnit
      ? [
          {
            ...fallbackUnit,
            selected: false,
            move: null,
            turnRoute: null,
            lastStepFromX: null,
            lastStepFromY: null,
          },
        ]
      : [];
  }
  const normalizedUnits = [];
  const occupiedKeys = new Set();

  for (let index = 0; index < sourceUnits.length; index += 1) {
    const sourceUnit = sourceUnits[index];
    const unitId = typeof sourceUnit?.id === "string" ? sourceUnit.id : `unit_${index + 1}`;
    const mountedVehicleId = normalizeLinkedEntityId(sourceUnit?.mountedVehicleId);
    let x = clampInteger(sourceUnit?.x, 0, map.width - 1, Math.floor(map.width / 2));
    let y = clampInteger(sourceUnit?.y, 0, map.height - 1, Math.floor(map.height / 2));
    let cell = getCell(x, y);
    const positionValidationUnit = {
      id: unitId,
      mountedVehicleId,
    };

    if (!canUnitEnter(cell, positionValidationUnit, occupiedKeys)) {
      const fallbackCell = findNearestPassableCell(x, y, positionValidationUnit, occupiedKeys);

      if (!fallbackCell) {
        continue;
      }

      x = fallbackCell.x;
      y = fallbackCell.y;
      cell = fallbackCell;
    }

    occupiedKeys.add(createCellKey(cell.x, cell.y));
    const unitType = normalizeUnitTypeId(sourceUnit?.unitType);

    const staminaMax = getDefaultUnitStamina(unitType);

    const normalizedUnit = {
      id: unitId,
      unitType,
      name: normalizeUnitName(sourceUnit?.name, unitType),
      x: cell.x,
      y: cell.y,
      facing: normalizeDirection(sourceUnit?.facing),
      homeBuildingId:
        typeof sourceUnit?.homeBuildingId === "string" && sourceUnit.homeBuildingId
          ? sourceUnit.homeBuildingId
          : null,
      mountedVehicleId,
      staminaMax,
      stamina: Math.max(0, clampNumber(sourceUnit?.stamina, 0, 999, staminaMax)),
      selected: false,
      task:
        mode !== interactionModes.play
          ? preserveTask(sourceUnit?.task)
          : normalizeTask(sourceUnit?.task, cell.x, cell.y, {
            id: unitId,
            mountedVehicleId,
          }),
      move: null,
      turnRoute: null,
      lastStepFromX: null,
      lastStepFromY: null,
    };

    if (isTaskAction(normalizedUnit.task, unitActions.research) && !getSelectedResearchGoalTechnologyId()) {
      normalizedUnit.task = null;
    }

    if (normalizedUnit.task && !canUnitUseAction(normalizedUnit, getTaskActionId(normalizedUnit.task))) {
      normalizedUnit.task = null;
    }

    normalizedUnits.push(normalizedUnit);
  }

  return normalizedUnits;
}

function reconcileMountedVehicleStateLinks(vehicleState = vehicles, unitState = units) {
  const vehiclesById = new Map();
  const unitsById = new Map();
  const requestedRiderByVehicleId = new Map();
  const claimedVehicleIds = new Set();
  const claimedUnitIds = new Set();

  for (const vehicle of vehicleState) {
    if (!vehicle?.id) {
      continue;
    }

    vehiclesById.set(vehicle.id, vehicle);
    requestedRiderByVehicleId.set(vehicle.id, normalizeLinkedEntityId(vehicle.riderUnitId));
    vehicle.riderUnitId = null;
  }

  for (const currentUnit of unitState) {
    if (!currentUnit?.id) {
      currentUnit.mountedVehicleId = null;
      continue;
    }

    currentUnit.mountedVehicleId = normalizeLinkedEntityId(currentUnit.mountedVehicleId);
    unitsById.set(currentUnit.id, currentUnit);
  }

  for (const currentUnit of unitState) {
    const vehicleId = currentUnit?.mountedVehicleId;

    if (!vehicleId || !currentUnit?.id) {
      currentUnit.mountedVehicleId = null;
      continue;
    }

    const vehicle = vehiclesById.get(vehicleId);

    if (!vehicle || claimedVehicleIds.has(vehicleId) || claimedUnitIds.has(currentUnit.id)) {
      currentUnit.mountedVehicleId = null;
      continue;
    }

    claimedVehicleIds.add(vehicleId);
    claimedUnitIds.add(currentUnit.id);
    vehicle.riderUnitId = currentUnit.id;
  }

  for (const vehicle of vehicleState) {
    if (!vehicle?.id || vehicle.riderUnitId) {
      continue;
    }

    const riderUnitId = requestedRiderByVehicleId.get(vehicle.id);

    if (!riderUnitId || claimedVehicleIds.has(vehicle.id) || claimedUnitIds.has(riderUnitId)) {
      continue;
    }

    const currentUnit = unitsById.get(riderUnitId);

    if (!currentUnit) {
      continue;
    }

    vehicle.riderUnitId = riderUnitId;
    currentUnit.mountedVehicleId = vehicle.id;
    claimedVehicleIds.add(vehicle.id);
    claimedUnitIds.add(riderUnitId);
  }

  for (const currentUnit of unitState) {
    if (!currentUnit?.mountedVehicleId) {
      continue;
    }

    const vehicle = vehiclesById.get(currentUnit.mountedVehicleId);

    if (!vehicle || vehicle.riderUnitId !== currentUnit.id) {
      currentUnit.mountedVehicleId = null;
      continue;
    }

    vehicle.x = currentUnit.x;
    vehicle.y = currentUnit.y;
  }
}

function applyStateSnapshot(state, mode, { recenter = true } = {}) {
  clearAnimationSchedule();

  clearPendingAutoAdvance();
  clearEditHoverState();
  hideTileMenu();

  const nextState = state || createDefaultState(mode);
  const nextMap = normalizeMapState(nextState.map);
  researchState = normalizeResearchState(nextState.research);

  map.width = nextMap.width;
  map.height = nextMap.height;
  map.cells = nextMap.cells;
  buildings = normalizeConstructiblesState("building", nextState.buildings, { requireArray: true });
  vehicles = normalizeConstructiblesState("vehicle", nextState.vehicles);
  units = normalizeUnitsState(nextState.units, mode);
  rebuildUnitOccupancyIndex();
  reconcileMountedVehicleStateLinks(vehicles, units);
  stockpile = normalizeStockpileState(nextState.stockpile);
  situationMessages = normalizeSituationMessagesState(nextState.situationMessages);
  clampStockpileToCapacity();
  foodShortageTurns = Math.max(
    0,
    clampInteger(nextState.foodShortageTurns, 0, 999999, 0),
  );
  inspectedPlayCell = null;
  syncActiveUnit();
  selectedUnitAction = null;
  currentTurn = Math.max(1, clampInteger(nextState.turn, 1, 999999, 1));
  autoAdvanceTurns =
    typeof nextState.autoAdvanceTurns === "boolean" ? nextState.autoAdvanceTurns : true;
  situationMessageViewIndex = situationMessages.length > 0 ? situationMessages.length - 1 : -1;
  setSituationMessageVisibility(situationMessages.length > 0);
  clearSituationMessageTyping();

  setTextContent(mapSizeReadouts, strings.readouts.mapSize(map.width, map.height));
  if (mode === interactionModes.edit) {
    setEditStateDirty(false);
  }
  refreshAfterModeStateTransition({
    resetTileHoverReadout: true,
    restartSituationTyping: true,
    relayout: true,
    recenter,
  });
}

function loadFileIntoMode(fileName, mode, options) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return false;

  const state = readSaveFile(normalizedName);

  if (!state) return false;
  if (!isCompatibleSaveState(state)) {
    console.warn(`Save slot ${normalizedName} is obsolete and cannot be loaded.`);
    return false;
  }

  try {
    applyStateSnapshot(state, mode, options);
    writeCurrentFileName(mode, normalizedName);
    return true;
  } catch (error) {
    console.warn(`Could not apply save slot ${normalizedName}.`, error);
    return false;
  }
}

function loadCurrentFileForMode(mode, options) {
  const currentFileName = getCurrentFileName(mode);

  if (!currentFileName) {
    applyStateSnapshot(createDefaultState(mode), mode, options);
    return false;
  }

  if (loadFileIntoMode(currentFileName, mode, options)) {
    return true;
  }

  writeCurrentFileName(mode, null);
  applyStateSnapshot(createDefaultState(mode), mode, options);
  return false;
}

function loadState(mode = interactionMode) {
  if (!mode) return false;

  openSaveSlotPanel("load", { targetMode: mode });
  return true;
}

function saveStateAs(mode = interactionMode) {
  if (!mode) return false;

  openSaveSlotPanel("saveAs", { targetMode: mode });
  return true;
}

function saveState(mode = interactionMode) {
  const currentFileName = getCurrentFileName(mode);

  if (!currentFileName) {
    return saveStateAs(mode);
  }

  return saveStateToFile(currentFileName, mode);
}

function autosavePlayState() {
  return saveStateToFile(autosaveSlotName, interactionModes.play);
}

function getUnits() {
  return units;
}

function rebuildUnitOccupancyIndex() {
  const nextIndex = new Map();

  for (const currentUnit of getUnits()) {
    if (!currentUnit || !Number.isInteger(currentUnit.x) || !Number.isInteger(currentUnit.y)) {
      continue;
    }

    nextIndex.set(createCellKey(currentUnit.x, currentUnit.y), currentUnit);
  }

  unitOccupancyIndex = nextIndex;
  return unitOccupancyIndex;
}

function getUnitOccupancyIndex() {
  return unitOccupancyIndex;
}

function updateUnitOccupancyEntry(currentUnit, previousX = null, previousY = null) {
  if (currentUnit && Number.isInteger(previousX) && Number.isInteger(previousY)) {
    const previousKey = createCellKey(previousX, previousY);

    if (unitOccupancyIndex.get(previousKey) === currentUnit) {
      unitOccupancyIndex.delete(previousKey);
    }
  }

  if (!currentUnit || !Number.isInteger(currentUnit.x) || !Number.isInteger(currentUnit.y)) {
    return;
  }

  unitOccupancyIndex.set(createCellKey(currentUnit.x, currentUnit.y), currentUnit);
}

function removeUnitOccupancyEntry(currentUnit) {
  if (!currentUnit || !Number.isInteger(currentUnit.x) || !Number.isInteger(currentUnit.y)) {
    return;
  }

  const occupancyKey = createCellKey(currentUnit.x, currentUnit.y);

  if (unitOccupancyIndex.get(occupancyKey) === currentUnit) {
    unitOccupancyIndex.delete(occupancyKey);
  }
}

function getVehicles() {
  return vehicles;
}

function hasAssignedTask(currentUnit) {
  return Boolean(currentUnit?.task);
}

function getDefaultActionForCompletedTask(currentUnit = getSelectedUnit()) {
  return getPreferredUnitAction(currentUnit, unitActions.walk);
}

function applyCompletedTaskDefaultAction(currentUnit) {
  const selectedUnit = getSelectedUnit();

  if (selectedUnit && selectedUnit !== currentUnit) {
    return;
  }

  selectedUnitAction = getDefaultActionForCompletedTask(currentUnit);
}

function getCurrentSelectedUnitAction(currentUnit = getSelectedUnit()) {
  if (!currentUnit) {
    return normalizeSelectableUnitAction(selectedUnitAction);
  }

  return getPreferredUnitAction(currentUnit, selectedUnitAction);
}

function isUnitWorking(currentUnit) {
  return Boolean(currentUnit) && !currentUnit.move && isWorkingTask(currentUnit.task);
}

function hasWorkingUnits() {
  return getUnits().some((currentUnit) => isUnitWorking(currentUnit));
}

function getWorkingUnitFrameIndex(now = performance.now()) {
  const spriteConfig = getUnitSpriteConfig();
  const workFrames = getSpriteSourcePaths(spriteConfig, spriteSourceIds.work, "O");

  if (!spriteConfig || workFrames.length <= 1) {
    return 0;
  }

  return Math.floor(now / spriteConfig.workFrameDuration) % workFrames.length;
}

function canRenderAnimatedFrames() {
  return document.visibilityState !== "hidden";
}

function clearAnimationSchedule() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  if (animationTimerId) {
    clearTimeout(animationTimerId);
    animationTimerId = 0;
  }

  scheduledAnimationIntervalMs = 0;
}

function getAnimationFrameInterval() {
  if (!canRenderAnimatedFrames()) {
    return Number.POSITIVE_INFINITY;
  }

  if (getMovingUnit()?.move) {
    return moveAnimationFrameIntervalMs;
  }

  if (shouldAnimateWorkingUnits() || shouldAnimateSelectionMarker()) {
    return animatedUiFrameIntervalMs;
  }

  return Number.POSITIVE_INFINITY;
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

function shouldAnimateWorkingUnits() {
  return canRenderAnimatedFrames() && isPlayMode() && !mainMenuOpen && hasWorkingUnits();
}

function shouldAnimateSelectionMarker() {
  return canRenderAnimatedFrames() && isPlayMode() && !mainMenuOpen && Boolean(getSelectedUnit());
}

function getRawUnitTaskDirection(currentUnit) {
  if (!isWorkingTask(currentUnit?.task)) {
    return currentUnit?.facing || "west";
  }

  if (!doesTaskUseTargetDirection(currentUnit?.task)) {
    return currentUnit?.facing || "west";
  }

  return getMoveDirection(
    currentUnit.x,
    currentUnit.y,
    currentUnit.task.toX,
    currentUnit.task.toY,
  );
}

function getUnitTaskDirection(currentUnit) {
  return getRawUnitTaskDirection(currentUnit);
}

function getUnitTaskTargetCell(currentUnit) {
  const task = currentUnit?.task;

  if (!task || !Number.isInteger(task.toX) || !Number.isInteger(task.toY)) {
    return null;
  }

  return getCell(task.toX, task.toY);
}

function isUnitAnimating(currentUnit) {
  return Boolean(currentUnit?.move);
}

function isUnitIdle(currentUnit) {
  return Boolean(currentUnit) && !hasAssignedTask(currentUnit) && !isUnitAnimating(currentUnit);
}

function getIdleUnits() {
  return getUnits().filter((currentUnit) => isUnitIdle(currentUnit));
}

function getFirstIdleUnit() {
  return getIdleUnits()[0] || null;
}

function getNextIdleUnit(fromUnit = getSelectedUnit()) {
  const idleUnits = getIdleUnits();

  if (idleUnits.length === 0) {
    return null;
  }

  if (idleUnits.length === 1) {
    return idleUnits[0] === fromUnit ? null : idleUnits[0];
  }

  const currentIndex = idleUnits.findIndex((currentUnit) => currentUnit === fromUnit);

  if (currentIndex < 0) {
    return idleUnits[0];
  }

  return idleUnits[(currentIndex + 1) % idleUnits.length] || null;
}

function selectNextIdleUnit({
  fromUnit = getSelectedUnit(),
  defaultAction = unitActions.walk,
  scrollIntoView = true,
} = {}) {
  const nextIdleUnit = getNextIdleUnit(fromUnit);

  if (!nextIdleUnit) {
    return false;
  }

  selectUnit(nextIdleUnit, { scrollIntoView, defaultAction });
  return true;
}

function everyUnitHasOngoingTask() {
  const units = getUnits();

  return units.length > 0 && units.every((currentUnit) => hasAssignedTask(currentUnit));
}

function canAdvanceTurn() {
  return (
    !mainMenuOpen &&
    isPlayMode() &&
    !isReplayPhase() &&
    !getUnits().some((currentUnit) => isUnitAnimating(currentUnit))
  );
}

function updateTurnReadout() {
  setTextContent(turnReadouts, strings.readouts.turn(currentTurn, formatJulianTurnDate(currentTurn)));
}

function updateTurnControls() {
  updateTurnReadout();
  updateStockpileReadout();
  setCheckedState(autoPassInputs, autoAdvanceTurns);
  setDisabledState(nextTurnButtons, !canAdvanceTurn());
  const shouldHighlight = !autoAdvanceTurns && canAdvanceTurn() && everyUnitHasOngoingTask();

  for (const button of nextTurnButtons) {
    button.classList.toggle("is-highlighted", shouldHighlight);
  }

  updatePersistenceControls();
}

function refreshUnitAndTurnPresentation() {
  updateUnitReadout();
  updateTurnControls();
}

function refreshUnitAndTurnPresentationAndDraw({
  scheduleAnimationPlayback = false,
  autoAdvance = false,
  drawNow = true,
} = {}) {
  refreshUnitAndTurnPresentation();

  if (scheduleAnimationPlayback) {
    scheduleAnimation();
  }

  if (drawNow) {
    draw();
  }

  if (autoAdvance) {
    maybeAutoAdvanceTurn();
  }
}

function refreshAfterUnitSelectionChange({ scheduleAnimationPlayback = false, drawNow = true } = {}) {
  invalidateStaticUnitsLayer();
  updateUnitReadout();

  if (scheduleAnimationPlayback) {
    scheduleAnimation();
  }

  if (drawNow) {
    draw();
  }
}

function refreshAfterUnitTaskChange(options = {}) {
  invalidateStaticUnitsLayer();
  refreshUnitAndTurnPresentationAndDraw(options);
}

function refreshAfterWorldAndUnitTaskChange(options = {}) {
  invalidateStaticLayer();
  refreshAfterUnitTaskChange(options);
}

function refreshAfterModeStateTransition({
  resetTileHoverReadout = false,
  restartSituationTyping = false,
  relayout = false,
  layoutOptions = undefined,
  recenter = false,
  drawNow = true,
} = {}) {
  if (resetTileHoverReadout) {
    resetTileReadout();
  }

  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
  updateUnitReadout();

  if (restartSituationTyping) {
    updateSituationMessagePanel({ restartTyping: true });
  }

  updateInteractionModeUi();

  if (relayout) {
    layoutCanvas(layoutOptions);
  }

  if (recenter) {
    requestAnimationFrame(() => restoreViewportCenter({ x: 0.5, y: 0.5 }));
  }

  if (drawNow) {
    draw();
  }

  if (shouldAnimateWorkingUnits()) {
    scheduleAnimation();
  }

  maybeAutoAdvanceTurn();
}

function assignUnitTask(task, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move || !task || isReplayPhase()) return false;

  clearQueuedAutoAdvanceFrame();

  currentUnit.task = task;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  unit = currentUnit;
  const taskAction = getTaskActionId(task) || unitActions.walk;
  selectedUnitAction =
    selectedUnitAction === unitUiActions.work && isUnitWorkRepresentedAction(taskAction)
      ? unitUiActions.work
      : taskAction;
  refreshAfterUnitTaskChange({
    scheduleAnimationPlayback: shouldAnimateWorkingUnits(),
    autoAdvance: true,
  });

  return true;
}

function queueWalkUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.walk)) return false;
  if (!canAssignUnitMoveTarget(destinationCell, currentUnit)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.walk, { destinationCell }), currentUnit);
}

function queueDismountUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.dismount)) return false;
  if (!destinationCell || !isValidUnitDismountTargetCell(currentUnit, destinationCell)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.dismount, { destinationCell }), currentUnit);
}

function queuePlayUnitAction({ currentUnit = getSelectedUnit() } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.play)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.play), currentUnit);
}

function queueResearchUnitAction({ currentUnit = getSelectedUnit() } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.research)) return false;
  if (!getSelectedResearchGoalTechnologyId()) {
    pendingBookResearchAssignmentUnitId = currentUnit.id;
    void openBookOverlayAtBookmark(researchBookBookmarkId).then((opened) => {
      if (opened && bookOverlay && !bookOverlay.hidden) {
        showBookTransientHint(getSituationMessageText({ kind: "researchGoalMissing" }));
      } else {
        clearPendingBookResearchAssignment();
      }
    });
    return false;
  }

  clearPendingBookResearchAssignment();

  if (getUnitResearchPointsPerTurn(currentUnit) <= 0) {
    return false;
  }

  return assignUnitTask(createUnitTaskForAction(unitActions.research), currentUnit);
}

function queueGatherFoodUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move || !canGatherFoodFromCell(destinationCell, currentUnit)) return false;
  if (!canUnitUseAction(currentUnit, unitActions.gatherFood)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.gatherFood, { destinationCell }), currentUnit);
}

function queueGatherMaterialsUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move || !canGatherMaterialsFromCell(destinationCell, currentUnit)) return false;
  if (!canUnitUseAction(currentUnit, unitActions.gatherMaterials)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.gatherMaterials, { destinationCell }), currentUnit);
}

function queueBuildHouseUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.buildHouse)) return false;

  const targetMode = getBuildHouseTargetMode(destinationCell);
  let structure = null;

  if (targetMode?.mode === "new") {
    if (!areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)) return false;
    structure = createBuildingConstructionAtCell(destinationCell, "house");
  } else if (targetMode?.mode === "construction") {
    if (!areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)) return false;
    structure = targetMode.entity || getConstructionEntityAtCell(destinationCell);
  }

  if (!structure) return false;

  const cell = getCell(destinationCell.x, destinationCell.y);

  if (cell && !cell.visited) {
    cell.visited = true;
  }

  if (targetMode?.mode === "new") {
    addSituationMessage("houseStarted");
  }

  invalidateStaticLayer();
  return assignUnitTask(createUnitTaskForAction(unitActions.buildHouse, { destinationCell }), currentUnit);
}

function queueLayFoundationUnitAction({
  currentUnit = getSelectedUnit(),
  destinationCell,
  constructible = getSelectedFoundationConstructible(),
} = {}) {
  if (!currentUnit || currentUnit.move || !constructible) return false;
  if (!canUnitUseAction(currentUnit, unitActions.layFoundation)) return false;
  if (constructible.kind === "building" && !isBuildingTypeAvailable(constructible.type)) return false;
  if (constructible.kind === "vehicle" && !isVehicleTypeAvailable(constructible.type)) return false;
  if (!canPlaceNewConstructibleConstructionOnCell(destinationCell, constructible, currentUnit)) return false;
  if (!doesConstructiblePlacementTouchUnit(destinationCell, constructible, currentUnit)) return false;
  if (!canAffordConstructibleConstruction(constructible)) return false;

  const structure = createConstructibleConstructionAtCell(destinationCell, constructible);

  if (!structure) {
    return false;
  }

  invalidateStaticLayer();
  return assignUnitTask(
    createUnitTaskForAction(unitActions.layFoundation, { destinationCell, constructible }),
    currentUnit,
  );
}

function queueDemolishUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (
    !currentUnit ||
    currentUnit.move ||
    !canUnitUseAction(currentUnit, unitActions.demolish) ||
    !areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)
  ) {
    return false;
  }

  const building = getBuildingAtCell(destinationCell.x, destinationCell.y);

  if (!building || building.state !== "abandoned") return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.demolish, { destinationCell }), currentUnit);
}

function canAssignUnitMoveTarget(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || !destinationCell) {
    return false;
  }

  if (destinationCell.x === currentUnit.x && destinationCell.y === currentUnit.y) {
    return false;
  }

  if (canUnitEnter(destinationCell, currentUnit)) {
    return true;
  }

  return Boolean(currentUnit.mountedVehicleId) && getUnitCellPassabilityState(
    destinationCell,
    currentUnit,
    { requireUnmounted: true },
  ).canOccupy;
}

function queueUnitMoveTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.walk, { currentUnit, destinationCell });
}

function queueUnitDismountTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.dismount, { currentUnit, destinationCell });
}

function queueUnitPlayTask(currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.play, { currentUnit });
}

function clearPendingBookResearchAssignment() {
  pendingBookResearchAssignmentUnitId = null;
}

function queuePendingBookResearchAssignment() {
  const pendingUnit = getUnitById(pendingBookResearchAssignmentUnitId);
  clearPendingBookResearchAssignment();

  if (!pendingUnit) {
    return false;
  }

  return queueUnitAction(unitActions.research, { currentUnit: pendingUnit });
}

function queueUnitResearchTask(currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.research, { currentUnit });
}

function queueUnitGatherFoodTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.gatherFood, { currentUnit, destinationCell });
}

function queueUnitGatherMaterialsTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.gatherMaterials, { currentUnit, destinationCell });
}

function queueUnitWorkTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move) {
    return false;
  }

  if (!canUnitUseWorkUiAction(currentUnit)) {
    return false;
  }

  return queueUnitBuildHouseTask(destinationCell, currentUnit)
    || queueUnitGatherMaterialsTask(destinationCell, currentUnit);
}

function queueUnitBuildHouseTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.buildHouse, { currentUnit, destinationCell });
}

function queueUnitLayFoundationTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.layFoundation, { currentUnit, destinationCell });
}

function queueUnitDemolishTask(destinationCell, currentUnit = getSelectedUnit()) {
  return queueUnitAction(unitActions.demolish, { currentUnit, destinationCell });
}

function clearCompletedTask(currentUnit) {
  applyCompletedTaskDefaultAction(currentUnit);
  currentUnit.task = null;
  currentUnit.turnRoute = null;
  invalidateStaticUnitsLayer();
}

function cancelUnitTask(currentUnit = getSelectedUnit() || unit) {
  if (!currentUnit?.task || isReplayPhase()) {
    return false;
  }

  currentUnit.task = null;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;

  if (currentUnit.selected) {
    selectedUnitAction = unitActions.walk;
  }

  refreshAfterUnitTaskChange({ autoAdvance: true });
  return true;
}

function exhaustFoodResource(cell) {
  if (!cell) return;

  const wasFishOnWater = cell.type === "water" && cell.foodType === "fish";

  cell.foodType = null;
  cell.foodCapacity = 0;
  cell.foodAmount = 0;

  if (wasFishOnWater) {
    cell.variant = "water_02";
  }

  invalidateStaticLayer();
}

function exhaustMaterialResource(cell) {
  if (!cell) return;

  cell.materialAmount = 0;

  if (cell.type === "forest" || cell.type === "mountain") {
    setCellTerrain(cell, "grass", { rollFood: false });
    return;
  }

  invalidateStaticLayer();
}

function resolveGatherFoodTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!canGatherFoodFromCell(targetCell, currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const gatherAmount = Math.min(
    getUnitWorkPointsPerTurn("gatherFood"),
    clampNonNegativeNumber(targetCell.foodAmount, 999999, 0),
  );

  if (gatherAmount <= 0) {
    exhaustFoodResource(targetCell);
    clearCompletedTask(currentUnit);
    invalidateStaticLayer();
    return;
  }

  targetCell.foodAmount = Math.max(0, targetCell.foodAmount - gatherAmount);
  addToStockpile("food", gatherAmount);
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  currentUnit.task.turnsRemaining = Math.max(0, (currentUnit.task.turnsRemaining || 0) - 1);

  if (targetCell.foodAmount <= 0) {
    exhaustFoodResource(targetCell);
    clearCompletedTask(currentUnit);
  } else if (currentUnit.task.turnsRemaining <= 0) {
    clearCompletedTask(currentUnit);
    invalidateStaticLayer();
  } else {
    invalidateStaticLayer();
  }
}

function resolveGatherMaterialsTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!canGatherMaterialsFromCell(targetCell, currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const materialType = getCellMaterialResourceType(targetCell);
  const gatherAmount = Math.min(
    getUnitWorkPointsPerTurn("gatherMaterials"),
    clampNonNegativeNumber(targetCell.materialAmount, 999999, 0),
  );

  if (!materialType || gatherAmount <= 0) {
    if (targetCell) {
      exhaustMaterialResource(targetCell);
    }
    clearCompletedTask(currentUnit);
    return;
  }

  targetCell.materialAmount = Math.max(0, targetCell.materialAmount - gatherAmount);
  addToStockpile(materialType, gatherAmount);
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  currentUnit.task.turnsRemaining = Math.max(0, (currentUnit.task.turnsRemaining || 0) - 1);

  if (targetCell.materialAmount <= 0) {
    exhaustMaterialResource(targetCell);
    clearCompletedTask(currentUnit);
  } else if (currentUnit.task.turnsRemaining <= 0) {
    clearCompletedTask(currentUnit);
    invalidateStaticLayer();
  } else {
    invalidateStaticLayer();
  }
}

function resolveBuildHouseTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!targetCell || !areCellsAdjacent(currentUnit.x, currentUnit.y, targetCell.x, targetCell.y)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const structure = getConstructionEntityAtCell(targetCell);

  if (!structure || structure.state !== "construction") {
    clearCompletedTask(currentUnit);
    return;
  }

  const nextCompleteness = clamp(
    getBuildingCompleteness(structure) +
      getConstructionWorkCompletenessDelta("buildHouse", structure),
    0,
    1,
  );

  turnReplayHadWork = true;
  structure.state = nextCompleteness >= 1 ? "complete" : "construction";
  structure.completeness = nextCompleteness;
  currentUnit.stamina = 0;
  invalidateStaticLayer();

  if (nextCompleteness >= 1 && structure.type === "house" && structure.riderUnitId === undefined) {
    const spawnedUnit = spawnUnitFromHouse(structure);
    if (spawnedUnit) {
      addSituationMessage("houseCompleted", { unitName: spawnedUnit.name });
    }
  }

  if (nextCompleteness >= 1) {
    clearCompletedTask(currentUnit);
  }
}

function resolveLayFoundationTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);
  const subjectKind = currentUnit.task?.subjectKind === "vehicle" ? "vehicle" : "building";
  const subjectType =
    typeof currentUnit.task?.subjectType === "string" && currentUnit.task.subjectType.trim()
      ? currentUnit.task.subjectType.trim()
      : (typeof currentUnit.task?.buildingType === "string" ? currentUnit.task.buildingType : "house");
  const constructible = createFoundationConstructibleDescriptor(subjectKind, subjectType);
  const structure = getConstructionEntityAtCell(targetCell, { kind: subjectKind, type: subjectType });

  if (
    !targetCell ||
    !constructible ||
    !structure ||
    structure.state !== "construction" ||
    !doesConstructiblePlacementTouchUnit(targetCell, constructible, currentUnit)
  ) {
    clearCompletedTask(currentUnit);
    return;
  }

  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  clearCompletedTask(currentUnit);
}

function resolveDemolishTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!targetCell || !areCellsAdjacent(currentUnit.x, currentUnit.y, targetCell.x, targetCell.y)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const building = getBuildingAtCell(targetCell.x, targetCell.y);

  if (!building || building.state !== "abandoned") {
    clearCompletedTask(currentUnit);
    return;
  }

  const nextCompleteness = clamp(
    getBuildingCompleteness(building) +
      -getBuildingWorkCompletenessDelta("demolish", building.type),
    0,
    1,
  );

  turnReplayHadWork = true;
  building.state = "abandoned";
  building.completeness = nextCompleteness;
  currentUnit.stamina = 0;
  invalidateStaticLayer();

  if (nextCompleteness <= 0) {
    buildings = buildings.filter((candidate) => candidate !== building);
    clampStockpileToCapacity();
    clearCompletedTask(currentUnit);
  }
}

function resolvePerformTask(currentUnit) {
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
}

function resolveDismountTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);
  const originCell = getCell(currentUnit.x, currentUnit.y);
  const context = getRuleContext();

  if (
    !targetCell ||
    !originCell ||
    !currentUnit?.mountedVehicleId ||
    !areCellsAdjacent(currentUnit.x, currentUnit.y, targetCell.x, targetCell.y) ||
    !getUnitCellPassabilityState(targetCell, currentUnit, {
      requireUnmounted: true,
      forbidVehicles: true,
    }).canOccupy
  ) {
    clearCompletedTask(currentUnit);
    return;
  }

  const moveCost = getUnitMoveCost(targetCell, originCell, currentUnit, context);

  if (!Number.isFinite(moveCost) || moveCost > getUnitStamina(currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - moveCost);

  if (!applyUnitDismount(currentUnit, targetCell, { updateSelectedAction: false, refreshPresentation: false, setLastStepFromOrigin: true })) {
    clearCompletedTask(currentUnit);
    return;
  }

  turnReplayHadMove = true;
  turnReplayQueue.push({
    type: "dismountStep",
    unitId: currentUnit.id,
    direction: getMoveDirection(originCell.x, originCell.y, targetCell.x, targetCell.y),
    toX: targetCell.x,
    toY: targetCell.y,
  });

  clearCompletedTask(currentUnit);
}

function resolveResearchTask(currentUnit) {
  const selectedGoalTechnologyId = getSelectedResearchGoalTechnologyId();

  if (!selectedGoalTechnologyId) {
    clearCompletedTask(currentUnit);
    return;
  }

  const researchPoints = getUnitResearchPointsPerTurn(currentUnit);

  if (researchPoints <= 0) {
    clearCompletedTask(currentUnit);
    return;
  }

  turnReplayHadWork = true;
  currentUnit.stamina = 0;

  if (addResearchProgressToTechnology(selectedGoalTechnologyId, researchPoints, { refresh: false })) {
    const isGoalStillSelected = getSelectedResearchGoalTechnologyId() === selectedGoalTechnologyId;

    if (!isGoalStillSelected) {
      clearCompletedTask(currentUnit);
    }
  } else {
    clearCompletedTask(currentUnit);
  }

  updateResearchPresentation();
}

function resolveUnitTask(currentUnit) {
  if (!currentUnit?.task) {
    return;
  }

  const spec = getUnitActionSpec(currentUnit.task);

  if (!spec?.resolveTask) {
    clearCompletedTask(currentUnit);
    return;
  }

  spec.resolveTask(currentUnit);
}

function resolveMoveTaskForTurn(currentUnit) {
  const context = getRuleContext();

  while (isTaskAction(currentUnit?.task, unitActions.walk) && getUnitStamina(currentUnit) > 0) {
    if (currentUnit.x === currentUnit.task.toX && currentUnit.y === currentUnit.task.toY) {
      clearCompletedTask(currentUnit);
      return;
    }

    let nextMove = getNextMoveStep(currentUnit, currentUnit.task);

    if (
      nextMove &&
      (
        (
          nextMove.type === "dismount" &&
          !getUnitCellPassabilityState(nextMove.cell, currentUnit, {
            requireUnmounted: true,
            forbidVehicles: true,
          }).canOccupy
        ) ||
        (nextMove.type !== "dismount" && !canUnitEnter(nextMove.cell, currentUnit))
      )
    ) {
      currentUnit.turnRoute = null;
      nextMove = getNextMoveStep(currentUnit, currentUnit.task);
    }

    if (!nextMove) {
      clearCompletedTask(currentUnit);
      return;
    }

    if (nextMove.type === "dismount") {
      currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - (nextMove.moveCost || 0));

      if (!applyUnitDismount(currentUnit, nextMove.cell, { updateSelectedAction: false, refreshPresentation: false, setLastStepFromOrigin: true })) {
        currentUnit.turnRoute = null;
        continue;
      }

      turnReplayHadMove = true;
      turnReplayQueue.push({
        type: "dismountStep",
        unitId: currentUnit.id,
        direction: nextMove.direction,
        toX: currentUnit.x,
        toY: currentUnit.y,
      });

      if (currentUnit.x === currentUnit.task.toX && currentUnit.y === currentUnit.task.toY) {
        applyCompletedTaskDefaultAction(currentUnit);
        currentUnit.task = null;
        currentUnit.turnRoute = null;
        return;
      }

      continue;
    }

    const fromX = currentUnit.x;
    const fromY = currentUnit.y;
    const moveCost = getUnitMoveCost(nextMove.cell, getCell(fromX, fromY), currentUnit, context);

    currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - moveCost);
    currentUnit.x = nextMove.cell.x;
    currentUnit.y = nextMove.cell.y;
    updateUnitOccupancyEntry(currentUnit, fromX, fromY);
    currentUnit.facing = nextMove.direction || currentUnit.facing;
    currentUnit.lastStepFromX = fromX;
    currentUnit.lastStepFromY = fromY;
    const mountedVehicle = getMountedVehicle(currentUnit);

    if (mountedVehicle) {
      mountedVehicle.x = currentUnit.x;
      mountedVehicle.y = currentUnit.y;
    }

    turnReplayHadMove = true;
    turnReplayQueue.push({
      type: "moveStep",
      unitId: currentUnit.id,
      direction: currentUnit.facing,
      toX: currentUnit.x,
      toY: currentUnit.y,
    });

    const destinationCell = getCell(currentUnit.x, currentUnit.y);

    markCellVisitedByUnit(destinationCell);
    maybeMountUnitAtCurrentCell(currentUnit);

    if (currentUnit.x === currentUnit.task.toX && currentUnit.y === currentUnit.task.toY) {
      applyCompletedTaskDefaultAction(currentUnit);
      currentUnit.task = null;
      currentUnit.turnRoute = null;
      return;
    }
  }
}

function resetUnitsForTurn() {
  for (const currentUnit of getUnits()) {
    currentUnit.stamina = getUnitMaxStamina(currentUnit);
    currentUnit.turnRoute = null;
  }
}

function regrowFoodResourcesForTurn() {
  let didChange = false;

  for (const row of map.cells) {
    for (const cell of row) {
      if (!hasFoodResource(cell)) {
        continue;
      }

      const maxAmount = getCellFoodMaxAmount(cell);
      const regrowth = getFoodTypeRegrowth(cell.foodType);

      if (maxAmount <= 0 || regrowth <= 0) {
        continue;
      }

      const nextAmount = clamp(cell.foodAmount + regrowth, 0, maxAmount);

      if (nextAmount !== cell.foodAmount) {
        cell.foodAmount = nextAmount;
        didChange = true;
      }
    }
  }

  if (didChange) {
    invalidateStaticLayer();
  }
}

function abandonUnitHome(buildingId) {
  if (!buildingId) return false;

  const building = buildings.find((candidate) => candidate?.id === buildingId) || null;

  if (!building) {
    return false;
  }

  building.state = "abandoned";
  building.completeness = 1;
  invalidateStaticLayer();
  return true;
}

function removeRandomUnitForFoodShortage() {
  const currentUnits = getUnits();

  if (currentUnits.length === 0) {
    return null;
  }

  const removedUnit = currentUnits[Math.floor(Math.random() * currentUnits.length)];

  if (!removedUnit) {
    return null;
  }

  abandonUnitHome(getUnitHomeBuildingId(removedUnit));
  const mountedVehicle = getMountedVehicle(removedUnit);

  if (mountedVehicle) {
    mountedVehicle.riderUnitId = null;
    removedUnit.mountedVehicleId = null;
    invalidateStaticLayer();
  }

  units = currentUnits.filter((candidate) => candidate !== removedUnit);
  removeUnitOccupancyEntry(removedUnit);

  if (removedUnit.selected) {
    clearUnitSelection();
  }

  syncActiveUnit();
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  return removedUnit;
}

function consumeFoodForTurn() {
  const previousShortageTurns = foodShortageTurns;
  const requiredFood = getUnits().reduce(
    (sum, currentUnit) => sum + getUnitFoodConsumptionPerTurn(currentUnit),
    0,
  );

  if (requiredFood <= 0) {
    foodShortageTurns = 0;
    return;
  }

  const availableFood = getCurrentStockpileAmount("food");

  if (availableFood >= requiredFood) {
    stockpile.food = availableFood - requiredFood;
    if (previousShortageTurns > 0) {
      addSituationMessage("foodRecovered");
    }
    foodShortageTurns = 0;
    return;
  }

  stockpile.food = 0;
  foodShortageTurns += 1;

  if (foodShortageTurns >= getFoodShortageThreshold()) {
    const removedUnit = removeRandomUnitForFoodShortage();
    if (removedUnit) {
      addSituationMessage("unitLeft", { unitName: removedUnit.name });
    }
    foodShortageTurns = getFoodShortageResetTurns();
    return;
  }

  addSituationMessage("foodShortage", {
    current: foodShortageTurns,
    threshold: getFoodShortageThreshold(),
  });
}

function applyVillageEconomyForTurn() {
  regrowFoodResourcesForTurn();
  consumeFoodForTurn();
}

function captureReplayUnitStates() {
  const states = new Map();

  for (const currentUnit of getUnits()) {
    if (!currentUnit?.id) {
      continue;
    }

    states.set(currentUnit.id, {
      x: currentUnit.x,
      y: currentUnit.y,
      facing: currentUnit.facing || "west",
      lastStepFromX: currentUnit.lastStepFromX ?? null,
      lastStepFromY: currentUnit.lastStepFromY ?? null,
      mountedVehicleId: normalizeLinkedEntityId(currentUnit.mountedVehicleId),
    });
  }

  return states;
}

function captureReplayVehicleStates() {
  const states = new Map();

  for (const vehicle of vehicles) {
    if (!vehicle?.id) {
      continue;
    }

    states.set(vehicle.id, {
      x: vehicle.x,
      y: vehicle.y,
      riderUnitId: normalizeLinkedEntityId(vehicle.riderUnitId),
    });
  }

  return states;
}

function captureReplayMoveTargets() {
  const targets = new Map();

  for (const currentUnit of getUnits()) {
    if (currentUnit?.task?.type !== "move") {
      continue;
    }

    targets.set(currentUnit.id, {
      toX: currentUnit.task.toX,
      toY: currentUnit.task.toY,
    });
  }

  return targets;
}

function applyReplayUnitStates(states) {
  for (const currentUnit of getUnits()) {
    const state = states.get(currentUnit.id);

    if (!state) {
      continue;
    }

    const previousX = currentUnit.x;
    const previousY = currentUnit.y;
    currentUnit.x = state.x;
    currentUnit.y = state.y;
    updateUnitOccupancyEntry(currentUnit, previousX, previousY);
    currentUnit.facing = state.facing;
    currentUnit.lastStepFromX = state.lastStepFromX;
    currentUnit.lastStepFromY = state.lastStepFromY;
    currentUnit.mountedVehicleId = normalizeLinkedEntityId(state.mountedVehicleId);
    currentUnit.move = null;
  }
}

function applyReplayVehicleStates(states) {
  for (const vehicle of vehicles) {
    const state = states.get(vehicle.id);

    if (!state) {
      continue;
    }

    vehicle.x = state.x;
    vehicle.y = state.y;
    vehicle.riderUnitId = normalizeLinkedEntityId(state.riderUnitId);
  }
}

function applyReplaySceneStates(unitStates, vehicleStates) {
  applyReplayUnitStates(unitStates);
  applyReplayVehicleStates(vehicleStates);
  reconcileMountedVehicleStateLinks(vehicles, units);
  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
}

function resetTurnReplayState() {
  playPhase = playPhases.ordering;
  replayPauseTimeoutId = 0;
  turnReplayQueue = [];
  turnReplayHadWork = false;
  turnReplayHadMove = false;
  turnReplayStartStates = new Map();
  turnReplayFinalStates = new Map();
  turnReplayVehicleStartStates = new Map();
  turnReplayVehicleFinalStates = new Map();
  turnReplayMoveTargets = new Map();
}

function commitReplayFinalState() {
  if (turnReplayFinalStates.size === 0) {
    const movingUnit = getMovingUnit();

    if (movingUnit) {
      movingUnit.move = null;
      invalidateStaticUnitsLayer();
    }

    return;
  }

  applyReplaySceneStates(turnReplayFinalStates, turnReplayVehicleFinalStates);
}

function finishReplay() {
  if (replayPauseTimeoutId) {
    window.clearTimeout(replayPauseTimeoutId);
  }

  commitReplayFinalState();
  resetTurnReplayState();
  refreshUnitAndTurnPresentationAndDraw({ autoAdvance: true });
}

function startReplayPause() {
  if (replayPauseTimeoutId) {
    return;
  }

  if (shouldAnimateWorkingUnits()) {
    scheduleAnimation();
  }

  replayPauseTimeoutId = window.setTimeout(() => {
    finishReplay();
  }, workTurnDisplayDelayMs);
}

function startNextReplayEvent() {
  if (turnReplayQueue.length === 0) {
    if (turnReplayHadWork && !turnReplayHadMove) {
      startReplayPause();
      return;
    }

    finishReplay();
    return;
  }

  const replayEvent = turnReplayQueue.shift();

  if (!replayEvent) {
    finishReplay();
    return;
  }

  if (replayEvent.type === "dismountStep") {
    const replayUnit = getUnits().find((candidate) => candidate?.id === replayEvent.unitId);

    if (!replayUnit) {
      startNextReplayEvent();
      return;
    }

    const destinationCell = getCell(replayEvent.toX, replayEvent.toY);

    if (!destinationCell) {
      startNextReplayEvent();
      return;
    }

    startUnitMove(
      {
        x: replayEvent.toX,
        y: replayEvent.toY,
      },
      replayEvent.direction,
      replayUnit,
      { mode: "dismount" },
    );
    return;
  }

  if (replayEvent.type !== "moveStep") {
    startNextReplayEvent();
    return;
  }

  const replayUnit = getUnits().find((candidate) => candidate?.id === replayEvent.unitId);

  if (!replayUnit) {
    startNextReplayEvent();
    return;
  }

  startUnitMove(
    {
      x: replayEvent.toX,
      y: replayEvent.toY,
    },
    replayEvent.direction,
    replayUnit,
  );
}

function beginTurnReplay() {
  playPhase = playPhases.replaying;
  applyReplaySceneStates(turnReplayStartStates, turnReplayVehicleStartStates);
  updateUnitReadout();
  updateTurnControls();
  draw();

  if (turnReplayQueue.length > 0) {
    startNextReplayEvent();
    return;
  }

  if (turnReplayHadWork && !turnReplayHadMove) {
    startReplayPause();
    return;
  }

  finishReplay();
}

function resolveTurn() {
  turnReplayQueue = [];
  turnReplayHadWork = false;
  turnReplayHadMove = false;
  turnReplayStartStates = captureReplayUnitStates();
  turnReplayVehicleStartStates = captureReplayVehicleStates();
  turnReplayMoveTargets = captureReplayMoveTargets();
  resetUnitsForTurn();

  for (const currentUnit of getUnits()) {
    if (!currentUnit?.task || getUnitStamina(currentUnit) <= 0) {
      continue;
    }

    resolveUnitTask(currentUnit);
  }

  applyVillageEconomyForTurn();
  turnReplayFinalStates = captureReplayUnitStates();
  turnReplayVehicleFinalStates = captureReplayVehicleStates();
  autosavePlayState();
}

function updateBuildingsForTurn() {
  let didChange = false;
  const nextBuildings = [];

  for (const building of buildings) {
    if (building.state !== "abandoned" || isBuildingTargetedByDemolishTask(building)) {
      nextBuildings.push(building);
      continue;
    }

    const nextCompleteness = Math.max(
      0,
      getBuildingCompleteness(building) - getBuildingAbandonedDecay(building.type),
    );

    if (nextCompleteness !== building.completeness) {
      building.completeness = nextCompleteness;
      didChange = true;
    }

    if (nextCompleteness > 0) {
      nextBuildings.push(building);
    } else {
      didChange = true;
    }
  }

  buildings = nextBuildings;

  if (didChange) {
    invalidateStaticLayer();
  }
}

function advanceTurn() {
  if (!canAdvanceTurn()) return;

  clearPendingAutoAdvance();
  currentTurn += 1;
  updateBuildingsForTurn();
  resolveTurn();
  beginTurnReplay();
}

function maybeAutoAdvanceTurn() {
  if (!canAdvanceTurn()) {
    clearPendingAutoAdvance();
    updateTurnControls();
    return;
  }

  if (getIdleUnits().length > 0) {
    ensureIdleUnitSelection({ scrollIntoView: true });
    if (shouldAnimateWorkingUnits() || shouldAnimateSelectionMarker()) {
      scheduleAnimation();
    }
    clearPendingAutoAdvance();
    updateTurnControls();
    return;
  }

  if (!autoAdvanceTurns || !everyUnitHasOngoingTask()) {
    clearPendingAutoAdvance();
    updateTurnControls();
    return;
  }

  if (autoAdvanceQueued) return;

  autoAdvanceQueued = true;
  autoAdvanceFrameId = requestAnimationFrame(() => {
    autoAdvanceQueued = false;
    autoAdvanceFrameId = 0;

    if (autoAdvanceTurns && canAdvanceTurn() && everyUnitHasOngoingTask()) {
      advanceTurn();
    }
  });
}

function loadTileImages() {
  const pendingLoads = [];

  for (const [type, spec] of Object.entries(terrain)) {
    for (const variant of getTerrainVariants(type)) {
      pendingLoads.push(loadImage(variant.image, tileImages));
    }
  }

  for (const imagePath of getBuildingImagePaths()) {
    pendingLoads.push(loadImage(imagePath, buildingImages));
  }

  for (const imagePath of getVehicleImagePaths()) {
    pendingLoads.push(loadImage(imagePath, vehicleImages));
  }

  for (const imagePath of getMountedVehicleUnitImagePaths()) {
    pendingLoads.push(loadImage(imagePath, unitImages));
  }

  for (const imagePath of getShoreOverlayPaths()) {
    pendingLoads.push(loadImage(imagePath, shoreOverlayImages));
  }

  for (const imagePath of getFoodOverlayImagePaths()) {
    pendingLoads.push(loadImage(imagePath, resourceOverlayImages));
  }

  for (const imagePath of Object.values(resourceUiIcons)) {
    pendingLoads.push(loadImage(imagePath, resourceIconImages));
  }

  for (const spriteConfig of Object.values(getAllUnitSpriteConfigs())) {
    if (!spriteConfig) {
      continue;
    }

    for (const imagePath of getSpriteAnimationImagePaths(spriteConfig)) {
      pendingLoads.push(loadImage(imagePath, unitImages));
    }
  }

  return Promise.allSettled(pendingLoads).then(() => {
    visualAssetsLoaded = true;
    draw();
  });
}

async function ensureVisualAssetsLoaded() {
  await Promise.all([
    ensureBuildingDefinitionsLoaded(),
    ensureVehicleDefinitionsLoaded(),
    ensureUnitDefinitionsLoaded(),
  ]);

  if (visualAssetsLoaded) {
    return;
  }

  if (!visualAssetsLoadPromise) {
    visualAssetsLoadPromise = loadTileImages();
  }

  return visualAssetsLoadPromise;
}

function getFoodOverlayImagePaths() {
  return [
    ...new Set(
      Object.values(rules.resources?.foodTypes || {})
        .map((definition) => definition?.overlayImage)
        .filter((imagePath) => typeof imagePath === "string" && imagePath),
    ),
  ];
}

function getBuildingImagePaths() {
  return getStructureImagePaths(buildingCatalog);
}

function getVehicleImagePaths() {
  return [
    ...getStructureImagePaths(vehicleCatalog),
    ...getMountedRenderLayerImagePaths(vehicleCatalog, "vehicle"),
  ];
}

function getMountedVehicleUnitImagePaths() {
  return getMountedRenderLayerImagePaths(vehicleCatalog, "unit");
}

function getStructureImagePaths(catalog) {
  const paths = [];

  for (const spec of Object.values(catalog || {})) {
    for (const variant of spec.subtypes || []) {
      paths.push(variant.image);
    }

    if (spec.abandonedImage) {
      paths.push(spec.abandonedImage);
    }

    if (spec.constructionImages) {
      paths.push(...Object.values(spec.constructionImages));
    }

    for (const stageVisual of Object.values(spec.constructionStages || {})) {
      if (Array.isArray(stageVisual?.tileImages)) {
        paths.push(...stageVisual.tileImages.filter(Boolean));
      }
    }
  }

  return paths;
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

function getShoreOverlayPaths() {
  return [
    ...Object.values(shoreOverlays.edge),
    ...Object.values(shoreOverlays.corner),
  ];
}

function loadImage(imagePath, registry) {
  if (!imagePath) {
    return Promise.resolve(null);
  }

  if (registry[imagePath]) {
    return imageLoadPromises.get(registry[imagePath]) || Promise.resolve(registry[imagePath]);
  }

  const image = new Image();
  let settleImageLoad;
  let didSettle = false;
  const promise = new Promise((resolve) => {
    settleImageLoad = () => {
      if (didSettle) return;
      didSettle = true;
      resolve(image);
    };
  });
  const handleImageSettled = () => {
    invalidateStaticLayer();
    invalidateStaticUnitsLayer();
    updateStockpileReadout();
    updateTileInspectorReadout();
    draw();
    settleImageLoad();
  };
  image.onload = () => {
    handleImageSettled();
  };
  image.onerror = () => {
    console.warn(`Could not load image: ${imagePath}`);
    handleImageSettled();
  };
  image.src = imagePath;
  registry[imagePath] = image;
  imageLoadPromises.set(image, promise);

  if (image.complete) {
    handleImageSettled();
  }

  return promise;
}

function chooseWeightedId(items) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + Math.max(0, Number(item?.weight) || 0), 0);

  if (!(totalWeight > 0)) {
    return items[0]?.id || null;
  }

  let roll = Math.random() * totalWeight;

  for (const item of items) {
    roll -= Math.max(0, Number(item?.weight) || 0);

    if (roll < 0) {
      return item?.id || null;
    }
  }

  return items[items.length - 1]?.id || null;
}

function chooseFoodTypeForCell(cell) {
  if (!cell) return null;

  if (cell.type === "water") {
    return ensureCellVariant(cell) === "water_01" ? "fish" : null;
  }

  const generationConfig = rules.resources?.terrainFoodGeneration?.[cell.type];

  if (!generationConfig) {
    return null;
  }

  const chance = Number(generationConfig.chance);

  if (!Number.isFinite(chance) || chance <= 0 || Math.random() >= chance) {
    return null;
  }

  const foodType = chooseWeightedId(generationConfig.types);
  const foodDefinition = getFoodDefinition(foodType);

  if (!foodDefinition || foodDefinition.terrain !== cell.type) {
    return null;
  }

  return foodType;
}

function initializeCellResources(cell, { rollFood = true } = {}) {
  if (!cell) return cell;

  cell.materialAmount = getMaterialAmountForTerrain(cell.type);
  cell.foodType = null;
  cell.foodCapacity = 0;
  cell.foodAmount = 0;

  if (rollFood) {
    const foodType = chooseFoodTypeForCell(cell);

    if (foodType) {
      cell.foodType = foodType;
      cell.foodCapacity = getFoodTypeMaxAmount(foodType);
      cell.foodAmount = cell.foodCapacity;
    }
  }

  return cell;
}

function syncCellResourcesWithVariant(cell, { seedOnWater01 = false } = {}) {
  if (!cell) return;

  if (cell.type !== "water") {
    return;
  }

  if (ensureCellVariant(cell) === "water_01") {
    if (seedOnWater01 && !cell.foodType) {
      cell.foodType = "fish";
      cell.foodCapacity = getFoodTypeMaxAmount("fish");
      cell.foodAmount = cell.foodCapacity;
    }
    return;
  }

  cell.foodType = null;
  cell.foodCapacity = 0;
  cell.foodAmount = 0;
}

function createCell(x, y, type) {
  const cell = {
    x,
    y,
    type,
    variant: chooseTerrainVariant(type),
    visited: false,
    visitsCount: 0,
    foodCapacity: 0,
  };

  return initializeCellResources(cell);
}

function setCellTerrain(cell, type, { rollFood = true } = {}) {
  if (cell.type !== type) {
    cell.type = type;
    cell.variant = chooseTerrainVariant(type);
    cell.visitsCount = 0;
    initializeCellResources(cell, { rollFood });
    invalidateStaticLayer();
    return;
  }

  const previousVariant = cell.variant;

  ensureCellVariant(cell);

  if (cell.variant !== previousVariant) {
    invalidateStaticLayer();
  }
}

function ensureCellVariant(cell) {
  const variants = getTerrainVariants(cell.type);

  if (variants.some((variant) => variant.id === cell.variant)) return cell.variant;

  cell.variant = chooseTerrainVariant(cell.type);
  return cell.variant;
}

function chooseTerrainVariant(type) {
  const variants = getTerrainVariants(type);

  if (variants.length === 0) return null;

  const totalWeight = variants.reduce((total, variant) => total + (variant.weight ?? 1), 0);
  let roll = Math.random() * totalWeight;

  for (const variant of variants) {
    roll -= variant.weight ?? 1;

    if (roll < 0) return variant.id;
  }

  return variants[variants.length - 1].id;
}

function getTerrainVariants(type) {
  const spec = terrain[type];

  if (!spec) return [];
  if (spec.variants?.length) return spec.variants;
  if (spec.image) return [{ id: "default", label: spec.label, image: spec.image }];

  return [];
}

function getTerrainVariant(type, variantId) {
  const variants = getTerrainVariants(type);

  return variants.find((variant) => variant.id === variantId) || variants[0] || null;
}

function buildingOccupiesCell(building, x, y) {
  return constructibleOccupiesCell("building", building, x, y);
}

function vehicleOccupiesCell(vehicle, x, y) {
  return constructibleOccupiesCell("vehicle", vehicle, x, y);
}

function getBuildingAtCell(x, y) {
  return findConstructibleAtCellForKind("building", x, y);
}

function getVehiclesAtCell(x, y) {
  return getConstructiblesAtCellForKind("vehicle", x, y);
}

function getVehicleAtCell(x, y) {
  return findConstructibleAtCellForKind("vehicle", x, y);
}

function getUnitAtCell(x, y, { excludeUnitId = null } = {}) {
  const currentUnit = getUnitOccupancyIndex().get(createCellKey(x, y)) || null;

  if (!currentUnit || currentUnit.id === excludeUnitId) {
    return null;
  }

  return currentUnit;
}

function isVehicleInstanceWalkable(vehicle) {
  return isConstructibleInstanceWalkableForKind("vehicle", vehicle);
}

function getWalkableVehicleAtCell(x, y, { excludeVehicleId = null } = {}) {
  return getWalkableConstructibleAtCellForKind("vehicle", x, y, {
    excludeConstructibleId: excludeVehicleId,
  });
}

function getCellConstructibleState(cell, { excludeVehicleId = null } = {}) {
  if (!cell) {
    return {
      building: null,
      walkableBuilding: null,
      blockingBuilding: null,
      vehicles: [],
      walkableVehicle: null,
      blockingVehicle: null,
      anyVehicle: null,
    };
  }

  const building = getBuildingAtCell(cell.x, cell.y);
  const vehicles = getVehiclesAtCell(cell.x, cell.y).filter((vehicle) =>
    vehicle && vehicle.id !== excludeVehicleId,
  );
  const walkableBuilding = building && isConstructibleInstanceWalkableForKind("building", building) ? building : null;
  const blockingBuilding = building && !walkableBuilding ? building : null;
  const walkableVehicle = vehicles.find((vehicle) => isVehicleInstanceWalkable(vehicle)) || null;
  const blockingVehicle = vehicles.find((vehicle) => !isVehicleInstanceWalkable(vehicle)) || null;

  return {
    building,
    walkableBuilding,
    blockingBuilding,
    vehicles,
    walkableVehicle,
    blockingVehicle,
    anyVehicle: vehicles[0] || null,
  };
}

function getBuildingUnitRenderOffsetAtCell(building, x, y) {
  const unitRenderOffsets = getConstructibleSpec("building", building?.type)?.unitRenderOffsets;

  if (!building || !Array.isArray(unitRenderOffsets) || unitRenderOffsets.length === 0) {
    return { x: 0, y: 0 };
  }

  const placementIndex = getConstructiblePlacementIndexAtCellForKind("building", building, x, y);

  if (placementIndex < 0) {
    return { x: 0, y: 0 };
  }

  const offset = unitRenderOffsets[placementIndex];

  return {
    x: Number.isFinite(offset?.x) ? offset.x : 0,
    y: Number.isFinite(offset?.y) ? offset.y : 0,
  };
}

function getCellUnitRenderOffset(cell) {
  if (!cell) {
    return { x: 0, y: 0 };
  }

  const building = getCellConstructibleState(cell).walkableBuilding;

  if (!building) {
    return { x: 0, y: 0 };
  }

  const offset = getBuildingUnitRenderOffsetAtCell(building, cell.x, cell.y);
  const zoom = zoomLevels[zoomIndex];

  return {
    x: offset.x * zoom,
    y: offset.y * zoom,
  };
}

function getCellScreenPositionForUnitRendering(cell) {
  if (!cell) {
    return null;
  }

  const baseScreen = isoToScreen(cell.x, cell.y);
  const offset = getCellUnitRenderOffset(cell);

  return {
    x: baseScreen.x + offset.x,
    y: baseScreen.y + offset.y,
  };
}

function canMountedUnitTraverseTerrain(currentUnit, cell) {
  if (!cell || !currentUnit) {
    return false;
  }

  const movementTerrains = getMountedVehicleRules(currentUnit)?.movementTerrains;

  return Array.isArray(movementTerrains) && movementTerrains.includes(cell.type);
}

function getUnitCellPassabilityState(
  cell,
  currentUnit = null,
  {
    occupiedKeys = null,
    mountedVehicleId = currentUnit?.mountedVehicleId,
    requireUnmounted = false,
    forbidVehicles = false,
  } = {},
) {
  if (!cell) {
    return {
      cell: null,
      terrainOrStructurePassable: false,
      occupiedByOtherUnit: false,
      blockedByVehiclePresence: false,
      canOccupy: false,
      building: null,
      walkableBuilding: null,
      blockingBuilding: null,
      vehicles: [],
      walkableVehicle: null,
      blockingVehicle: null,
      anyVehicle: null,
    };
  }

  const effectiveMountedVehicleId = requireUnmounted
    ? null
    : normalizeLinkedEntityId(mountedVehicleId);
  const effectiveUnit = requireUnmounted && currentUnit
    ? { ...currentUnit, mountedVehicleId: null }
    : currentUnit;
  const constructibleState = getCellConstructibleState(cell, {
    excludeVehicleId: effectiveMountedVehicleId,
  });

  let terrainOrStructurePassable = false;

  if (constructibleState.blockingBuilding || constructibleState.blockingVehicle) {
    terrainOrStructurePassable = false;
  } else if (constructibleState.walkableBuilding) {
    terrainOrStructurePassable = true;
  } else if (constructibleState.walkableVehicle) {
    if (effectiveMountedVehicleId && constructibleState.walkableVehicle.id !== effectiveMountedVehicleId) {
      terrainOrStructurePassable = false;
    } else if (
      constructibleState.walkableVehicle.riderUnitId &&
      constructibleState.walkableVehicle.riderUnitId !== effectiveUnit?.id
    ) {
      terrainOrStructurePassable = false;
    } else {
      terrainOrStructurePassable = true;
    }
  } else if (canMountedUnitTraverseTerrain(effectiveUnit, cell)) {
    terrainOrStructurePassable = true;
  } else if (effectiveMountedVehicleId) {
    terrainOrStructurePassable = false;
  } else {
    terrainOrStructurePassable = cell.type !== "water";
  }

  const occupiedByOtherUnit = occupiedKeys instanceof Set
    ? occupiedKeys.has(createCellKey(cell.x, cell.y))
    : Boolean(getUnitAtCell(cell.x, cell.y, { excludeUnitId: effectiveUnit?.id || null }));
  const blockedByVehiclePresence = forbidVehicles && Boolean(constructibleState.anyVehicle);

  return {
    cell,
    terrainOrStructurePassable,
    occupiedByOtherUnit,
    blockedByVehiclePresence,
    canOccupy: terrainOrStructurePassable && !occupiedByOtherUnit && !blockedByVehiclePresence,
    ...constructibleState,
  };
}

function isBuildingTargetedByDemolishTask(building) {
  if (!building) return false;

  return getUnits().some(
    (currentUnit) =>
      isTaskAction(currentUnit?.task, unitActions.demolish) &&
      buildingOccupiesCell(building, currentUnit.task.toX, currentUnit.task.toY),
  );
}

function findAdjacentSpawnCell(x, y) {
  const originCell = getCell(x, y);

  if (!originCell) return null;

  for (const direction of [
    "east",
    "west",
    "southEast",
    "southWest",
    "northEast",
    "northWest",
    "south",
    "north",
  ]) {
    const neighbor = getNeighborByDirection(originCell, direction);

    if (getUnitCellPassabilityState(neighbor).terrainOrStructurePassable) {
      return neighbor;
    }
  }

  return null;
}

function getNextHouseSpawnUnitTypeId() {
  const context = getRuleContext();

  for (const rule of unitSpawnRules) {
    if (!matchesRequirements(rule?.when, context)) {
      continue;
    }

    const eligibleChoices = (rule?.choices || []).filter((choice) =>
      hasDefinedUnitType(choice?.id) &&
      isUnitTypeAvailable(choice.id, context) &&
      matchesRequirements(choice?.requirements, context),
    );
    const chosenTypeId = chooseWeightedId(eligibleChoices);

    if (chosenTypeId) {
      return normalizeUnitTypeId(chosenTypeId);
    }
  }

  return getDefaultUnitTypeId();
}

function spawnUnitFromHouse(building, unitTypeId = getNextHouseSpawnUnitTypeId()) {
  if (!building) return null;

  const spawnCell = findAdjacentSpawnCell(building.x, building.y);
  const unitType = normalizeUnitTypeId(unitTypeId);

  if (!spawnCell) {
    return null;
  }

  const spawnedUnit = {
    id: createUnitId(),
    unitType,
    name: getDefaultUnitName(unitType),
    x: spawnCell.x,
    y: spawnCell.y,
    facing: "west",
    homeBuildingId: building.id,
    staminaMax: getDefaultUnitStamina(unitType),
    stamina: getDefaultUnitStamina(unitType),
    selected: false,
    task: null,
    move: null,
    turnRoute: null,
    lastStepFromX: null,
    lastStepFromY: null,
  };

  units.push(spawnedUnit);
  updateUnitOccupancyEntry(spawnedUnit);
  syncActiveUnit();

  const spawnTile = getCell(spawnCell.x, spawnCell.y);

  markCellVisitedByUnit(spawnTile);

  invalidateStaticUnitsLayer();
  return spawnedUnit;
}

function makeMap() {
  map.cells = buildGeneratedMapCells(map.width, map.height);
  setTextContent(mapSizeReadouts, strings.readouts.mapSize(map.width, map.height));
  invalidateStaticLayer();
}

function initializeUnit() {
  const spawn = createDefaultUnitState(map.cells, map.width, map.height);

  units = spawn
    ? [{ ...spawn, selected: false, move: null, turnRoute: null, lastStepFromX: null, lastStepFromY: null }]
    : [];
  rebuildUnitOccupancyIndex();
  syncActiveUnit();

  invalidateStaticUnitsLayer();
  updateUnitReadout();
}

function findNearestPassableCell(startX, startY, currentUnit = null, occupiedKeys = null) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = getCell(x, y);

      if (!canUnitEnter(cell, currentUnit, occupiedKeys)) continue;

      const cellDistance = distance(x, y, startX, startY);

      if (cellDistance >= bestDistance) continue;

      best = cell;
      bestDistance = cellDistance;
    }
  }

  return best;
}

function canUnitEnter(cell, currentUnit = null, occupiedKeys = null) {
  return getUnitCellPassabilityState(cell, currentUnit, { occupiedKeys }).canOccupy;
}

function getUnitDismountTargetCells(currentUnit, originCellOverride = null) {
  const mountedVehicle = getMountedVehicle(currentUnit);
  const originCell = originCellOverride || (mountedVehicle ? getCell(mountedVehicle.x, mountedVehicle.y) : getCell(currentUnit?.x, currentUnit?.y));

  if (!originCell || !currentUnit) {
    return [];
  }

  return getAdjacentCells(originCell).filter((cell) =>
    getUnitCellPassabilityState(cell, currentUnit, {
      requireUnmounted: true,
      forbidVehicles: true,
    }).canOccupy,
  );
}

function isValidUnitDismountTargetCell(currentUnit, destinationCell, originCellOverride = null) {
  if (!destinationCell) {
    return false;
  }

  return getUnitDismountTargetCells(currentUnit, originCellOverride).some(
    (cell) => cell.x === destinationCell.x && cell.y === destinationCell.y,
  );
}

function canMountVehicle(currentUnit, vehicle) {
  if (!currentUnit || !vehicle || !isVehicleInstanceWalkable(vehicle)) {
    return false;
  }

  if (vehicle.riderUnitId && vehicle.riderUnitId !== currentUnit.id) {
    return false;
  }

  if (currentUnit.mountedVehicleId && currentUnit.mountedVehicleId !== vehicle.id) {
    return false;
  }

  return vehicleOccupiesCell(vehicle, currentUnit.x, currentUnit.y);
}

function mountUnitOnVehicle(currentUnit, vehicle, { refreshPresentation = true } = {}) {
  if (!canMountVehicle(currentUnit, vehicle)) {
    return false;
  }

  if (currentUnit.mountedVehicleId === vehicle.id && vehicle.riderUnitId === currentUnit.id) {
    return true;
  }

  currentUnit.mountedVehicleId = vehicle.id;
  currentUnit.turnRoute = null;
  vehicle.riderUnitId = currentUnit.id;
  vehicle.x = currentUnit.x;
  vehicle.y = currentUnit.y;

  if (refreshPresentation) {
    invalidateStaticLayer();
    invalidateStaticUnitsLayer();
  }

  return true;
}

function maybeMountUnitAtCurrentCell(currentUnit, options = {}) {
  if (!currentUnit || currentUnit.mountedVehicleId) {
    return false;
  }

  const vehicle = getWalkableVehicleAtCell(currentUnit.x, currentUnit.y);

  if (!vehicle) {
    return false;
  }

  return mountUnitOnVehicle(currentUnit, vehicle, options);
}

function findUnitDismountCell(currentUnit) {
  return getUnitDismountTargetCells(currentUnit)[0] || null;
}

function applyUnitDismount(
  currentUnit,
  destinationCell,
  {
    updateSelectedAction = true,
    refreshPresentation = true,
    setLastStepFromOrigin = false,
  } = {},
) {
  const mountedVehicle = getMountedVehicle(currentUnit);
  const originCell = mountedVehicle ? getCell(mountedVehicle.x, mountedVehicle.y) : getCell(currentUnit?.x, currentUnit?.y);

  if (!currentUnit || !mountedVehicle || !destinationCell || !isValidUnitDismountTargetCell(currentUnit, destinationCell, originCell)) {
    return false;
  }

  const originX = currentUnit.x;
  const originY = currentUnit.y;
  const nextFacing = getMoveDirection(originX, originY, destinationCell.x, destinationCell.y) || currentUnit.facing;

  mountedVehicle.riderUnitId = null;
  currentUnit.mountedVehicleId = null;
  currentUnit.x = destinationCell.x;
  currentUnit.y = destinationCell.y;
  updateUnitOccupancyEntry(currentUnit, originX, originY);
  currentUnit.facing = nextFacing;
  currentUnit.lastStepFromX = setLastStepFromOrigin ? originX : null;
  currentUnit.lastStepFromY = setLastStepFromOrigin ? originY : null;
  markCellVisitedByUnit(destinationCell);

  if (updateSelectedAction) {
    selectedUnitAction = getPreferredUnitAction(currentUnit, unitActions.walk);
  }

  invalidateStaticLayer();
  invalidateStaticUnitsLayer();

  if (refreshPresentation) {
    refreshUnitAndTurnPresentationAndDraw({ autoAdvance: true });
  }

  return true;
}

function dismountUnit(currentUnit = getSelectedUnit(), destinationCell = null) {
  const resolvedDestinationCell =
    destinationCell && Number.isInteger(destinationCell.x) && Number.isInteger(destinationCell.y)
      ? getCell(destinationCell.x, destinationCell.y)
      : findUnitDismountCell(currentUnit);

  return applyUnitDismount(currentUnit, resolvedDestinationCell);
}

function updateUnitReadout() {
  const selectedUnit = getSelectedUnit();
  const displayedUnit = selectedUnit || unit;
  const setCancelButtonState = (visible, disabled = false) => {
    for (const button of cancelUnitTaskButtons) {
      button.hidden = !visible;
      button.disabled = disabled || isReplayPhase();
    }
  };
  const setActionSprite = (imagePath) => {
    for (const image of unitActionSpriteImages) {
      if (imagePath) {
        image.src = imagePath;
      } else {
        image.removeAttribute("src");
      }
    }
  };
  const hideTaskRow = () => {
    setActionSprite("");
    setTextContent(unitActionProgressReadouts, "");
    for (const row of unitTaskRows) {
      row.hidden = true;
    }
    setCancelButtonState(false, true);
  };
  const showTaskRow = (
    imagePath,
    progressText = "",
    { cancelVisible = false, cancelDisabled = false } = {},
  ) => {
    setActionSprite(imagePath);
    setTextContent(unitActionProgressReadouts, progressText);
    for (const row of unitTaskRows) {
      row.hidden = false;
    }
    setCancelButtonState(cancelVisible, cancelDisabled);
  };
  const setUnitTitle = (text) => setTextContent(unitTitleReadouts, text);
  const setTaskAndRefresh = (action, progressText = "", options = {}) => {
    showTaskRow(action, progressText, options);
    updateTileInspectorReadout();
    updateUnitActionControls();
  };
  setDisabledState(nextUnitButtons, !getNextIdleUnit(displayedUnit) || isReplayPhase());

  if (!displayedUnit) {
    setUnitTitle(strings.readouts.unitTitleNone);
    hideTaskRow();
    updateTileInspectorReadout();
    updateUnitActionControls();
    return;
  }

  if (!selectedUnit && getUnits().length > 1) {
    setUnitTitle(strings.readouts.unitTitleNone);
    hideTaskRow();
    updateTileInspectorReadout();
    updateUnitActionControls();
    return;
  }

  const unitName = normalizeUnitName(displayedUnit.name);
  setUnitTitle(unitName);

  if (displayedUnit.move) {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit));
    return;
  }

  if (displayedUnit.task) {
    setTaskAndRefresh(
      getUnitInspectorSpriteImage(displayedUnit),
      getUnitTaskInspectorProgressText(displayedUnit),
      { cancelVisible: true },
    );
    return;
  }

  setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit));
  updateTileInspectorReadout();
  updateUnitActionControls();
}

function getVisibleTopBarMode() {
  if (mainMenuOpen || !interactionMode) return "menu";
  return interactionMode;
}

function updateUnitActionControls() {
  if (!unitActionBar) return;

  const selectedUnit = getSelectedUnit();
  const shouldShow = isPlayMode() && !mainMenuOpen && Boolean(selectedUnit);
  unitActionBar.hidden = !shouldShow;

  if (!shouldShow) {
    updateFoundationActionMenu();
    return;
  }

  const activeAction = getPreferredUnitAction(selectedUnit, getCurrentSelectedUnitAction());
  const context = getRuleContext();
  const disabled = Boolean(selectedUnit?.move) || isReplayPhase();

  if (selectedUnitAction !== activeAction) {
    selectedUnitAction = activeAction;
  }

  for (const button of unitActionButtons) {
    const action = normalizeSelectableUnitAction(button.dataset.unitAction);
    const isAvailable = canUnitUseSelectableAction(selectedUnit, action, context);
    const isSelected = action === activeAction;

    button.hidden = !isAvailable;
    button.classList.toggle("is-selected", isAvailable && isSelected);
    button.setAttribute("aria-pressed", isAvailable && isSelected ? "true" : "false");
    button.disabled = isAvailable ? disabled : true;
  }

  updateFoundationActionMenu();
}

function selectUnit(currentUnit, { scrollIntoView = false, defaultAction = null } = {}) {
  if (!currentUnit) return false;

  let didChange = false;

  for (const candidate of getUnits()) {
    const shouldSelect = candidate === currentUnit;

    if (candidate.selected !== shouldSelect) {
      candidate.selected = shouldSelect;
      didChange = true;
    }
  }

  unit = currentUnit;
  selectedUnitAction = getPreferredUnitAction(currentUnit, defaultAction ?? unitActions.walk);
  inspectedPlayCell = null;

  if (scrollIntoView) {
    requestAnimationFrame(() => centerViewportOnUnit(currentUnit));
  }

  refreshAfterUnitSelectionChange({
    scheduleAnimationPlayback: shouldAnimateSelectionMarker(),
  });
  return didChange;
}

function ensureIdleUnitSelection({ force = false, scrollIntoView = false, defaultAction = null } = {}) {
  if (!isPlayMode() || mainMenuOpen || isReplayPhase()) {
    return false;
  }

  const idleUnit = getFirstIdleUnit();

  if (!idleUnit) {
    return false;
  }

  const selectedUnit = getSelectedUnit();

  if (!force && !selectedUnit && isPlayTileInspectionActive()) {
    return false;
  }

  if (force || !selectedUnit || !isUnitIdle(selectedUnit)) {
    selectUnit(idleUnit, { scrollIntoView, defaultAction });
    return true;
  }

  return false;
}

function updateInteractionModeUi() {
  appShell?.classList.toggle("intro-book-mode", bookOverlayIntroMode);
  const visibleTopBarMode = getVisibleTopBarMode();

  for (const [mode, topBar] of Object.entries(topBars)) {
    if (!topBar) continue;
    topBar.hidden = mode !== visibleTopBarMode;
  }

  if (playInspector) {
    playInspector.hidden = visibleTopBarMode !== interactionModes.play;
  }

  if (editInspector) {
    editInspector.hidden = visibleTopBarMode !== interactionModes.edit;
  }

  if (editorResearchOverlay && !editorResearchOverlay.hidden && visibleTopBarMode !== interactionModes.edit) {
    closeEditorResearchPanel();
  }

  if (bookOverlay && !bookOverlay.hidden && visibleTopBarMode !== interactionModes.play) {
    closeBookOverlay();
  }

  for (const button of newRandomMapButtons) {
    button.hidden = !isEditMode();
  }

  for (const button of newEmptyMapButtons) {
    button.hidden = !isEditMode();
  }

  setTextContent(appSubtitleElements, getAppSubtitleText());
  canvas.dataset.mode = interactionMode || "";
  updateEditInspector();
  updatePlayOverlayLayout();

  updateTurnControls();
  updatePersistenceControls();
  updateTileInspectorReadout();
  updateUnitActionControls();
  updateEditorResearchPanel();
  void syncBackgroundMusicPlayback();
}

function isEditMode() {
  return interactionMode === interactionModes.edit;
}

function isPlayMode() {
  return interactionMode === interactionModes.play;
}

function resetTileReadout() {
  setTextContent(hoverReadouts, strings.readouts.tileNone);
}

function clearUnitSelectionState({ syncActive = true } = {}) {
  let didChange = false;

  for (const currentUnit of getUnits()) {
    if (!currentUnit.selected) continue;
    currentUnit.selected = false;
    didChange = true;
  }

  if (!didChange) return false;

  if (syncActive) {
    syncActiveUnit();
  }

  selectedUnitAction = null;
  return true;
}

function clearUnitSelection() {
  if (!clearUnitSelectionState()) return;

  refreshAfterUnitSelectionChange({ drawNow: false });
}

function openMainMenu() {
  clearPendingAutoAdvance();
  closeGameActionMenu();
  closeSaveSlotPanel();
  closeEditorResearchPanel();
  closeBookOverlay({ restoreState: false });
  clearEditHoverState();
  clearUnitSelection();
  mainMenuOpen = true;
  mainMenuOverlay.hidden = false;
  setMainMenuLoadingState(false);
  updateInteractionModeUi();
  mainMenuOverlay.querySelector(".main-menu-item:not(:disabled)")?.focus({ preventScroll: true });
  draw();
}

function setInteractionMode(nextMode) {
  if (!Object.values(interactionModes).includes(nextMode)) return;

  const didChange = interactionMode !== nextMode || mainMenuOpen;

  clearPendingAutoAdvance();
  interactionMode = nextMode;
  mainMenuOpen = false;
  mainMenuOverlay.hidden = true;
  setMainMenuLoadingState(false);
  closeGameActionMenu();
  closeSaveSlotPanel();
  closeEditorResearchPanel();
  closeBookOverlay({ restoreState: false });
  clearEditHoverState();
  clearUnitSelection();
  refreshAfterModeStateTransition({ drawNow: didChange });
}

function schedulePostModeActivationLayoutRefresh(expectedMode) {
  requestAnimationFrame(() => {
    if (interactionMode !== expectedMode || mainMenuOpen) {
      return;
    }

    layoutCanvas({ preserveCenter: true });
    draw();
  });
}

function activateMode(nextMode) {
  setInteractionMode(nextMode);
  loadCurrentFileForMode(nextMode);
  schedulePostModeActivationLayoutRefresh(nextMode);
}

function startNewGeneratedState(mode, buildCells = buildGeneratedMapCells) {
  if (!mode) return false;

  setInteractionMode(mode);
  applyStateSnapshot(createGeneratedState(mode, buildCells), mode);

  if (mode === interactionModes.play) {
    saveStateToFile(autosaveSlotName, interactionModes.play);
    return true;
  }

  writeCurrentFileName(mode, null);
  if (mode === interactionModes.edit) {
    setEditStateDirty(true);
  }
  updatePersistenceControls();
  return true;
}

function getUnitTargetCells() {
  const selectedUnit = getSelectedUnit();

  if (!selectedUnit) return [];

  if (selectedUnit.move) {
    return [];
  }

  const action = getCurrentSelectedUnitAction();

  if (
    selectedUnit.task &&
    isCellTargetUnitAction(action) &&
    doesSelectedUnitActionMatchTaskAction(action, getTaskActionId(selectedUnit.task))
  ) {
    const destinationCell = getCell(selectedUnit.task.toX, selectedUnit.task.toY);
    return destinationCell ? [destinationCell] : [];
  }

  if (action === unitUiActions.work) {
    return getWorkUiTargetCells(selectedUnit);
  }

  if (action === unitActions.buildHouse) {
    return getBuildableAdjacentCells(selectedUnit);
  }

  if (action === unitActions.dismount) {
    return getUnitDismountTargetCells(selectedUnit);
  }

  if (action === unitActions.layFoundation) {
    const constructible = getSelectedFoundationConstructible();

    if (constructible && isMultiTileConstructible(constructible)) {
      return getHoveredFoundationPlacementCells(selectedUnit);
    }

    return getFoundationPlacementCells(selectedUnit);
  }

  if (action === unitActions.demolish) {
    return getDemolishableAdjacentCells(selectedUnit);
  }

  if (action === unitActions.gatherFood) {
    return getGatherFoodCells(selectedUnit);
  }

  if (action === unitActions.gatherMaterials) {
    return getGatherMaterialsCells(selectedUnit);
  }

  return [];
}

function getUnitTargetStyle() {
  const action = getCurrentSelectedUnitAction();

  if (action === unitActions.demolish) {
    return {
      fill: "rgba(196, 90, 92, 0.2)",
      stroke: "rgba(236, 150, 152, 0.7)",
    };
  }

  if (action === unitActions.buildHouse) {
    return {
      fill: "rgba(209, 182, 99, 0.2)",
      stroke: "rgba(242, 223, 156, 0.74)",
    };
  }

  if (action === unitActions.layFoundation) {
    return {
      fill: "rgba(138, 107, 62, 0.26)",
      stroke: "rgba(92, 61, 27, 0.94)",
      lineWidth: 2.2,
    };
  }

  if (action === unitActions.gatherFood) {
    return {
      fill: "rgba(204, 156, 84, 0.18)",
      stroke: "rgba(243, 207, 127, 0.72)",
    };
  }

  if (action === unitUiActions.work) {
    return {
      fill: "rgba(184, 172, 126, 0.2)",
      stroke: "rgba(231, 219, 173, 0.76)",
    };
  }

  if (action === unitActions.gatherMaterials) {
    return {
      fill: "rgba(152, 162, 190, 0.18)",
      stroke: "rgba(208, 218, 246, 0.72)",
    };
  }

  return {
    fill: "rgba(98, 198, 136, 0.18)",
    stroke: "rgba(152, 236, 185, 0.62)",
  };
}

function isCellVisibleToPlayer(cell) {
  if (!cell) return false;
  if (!isPlayMode()) return true;
  if (cell.visited) return true;

  for (const direction of getMovementDirections()) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (neighbor?.visited) {
      return true;
    }
  }

  return false;
}

function getNeighborByDirection(cell, direction) {
  if (["northWest", "northEast", "southEast", "southWest"].includes(direction)) {
    return getEdgeNeighbor(cell, direction);
  }

  if (["north", "east", "south", "west"].includes(direction)) {
    return getCornerNeighbor(cell, direction);
  }

  return null;
}

function getMovementDirections() {
  return ["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"];
}

function getAdjacentCells(cell) {
  if (!cell) return [];

  const neighbors = [];

  for (const direction of getMovementDirections()) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (neighbor) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function areCellsAdjacent(fromX, fromY, toX, toY) {
  const cell = getCell(fromX, fromY);

  if (!cell) return false;

  return getAdjacentCells(cell).some((neighbor) => neighbor.x === toX && neighbor.y === toY);
}

function canPlaceNewHouseConstructionOnCell(cell) {
  return canPlaceNewBuildingConstructionOnCell(cell, "house");
}

function canStartNewHouseConstructionOnCell(cell) {
  return isBuildingTypeAvailable("house") && canPlaceNewHouseConstructionOnCell(cell) && canAffordConstructibleType("building", "house");
}

function getConstructionEntityAtCell(cell, { kind = null, type = null } = {}) {
  if (!cell) {
    return null;
  }

  const kinds = kind
    ? [normalizeConstructibleKind(kind)]
    : ["building", "vehicle"];

  for (const currentKind of kinds) {
    const constructible = findConstructibleAtCellForKind(currentKind, cell.x, cell.y);

    if (constructible && (!type || constructible.type === type)) {
      return constructible;
    }
  }

  return null;
}

function canContinueConstructionOnCell(cell, { kind = null, type = null } = {}) {
  if (!cell) {
    return false;
  }

  const structure = getConstructionEntityAtCell(cell, { kind, type });
  return Boolean(
    structure &&
      structure.state === "construction",
  );
}

function getBuildHouseTargetMode(cell, { ignoreAffordability = false } = {}) {
  const constructionEntity = getConstructionEntityAtCell(cell);

  if (constructionEntity?.state === "construction") {
    return {
      mode: "construction",
      kind: constructionEntity.riderUnitId !== undefined ? "vehicle" : "building",
      type: constructionEntity.type,
      entity: constructionEntity,
    };
  }

  if (
    isBuildingTypeAvailable("house") &&
    canPlaceNewHouseConstructionOnCell(cell) &&
    (ignoreAffordability || canAffordConstructibleType("building", "house"))
  ) {
    return {
      mode: "new",
      kind: "building",
      type: "house",
    };
  }

  return null;
}

function getBuildableAdjacentCells(currentUnit = unit) {
  const originCell = currentUnit ? getCell(currentUnit.x, currentUnit.y) : null;

  return getAdjacentCells(originCell).filter((cell) => Boolean(getBuildHouseTargetMode(cell, { ignoreAffordability: true })));
}

function doesConstructiblePlacementTouchUnit(originCell, constructible, currentUnit = unit) {
  if (!originCell || !currentUnit || !constructible) {
    return false;
  }

  return getConstructiblePlacementCells(originCell, constructible).some((cell) =>
    areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y),
  );
}

function getFoundationPlacementCells(currentUnit = unit, constructible = getSelectedFoundationConstructible()) {
  if (
    !currentUnit ||
    !constructible ||
    (
      constructible.kind === "building"
        ? !isBuildingTypeAvailable(constructible.type)
        : !isVehicleTypeAvailable(constructible.type)
    )
  ) {
    return [];
  }

  const cells = [];

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = getCell(x, y);

      if (!cell) {
        continue;
      }

      if (!canPlaceNewConstructibleConstructionOnCell(cell, constructible, currentUnit)) {
        continue;
      }

      if (!doesConstructiblePlacementTouchUnit(cell, constructible, currentUnit)) {
        continue;
      }

      cells.push(cell);
    }
  }

  return cells;
}

function getHoveredFoundationPlacementCells(currentUnit = getSelectedUnit(), originCell = playHoverCell) {
  const constructible = getSelectedFoundationConstructible();

  if (
    !currentUnit ||
    !originCell ||
    !constructible ||
    (
      constructible.kind === "building"
        ? !isBuildingTypeAvailable(constructible.type)
        : !isVehicleTypeAvailable(constructible.type)
    ) ||
    getCurrentSelectedUnitAction(currentUnit) !== unitActions.layFoundation
  ) {
    return [];
  }

  if (!canPlaceNewConstructibleConstructionOnCell(originCell, constructible, currentUnit)) {
    return [];
  }

  if (!doesConstructiblePlacementTouchUnit(originCell, constructible, currentUnit)) {
    return [];
  }

  return getConstructiblePlacementCells(originCell, constructible);
}

function getDemolishableAdjacentCells(currentUnit = unit) {
  const originCell = currentUnit ? getCell(currentUnit.x, currentUnit.y) : null;

  return getAdjacentCells(originCell).filter((cell) => {
    const building = getBuildingAtCell(cell.x, cell.y);
    return Boolean(building && building.state === "abandoned");
  });
}

function canGatherFoodFromCell(cell, currentUnit = unit) {
  if (!cell || !currentUnit) return false;

  return hasGatherableFoodResource(cell) && areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
}

function canGatherMaterialsFromCell(cell, currentUnit = unit) {
  if (!cell || !currentUnit) return false;

  return hasMaterialResource(cell) && areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
}

function getGatherFoodCells(currentUnit = unit) {
  if (!currentUnit) return [];

  const originCell = getCell(currentUnit.x, currentUnit.y);
  const candidates = originCell ? getAdjacentCells(originCell) : [];

  return candidates.filter((cell) => canGatherFoodFromCell(cell, currentUnit));
}

function getGatherMaterialsCells(currentUnit = unit) {
  if (!currentUnit) return [];

  const originCell = getCell(currentUnit.x, currentUnit.y);
  const candidates = originCell ? getAdjacentCells(originCell) : [];

  return candidates.filter((cell) => canGatherMaterialsFromCell(cell, currentUnit));
}

function createCellKey(x, y) {
  return `${x},${y}`;
}

function createTurnRouteStateKey(cell, mountedVehicleId = null) {
  return `${createCellKey(cell.x, cell.y)}:${normalizeLinkedEntityId(mountedVehicleId) || "foot"}`;
}

function createPlannerUnitState(currentUnit, cell, mountedVehicleId = null) {
  return {
    ...currentUnit,
    x: cell.x,
    y: cell.y,
    mountedVehicleId: normalizeLinkedEntityId(mountedVehicleId),
  };
}

function getPlannerMountedVehicleIdAfterEnteringCell(currentUnit, cell, mountedVehicleId = null) {
  const normalizedMountedVehicleId = normalizeLinkedEntityId(mountedVehicleId);

  if (!cell) {
    return normalizedMountedVehicleId;
  }

  if (normalizedMountedVehicleId) {
    return normalizedMountedVehicleId;
  }

  const plannerUnit = createPlannerUnitState(currentUnit, cell, null);
  const vehicle = getWalkableVehicleAtCell(cell.x, cell.y);

  return canMountVehicle(plannerUnit, vehicle) ? vehicle.id : null;
}

function canPlannerStateOccupyDestination(currentUnit, cell, destinationCell, mountedVehicleId = null) {
  if (!cell || !destinationCell || cell.x !== destinationCell.x || cell.y !== destinationCell.y) {
    return false;
  }

  return canUnitEnter(destinationCell, createPlannerUnitState(currentUnit, cell, mountedVehicleId));
}

function buildTurnRoutes(
  currentUnit,
  cell,
  destinationCell,
  remainingStamina,
  context = getRuleContext(),
  visitedKeys,
  steps = [],
  mountedVehicleId = normalizeLinkedEntityId(currentUnit?.mountedVehicleId),
) {
  if (!cell || !destinationCell) return [];

  if (steps.length > 0 && canPlannerStateOccupyDestination(currentUnit, cell, destinationCell, mountedVehicleId)) {
    return [{ steps }];
  }

  const routes = [];
  const normalizedMountedVehicleId = normalizeLinkedEntityId(mountedVehicleId);
  const plannerUnit = createPlannerUnitState(currentUnit, cell, normalizedMountedVehicleId);
  const shouldConsiderAutomaticDismount =
    Boolean(normalizedMountedVehicleId) &&
    !canUnitEnter(destinationCell, plannerUnit);

  if (remainingStamina <= 0) {
    return steps.length > 0 ? [{ steps }] : [];
  }

  if (shouldConsiderAutomaticDismount) {
    for (const dismountCell of getUnitDismountTargetCells(plannerUnit, cell)) {
      const direction = getMoveDirection(cell.x, cell.y, dismountCell.x, dismountCell.y);
      const moveCost = getUnitMoveCost(dismountCell, cell, plannerUnit, context);

      if (!Number.isFinite(moveCost) || moveCost > remainingStamina) {
        continue;
      }

      const dismountStateKey = createTurnRouteStateKey(dismountCell, null);

      if (visitedKeys.has(dismountStateKey)) {
        continue;
      }

      const nextSteps = steps.concat({
        type: "dismount",
        cell: dismountCell,
        direction,
        moveCost,
      });
      const nextVisitedKeys = new Set(visitedKeys);
      nextVisitedKeys.add(dismountStateKey);
      const childRoutes = buildTurnRoutes(
        currentUnit,
        dismountCell,
        destinationCell,
        Math.max(0, remainingStamina - moveCost),
        context,
        nextVisitedKeys,
        nextSteps,
        null,
      );

      if (childRoutes.length > 0) {
        routes.push(...childRoutes);
        continue;
      }

      routes.push({ steps: nextSteps });
    }
  }

  const directions = getMovementDirections();

  for (const direction of directions) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (!canUnitEnter(neighbor, plannerUnit)) continue;
    if (
      steps.length === 0 &&
      neighbor.x === currentUnit.lastStepFromX &&
      neighbor.y === currentUnit.lastStepFromY
    ) {
      continue;
    }

    const nextMountedVehicleId = getPlannerMountedVehicleIdAfterEnteringCell(currentUnit, neighbor, normalizedMountedVehicleId);
    const neighborKey = createTurnRouteStateKey(neighbor, nextMountedVehicleId);

    if (visitedKeys.has(neighborKey)) {
      continue;
    }

    const moveCost = getUnitMoveCost(neighbor, cell, plannerUnit, context);
    const staminaAfterMove = Math.max(0, remainingStamina - moveCost);
    const nextSteps = steps.concat({
      type: "move",
      cell: neighbor,
      direction,
      moveCost,
    });
    const nextVisitedKeys = new Set(visitedKeys);
    nextVisitedKeys.add(neighborKey);
    const childRoutes = buildTurnRoutes(
      currentUnit,
      neighbor,
      destinationCell,
      staminaAfterMove,
      context,
      nextVisitedKeys,
      nextSteps,
      nextMountedVehicleId,
    );

    if (childRoutes.length > 0) {
      routes.push(...childRoutes);
      continue;
    }

    routes.push({ steps: nextSteps });
  }

  return routes;
}

function chooseBestTurnRoute(routes, destinationCell) {
  let bestRoute = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestFirstStepDistance = Number.POSITIVE_INFINITY;
  let bestStepCount = -1;

  for (const route of routes) {
    if (!route?.steps?.length) continue;

    const firstStep = route.steps[0];
    const finalStep = route.steps[route.steps.length - 1];
    const finalDistance = walkingDistance(
      finalStep.cell.x,
      finalStep.cell.y,
      destinationCell.x,
      destinationCell.y,
    );
    const firstStepDistance = walkingDistance(
      firstStep.cell.x,
      firstStep.cell.y,
      destinationCell.x,
      destinationCell.y,
    );

    if (
      finalDistance < bestDistance ||
      (finalDistance === bestDistance && firstStepDistance < bestFirstStepDistance) ||
      (
        finalDistance === bestDistance &&
        firstStepDistance === bestFirstStepDistance &&
        route.steps.length > bestStepCount
      )
    ) {
      bestDistance = finalDistance;
      bestFirstStepDistance = firstStepDistance;
      bestStepCount = route.steps.length;
      bestRoute = route.steps;
    }
  }

  return bestRoute;
}

function getPlannedTurnRoute(currentUnit, task, originCell, destinationCell) {
  if (!currentUnit.turnRoute?.length) {
    const context = getRuleContext();
    const routes = buildTurnRoutes(
      currentUnit,
      originCell,
      destinationCell,
      getUnitStamina(currentUnit),
      context,
      new Set([createTurnRouteStateKey(originCell, currentUnit?.mountedVehicleId)]),
    );
    currentUnit.turnRoute = chooseBestTurnRoute(routes, destinationCell) || null;
  }

  return currentUnit.turnRoute;
}

function getNextMoveStep(currentUnit, task) {
  const originCell = getCell(currentUnit.x, currentUnit.y);
  const destinationCell = getCell(task.toX, task.toY);

  if (!originCell || !destinationCell) return null;

  const route = getPlannedTurnRoute(currentUnit, task, originCell, destinationCell);

  if (!route?.length) return null;

  const [nextStep, ...rest] = route;
  currentUnit.turnRoute = rest.length > 0 ? rest : null;
  return nextStep;
}

function handlePlayModeClick(cell) {
  hideTileMenu();

  if (isReplayPhase()) {
    return;
  }

  const selectedUnit = getSelectedUnit();
  const movingUnit = getMovingUnit();

  if (movingUnit) return;

  if (!cell) {
    if (isPlayTileInspectionActive()) {
      updateTileInspectorReadout();
      draw();
      return;
    }

    inspectedPlayCell = null;
    clearUnitSelection();
    updateTileInspectorReadout();
    maybeAutoAdvanceTurn();
    draw();
    return;
  }

  const clickedUnit = getUnitAtCell(cell.x, cell.y);
  const action = selectedUnit ? getCurrentSelectedUnitAction() : null;

  if (clickedUnit) {
    const wasSelected = clickedUnit.selected;

    if (wasSelected) {
      inspectedPlayCell = cell;
      clearUnitSelection();
      updateTileInspectorReadout();
      maybeAutoAdvanceTurn();
      draw();
      return;
    }

    selectUnit(clickedUnit);
    return;
  }

  if (selectedUnit) {
    if (action === unitActions.play) {
      return;
    }

    if (action === unitActions.research) {
      draw();
      return;
    }

    if (action === unitActions.gatherFood) {
      if (queueUnitGatherFoodTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitUiActions.work) {
      if (queueUnitWorkTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.gatherMaterials) {
      if (queueUnitGatherMaterialsTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.buildHouse) {
      if (queueUnitBuildHouseTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.layFoundation) {
      if (queueUnitLayFoundationTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.demolish) {
      if (queueUnitDemolishTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.dismount) {
      if (queueUnitDismountTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.walk) {
      if (queueUnitMoveTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action) {
      draw();
      return;
    }
  }

  inspectedPlayCell = isCellVisibleToPlayer(cell) ? cell : null;
  clearUnitSelection();
  updateTileInspectorReadout();
  maybeAutoAdvanceTurn();
  draw();
}

function startUnitMove(
  destinationCell,
  direction,
  currentUnit = unit,
  options = {},
) {
  if (!currentUnit) return;

  currentUnit.move = {
    fromX: currentUnit.x,
    fromY: currentUnit.y,
    toX: destinationCell.x,
    toY: destinationCell.y,
    direction: direction || getMoveDirection(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y),
    startedAt: performance.now(),
    mode: options.mode || "move",
  };
  unit = currentUnit;
  refreshAfterUnitTaskChange({ scheduleAnimationPlayback: true });
}

function scheduleAnimation() {
  const interval = getAnimationFrameInterval();

  if (!Number.isFinite(interval)) {
    clearAnimationSchedule();
    return;
  }

  if (animationFrameId) {
    return;
  }

  if (animationTimerId) {
    if (scheduledAnimationIntervalMs <= interval) {
      return;
    }

    clearTimeout(animationTimerId);
    animationTimerId = 0;
    scheduledAnimationIntervalMs = 0;
  }

  const elapsed = performance.now() - lastAnimationFrameAt;

  if (interval <= moveAnimationFrameIntervalMs || elapsed >= interval) {
    scheduledAnimationIntervalMs = interval;
    animationFrameId = requestAnimationFrame(stepAnimations);
    return;
  }

  scheduledAnimationIntervalMs = interval;
  animationTimerId = window.setTimeout(() => {
    animationTimerId = 0;
    scheduledAnimationIntervalMs = 0;
    animationFrameId = requestAnimationFrame(stepAnimations);
  }, Math.max(0, interval - elapsed));
}

function stepAnimations(now) {
  animationFrameId = 0;
  lastAnimationFrameAt = now;

  if (!canRenderAnimatedFrames()) {
    scheduledAnimationIntervalMs = 0;
    return;
  }

  let needsAnotherFrame = shouldAnimateWorkingUnits() || shouldAnimateSelectionMarker();
  const movingUnit = getMovingUnit();

  if (movingUnit?.move) {
    const progress = getUnitMoveProgress(movingUnit, now);

    if (progress >= 1) {
      const completedMove = movingUnit.move;
      const moveFromX = completedMove.fromX;
      const moveFromY = completedMove.fromY;

      if (completedMove.mode === "dismount") {
        applyUnitDismount(
          movingUnit,
          getCell(completedMove.toX, completedMove.toY),
          {
            updateSelectedAction: false,
            refreshPresentation: false,
            setLastStepFromOrigin: true,
          },
        );
      } else {
        movingUnit.x = completedMove.toX;
        movingUnit.y = completedMove.toY;
        updateUnitOccupancyEntry(movingUnit, moveFromX, moveFromY);
        movingUnit.facing = completedMove.direction || movingUnit.facing;
        movingUnit.lastStepFromX = moveFromX;
        movingUnit.lastStepFromY = moveFromY;
        const mountedVehicle = getMountedVehicle(movingUnit);

        if (mountedVehicle) {
          mountedVehicle.x = movingUnit.x;
          mountedVehicle.y = movingUnit.y;
        } else {
          maybeMountUnitAtCurrentCell(movingUnit);
        }
      }

      movingUnit.move = null;

      syncActiveUnit(movingUnit.id);
      refreshAfterWorldAndUnitTaskChange({ drawNow: false });

      if (isReplayPhase()) {
        startNextReplayEvent();
        return;
      }

      maybeAutoAdvanceTurn();
    } else {
      needsAnotherFrame = true;
    }
  }

  draw(now);

  if (needsAnotherFrame) {
    scheduleAnimation();
  }
}

function getUnitMoveProgress(currentUnit = unit, now = performance.now()) {
  if (!currentUnit?.move) return 1;

  const elapsed = now - currentUnit.move.startedAt;
  const spriteConfig = getRenderedUnitSpriteConfig(currentUnit);
  const moveDuration = Number(spriteConfig?.moveDuration);

  return clamp(elapsed / (Number.isFinite(moveDuration) && moveDuration > 0 ? moveDuration : 720), 0, 1);
}

function getUnitScreenPosition(currentUnit = unit, now = performance.now()) {
  if (!currentUnit) return null;
  if (!currentUnit.move) {
    return getCellScreenPositionForUnitRendering(getCell(currentUnit.x, currentUnit.y));
  }

  const progress = easeInOut(getUnitMoveProgress(currentUnit, now));
  const from = getCellScreenPositionForUnitRendering(getCell(currentUnit.move.fromX, currentUnit.move.fromY));
  const to = getCellScreenPositionForUnitRendering(getCell(currentUnit.move.toX, currentUnit.move.toY));

  if (!from || !to) {
    return null;
  }

  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
  };
}

function getStationaryUnitDrawScreenPosition(currentUnit, imagePath, now = performance.now()) {
  const baseScreen = getUnitScreenPosition(currentUnit, now);

  if (!baseScreen) {
    return baseScreen;
  }

  const taskGroundPoint = getTargetBasedWorkTaskGroundPoint(currentUnit);

  if (!taskGroundPoint) {
    return baseScreen;
  }

  const renderSpec = getUnitSpriteRenderSpec(currentUnit);

  return {
    x: taskGroundPoint.x,
    y: taskGroundPoint.y - tile.height * renderSpec.groundOffset,
  };
}

function getUnitGroundPoint(screen, groundOffset = getUnitSpriteConfig()?.groundOffset ?? 0.75) {
  return {
    x: screen.x,
    y: screen.y + tile.height * groundOffset,
  };
}

function getMoveDirection(fromX, fromY, toX, toY) {
  const origin = getCell(fromX, fromY);

  if (!origin) return "west";

  for (const direction of ["northWest", "northEast", "southEast", "southWest"]) {
    const neighbor = getEdgeNeighbor(origin, direction);

    if (neighbor && neighbor.x === toX && neighbor.y === toY) {
      return direction;
    }
  }

  for (const direction of ["north", "east", "south", "west"]) {
    const neighbor = getCornerNeighbor(origin, direction);

    if (neighbor && neighbor.x === toX && neighbor.y === toY) {
      return direction;
    }
  }

  return "west";
}

function getTargetBasedWorkTaskGroundPoint(currentUnit) {
  const task = currentUnit?.task;

  if (!task || !isWorkingTask(task) || !doesTaskUseTargetGroundPoint(task)) {
    return null;
  }

  const baseScreen = getCellScreenPositionForUnitRendering(getCell(currentUnit.x, currentUnit.y));
  const targetCell = getUnitTaskTargetCell(currentUnit);
  const direction = getRawUnitTaskDirection(currentUnit);
  const halfW = tile.width / 2;
  const halfH = tile.height / 2;

  if (!baseScreen) {
    return null;
  }

  switch (direction) {
    case "north":
      return { x: baseScreen.x, y: baseScreen.y };
    case "east":
      return { x: baseScreen.x + halfW, y: baseScreen.y + halfH };
    case "south": {
      const targetScreen = getCellScreenPositionForUnitRendering(targetCell);
      const sourceSouthVertex = { x: baseScreen.x, y: baseScreen.y + tile.height };

      if (!targetScreen) {
        return sourceSouthVertex;
      }

      const targetCenter = { x: targetScreen.x, y: targetScreen.y + halfH };
      return {
        x: (sourceSouthVertex.x + targetCenter.x) / 2,
        y: (sourceSouthVertex.y + targetCenter.y) / 2,
      };
    }
    case "west":
      return { x: baseScreen.x - halfW, y: baseScreen.y + halfH };
    case "northEast":
      return { x: baseScreen.x + halfW / 2, y: baseScreen.y + halfH / 2 };
    case "southEast":
      return { x: baseScreen.x + halfW / 2, y: baseScreen.y + halfH * 1.5 };
    case "southWest":
      return { x: baseScreen.x - halfW / 2, y: baseScreen.y + halfH * 1.5 };
    case "northWest":
      return { x: baseScreen.x - halfW / 2, y: baseScreen.y + halfH / 2 };
    default:
      return null;
  }
}

function getStationaryUnits() {
  if (![interactionModes.play, interactionModes.edit].includes(interactionMode)) {
    return [];
  }

  return getUnits().filter(
    (currentUnit) =>
      currentUnit &&
      !currentUnit.move &&
      (interactionMode === interactionModes.edit || !currentUnit.selected),
  );
}

function getMovingUnit() {
  return getUnits().find((currentUnit) => currentUnit?.move) || null;
}

function compareUnitsByDrawOrder(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
}

function compareConstructiblesByDrawOrder(kind, a, b) {
  const aRow = getConstructibleBottomRowForKind(kind, a);
  const bRow = getConstructibleBottomRowForKind(kind, b);

  if (aRow !== bRow) return aRow - bRow;
  return a.x - b.x;
}

function drawUnitTargets() {
  if (interactionMode !== interactionModes.play || !getSelectedUnit()) {
    return;
  }

  const style = getUnitTargetStyle();

  for (const cell of getUnitTargetCells()) {
    const screen = isoToScreen(cell.x, cell.y);
    drawDiamondPath(screen.x, screen.y);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = Number.isFinite(style.lineWidth) ? style.lineWidth : 1.6;
    ctx.stroke();
  }
}

function getConstructionHintBuildingType(currentUnit = getSelectedUnit(), cell = playHoverCell) {
  if (!currentUnit || !cell) {
    return null;
  }

  const action = getCurrentSelectedUnitAction(currentUnit);
  const canBuildHouse = canUnitUseAction(currentUnit, unitActions.buildHouse);

  if (
    (action === unitUiActions.work || action === unitActions.buildHouse) &&
    canBuildHouse &&
    isBuildingTypeAvailable("house") &&
    canPlaceNewHouseConstructionOnCell(cell) &&
    areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y)
  ) {
    return createFoundationConstructibleDescriptor("building", "house");
  }

  if (action === unitActions.layFoundation) {
    const constructible = getSelectedFoundationConstructible();

    if (
      constructible &&
      (
        constructible.kind === "building"
          ? isBuildingTypeAvailable(constructible.type)
          : isVehicleTypeAvailable(constructible.type)
      ) &&
      canPlaceNewConstructibleConstructionOnCell(cell, constructible, currentUnit) &&
      doesConstructiblePlacementTouchUnit(cell, constructible, currentUnit)
    ) {
      return constructible;
    }
  }

  return null;
}

function canShowBuildHouseCostHint(cell, currentUnit = getSelectedUnit()) {
  if (
    !isPlayMode() ||
    mainMenuOpen ||
    !cell ||
    !currentUnit ||
    currentUnit.move ||
    isReplayPhase()
  ) {
    return false;
  }

  return Boolean(getConstructionHintBuildingType(currentUnit, cell));
}

function drawRoundedRectPath(x, y, width, height, radius) {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  ctx.beginPath();
  ctx.moveTo(x + clampedRadius, y);
  ctx.lineTo(x + width - clampedRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  ctx.lineTo(x + width, y + height - clampedRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  ctx.lineTo(x + clampedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  ctx.lineTo(x, y + clampedRadius);
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
  ctx.closePath();
}

function drawBuildHouseCostHint() {
  if (!canShowBuildHouseCostHint(playHoverCell)) {
    return;
  }

  const constructible = getConstructionHintBuildingType(getSelectedUnit(), playHoverCell)
    || createFoundationConstructibleDescriptor("building", "house");
  const costStatus = getConstructibleBuildCostStatus(constructible.kind, constructible.type);
  const screen = isoToScreen(playHoverCell.x, playHoverCell.y);
  const quantityFontSize = Math.max(10, Math.round(11 * zoomLevels[zoomIndex]));
  const symbolFontSize = Math.max(14, Math.round(18 * zoomLevels[zoomIndex]));
  const paddingX = Math.max(9, Math.round(10 * zoomLevels[zoomIndex]));
  const paddingY = Math.max(7, Math.round(8 * zoomLevels[zoomIndex]));
  const iconGap = Math.max(5, Math.round(6 * zoomLevels[zoomIndex]));
  const rowGap = Math.max(2, Math.round(3 * zoomLevels[zoomIndex]));
  const symbolWidth = Math.max(12, Math.round(14 * zoomLevels[zoomIndex]));
  const subjectBoxSize = {
    width: Math.max(22, Math.round(28 * zoomLevels[zoomIndex])),
    height: Math.max(16, Math.round(18 * zoomLevels[zoomIndex])),
  };
  const resourceBoxSize = {
    width: Math.max(18, Math.round(20 * zoomLevels[zoomIndex])),
    height: Math.max(12, Math.round(14 * zoomLevels[zoomIndex])),
  };
  const subjectImagePath = getConstructibleSpec(constructible.kind, constructible.type)?.subtypes?.[0]?.image || "";
  const subjectImage = subjectImagePath
    ? (getConstructibleImageRegistryForKind(constructible.kind)[subjectImagePath] || null)
    : null;
  const stoneImage = resourceIconImages[resourceUiIcons.stone] || null;
  const lumberImage = resourceIconImages[resourceUiIcons.lumber] || null;

  const getContainedSize = (image, maxWidth, maxHeight) => {
    if (!image?.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      return { width: maxWidth, height: maxHeight };
    }

    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);

    return {
      width: Math.max(1, image.naturalWidth * scale),
      height: Math.max(1, image.naturalHeight * scale),
    };
  };

  const subjectSize = getContainedSize(subjectImage, subjectBoxSize.width, subjectBoxSize.height);
  const stoneSize = getContainedSize(stoneImage, resourceBoxSize.width, resourceBoxSize.height);
  const lumberSize = getContainedSize(lumberImage, resourceBoxSize.width, resourceBoxSize.height);
  const iconRowHeight = Math.max(subjectBoxSize.height, resourceBoxSize.height, symbolFontSize);

  ctx.save();
  ctx.font = `${quantityFontSize}px "Oldania ADF Std", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const quantityMetrics = costStatus.entries.map((entry) => ({
    text: formatDisplayedQuantity(entry.required),
    color: entry.affordable ? "rgba(247, 231, 181, 0.96)" : "rgba(255, 126, 122, 0.98)",
    width: ctx.measureText(formatDisplayedQuantity(entry.required)).width,
  }));
  const resourceBlockWidth = Math.max(
    resourceBoxSize.width,
    ...quantityMetrics.map((metric) => metric.width),
  );
  const contentWidth =
    subjectBoxSize.width +
    iconGap +
    symbolWidth +
    iconGap +
    resourceBlockWidth +
    iconGap +
    symbolWidth +
    iconGap +
    resourceBlockWidth;
  const boxWidth = Math.ceil(contentWidth + paddingX * 2);
  const boxHeight = Math.ceil(iconRowHeight + rowGap + quantityFontSize + paddingY * 2);
  const boxX = clamp(
    Math.round(screen.x - boxWidth / 2),
    8,
    Math.max(8, ctx.canvas.width - boxWidth - 8),
  );
  const boxY = clamp(
    Math.round(screen.y - boxHeight - 5),
    8,
    Math.max(8, ctx.canvas.height - boxHeight - 8),
  );
  const contentStartX = boxX + paddingX;
  const iconCenterY = boxY + paddingY + iconRowHeight / 2;
  const quantityY = boxY + paddingY + iconRowHeight + rowGap + quantityFontSize / 2;

  drawRoundedRectPath(boxX, boxY, boxWidth, boxHeight, Math.max(8, Math.round(10 * zoomLevels[zoomIndex])));
  ctx.fillStyle = "rgba(18, 17, 14, 0.88)";
  ctx.fill();
  ctx.strokeStyle = costStatus.affordable ? "rgba(244, 220, 149, 0.72)" : "rgba(236, 125, 118, 0.82)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const drawHintImage = (
    image,
    x,
    y,
    width,
    height,
    fallbackText = "",
    {
      align = "center",
      drawWidth = width,
      drawHeight = height,
    } = {},
  ) => {
    if (image?.complete && image.naturalWidth > 0) {
      const resolvedDrawWidth = Math.max(1, drawWidth);
      const resolvedDrawHeight = Math.max(1, drawHeight);
      const drawX = x + (width - resolvedDrawWidth) / 2;
      const drawY = align === "bottom"
        ? y + height - resolvedDrawHeight
        : y + (height - resolvedDrawHeight) / 2;

      ctx.drawImage(image, drawX, drawY, resolvedDrawWidth, resolvedDrawHeight);
      return;
    }

    if (fallbackText) {
      ctx.save();
      ctx.font = `${symbolFontSize}px "Oldania ADF Std", Georgia, serif`;
      ctx.fillStyle = "rgba(247, 231, 181, 0.96)";
      ctx.fillText(fallbackText, x + width / 2, y + height / 2);
      ctx.restore();
    }
  };

  let cursorX = contentStartX;

  drawHintImage(
    subjectImage,
    cursorX,
    iconCenterY - subjectBoxSize.height / 2,
    subjectBoxSize.width,
    subjectBoxSize.height,
    getFoundationConstructibleIcon(constructible),
    {
      align: "bottom",
      drawWidth: subjectSize.width,
      drawHeight: subjectSize.height,
    },
  );
  cursorX += subjectBoxSize.width + iconGap;

  ctx.save();
  ctx.font = `${symbolFontSize}px "Oldania ADF Std", Georgia, serif`;
  ctx.fillStyle = "rgba(247, 231, 181, 0.96)";
  ctx.fillText("=", cursorX + symbolWidth / 2, iconCenterY);
  ctx.fillText("+", cursorX + symbolWidth / 2 + symbolWidth + iconGap + resourceBlockWidth + iconGap + symbolWidth / 2, iconCenterY);
  ctx.restore();

  cursorX += symbolWidth + iconGap;

  const firstResourceCenterX = cursorX + resourceBlockWidth / 2;
  drawHintImage(
    stoneImage,
    firstResourceCenterX - resourceBoxSize.width / 2,
    iconCenterY - resourceBoxSize.height / 2,
    resourceBoxSize.width,
    resourceBoxSize.height,
    "◆",
    {
      drawWidth: stoneSize.width,
      drawHeight: stoneSize.height,
    },
  );
  ctx.fillStyle = quantityMetrics[0].color;
  ctx.fillText(quantityMetrics[0].text, firstResourceCenterX, quantityY);

  cursorX += resourceBlockWidth + iconGap + symbolWidth + iconGap;

  const secondResourceCenterX = cursorX + resourceBlockWidth / 2;
  drawHintImage(
    lumberImage,
    secondResourceCenterX - resourceBoxSize.width / 2,
    iconCenterY - resourceBoxSize.height / 2,
    resourceBoxSize.width,
    resourceBoxSize.height,
    "▤",
    {
      drawWidth: lumberSize.width,
      drawHeight: lumberSize.height,
    },
  );
  ctx.fillStyle = quantityMetrics[1].color;
  ctx.fillText(quantityMetrics[1].text, secondResourceCenterX, quantityY);

  ctx.restore();
}

function drawInspectedPlayCellMarker() {
  if (!isPlayTileInspectionActive()) {
    return;
  }

  const inspectedCell = getInspectedPlayCell();

  if (!inspectedCell) {
    return;
  }

  const screen = isoToScreen(inspectedCell.x, inspectedCell.y);

  ctx.save();
  drawDiamondPath(screen.x, screen.y);
  ctx.strokeStyle = "rgb(102, 171, 255)";
  ctx.lineWidth = Math.max(2, 2.4 * zoomLevels[zoomIndex]);
  ctx.stroke();
  ctx.restore();
}

function drawUnitMoveTaskLines(now = performance.now()) {
  if (interactionMode !== interactionModes.play) {
    return;
  }

  const movingUnits = getUnits().filter((currentUnit) => {
    if (!currentUnit) {
      return false;
    }

    const moveTarget = isReplayPhase()
      ? turnReplayMoveTargets.get(currentUnit.id) || null
      : (isTaskAction(currentUnit.task, unitActions.walk) ? currentUnit.task : null);

    if (!moveTarget) {
      return false;
    }

    return moveTarget.toX !== currentUnit.x || moveTarget.toY !== currentUnit.y || Boolean(currentUnit.move);
  });

  if (movingUnits.length === 0) {
    return;
  }

  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const currentUnit of movingUnits) {
    const moveTarget = isReplayPhase()
      ? turnReplayMoveTargets.get(currentUnit.id) || null
      : currentUnit.task;
    const fromScreen = getUnitScreenPosition(currentUnit, now);
    const destinationCell = moveTarget ? getCell(moveTarget.toX, moveTarget.toY) : null;

    if (!fromScreen || !destinationCell) {
      continue;
    }

    const fromGround = getUnitGroundPoint(fromScreen);
    const toScreen = getCellScreenPositionForUnitRendering(destinationCell);

    if (!toScreen) {
      continue;
    }

    const toPoint = {
      x: toScreen.x,
      y: toScreen.y + tile.height * 0.52,
    };

    ctx.strokeStyle = "rgba(18, 22, 20, 0.45)";
    ctx.lineWidth = Math.max(2.5, 3 * zoomLevels[zoomIndex]);
    ctx.beginPath();
    ctx.moveTo(fromGround.x, fromGround.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 224, 170, 0.8)";
    ctx.lineWidth = Math.max(1.2, 1.5 * zoomLevels[zoomIndex]);
    ctx.beginPath();
    ctx.moveTo(fromGround.x, fromGround.y);
    ctx.lineTo(toPoint.x, toPoint.y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSelectedUnitMarker() {
  const selectedUnit = getSelectedUnit();

  if (interactionMode !== interactionModes.play || !selectedUnit) return;

  const screen = getUnitScreenPosition(selectedUnit);

  if (!screen) return;

  const now = performance.now();
  const pulse = (Math.sin(now / 320) + 1) / 2;
  const centerY = screen.y + tile.height * 0.66;
  const radiusX = tile.width * (0.29 + pulse * 0.05);
  const radiusY = tile.height * (0.112 + pulse * 0.02);
  const fillAlpha = 0.5 + pulse * 0.22;

  ctx.save();
  ctx.fillStyle = `rgba(68, 98, 178, ${fillAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    screen.x,
    centerY,
    radiusX,
    radiusY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgb(102, 171, 255)";
  ctx.lineWidth = Math.max(1.5, 2 * zoomLevels[zoomIndex]);
  ctx.beginPath();
  ctx.ellipse(
    screen.x,
    centerY,
    radiusX,
    radiusY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  ctx.restore();
}

function drawMovingUnit(now = performance.now()) {
  if (interactionMode !== interactionModes.play) return;

  const movingUnit = getMovingUnit();

  if (!movingUnit) return;

  const screen = getUnitScreenPosition(movingUnit, now);
  const direction = movingUnit.move?.direction || movingUnit.facing || "west";
  const imagePath = getMovingUnitImage(movingUnit, direction, now);
  const dismountVehicleScreen =
    movingUnit.move?.mode === "dismount"
      ? getCellScreenPositionForUnitRendering(getCell(movingUnit.move.fromX, movingUnit.move.fromY))
      : null;

  if (!screen) return;

  if (movingUnit.move?.mode === "dismount" && dismountVehicleScreen) {
    const mountedVehicle = getMountedVehicle(movingUnit);

    if (mountedVehicle) {
      drawConstructibleForKind("vehicle", mountedVehicle);
    } else {
      drawMountedVehicleAtScreen(dismountVehicleScreen, movingUnit, ctx, { now });
    }
  } else {
    drawMountedVehicleAtScreen(screen, movingUnit, ctx, { now });
  }
  drawUnitAtScreen(
    screen,
    ctx,
    imagePath,
    shouldMirrorUnitImage(imagePath, movingUnit),
    !movingUnit.selected,
    movingUnit,
  );
}

function drawSelectedStationaryUnit(now = performance.now()) {
  const selectedUnit = getSelectedUnit();

  if (interactionMode !== interactionModes.play || !selectedUnit || selectedUnit.move) {
    return;
  }

  const imagePath = getStationaryUnitImage(selectedUnit, now);
  const screen = getStationaryUnitDrawScreenPosition(selectedUnit, imagePath, now);

  if (!screen) {
    return;
  }

  drawMountedVehicleAtScreen(screen, selectedUnit, ctx, { now });
  drawUnitAtScreen(
    screen,
    ctx,
    imagePath,
    shouldMirrorUnitImage(imagePath, selectedUnit),
    false,
    selectedUnit,
  );
}

function drawStationaryUnits(drawContext = ctx, frameIndex = 0) {
  const stationaryUnits = getStationaryUnits().slice().sort(compareUnitsByDrawOrder);

  for (const stationaryUnit of stationaryUnits) {
    const imagePath = getStationaryUnitImage(stationaryUnit, undefined, frameIndex);
    const screen = getStationaryUnitDrawScreenPosition(stationaryUnit, imagePath);

    if (!screen) {
      continue;
    }

    drawMountedVehicleAtScreen(screen, stationaryUnit, drawContext, { frameIndex });

    drawUnitAtScreen(
      screen,
      drawContext,
      imagePath,
      shouldMirrorUnitImage(imagePath, stationaryUnit),
      !stationaryUnit.selected,
      stationaryUnit,
    );
  }
}

function getUnitDisplayDirection(currentUnit) {
  if (isUnitWorking(currentUnit)) {
    return getUnitTaskDirection(currentUnit);
  }

  return currentUnit?.facing || "west";
}

function drawMountedVehicleAtScreen(
  screen,
  currentUnit,
  drawContext = ctx,
  { now = performance.now(), frameIndex = null } = {},
) {
  const mountedVehicle = getMountedVehicle(currentUnit);

  if (!screen || !mountedVehicle || !isVehicleInstanceWalkable(mountedVehicle)) {
    return;
  }

  const mountedVehicleSpriteConfig = getMountedVehicleSpriteConfig(currentUnit);
  if (!mountedVehicleSpriteConfig) {
    return;
  }

  if (getSpriteAnimationImagePaths(mountedVehicleSpriteConfig).length === 0) {
    return;
  }

  const direction = currentUnit?.move?.direction || getUnitDisplayDirection(currentUnit);
  const imagePath = currentUnit?.move
    ? getMovingSpriteImage(currentUnit, mountedVehicleSpriteConfig, direction, now)
    : getStationarySpriteImage(currentUnit, mountedVehicleSpriteConfig, now, frameIndex);

  if (!imagePath) {
    return;
  }

  drawSpriteAtScreen(
    screen,
    drawContext,
    imagePath,
    vehicleImages,
    mountedVehicleSpriteConfig,
    shouldMirrorSpriteImage(imagePath, currentUnit, mountedVehicleSpriteConfig),
    false,
    currentUnit,
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

function isFishingTask(currentUnit) {
  if (currentUnit?.task?.type !== "gatherFood") {
    return false;
  }

  const targetCell = getUnitTaskTargetCell(currentUnit);
  return targetCell?.foodType === "fish";
}

function getGatherTaskProgressText(task) {
  const gatherDurationTurns = getGatherTaskDurationTurns();
  const completedTurns = clampInteger(
    gatherDurationTurns - clampInteger(task?.turnsRemaining, 0, gatherDurationTurns, gatherDurationTurns),
    0,
    gatherDurationTurns,
    0,
  );

  return `${completedTurns}/${gatherDurationTurns}`;
}

function getDirectionalSpriteSourceCandidates(variant) {
  return spriteDirectionalSourceCandidateSets[variant] || [];
}

function getSpriteResolvedImagePath(sourceResolution, preferredFrameIndex = 0) {
  if (!sourceResolution || sourceResolution.paths.length === 0) {
    return "";
  }

  return sourceResolution.paths[preferredFrameIndex] || sourceResolution.paths[0] || "";
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

function getAnimatedTaskUnitImage(currentUnit, frameIndex = 0) {
  return getAnimatedTaskSpriteImage(currentUnit, getRenderedUnitSpriteConfig(currentUnit), frameIndex);
}

function getMovePreviewSpriteImage(currentUnit, spriteConfig) {
  const task = currentUnit?.task;
  const direction = currentUnit?.move?.direction || (
    getUnitTaskInspectorPreviewMode(currentUnit) === "move"
      ? getMoveDirection(currentUnit.x, currentUnit.y, task.toX, task.toY)
      : (currentUnit?.facing || "west")
  );
  const sourceResolution = getFirstResolvedSpriteSource(
    spriteConfig,
    getDirectionalSpriteSourceCandidates("move"),
    getSpriteDirectionId(direction, "W"),
  );
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
    return getAnimatedTaskUnitImage(currentUnit, 0);
  }

  return getStationaryUnitImage(currentUnit, performance.now(), 0);
}

function getStationarySpriteImage(currentUnit, spriteConfig, now = performance.now(), explicitFrameIndex = null) {
  if (isUnitWorking(currentUnit)) {
    const frameIndex =
      explicitFrameIndex === null ? getWorkingUnitFrameIndex(now) : explicitFrameIndex;

    return getAnimatedTaskSpriteImage(currentUnit, spriteConfig, frameIndex);
  }

  const sourceResolution = getFirstResolvedSpriteSource(
    spriteConfig,
    getDirectionalSpriteSourceCandidates("stationary"),
    getSpriteRenderDirection(currentUnit),
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
  const sourceResolution = getFirstResolvedSpriteSource(
    spriteConfig,
    getDirectionalSpriteSourceCandidates("move"),
    getSpriteDirectionId(direction, "W"),
  );
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

function getMovingUnitImage(currentUnit = unit, direction = "west", now = performance.now()) {
  return getMovingSpriteImage(
    currentUnit,
    getRenderedUnitSpriteConfig(currentUnit),
    direction,
    now,
  );
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

function getSpriteRenderAction(currentUnit) {
  if (!currentUnit) {
    return "";
  }

  if (currentUnit.move?.mode === "dismount") {
    return unitActions.dismount;
  }

  if (currentUnit.move) {
    return unitActions.walk;
  }

  if (!currentUnit.task) {
    return "";
  }

  return getTaskActionId(currentUnit.task) || "";
}

function getUnitTaskSpriteSourceResolution(currentUnit, spriteConfig) {
  return getFirstResolvedSpriteSource(
    spriteConfig,
    getUnitTaskSpriteSourceCandidates(currentUnit, spriteConfig),
    getSpriteRenderDirection(currentUnit),
  );
}

function getSpriteRenderSourceKey(currentUnit, spriteConfig) {
  return getSpriteRenderSourceResolution(currentUnit, spriteConfig)?.sourceId || "";
}

function getSpriteRenderSourceResolution(currentUnit, spriteConfig) {
  if (!spriteConfig) {
    return null;
  }

  if (!currentUnit) {
    return getFirstResolvedSpriteSource(spriteConfig, spriteTaskSourceCandidateSets.idle, "W");
  }

  if (currentUnit.move) {
    return getFirstResolvedSpriteSource(
      spriteConfig,
      getDirectionalSpriteSourceCandidates("move"),
      getSpriteRenderDirection(currentUnit),
    );
  }

  if (isUnitWorking(currentUnit)) {
    return getUnitTaskSpriteSourceResolution(currentUnit, spriteConfig);
  }

  return getFirstResolvedSpriteSource(
    spriteConfig,
    getDirectionalSpriteSourceCandidates("stationary"),
    getSpriteRenderDirection(currentUnit),
  );
}

function getSpriteRenderSpec(spriteConfig, currentUnit = null) {
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

function getUnitSpriteRenderSpec(currentUnit = null) {
  return getSpriteRenderSpec(getRenderedUnitSpriteConfig(currentUnit), currentUnit);
}

function shouldMirrorSpriteImage(
  imagePath,
  currentUnit = null,
  spriteConfig = getRenderedUnitSpriteConfig(currentUnit),
) {
  const sourceResolution = getSpriteRenderSourceResolution(currentUnit, spriteConfig);

  if (sourceResolution && sourceResolution.paths.includes(imagePath)) {
    return Boolean(sourceResolution.mirror);
  }

  return false;
}

function shouldMirrorUnitImage(imagePath, currentUnit = null) {
  return shouldMirrorSpriteImage(imagePath, currentUnit, getRenderedUnitSpriteConfig(currentUnit));
}

function drawSpriteAtScreen(
  screen,
  drawContext,
  imagePath,
  imageRegistry,
  spriteConfig,
  mirrorX = false,
  showShadow = true,
  currentUnit = null,
) {
  const image = imageRegistry[imagePath];
  const renderSpec = getSpriteRenderSpec(spriteConfig, currentUnit);
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
    x: screen.x + (renderSpec.offsetX || 0) * zoomLevels[zoomIndex],
    y: screen.y + (renderSpec.offsetY || 0) * zoomLevels[zoomIndex],
  };
  const drawWidth = resolvedBaseWidth * zoomLevels[zoomIndex];
  const drawHeight = resolvedBaseHeight * zoomLevels[zoomIndex];
  const drawX = renderScreen.x - resolvedAnchorX * zoomLevels[zoomIndex];
  const ground = getUnitGroundPoint(renderScreen, renderSpec.groundOffset);
  const groundY = ground.y;
  const drawY = groundY - resolvedAnchorY * zoomLevels[zoomIndex];

  drawContext.save();
  if (showShadow) {
    drawContext.fillStyle = "rgba(5, 8, 10, 0.28)";
    drawContext.beginPath();
    drawContext.ellipse(
      renderScreen.x,
      groundY + 2 * zoomLevels[zoomIndex],
      tile.width * 0.15,
      tile.height * 0.08,
      0,
      0,
      Math.PI * 2,
    );
    drawContext.fill();
  }

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
  showShadow = true,
  currentUnit = null,
) {
  return drawSpriteAtScreen(
    screen,
    drawContext,
    imagePath,
    unitImages,
    getRenderedUnitSpriteConfig(currentUnit),
    mirrorX,
    showShadow,
    currentUnit,
  );
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function resizeCanvas() {
  layoutCanvas();
}

function getPlayInspectorOccupiedWidth() {
  if (!isPlayMode() || mainMenuOpen || !playInspector || playInspector.hidden) {
    return 0;
  }

  return playInspector.offsetWidth + 18;
}

function getEditInspectorOccupiedWidth() {
  if (!isEditMode() || mainMenuOpen || !editInspector || editInspector.hidden) {
    return 0;
  }

  return editInspector.offsetWidth + 18;
}

function getViewportVisualCenter() {
  const inspectorOccupiedWidth = getPlayInspectorOccupiedWidth();

  return {
    x: viewport.clientWidth / 2 - inspectorOccupiedWidth / 2,
    y: viewport.clientHeight / 2,
  };
}

function updatePlayOverlayLayout() {
  const inspectorOccupiedWidth = getPlayInspectorOccupiedWidth();
  const centerOffset = inspectorOccupiedWidth / 2;
  const topBarsHeight = topBarsContainer?.offsetHeight || 0;

  if (appShell) {
    appShell.style.setProperty("--play-safe-center-offset", `${-centerOffset}px`);
    appShell.style.setProperty("--top-bars-height", `${topBarsHeight}px`);
  }
}

function layoutCanvas({ preserveCenter = false } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const center = preserveCenter ? getViewportCenterRatio() : null;

  applyZoom();

  const canvasSize = getCanvasSize();
  const mapPixelSize = getMapPixelSize();
  const leftInset = Math.max(canvasPadding, (canvasSize.width - mapPixelSize.width) / 2);
  const topInset = Math.max(canvasPadding, (canvasSize.height - mapPixelSize.height) / 2);

  canvas.style.width = `${canvasSize.width}px`;
  canvas.style.height = `${canvasSize.height}px`;
  canvas.width = Math.round(canvasSize.width * dpr);
  canvas.height = Math.round(canvasSize.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  currentDpr = dpr;

  origin = {
    x: leftInset + tile.width / 2,
    y: topInset,
  };

  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
  draw();
  updateZoomControls();
  updatePlayOverlayLayout();
  updateEditorDropdownMenus();

  if (bookOverlay && !bookOverlay.hidden) {
    updateBookPageStack(bookState);
  }

  if (center) {
    requestAnimationFrame(() => restoreViewportCenter(center));
  } else if (!didCenterInitialView) {
    requestAnimationFrame(centerInitialView);
  }
}

function applyZoom() {
  const zoom = zoomLevels[zoomIndex];
  tile.width = baseTile.width * zoom;
  tile.height = baseTile.height * zoom;
  tile.edge = baseTile.edge * zoom;
}

function getCanvasSize() {
  const mapPixelSize = getMapPixelSize();
  const sidebarSlack =
    isPlayMode() && !mainMenuOpen
      ? ((playInspector?.offsetWidth || 320) + 40)
      : isEditMode() && !mainMenuOpen
        ? ((editInspector?.offsetWidth || 286) + 40)
        : 0;

  return {
    width: Math.ceil(
      Math.max(
        mapPixelSize.width + canvasPadding * 2 + sidebarSlack,
        viewport.clientWidth + canvasPadding * 2 + sidebarSlack,
      ),
    ),
    height: Math.ceil(
      Math.max(
        mapPixelSize.height + canvasPadding * 2,
        viewport.clientHeight + canvasPadding * 2,
      ),
    ),
  };
}

function getMapPixelSize() {
  const hasOffsetRows = map.height > 1;

  return {
    width: map.width * tile.width + (hasOffsetRows ? tile.width / 2 : 0),
    height: (map.height - 1) * (tile.height / 2) + tile.height + tile.edge,
  };
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function walkingDistance(x1, y1, x2, y2) {
  const u1 = x1 + Math.ceil(y1 / 2);
  const v1 = x1 - Math.floor(y1 / 2);
  const u2 = x2 + Math.ceil(y2 / 2);
  const v2 = x2 - Math.floor(y2 / 2);

  return Math.max(Math.abs(u1 - u2), Math.abs(v1 - v2));
}

function isoToScreen(x, y) {
  return {
    x: origin.x + x * tile.width + (y % 2) * (tile.width / 2),
    y: origin.y + y * (tile.height / 2),
  };
}

function drawDiamondPath(cx, cy, lift = 0) {
  const halfW = tile.width / 2;
  const halfH = tile.height / 2;
  const topY = cy - lift;

  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + halfW, topY + halfH);
  ctx.lineTo(cx, topY + tile.height);
  ctx.lineTo(cx - halfW, topY + halfH);
  ctx.closePath();
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

function drawTileOverlays(cell) {
  if (!isCellVisibleToPlayer(cell)) {
    return;
  }

  const screen = isoToScreen(cell.x, cell.y);
  const lift = 0;

  drawCellResourceOverlay(cell, screen, lift);
  drawFogBorders(cell, screen, lift);
  recordTileHitArea(cell, screen, lift);
}

function recordTileHitArea(cell, screen, lift) {
  drawList.push({
    cell,
    points: [
      { x: screen.x, y: screen.y - lift },
      { x: screen.x + tile.width / 2, y: screen.y + tile.height / 2 - lift },
      { x: screen.x, y: screen.y + tile.height - lift },
      { x: screen.x - tile.width / 2, y: screen.y + tile.height / 2 - lift },
    ],
  });
}

function drawInteractiveTileOverlays() {
  if (!isEditMode()) return;

  if (hoverCell) {
    drawTileOverlay(hoverCell, {
      fillStyle: "rgba(255, 239, 158, 0.28)",
      strokeStyle: "#ffe886",
      lineWidth: 2,
    });
  }

  if (activeCell) {
    drawTileOverlay(activeCell, {
      fillStyle: "rgba(215, 180, 91, 0.16)",
      strokeStyle: "#d7b45b",
      lineWidth: 2.5,
    });
  }
}

function drawTileOverlay(cell, style) {
  if (!cell) return;

  const screen = isoToScreen(cell.x, cell.y);

  drawDiamondPath(screen.x, screen.y);
  ctx.fillStyle = style.fillStyle;
  ctx.fill();
  ctx.strokeStyle = style.strokeStyle;
  ctx.lineWidth = style.lineWidth;
  ctx.stroke();
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
  const isFull = pathState === "full";

  if (!isFull) {
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
  const isFull = pathState === "full";

  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(1.3, tile.width * 0.055), 0, Math.PI * 2);
  ctx.fillStyle = isFull ? "rgba(254, 232, 111, 1)" : "rgba(151, 124, 82, 0.28)";
  ctx.fill();
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
  const nodeStates = new Map();
  const nodeTouchCounts = new Map();
  const crossingCaps = new Map();

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = map.cells[y][x];

      if (!isCellVisibleToPlayer(cell)) {
        continue;
      }

      for (const direction of renderedDirections) {
        if (!shouldRenderPathDirectionFromCell(cell, direction)) {
          continue;
        }

        const neighbor = getNeighborByDirection(cell, direction);
        const pathState = getPathStateBetween(cell, neighbor);

        if (!neighbor || !pathState || !isCellVisibleToPlayer(neighbor)) {
          continue;
        }

        for (const endpointCell of [cell, neighbor]) {
          const nodeKey = createCellKey(endpointCell.x, endpointCell.y);
          const currentNodeState = nodeStates.get(nodeKey) || null;
          const currentTouchCount = nodeTouchCounts.get(nodeKey) || 0;

          nodeTouchCounts.set(nodeKey, currentTouchCount + 1);

          if (pathState === "full" || !currentNodeState) {
            nodeStates.set(nodeKey, pathState);
          }
        }
      }
    }
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = map.cells[y][x];
      const nodeState = nodeStates.get(createCellKey(cell.x, cell.y));
      const touchCount = nodeTouchCounts.get(createCellKey(cell.x, cell.y)) || 0;

      if (!nodeState || touchCount < 2 || !isCellVisibleToPlayer(cell)) {
        continue;
      }

      drawPathNode(getTileTopCenter(isoToScreen(cell.x, cell.y)), nodeState);
    }
  }

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = map.cells[y][x];

      if (!isCellVisibleToPlayer(cell)) {
        continue;
      }

      const fromScreen = isoToScreen(cell.x, cell.y);
      const fromPoint = getTileTopCenter(fromScreen);

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

        if (pathState === "full") {
          strokePathSegment(fromPoint, toPoint, direction, {
            strokeStyle: "rgba(12, 11, 10, 0.92)",
            lineWidth: Math.max(3.8, tile.width * 0.095),
            trimDistance: tile.width * 0.06,
          });
          strokePathSegment(fromPoint, toPoint, direction, {
            strokeStyle: "rgba(254, 232, 111, 1)",
            lineWidth: Math.max(2.2, tile.width * 0.065),
          });
        } else {
          strokePathSegment(fromPoint, toPoint, direction, {
            strokeStyle: "rgba(151, 124, 82, 0.28)",
            lineWidth: Math.max(1.5, tile.width * 0.045),
          });
        }
      }
    }
  }

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = map.cells[y][x];

      if (!isCellVisibleToPlayer(cell)) {
        continue;
      }

      const screen = isoToScreen(cell.x, cell.y);

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
  }

  for (const cap of crossingCaps.values()) {
    drawPathIntersectionCap(cap.point, cap.pathState);
  }

  ctx.restore();
}

function drawVisibleConstructibles(kind, items = getConstructibleCollectionForKind(kind)) {
  const visibleConstructibles = items
    .filter((constructible) => !normalizeLinkedEntityId(constructible?.riderUnitId))
    .filter((constructible) => isCellVisibleToPlayer(getCell(constructible.x, constructible.y)))
    .slice()
    .sort((a, b) => compareConstructiblesByDrawOrder(kind, a, b));

  for (const constructible of visibleConstructibles) {
    drawConstructibleForKind(kind, constructible);
  }
}

function getNativeSingleCellDrawBox(centerX, southY, image, zoomScale = zoomLevels[zoomIndex]) {
  if (!image?.naturalWidth || !image?.naturalHeight) {
    return null;
  }

  const drawScale = zoomScale * nativeSingleCellAssetScaleAt100Zoom;
  const drawWidth = image.naturalWidth * drawScale;
  const drawHeight = image.naturalHeight * drawScale;

  return {
    x: centerX - drawWidth / 2,
    y: southY - drawHeight,
    width: drawWidth,
    height: drawHeight,
  };
}

function drawNativeSingleCellImageAtCell(image, cell, drawContext = ctx) {
  if (!image?.complete || image.naturalWidth <= 0 || !cell) {
    return;
  }

  const screen = isoToScreen(cell.x, cell.y);
  const drawBox = getNativeSingleCellDrawBox(
    screen.x,
    screen.y + tile.height,
    image,
    zoomLevels[zoomIndex],
  );

  if (!drawBox) {
    return;
  }

  drawContext.drawImage(
    image,
    drawBox.x,
    drawBox.y,
    drawBox.width,
    drawBox.height,
  );
}

function drawFogBorders(cell, screen, lift) {
  if (!isPlayMode()) return;

  ctx.save();
  ctx.strokeStyle = "rgba(9, 12, 11, 0.52)";
  ctx.lineWidth = Math.max(10, tile.width * 0.19);
  ctx.lineCap = "round";

  for (const edge of getTileEdges(screen, lift)) {
    const neighbor = getEdgeNeighbor(cell, edge.direction);

    if (!neighbor || isCellVisibleToPlayer(neighbor)) continue;

    ctx.beginPath();
    ctx.moveTo(edge.start.x, edge.start.y);
    ctx.lineTo(edge.end.x, edge.end.y);
    ctx.stroke();
  }

  ctx.restore();
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

  const overlayImagePath = getFoodOverlayImagePath(cell.foodType);

  if (overlayImagePath) {
    if (drawFoodOverlayImage(cell.foodType, overlayImagePath, screen, lift)) {
      return;
    }
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

function drawFoodOverlayImage(foodType, imagePath, screen, lift) {
  const image = resourceOverlayImages[imagePath];

  if (!image?.complete || image.naturalWidth <= 0) {
    return false;
  }

  const renderSpec = getFoodOverlayRenderSpec(foodType);
  const drawWidth = tile.width * renderSpec.scale;
  const drawHeight = tile.height * renderSpec.scale;
  const baseY = screen.y - lift + tile.height * renderSpec.baseYFactor;

  ctx.drawImage(
    image,
    screen.x - drawWidth / 2,
    baseY - drawHeight,
    drawWidth,
    drawHeight,
  );
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
    ctx.ellipse(cx + mushroom.x * scale, cy + mushroom.y * scale, mushroom.w * scale, mushroom.h * scale, 0, Math.PI, 0, true);
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
    if (cell.type !== rule.baseType) continue;

    const edges = getTileEdges(screen, lift);

    for (const edge of edges) {
      const neighbor = getEdgeNeighbor(cell, edge.direction);

      if (!neighbor || !rule.neighborTypes.includes(neighbor.type)) continue;

      if (rule.drawEdge) {
        rule.drawEdge(edge, screen, lift);
      }
    }

    if (rule.drawCorner) {
      for (const corner of getTileCorners(screen, lift)) {
        if (!shouldDrawCornerTransition(rule, cell, corner)) continue;

        rule.drawCorner(corner, screen, lift);
      }
    }
  }
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

function getEdgeNeighbor(cell, direction) {
  const isOddRow = cell.y % 2 === 1;
  const offsets = {
    northWest: { x: isOddRow ? 0 : -1, y: -1 },
    northEast: { x: isOddRow ? 1 : 0, y: -1 },
    southEast: { x: isOddRow ? 1 : 0, y: 1 },
    southWest: { x: isOddRow ? 0 : -1, y: 1 },
  };
  const offset = offsets[direction];

  return getCell(cell.x + offset.x, cell.y + offset.y);
}

function getCornerNeighbor(cell, direction) {
  const offsets = {
    north: { x: 0, y: -2 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 2 },
    west: { x: -1, y: 0 },
  };
  const offset = offsets[direction];

  return getCell(cell.x + offset.x, cell.y + offset.y);
}

function getCell(x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
  if (y < 0 || y >= map.height || x < 0 || x >= map.width) return null;

  return map.cells[y]?.[x] || null;
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
  if (drawShoreOverlay(shoreOverlays.edge[edge.direction], screen, lift)) return;

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
  if (drawShoreOverlay(shoreOverlays.corner[corner.direction], screen, lift)) return;

  drawProceduralShoreCorner(corner, screen, lift);
}

function drawShoreOverlay(imagePath, screen, lift) {
  const image = shoreOverlayImages[imagePath];

  if (!image?.complete || image.naturalWidth <= 0) return false;

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function invalidateStaticLayer() {
  staticLayerDirty = true;
}

function invalidateStaticUnitsLayer() {
  staticUnitsLayerDirty = true;
}

function ensureStaticLayerSize() {
  if (staticLayerCanvas.width === canvas.width && staticLayerCanvas.height === canvas.height) {
    return;
  }

  staticLayerCanvas.width = canvas.width;
  staticLayerCanvas.height = canvas.height;
  staticLayerDirty = true;
}

function ensureStaticUnitsLayerSize() {
  const sizesMatch = staticUnitsLayerCanvases.every(
    (layerCanvas) => layerCanvas.width === canvas.width && layerCanvas.height === canvas.height,
  );

  if (sizesMatch) {
    return;
  }

  for (const layerCanvas of staticUnitsLayerCanvases) {
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
  }

  staticUnitsLayerDirty = true;
}

function clearMainCanvas() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function renderStaticLayerToMain() {
  clearMainCanvas();
  drawList = [];

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      drawTileTerrain(map.cells[y][x]);
    }
  }

  drawPaths();

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      drawTileOverlays(map.cells[y][x]);
    }
  }

  drawVisibleConstructibles("building", buildings);
  drawVisibleConstructibles("vehicle", vehicles);
}

function cacheStaticLayer() {
  ensureStaticLayerSize();
  staticLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  staticLayerCtx.clearRect(0, 0, staticLayerCanvas.width, staticLayerCanvas.height);
  staticLayerCtx.drawImage(canvas, 0, 0);
  staticLayerDirty = false;
}

function renderStaticUnitsLayer() {
  ensureStaticUnitsLayerSize();

  for (let frameIndex = 0; frameIndex < staticUnitsLayerCanvases.length; frameIndex += 1) {
    const layerCanvas = staticUnitsLayerCanvases[frameIndex];
    const layerContext = staticUnitsLayerContexts[frameIndex];

    layerContext.setTransform(1, 0, 0, 1, 0, 0);
    layerContext.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
    layerContext.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
    drawStationaryUnits(layerContext, frameIndex);
  }

  staticUnitsLayerDirty = false;
}

function restoreStaticLayerToMain() {
  clearMainCanvas();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(staticLayerCanvas, 0, 0);
  ctx.restore();
}

function restoreStaticUnitsLayerToMain(frameIndex = 0) {
  const layerCanvas = staticUnitsLayerCanvases[frameIndex % staticUnitsLayerCanvases.length];

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerCanvas, 0, 0);
  ctx.restore();
}

function drawDynamicLayer(now = performance.now()) {
  drawInteractiveTileOverlays();

  if (interactionMode === interactionModes.play) {
    drawInspectedPlayCellMarker();
    drawUnitMoveTaskLines(now);
    restoreStaticUnitsLayerToMain(getWorkingUnitFrameIndex(now));
    drawSelectedUnitMarker();
    drawSelectedStationaryUnit(now);
    drawMovingUnit(now);
    drawUnitTargets();
    drawBuildHouseCostHint();
    return;
  }

  if (interactionMode === interactionModes.edit) {
    restoreStaticUnitsLayerToMain(0);
  }
}

function draw(now = performance.now()) {
  ensureStaticLayerSize();
  ensureStaticUnitsLayerSize();

  if (staticLayerDirty) {
    renderStaticLayerToMain();
    cacheStaticLayer();
  } else {
    restoreStaticLayerToMain();
  }

  if (staticUnitsLayerDirty) {
    renderStaticUnitsLayer();
  }

  drawDynamicLayer(now);
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

function pickTile(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const point = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };

  for (let i = drawList.length - 1; i >= 0; i -= 1) {
    const candidate = drawList[i];
    if (pointInPolygon(point, candidate.points)) {
      return candidate.cell;
    }
  }

  return null;
}

function centerInitialView() {
  restoreViewportCenter({ x: 0.5, y: 0.5 });
  didCenterInitialView = true;
}

function getViewportCenterRatio() {
  const visualCenter = getViewportVisualCenter();

  return {
    x: (viewport.scrollLeft + visualCenter.x) / Math.max(1, canvas.offsetWidth),
    y: (viewport.scrollTop + visualCenter.y) / Math.max(1, canvas.offsetHeight),
  };
}

function restoreViewportCenter(center) {
  const maxLeft = Math.max(0, canvas.offsetWidth - viewport.clientWidth);
  const maxTop = Math.max(0, canvas.offsetHeight - viewport.clientHeight);
  const visualCenter = getViewportVisualCenter();

  viewport.scrollLeft = clamp(
    canvas.offsetWidth * center.x - visualCenter.x,
    0,
    maxLeft,
  );
  viewport.scrollTop = clamp(
    canvas.offsetHeight * center.y - visualCenter.y,
    0,
    maxTop,
  );
}

function centerViewportOnUnit(currentUnit) {
  if (!currentUnit) return;

  const screen = getUnitScreenPosition(currentUnit);

  if (!screen) return;

  const maxLeft = Math.max(0, canvas.offsetWidth - viewport.clientWidth);
  const maxTop = Math.max(0, canvas.offsetHeight - viewport.clientHeight);
  const visualCenter = getViewportVisualCenter();

  viewport.scrollLeft = clamp(screen.x - visualCenter.x, 0, maxLeft);
  viewport.scrollTop = clamp(screen.y + tile.height / 2 - visualCenter.y, 0, maxTop);
}

function updateZoomControls() {
  setTextContent(
    zoomLevelReadouts,
    strings.readouts.zoomLevel(Math.round(zoomLevels[zoomIndex] * 100)),
  );
  setDisabledState(zoomOutButtons, zoomIndex === 0);
  setDisabledState(zoomInButtons, zoomIndex === zoomLevels.length - 1);
}

function changeZoom(delta) {
  const nextZoomIndex = clamp(zoomIndex + delta, 0, zoomLevels.length - 1);

  if (nextZoomIndex === zoomIndex) return;

  closeEditorDropdowns();
  zoomIndex = nextZoomIndex;
  layoutCanvas({ preserveCenter: true });
}

function getEditorLabel(key) {
  return strings.editor?.[key] || key;
}

function applyEditorUnitSelection(unitTypeId) {
  if (!activeCell) {
    return;
  }

  const currentUnit = getUnitAtCell(activeCell.x, activeCell.y);

  if (!unitTypeId) {
    const mutation = currentUnit ? removeEditorUnit(currentUnit) : null;
    refreshAfterEditorMutation({
      ...(mutation || {}),
      closeDropdowns: true,
    });
    return;
  }

  if (currentUnit) {
    const previousSnapshot = JSON.stringify(serializeUnit(currentUnit));
    currentUnit.unitType = normalizeUnitTypeId(unitTypeId);
    currentUnit.name = getDefaultUnitName(currentUnit.unitType);
    currentUnit.staminaMax = getDefaultUnitStamina(currentUnit.unitType);
    currentUnit.stamina = clampNumber(currentUnit.stamina, 0, 999, currentUnit.staminaMax);

    if (currentUnit.task && !canUnitUseAction(currentUnit, getTaskActionId(currentUnit.task))) {
      currentUnit.task = null;
    }

    refreshAfterEditorMutation({
      invalidateUnits: true,
      didChange: JSON.stringify(serializeUnit(currentUnit)) !== previousSnapshot,
      closeDropdowns: true,
    });
    return;
  }

  const mutation = placeEditorUnitAtCell(activeCell, unitTypeId);

  if (mutation) {
    refreshAfterEditorMutation({
      ...mutation,
      closeDropdowns: true,
    });
  }
}

function applyEditorUnitActionSelection(action) {
  if (!activeCell) {
    return;
  }

  const currentUnit = getUnitAtCell(activeCell.x, activeCell.y);

  if (!currentUnit) {
    return;
  }

  const previousSnapshot = JSON.stringify(serializeUnit(currentUnit));

  if (!action) {
    currentUnit.task = null;
  } else if (action === unitActions.play) {
    if (!canUnitUseAction(currentUnit, unitActions.play)) {
      return;
    }
    currentUnit.task = createUnitTaskForAction(unitActions.play);
  } else if (action === unitActions.research) {
    if (!canUnitUseAction(currentUnit, unitActions.research) || !getSelectedResearchGoalTechnologyId()) {
      return;
    }
    currentUnit.task = createUnitTaskForAction(unitActions.research);
  } else {
    return;
  }

  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  unit = currentUnit;
  selectedUnitAction = getPreferredUnitAction(currentUnit, getTaskActionId(currentUnit.task));
  refreshAfterEditorMutation({
    invalidateUnits: true,
    didChange: JSON.stringify(serializeUnit(currentUnit)) !== previousSnapshot,
    closeDropdowns: true,
  });
}

function syncBuildingEditorState(building, { abandoned = building?.state === "abandoned" } = {}) {
  if (!building) {
    return;
  }

  if (abandoned) {
    building.state = "abandoned";
    return;
  }

  building.state = getBuildingCompleteness(building) < 1 ? "construction" : "complete";
}

function canPlaceEditorConstructibleAtCell(kind, cell, type) {
  return canPlaceNewConstructibleConstructionOnCellForKind(kind, cell, type);
}

function canPlaceEditorBuildingAtCell(cell, type) {
  return canPlaceEditorConstructibleAtCell("building", cell, type);
}

function canPlaceEditorUnitTypeAtCell(cell, unitTypeId, currentUnit = null) {
  if (!cell || !hasDefinedUnitType(unitTypeId)) {
    return false;
  }

  if (currentUnit && currentUnit.x === cell.x && currentUnit.y === cell.y) {
    return true;
  }

  return getUnitCellPassabilityState(cell, {
    id: `editor_${unitTypeId}`,
    mountedVehicleId: null,
  }, {
    requireUnmounted: true,
  }).canOccupy;
}

function canPlaceEditorVehicleAtCell(originCell, type) {
  return canPlaceEditorConstructibleAtCell("vehicle", originCell, type);
}

function removeEditorUnit(currentUnit) {
  if (!currentUnit) {
    return null;
  }

  const mutation = {
    didChange: true,
    invalidateWorld: false,
    invalidateUnits: true,
  };
  const mountedVehicle = getMountedVehicle(currentUnit);

  if (mountedVehicle) {
    mountedVehicle.riderUnitId = null;
    currentUnit.mountedVehicleId = null;
    mutation.invalidateWorld = true;
  }

  units = units.filter((candidate) => candidate !== currentUnit);
  removeUnitOccupancyEntry(currentUnit);

  if (currentUnit.selected) {
    clearUnitSelectionState({ syncActive: false });
  }

  syncActiveUnit();
  return mutation;
}

function getConstructibleLinkedUnitProperty(kind) {
  return normalizeConstructibleKind(kind) === "vehicle" ? "mountedVehicleId" : "homeBuildingId";
}

function clearUnitsLinkedConstructibleId(kind, constructibleId) {
  const property = getConstructibleLinkedUnitProperty(kind);

  for (const currentUnit of getUnits()) {
    if (currentUnit?.[property] === constructibleId) {
      currentUnit[property] = null;
    }
  }
}

function removeEditorConstructible(kind, constructible) {
  const normalizedKind = normalizeConstructibleKind(kind);

  if (!constructible) {
    return null;
  }

  if (normalizedKind === "vehicle") {
    vehicles = vehicles.filter((candidate) => candidate !== constructible);
  } else {
    buildings = buildings.filter((candidate) => candidate !== constructible);
    clampStockpileToCapacity();
  }

  clearUnitsLinkedConstructibleId(normalizedKind, constructible.id);
  return {
    didChange: true,
    invalidateWorld: true,
    invalidateUnits: true,
  };
}

function placeEditorConstructibleAtCell(kind, cell, type) {
  const normalizedKind = normalizeConstructibleKind(kind);

  if (!canPlaceEditorConstructibleAtCell(normalizedKind, cell, type)) {
    return null;
  }

  const constructible = createConstructibleConstructionAtCellForKind(normalizedKind, cell, type, { spendResources: false });

  if (!constructible) {
    return null;
  }

  constructible.state = "complete";
  constructible.completeness = 1;
  return {
    didChange: true,
    invalidateWorld: true,
    invalidateUnits: false,
  };
}

function placeEditorUnitAtCell(cell, unitTypeId) {
  if (!cell || !canPlaceEditorUnitTypeAtCell(cell, unitTypeId)) {
    return null;
  }

  const normalizedTypeId = normalizeUnitTypeId(unitTypeId);
  const staminaMax = getDefaultUnitStamina(normalizedTypeId);
  const newUnit = {
    id: createUnitId(),
    unitType: normalizedTypeId,
    name: getDefaultUnitName(normalizedTypeId),
    x: cell.x,
    y: cell.y,
    facing: "west",
    homeBuildingId: null,
    mountedVehicleId: null,
    staminaMax,
    stamina: staminaMax,
    selected: false,
    task: null,
    move: null,
    turnRoute: null,
    lastStepFromX: null,
    lastStepFromY: null,
  };

  units.push(newUnit);
  updateUnitOccupancyEntry(newUnit);
  const didMountVehicle = maybeMountUnitAtCurrentCell(newUnit, { refreshPresentation: false });
  syncActiveUnit();
  return {
    didChange: true,
    invalidateWorld: didMountVehicle,
    invalidateUnits: true,
  };
}

function refreshAfterEditorMutation({
  invalidateWorld = false,
  invalidateUnits = false,
  didChange = false,
  closeDropdowns = false,
  drawNow = true,
} = {}) {
  if (invalidateWorld) {
    invalidateStaticLayer();
  }

  if (invalidateUnits) {
    invalidateStaticUnitsLayer();
    updateUnitReadout();
  }

  if (didChange) {
    setEditStateDirty(true);
  }

  updateEditInspector();

  if (closeDropdowns) {
    closeEditorDropdowns();
  }

  if (drawNow) {
    draw();
  }
}

function getEditorConstructibleControls(kind) {
  return normalizeConstructibleKind(kind) === "vehicle"
    ? {
      completionInput: editorVehicleCompletionInput,
      abandonedInput: editorVehicleAbandonedInput,
    }
    : {
      completionInput: editorBuildingCompletionInput,
      abandonedInput: editorBuildingAbandonedInput,
    };
}

function getEditorConstructibleAtActiveCell(kind) {
  return activeCell ? findConstructibleAtCellForKind(kind, activeCell.x, activeCell.y) : null;
}

function applyEditorConstructibleCompletionValue(kind) {
  const constructible = getEditorConstructibleAtActiveCell(kind);

  if (!constructible) {
    return;
  }

  const { completionInput, abandonedInput } = getEditorConstructibleControls(kind);
  const previousSnapshot = JSON.stringify(serializeConstructibleForKind(kind, constructible));
  constructible.completeness = clamp(
    getEditorIntegerInputValue(completionInput, Math.round(getBuildingCompleteness(constructible) * 100), 0, 100) / 100,
    0,
    1,
  );
  syncBuildingEditorState(constructible, { abandoned: Boolean(abandonedInput?.checked) });

  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange: JSON.stringify(serializeConstructibleForKind(kind, constructible)) !== previousSnapshot,
  });
}

function applyEditorConstructibleAbandonedValue(kind) {
  const constructible = getEditorConstructibleAtActiveCell(kind);

  if (!constructible) {
    return;
  }

  const { abandonedInput } = getEditorConstructibleControls(kind);
  const previousSnapshot = JSON.stringify(serializeConstructibleForKind(kind, constructible));
  syncBuildingEditorState(constructible, { abandoned: Boolean(abandonedInput?.checked) });

  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange: JSON.stringify(serializeConstructibleForKind(kind, constructible)) !== previousSnapshot,
  });
}

function applyEditorConstructibleSelection(kind, type, canEditSelection) {
  if (!activeCell || typeof canEditSelection !== "function" || !canEditSelection(activeCell)) {
    return;
  }

  const normalizedKind = normalizeConstructibleKind(kind);
  const currentConstructible = findConstructibleAtCellForKind(normalizedKind, activeCell.x, activeCell.y);

  if (!type) {
    const mutation = currentConstructible ? removeEditorConstructible(normalizedKind, currentConstructible) : null;
    refreshAfterEditorMutation({
      ...(mutation || {}),
      closeDropdowns: true,
    });
    return;
  }

  if (currentConstructible) {
    closeEditorDropdowns();
    return;
  }

  const mutation = placeEditorConstructibleAtCell(normalizedKind, activeCell, type);

  if (mutation) {
    refreshAfterEditorMutation({
      ...mutation,
      closeDropdowns: true,
    });
  }
}

function handlePlayCanvasMove(event) {
  const hoveredCell = pickTile(event.clientX, event.clientY);
  const nextHover = canShowBuildHouseCostHint(hoveredCell) ? hoveredCell : null;
  const changed =
    (!playHoverCell && nextHover) ||
    (playHoverCell && !nextHover) ||
    (playHoverCell &&
      nextHover &&
      (playHoverCell.x !== nextHover.x || playHoverCell.y !== nextHover.y));

  if (!changed) {
    return;
  }

  playHoverCell = nextHover;
  draw();
}

function handlePlayCanvasLeave() {
  if (!playHoverCell) {
    return;
  }

  playHoverCell = null;
  draw();
}

canvas.addEventListener("mousemove", (event) => {
  if (isPlayMode()) {
    handlePlayCanvasMove(event);
    return;
  }

  if (!isEditMode()) return;

  handleEditCanvasMove(event);
});

canvas.addEventListener("click", (event) => {
  const clickedCell = pickTile(event.clientX, event.clientY);

  if (isPlayMode()) {
    handlePlayModeClick(clickedCell);
    return;
  }

  if (!isEditMode()) return;

  handleEditCanvasClick(event, clickedCell);
});

canvas.addEventListener("mouseleave", () => {
  if (isPlayMode()) {
    handlePlayCanvasLeave();
    return;
  }

  if (!isEditMode()) return;

  handleEditCanvasLeave();
});

function applyTerrainSelection(type) {
  if (!activeCell) return;

  const previousSnapshot = JSON.stringify(serializeCell(activeCell));
  setCellTerrain(activeCell, type);
  refreshAfterEditorMutation({
    didChange: JSON.stringify(serializeCell(activeCell)) !== previousSnapshot,
    closeDropdowns: true,
  });
}

function applyEditorFoodSelection(foodType) {
  if (!activeCell || !canEditFoodSelection(activeCell)) {
    return;
  }

  const previousSnapshot = JSON.stringify(serializeCell(activeCell));

  if (!foodType) {
    activeCell.foodType = null;
    activeCell.foodCapacity = 0;
    activeCell.foodAmount = 0;
  } else {
    const definition = getFoodDefinition(foodType);

    if (!definition || definition.terrain !== activeCell.type || definition.terrain === "water") {
      return;
    }

    activeCell.foodType = foodType;
    activeCell.foodCapacity = getFoodTypeMaxAmount(foodType);
    activeCell.foodAmount = activeCell.foodCapacity;
  }

  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange: JSON.stringify(serializeCell(activeCell)) !== previousSnapshot,
    closeDropdowns: true,
  });
}

function applyEditorResourceCurrentValue() {
  if (!activeCell) {
    return;
  }

  const resourceMode = getEditorResourceMode(activeCell);

  if (!resourceMode) {
    return;
  }

  const previousValue =
    resourceMode.kind === "path" ? getCellVisitsCount(activeCell) : clampNonNegativeNumber(activeCell.materialAmount, 999999, 0);

  if (resourceMode.kind === "path") {
    activeCell.visitsCount = getEditorIntegerInputValue(
      editorResourceCurrentInput,
      getCellVisitsCount(activeCell),
      0,
      getCellPathWellKnownVisitsThreshold(activeCell),
    );
  } else {
    activeCell.materialAmount = getEditorNumberInputValue(editorResourceCurrentInput, activeCell.materialAmount, 0);
  }

  const nextValue =
    resourceMode.kind === "path" ? getCellVisitsCount(activeCell) : clampNonNegativeNumber(activeCell.materialAmount, 999999, 0);
  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange: nextValue !== previousValue,
  });
}

function applyEditorResourceTotalValue() {
  return;
}

function applyEditorFoodCurrentValue() {
  if (!activeCell?.foodType) {
    return;
  }

  const previousValue = clampNonNegativeNumber(activeCell.foodAmount, 999999, 0);
  activeCell.foodAmount = getEditorNumberInputValue(editorFoodCurrentInput, activeCell.foodAmount, 0, getCellFoodMaxAmount(activeCell));

  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange: clampNonNegativeNumber(activeCell.foodAmount, 999999, 0) !== previousValue,
  });
}

function applyEditorFoodTotalValue() {
  if (!activeCell?.foodType) {
    return;
  }

  const previousCapacity = getCellFoodMaxAmount(activeCell);
  const previousAmount = clampNonNegativeNumber(activeCell.foodAmount, 999999, 0);
  activeCell.foodCapacity = getEditorNumberInputValue(editorFoodTotalInput, getCellFoodMaxAmount(activeCell), 0);
  activeCell.foodAmount = clampNumber(activeCell.foodAmount, 0, getCellFoodMaxAmount(activeCell), 0);

  refreshAfterEditorMutation({
    invalidateWorld: true,
    didChange:
      getCellFoodMaxAmount(activeCell) !== previousCapacity ||
      clampNonNegativeNumber(activeCell.foodAmount, 999999, 0) !== previousAmount,
  });
}

function applyEditorBuildingCompletionValue() {
  applyEditorConstructibleCompletionValue("building");
}

function applyEditorBuildingAbandonedValue() {
  applyEditorConstructibleAbandonedValue("building");
}

function applyEditorVehicleCompletionValue() {
  applyEditorConstructibleCompletionValue("vehicle");
}

function applyEditorVehicleAbandonedValue() {
  applyEditorConstructibleAbandonedValue("vehicle");
}

function applyEditorBuildingSelection(buildingType) {
  applyEditorConstructibleSelection("building", buildingType, canEditBuildingSelection);
}

function applyEditorVehicleSelection(vehicleType) {
  applyEditorConstructibleSelection("vehicle", vehicleType, canEditVehicleSelection);
}

bindEditorUiEvents();

document.addEventListener("pointerdown", (event) => {
  if (shouldPlayBackgroundMusic() && backgroundMusic.paused) {
    void syncBackgroundMusicPlayback();
  }

  if (
    saveSlotOverlay &&
    !saveSlotOverlay.hidden &&
    !saveSlotPanel.contains(event.target)
  ) {
    closeSaveSlotPanel();
    return;
  }

  if (
    gameActionMenu &&
    !gameActionMenu.hidden &&
    !gameActionMenu.contains(event.target) &&
    !gameMenuToggleButtons.some((button) => button.contains(event.target))
  ) {
    closeGameActionMenu();
  }

  if (editorResearchOverlay && !editorResearchOverlay.hidden) {
    return;
  }

  if (!activeCell || (editInspector && editInspector.contains(event.target)) || event.target === canvas) {
    return;
  }

  hideTileMenu();
});

document.addEventListener("keydown", (event) => {
  if (shouldPlayBackgroundMusic() && backgroundMusic.paused) {
    void syncBackgroundMusicPlayback();
  }

  if (event.key !== "Escape") return;

  if (bookOverlay && !bookOverlay.hidden) {
    closeBookOverlay({ restoreFocus: true });
    return;
  }

  if (saveSlotOverlay && !saveSlotOverlay.hidden) {
    closeSaveSlotPanel({ restoreFocus: true });
    return;
  }

  if (editorResearchOverlay && !editorResearchOverlay.hidden) {
    closeEditorResearchPanel({ restoreFocus: true });
    return;
  }

  if (gameActionMenu && !gameActionMenu.hidden) {
    closeGameActionMenu({ restoreFocus: true });
    return;
  }

  if (mainMenuOpen) return;

  if (openEditorDropdownId) {
    closeEditorDropdowns();
    return;
  }

  if (activeCell) {
    hideTileMenu();
    return;
  }

  if (interactionMode === interactionModes.play && getSelectedUnit()) {
    clearUnitSelection();
    draw();
    return;
  }

  openMainMenu();
});

document.addEventListener("visibilitychange", () => {
  if (!canRenderAnimatedFrames()) {
    clearAnimationSchedule();
    return;
  }

  draw();

  if (shouldAnimateWorkingUnits() || shouldAnimateSelectionMarker() || getMovingUnit()?.move) {
    scheduleAnimation();
  }
});

bookOverlay?.addEventListener("click", (event) => {
  const eventTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
  const bookmarkButton = eventTarget?.closest(".book-bookmark-button") || null;

  if (bookmarkButton && bookOverlay && !bookOverlay.hidden) {
    const targetPageId = bookmarkButton.dataset.bookPageId || "";

    if (targetPageId && jumpBookToPageId(targetPageId)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  const link = eventTarget?.closest(".book-page-content a") || null;
  if (link && bookOverlay && !bookOverlay.hidden) {
    const targetPageId = getBookTargetPageIdFromLink(link);
    if (targetPageId && jumpBookToPageId(targetPageId)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  const techWidget = eventTarget?.closest('[data-book-widget="tech"]') || null;

  if (techWidget && bookOverlay && !bookOverlay.hidden) {
    const technologyId = getBookTechWidgetTechnologyId(techWidget);

    if (technologyId && setSelectedResearchGoalTechnologyId(technologyId)) {
      if (pendingBookResearchAssignmentUnitId) {
        const didAssignResearch = queuePendingBookResearchAssignment();

        if (didAssignResearch) {
          closeBookOverlay();
        }
      }

      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  if (event.target !== bookOverlay) {
    return;
  }

  closeBookOverlay({ restoreFocus: true });
});

for (const bookmarkBar of bookBookmarkBars) {
  bookmarkBar.addEventListener("click", (event) => {
    const button = event.target instanceof Element
      ? event.target.closest(".book-bookmark-button")
      : null;

    if (!button) {
      return;
    }

    const pageId = button.dataset.bookPageId || "";

    if (pageId && jumpBookToPageId(pageId)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

mainMenuOverlay.addEventListener("click", (event) => {
  const button = event.target.closest(".main-menu-item");

  if (!button || button.disabled) return;

  const action = button.dataset.menuAction;

  if (action === "watch-intro") {
    void playBookSequence(bookIntroSequenceId, button);
    return;
  }

  if (action === "play") {
    void runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      activateMode(interactionModes.play);
    });
    return;
  }

  if (action === "start-new-game") {
    void runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      startNewGeneratedState(interactionModes.play);
    });
    return;
  }

  if (action === "load-game") {
    loadState(interactionModes.play);
    return;
  }

  if (action === "import-export") {
    openSaveSlotPanel("export", { targetMode: interactionMode || interactionModes.play });
    return;
  }

  if (action === "edit") {
    void runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      activateMode(interactionModes.edit);
    });
  }
});

for (const button of gameMenuToggleButtons) {
  button.addEventListener("click", () => {
    toggleGameActionMenu(button);
  });
}

for (const button of newRandomMapButtons) {
  button.addEventListener("click", () => {
    if (!isEditMode()) return;

    closeGameActionMenu();
    startNewGeneratedState(interactionModes.edit, buildGeneratedMapCells);
  });
}

for (const button of newEmptyMapButtons) {
  button.addEventListener("click", () => {
    if (!isEditMode()) return;

    closeGameActionMenu();
    startNewGeneratedState(interactionModes.edit, buildEmptyMapCells);
  });
}

for (const button of nextTurnButtons) {
  button.addEventListener("click", () => {
    advanceTurn();
  });
}

for (const button of nextUnitButtons) {
  button.addEventListener("click", () => {
    if (isReplayPhase()) return;
    selectNextIdleUnit({
      defaultAction: unitActions.walk,
      scrollIntoView: true,
    });
  });
}

  for (const button of unitActionButtons) {
    button.addEventListener("click", () => {
      const selectedUnit = getSelectedUnit();

      if (!selectedUnit || selectedUnit.move || isReplayPhase()) return;

      const action = normalizeSelectableUnitAction(button.dataset.unitAction);
      if (!canUnitUseSelectableAction(selectedUnit, action)) return;
      const currentAction = getCurrentSelectedUnitAction();

      if (action === unitActions.play) {
        queueUnitPlayTask(selectedUnit);
        return;
      }

      if (action === unitActions.research) {
        queueUnitResearchTask(selectedUnit);
        return;
      }

      if (isCellTargetUnitAction(action) && currentAction === action) {
        selectedUnitAction = getPreferredUnitAction(selectedUnit, unitActions.walk);
        updateUnitActionControls();
        draw();
        return;
      }

      selectedUnitAction = action;
      updateUnitActionControls();
    draw();
  });
}

if (foundationActionMenu) {
  foundationActionMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-foundation-id]");

    if (!button || button.hidden) {
      return;
    }

    setSelectedFoundationConstructible(button.dataset.foundationId);
  });
}

for (const button of cancelUnitTaskButtons) {
  button.addEventListener("click", () => {
    if (isReplayPhase()) return;
    cancelUnitTask();
  });
}

for (const button of openBookOverlayButtons) {
  button.addEventListener("click", () => {
    void openBookOverlayPanel(button);
  });
}

for (const button of closeBookOverlayButtons) {
  button.addEventListener("click", () => {
    closeBookOverlay({ restoreFocus: true });
  });
}

for (const button of previousBookPageButtons) {
  button.addEventListener("click", () => {
    startBookPageTurnAnimation(-1);
  });
}

for (const button of nextBookPageButtons) {
  button.addEventListener("click", () => {
    startBookPageTurnAnimation(1);
  });
}

for (const button of toggleSituationMessageButtons) {
  button.addEventListener("click", () => {
    if (situationMessageVisible && getViewedSituationMessage()) {
      hideSituationMessage();
      return;
    }

    revealLatestSituationMessage({ restartTyping: true });
  });
}

for (const button of previousSituationMessageButtons) {
  button.addEventListener("click", () => {
    if (situationMessages.length === 0) {
      return;
    }

    const nextIndex = situationMessageVisible
      ? Math.max(0, situationMessageViewIndex - 1)
      : Math.max(0, situationMessages.length - 1);

    showSituationMessageAtIndex(nextIndex, { restartTyping: true });
  });
}

for (const button of nextSituationMessageButtons) {
  button.addEventListener("click", () => {
    if (situationMessages.length === 0) {
      return;
    }

    const nextIndex = situationMessageVisible
      ? Math.min(situationMessages.length - 1, situationMessageViewIndex + 1)
      : situationMessages.length - 1;

    showSituationMessageAtIndex(nextIndex, { restartTyping: true });
  });
}

for (const button of loadStateButtons) {
  button.addEventListener("click", () => {
    if (!interactionMode) return;

    closeGameActionMenu();
    loadState(interactionMode);
  });
}

for (const button of saveStateButtons) {
  button.addEventListener("click", () => {
    if (!interactionMode) return;

    closeGameActionMenu();
    saveState(interactionMode);
  });
}

for (const button of saveStateAsButtons) {
  button.addEventListener("click", () => {
    if (!interactionMode) return;

    closeGameActionMenu();
    saveStateAs(interactionMode);
  });
}

for (const button of openMainMenuButtons) {
  button.addEventListener("click", () => {
    openMainMenu();
  });
}

for (const button of dismissSlotPanelButtons) {
  button.addEventListener("click", () => {
    closeSaveSlotPanel({ restoreFocus: true });
  });
}

for (const button of confirmSlotPanelButtons) {
  button.addEventListener("click", () => {
    void commitSaveSlotPanel();
  });
}

for (const button of importSlotPanelButtons) {
  button.addEventListener("click", () => {
    void importSaveIntoSlot(saveSlotInput?.value || slotPanelState?.value || "");
  });
}

saveSlotInput?.addEventListener("input", () => {
  if (!slotPanelState) return;

  slotPanelState.value = sanitizeFileName(saveSlotInput.value);
  renderSaveSlotList();
});

saveSlotInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  event.preventDefault();
  void commitSaveSlotPanel();
});

saveSlotList?.addEventListener("click", (event) => {
  const button = event.target.closest(".slot-panel-item");

  if (!button || !slotPanelState) return;

  const slotName = button.dataset.slotName || "";
  slotPanelState.value = slotName;
  saveSlotInput.value = slotName;
  renderSaveSlotList();

  if (slotPanelState.mode === "load") {
    void commitSaveSlotPanel();
  }
});

for (const input of autoPassInputs) {
  input.addEventListener("change", (event) => {
    autoAdvanceTurns = event.target.checked;
    updateTurnControls();
    maybeAutoAdvanceTurn();
  });
}

for (const input of musicEnabledInputs) {
  input.addEventListener("change", (event) => {
    audioSettings.musicEnabled = Boolean(event.target.checked);
    saveAudioSettings();
    updateAudioControls();
    void syncBackgroundMusicPlayback();
  });
}

for (const input of musicVolumeInputs) {
  input.addEventListener("input", (event) => {
    audioSettings.volume = clampNumber(Number(event.target.value) / 100, 0, 1, defaultAudioSettings.volume);
    saveAudioSettings();
    updateAudioControls();
    backgroundMusic.volume = audioSettings.volume;
    introMusic.volume = audioSettings.volume;
  });
}

for (const button of languageOptionButtons) {
  button.addEventListener("click", () => {
    const language = button.dataset.language;

    if (!language || language === currentLanguage || !availableLanguages[language]) {
      return;
    }

    saveCurrentLanguage(language);
    window.location.reload();
  });
}

for (const button of zoomOutButtons) {
  button.addEventListener("click", () => {
    changeZoom(-1);
  });
}

for (const button of zoomInButtons) {
  button.addEventListener("click", () => {
    changeZoom(1);
  });
}

window.addEventListener("resize", resizeCanvas);

async function initializeApp() {
  await Promise.all([
    ensureBuildingDefinitionsLoaded(),
    ensureVehicleDefinitionsLoaded(),
    ensureUnitDefinitionsLoaded(),
  ]);
  applyStaticText();
  initializeBookPageContent();
  updateBookPageStack();
  populateTerrainMenu();
  updateEditInspector();
  void requestPersistentStorage();
  void ensureBookContentLoaded();
  applyStateSnapshot(createDefaultState(interactionModes.edit), interactionModes.edit, { recenter: false });
  resetTileReadout();
  updateInteractionModeUi();
  void ensureVisualAssetsLoaded();
  void ensureTechnologyCatalogLoaded();
  resizeCanvas();
}

void initializeApp().catch((error) => {
  console.error("Failed to initialize app.", error);
});
