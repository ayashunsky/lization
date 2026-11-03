import {
  createConstructiblesApi,
  getCountByBuildingAllowedCount,
  getReachedCountByBuildingProvider,
} from "./constructibles.js";
import { createBookContentApi } from "./book-content.js";
import { normalizePopulationEvents } from "./population-events.js";
import { createBookRuntimeApi } from "./book-runtime.js";
import { createEditorUiApi } from "./editor-ui.js";
import {
  advanceGameEndingState,
  getBlockedHouseCompleteness,
  getFullPopulationVictoryTurn,
  getPopulationCap,
} from "./game-ending.js";
import { createOverlayRuntimeApi } from "./overlay-runtime.js";
import {
  getFoodSurvivalDays,
  getHappinessChangeForTurn,
  normalizeHappiness,
} from "./happiness.js";
import { createSpriteRuntimeApi, spriteTaskSourceCandidateSets } from "./sprite-runtime.js";
import { createTerrainRuntimeApi } from "./terrain-runtime.js";
import {
  clamp,
  clampInteger,
  clampNumber,
  clampNonNegativeNumber,
} from "./number-utils.js";

const viewport = document.querySelector(".viewport");
const canvasStack = document.querySelector(".map-canvas-stack");
const canvas = document.querySelector("#mapCanvas");
const ctx = canvas.getContext("2d");
const interactionCanvas = document.querySelector("#mapInteractionCanvas");
const interactionCtx = interactionCanvas.getContext("2d");
const selectionCanvas = document.querySelector("#mapSelectionCanvas");
const selectionCtx = selectionCanvas.getContext("2d");
const unitsCanvas = document.querySelector("#mapUnitsCanvas");
const unitsCanvasAlt = document.querySelector("#mapUnitsCanvasAlt");
const actorsCanvas = document.querySelector("#mapActorsCanvas");
const actorsCtx = actorsCanvas.getContext("2d");
const overlayCanvas = document.querySelector("#mapOverlayCanvas");
const overlayCtx = overlayCanvas.getContext("2d");
const appShell = document.querySelector(".app-shell");
const topBarsContainer = document.querySelector(".top-bars");
const mainMenuOverlay = document.querySelector("#mainMenuOverlay");
const mainMenuLoadingElements = [...document.querySelectorAll('[data-role="main-menu-loading"]')];
const firstVisitIntroDialog = document.querySelector("#firstVisitIntroDialog");
const firstVisitIntroQuestion = document.querySelector("#firstVisitIntroQuestion");
const firstVisitIntroYesButton = document.querySelector('[data-action="first-visit-intro-yes"]');
const firstVisitIntroNoButton = document.querySelector('[data-action="first-visit-intro-no"]');
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
const unitTileActionMenu = document.querySelector("#unitTileActionMenu");
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
const mapGenerationOverlay = document.querySelector("#mapGenerationOverlay");
const mapGenerationPanel = document.querySelector("#mapGenerationPanel");
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
const tileMenuTitle = document.querySelector("#tileMenuTitle");
const variantMenuTitle = document.querySelector("#variantMenuTitle");
const terrainMenuOptions = document.querySelector("#terrainMenuOptions");
const variantMenuOptions = document.querySelector("#variantMenuOptions");
const seasonMenuOptions = document.querySelector("#seasonMenuOptions");
const foodMenuOptions = document.querySelector("#foodMenuOptions");
const buildingMenuOptions = document.querySelector("#buildingMenuOptions");
const vehicleMenuOptions = document.querySelector("#vehicleMenuOptions");
const unitMenuOptions = document.querySelector("#unitMenuOptions");
const unitActionMenuOptions = document.querySelector("#unitActionMenuOptions");
const editorDropdownToggleButtons = [...document.querySelectorAll('[data-action="toggle-editor-dropdown"]')];
const editorDropdownMenuElements = [...document.querySelectorAll('[data-role="editor-dropdown-menu"]')];
const editorTerrainLabelElements = [...document.querySelectorAll('[data-role="editor-terrain-label"]')];
const editorVisualLabelElements = [...document.querySelectorAll('[data-role="editor-visual-label"]')];
const editorSeasonLabelElements = [...document.querySelectorAll('[data-role="editor-season-label"]')];
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
const mapGenerationTitleElements = [...document.querySelectorAll('[data-role="map-generation-title"]')];
const mapGenerationSubtitleElements = [...document.querySelectorAll('[data-role="map-generation-subtitle"]')];
const mapGenerationSizeTitleElements = [...document.querySelectorAll('[data-role="map-generation-size-title"]')];
const mapGenerationRandomTitleElements = [...document.querySelectorAll('[data-role="map-generation-random-title"]')];
const mapGenerationWidthLabelElements = [...document.querySelectorAll('[data-role="map-generation-width-label"]')];
const mapGenerationHeightLabelElements = [...document.querySelectorAll('[data-role="map-generation-height-label"]')];
const mapGenerationSizePresetLabelElements = [...document.querySelectorAll('[data-role="map-generation-size-preset-label"]')];
const mapGenerationSizeSmallLabelElements = [...document.querySelectorAll('[data-role="map-generation-size-small-label"]')];
const mapGenerationSizeNormalLabelElements = [...document.querySelectorAll('[data-role="map-generation-size-normal-label"]')];
const mapGenerationSizeBigLabelElements = [...document.querySelectorAll('[data-role="map-generation-size-big-label"]')];
const mapGenerationWaterLabelElements = [...document.querySelectorAll('[data-role="map-generation-water-label"]')];
const mapGenerationForestLabelElements = [...document.querySelectorAll('[data-role="map-generation-forest-label"]')];
const mapGenerationMountainLabelElements = [...document.querySelectorAll('[data-role="map-generation-mountain-label"]')];
const mapGenerationFoodLabelElements = [...document.querySelectorAll('[data-role="map-generation-food-label"]')];
const mapGenerationWaterValueElements = [...document.querySelectorAll('[data-role="map-generation-water-value"]')];
const mapGenerationForestValueElements = [...document.querySelectorAll('[data-role="map-generation-forest-value"]')];
const mapGenerationMountainValueElements = [...document.querySelectorAll('[data-role="map-generation-mountain-value"]')];
const mapGenerationFoodValueElements = [...document.querySelectorAll('[data-role="map-generation-food-value"]')];
const mapGenerationRandomFieldGroups = [...document.querySelectorAll('[data-role="map-generation-random-fields"]')];
const editorResourcePanels = [...document.querySelectorAll('[data-role="editor-resource-panel"]')];
const editorResourceTitleElements = [...document.querySelectorAll('[data-role="editor-resource-title"]')];
const editorResourceSeparators = [...document.querySelectorAll('[data-role="editor-resource-separator"]')];
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
const mapGenerationWidthInput = document.querySelector('[data-action="map-generation-width"]');
const mapGenerationHeightInput = document.querySelector('[data-action="map-generation-height"]');
const mapGenerationSizePresetInputs = [...document.querySelectorAll('[data-action="map-generation-size-preset"]')];
const mapGenerationWaterInput = document.querySelector('[data-action="map-generation-water"]');
const mapGenerationForestInput = document.querySelector('[data-action="map-generation-forest"]');
const mapGenerationMountainInput = document.querySelector('[data-action="map-generation-mountain"]');
const mapGenerationFoodInput = document.querySelector('[data-action="map-generation-food"]');
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
const deleteSlotPanelButtons = [...document.querySelectorAll('[data-action="delete-slot-panel"]')];
const closeMapGenerationButtons = [...document.querySelectorAll('[data-action="close-map-generation"], [data-action="cancel-map-generation"]')];
const confirmMapGenerationButtons = [...document.querySelectorAll('[data-action="confirm-map-generation"]')];
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
const unitBookPageButtons = [...document.querySelectorAll('[data-action="open-unit-book-page"]')];
const centerUnitOnMapButtons = [...document.querySelectorAll('[data-action="center-unit-on-map"]')];
const unitActionSpriteImages = [...document.querySelectorAll('[data-role="unit-action-sprite"]')];
const unitActionProgressReadouts = [...document.querySelectorAll('[data-role="unit-action-progress"]')];
const unitCargoReadouts = [...document.querySelectorAll('[data-role="unit-cargo-readout"]')];
const unitTaskRows = [...document.querySelectorAll('[data-role="unit-task-row"]')];
const turnReadouts = [...document.querySelectorAll('[data-role="turn-readout"]')];
const happinessReadouts = [...document.querySelectorAll('[data-role="happiness-readout"]')];
const populationGoalReadouts = [...document.querySelectorAll('[data-role="population-goal-readout"]')];
const situationMessageOverlay = document.querySelector("#situationMessageOverlay");
const acknowledgeSituationMessageButton = document.querySelector('[data-action="acknowledge-situation-message"]');
const situationMessageTurnElements = [...document.querySelectorAll('[data-role="situation-message-turn"]')];
const situationMessageTextElements = [...document.querySelectorAll('[data-role="situation-message-text"]')];
const resourceStoneCanvases = [...document.querySelectorAll('[data-role="resource-stone-canvas"]')];
const resourceStoneCaptions = [...document.querySelectorAll('[data-role="resource-stone-caption"]')];
const resourceLumberCanvases = [...document.querySelectorAll('[data-role="resource-lumber-canvas"]')];
const resourceLumberCaptions = [...document.querySelectorAll('[data-role="resource-lumber-caption"]')];
const resourceFoodCanvases = [...document.querySelectorAll('[data-role="resource-food-canvas"]')];
const resourceFoodCaptions = [...document.querySelectorAll('[data-role="resource-food-caption"]')];
const fileReadouts = [...document.querySelectorAll('[data-role="file-readout"]')];
const nextTurnButtons = [...document.querySelectorAll('[data-action="next-turn"]')];
const nextUnitButtons = [...document.querySelectorAll('[data-action="select-next-unit"]')];
const turnAutoToggleButtons = [...document.querySelectorAll('[data-action="toggle-auto-turns"]')];
const musicEnabledInputs = [...document.querySelectorAll('[data-action="music-enabled"]')];
const musicVolumeInputs = [...document.querySelectorAll('[data-action="music-volume"]')];
const gatherLoopIndicators = [...document.querySelectorAll('[data-role="gather-loop-indicator"]')];
const cancelUnitTaskButtons = [...document.querySelectorAll('[data-action="cancel-unit-task"]')];
const openBookOverlayButtons = [...document.querySelectorAll('[data-action="open-book-overlay"]')];
const closeBookOverlayButtons = [...document.querySelectorAll('[data-action="close-book-overlay"]')];
const previousBookPageButtons = [...document.querySelectorAll('[data-action="turn-book-page-previous"]')];
const nextBookPageButtons = [...document.querySelectorAll('[data-action="turn-book-page-next"]')];
const bookPageLayers = [...document.querySelectorAll('[data-book-page-layer]')];
const unitActionButtons = [...document.querySelectorAll('[data-action="select-unit-action"]')];
const musicToggleLabelElements = [...document.querySelectorAll('[data-role="music-toggle-label"]')];
const musicVolumeLabelElements = [...document.querySelectorAll('[data-role="music-volume-label"]')];
const slotNameLabels = [...document.querySelectorAll('[data-role="slot-name-label"]')];
const slotListTitles = [...document.querySelectorAll('[data-role="slot-list-title"]')];
const languageSelectorGroups = [...document.querySelectorAll('[data-role="language-selector"]')];
const languageOptionButtons = [...document.querySelectorAll('[data-action="set-language"]')];
const mainMenuItems = {
  watchIntro: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="watch-intro"]'),
  startNewGame: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="start-new-game"]'),
  quickStart: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="quick-start"]'),
  play: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="play"]'),
  loadGame: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="load-game"]'),
  book: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="open-book"]'),
  edit: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="edit"]'),
  importExport: mainMenuOverlay.querySelector('.main-menu-item[data-menu-action="import-export"]'),
};
const staticUnitsLayerCanvases = [unitsCanvas, unitsCanvasAlt];
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
  plant: "plant",
  gatherMaterials: "gatherMaterials",
  buildHouse: "buildHouse",
};
const unitUiActions = Object.freeze({
  work: "work",
});
const cellSeasons = Object.freeze([
  "summer",
  "autumn",
  "winter1",
  "winter2",
  "spring",
]);
const defaultCellSeason = "summer";
const autoAssignPlayTasksForIdleUnitsOnManualTurnAdvance = true;
const seasonTransitionDefinitions = normalizeSeasonTransitionDefinitions(rules.calendar?.seasonTransitions);
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
      allowDepletionOnCycleStart: true,
      phase: "gather",
      resourceId: destinationCell.foodType,
    } : null,
    serializeTask: (task) => serializeGatherUnitTask(task, "gatherFood"),
    preserveTask: (task) => serializeGatherUnitTask(task, "gatherFood"),
    normalizeTask: (task, options) => normalizeGatherFoodUnitTask(task, options),
    resolveTask: (currentUnit) => resolveGatherFoodTask(currentUnit),
    queueTask: (options) => queueGatherFoodUnitAction(options),
    getInspectorProgressText: (currentUnit) => getGatherTaskProgressText(currentUnit?.task),
  }),
  [unitActions.plant]: Object.freeze({
    id: unitActions.plant,
    taskType: "plant",
    countsAsWork: true,
    usesTargetTaskDirection: true,
    usesTargetGroundPoint: true,
    createTask: ({ destinationCell } = {}) => destinationCell ? {
      type: "plant",
      toX: destinationCell.x,
      toY: destinationCell.y,
    } : null,
    serializeTask: (task) => serializeTargetedUnitTask(task, "plant"),
    preserveTask: (task) => serializeTargetedUnitTask(task, "plant"),
    normalizeTask: (task, options) => normalizePlantUnitTask(task, options),
    resolveTask: (currentUnit) => resolvePlantTask(currentUnit),
    queueTask: (options) => queuePlantUnitAction(options),
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
      allowDepletionOnCycleStart: true,
      phase: "gather",
      resourceId: getCellMaterialResourceType(destinationCell),
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
});
const unitActionIdsByTaskType = Object.freeze(
  Object.fromEntries(
    Object.values(unitActionSpecs).map((spec) => [spec.taskType, spec.id]),
  ),
);
let unitSpriteConfigs = {};

const map = {
  width: 42,
  height: 64,
  cells: [],
};
const defaultMapConfig = {
  width: map.width,
  height: map.height,
};
const mapGenerationSizePresets = Object.freeze({
  small: Object.freeze({ width: 28, height: 42 }),
  normal: Object.freeze({ width: defaultMapConfig.width, height: defaultMapConfig.height }),
  big: Object.freeze({ width: 56, height: 84 }),
});
const minimumGeneratedMapDimension = 16;
const defaultMapGenerationSize = Object.freeze({
  width: defaultMapConfig.width,
  height: defaultMapConfig.height,
});
const defaultMapGenerationSettings = Object.freeze({
  water: 52,
  forest: 54,
  mountain: 32,
  food: 46,
});

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
        seasonalImages: {
          winter2: "assets/tiles/water_01_winter2.png",
          spring: "assets/tiles/water_01_spring.png",
        },
      },
      {
        id: "water_02",
        label: strings.terrainVariants.water_02,
        image: "assets/tiles/water_02.png",
        weight: 9,
        seasonalImages: {
          winter2: "assets/tiles/water_02_winter2.png",
          spring: "assets/tiles/water_02_spring.png",
        },
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
      { id: "grass_01", label: strings.terrainVariants.grass_01, image: "assets/tiles/grass_01.png",
        seasonalImages: {
          autumn: "assets/tiles/grass_01_winter1a.png",
          winter1: "assets/tiles/grass_01_winter1a.png",
          winter2: "assets/tiles/grass_01_winter2.png",
          spring: "assets/tiles/grass_01_spring.png",
        },
      },
      { id: "grass_02", label: strings.terrainVariants.grass_02, image: "assets/tiles/grass_02.png",
         seasonalImages: {
          autumn: "assets/tiles/grass_02_winter1a.png",
          winter1: "assets/tiles/grass_02_winter1a.png",
          winter2: "assets/tiles/grass_02_winter2.png",
          spring: "assets/tiles/grass_02_spring.png",
        },
      },
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
        image: "assets/tiles/forest_01_new.png",
        seasonalImages: {
          autumn: "assets/tiles/forest_01_new_autumn.png",
          winter1: "assets/tiles/forest_01_new_winter1.png",
          winter2: "assets/tiles/forest_01_new_winter2.png",
          spring: "assets/tiles/forest_01_new_spring.png",
        },

      },
      {
        id: "forest_02",
        label: strings.terrainVariants.forest_02,
        image: "assets/tiles/forest_02_new.png",
        seasonalImages: {
          autumn: "assets/tiles/forest_02_new_autumn.png",
          winter1: "assets/tiles/forest_02_new_winter1.png",
          winter2: "assets/tiles/forest_02_new_winter2.png",
          spring: "assets/tiles/forest_02_new_spring.png",
        },
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
        seasonalImages: {
          winter2: "assets/tiles/hill_01_winter2.png",
        },
      },
      {
        id: "mountain_02",
        label: strings.terrainVariants.mountain_02,
        image: "assets/tiles/hill_02.png",
        weight: 9,
        seasonalImages: {
          winter2: "assets/tiles/hill_02_winter2.png",
        },
      },
    ],
    top: "#a79569",
    side: "#7b684d",
    detail: "#e0d2a1",
    stroke: "#68583f",
  },
};

// Visual transitions are derived from neighbors; they are not stored in map.cells.
let origin = { x: 0, y: 0 };
let hoverCell = null;
let playHoverCell = null;
let activeCell = null;
let openEditorDropdownId = null;
let tileHitAreas = [];
let visibleCellKeys = new Set();
let visibleCellsByRow = [];
let villageVicinityCells = null;
let foodResourceCells = new Map();
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
let visibleStaticUnitsFrameIndex = null;
let interactionLayerHadContent = false;
let actorsLayerHadContent = false;
let overlayLayerHadContent = false;
let selectionRingBounds = null;
let currentDpr = 1;
let currentTurn = 1;
let fullPopulationSinceTurn = null;
let gameOutcome = null;
let autoAdvanceTurns = true;
let seasonConversionState = null;
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
let completedBuildingTypesThisTurn = new Set();
let turnReplayStartStates = new Map();
let turnReplayFinalStates = new Map();
let turnReplayVehicleStartStates = new Map();
let turnReplayVehicleFinalStates = new Map();
let turnReplayMoveTargets = new Map();
let selectedUnitAction = null;
let unitTileActionTarget = null;
let selectedFoundationConstructibleId = null;
let pendingFoundationPlacement = null;
let inspectedPlayCell = null;
let stockpile = { stone: 0, lumber: 0, food: 0 };
let happiness = normalizeHappiness(undefined, rules.happiness);
let stockpileHistory = [];
let foodShortageTurns = 0;
let foodShortageActive = false;
let pendingSituationMessages = [];
let presentedBookMessage = null;
let populationEvents = [];
let situationMessageReturnFocus = null;
let turnResolutionInProgress = false;
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
let mapGenerationPanelState = null;
let mapGenerationSettings = { ...defaultMapGenerationSettings };
let mapGenerationSize = { ...defaultMapGenerationSize };
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
  currentFile: {
    edit: "schtroumpfilization:current-file:edit:v1",
    play: "schtroumpfilization:current-file:play:v1",
  },
  audioSettings: "schtroumpfilization:audio-settings:v1",
  introPromptAnswered: "schtroumpfilization:intro-prompt-answered:v1",
};
const saveDatabaseConfig = Object.freeze({
  name: "schtroumpfilization-saves-v1",
  version: 1,
  storeName: "saveFiles",
});
const compactSerializedCellFieldIndex = Object.freeze({
  type: 0,
  variant: 1,
  season: 2,
  visited: 3,
  visitsCount: 4,
  materialAmount: 5,
  foodType: 6,
  foodCapacity: 7,
  foodAmount: 8,
});
const currentFileNames = {
  edit: null,
  play: null,
};
const autosaveSlotName = "autosave";
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
const stockpileHistoryIntervalTurns = 10;
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
let unitSpawnConfig = createDefaultUnitSpawnConfig();
let researchState = createDefaultResearchState();
let editStateDirty = false;
let editorResearchReturnFocusButton = null;
let pendingBookResearchAssignmentUnitId = null;
let lastSaveStorageErrorSignature = null;
let saveDatabasePromise = null;

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
  chooseConstructibleSubtypeForKind,
  getDefaultConstructibleDimensionForKind,
  getConstructibleBottomRowForKind,
  getConstructibleDimensionForKind,
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
  createConstructibleConstructionAtCellForKind,
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
  markCellVisited,
  normalizeLinkedEntityId,
  normalizeBuildingState,
  getVehicleCargoCapacity,
  normalizeVehicleCargo,
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
  doesSeasonSuppressPathEffects,
  getCellPathWellKnownVisitsThreshold,
  getCellPathPreviewVisitsThreshold,
  getCellVisitsCount,
  isWellKnownPathCell,
  getPathCompletionPercent,
  syncPathRenderableCellIndexForCell,
  rebuildPathRenderableCellIndex,
  hasFullPathBetween,
  drawInspectorPathOverlay,
  drawFogBorders,
  getTileEdges,
  getTileCorners,
  drawPaths,
} = createOverlayRuntimeApi({
  map,
  baseTile,
  tile,
  ctx,
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
});

const {
  getShoreOverlayPaths,
  getTerrainImagePaths,
  getTerrainTileRenderSpec,
  drawTileTerrain,
  drawCellResourceOverlay,
} = createTerrainRuntimeApi({
  terrain,
  baseTile,
  tile,
  ctx,
  tileImages,
  shoreOverlayImages,
  resourceOverlayImages,
  getEdgeNeighbor,
  getCornerNeighbor,
  getTileEdges,
  getTileCorners,
  getTerrainVariants,
  getTerrainVariant,
  ensureCellVariant,
  getFoodOverlayDisplaySpec,
  hasFoodResource,
  isCellVisibleToPlayer,
  isoToScreen,
  drawDiamondPath,
});

const {
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
} = createSpriteRuntimeApi({
  state: {
    getCurrentUnit: () => unit,
    getUnitSpriteConfigs: () => unitSpriteConfigs,
  },
  manifests: {
    unitManifestPath,
    vehicleManifestPath,
  },
  world: {
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
  },
  render: {
    ctx,
    tile,
    zoomLevels,
    getZoomIndex: () => zoomIndex,
    unitImages,
    getUnitGroundPoint,
  },
});

const {
  createDefaultBookDocument,
  loadBookManifestDocument,
  fillBookPageSideContent,
  getBookTargetPageIdFromLink,
  getBookTechWidgetTechnologyId,
  refreshBookStockpileCharts,
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
    terrainDefinitions: terrain,
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
    getStockpileHistory: () => stockpileHistory,
    getCurrentTurn: () => currentTurn,
    formatTurnDate: formatJulianTurnDate,
    getPopulationEvents: () => populationEvents,
    getPopulation: () => getUnits().length,
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
  openBookFromMainMenu,
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
    onBookOverlayVisibilityChanged: handleBookOverlayVisibilityChanged,
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
  closeEditorResearchPanel,
  clearEditHoverState,
  updateEditInspector,
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
      editInspector,
      hoverReadouts,
      editorResearchOverlay,
      editorResearchPanel,
      editorResearchList,
      editorResearchEmpty,
      tileMenuTitle,
      terrainMenuOptions,
      variantMenuOptions,
      seasonMenuOptions,
      foodMenuOptions,
      buildingMenuOptions,
      vehicleMenuOptions,
      unitMenuOptions,
      unitActionMenuOptions,
      editorDropdownToggleButtons,
      editorDropdownMenuElements,
      editorTerrainLabelElements,
      editorVisualLabelElements,
      editorSeasonLabelElements,
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
    getDefinedCellSeasons: () => cellSeasons,
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
    applyEditorSeasonSelection,
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

function createDefaultUnitRulesConfig() {
  return {
    default: {
      typeId: "",
    },
    types: {},
  };
}

function createDefaultUnitSpawnConfig() {
  return {
    pool: [],
    ensurePresentByUnitCount: [],
  };
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

function normalizeCellSeason(season) {
  if (typeof season !== "string") {
    return defaultCellSeason;
  }

  const normalizedSeason = season.trim();

  return cellSeasons.includes(normalizedSeason)
    ? normalizedSeason
    : defaultCellSeason;
}

function normalizeSeasonTransitionDatePart(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const month = Number(value.month);
  const day = Number(value.day);

  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 31) {
    return null;
  }

  return { month, day };
}

function normalizeSeasonTransitionDefinitions(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  const normalizedTransitions = [];
  const seenIds = new Set();

  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      continue;
    }

    const targetSeason = typeof entry.targetSeason === "string" && cellSeasons.includes(entry.targetSeason.trim())
      ? entry.targetSeason.trim()
      : null;
    const start = normalizeSeasonTransitionDatePart(entry.start);
    const end = normalizeSeasonTransitionDatePart(entry.end);

    if (!targetSeason || !start || !end) {
      continue;
    }

    const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : targetSeason;

    if (seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);
    normalizedTransitions.push({ id, targetSeason, start, end });
  }

  return normalizedTransitions;
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

function normalizeVehicleMountedMovementRuleEntry(entry) {
  if (typeof entry === "string") {
    const terrain = entry.trim();
    return terrain ? { terrain, season: null } : null;
  }

  if (!Array.isArray(entry)) {
    return null;
  }

  const terrain = typeof entry[0] === "string" ? entry[0].trim() : "";
  const season = typeof entry[1] === "string" ? entry[1].trim() : "";

  if (!terrain || !season || !cellSeasons.includes(season)) {
    return null;
  }

  return { terrain, season };
}

function normalizeVehicleMountedMovementRulesConfig(entries) {
  if (!Array.isArray(entries)) {
    return undefined;
  }

  const normalizedRules = [];
  const seenKeys = new Set();

  for (const entry of entries) {
    const normalizedRule = normalizeVehicleMountedMovementRuleEntry(entry);

    if (!normalizedRule) {
      continue;
    }

    const key = `${normalizedRule.terrain}:${normalizedRule.season || "*"}`;

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    normalizedRules.push(normalizedRule);
  }

  return normalizedRules.length > 0 ? normalizedRules : undefined;
}

function normalizeVehicleMountedRulesConfig(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return undefined;
  }

  const allowedActions = normalizeUnitActionList(entry.allowedActions);
  const movementTerrains = normalizeVehicleMountedMovementRulesConfig(entry.movementTerrains);
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

function normalizeUnitPlantedFoodCapacitiesConfig(capacities) {
  if (!capacities || typeof capacities !== "object" || Array.isArray(capacities)) {
    return undefined;
  }

  const entries = Object.fromEntries(
    Object.entries(capacities)
      .map(([foodType, value]) => {
        const normalizedFoodType = typeof foodType === "string" ? foodType.trim() : "";
        const normalizedValue = Number(value);
        return normalizedFoodType && Number.isFinite(normalizedValue)
          ? [normalizedFoodType, Math.max(0, normalizedValue)]
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

function normalizeUnitActionRequirementsConfig(rawActionRequirements) {
  if (!rawActionRequirements || typeof rawActionRequirements !== "object" || Array.isArray(rawActionRequirements)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(rawActionRequirements)
      .map(([actionId, requirements]) => {
        const normalizedActionId = normalizePendingUnitAction(actionId);

        if (!normalizedActionId) {
          return null;
        }

        if (requirements === null) {
          return [normalizedActionId, null];
        }

        const normalizedRequirements = normalizeRuleRequirements(requirements);
        return Object.keys(normalizedRequirements).length > 0
          ? [normalizedActionId, normalizedRequirements]
          : null;
      })
      .filter(Boolean),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeUnitRulesConfig(entry) {
  const unitEntry = entry && typeof entry === "object" ? entry : {};
  const normalized = {};
  const spriteTypeId = typeof unitEntry.spriteTypeId === "string" ? unitEntry.spriteTypeId.trim() : "";
  const bookPageId = typeof unitEntry.bookPageId === "string" ? unitEntry.bookPageId.trim() : "";
  const name = typeof unitEntry.name === "string" ? unitEntry.name.trim() : "";
  const labels = normalizeLocalizedLabelsMap(unitEntry.labels);
  const stamina = Number(unitEntry.stamina);
  const carryingCapacity = Number(unitEntry.carryingCapacity);
  const foodConsumptionPerTurn = Number(unitEntry.foodConsumptionPerTurn);
  const researchPointsPerTurn = Number(unitEntry.researchPointsPerTurn);
  const allowedActions = normalizeUnitActionList(unitEntry.allowedActions);
  const workPointsPerTurn = normalizeUnitWorkPointsConfig(unitEntry.workPointsPerTurn);
  const plantedFoodCapacities = normalizeUnitPlantedFoodCapacitiesConfig(unitEntry.plantedFoodCapacities);
  const availability = normalizeRuleRequirements(unitEntry.availability);
  const actionRequirements = normalizeUnitActionRequirementsConfig(unitEntry.actionRequirements);
  const modifiers = normalizeUnitModifiers(unitEntry.modifiers);

  if (spriteTypeId) {
    normalized.spriteTypeId = spriteTypeId;
  }

  if (bookPageId) {
    normalized.bookPageId = bookPageId;
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

  if (Number.isFinite(carryingCapacity)) {
    normalized.carryingCapacity = Math.max(0, carryingCapacity);
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

  if (plantedFoodCapacities) {
    normalized.plantedFoodCapacities = plantedFoodCapacities;
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
  const normalizedSpriteTypes = {};

  for (const [spriteTypeId, entry] of Object.entries(rawSpriteTypes)) {
    const normalizedSpriteTypeId = typeof spriteTypeId === "string" ? spriteTypeId.trim() : "";
    if (!normalizedSpriteTypeId || !entry || typeof entry !== "object") {
      continue;
    }

    normalizedSpriteTypes[normalizedSpriteTypeId] = normalizeUnitSpriteTypeConfig(entry, manifestPath);
  }

  const rawSpawnRules = manifest?.spawnRules && typeof manifest.spawnRules === "object" && !Array.isArray(manifest.spawnRules)
    ? manifest.spawnRules
    : {};
  const rawSpawnPool = Array.isArray(rawSpawnRules.pool) ? rawSpawnRules.pool : [];
  const normalizedSpawnPool = rawSpawnPool
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const type = typeof entry.type === "string" ? entry.type.trim() : "";
      const quantity = Math.max(0, Math.floor(Number(entry.quantity) || 0));

      return type ? { id: type, quantity } : null;
    })
    .filter(Boolean);
  const rawSpawnGuarantees = Array.isArray(rawSpawnRules.ensurePresentByUnitCount)
    ? rawSpawnRules.ensurePresentByUnitCount
    : [];
  const normalizedSpawnGuarantees = rawSpawnGuarantees
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const unitCount = Math.max(0, Math.floor(Number(entry.unitCount) || 0));
      const types = normalizeRuleIdList(entry.types);

      return unitCount > 0 && types?.length
        ? {
          unitCount,
          types,
        }
        : null;
    })
    .filter(Boolean);

  return {
    rules: normalizedRules,
    spriteTypes: normalizedSpriteTypes,
    spawnRules: {
      pool: normalizedSpawnPool,
      ensurePresentByUnitCount: normalizedSpawnGuarantees,
    },
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
        unitSpawnConfig = definitions.spawnRules || createDefaultUnitSpawnConfig();
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

  if (Number.isFinite(Number(rulesEntry.happinessPerTurn))) {
    normalized.happinessPerTurn = Number(rulesEntry.happinessPerTurn);
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
  const cargoOverlay = manifestPath === vehicleManifestPath && visual.cargoOverlay
    ? {
        unmounted: imageResolver(visual.cargoOverlay.unmounted, manifestPath),
        mountedOffsetYAt100Zoom: Number.isFinite(Number(visual.cargoOverlay.mountedOffsetYAt100Zoom))
          ? Number(visual.cargoOverlay.mountedOffsetYAt100Zoom)
          : 0,
        mountedByImage: Object.fromEntries(
          Object.entries(visual.cargoOverlay.mountedByImage || {})
            .map(([source, overlay]) => [imageResolver(source, manifestPath), imageResolver(overlay, manifestPath)])
            .filter(([source, overlay]) => source && overlay),
        ),
        mountedForegroundByImage: Object.fromEntries(
          Object.entries(visual.cargoOverlay.mountedForegroundByImage || {})
            .map(([source, overlay]) => [imageResolver(source, manifestPath), imageResolver(overlay, manifestPath)])
            .filter(([source, overlay]) => source && overlay),
        ),
      }
    : null;

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
    ...(cargoOverlay ? { cargoOverlay } : {}),
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
  const mountedSurfaceTerrain = typeof rulesEntry.mountedSurfaceTerrain === "string"
    ? rulesEntry.mountedSurfaceTerrain.trim()
    : "";
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
  const happinessPerTurn = Number(rulesEntry.happinessPerTurn);
  const mounted = normalizeVehicleMountedRulesConfig(rulesEntry.mounted);
  const cargoCapacity = Number(rulesEntry.cargoCapacity);

  return {
    width,
    height,
    ...(footprint && footprint.length > 0 ? { footprint } : {}),
    ...(placementTerrains && placementTerrains.some((terrainList) => Array.isArray(terrainList) && terrainList.length > 0)
      ? { placementTerrains }
      : {}),
    villageBuilding: Boolean(rulesEntry.villageBuilding),
    walkable: Boolean(rulesEntry.walkable),
    ...(Object.prototype.hasOwnProperty.call(terrain, mountedSurfaceTerrain) ? { mountedSurfaceTerrain } : {}),
    foundationActionAvailable: Boolean(rulesEntry.foundationActionAvailable),
    constructionCost,
    buildCost: {
      stone: buildCostStone,
      lumber: buildCostLumber,
    },
    ...(resourceStorageCapacities && Object.keys(resourceStorageCapacities).length > 0 ? { resourceStorageCapacities } : {}),
    ...(mounted ? { mounted } : {}),
    ...(Number.isFinite(cargoCapacity) && cargoCapacity > 0
      ? { cargoCapacity: clampNonNegativeNumber(cargoCapacity, 999999, 0) }
      : {}),
    constructionVisualThresholds: {
      initialMax: Number.isFinite(initialMax) ? initialMax : 0.34,
      halfMax: Number.isFinite(halfMax) ? halfMax : 0.79,
    },
    abandonedDecayPerTurn: Number.isFinite(abandonedDecayPerTurn) ? abandonedDecayPerTurn : 0,
    happinessPerTurn: Number.isFinite(happinessPerTurn) ? happinessPerTurn : 0,
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

function hasAvailableResearchGoal(state = researchState) {
  return technologyCatalog.technologies.some((technology) => canSelectResearchGoal(technology.id, state));
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

function getTurnNumberForJulianDate(year, month, day) {
  return Math.max(1, getJulianDayNumber(year, month, day) - julianTurnEpochJdn + 1);
}

function getGameVictoryTurnForStart(startTurn) {
  return getFullPopulationVictoryTurn(startTurn, getJulianTurnDate, getTurnNumberForJulianDate);
}

function compareMonthDay(left, right) {
  if (!left || !right) {
    return 0;
  }

  if (left.month !== right.month) {
    return left.month - right.month;
  }

  return left.day - right.day;
}

function isMonthDayWithinRange(date, start, end) {
  const startsBeforeEnd = compareMonthDay(start, end) <= 0;

  if (startsBeforeEnd) {
    return compareMonthDay(date, start) >= 0 && compareMonthDay(date, end) <= 0;
  }

  return compareMonthDay(date, start) >= 0 || compareMonthDay(date, end) <= 0;
}

function getSeasonTransitionEndYearForDate(date, transition) {
  if (!date || !transition) {
    return null;
  }

  return compareMonthDay(transition.start, transition.end) <= 0
    ? date.year
    : (compareMonthDay(date, transition.start) >= 0 ? date.year + 1 : date.year);
}

function getActiveSeasonTransitionForTurn(turnNumber = currentTurn) {
  const date = getJulianTurnDate(turnNumber);

  for (const transition of seasonTransitionDefinitions) {
    if (!isMonthDayWithinRange(date, transition.start, transition.end)) {
      continue;
    }

    const endYear = getSeasonTransitionEndYearForDate(date, transition);

    if (!Number.isInteger(endYear)) {
      continue;
    }

    return {
      ...transition,
      endTurn: getTurnNumberForJulianDate(endYear, transition.end.month, transition.end.day),
    };
  }

  return null;
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

function createSituationMessageEntry(kind, data = {}, turn = currentTurn) {
  const normalizedTurn = Math.max(1, clampInteger(turn, 1, 999999, 1));
  const entry = {
    kind,
    turn: normalizedTurn,
  };

  if (typeof data.unitType === "string" && data.unitType.trim()) {
    entry.unitType = normalizeUnitTypeId(data.unitType);
  }

  if (typeof data.technologyId === "string" && data.technologyId.trim()) {
    entry.technologyId = data.technologyId.trim();
  }

  if (typeof data.buildingType === "string" && data.buildingType.trim()) {
    entry.buildingType = data.buildingType.trim();
  }

  if (typeof data.requiredBuildingType === "string" && data.requiredBuildingType.trim()) {
    entry.requiredBuildingType = data.requiredBuildingType.trim();
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
      ? template.houseCompleted(getDefaultUnitName(entry.unitType))
      : "";
  }

  if (entry.kind === "buildingLimitReached") {
    return typeof template.buildingLimitReached === "function"
      ? template.buildingLimitReached(
          getBuildingLabel(entry.buildingType),
          getBuildingLabel(entry.requiredBuildingType),
        )
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
      ? template.unitLeft(getDefaultUnitName(entry.unitType))
      : "";
  }

  if (entry.kind === "researchGoalMissing") {
    return template.researchGoalMissing || "";
  }

  if (entry.kind === "technologyDiscovered") {
    return typeof template.technologyDiscovered === "function"
      ? template.technologyDiscovered(getTechnologyLabel(entry.technologyId))
      : "";
  }

  if (entry.kind === "populationCapReached" || entry.kind === "victory" || entry.kind === "defeat") {
    return template[entry.kind] || "";
  }

  return "";
}

function getActiveSituationMessage() {
  if (!isPlayMode() || mainMenuOpen || bookOverlayIntroMode || bookOverlayRestoreState || turnResolutionInProgress || isReplayPhase()) {
    return null;
  }

  return pendingSituationMessages[0] || null;
}

function setSituationMessageText(text) {
  setTextContent(situationMessageTextElements, text);
}

function setSituationMessageTurnText(text) {
  setTextContent(situationMessageTurnElements, text);
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

async function openBookForSituationMessage(message) {
  try {
    await Promise.all([
      ensureBookContentLoaded(),
      ...(message.kind === "technologyDiscovered" ? [ensureTechnologyCatalogLoaded()] : []),
    ]);
    if (getActiveSituationMessage() !== message) return;

    setSituationMessageText(getSituationMessageText(message));

    const pageId = message.kind === "technologyDiscovered"
      ? (getBookPageNumberById(message.technologyId)
          ? message.technologyId
          : bookDocument.bookmarks.find((bookmark) => bookmark.id === researchBookBookmarkId)?.page)
      : getUnitBookPageId(message.unitType);
    if (!pageId || !jumpBookToPageId(pageId)) return;

    await openBookOverlayPanel();
    if (getActiveSituationMessage() !== message || bookOverlay?.hidden) return;

    situationMessageReturnFocus = bookOverlay.querySelector('[data-action="close-book-overlay"]');
    acknowledgeSituationMessageButton?.focus({ preventScroll: true });
  } catch (error) {
    console.error("Could not open the situation message's book page.", error);
  }
}

function updateSituationMessagePanel() {
  if (!situationMessageOverlay) return;

  const message = getActiveSituationMessage();
  const wasHidden = situationMessageOverlay.hidden;

  situationMessageOverlay.hidden = !message;

  if (!message) {
    presentedBookMessage = null;
    setSituationMessageTurnText("");
    setSituationMessageText("");
    if (!wasHidden && situationMessageReturnFocus?.isConnected) {
      situationMessageReturnFocus.focus({ preventScroll: true });
    }
    situationMessageReturnFocus = null;
    return;
  }

  setSituationMessageTurnText(
    formatJulianTurnDate(clampInteger(message.turn, 1, 999999, currentTurn)),
  );
  setSituationMessageText(getSituationMessageText(message));

  if (wasHidden) {
    situationMessageReturnFocus = document.activeElement;
    acknowledgeSituationMessageButton?.focus({ preventScroll: true });
  }

  const opensBook = message.kind === "technologyDiscovered" || (
    message.kind === "houseCompleted" &&
    message.unitType &&
    message.unitType !== getDefaultUnitTypeId()
  );
  if (opensBook && presentedBookMessage !== message) {
    presentedBookMessage = message;
    void openBookForSituationMessage(message);
  }
}

function addSituationMessage(kind, data = {}) {
  const entry = createSituationMessageEntry(kind, data);

  pendingSituationMessages.push(entry);
  updateSituationMessagePanel();
  updateTurnControls();
  if (!turnResolutionInProgress && isPlayMode()) {
    void autosavePlayState();
  }

  return entry;
}

function acknowledgeSituationMessage() {
  if (!getActiveSituationMessage()) return false;

  pendingSituationMessages.shift();
  updateSituationMessagePanel();
  updateTurnControls();
  void autosavePlayState();
  if (pendingSituationMessages.length === 0) {
    maybeAutoAdvanceTurn();
  }
  return true;
}

function recordPopulationChange(change, currentUnit) {
  if (!currentUnit || (change !== 1 && change !== -1)) return;

  populationEvents.push({
    turn: currentTurn,
    change,
    unitType: getUnitTypeId(currentUnit),
  });
  refreshBookStockpileCharts();
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
  return isPlayMode() && !mainMenuOpen && !bookOverlayIntroMode && !bookOverlayRestoreState && audioSettings.musicEnabled;
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

  if (spec?.inspectorPreview === "move" || (isGatherTask(currentUnit?.task) && currentUnit.task.phase && currentUnit.task.phase !== "gather")) {
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
  return Boolean(getUnitActionSpec(task)?.countsAsWork) && (!isGatherTask(task) || !task.phase || task.phase === "gather");
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
      return filterUnitActionsForCargo(currentUnit, fallbackActions);
    }

    const mountedFallbackSet = mountedConfiguredSet
      ? new Set(fallbackActions.filter((action) => mountedConfiguredSet.has(action)))
      : fallbackSet;
    mountedFallbackSet.add(unitActions.dismount);
    return filterUnitActionsForCargo(currentUnit, orderedUnitActions.filter((action) => mountedFallbackSet.has(action)));
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

  return filterUnitActionsForCargo(currentUnit, allowed);
}

function filterUnitActionsForCargo(currentUnit, actions) {
  const cargo = getActiveCargo(currentUnit);
  if (!cargo) {
    return actions;
  }

  const canGatherMore = cargo.amount + quantityEpsilon < getActiveCargoCapacity(currentUnit);
  const gatherAction = cargo.resourceType === "food" ? unitActions.gatherFood : unitActions.gatherMaterials;
  const carriesInVehicle = getActiveCargoHolder(currentUnit) !== currentUnit;
  return actions.filter((action) =>
    action === unitActions.walk ||
    (carriesInVehicle && action === unitActions.dismount) ||
    (canGatherMore && action === gatherAction));
}

function canUnitUseAction(currentUnit = unit, action, context = getRuleContext()) {
  const normalizedAction = normalizePendingUnitAction(action);

  if (!currentUnit || !normalizedAction || (isPlayMode() && gameOutcome)) {
    return false;
  }

  if (!getUnitAllowedActions(currentUnit, context).includes(normalizedAction)) {
    return false;
  }

  if (normalizedAction === unitActions.dismount) {
    return getUnitDismountTargetCells(currentUnit).length > 0;
  }

  if (normalizedAction === unitActions.research && getUnitBaseResearchPointsPerTurn(currentUnit, context) <= 0) {
    return false;
  }

  if (normalizedAction === unitActions.plant && getUnitPlantedFoodCapacity("grain", currentUnit, context) <= 0) {
    return false;
  }

  return matchesRequirements(getUnitActionRequirements(currentUnit, normalizedAction, context), context);
}

function getUnitBaseResearchPointsPerTurn(currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(currentUnit, context).researchPointsPerTurn);

  if (!Number.isFinite(configured)) {
    return 0;
  }

  return Math.max(0, configured);
}

function getUnitResearchPointsPerTurn(currentUnit = unit, context = getRuleContext()) {
  return getUnitBaseResearchPointsPerTurn(currentUnit, context) * happiness / 100;
}

function getPreferredUnitAction(currentUnit = getSelectedUnit(), preferredAction = null) {
  const normalizedPreferred = normalizePendingSelectableUnitAction(preferredAction);

  if (!currentUnit) {
    return normalizedPreferred;
  }

  if (normalizedPreferred && canUnitUseSelectableAction(currentUnit, normalizedPreferred)) {
    return normalizedPreferred;
  }

  return null;
}

function isCellTargetUnitAction(action) {
  return (
    action === unitActions.walk ||
    action === unitActions.dismount ||
    action === unitActions.layFoundation ||
    action === unitActions.gatherFood ||
    action === unitActions.plant ||
    action === unitUiActions.work ||
    action === unitActions.gatherMaterials ||
    action === unitActions.buildHouse
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

  if (action === unitActions.plant) {
    return strings.actions.plant;
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

  return strings.actions.walk;
}

function getUnitTileActionOptions(currentUnit, cell) {
  const actions = [];
  const construction = [];
  const context = getRuleContext();
  const adjacent = areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
  const visible = isCellVisibleToPlayer(cell);

  if (canUnitUseAction(currentUnit, unitActions.walk, context) && canAssignUnitMoveTarget(cell, currentUnit)) {
    actions.push({ action: unitActions.walk, icon: "➜" });
  }

  if (visible && canUnitUseAction(currentUnit, unitActions.gatherFood, context) && canAssignGatherFoodTarget(cell, currentUnit)) {
    actions.push({ action: unitActions.gatherFood, icon: "❀" });
  }

  if (visible && canUnitUseAction(currentUnit, unitActions.gatherMaterials, context) && canAssignGatherMaterialsTarget(cell, currentUnit)) {
    actions.push({ action: unitActions.gatherMaterials, icon: "⚒" });
  }

  if (actions.some((option) => option.action === unitActions.gatherFood || option.action === unitActions.gatherMaterials)
    && !actions.some((option) => option.action === unitActions.walk)) {
    actions.unshift({ action: unitActions.walk, icon: "➜", disabled: true });
  }

  if (adjacent && canUnitUseAction(currentUnit, unitActions.dismount, context) && isValidUnitDismountTargetCell(currentUnit, cell)) {
    actions.push({ action: unitActions.dismount, icon: "↧" });
  }

  if (adjacent && visible && canUnitUseAction(currentUnit, unitActions.plant, context) && canPlantAtCell(cell, currentUnit)) {
    actions.push({ action: unitActions.plant, icon: "✿" });
  }

  if (adjacent && visible && canUnitUseAction(currentUnit, unitActions.buildHouse, context)) {
    const targetMode = getBuildHouseTargetMode(cell, { ignoreAffordability: true });
    if (targetMode?.mode === "construction") {
      actions.push({ action: unitActions.buildHouse, icon: "⚒" });
    } else if (targetMode?.mode === "new") {
      const costStatus = getConstructibleBuildCostStatus("building", "house", context);
      construction.push({
        action: unitActions.buildHouse,
        label: `${strings.actions.buildHouse}: ${getBuildingLabel("house")}`,
        icon: getConstructibleTypeIcon("building", "house"),
        costStatus,
        disabled: !costStatus.affordable,
      });
    }
  }

  if (adjacent && visible && canUnitUseAction(currentUnit, unitActions.layFoundation, context)) {
    const hasDirectHouseConstruction = construction.some((option) => option.action === unitActions.buildHouse);
    for (const constructible of getFoundationConstructibleOptions(context)) {
      if (hasDirectHouseConstruction && constructible.kind === "building" && constructible.type === "house") {
        continue;
      }

      const multiTile = isMultiTileConstructible(constructible);
      const placementCells = multiTile ? getAdjacentCells(getCell(currentUnit.x, currentUnit.y)) : [cell];
      let originCell = null;

      for (const placementCell of placementCells) {
        originCell = getConstructibleCandidateOriginsForPlacementCellForKind(
          constructible.kind, placementCell, constructible.type,
        ).find((origin) => canPlaceNewConstructibleConstructionOnCell(origin, constructible, currentUnit)
          && doesConstructiblePlacementTouchUnit(origin, constructible, currentUnit));
        if (originCell) break;
      }

      if (!originCell) continue;

      const costStatus = getConstructibleBuildCostStatus(constructible.kind, constructible.type, context);
      construction.push({
        action: unitActions.layFoundation,
        label: `${strings.actions.layFoundation}: ${getFoundationConstructibleLabel(constructible)}`,
        icon: getFoundationConstructibleIcon(constructible),
        constructible,
        originCell: multiTile ? null : originCell,
        costStatus,
        disabled: !costStatus.affordable,
      });
    }
  }

  if (cell.x === currentUnit.x && cell.y === currentUnit.y) {
    if (canUnitUseAction(currentUnit, unitActions.play, context)) {
      actions.push({ action: unitActions.play, icon: "♪" });
    }
    if (canUnitUseAction(currentUnit, unitActions.research, context)) {
      actions.push({ action: unitActions.research, icon: "✶" });
    }
  }

  return { actions, construction };
}

function closeUnitTileActionMenu() {
  if (unitTileActionMenu) {
    unitTileActionMenu.hidden = true;
    unitTileActionMenu.replaceChildren();
  }
  unitTileActionTarget = null;
}

function createUnitTileActionButton(option, index, group) {
  const button = document.createElement("button");
  const icon = document.createElement("span");
  const copy = document.createElement("span");
  const label = document.createElement("span");
  button.type = "button";
  button.className = "unit-tile-action-item";
  button.setAttribute("role", "menuitem");
  if (group === "construction") {
    button.dataset.constructionIndex = String(index);
  } else if (group === "context") {
    button.dataset.contextIndex = String(index);
  }
  button.disabled = Boolean(option.disabled);
  icon.className = "unit-tile-action-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = option.icon;
  label.textContent = option.label || getUnitActionLabel(option.action);
  copy.className = "unit-tile-action-copy";
  copy.append(label);
  if (option.costStatus) {
    const costs = document.createElement("span");
    costs.className = "unit-tile-action-costs";
    for (const entry of option.costStatus.entries) {
      const item = document.createElement("span");
      const image = document.createElement("img");
      item.className = `unit-tile-action-cost${entry.affordable ? "" : " is-missing"}`;
      image.src = resourceUiIcons[entry.resourceType];
      image.alt = "";
      item.append(image, document.createTextNode(formatDisplayedQuantity(entry.required)));
      costs.append(item);
    }
    copy.append(costs);
    button.setAttribute("aria-label", `${label.textContent}: ${option.costStatus.entries.map((entry) =>
      `${getResourceLabel(entry.resourceType)} ${formatDisplayedQuantity(entry.required)}`,
    ).join(", ")}`);
  }
  button.append(icon, copy);
  return button;
}

function positionUnitTileActionMenu(clientX, clientY) {
  const margin = 8;
  const width = unitTileActionMenu.offsetWidth;
  const height = unitTileActionMenu.offsetHeight;
  unitTileActionMenu.style.left = `${clamp(clientX, margin, Math.max(margin, window.innerWidth - width - margin))}px`;
  unitTileActionMenu.style.top = `${clamp(clientY, margin, Math.max(margin, window.innerHeight - height - margin))}px`;
}

function openUnitTileActionMenu(currentUnit, cell, clientX, clientY, options) {
  if (!unitTileActionMenu) return;
  closeUnitTileActionMenu();
  unitTileActionTarget = { unitId: currentUnit.id, x: cell.x, y: cell.y, options, clientX, clientY };

  for (const [index, option] of options.actions.entries()) {
    unitTileActionMenu.append(createUnitTileActionButton(option, index, "context"));
  }

  if (options.construction.length > 0) {
    const toggle = createUnitTileActionButton({ icon: "▦", label: strings.actions.buildHouse }, 0, "toggle");
    const submenu = document.createElement("div");
    toggle.dataset.toggleConstruction = "true";
    toggle.setAttribute("aria-expanded", "false");
    submenu.className = "unit-tile-action-submenu";
    submenu.hidden = true;
    for (const [index, option] of options.construction.entries()) {
      submenu.append(createUnitTileActionButton(option, index, "construction"));
    }
    unitTileActionMenu.append(toggle, submenu);
  }

  unitTileActionMenu.hidden = false;
  positionUnitTileActionMenu(clientX, clientY);
  unitTileActionMenu.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
}

function queueUnitTileAction(option, currentUnit, cell) {
  if (option.action === unitActions.layFoundation) {
    if (isMultiTileConstructible(option.constructible)) {
      if (!setSelectedFoundationConstructible(option.constructible.id)) return false;
      selectedUnitAction = unitActions.layFoundation;
      pendingFoundationPlacement = { unitId: currentUnit.id, constructibleId: option.constructible.id };
      playHoverCell = canShowBuildHouseCostHint(cell, currentUnit) ? cell : null;
      updateUnitActionControls();
      draw();
      return true;
    }

    return queueUnitAction(option.action, {
      currentUnit,
      destinationCell: getCell(option.originCell.x, option.originCell.y),
      constructible: option.constructible,
    });
  }
  return queueUnitAction(option.action, { currentUnit, destinationCell: cell });
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
  closeUnitTileActionMenu();
  document.documentElement.lang = currentLanguage;
  document.title = strings.app.title;
  viewport.setAttribute("aria-label", strings.aria.viewport);
  terrainMenuOptions.setAttribute("aria-label", strings.aria.terrainMenu);
  variantMenuOptions.setAttribute("aria-label", strings.aria.variantMenu);
  gameActionMenu?.setAttribute("aria-label", strings.aria.gameMenu);
  unitTileActionMenu?.setAttribute("aria-label", strings.aria.unitActions);
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
  setTextContent(musicToggleLabelElements, strings.audio.musicToggle);
  setTextContent(musicVolumeLabelElements, strings.audio.volume);
  setTextContent(slotNameLabels, strings.saveSlots.slotName);
  setTextContent(slotListTitles, strings.saveSlots.existingSlots);
  setTextContent(confirmSlotPanelButtons, strings.actions.save);
  setTextContent(importSlotPanelButtons, strings.actions.importFile);
  setTextContent(deleteSlotPanelButtons, strings.actions.delete);
  setTextContent(cancelSlotPanelButtons, strings.actions.cancel);
  setAttributeForElements(closeSlotPanelIconButtons, "aria-label", strings.actions.close);
  if (saveSlotEmpty) {
    saveSlotEmpty.textContent = strings.saveSlots.empty;
  }
  setTextContent([mainMenuItems.watchIntro], strings.menu.watchIntro);
  setTextContent([firstVisitIntroQuestion], strings.menu.firstVisitIntroQuestion);
  setTextContent([firstVisitIntroYesButton], strings.menu.firstVisitIntroYes);
  setTextContent([firstVisitIntroNoButton], strings.menu.firstVisitIntroNo);
  setTextContent([mainMenuItems.startNewGame], strings.menu.startNewGame);
  setTextContent([mainMenuItems.quickStart], strings.menu.quickStart);
  setTextContent([mainMenuItems.play], strings.menu.play);
  setTextContent([mainMenuItems.loadGame], strings.menu.loadGame);
  setTextContent([mainMenuItems.book], strings.menu.book);
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
  setTextContent(mapGenerationTitleElements, strings.mapGeneration.title);
  setTextContent(mapGenerationSizeTitleElements, strings.mapGeneration.sizeTitle);
  setTextContent(mapGenerationRandomTitleElements, strings.mapGeneration.randomTitle);
  setTextContent(mapGenerationWidthLabelElements, strings.mapGeneration.width);
  setTextContent(mapGenerationHeightLabelElements, strings.mapGeneration.height);
  setTextContent(mapGenerationSizePresetLabelElements, strings.mapGeneration.sizePreset);
  setTextContent(mapGenerationSizeSmallLabelElements, strings.mapGeneration.sizeSmall);
  setTextContent(mapGenerationSizeNormalLabelElements, strings.mapGeneration.sizeNormal);
  setTextContent(mapGenerationSizeBigLabelElements, strings.mapGeneration.sizeBig);
  setTextContent(mapGenerationWaterLabelElements, strings.terrain.water);
  setTextContent(mapGenerationForestLabelElements, strings.terrain.forest);
  setTextContent(mapGenerationMountainLabelElements, strings.terrain.mountain);
  setTextContent(mapGenerationFoodLabelElements, strings.resources.food);
  setTextContent(confirmMapGenerationButtons, strings.actions.generate);
  setTextContent(closeMapGenerationButtons.filter((button) => button.dataset.action === "cancel-map-generation"), strings.actions.cancel);
  setAttributeForElements(closeMapGenerationButtons.filter((button) => button.dataset.action === "close-map-generation"), "aria-label", strings.actions.close);
  updateMapGenerationPanelText();
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
  setAttributeForElements(unitBookPageButtons, "aria-label", strings.actions.openBook);
  setAttributeForElements(unitBookPageButtons, "title", strings.actions.openBook);
  setAttributeForElements(gatherLoopIndicators, "aria-label", strings.actions.collectingContinuously);
  setAttributeForElements(gatherLoopIndicators, "title", strings.actions.collectingContinuously);
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

function isIndexedDbAvailable() {
  return typeof window.indexedDB?.open === "function";
}

function idbRequestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error || new Error("IndexedDB request failed."));
    };
  });
}

function openSaveDatabase() {
  if (!isIndexedDbAvailable()) {
    return Promise.resolve(null);
  }

  if (!saveDatabasePromise) {
    saveDatabasePromise = new Promise((resolve) => {
      let settled = false;
      const request = window.indexedDB.open(saveDatabaseConfig.name, saveDatabaseConfig.version);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(saveDatabaseConfig.storeName)) {
          database.createObjectStore(saveDatabaseConfig.storeName, { keyPath: "name" });
        }
      };

      request.onsuccess = () => {
        const database = request.result;

        database.onversionchange = () => {
          database.close();
        };

        settled = true;
        resolve(database);
      };

      request.onerror = () => {
        console.warn("Could not open save database.", request.error);
        settled = true;
        saveDatabasePromise = null;
        resolve(null);
      };

      request.onblocked = () => {
        if (settled) {
          return;
        }

        console.warn("Save database open request is blocked.");
        settled = true;
        saveDatabasePromise = null;
        resolve(null);
      };
    });
  }

  return saveDatabasePromise;
}

async function listIndexedDbSaveRecords() {
  const database = await openSaveDatabase();

  if (!database) {
    return [];
  }

  try {
    const store = database.transaction(saveDatabaseConfig.storeName, "readonly").objectStore(saveDatabaseConfig.storeName);
    const records = await idbRequestToPromise(store.getAll());
    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.warn("Could not read IndexedDB save records.", error);
    return [];
  }
}

async function getIndexedDbSaveRecord(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) {
    return null;
  }

  const database = await openSaveDatabase();

  if (!database) {
    return null;
  }

  try {
    const store = database.transaction(saveDatabaseConfig.storeName, "readonly").objectStore(saveDatabaseConfig.storeName);
    const record = await idbRequestToPromise(store.get(normalizedName));
    return record && typeof record === "object" ? record : null;
  } catch (error) {
    console.warn(`Could not read IndexedDB save record ${normalizedName}.`, error);
    return null;
  }
}

async function putIndexedDbSaveRecord(fileName, rawContents) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName || typeof rawContents !== "string") {
    return false;
  }

  const database = await openSaveDatabase();

  if (!database) {
    return false;
  }

  try {
    const store = database.transaction(saveDatabaseConfig.storeName, "readwrite").objectStore(saveDatabaseConfig.storeName);
    await idbRequestToPromise(store.put({
      name: normalizedName,
      raw: rawContents,
      updatedAt: Date.now(),
    }));
    return true;
  } catch (error) {
    throw error;
  }
}

async function deleteIndexedDbSaveRecord(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) {
    return false;
  }

  const database = await openSaveDatabase();

  if (!database) {
    return false;
  }

  try {
    const store = database.transaction(saveDatabaseConfig.storeName, "readwrite").objectStore(saveDatabaseConfig.storeName);
    await idbRequestToPromise(store.delete(normalizedName));
    return true;
  } catch (error) {
    console.warn(`Could not delete IndexedDB save record ${normalizedName}.`, error);
    return false;
  }
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
  if (turnResolutionInProgress || isReplayPhase()) return;

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

function getTileInspectorInfoEntries(cell) {
  if (!cell) {
    return [];
  }

  const entries = [];
  const building = getBuildingAtCell(cell.x, cell.y);
  const vehicle = getVehicleAtCell(cell.x, cell.y);
  const materialType = getCellMaterialResourceType(cell);
  const pathProgressEligible =
    cell.type === "grass"
    && !doesSeasonSuppressPathEffects(cell)
    && getCellVisitsCount(cell) >= getCellPathPreviewVisitsThreshold(cell);

  if (building) {
    const completeness = Math.round(getBuildingCompleteness(building) * 100);
    const resident = completeness >= 100 ? getBuildingResident(building) : null;
    const buildingLabel = getBuildingLabel(building.type);
    const residentName = resident ? getDefaultUnitName(getUnitTypeId(resident)) : "";
    const residentLabel = residentName && typeof strings.play?.houseResident === "function"
      ? strings.play.houseResident(residentName, getUnitTypeId(resident))
      : residentName;
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
      const cargo = normalizeVehicleCargo(vehicle.cargo, vehicle);
      const cargoLabel = cargo
        ? ` | ${strings.readouts.cargo(
          formatDisplayedQuantity(cargo.amount),
          formatDisplayedQuantity(getVehicleCargoCapacity(vehicle)),
          getResourceLabel(cargo.resourceType),
        )}`
        : "";
      entries.push({
        kind: "vehicle",
        cell,
        vehicle,
        label: `${completeness >= 100 ? vehicleLabel : `${vehicleLabel} ${completeness}%`}${cargoLabel}`,
      });
    }

    if (hasFoodResource(cell) && !doesSeasonHideLandFoodVisuals(cell)) {
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
  const renderSpec = getTerrainTileRenderSpec(cell);
  const seasonalImage = renderSpec?.seasonalImagePath
    ? tileImages[renderSpec.seasonalImagePath]
    : null;
  const baseImage = renderSpec?.baseImagePath
    ? tileImages[renderSpec.baseImagePath]
    : null;
  const image = seasonalImage?.complete && seasonalImage.naturalWidth > 0
    ? seasonalImage
    : baseImage;

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

  const overlaySpec = getFoodOverlayDisplaySpec(cell);

  if (!overlaySpec?.imagePath) {
    return;
  }

  const image = resourceOverlayImages[overlaySpec.imagePath];

  if (!image?.complete || image.naturalWidth <= 0) {
    return;
  }

  const drawWidth = baseTile.width * overlaySpec.scale;
  const drawHeight = baseTile.height * overlaySpec.scale;
  const baseY = baseTile.height * overlaySpec.baseYFactor;

  context.save();
  context.globalAlpha = overlaySpec.opacity;
  context.drawImage(
    image,
    baseTile.width / 2 - drawWidth / 2,
    baseY - drawHeight,
    drawWidth,
    drawHeight,
  );
  context.restore();
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

function getUnitCarryingCapacity(unitOrTypeId = getDefaultUnitTypeId(), context = getRuleContext()) {
  return clampNonNegativeNumber(getEffectiveUnitConfig(unitOrTypeId, context).carryingCapacity, 999999, 24);
}

function normalizeCargo(cargo, capacity) {
  const resourceType = cargo?.resourceType;
  const amount = clampNonNegativeNumber(cargo?.amount, capacity, 0);

  if (!stockpileResourceTypes.includes(resourceType) || amount <= 0) {
    return null;
  }

  return { resourceType, amount };
}

function normalizeUnitCargo(cargo, unitOrTypeId = getDefaultUnitTypeId()) {
  return normalizeCargo(cargo, getUnitCarryingCapacity(unitOrTypeId));
}

function getVehicleCargoCapacity(vehicleOrType) {
  const type = typeof vehicleOrType === "string" ? vehicleOrType : vehicleOrType?.type;
  return clampNonNegativeNumber(getConstructibleRules("vehicle", type)?.cargoCapacity, 999999, 0);
}

function normalizeVehicleCargo(cargo, vehicleOrType) {
  return normalizeCargo(cargo, getVehicleCargoCapacity(vehicleOrType));
}

function getActiveCargoHolder(currentUnit) {
  const vehicle = getMountedVehicle(currentUnit);
  return vehicle && getVehicleCargoCapacity(vehicle) > 0 ? vehicle : currentUnit;
}

function getActiveCargoCapacity(currentUnit) {
  const holder = getActiveCargoHolder(currentUnit);
  return holder === currentUnit ? getUnitCarryingCapacity(currentUnit) : getVehicleCargoCapacity(holder);
}

function getActiveCargo(currentUnit) {
  return normalizeCargo(getActiveCargoHolder(currentUnit)?.cargo, getActiveCargoCapacity(currentUnit));
}

function setActiveCargo(currentUnit, cargo) {
  const holder = getActiveCargoHolder(currentUnit);
  if (!holder) return;
  holder.cargo = normalizeCargo(cargo, getActiveCargoCapacity(currentUnit));
  invalidateStaticUnitsLayer();
  if (holder !== currentUnit) invalidateStaticLayer();
}

function getActiveCargoRoom(currentUnit, resourceType) {
  if (!currentUnit || !stockpileResourceTypes.includes(resourceType)) {
    return 0;
  }

  const cargo = getActiveCargo(currentUnit);
  if (cargo && cargo.resourceType !== resourceType) {
    return 0;
  }

  return Math.max(0, getActiveCargoCapacity(currentUnit) - (cargo?.amount || 0));
}

function addToActiveCargo(currentUnit, resourceType, amount) {
  const currentCargo = getActiveCargo(currentUnit);
  const added = Math.min(clampNonNegativeNumber(amount, 999999, 0), getActiveCargoRoom(currentUnit, resourceType));
  if (added <= 0) {
    return 0;
  }

  setActiveCargo(currentUnit, {
    resourceType,
    amount: (currentCargo?.amount || 0) + added,
  });
  return added;
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

function getUnitBookPageId(currentUnit = unit, context = getRuleContext()) {
  const resolvedConfig = getEffectiveUnitConfig(currentUnit, context);
  const configured = typeof resolvedConfig?.bookPageId === "string"
    ? resolvedConfig.bookPageId.trim()
    : "";

  return configured || "";
}

function hasLoadedBookPageId(pageId) {
  const normalizedPageId = typeof pageId === "string" ? pageId.trim() : "";

  if (!normalizedPageId) {
    return false;
  }

  const canValidateAgainstLoadedBook =
    bookDocument?.loaded &&
    bookDocument.requestedLanguage === currentLanguage;

  return !canValidateAgainstLoadedBook || Number.isInteger(getBookPageNumberById(normalizedPageId));
}

function updateUnitBookPageButtons(currentUnit = null, unitName = "") {
  const pageId = currentUnit ? getUnitBookPageId(currentUnit) : "";
  const hasPage = hasLoadedBookPageId(pageId);
  const label = unitName
    ? `${strings.actions.openBook}: ${unitName}`
    : strings.actions.openBook;

  for (const button of unitBookPageButtons) {
    button.dataset.bookPageId = hasPage ? pageId : "";
    button.dataset.available = hasPage ? "true" : "false";
    button.disabled = !hasPage;
    button.setAttribute("aria-hidden", hasPage ? "false" : "true");
    button.setAttribute("aria-label", label);
    button.title = label;
  }
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

function getCellSeason(cell) {
  return normalizeCellSeason(cell?.season);
}

function isLandCell(cell) {
  return Boolean(cell) && cell.type !== "water";
}

function isWinter2SeasonCell(cell) {
  return getCellSeason(cell) === "winter2";
}

function doesSeasonDisableLandFoodRegrowth(cell) {
  return isLandCell(cell) && ["autumn", "winter1", "winter2"].includes(getCellSeason(cell));
}

function doesSeasonHideLandFoodVisuals(cell) {
  return isLandCell(cell) && isWinter2SeasonCell(cell);
}

function isSeasonallyWalkableWaterCell(cell) {
  return Boolean(cell) && cell.type === "water" && isWinter2SeasonCell(cell);
}

function doesMovementRuleListAllowCell(movementTerrains, cell, alternativeTerrain = null) {
  if (!cell) {
    return false;
  }

  const cellSeason = getCellSeason(cell);

  return Array.isArray(movementTerrains) && movementTerrains.some((entry) =>
    (entry?.terrain === cell.type || (alternativeTerrain && entry.terrain === alternativeTerrain)) &&
    (!entry.season || entry.season === cellSeason)
  );
}

function getTerrainMoveCost(cell, fromCell = null) {
  if (!cell) return Number.POSITIVE_INFINITY;

  if (isSeasonallyWalkableWaterCell(cell)) {
    return 1;
  }

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

function getUnitPlantedFoodCapacity(foodType, currentUnit = unit, context = getRuleContext()) {
  if (typeof foodType !== "string" || !foodType.trim()) {
    return 0;
  }

  const configured = Number(getEffectiveUnitConfig(currentUnit, context).plantedFoodCapacities?.[foodType]);

  if (!Number.isFinite(configured)) {
    return Math.max(0, getFoodTypeMaxAmount(foodType));
  }

  return Math.max(0, configured);
}

function getUnitWorkPointsPerTurn(taskType, currentUnit = unit, context = getRuleContext()) {
  const configured = Number(getEffectiveUnitConfig(currentUnit, context).workPointsPerTurn?.[taskType]);

  if (!Number.isFinite(configured)) {
    return 0;
  }

  return Math.max(0, configured * getMountedWorkPointsMultiplier(taskType, currentUnit, context) * happiness / 100);
}

function getGatherTaskDurationTurns() {
  const configured = Number(rules.resources?.gathering?.durationTurns);

  if (!Number.isFinite(configured)) {
    return 3;
  }

  return Math.max(1, Math.floor(configured));
}

function getMinimumFoodGatherAmount() {
  const configured = Number(rules.resources?.gathering?.minimumFoodAmount);

  return Number.isFinite(configured) ? Math.max(0, configured) : 2;
}

function getGatherTaskTurnsRemaining(task) {
  return clampInteger(task?.turnsRemaining, 1, getGatherTaskDurationTurns(), getGatherTaskDurationTurns());
}

function isGatherTaskCycleStart(task) {
  return getGatherTaskTurnsRemaining(task) >= getGatherTaskDurationTurns();
}

function canGatherTaskDepleteOnThisTurn(task) {
  return isGatherTaskCycleStart(task) && task?.allowDepletionOnCycleStart !== false;
}

function isGatherTask(task) {
  return isTaskAction(task, unitActions.gatherFood) || isTaskAction(task, unitActions.gatherMaterials);
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

function getFoodTypeRegrowthRate(foodType) {
  const regrowthRate = Number(getFoodDefinition(foodType)?.regrowthRate);

  if (!Number.isFinite(regrowthRate)) {
    return 0;
  }

  return Math.max(0, regrowthRate);
}

function getFoodOverlayStageDefinitions(foodType) {
  const definition = getFoodDefinition(foodType) || {};
  const defaultScale = Number(definition.overlayScale);
  const defaultBaseYFactor = Number(definition.overlayBaseYFactor);
  const rawStages = Array.isArray(definition.overlayStages) ? definition.overlayStages : [];
  const normalizedStages = rawStages
    .map((stage) => {
      if (!stage || typeof stage !== "object") {
        return null;
      }

      const imagePath = typeof stage.image === "string" && stage.image
        ? stage.image
        : (typeof stage.overlayImage === "string" && stage.overlayImage ? stage.overlayImage : null);

      if (!imagePath) {
        return null;
      }

      const minFillRatio = Number(stage.minFillRatio);
      const scale = Number(stage.scale);
      const baseYFactor = Number(stage.baseYFactor);
      const opacity = Number(stage.opacity);

      return {
        imagePath,
        minFillRatio: clampNumber(minFillRatio, 0, 1, 0),
        scale: Number.isFinite(scale) && scale > 0
          ? scale
          : (Number.isFinite(defaultScale) && defaultScale > 0 ? defaultScale : 1),
        baseYFactor: Number.isFinite(baseYFactor)
          ? baseYFactor
          : (Number.isFinite(defaultBaseYFactor) ? defaultBaseYFactor : 1),
        opacity: clampNumber(opacity, 0, 1, 1),
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.minFillRatio - left.minFillRatio);

  if (normalizedStages.length > 0) {
    return normalizedStages;
  }

  const legacyOverlayImage = typeof definition.overlayImage === "string" && definition.overlayImage
    ? definition.overlayImage
    : null;

  if (!legacyOverlayImage) {
    return [];
  }

  return [
    {
      imagePath: legacyOverlayImage,
      minFillRatio: 0,
      scale: Number.isFinite(defaultScale) && defaultScale > 0 ? defaultScale : 1,
      baseYFactor: Number.isFinite(defaultBaseYFactor) ? defaultBaseYFactor : 1,
      opacity: 1,
    },
  ];
}

function getFoodOverlayDisplaySpec(cell) {
  if (!cell?.foodType) {
    return null;
  }

  if (doesSeasonHideLandFoodVisuals(cell)) {
    return null;
  }

  const maxAmount = getCellFoodMaxAmount(cell);
  if (maxAmount <= 0) {
    return null;
  }

  const currentAmount = clampNumber(Number(cell.foodAmount), 0, maxAmount, 0);
  if (currentAmount <= 0) {
    return null;
  }

  const fillRatio = currentAmount / maxAmount;
  const stages = getFoodOverlayStageDefinitions(cell.foodType);

  for (const stage of stages) {
    if (fillRatio >= stage.minFillRatio) {
      return stage;
    }
  }

  return stages[stages.length - 1] || null;
}

function getCellFoodMaxAmount(cell) {
  if (!cell?.foodType) {
    return 0;
  }

  return clampNonNegativeNumber(cell.foodCapacity, 999999, 0);
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
  return hasFoodResource(cell) && !doesSeasonHideLandFoodVisuals(cell) && cell.foodAmount > 0;
}

function hasCollectibleFoodResource(cell) {
  return hasGatherableFoodResource(cell)
    && hasSufficientQuantity(cell.foodAmount, getMinimumFoodGatherAmount());
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

function unloadActiveCargoAtCell(currentUnit, cell) {
  const cargo = getActiveCargo(currentUnit);
  if (!cargo || !cell) {
    return 0;
  }

  const hasStore = getAdjacentCells(cell).some((neighbor) => {
    const building = getBuildingAtCell(neighbor.x, neighbor.y);
    return building?.state === "complete" && getBuildingResourceStorageCapacity(building.type, cargo.resourceType) > 0;
  });
  if (!hasStore) {
    return 0;
  }

  const stored = addToStockpile(cargo.resourceType, cargo.amount);
  if (
    isGatherTask(currentUnit.task) &&
    hasSufficientQuantity(getCurrentStockpileAmount(cargo.resourceType), getResourceStorageCapacity(cargo.resourceType))
  ) {
    currentUnit.task.stopAfterDelivery = true;
  }
  setActiveCargo(currentUnit, null);
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

  const countByBuilding = normalizedLimits.countByBuilding;
  const providerCount = getCountForRuleMap(context.completeBuildingCountsByType, countByBuilding?.building);
  const allowedCount = getCountByBuildingAllowedCount(countByBuilding, providerCount);

  if (allowedCount !== null && subjectCount >= allowedCount) {
    return false;
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

  if (isPlayMode() && normalizedKind === "building" && type === "house" && isPopulationAtCapacity()) {
    return false;
  }

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

function getPendingFoundationPlacement(currentUnit = getSelectedUnit()) {
  if (!currentUnit || pendingFoundationPlacement?.unitId !== currentUnit.id) return null;

  const constructible = getSelectedFoundationConstructible();
  return constructible?.id === pendingFoundationPlacement.constructibleId ? constructible : null;
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

function getConstructionWorkCompletenessDelta(taskType, structure, currentUnit) {
  if (!structure) {
    return 0;
  }

  const workPoints = getUnitWorkPointsPerTurn(taskType, currentUnit);
  const cost = getConstructibleConstructionCost(structure.riderUnitId !== undefined ? "vehicle" : "building", structure.type);

  if (workPoints <= 0 || cost <= 0) {
    return 0;
  }

  return clamp(workPoints / cost, 0, 1);
}

async function getSaveSlotEntries() {
  const entries = [];

  for (const record of await listIndexedDbSaveRecords()) {
    const name = sanitizeFileName(record?.name);
    const raw = typeof record?.raw === "string" ? record.raw : null;
    let parsed = null;
    let isValidJson = false;

    if (raw) {
      try {
        parsed = JSON.parse(raw);
        isValidJson = true;
      } catch (error) {
        parsed = null;
      }
    }

    if (!name) {
      continue;
    }

    entries.push({
      name,
      raw,
      parsed,
      isValidJson,
      isCompatible: isCompatibleSaveState(parsed),
    });
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

function normalizeMapGenerationSliderValue(value, fallback = 50) {
  return clampInteger(value, 0, 100, fallback);
}

function normalizeMapGenerationDimension(value, fallback = defaultMapConfig.width) {
  return clampInteger(value, minimumGeneratedMapDimension, 512, fallback);
}

function normalizeMapGenerationSettings(settings = defaultMapGenerationSettings) {
  return {
    water: normalizeMapGenerationSliderValue(settings?.water, defaultMapGenerationSettings.water),
    forest: normalizeMapGenerationSliderValue(settings?.forest, defaultMapGenerationSettings.forest),
    mountain: normalizeMapGenerationSliderValue(settings?.mountain, defaultMapGenerationSettings.mountain),
    food: normalizeMapGenerationSliderValue(settings?.food, defaultMapGenerationSettings.food),
  };
}

function normalizeMapGenerationSize(settings = defaultMapGenerationSize) {
  return {
    width: normalizeMapGenerationDimension(settings?.width, defaultMapGenerationSize.width),
    height: normalizeMapGenerationDimension(settings?.height, defaultMapGenerationSize.height),
  };
}

function getMapGenerationSizePresetId(size = defaultMapGenerationSize) {
  const normalizedSize = normalizeMapGenerationSize(size);

  for (const [presetId, presetSize] of Object.entries(mapGenerationSizePresets)) {
    if (presetSize.width === normalizedSize.width && presetSize.height === normalizedSize.height) {
      return presetId;
    }
  }

  return null;
}

function getMapGenerationSettingsFromInputs() {
  return normalizeMapGenerationSettings({
    water: mapGenerationWaterInput?.value,
    forest: mapGenerationForestInput?.value,
    mountain: mapGenerationMountainInput?.value,
    food: mapGenerationFoodInput?.value,
  });
}

function getMapGenerationSizeFromInputs() {
  return normalizeMapGenerationSize({
    width: mapGenerationWidthInput?.value,
    height: mapGenerationHeightInput?.value,
  });
}

function formatMapGenerationSliderReadout(value) {
  const normalizedValue = normalizeMapGenerationSliderValue(value);

  if (normalizedValue <= 0) {
    return strings.mapGeneration.veryLittle;
  }

  if (normalizedValue >= 100) {
    return strings.mapGeneration.aLot;
  }

  if (normalizedValue <= 24) {
    return strings.mapGeneration.little;
  }

  if (normalizedValue <= 49) {
    return strings.mapGeneration.some;
  }

  if (normalizedValue <= 74) {
    return strings.mapGeneration.quiteALot;
  }

  return strings.mapGeneration.aLot;
}

function updateMapGenerationPanelValueReadouts(settings = getMapGenerationSettingsFromInputs()) {
  const normalizedSettings = normalizeMapGenerationSettings(settings);
  setTextContent(mapGenerationWaterValueElements, formatMapGenerationSliderReadout(normalizedSettings.water));
  setTextContent(mapGenerationForestValueElements, formatMapGenerationSliderReadout(normalizedSettings.forest));
  setTextContent(mapGenerationMountainValueElements, formatMapGenerationSliderReadout(normalizedSettings.mountain));
  setTextContent(mapGenerationFoodValueElements, formatMapGenerationSliderReadout(normalizedSettings.food));
}

function updateMapGenerationPanelText() {
  const targetMode = mapGenerationPanelState?.targetMode || interactionModes.play;
  const isEmptyMap = mapGenerationPanelState?.generationKind === "empty";
  const subtitle = isEmptyMap
    ? strings.mapGeneration.subtitleEmptyEdit
    : targetMode === interactionModes.edit
      ? strings.mapGeneration.subtitleEdit
      : strings.mapGeneration.subtitlePlay;
  const title = isEmptyMap ? strings.mapGeneration.emptyTitle : strings.mapGeneration.title;

  setTextContent(mapGenerationTitleElements, title);
  setTextContent(mapGenerationSubtitleElements, subtitle);
  for (const group of mapGenerationRandomFieldGroups) {
    group.hidden = isEmptyMap;
  }
  updateMapGenerationPanelValueReadouts();
}

function syncMapGenerationPanelInputs(settings = mapGenerationSettings) {
  const normalizedSettings = normalizeMapGenerationSettings(settings);

  if (mapGenerationWaterInput) {
    mapGenerationWaterInput.value = String(normalizedSettings.water);
  }

  if (mapGenerationForestInput) {
    mapGenerationForestInput.value = String(normalizedSettings.forest);
  }

  if (mapGenerationMountainInput) {
    mapGenerationMountainInput.value = String(normalizedSettings.mountain);
  }

  if (mapGenerationFoodInput) {
    mapGenerationFoodInput.value = String(normalizedSettings.food);
  }

  updateMapGenerationPanelValueReadouts(normalizedSettings);
}

function syncMapGenerationSizeInputs(size = mapGenerationSize) {
  const normalizedSize = normalizeMapGenerationSize(size);
  const presetId = getMapGenerationSizePresetId(normalizedSize);

  if (mapGenerationWidthInput) {
    mapGenerationWidthInput.value = String(normalizedSize.width);
  }

  if (mapGenerationHeightInput) {
    mapGenerationHeightInput.value = String(normalizedSize.height);
  }

  for (const input of mapGenerationSizePresetInputs) {
    input.checked = input.value === presetId;
  }
}

function closeMapGenerationPanel({ restoreFocus = false } = {}) {
  if (mapGenerationOverlay) {
    mapGenerationOverlay.hidden = true;
  }

  if (restoreFocus && mapGenerationPanelState?.returnFocusButton) {
    mapGenerationPanelState.returnFocusButton.focus({ preventScroll: true });
  }

  mapGenerationPanelState = null;
}

function openMapGenerationPanel({
  targetMode = interactionModes.play,
  returnFocusButton = null,
  generationKind = "random",
} = {}) {
  mapGenerationPanelState = {
    targetMode,
    returnFocusButton,
    generationKind: generationKind === "empty" ? "empty" : "random",
  };

  if (mapGenerationOverlay) {
    mapGenerationOverlay.hidden = false;
  }

  syncMapGenerationPanelInputs(mapGenerationSettings);
  syncMapGenerationSizeInputs(mapGenerationSize);
  updateMapGenerationPanelText();
  requestAnimationFrame(() => {
    mapGenerationWidthInput?.focus({ preventScroll: true });
  });
}

async function commitMapGenerationPanel() {
  if (!mapGenerationPanelState) {
    return false;
  }

  const targetMode = mapGenerationPanelState.targetMode || interactionModes.play;
  const buildCells = mapGenerationPanelState.generationKind === "empty"
    ? buildEmptyMapCells
    : buildGeneratedMapCells;
  const nextSettings = getMapGenerationSettingsFromInputs();
  const nextSize = getMapGenerationSizeFromInputs();

  mapGenerationSettings = nextSettings;
  mapGenerationSize = nextSize;
  closeMapGenerationPanel();

  if (targetMode === interactionModes.play) {
    await runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      startNewGeneratedState(targetMode, buildCells, nextSettings, nextSize);
    });
    return true;
  }

  startNewGeneratedState(targetMode, buildCells, nextSettings, nextSize);
  return true;
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

async function renderSaveSlotList() {
  if (!saveSlotList || !saveSlotEmpty) return [];

  const saveEntries = await getSaveSlotEntries();
  saveSlotList.replaceChildren();
  saveSlotEmpty.hidden = saveEntries.length > 0;

  for (const entry of saveEntries) {
    const button = document.createElement("button");
    const isSelected = slotPanelState?.value === entry.name;
    const nameSpan = document.createElement("span");
    const metaSpan = document.createElement("span");
    const metaParts = [];

    button.type = "button";
    button.className = "slot-panel-item";
    nameSpan.className = "slot-panel-item-name";
    nameSpan.textContent = entry.name;
    metaSpan.className = "slot-panel-item-meta";

    if (!entry.isValidJson) {
      metaParts.push(strings.saveSlots.invalidTag);
    } else if (!entry.isCompatible) {
      metaParts.push(strings.saveSlots.obsoleteTag);
    }

    metaSpan.textContent = metaParts.join(" · ");
    button.dataset.slotName = entry.name;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", isSelected ? "true" : "false");
    button.append(nameSpan);

    if (metaParts.length > 0) {
      button.append(metaSpan);
    }

    saveSlotList.append(button);
  }

  updateSaveSlotPanelActionStates(saveEntries);
  return saveEntries;
}

function hasSaveSlotEntry(fileName, entries = []) {
  const normalizedName = sanitizeFileName(fileName);
  return Boolean(normalizedName) && entries.some((entry) => entry.name === normalizedName);
}

function updateSaveSlotPanelActionStates(saveEntries = []) {
  const selectedName = sanitizeFileName(slotPanelState?.value || saveSlotInput?.value || "");
  const canDelete = Boolean(slotPanelState && slotPanelState.mode === "export" && hasSaveSlotEntry(selectedName, saveEntries));

  for (const button of deleteSlotPanelButtons) {
    button.hidden = slotPanelState?.mode !== "export";
    button.disabled = !canDelete;
  }
}

async function updateSaveSlotPanel() {
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
  await renderSaveSlotList();
}

function clearCurrentFileNameReferences(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) {
    return;
  }

  for (const mode of Object.keys(currentFileNames)) {
    if (getCurrentFileName(mode) === normalizedName) {
      writeCurrentFileName(mode, null);
    }
  }
}

async function deleteSaveFile(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) {
    window.alert(strings.messages.missingSaveName);
    return false;
  }

  const saveEntries = await getSaveSlotEntries();

  if (!hasSaveSlotEntry(normalizedName, saveEntries)) {
    window.alert(strings.messages.saveNotFound(normalizedName));
    return false;
  }

  if (!window.confirm(strings.messages.deleteSaveConfirm(normalizedName))) {
    return false;
  }

  try {
    if (!(await deleteIndexedDbSaveRecord(normalizedName))) {
      throw new Error(`Could not delete IndexedDB save record ${normalizedName}.`);
    }

    if (await readRawSaveFile(normalizedName)) {
      throw new Error(`Save slot ${normalizedName} still exists after delete attempt.`);
    }

    clearCurrentFileNameReferences(normalizedName);

    if (slotPanelState?.value === normalizedName) {
      slotPanelState.value = "";
      if (saveSlotInput) {
        saveSlotInput.value = "";
      }
    }

    await renderSaveSlotList();
    updatePersistenceControls();
    return true;
  } catch (error) {
    console.warn(`Could not delete file ${normalizedName}.`, error);
    window.alert(strings.messages.deleteSaveFailed(normalizedName));
    return false;
  }
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

  void updateSaveSlotPanel();
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
    const shouldRevealAfterLoad =
      mainMenuOpen && Object.values(interactionModes).includes(targetMode);
    const existingState = await readSaveFile(fileName);

    if (!existingState) {
      window.alert(strings.messages.saveNotFound(fileName));
      return false;
    }

    if (!isCompatibleSaveState(existingState)) {
      window.alert(strings.messages.obsoleteSave(fileName));
      return false;
    }

    await ensureVisualAssetsLoaded();

    if (!shouldRevealAfterLoad && (mainMenuOpen || interactionMode !== targetMode) && Object.values(interactionModes).includes(targetMode)) {
      setInteractionMode(targetMode, { drawNow: false });
    }

    if (!(await loadFileIntoMode(fileName, targetMode))) {
      window.alert(strings.messages.obsoleteSave(fileName));
      return false;
    }

    if (shouldRevealAfterLoad) {
      setInteractionMode(targetMode);
    }
  } else if (slotPanelState.mode === "export") {
    if (!(await exportSaveFile(fileName))) {
      return false;
    }
  } else {
    if (!(await saveStateToFile(fileName, targetMode))) {
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
    if (Object.prototype.hasOwnProperty.call(override, actionId) && override[actionId] === null) {
      continue;
    }

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
    plantedFoodCapacities: base.plantedFoodCapacities ? { ...base.plantedFoodCapacities } : undefined,
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

      if (Number.isFinite(set.carryingCapacity)) {
        resolved.carryingCapacity = set.carryingCapacity;
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

      if (set.plantedFoodCapacities && typeof set.plantedFoodCapacities === "object") {
        resolved.plantedFoodCapacities = {
          ...(resolved.plantedFoodCapacities || {}),
          ...set.plantedFoodCapacities,
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
    plantedFoodCapacities: {
      ...(defaultConfig.plantedFoodCapacities || {}),
      ...(typeConfig.plantedFoodCapacities || {}),
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

function serializeCell(cell) {
  return [
    cell.type,
    ensureCellVariant(cell),
    normalizeCellSeason(cell.season),
    Boolean(cell.visited) ? 1 : 0,
    Math.max(0, clampInteger(cell.visitsCount, 0, getCellPathWellKnownVisitsThreshold(cell), 0)),
    clampNonNegativeNumber(cell.materialAmount, 999999, 0),
    typeof cell.foodType === "string" && cell.foodType ? cell.foodType : "",
    getCellFoodMaxAmount(cell),
    clampNonNegativeNumber(cell.foodAmount, 999999, 0),
  ];
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
    turnsRemaining: getGatherTaskTurnsRemaining(task),
    allowDepletionOnCycleStart: task?.allowDepletionOnCycleStart !== false,
    phase: ["gather", "deliver", "return"].includes(task?.phase) ? task.phase : "gather",
    resourceId: typeof task?.resourceId === "string" ? task.resourceId : "",
    stopAfterDelivery: Boolean(task?.stopAfterDelivery),
    ...(Number.isInteger(task?.deliveryX) && Number.isInteger(task?.deliveryY) ? {
      deliveryX: clampInteger(task.deliveryX, 0, map.width - 1, 0),
      deliveryY: clampInteger(task.deliveryY, 0, map.height - 1, 0),
    } : {}),
    ...(Number.isInteger(task?.returnX) && Number.isInteger(task?.returnY) ? {
      returnX: clampInteger(task.returnX, 0, map.width - 1, 0),
      returnY: clampInteger(task.returnY, 0, map.height - 1, 0),
    } : {}),
  };
}

function normalizeLayFoundationTaskSubject(task) {
  return {
    subjectKind: task?.subjectKind === "vehicle" ? "vehicle" : "building",
    subjectType: typeof task?.subjectType === "string" ? task.subjectType.trim() : "",
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

function recordStockpileHistoryForCurrentTurn() {
  if (currentTurn % stockpileHistoryIntervalTurns !== 0) return;
  if (stockpileHistory[stockpileHistory.length - 1]?.turn === currentTurn) return;

  stockpileHistory.push({ turn: currentTurn, ...serializeStockpileState(), happiness });
  refreshBookStockpileCharts();
}

function serializeSituationMessage(entry) {
  if (!entry || typeof entry.kind !== "string") {
    return null;
  }

  return createSituationMessageEntry(
    entry.kind,
    {
      unitType: entry.unitType,
      technologyId: entry.technologyId,
      buildingType: entry.buildingType,
      requiredBuildingType: entry.requiredBuildingType,
      current: entry.current,
      threshold: entry.threshold,
    },
    clampInteger(entry.turn, 1, 999999, currentTurn),
  );
}

function serializeSituationMessages(entries = pendingSituationMessages) {
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
      x: currentUnit.move.toX,
      y: currentUnit.move.toY,
      facing: currentUnit.move.direction || currentUnit.facing || "west",
      homeBuildingId: getUnitHomeBuildingId(currentUnit),
      mountedVehicleId: normalizeLinkedEntityId(currentUnit.mountedVehicleId),
      staminaMax: getUnitMaxStamina(currentUnit),
      stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
      cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
      task: didReachDestination ? null : serializeTask(currentUnit.task),
    };
  }

  return {
    id: currentUnit.id || "unit_01",
    unitType: getUnitTypeId(currentUnit),
    x: currentUnit.x,
    y: currentUnit.y,
    facing: currentUnit.facing || "west",
    homeBuildingId: getUnitHomeBuildingId(currentUnit),
    mountedVehicleId: normalizeLinkedEntityId(currentUnit.mountedVehicleId),
    staminaMax: getUnitMaxStamina(currentUnit),
    stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
    cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
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
    happiness,
    stockpileHistory: stockpileHistory.map((entry) => ({ ...entry })),
    populationEvents: populationEvents.map((entry) => ({ ...entry })),
    research: serializeResearchState(),
    pendingSituationMessages: serializeSituationMessages(),
    foodShortageTurns: Math.max(0, clampInteger(foodShortageTurns, 0, 999999, 0)),
    foodShortageActive,
    turn: currentTurn,
    fullPopulationSinceTurn,
    gameOutcome,
    autoAdvanceTurns,
  };
}

function isQuotaExceededError(error) {
  return Boolean(
    error &&
    (
      error.name === "QuotaExceededError"
      || error.code === 22
      || error.code === 1014
    ),
  );
}

function getSaveStorageErrorMessage(fileName, error) {
  return isQuotaExceededError(error)
    ? strings.messages.saveQuotaExceeded(fileName)
    : strings.messages.saveWriteFailed(fileName);
}

function reportSaveStorageWriteError(fileName, error, alertMode = "always") {
  const message = getSaveStorageErrorMessage(fileName, error);
  const signature = `${sanitizeFileName(fileName)}|${message}`;

  console.warn(`Could not save file ${fileName}.`, error);

  if (alertMode === "never") {
    return;
  }

  if (alertMode === "once" && lastSaveStorageErrorSignature === signature) {
    return;
  }

  lastSaveStorageErrorSignature = signature;
  window.alert(message);
}

async function writeSaveFile(fileName, state, { alertMode = "always" } = {}) {
  try {
    return await writeRawSaveFile(fileName, JSON.stringify(state), { alertMode });
  } catch (error) {
    reportSaveStorageWriteError(fileName, error, alertMode);
    return false;
  }
}

async function writeRawSaveFile(fileName, rawContents, { alertMode = "always" } = {}) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName || typeof rawContents !== "string") return false;

  try {
    if (!(await putIndexedDbSaveRecord(normalizedName, rawContents))) {
      throw new Error("Save database is unavailable.");
    }

    lastSaveStorageErrorSignature = null;
    return true;
  } catch (error) {
    reportSaveStorageWriteError(normalizedName, error, alertMode);
    return false;
  }
}

async function saveStateToFile(fileName, mode = interactionMode, { alertMode = "always" } = {}) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return false;

  const didSave = await writeSaveFile(normalizedName, serializeCurrentState(), { alertMode });

  if (!didSave) return false;

  writeCurrentFileName(mode, normalizedName);
  if (mode === interactionModes.edit) {
    setEditStateDirty(false);
  }
  updatePersistenceControls();
  return true;
}

async function readSaveFile(fileName) {
  try {
    const raw = await readRawSaveFile(fileName);

    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not load file ${fileName}.`, error);
    return null;
  }
}

async function readRawSaveFile(fileName) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return null;

  const indexedRecord = await getIndexedDbSaveRecord(normalizedName);

  if (typeof indexedRecord?.raw === "string") {
    return indexedRecord.raw;
  }

  return null;
}

function isCompatibleSaveState(state) {
  return Boolean(
    state && typeof state === "object" && !Array.isArray(state) &&
    state.version === saveVersion &&
    Number.isInteger(state.map?.width) && Number.isInteger(state.map?.height) &&
    Array.isArray(state.map?.cells?.[0]?.[0]) &&
    state.map.cells[0][0].length === Object.keys(compactSerializedCellFieldIndex).length &&
    Array.isArray(state.buildings) && Array.isArray(state.vehicles) && Array.isArray(state.units) &&
    state.stockpile && typeof state.stockpile === "object" &&
    Array.isArray(state.stockpileHistory) && Array.isArray(state.populationEvents) &&
    state.research && typeof state.research === "object" &&
    Array.isArray(state.pendingSituationMessages) &&
    Number.isInteger(state.foodShortageTurns) && typeof state.foodShortageActive === "boolean" &&
    Number.isInteger(state.turn) && typeof state.autoAdvanceTurns === "boolean"
  );
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
  const raw = await readRawSaveFile(fileName);

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

  if (!isCompatibleSaveState(parsed)) {
    window.alert(strings.messages.invalidSaveData);
    return false;
  }

  if (!(await writeRawSaveFile(normalizedName, JSON.stringify(parsed)))) {
    return false;
  }

  if (slotPanelState) {
    slotPanelState.value = normalizedName;
    saveSlotInput.value = normalizedName;
  }

  await renderSaveSlotList();
  updatePersistenceControls();
  return true;
}

const generatedMapDirections = Object.freeze([
  "north",
  "northEast",
  "east",
  "southEast",
  "south",
  "southWest",
  "west",
  "northWest",
]);

function getGeneratedCellKey(cell) {
  return cell ? `${cell.x},${cell.y}` : "";
}

function getGeneratedVillageCenterCell(
  cells,
  width = defaultMapConfig.width,
  height = defaultMapConfig.height,
) {
  return getCellInCells(cells, width, height, Math.floor(width / 2), Math.floor(height / 2));
}

function getGeneratedAdjacentCells(cells, width, height, cell) {
  if (!cell) {
    return [];
  }

  const neighbors = [];

  for (const direction of generatedMapDirections) {
    const neighbor = getNeighborCellInCells(cells, width, height, cell, direction);

    if (neighbor) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function countGeneratedCells(cells, predicate = () => true) {
  let count = 0;

  for (const row of cells) {
    for (const cell of row) {
      if (predicate(cell)) {
        count += 1;
      }
    }
  }

  return count;
}

function setGeneratedTerrain(cell, type) {
  if (!cell || !terrain[type]) {
    return false;
  }

  cell.type = type;
  cell.variant = chooseTerrainVariant(type);
  cell.season = defaultCellSeason;
  cell.visited = false;
  cell.visitsCount = 0;
  initializeCellResources(cell, { rollFood: false });
  return true;
}

function clearGeneratedCellFood(cell) {
  if (!cell) {
    return false;
  }

  cell.foodType = null;
  cell.foodCapacity = 0;
  cell.foodAmount = 0;
  syncFoodResourceCellIndexForCell(cell);
  return true;
}

function setGeneratedFoodResource(cell, foodType, { amount = null, capacity = null } = {}) {
  if (!cell || typeof foodType !== "string" || !foodType) {
    return false;
  }

  const foodDefinition = getFoodDefinition(foodType);

  if (!foodDefinition || foodDefinition.terrain !== cell.type) {
    return false;
  }

  const maxAmount = Math.max(
    0,
    clampNonNegativeNumber(capacity, 999999, getFoodTypeMaxAmount(foodType)),
  );

  cell.foodType = foodType;
  cell.foodCapacity = maxAmount;
  cell.foodAmount = amount === null
    ? maxAmount
    : clampNonNegativeNumber(amount, maxAmount, maxAmount);
  syncFoodResourceCellIndexForCell(cell);
  return true;
}

function isGeneratedVillageClearingCell(cell, centerCell, radius = 2) {
  return Boolean(cell)
    && Boolean(centerCell)
    && walkingDistance(cell.x, cell.y, centerCell.x, centerCell.y) <= radius;
}

function sampleGeneratedPatchSize(minSize, maxSize, singleCellChance = 0.05) {
  const normalizedMin = Math.max(1, Math.floor(minSize));
  const normalizedMax = Math.max(normalizedMin, Math.floor(maxSize));

  if (normalizedMin > 1 && Math.random() < Math.max(0, singleCellChance)) {
    return 1;
  }

  if (normalizedMin === normalizedMax) {
    return normalizedMin;
  }

  const span = normalizedMax - normalizedMin;
  const biasedRoll = Math.pow(Math.random(), 0.62);
  return normalizedMin + Math.round(biasedRoll * span);
}

function pickGeneratedRandomCell(cells, width, height, predicate) {
  const candidates = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[y]?.[x];

      if (predicate(cell)) {
        candidates.push(cell);
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)] || null;
}

function paintGeneratedPatches(
  cells,
  width,
  height,
  targetCount,
  {
    patchSize = () => 1,
    canFill = () => false,
    fillCell = () => false,
    afterPatch = null,
  } = {},
) {
  const normalizedTarget = Math.max(0, Math.floor(targetCount));
  if (normalizedTarget <= 0) {
    return 0;
  }

  let filledCount = 0;
  let attempts = 0;
  const maxAttempts = Math.max(64, normalizedTarget * 6);

  while (filledCount < normalizedTarget && attempts < maxAttempts) {
    attempts += 1;

    const seed = pickGeneratedRandomCell(cells, width, height, canFill);
    if (!seed) {
      break;
    }

    const desiredPatchSize = Math.max(1, Math.floor(patchSize()));
    const frontier = [seed];
    const frontierKeys = new Set([getGeneratedCellKey(seed)]);
    const patchCells = [];

    while (frontier.length > 0 && patchCells.length < desiredPatchSize && filledCount < normalizedTarget) {
      const frontierIndex = Math.floor(Math.random() * frontier.length);
      const cell = frontier.splice(frontierIndex, 1)[0];

      if (!canFill(cell)) {
        continue;
      }

      if (fillCell(cell) === false) {
        continue;
      }

      patchCells.push(cell);
      filledCount += 1;

      const neighbors = shuffleArrayInPlace(
        getGeneratedAdjacentCells(cells, width, height, cell)
          .filter((neighbor) => {
            if (!neighbor || !canFill(neighbor)) {
              return false;
            }

            const key = getGeneratedCellKey(neighbor);
            if (frontierKeys.has(key)) {
              return false;
            }

            frontierKeys.add(key);
            return true;
          }),
      );

      frontier.push(...neighbors);
    }

    if (typeof afterPatch === "function" && patchCells.length > 0) {
      afterPatch(patchCells);
    }
  }

  return filledCount;
}

function paintGeneratedTerrainPatches(
  cells,
  width,
  height,
  terrainType,
  targetCount,
  options = {},
) {
  return paintGeneratedPatches(cells, width, height, targetCount, {
    ...options,
    fillCell: (cell) => {
      if (!cell || cell.type === terrainType) {
        return false;
      }

      return setGeneratedTerrain(cell, terrainType);
    },
  });
}

function maybeCarveGeneratedLakeIslands(cells, width, height, patchCells) {
  if (!Array.isArray(patchCells) || patchCells.length < 14 || Math.random() >= 0.42) {
    return;
  }

  const candidates = shuffleArrayInPlace(
    patchCells.filter((cell) =>
      getGeneratedAdjacentCells(cells, width, height, cell)
        .filter((neighbor) => neighbor.type === "water")
        .length >= 6
    ),
  );

  const islandCount = Math.min(
    candidates.length,
    Math.max(1, Math.floor(patchCells.length / 24)),
  );

  for (const candidate of candidates.slice(0, islandCount)) {
    setGeneratedTerrain(candidate, "grass");
  }
}

function carveGeneratedVillageClearing(cells, width, height, centerCell, protectedWaterKeys = null) {
  if (!centerCell) {
    return;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[y]?.[x];

      if (!isGeneratedVillageClearingCell(cell, centerCell, 2)) {
        continue;
      }

      if (protectedWaterKeys?.has(getGeneratedCellKey(cell))) {
        continue;
      }

      setGeneratedTerrain(cell, "grass");
      clearGeneratedCellFood(cell);
    }
  }
}

function carveGeneratedMountainBorder(cells, width, height, centerCell) {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isBorderCell = x === 0 || x === width - 1 || y === 0 || y === height - 1;

      if (!isBorderCell) {
        continue;
      }

      const cell = cells[y]?.[x];

      if (!cell || cell.type === "water" || isGeneratedVillageClearingCell(cell, centerCell, 2)) {
        continue;
      }

      setGeneratedTerrain(cell, "mountain");
      clearGeneratedCellFood(cell);
    }
  }
}

function getGeneratedCellCenterPoint(cell) {
  if (!cell) {
    return null;
  }

  return {
    x: cell.x + (cell.y % 2 === 1 ? 0.5 : 0),
    y: cell.y * 0.5,
  };
}

function getGeneratedRiverTargetWidth(progress) {
  const normalizedProgress = clampNumber(progress, 0, 1, 0);

  if (normalizedProgress <= 0.08) {
    return 1;
  }

  if (normalizedProgress >= 0.32) {
    return 2;
  }

  const t = (normalizedProgress - 0.08) / 0.24;
  const eased = t * t * (3 - 2 * t);
  return 1 + eased;
}

function carveGeneratedRiver(cells, width, height, normalizedSettings, centerCell) {
  if (!centerCell) {
    return [];
  }

  const sideBias = Math.random() < 0.5 ? -1 : 1;
  const horizontalOffset = Math.max(6, Math.floor(width * (0.16 + Math.random() * 0.08)));
  const laneX = clampInteger(
    centerCell.x + sideBias * horizontalOffset,
    2,
    width - 3,
    centerCell.x + sideBias * Math.max(4, Math.floor(width * 0.18)),
  );
  const startRow = 1;
  const endRow = Math.max(startRow + 2, height - 2);
  const wideningSideDirection = sideBias < 0 ? "east" : "west";
  let current = getCellInCells(cells, width, height, laneX, startRow)
    || getCellInCells(cells, width, height, laneX - 1, startRow)
    || getCellInCells(cells, width, height, laneX + 1, startRow);
  const spineCells = [];
  const spineKeys = new Set();
  const segmentDirections = [];
  let targetX = laneX + (startRow % 2 === 1 ? 0.5 : 0);
  const minTargetX = 1.5;
  const maxTargetX = Math.max(minTargetX, width - 1.5);
  const maxSteps = Math.max(height * 3, width * 4);
  let preferredDirection = Math.random() < 0.5 ? "southEast" : "southWest";
  let preferredRunRemaining = 2 + Math.floor(Math.random() * 3);
  let bendTargetX = clampNumber(
    targetX + (Math.random() < 0.5 ? -1 : 1) * (1.4 + Math.random() * 2.6),
    minTargetX,
    maxTargetX,
    laneX,
  );
  let bendRunRemaining = 3 + Math.floor(Math.random() * 4);

  for (let step = 0; current && step < maxSteps; step += 1) {
    const currentKey = getGeneratedCellKey(current);

    if (!spineKeys.has(currentKey)) {
      spineKeys.add(currentKey);
      spineCells.push(current);
    }

    if (current.y >= endRow) {
      break;
    }

    const currentCenterX = getGeneratedCellCenterPoint(current)?.x ?? current.x;

    if (bendRunRemaining <= 0 || Math.abs(bendTargetX - currentCenterX) < 0.45) {
      bendTargetX = clampNumber(
        currentCenterX + (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 3.8),
        minTargetX,
        maxTargetX,
        laneX,
      );
      bendRunRemaining = 3 + Math.floor(Math.random() * 5);
    }

    const bendPull = clampNumber(bendTargetX - currentCenterX, -2.4, 2.4, 0);
    targetX = clampNumber(
      currentCenterX + bendPull * 0.58 + (Math.random() - 0.5) * 0.22,
      minTargetX,
      maxTargetX,
      laneX,
    );
    bendRunRemaining -= 1;

    const candidates = ["southEast", "southWest"]
      .map((direction) => ({
        direction,
        cell: getNeighborCellInCells(cells, width, height, current, direction),
      }))
      .filter(({ cell }) => Boolean(cell) && cell.y <= endRow && cell.x > 0 && cell.x < width - 1);

    if (candidates.length === 0) {
      break;
    }

    const filteredCandidates = candidates.filter(({ cell }) => !isGeneratedVillageClearingCell(cell, centerCell, 2));
    if (filteredCandidates.length === 0) {
      break;
    }

    const rankedCandidates = filteredCandidates
      .map(({ cell }) => {
        const point = getGeneratedCellCenterPoint(cell);
        const xPenalty = Math.abs((point?.x ?? cell.x) - targetX);
        const revisitPenalty = spineKeys.has(getGeneratedCellKey(cell)) ? 8 : 0;
        const edgePenalty = cell.x <= 1 || cell.x >= width - 2 ? 1.25 : 0;
        const clearingPenalty = isGeneratedVillageClearingCell(cell, centerCell, 4) ? 5 : 0;

        return {
          cell,
          score: xPenalty + revisitPenalty + edgePenalty + clearingPenalty + Math.random() * 0.6,
        };
      })
      .sort((left, right) => left.score - right.score);

    const idealDirection = targetX >= currentCenterX
      ? "southEast"
      : "southWest";

    if (preferredRunRemaining <= 0) {
      preferredDirection = Math.random() < 0.78
        ? idealDirection
        : (idealDirection === "southEast" ? "southWest" : "southEast");
      preferredRunRemaining = 2 + Math.floor(Math.random() * 3);
    }

    const scoredCandidates = rankedCandidates
      .map(({ cell, score }) => {
        const direction = cell.x >= current.x ? "southEast" : "southWest";
        const runPenalty = direction === preferredDirection ? 0 : 1.1;
        const targetPenalty = direction === idealDirection ? 0 : 0.25;

        return {
          cell,
          direction,
          score: score + runPenalty + targetPenalty,
        };
      })
      .sort((left, right) => left.score - right.score);

    const nextCandidate = scoredCandidates[0] || null;
    const nextCell = nextCandidate?.cell || null;

    if (!nextCell) {
      break;
    }

    const nextDirection = nextCandidate?.direction || (nextCell.x >= current.x ? "southEast" : "southWest");
    if (nextDirection === preferredDirection) {
      preferredRunRemaining -= 1;
    } else {
      preferredDirection = nextDirection;
      preferredRunRemaining = 2 + Math.floor(Math.random() * 2);
    }

    segmentDirections.push(nextDirection);
    current = nextCell;
  }

  const carvedCells = [];
  const carvedKeys = new Set();
  const carveRiverCell = (cell) => {
    if (!cell) {
      return false;
    }

    const key = getGeneratedCellKey(cell);
    if (carvedKeys.has(key)) {
      return false;
    }

    carvedKeys.add(key);
    setGeneratedTerrain(cell, "water");
    carvedCells.push(cell);
    return true;
  };

  for (const cell of spineCells) {
    carveRiverCell(cell);
  }

  if (spineCells.length > 0) {
    const firstDirection = segmentDirections[0] || "southEast";
    const lastDirection = segmentDirections[segmentDirections.length - 1] || firstDirection;
    const firstCell = spineCells[0];
    const lastCell = spineCells[spineCells.length - 1];
    const topDirection = firstDirection === "southEast" ? "northWest" : "northEast";

    carveRiverCell(getNeighborCellInCells(cells, width, height, firstCell, topDirection));
    carveRiverCell(getNeighborCellInCells(cells, width, height, lastCell, lastDirection));
  }

  const totalSegments = Math.max(1, segmentDirections.length - 1);
  let extraLaneCarry = 0;

  for (let segmentIndex = 0; segmentIndex < segmentDirections.length; segmentIndex += 1) {
    const baseCell = spineCells[segmentIndex];
    const segmentDirection = segmentDirections[segmentIndex];
    const previousDirection = segmentDirections[segmentIndex - 1] || null;
    const nextDirection = segmentDirections[segmentIndex + 1] || segmentDirection;
    const isTurnSegment = segmentDirection !== previousDirection || segmentDirection !== nextDirection;
    const progress = segmentIndex / totalSegments;
    const targetWidth = getGeneratedRiverTargetWidth(progress);
    const desiredExtraLane = Math.max(0, targetWidth - 1);
    extraLaneCarry += desiredExtraLane;

    const shouldWiden = desiredExtraLane >= 0.999
      || extraLaneCarry >= 1
      || (isTurnSegment && desiredExtraLane >= 0.6);

    if (!shouldWiden) {
      continue;
    }

    extraLaneCarry = Math.max(0, extraLaneCarry - 1);

    const widthCell = getNeighborCellInCells(cells, width, height, baseCell, wideningSideDirection);

    if (!widthCell || isGeneratedVillageClearingCell(widthCell, centerCell, 3)) {
      continue;
    }

    carveRiverCell(widthCell);
  }

  if (spineCells.length >= 2) {
    const lastCell = spineCells[spineCells.length - 1];
    const lastWidthCell = getNeighborCellInCells(cells, width, height, lastCell, wideningSideDirection);

    if (lastWidthCell && !isGeneratedVillageClearingCell(lastWidthCell, centerCell, 3)) {
      carveRiverCell(lastWidthCell);
    }
  }

  return carvedCells;
}

function planGeneratedStream(cells, width, height, source, centerCell, directions, length) {
  const plannedCells = [];
  const plannedKeys = new Set();
  let current = source;
  let preferredDirection = directions[Math.floor(Math.random() * directions.length)];
  let preferredRunRemaining = 2 + Math.floor(Math.random() * 3);

  for (let segment = 0; segment < length; segment += 1) {
    if (preferredRunRemaining <= 0) {
      preferredDirection = directions.find((direction) => direction !== preferredDirection) || preferredDirection;
      preferredRunRemaining = 2 + Math.floor(Math.random() * 3);
    }

    const directionCandidates = Math.random() < 0.82
      ? [preferredDirection, ...directions.filter((direction) => direction !== preferredDirection)]
      : shuffleArrayInPlace([...directions]);
    let next = null;
    let nextDirection = "";

    for (const direction of directionCandidates) {
      const candidate = getNeighborCellInCells(cells, width, height, current, direction);

      if (
        !candidate
        || candidate.x <= 0
        || candidate.x >= width - 1
        || candidate.y <= 0
        || candidate.y >= height - 1
        || isGeneratedVillageClearingCell(candidate, centerCell, 4)
        || candidate.type === "water"
        || plannedKeys.has(getGeneratedCellKey(candidate))
      ) {
        continue;
      }

      next = candidate;
      nextDirection = direction;
      break;
    }

    if (!next) {
      break;
    }

    plannedCells.push(next);
    plannedKeys.add(getGeneratedCellKey(next));
    current = next;

    if (nextDirection === preferredDirection) {
      preferredRunRemaining -= 1;
    } else {
      preferredDirection = nextDirection;
      preferredRunRemaining = 1 + Math.floor(Math.random() * 2);
    }
  }

  return plannedCells;
}

function carveGeneratedStreams(
  cells,
  width,
  height,
  normalizedSettings,
  centerCell,
  riverCells = [],
  streamCountTarget = 2,
) {
  const desiredStreamCount = clampInteger(streamCountTarget, 1, 3, 2);
  if (desiredStreamCount <= 0 || !Array.isArray(riverCells) || riverCells.length === 0) {
    return [];
  }

  const sourceCandidates = shuffleArrayInPlace(
    riverCells.filter((cell) =>
      cell
      && cell.x > 1
      && cell.x < width - 2
      && cell.y >= 2
      && cell.y <= height - 3
      && !isGeneratedVillageClearingCell(cell, centerCell, 4)
    ),
  );
  const carvedCells = [];
  let createdStreams = 0;

  for (const source of sourceCandidates) {
    if (createdStreams >= desiredStreamCount) {
      break;
    }

    const streamLength = 5 + Math.floor(Math.random() * 4) + Math.floor(normalizedSettings.water / 50);
    const plannedPaths = [
      planGeneratedStream(cells, width, height, source, centerCell, ["northWest", "southWest"], streamLength),
      planGeneratedStream(cells, width, height, source, centerCell, ["northEast", "southEast"], streamLength),
    ];
    const path = plannedPaths.sort((left, right) => right.length - left.length)[0];

    if (path.length < 4) {
      continue;
    }

    for (const cell of path) {
      setGeneratedTerrain(cell, "water");
      carvedCells.push(cell);
    }

    createdStreams += 1;
  }

  return carvedCells;
}

function applyGeneratedWaterResources(cells, normalizedSettings) {
  const waterCells = [];

  for (const row of cells) {
    for (const cell of row) {
      if (cell.type === "water") {
        waterCells.push(cell);
      }
    }
  }

  const fishableTarget = Math.round(
    waterCells.length * (0.004 + ((normalizedSettings.food / 100) ** 2.8) * 0.282),
  );
  const fishableCells = new Set(
    shuffleArrayInPlace([...waterCells])
      .slice(0, fishableTarget)
      .map((cell) => getGeneratedCellKey(cell)),
  );

  for (const cell of waterCells) {
    cell.variant = fishableCells.has(getGeneratedCellKey(cell)) ? "water_01" : "water_02";
    syncCellResourcesWithVariant(cell, { seedOnWater01: true });
  }
}

function applyGeneratedFoodPatches(cells, width, height, normalizedSettings, centerCell) {
  const grassCellCount = countGeneratedCells(
    cells,
    (cell) => cell.type === "grass" && !isGeneratedVillageClearingCell(cell, centerCell, 1),
  );
  const forestCellCount = countGeneratedCells(cells, (cell) => cell.type === "forest");
  const grainTarget = Math.round(
    grassCellCount * ((normalizedSettings.food / 100) ** 1.82 * 0.185),
  );
  const forestFoodTarget = Math.round(
    forestCellCount * (0.04 + ((normalizedSettings.food / 100) ** 1.05) * 0.18),
  );
  const berriesTarget = Math.round(forestFoodTarget * 0.58);
  const mushroomsTarget = Math.max(0, forestFoodTarget - berriesTarget);

  paintGeneratedPatches(cells, width, height, grainTarget, {
    patchSize: () => sampleGeneratedPatchSize(4, 22 + Math.round(normalizedSettings.food * 0.14), 0.03),
    canFill: (cell) =>
      Boolean(cell)
      && cell.type === "grass"
      && !cell.foodType
      && !isGeneratedVillageClearingCell(cell, centerCell, 1),
    fillCell: (cell) => setGeneratedFoodResource(cell, "grain"),
  });

  const forestFoodCells = shuffleArrayInPlace(
    cells
      .flatMap((row) => row)
      .filter((cell) => Boolean(cell) && cell.type === "forest" && !cell.foodType),
  );
  let forestFoodOffset = 0;

  for (const [foodType, targetCount] of [
    ["berries", berriesTarget],
    ["mushrooms", mushroomsTarget],
  ]) {
    const nextCells = forestFoodCells.slice(forestFoodOffset, forestFoodOffset + targetCount);

    for (const cell of nextCells) {
      setGeneratedFoodResource(cell, foodType);
    }

    forestFoodOffset += nextCells.length;
  }
}

function buildGeneratedMapCells(
  width = defaultMapConfig.width,
  height = defaultMapConfig.height,
  settings = mapGenerationSettings,
) {
  const normalizedSettings = normalizeMapGenerationSettings(settings);
  const cells = buildEmptyMapCells(width, height);
  const centerCell = getCellInCells(cells, width, height, Math.floor(width / 2), Math.floor(height / 2));
  const riverCells = carveGeneratedRiver(cells, width, height, normalizedSettings, centerCell);
  const riverCellKeys = new Set(riverCells.map(getGeneratedCellKey));
  const streamCountTarget = clampInteger(1 + Math.floor(normalizedSettings.water / 34), 1, 3, 2);
  carveGeneratedStreams(cells, width, height, normalizedSettings, centerCell, riverCells, streamCountTarget);
  carveGeneratedVillageClearing(cells, width, height, centerCell, riverCellKeys);
  carveGeneratedMountainBorder(cells, width, height, centerCell);

  const totalCellCount = width * height;
  const desiredWaterCount = Math.max(
    countGeneratedCells(cells, (cell) => cell.type === "water"),
    Math.round(totalCellCount * (0.035 + ((normalizedSettings.water / 100) ** 1.18) * 0.285)),
  );
  const additionalLakeTarget = Math.max(
    0,
    desiredWaterCount - countGeneratedCells(cells, (cell) => cell.type === "water"),
  );

  paintGeneratedTerrainPatches(cells, width, height, "water", additionalLakeTarget, {
    patchSize: () => sampleGeneratedPatchSize(14, 52 + Math.round(normalizedSettings.water * 0.4), 0.04),
    canFill: (cell) => Boolean(cell) && cell.type !== "water" && !isGeneratedVillageClearingCell(cell, centerCell, 3),
    afterPatch: (patchCells) => maybeCarveGeneratedLakeIslands(cells, width, height, patchCells),
  });

  const nonWaterCellCount = countGeneratedCells(cells, (cell) => cell.type !== "water");
  const mountainTarget = Math.round(
    nonWaterCellCount * (0.02 + ((normalizedSettings.mountain / 100) ** 1.2) * 0.18),
  );
  const forestTarget = Math.round(
    nonWaterCellCount * (0.08 + ((normalizedSettings.forest / 100) ** 1.1) * 0.28),
  );

  paintGeneratedTerrainPatches(cells, width, height, "mountain", mountainTarget, {
    patchSize: () => sampleGeneratedPatchSize(3, 16 + Math.round(normalizedSettings.mountain * 0.26), 0.08),
    canFill: (cell) => Boolean(cell) && cell.type === "grass" && !isGeneratedVillageClearingCell(cell, centerCell, 3),
  });
  paintGeneratedTerrainPatches(cells, width, height, "forest", forestTarget, {
    patchSize: () => sampleGeneratedPatchSize(4, 24 + Math.round(normalizedSettings.forest * 0.34), 0.07),
    canFill: (cell) => Boolean(cell) && cell.type === "grass" && !isGeneratedVillageClearingCell(cell, centerCell, 2),
  });
  carveGeneratedVillageClearing(cells, width, height, centerCell, riverCellKeys);
  applyGeneratedWaterResources(cells, normalizedSettings);
  applyGeneratedFoodPatches(cells, width, height, normalizedSettings, centerCell);
  clearGeneratedCellFood(centerCell);

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

function createDefaultUnitState(cells, width, height, unitTypeOrOptions = getDefaultUnitTypeId()) {
  const options = unitTypeOrOptions && typeof unitTypeOrOptions === "object" && !Array.isArray(unitTypeOrOptions)
    ? unitTypeOrOptions
    : { unitTypeId: unitTypeOrOptions };
  const unitType = normalizeUnitTypeId(options.unitTypeId);
  const originX = clampInteger(
    options.originCell?.x ?? options.originX,
    0,
    width - 1,
    Math.floor(width / 2),
  );
  const originY = clampInteger(
    options.originCell?.y ?? options.originY,
    0,
    height - 1,
    Math.floor(height / 2),
  );
  const blockedKeys = options.blockedKeys instanceof Set ? options.blockedKeys : new Set();
  let spawn = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cell = cells[y]?.[x];

      if (!cell || cell.type !== "grass" || blockedKeys.has(`${x},${y}`)) {
        continue;
      }

      const cellDistance = walkingDistance(x, y, originX, originY);

      if (cellDistance >= bestDistance) {
        continue;
      }

      spawn = cell;
      bestDistance = cellDistance;
    }
  }

  if (!spawn) {
    spawn = findNearestPassableCellInCells(
      cells,
      width,
      height,
      originX,
      originY,
    );
  }

  return spawn
      ? {
          id: "unit_01",
          unitType,
          x: spawn.x,
          y: spawn.y,
          facing: "west",
          homeBuildingId: null,
          mountedVehicleId: null,
          staminaMax: getDefaultUnitStamina(unitType),
          stamina: getDefaultUnitStamina(unitType),
          cargo: null,
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

function getVillageVicinityCells() {
  if (villageVicinityCells) {
    return villageVicinityCells;
  }

  const cells = new Map();
  const maxDistance = clampInteger(rules.buildingPlacement?.villageMaxDistance, 0, 9999, 1);

  for (const building of buildings) {
    if (building.state !== "complete" || !getConstructibleRulesForKind("building", building.type)?.villageBuilding) {
      continue;
    }

    for (const occupiedCell of getConstructibleOccupiedCellsForKind("building", building)) {
      for (let y = Math.max(0, occupiedCell.y - 2 * maxDistance); y <= Math.min(map.height - 1, occupiedCell.y + 2 * maxDistance); y += 1) {
        for (let x = Math.max(0, occupiedCell.x - 2 * maxDistance); x <= Math.min(map.width - 1, occupiedCell.x + 2 * maxDistance); x += 1) {
          if (walkingDistance(x, y, occupiedCell.x, occupiedCell.y) > maxDistance) {
            continue;
          }

          const cell = getCell(x, y);
          if (cell) {
            cells.set(createCellKey(x, y), cell);
          }
        }
      }
    }
  }

  villageVicinityCells = cells;
  return cells;
}

function hasNearbyCompletedVillageBuilding(originCell, type) {
  return getConstructiblePlacementCellsForKind("building", originCell, type).some((cell) =>
    getVillageVicinityCells().has(createCellKey(cell.x, cell.y)),
  );
}

function canPlaceNewBuildingConstructionOnCell(originCell, type, currentUnit = null) {
  if (isPlayMode() && type === "house" && isPopulationAtCapacity()) {
    return false;
  }

  if (
    isPlayMode() &&
    getConstructibleRulesForKind("building", type)?.villageBuilding &&
    !hasNearbyCompletedVillageBuilding(originCell, type)
  ) {
    return false;
  }

  return canPlaceNewConstructibleConstructionOnCellForKind("building", originCell, type, currentUnit);
}

function canPlaceNewVehicleConstructionOnCell(originCell, type, currentUnit = null) {
  return canPlaceNewConstructibleConstructionOnCellForKind("vehicle", originCell, type, currentUnit);
}

function createBuildingConstructionAtCell(cell, type = "house", { spendResources = true } = {}) {
  return createConstructibleConstructionAtCellForKind("building", cell, type, { spendResources });
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

  let changed = markCellVisited(cell, { invalidate: false });
  let didTouchPathIndex = false;

  if (cell.type === "grass" && !doesSeasonSuppressPathEffects(cell)) {
    const nextVisitsCount = Math.min(
      getCellPathWellKnownVisitsThreshold(cell),
      getCellVisitsCount(cell) + 1,
    );

    if (nextVisitsCount !== getCellVisitsCount(cell)) {
      cell.visitsCount = nextVisitsCount;
      changed = true;
      didTouchPathIndex = syncPathRenderableCellIndexForCell(cell) || didTouchPathIndex;
    }
  }

  if (!didTouchPathIndex && changed && cell.type === "grass") {
    syncPathRenderableCellIndexForCell(cell);
  }

  if ((changed || didTouchPathIndex) && invalidate) {
    invalidateStaticLayer();
  }

  return changed || didTouchPathIndex;
}

function createDefaultBuildingsState(cells, width, height) {
  const centerCell = getGeneratedVillageCenterCell(cells, width, height);

  if (!centerCell) return [];

  if (centerCell.type !== "grass" || hasFoodResource(centerCell)) {
    setGeneratedTerrain(centerCell, "grass");
    clearGeneratedCellFood(centerCell);
  }

  return [
    {
      id: "building_01",
      type: "house",
      subtype: chooseConstructibleSubtypeForKind("building", "house") || "house_01",
      x: centerCell.x,
      y: centerCell.y,
      width: getDefaultConstructibleDimensionForKind("building", "width"),
      height: getDefaultConstructibleDimensionForKind("building", "height"),
      state: "complete",
      walkable: isConstructibleTypeWalkable("building", "house"),
      completeness: 1,
      constructionCost: getConstructibleConstructionCost("building", "house"),
    },
  ];
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

function createGeneratedState(
  mode,
  buildCells = buildGeneratedMapCells,
  generationSettings = mapGenerationSettings,
  generationSize = defaultMapGenerationSize,
) {
  const normalizedSize = normalizeMapGenerationSize(generationSize);
  const width = normalizedSize.width;
  const height = normalizedSize.height;
  const cells = buildCells(width, height, generationSettings);
  const centerCell = getGeneratedVillageCenterCell(cells, width, height);
  const defaultBuildings = createDefaultBuildingsState(cells, width, height);
  const blockedKeys = new Set(
    defaultBuildings.flatMap((building) =>
      getConstructibleOccupiedCellsForKind("building", building)
        .map(({ x, y }) => `${x},${y}`)
    ),
  );
  const defaultUnit = createDefaultUnitState(cells, width, height, {
    originCell: centerCell,
    blockedKeys,
  });
  const units = defaultUnit ? [defaultUnit] : [];

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
    happiness: normalizeHappiness(undefined, rules.happiness),
    stockpileHistory: [],
    populationEvents: [],
    research: createDefaultResearchState(),
    pendingSituationMessages: mode === interactionModes.play
      ? [createSituationMessageEntry("intro", {}, 1)]
      : [],
    foodShortageTurns: 0,
    foodShortageActive: false,
    turn: 1,
    fullPopulationSinceTurn: null,
    gameOutcome: null,
    autoAdvanceTurns: true,
  };
}

function createDefaultState(mode) {
  return createGeneratedState(mode, buildGeneratedMapCells, defaultMapGenerationSettings, defaultMapGenerationSize);
}

function applySeasonStateToCell(cell) {
  if (!cell || !cell.foodType || !isLandCell(cell) || !isWinter2SeasonCell(cell)) {
    return false;
  }

  const nextFoodAmount = clampNumber(1, 0, getCellFoodMaxAmount(cell), 0);

  if (nextFoodAmount === cell.foodAmount) {
    return false;
  }

  cell.foodAmount = nextFoodAmount;
  return true;
}

function shuffleArrayInPlace(items) {
  if (!Array.isArray(items)) {
    return items;
  }

  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = current;
  }

  return items;
}

function createSeasonConversionPendingCells(targetSeason) {
  const pendingCells = [];

  for (const row of map.cells) {
    for (const cell of row) {
      if (getCellSeason(cell) !== targetSeason) {
        pendingCells.push(cell);
      }
    }
  }

  return pendingCells;
}

function createSeasonConversionState(transition, { includeCurrentTurn = true } = {}) {
  if (!transition) {
    return null;
  }

  const pendingCells = shuffleArrayInPlace(createSeasonConversionPendingCells(transition.targetSeason));
  const remainingTurns = Math.max(
    0,
    transition.endTurn - currentTurn + (includeCurrentTurn ? 1 : 0),
  );

  return {
    id: transition.id,
    targetSeason: transition.targetSeason,
    endTurn: transition.endTurn,
    tilesPerTurn:
      pendingCells.length > 0 && remainingTurns > 0
        ? Math.max(1, Math.ceil(pendingCells.length / remainingTurns))
        : 0,
    pendingCells,
  };
}

function syncSeasonConversionState({ includeCurrentTurn = true, rebuild = false } = {}) {
  const activeTransition = getActiveSeasonTransitionForTurn(currentTurn);

  if (!activeTransition) {
    seasonConversionState = null;
    return null;
  }

  if (
    rebuild ||
    !seasonConversionState ||
    seasonConversionState.id !== activeTransition.id ||
    seasonConversionState.targetSeason !== activeTransition.targetSeason ||
    seasonConversionState.endTurn !== activeTransition.endTurn
  ) {
    seasonConversionState = createSeasonConversionState(activeTransition, { includeCurrentTurn });
  }

  return seasonConversionState;
}

function shouldRemoveVehicleAfterSeasonConversion(vehicle, cell, context = getRuleContext()) {
  if (!vehicle || !cell || cell.type !== "water") {
    return false;
  }

  if (isWinter2SeasonCell(cell)) {
    return false;
  }

  return !canVehicleTraverseCell(vehicle, cell, context);
}

function relocateUnitAfterSeasonConversion(currentUnit) {
  if (!currentUnit) {
    return false;
  }

  const currentCell = getCell(currentUnit.x, currentUnit.y);

  if (canUnitEnter(currentCell, currentUnit)) {
    return false;
  }

  const fallbackCell = findNearestPassableCell(currentUnit.x, currentUnit.y, currentUnit);

  if (!fallbackCell) {
    return false;
  }

  const previousX = currentUnit.x;
  const previousY = currentUnit.y;
  currentUnit.x = fallbackCell.x;
  currentUnit.y = fallbackCell.y;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  currentUnit.move = null;
  updateUnitOccupancyEntry(currentUnit, previousX, previousY);
  markCellVisitedByUnit(fallbackCell, { invalidate: false });

  const mountedVehicle = getMountedVehicle(currentUnit);

  if (mountedVehicle) {
    mountedVehicle.x = currentUnit.x;
    mountedVehicle.y = currentUnit.y;
  }

  return true;
}

function applySeasonConversionFallout(context = getRuleContext()) {
  let didChange = false;
  const removedVehicleIds = new Set();

  for (const vehicle of vehicles) {
    const cell = getCell(vehicle.x, vehicle.y);

    if (shouldRemoveVehicleAfterSeasonConversion(vehicle, cell, context)) {
      removedVehicleIds.add(vehicle.id);
    }
  }

  if (removedVehicleIds.size > 0) {
    vehicles = vehicles.filter((vehicle) => !removedVehicleIds.has(vehicle.id));

    for (const currentUnit of getUnits()) {
      if (!removedVehicleIds.has(currentUnit?.mountedVehicleId)) {
        continue;
      }

      currentUnit.mountedVehicleId = null;
      currentUnit.turnRoute = null;
      currentUnit.lastStepFromX = null;
      currentUnit.lastStepFromY = null;
      currentUnit.move = null;
    }

    didChange = true;
  }

  for (const currentUnit of getUnits()) {
    if (relocateUnitAfterSeasonConversion(currentUnit)) {
      didChange = true;
    }
  }

  if (didChange) {
    reconcileMountedVehicleStateLinks(vehicles, units);
    syncActiveUnit();
  }

  return didChange;
}

function applySeasonConversionForCurrentTurn() {
  const state = syncSeasonConversionState({ includeCurrentTurn: true });

  if (!state || state.tilesPerTurn <= 0 || state.pendingCells.length === 0) {
    return false;
  }

  let convertedCount = 0;

  while (convertedCount < state.tilesPerTurn && state.pendingCells.length > 0) {
    const cell = state.pendingCells.shift();

    if (!cell || getCellSeason(cell) === state.targetSeason) {
      continue;
    }

    cell.season = state.targetSeason;
    applySeasonStateToCell(cell);
    convertedCount += 1;
  }

  if (convertedCount <= 0) {
    return false;
  }

  applySeasonConversionFallout();
  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
  return true;
}

function normalizeSerializedCellRecord(sourceCell) {
  if (
    !Array.isArray(sourceCell) ||
    sourceCell.length !== Object.keys(compactSerializedCellFieldIndex).length ||
    !cellSeasons.includes(sourceCell[compactSerializedCellFieldIndex.season]) ||
    ![0, 1].includes(sourceCell[compactSerializedCellFieldIndex.visited]) ||
    typeof sourceCell[compactSerializedCellFieldIndex.foodType] !== "string"
  ) {
    return null;
  }

  return {
    type: sourceCell[compactSerializedCellFieldIndex.type],
    variant: sourceCell[compactSerializedCellFieldIndex.variant],
    season: sourceCell[compactSerializedCellFieldIndex.season],
    visited: sourceCell[compactSerializedCellFieldIndex.visited] === 1,
    visitsCount: sourceCell[compactSerializedCellFieldIndex.visitsCount],
    materialAmount: sourceCell[compactSerializedCellFieldIndex.materialAmount],
    foodType: sourceCell[compactSerializedCellFieldIndex.foodType] || null,
    foodCapacity: sourceCell[compactSerializedCellFieldIndex.foodCapacity],
    foodAmount: sourceCell[compactSerializedCellFieldIndex.foodAmount],
  };
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
      const sourceCell = normalizeSerializedCellRecord(sourceRow[x]);

      if (!sourceCell || !terrain[sourceCell.type]) {
        throw new Error("Missing map cell.");
      }

      const cell = generatedCells[y][x];
      cell.type = sourceCell.type;
      cell.season = normalizeCellSeason(sourceCell.season);
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
      if (!Number.isFinite(sourceCell.foodCapacity)) {
        throw new Error("Missing food capacity in map cell.");
      }

      const variants = getTerrainVariants(cell.type);
      const foodCapacity =
        typeof sourceCell.foodType === "string" && sourceCell.foodType
          ? clampNonNegativeNumber(sourceCell.foodCapacity, 999999, 0)
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
      applySeasonStateToCell(cell);

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
  const startCell = getCellInCells(cells, width, height, startX, startY);

  if (!startCell) {
    return null;
  }

  return findNearestMatchingCellByAdjacency(startCell, {
    getNeighbors: (cell) => getGeneratedAdjacentCells(cells, width, height, cell),
    isMatch: (cell) => getUnitCellPassabilityState(cell).terrainOrStructurePassable,
    getKey: getGeneratedCellKey,
    score: (cell) => distance(cell.x, cell.y, startX, startY),
  });
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

  const phase = ["deliver", "return"].includes(task?.phase) ? task.phase : "gather";
  if (phase === "gather" && (!areCellsAdjacent(currentX, currentY, toX, toY) || !hasGatherableFoodResource(destinationCell))) {
    return null;
  }

  return serializeGatherUnitTask({ ...task, toX, toY, phase, resourceId: task?.resourceId || destinationCell.foodType }, "gatherFood");
}

function normalizeGatherMaterialsUnitTask(task, { currentX, currentY } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  const phase = ["deliver", "return"].includes(task?.phase) ? task.phase : "gather";
  if (phase === "gather" && (!areCellsAdjacent(currentX, currentY, toX, toY) || !hasMaterialResource(destinationCell))) {
    return null;
  }

  return serializeGatherUnitTask({ ...task, toX, toY, phase, resourceId: task?.resourceId || getCellMaterialResourceType(destinationCell) }, "gatherMaterials");
}

function normalizePlantUnitTask(task, { currentX, currentY, currentUnit } = {}) {
  const destination = getNormalizedUnitTaskDestination(task, currentX, currentY);

  if (!destination) {
    return null;
  }

  const { toX, toY, destinationCell } = destination;

  if (!canPlantAtCell(destinationCell, currentUnit || unit)) {
    return null;
  }

  return serializeTargetedUnitTask({ toX, toY }, "plant");
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
  if (!getConstructibleRules(subjectKind, subjectType)) {
    return null;
  }
  const structure = getConstructionEntityAtCell(destinationCell, {
    kind: subjectKind,
    type: subjectType,
  });

  if (!structure || structure.state !== "construction") {
    return null;
  }

  return serializeLayFoundationUnitTask({
    toX,
    toY,
    subjectKind,
    subjectType,
  }, "layFoundation");
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

function normalizeSituationMessage(entry) {
  if (!entry || typeof entry.kind !== "string") {
    throw new Error("Missing situation message entry.");
  }

  if (!["intro", "houseStarted", "houseCompleted", "buildingLimitReached", "foodShortage", "foodRecovered", "unitLeft", "researchGoalMissing", "technologyDiscovered", "populationCapReached", "victory", "defeat"].includes(entry.kind)) {
    throw new Error(`Unsupported situation message kind: ${entry.kind}`);
  }
  if (
    ["houseCompleted", "unitLeft"].includes(entry.kind) &&
    (typeof entry.unitType !== "string" || !entry.unitType.trim())
  ) {
    throw new Error("Missing unit type in situation message.");
  }
  if (
    entry.kind === "buildingLimitReached" &&
    (typeof entry.buildingType !== "string" || !entry.buildingType.trim() ||
      typeof entry.requiredBuildingType !== "string" || !entry.requiredBuildingType.trim())
  ) {
    throw new Error("Missing building types in situation message.");
  }

  return createSituationMessageEntry(
    entry.kind,
    {
      unitType: entry.unitType,
      technologyId: entry.technologyId,
      buildingType: entry.buildingType,
      requiredBuildingType: entry.requiredBuildingType,
      current: entry.current,
      threshold: entry.threshold,
    },
    clampInteger(entry.turn, 1, 999999, 1),
  );
}

function normalizeSituationMessagesState(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    throw new Error("Missing situation message data.");
  }

  return rawMessages.map((entry) => normalizeSituationMessage(entry));
}

function normalizeStockpileState(rawStockpile) {
  return {
    stone: clampNonNegativeNumber(rawStockpile?.stone, 999999, 0),
    lumber: clampNonNegativeNumber(rawStockpile?.lumber, 999999, 0),
    food: clampNonNegativeNumber(rawStockpile?.food, 999999, 0),
  };
}

function normalizeStockpileHistoryState(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    throw new Error("Missing stockpile history data.");
  }

  return rawHistory
    .filter((entry) => Number.isInteger(entry?.turn) && entry.turn >= 1 && entry.turn <= 999999)
    .map((entry) => ({
      turn: entry.turn,
      ...normalizeStockpileState(entry),
      ...(Number.isFinite(entry.happiness) ? { happiness: normalizeHappiness(entry.happiness, rules.happiness) } : {}),
    }));
}

function normalizeBuildingState(state) {
  return ["complete", "construction", "abandoned"].includes(state)
    ? state
    : "complete";
}

function normalizeConstructiblesState(kind, rawConstructibles) {
  return normalizeConstructiblesStateForKind(kind, rawConstructibles);
}

function normalizeLinkedEntityId(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeUnitsState(rawUnits, mode) {
  if (!Array.isArray(rawUnits)) {
    throw new Error("Missing unit data.");
  }
  const sourceUnits = rawUnits;
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
      cargo: normalizeUnitCargo(sourceUnit?.cargo, sourceUnit?.unitType),
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
      cargo: normalizeUnitCargo(sourceUnit?.cargo, unitType),
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

    if (isTaskAction(normalizedUnit.task, unitActions.research) && !getSelectedResearchGoalTechnologyId() &&
      (mode !== interactionModes.play || !technologyCatalog.loaded || hasAvailableResearchGoal())) {
      normalizedUnit.task = null;
    }

    const isCollectionTransport = isGatherTask(normalizedUnit.task) &&
      (normalizedUnit.task.phase === "deliver" || normalizedUnit.task.phase === "return");
    // Cargo may prevent a new gather order, but it must not cancel an active delivery or return.
    if (normalizedUnit.task && !isCollectionTransport && !canUnitUseAction(normalizedUnit, getTaskActionId(normalizedUnit.task))) {
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
  gameOutcome = ["victory", "defeat"].includes(nextState.gameOutcome) ? nextState.gameOutcome : null;
  researchState = normalizeResearchState(nextState.research);

  map.width = nextMap.width;
  map.height = nextMap.height;
  map.cells = nextMap.cells;
  rebuildVisibleCellIndex(map.cells);
  rebuildFoodResourceCellIndex(map.cells);
  rebuildPathRenderableCellIndex(map.cells);
  buildings = normalizeConstructiblesState("building", nextState.buildings);
  vehicles = normalizeConstructiblesState("vehicle", nextState.vehicles);
  units = normalizeUnitsState(nextState.units, mode);
  rebuildUnitOccupancyIndex();
  reconcileMountedVehicleStateLinks(vehicles, units);
  stockpile = normalizeStockpileState(nextState.stockpile);
  happiness = normalizeHappiness(nextState.happiness, rules.happiness);
  stockpileHistory = normalizeStockpileHistoryState(nextState.stockpileHistory);
  pendingSituationMessages = normalizeSituationMessagesState(nextState.pendingSituationMessages);
  populationEvents = normalizePopulationEvents(nextState.populationEvents);
  clampStockpileToCapacity();
  foodShortageTurns = Math.max(
    0,
    clampInteger(nextState.foodShortageTurns, 0, 999999, 0),
  );
  foodShortageActive = nextState.foodShortageActive;
  inspectedPlayCell = null;
  syncActiveUnit();
  selectedUnitAction = null;
  pendingFoundationPlacement = null;
  currentTurn = Math.max(1, clampInteger(nextState.turn, 1, 999999, 1));
  fullPopulationSinceTurn = Number.isInteger(nextState.fullPopulationSinceTurn)
    && nextState.fullPopulationSinceTurn >= 1
    && nextState.fullPopulationSinceTurn <= currentTurn
    ? nextState.fullPopulationSinceTurn
    : null;
  if (mode === interactionModes.play) {
    const previousStartTurn = fullPopulationSinceTurn;
    const previousOutcome = gameOutcome;
    const nextEndingState = advanceGameEndingState({
      population: getUnits().length,
      populationCap: getUnitPopulationCap(),
      turn: currentTurn,
      fullPopulationSinceTurn,
      outcome: gameOutcome,
      victoryTurnForStart: getGameVictoryTurnForStart,
    });
    fullPopulationSinceTurn = nextEndingState.fullPopulationSinceTurn;
    gameOutcome = nextEndingState.outcome;
    const newMessageKind = (gameOutcome && !previousOutcome ? gameOutcome : null) || (previousStartTurn === null && fullPopulationSinceTurn !== null
      ? "populationCapReached"
      : null);
    if (newMessageKind && !pendingSituationMessages.some((message) => message.kind === newMessageKind)) {
      pendingSituationMessages.push(createSituationMessageEntry(newMessageKind));
    }
    stopHouseConstructionTasksAtPopulationCap();
  }
  syncSeasonConversionState({ includeCurrentTurn: false, rebuild: true });
  autoAdvanceTurns =
    typeof nextState.autoAdvanceTurns === "boolean" ? nextState.autoAdvanceTurns : true;
  turnResolutionInProgress = false;

  setTextContent(mapSizeReadouts, strings.readouts.mapSize(map.width, map.height));
  if (mode === interactionModes.edit) {
    setEditStateDirty(false);
  }
  refreshAfterModeStateTransition({
    resetTileHoverReadout: true,
    relayout: true,
    recenter,
  });
}

async function loadFileIntoMode(fileName, mode, options, preloadedState = null) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return false;

  const state = preloadedState || await readSaveFile(normalizedName);

  if (!state) return false;
  if (!isCompatibleSaveState(state)) {
    console.warn(`Save slot ${normalizedName} is obsolete and cannot be loaded.`);
    return false;
  }

  const isPlayAutosave = mode === interactionModes.play && normalizedName === autosaveSlotName;
  if (isPlayAutosave && !Object.prototype.hasOwnProperty.call(state, "activeFileName")) {
    console.warn(`Save slot ${normalizedName} is missing its active file name.`);
    return false;
  }

  if (mode === interactionModes.play) {
    await ensureTechnologyCatalogLoaded();
  }

  const previousFileName = getCurrentFileName(mode);
  const activeFileName = isPlayAutosave
    ? sanitizeFileName(state.activeFileName) || null
    : normalizedName;

  try {
    writeCurrentFileName(mode, activeFileName);
    applyStateSnapshot(state, mode, options);
    return true;
  } catch (error) {
    writeCurrentFileName(mode, previousFileName);
    updatePersistenceControls();
    console.warn(`Could not apply save slot ${normalizedName}.`, error);
    return false;
  }
}

async function loadCurrentFileForMode(mode, options) {
  const currentFileName = getCurrentFileName(mode);

  if (!currentFileName) {
    applyStateSnapshot(createDefaultState(mode), mode, options);
    return false;
  }

  if (await loadFileIntoMode(currentFileName, mode, options)) {
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

let pendingAutosaveWrite = Promise.resolve();

function autosavePlayState() {
  const state = {
    ...serializeCurrentState(),
    activeFileName: getCurrentFileName(interactionModes.play),
  };

  pendingAutosaveWrite = pendingAutosaveWrite.then(() =>
    writeSaveFile(autosaveSlotName, state, { alertMode: "once" }),
  );
  return pendingAutosaveWrite;
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

function hasAssignedTask(currentUnit) {
  return Boolean(currentUnit?.task);
}

function clearSelectedActionForCompletedTask(currentUnit) {
  const selectedUnit = getSelectedUnit();

  if (selectedUnit && selectedUnit !== currentUnit) {
    return;
  }

  selectedUnitAction = null;
  pendingFoundationPlacement = null;
}

function getCurrentSelectedUnitAction(currentUnit = getSelectedUnit()) {
  if (!currentUnit) {
    return normalizePendingSelectableUnitAction(selectedUnitAction);
  }

  return getPreferredUnitAction(currentUnit, selectedUnitAction);
}

function isUnitWorking(currentUnit) {
  return Boolean(currentUnit) && !currentUnit.move && isWorkingTask(currentUnit.task);
}

function hasWorkingUnits() {
  return getUnits().some((currentUnit) => isUnitWorking(currentUnit));
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

function shouldAnimateWorkingUnits() {
  return canRenderAnimatedFrames() && isPlayMode() && !mainMenuOpen && hasWorkingUnits();
}

function shouldAnimateSelectionMarker() {
  return false;
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
  defaultAction = null,
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

function handleBookOverlayVisibilityChanged(isOpen, { resumeTurns = true } = {}) {
  if (isOpen) {
    clearQueuedAutoAdvanceFrame();
  }

  updateTurnControls();
  if (!isOpen && resumeTurns) {
    maybeAutoAdvanceTurn();
  }
}

function canAdvanceTurn() {
  return (
    !mainMenuOpen &&
    bookOverlay?.hidden !== false &&
    !bookOverlayIntroMode &&
    !bookOverlayRestoreState &&
    isPlayMode() &&
    !gameOutcome &&
    !isReplayPhase() &&
    !turnResolutionInProgress &&
    pendingSituationMessages.length === 0 &&
    !getUnits().some((currentUnit) => isUnitAnimating(currentUnit))
  );
}

function canManuallyAdvanceTurn() {
  return canAdvanceTurn() && (!autoAdvanceTurns || getIdleUnits().length > 0);
}

function updateTurnReadout() {
  setTextContent(turnReadouts, strings.readouts.turn(currentTurn, formatJulianTurnDate(currentTurn)));
  setTextContent(happinessReadouts, strings.readouts.happiness(formatDisplayedNumber(happiness)));
  const goalLabel = gameOutcome === "victory"
    ? strings.readouts.victory
    : gameOutcome === "defeat"
      ? strings.readouts.defeat
      : fullPopulationSinceTurn !== null
        ? strings.readouts.populationGoal(formatJulianTurnDate(getGameVictoryTurnForStart(fullPopulationSinceTurn)))
        : "";
  setTextContent(populationGoalReadouts, goalLabel);
  for (const readout of populationGoalReadouts) {
    readout.hidden = !goalLabel;
    readout.dataset.outcome = gameOutcome || "";
  }
}

function updateTurnControls() {
  updateTurnReadout();
  updateStockpileReadout();
  setTextContent(turnAutoToggleButtons, autoAdvanceTurns ? strings.actions.pauseTurns : strings.actions.continueTurns);
  setDisabledState(turnAutoToggleButtons, Boolean(gameOutcome));
  setDisabledState(nextTurnButtons, !canManuallyAdvanceTurn());
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
  if (!currentUnit || currentUnit.move || !task || isReplayPhase() || (isPlayMode() && gameOutcome)) return false;

  clearQueuedAutoAdvanceFrame();
  pendingFoundationPlacement = null;

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

function assignPlayTasksToEligibleIdleUnitsForManualTurnAdvance(context = getRuleContext()) {
  if (!autoAssignPlayTasksForIdleUnitsOnManualTurnAdvance) {
    return 0;
  }

  let assignedCount = 0;

  for (const currentUnit of getIdleUnits()) {
    if (!canUnitUseAction(currentUnit, unitActions.play, context)) {
      continue;
    }

    currentUnit.task = createUnitTaskForAction(unitActions.play);
    currentUnit.turnRoute = null;
    currentUnit.lastStepFromX = null;
    currentUnit.lastStepFromY = null;
    assignedCount += 1;
  }

  return assignedCount;
}

function queueResearchUnitAction({ currentUnit = getSelectedUnit() } = {}) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitUseAction(currentUnit, unitActions.research)) return false;
  if (!technologyCatalog.loaded) {
    const taskAtRequest = currentUnit.task;
    void ensureTechnologyCatalogLoaded().then((catalog) => {
      if (catalog.loaded && getSelectedUnit() === currentUnit && currentUnit.task === taskAtRequest) {
        queueResearchUnitAction({ currentUnit });
      }
    });
    return false;
  }
  if (!getSelectedResearchGoalTechnologyId()) {
    if (!hasAvailableResearchGoal()) {
      clearPendingBookResearchAssignment();
      return assignUnitTask(createUnitTaskForAction(unitActions.research), currentUnit);
    }

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

  if (getUnitBaseResearchPointsPerTurn(currentUnit) <= 0) {
    return false;
  }

  return assignUnitTask(createUnitTaskForAction(unitActions.research), currentUnit);
}

function queueGatherFoodUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move || !canAssignGatherFoodTarget(destinationCell, currentUnit)) return false;
  if (!canUnitUseAction(currentUnit, unitActions.gatherFood)) return false;

  const task = createUnitTaskForAction(unitActions.gatherFood, { destinationCell });
  if (!areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)) {
    task.phase = "return";
  }
  return assignUnitTask(task, currentUnit);
}

function queuePlantUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move || !canPlantAtCell(destinationCell, currentUnit)) return false;
  if (!canUnitUseAction(currentUnit, unitActions.plant)) return false;

  return assignUnitTask(createUnitTaskForAction(unitActions.plant, { destinationCell }), currentUnit);
}

function queueGatherMaterialsUnitAction({ currentUnit = getSelectedUnit(), destinationCell } = {}) {
  if (!currentUnit || currentUnit.move || !canAssignGatherMaterialsTarget(destinationCell, currentUnit)) return false;
  if (!canUnitUseAction(currentUnit, unitActions.gatherMaterials)) return false;

  const task = createUnitTaskForAction(unitActions.gatherMaterials, { destinationCell });
  if (!areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)) {
    task.phase = "return";
  }
  return assignUnitTask(task, currentUnit);
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

  markCellVisited(cell, { invalidate: false });

  invalidateStaticLayer();
  const didAssignTask = assignUnitTask(
    createUnitTaskForAction(unitActions.buildHouse, { destinationCell }),
    currentUnit,
  );
  if (didAssignTask && targetMode?.mode === "new") {
    addSituationMessage("houseStarted");
  }
  return didAssignTask;
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

function clearCompletedTask(currentUnit) {
  clearSelectedActionForCompletedTask(currentUnit);
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
    selectedUnitAction = null;
  }

  refreshAfterUnitTaskChange({ autoAdvance: true });
  return true;
}

function exhaustFoodResource(cell) {
  if (!cell) return;

  const wasFishOnWater = cell.type === "water" && cell.foodType === "fish";

  clearGeneratedCellFood(cell);

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

function isCollectionSourceUsable(cell, task) {
  if (!cell || !task?.resourceId) return false;

  if (task.type === "gatherFood") {
    return cell.foodType === task.resourceId && hasCollectibleFoodResource(cell);
  }

  return getCellMaterialResourceType(cell) === task.resourceId;
}

function findNextCollectionSource(task) {
  const previousCell = getCell(task.toX, task.toY);
  const candidates = [previousCell, ...getAdjacentCells(previousCell)]
    .filter((cell) => isCollectionSourceUsable(cell, task));

  if (candidates.length === 0) return null;

  const amountField = task.type === "gatherFood" ? "foodAmount" : "materialAmount";
  const maximumAmount = Math.max(...candidates.map((cell) => cell[amountField]));
  const richestCandidates = candidates.filter((cell) => cell[amountField] === maximumAmount);
  return richestCandidates[Math.floor(Math.random() * richestCandidates.length)];
}

function setNextCollectionSource(currentUnit) {
  const task = currentUnit.task;
  const nextSource = findNextCollectionSource(task);

  if (!nextSource) return false;
  task.toX = nextSource.x;
  task.toY = nextSource.y;
  task.turnsRemaining = getGatherTaskDurationTurns();
  task.allowDepletionOnCycleStart = false;
  delete task.returnX;
  delete task.returnY;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  return true;
}

function setCollectionPhase(currentUnit, phase) {
  if (currentUnit.task.phase === "deliver" && phase === "return") {
    currentUnit.task.turnsRemaining = getGatherTaskDurationTurns();
  }
  currentUnit.task.phase = phase;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  invalidateStaticUnitsLayer();
}

function beginCollectionDelivery(currentUnit, stopAfterDelivery = false) {
  const task = currentUnit.task;

  if (!getActiveCargo(currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  task.stopAfterDelivery = stopAfterDelivery;
  delete task.deliveryX;
  delete task.deliveryY;
  delete task.returnX;
  delete task.returnY;
  setCollectionPhase(currentUnit, "deliver");
}

function finishCollectionGather(currentUnit, sourceExhausted = false) {
  const task = currentUnit.task;
  const source = getCell(task.toX, task.toY);
  const resourceType = task.type === "gatherFood" ? "food" : task.resourceId;
  const canContinueHere = isCollectionSourceUsable(source, task);
  const needsNextSource = sourceExhausted || !canContinueHere;

  if (needsNextSource && !setNextCollectionSource(currentUnit)) {
    beginCollectionDelivery(currentUnit, true);
    return;
  }

  if (getActiveCargoRoom(currentUnit, resourceType) <= quantityEpsilon) {
    beginCollectionDelivery(currentUnit);
    return;
  }

  if (task.turnsRemaining <= 0) {
    task.turnsRemaining = getGatherTaskDurationTurns();
    task.allowDepletionOnCycleStart = false;
  }

  if (!areCellsAdjacent(currentUnit.x, currentUnit.y, task.toX, task.toY)) {
    setCollectionPhase(currentUnit, "return");
  }
  invalidateStaticLayer();
}

function canUseCollectionDestination(currentUnit, cell) {
  if (canUnitEnter(cell, currentUnit)) return true;
  if (getActiveCargoHolder(currentUnit) !== currentUnit && getActiveCargo(currentUnit)) return false;
  return getUnitCellPassabilityState(cell, currentUnit, {
    requireUnmounted: true,
    forbidVehicles: true,
  }).canOccupy;
}

function findCollectionDeliveryCell(currentUnit, resourceType) {
  const candidates = new Map();

  for (const building of buildings) {
    if (building?.state !== "complete" || getBuildingResourceStorageCapacity(building.type, resourceType) <= 0) continue;
    const footprint = getConstructiblePlacementCells(getCell(building.x, building.y), {
      kind: "building", type: building.type,
    });

    for (const occupiedCell of footprint) {
      for (const neighbor of getAdjacentCells(occupiedCell)) {
        if (canUseCollectionDestination(currentUnit, neighbor)) {
          candidates.set(createCellKey(neighbor.x, neighbor.y), neighbor);
        }
      }
    }
  }

  return [...candidates.values()].sort((left, right) =>
    walkingDistance(currentUnit.x, currentUnit.y, left.x, left.y)
    - walkingDistance(currentUnit.x, currentUnit.y, right.x, right.y))[0] || null;
}

function resolveCollectionTransport(currentUnit) {
  const task = currentUnit.task;
  const cargo = getActiveCargo(currentUnit);

  if (task.stopAfterDelivery && !cargo) {
    clearCompletedTask(currentUnit);
    return;
  }

  if (task.phase === "deliver") {
    if (cargo) unloadActiveCargoAtCell(currentUnit, getCell(currentUnit.x, currentUnit.y));
    if (!getActiveCargo(currentUnit)) {
      if (task.stopAfterDelivery) {
        clearCompletedTask(currentUnit);
      } else {
        delete task.deliveryX;
        delete task.deliveryY;
        setCollectionPhase(currentUnit, "return");
      }
      return;
    }

    let destination = getCell(task.deliveryX, task.deliveryY);
    if (!destination || !canUseCollectionDestination(currentUnit, destination)) {
      destination = findCollectionDeliveryCell(currentUnit, cargo.resourceType);
      currentUnit.turnRoute = null;
    }
    if (!destination) {
      clearCompletedTask(currentUnit);
      return;
    }
    task.deliveryX = destination.x;
    task.deliveryY = destination.y;
    const result = moveUnitTowardCellForTurn(currentUnit, { toX: destination.x, toY: destination.y }, {
      stopWhenUnloaded: true,
    });

    if (result === "blocked" || (result === "arrived" && getActiveCargo(currentUnit))) {
      clearCompletedTask(currentUnit);
    } else if (!getActiveCargo(currentUnit)) {
      if (task.stopAfterDelivery) clearCompletedTask(currentUnit);
      else {
        delete task.deliveryX;
        delete task.deliveryY;
        setCollectionPhase(currentUnit, "return");
      }
    }
    return;
  }

  if (!isCollectionSourceUsable(getCell(task.toX, task.toY), task) && !setNextCollectionSource(currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }
  if (areCellsAdjacent(currentUnit.x, currentUnit.y, task.toX, task.toY)) {
    delete task.returnX;
    delete task.returnY;
    setCollectionPhase(currentUnit, "gather");
    return;
  }

  const source = getCell(task.toX, task.toY);
  let destination = getCell(task.returnX, task.returnY);
  if (!destination || !areCellsAdjacent(destination.x, destination.y, source.x, source.y)
    || !canUseCollectionDestination(currentUnit, destination)) {
    destination = getAdjacentCells(source)
      .filter((cell) => canUseCollectionDestination(currentUnit, cell))
      .sort((left, right) =>
        walkingDistance(currentUnit.x, currentUnit.y, left.x, left.y)
        - walkingDistance(currentUnit.x, currentUnit.y, right.x, right.y))[0];
    currentUnit.turnRoute = null;
  }
  if (!destination) {
    clearCompletedTask(currentUnit);
    return;
  }

  task.returnX = destination.x;
  task.returnY = destination.y;
  const result = moveUnitTowardCellForTurn(currentUnit, { toX: destination.x, toY: destination.y });
  if (result === "blocked") clearCompletedTask(currentUnit);
  else if (areCellsAdjacent(currentUnit.x, currentUnit.y, task.toX, task.toY)) {
    delete task.returnX;
    delete task.returnY;
    setCollectionPhase(currentUnit, "gather");
  }
}

function resolveGatherFoodTask(currentUnit) {
  if (currentUnit.task?.phase && currentUnit.task.phase !== "gather") {
    resolveCollectionTransport(currentUnit);
    return;
  }
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!canUnitUseAction(currentUnit, unitActions.gatherFood)) {
    clearCompletedTask(currentUnit);
    return;
  }
  if (!hasCollectibleFoodResource(targetCell) || targetCell.foodType !== currentUnit.task.resourceId) {
    if (!setNextCollectionSource(currentUnit)) beginCollectionDelivery(currentUnit, true);
    else if (!areCellsAdjacent(currentUnit.x, currentUnit.y, currentUnit.task.toX, currentUnit.task.toY)) {
      setCollectionPhase(currentUnit, "return");
    }
    return;
  }
  if (!canGatherFoodFromCell(targetCell, currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const canDepleteThisTurn = canGatherTaskDepleteOnThisTurn(currentUnit.task);
  const currentFoodAmount = clampNonNegativeNumber(targetCell.foodAmount, 999999, 0);
  const cargoRoom = getActiveCargoRoom(currentUnit, "food");
  const workPoints = getUnitWorkPointsPerTurn("gatherFood", currentUnit);
  if (workPoints <= quantityEpsilon) {
    currentUnit.stamina = 0;
    return;
  }
  const gatherAmount = Math.min(
    workPoints,
    Math.max(0, currentFoodAmount - (canDepleteThisTurn ? 0 : 1)),
    cargoRoom,
  );

  if (gatherAmount <= 0) {
    if (currentFoodAmount <= 0) {
      exhaustFoodResource(targetCell);
    }
    finishCollectionGather(currentUnit, currentFoodAmount <= 0);
    return;
  }

  targetCell.foodAmount = Math.max(0, currentFoodAmount - gatherAmount);
  addToActiveCargo(currentUnit, "food", gatherAmount);
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  currentUnit.task.turnsRemaining = Math.max(0, getGatherTaskTurnsRemaining(currentUnit.task) - 1);
  currentUnit.task.allowDepletionOnCycleStart = false;

  if (targetCell.foodAmount <= 0) {
    exhaustFoodResource(targetCell);
  }
  finishCollectionGather(currentUnit, targetCell.foodAmount <= 0);
}

function resolvePlantTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!canPlantAtCell(targetCell, currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const plantedFoodType = "grain";
  const plantedFoodCapacity = getUnitPlantedFoodCapacity(plantedFoodType, currentUnit);

  if (!spendFromStockpile("food", 1) || plantedFoodCapacity <= 0) {
    clearCompletedTask(currentUnit);
    return;
  }

  if (!targetCell.foodType) {
    setGeneratedFoodResource(targetCell, plantedFoodType, {
      amount: 0,
      capacity: plantedFoodCapacity,
    });
  }

  targetCell.foodAmount = clamp(
    clampNonNegativeNumber(targetCell.foodAmount, 999999, 0) + 1,
    0,
    getCellFoodMaxAmount(targetCell),
  );
  applySeasonStateToCell(targetCell);
  markCellVisited(targetCell, { invalidate: false });
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  invalidateStaticLayer();
  clearCompletedTask(currentUnit);
}

function resolveGatherMaterialsTask(currentUnit) {
  if (currentUnit.task?.phase && currentUnit.task.phase !== "gather") {
    resolveCollectionTransport(currentUnit);
    return;
  }
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);

  if (!canUnitUseAction(currentUnit, unitActions.gatherMaterials)) {
    clearCompletedTask(currentUnit);
    return;
  }
  if (!hasMaterialResource(targetCell) || getCellMaterialResourceType(targetCell) !== currentUnit.task.resourceId) {
    if (!setNextCollectionSource(currentUnit)) beginCollectionDelivery(currentUnit, true);
    else if (!areCellsAdjacent(currentUnit.x, currentUnit.y, currentUnit.task.toX, currentUnit.task.toY)) {
      setCollectionPhase(currentUnit, "return");
    }
    return;
  }
  if (!canGatherMaterialsFromCell(targetCell, currentUnit)) {
    clearCompletedTask(currentUnit);
    return;
  }

  const materialType = getCellMaterialResourceType(targetCell);
  const currentMaterialAmount = clampNonNegativeNumber(targetCell.materialAmount, 999999, 0);
  const workPoints = getUnitWorkPointsPerTurn("gatherMaterials", currentUnit);
  if (workPoints <= quantityEpsilon) {
    currentUnit.stamina = 0;
    return;
  }
  const gatherAmount = Math.min(
    workPoints,
    currentMaterialAmount,
    getActiveCargoRoom(currentUnit, materialType),
  );

  if (!materialType || gatherAmount <= 0) {
    if (targetCell && currentMaterialAmount <= 0) {
      exhaustMaterialResource(targetCell);
    }
    finishCollectionGather(currentUnit, currentMaterialAmount <= 0);
    return;
  }

  targetCell.materialAmount = Math.max(0, currentMaterialAmount - gatherAmount);
  addToActiveCargo(currentUnit, materialType, gatherAmount);
  turnReplayHadWork = true;
  currentUnit.stamina = 0;
  currentUnit.task.turnsRemaining = Math.max(0, getGatherTaskTurnsRemaining(currentUnit.task) - 1);
  currentUnit.task.allowDepletionOnCycleStart = false;

  if (targetCell.materialAmount <= 0) {
    exhaustMaterialResource(targetCell);
  }
  finishCollectionGather(currentUnit, targetCell.materialAmount <= 0);
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

  const isHouseConstruction = structure.type === "house" && structure.riderUnitId === undefined;
  const previousCompleteness = getBuildingCompleteness(structure);
  const workDelta = getConstructionWorkCompletenessDelta("buildHouse", structure, currentUnit);

  if (isHouseConstruction && isPopulationAtCapacity()) {
    structure.completeness = getBlockedHouseCompleteness(previousCompleteness, workDelta);
    if (structure.completeness !== previousCompleteness) {
      invalidateStaticLayer();
    }
    clearCompletedTask(currentUnit);
    return;
  }

  if (workDelta <= 0) {
    currentUnit.stamina = 0;
    return;
  }

  const nextCompleteness = clamp(
    previousCompleteness + workDelta,
    0,
    1,
  );

  turnReplayHadWork = true;
  structure.state = nextCompleteness >= 1 ? "complete" : "construction";
  structure.completeness = nextCompleteness;
  currentUnit.stamina = 0;
  invalidateStaticLayer();

  if (nextCompleteness >= 1 && isHouseConstruction) {
    const spawnedUnit = spawnUnitFromHouse(structure);
    if (!spawnedUnit) {
      structure.state = "construction";
      structure.completeness = getBlockedHouseCompleteness(previousCompleteness, workDelta);
      clearCompletedTask(currentUnit);
      return;
    }

    recordPopulationChange(1, spawnedUnit);
    addSituationMessage("houseCompleted", { unitType: getUnitTypeId(spawnedUnit) });
  }

  if (nextCompleteness >= 1) {
    if (structure.riderUnitId === undefined) {
      completedBuildingTypesThisTurn.add(structure.type);
    }
    clearCompletedTask(currentUnit);
  }
}

function resolveLayFoundationTask(currentUnit) {
  const targetCell = getCell(currentUnit.task?.toX, currentUnit.task?.toY);
  const { subjectKind, subjectType } = normalizeLayFoundationTaskSubject(currentUnit.task);
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
  const dismountedVehicle = getMountedVehicle(currentUnit);

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
    cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
    vehicleId: dismountedVehicle?.id || null,
    vehicleCargo: dismountedVehicle ? normalizeVehicleCargo(dismountedVehicle.cargo, dismountedVehicle) : null,
  });

  clearCompletedTask(currentUnit);
}

function resolveResearchTask(currentUnit) {
  const selectedGoalTechnologyId = getSelectedResearchGoalTechnologyId();

  if (!selectedGoalTechnologyId) {
    if (technologyCatalog.loaded && !hasAvailableResearchGoal()) {
      resolvePerformTask(currentUnit);
    } else {
      clearCompletedTask(currentUnit);
    }
    return;
  }

  const researchPoints = getUnitResearchPointsPerTurn(currentUnit);

  if (researchPoints <= 0) {
    currentUnit.stamina = 0;
    return;
  }

  turnReplayHadWork = true;
  currentUnit.stamina = 0;

  if (addResearchProgressToTechnology(selectedGoalTechnologyId, researchPoints, { refresh: false })) {
    const isGoalStillSelected = getSelectedResearchGoalTechnologyId() === selectedGoalTechnologyId;

    if (!isGoalStillSelected) {
      if (hasAvailableResearchGoal()) {
        clearCompletedTask(currentUnit);
      }
    }
    if (isTechnologyDiscovered(selectedGoalTechnologyId)) {
      addSituationMessage("technologyDiscovered", { technologyId: selectedGoalTechnologyId });
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

  if (isGatherTask(currentUnit.task) && (!currentUnit.task.phase || currentUnit.task.phase === "gather")) {
    const resourceType = currentUnit.task.type === "gatherFood" ? "food" : currentUnit.task.resourceId;
    if (getActiveCargo(currentUnit) && getActiveCargoRoom(currentUnit, resourceType) <= quantityEpsilon) {
      beginCollectionDelivery(currentUnit);
      return;
    }
  }

  const spec = getUnitActionSpec(currentUnit.task);

  if (!spec?.resolveTask || (getActiveCargo(currentUnit) && currentUnit.task.phase !== "deliver" && currentUnit.task.phase !== "return" &&
    !getUnitAllowedActions(currentUnit).includes(spec.id))) {
    clearCompletedTask(currentUnit);
    return;
  }

  spec.resolveTask(currentUnit);
}

function resolveMoveTaskForTurn(currentUnit) {
  const result = moveUnitTowardCellForTurn(currentUnit, currentUnit.task);

  if (result === "arrived" || result === "blocked") {
    clearCompletedTask(currentUnit);
  }
}

function moveUnitTowardCellForTurn(currentUnit, destination, { stopWhenUnloaded = false } = {}) {
  const context = getRuleContext();

  if (isGatherTask(currentUnit.task)) {
    turnReplayMoveTargets.set(currentUnit.id, { toX: destination.toX, toY: destination.toY });
  }

  while (getUnitStamina(currentUnit) > 0) {
    if (currentUnit.x === destination.toX && currentUnit.y === destination.toY) {
      return "arrived";
    }

    let nextMove = getNextMoveStep(currentUnit, destination);

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
      nextMove = getNextMoveStep(currentUnit, destination);
    }

    if (!nextMove) {
      return "blocked";
    }

    if (nextMove.type === "dismount") {
      currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - (nextMove.moveCost || 0));
      const dismountedVehicle = getMountedVehicle(currentUnit);
      const hadCargo = Boolean(getActiveCargo(currentUnit));

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
        cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
        vehicleId: dismountedVehicle?.id || null,
        vehicleCargo: dismountedVehicle ? normalizeVehicleCargo(dismountedVehicle.cargo, dismountedVehicle) : null,
      });

      if (currentUnit.x === destination.toX && currentUnit.y === destination.toY) {
        currentUnit.turnRoute = null;
        return "arrived";
      }

      if (stopWhenUnloaded && hadCargo && !getActiveCargo(currentUnit)) {
        currentUnit.turnRoute = null;
        return "unloaded";
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

    const destinationCell = getCell(currentUnit.x, currentUnit.y);

    markCellVisitedByUnit(destinationCell);
    maybeMountUnitAtCurrentCell(currentUnit);
    const hadCargo = Boolean(getActiveCargo(currentUnit));
    unloadActiveCargoAtCell(currentUnit, destinationCell);
    const arrivedVehicle = getMountedVehicle(currentUnit);
    turnReplayHadMove = true;
    turnReplayQueue.push({
      type: "moveStep",
      unitId: currentUnit.id,
      direction: currentUnit.facing,
      toX: currentUnit.x,
      toY: currentUnit.y,
      cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
      vehicleId: arrivedVehicle?.id || null,
      vehicleCargo: arrivedVehicle ? normalizeVehicleCargo(arrivedVehicle.cargo, arrivedVehicle) : null,
    });

    if (currentUnit.x === destination.toX && currentUnit.y === destination.toY) {
      currentUnit.turnRoute = null;
      return "arrived";
    }

    if (stopWhenUnloaded && hadCargo && !getActiveCargo(currentUnit)) {
      currentUnit.turnRoute = null;
      return "unloaded";
    }
  }

  return "moving";
}

function resetUnitsForTurn() {
  for (const currentUnit of getUnits()) {
    currentUnit.stamina = getUnitMaxStamina(currentUnit);
    currentUnit.turnRoute = null;
  }
}

function regrowFoodResourcesForTurn() {
  let didChange = false;

  for (const cell of foodResourceCells.values()) {
    const maxAmount = getCellFoodMaxAmount(cell);
    const currentAmount = clampNumber(Number(cell.foodAmount), 0, maxAmount, 0);
    const regrowthRate = getFoodTypeRegrowthRate(cell.foodType);

    if (maxAmount <= 0 || currentAmount <= 0 || regrowthRate <= 0 || doesSeasonDisableLandFoodRegrowth(cell)) {
      continue;
    }

    const nextAmount = clamp(currentAmount * (1 + regrowthRate), 0, maxAmount);

    if (nextAmount !== cell.foodAmount) {
      cell.foodAmount = nextAmount;
      didChange = true;
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
  const requiredFood = getUnits().reduce(
    (sum, currentUnit) => sum + getUnitFoodConsumptionPerTurn(currentUnit),
    0,
  );

  if (requiredFood <= 0) {
    foodShortageTurns = 0;
    foodShortageActive = false;
    return;
  }

  const availableFood = getCurrentStockpileAmount("food");

  if (availableFood >= requiredFood) {
    stockpile.food = availableFood - requiredFood;
    if (foodShortageActive) {
      addSituationMessage("foodRecovered");
    }
    foodShortageTurns = 0;
    foodShortageActive = false;
    return;
  }

  stockpile.food = 0;
  foodShortageTurns += 1;
  if (!foodShortageActive) {
    foodShortageActive = true;
    addSituationMessage("foodShortage", {
      current: foodShortageTurns,
      threshold: getFoodShortageThreshold(),
    });
  }

  if (foodShortageTurns >= getFoodShortageThreshold()) {
    const removedUnit = removeRandomUnitForFoodShortage();
    if (removedUnit) {
      recordPopulationChange(-1, removedUnit);
      addSituationMessage("unitLeft", { unitType: getUnitTypeId(removedUnit) });
    }
    foodShortageTurns = getFoodShortageResetTurns();
  }
}

function applyVillageEconomyForTurn() {
  regrowFoodResourcesForTurn();
  consumeFoodForTurn();
}

function changeHappiness(amount) {
  happiness = normalizeHappiness(happiness + amount, rules.happiness);
}

function updateHappinessForTurn() {
  const currentUnits = getUnits();
  const context = getRuleContext();
  const noResearchGoalsRemain = technologyCatalog.loaded && !hasAvailableResearchGoal();
  const dailyConsumption = currentUnits.reduce(
    (sum, currentUnit) => sum + getUnitFoodConsumptionPerTurn(currentUnit, context), 0,
  );
  const buildingBonus = buildings.reduce((sum, building) => {
    if (building?.state !== "complete") return sum;
    return sum + (getEffectiveConstructibleRules("building", building.type, context)?.happinessPerTurn || 0);
  }, 0);
  const delta = getHappinessChangeForTurn(rules.happiness, {
    foodDays: getFoodSurvivalDays(getCurrentStockpileAmount("food"), dailyConsumption),
    population: currentUnits.length,
    waitingUnits: currentUnits.filter((currentUnit) =>
      isTaskAction(currentUnit.task, unitActions.play)
      || (noResearchGoalsRemain && isTaskAction(currentUnit.task, unitActions.research))).length,
    buildingBonus,
  });
  changeHappiness(delta);
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
      cargo: normalizeUnitCargo(currentUnit.cargo, currentUnit),
      task: serializeTask(currentUnit.task),
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
      ...(getVehicleCargoCapacity(vehicle) > 0 ? { cargo: normalizeVehicleCargo(vehicle.cargo, vehicle) } : {}),
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
    currentUnit.cargo = state.cargo ? { ...state.cargo } : null;
    currentUnit.task = state.task ? { ...state.task } : null;
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
    if (getVehicleCargoCapacity(vehicle) > 0) {
      vehicle.cargo = state.cargo ? { ...state.cargo } : null;
    }
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
  updateSituationMessagePanel();
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
      {
        mode: "dismount",
        cargoOnArrival: replayEvent.cargo,
        vehicleIdOnArrival: replayEvent.vehicleId,
        vehicleCargoOnArrival: replayEvent.vehicleCargo,
      },
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
    {
      cargoOnArrival: replayEvent.cargo,
      vehicleIdOnArrival: replayEvent.vehicleId,
      vehicleCargoOnArrival: replayEvent.vehicleCargo,
    },
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

function stopHouseConstructionTasksAtPopulationCap() {
  if (!isPopulationAtCapacity()) {
    return;
  }

  for (const currentUnit of getUnits()) {
    if (!isTaskAction(currentUnit.task, unitActions.buildHouse)) {
      continue;
    }

    const targetCell = getCell(currentUnit.task.toX, currentUnit.task.toY);
    const structure = getConstructionEntityAtCell(targetCell);
    if (structure?.type === "house" && structure.state === "construction" && structure.riderUnitId === undefined) {
      clearCompletedTask(currentUnit);
    }
  }
}

function updateGameEndingAfterTurn() {
  const previousStartTurn = fullPopulationSinceTurn;
  const previousOutcome = gameOutcome;
  const next = advanceGameEndingState({
    population: getUnits().length,
    populationCap: getUnitPopulationCap(),
    turn: currentTurn,
    fullPopulationSinceTurn,
    outcome: gameOutcome,
    victoryTurnForStart: getGameVictoryTurnForStart,
  });

  fullPopulationSinceTurn = next.fullPopulationSinceTurn;
  gameOutcome = next.outcome;

  if (gameOutcome && !previousOutcome) {
    addSituationMessage(gameOutcome);
  } else if (fullPopulationSinceTurn !== null && previousStartTurn === null) {
    addSituationMessage("populationCapReached");
  }
}

function announceReachedBuildingLimits() {
  if (completedBuildingTypesThisTurn.size === 0 || gameOutcome) return;

  const context = getRuleContext();

  for (const buildingType of completedBuildingTypesThisTurn) {
    if (buildingType === "house" && isPopulationAtCapacity()) continue;

    const limits = getConstructibleLimits("building", buildingType);
    const providerType = limits.countByBuilding?.building;
    const providerCount = getCountForRuleMap(context.completeBuildingCountsByType, providerType);
    const subjectCount = getCountForRuleMap(context.completeBuildingCountsByType, buildingType);
    const requiredBuildingType = getReachedCountByBuildingProvider(limits, subjectCount, providerCount);

    if (requiredBuildingType) {
      addSituationMessage("buildingLimitReached", { buildingType, requiredBuildingType });
    }
  }
}

function resolveTurn() {
  turnReplayQueue = [];
  turnReplayHadWork = false;
  turnReplayHadMove = false;
  completedBuildingTypesThisTurn = new Set();
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
  updateHappinessForTurn();
  updateGameEndingAfterTurn();
  announceReachedBuildingLimits();
  stopHouseConstructionTasksAtPopulationCap();
  recordStockpileHistoryForCurrentTurn();
  turnReplayFinalStates = captureReplayUnitStates();
  turnReplayVehicleFinalStates = captureReplayVehicleStates();
  void autosavePlayState();
}

function updateBuildingsForTurn() {
  let didChange = false;
  const nextBuildings = [];

  for (const building of buildings) {
    if (building.state !== "abandoned") {
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

function advanceTurn({ userInitiated = false } = {}) {
  if (userInitiated ? !canManuallyAdvanceTurn() : !canAdvanceTurn()) return;

  clearPendingAutoAdvance();
  turnResolutionInProgress = true;
  try {
    if (userInitiated) {
      assignPlayTasksToEligibleIdleUnitsForManualTurnAdvance();
    }

    currentTurn += 1;
    applySeasonConversionForCurrentTurn();
    updateBuildingsForTurn();
    resolveTurn();
  } finally {
    turnResolutionInProgress = false;
  }
  beginTurnReplay();
}

function maybeAutoAdvanceTurn() {
  if (!canAdvanceTurn()) {
    clearQueuedAutoAdvanceFrame();
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

  for (const imagePath of getTerrainImagePaths()) {
    pendingLoads.push(loadImage(imagePath, tileImages));
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
      Object.keys(rules.resources?.foodTypes || {})
        .flatMap((foodType) => getFoodOverlayStageDefinitions(foodType).map((stage) => stage.imagePath))
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
    ...Object.values(vehicleCatalog).flatMap((spec) => [
      spec.cargoOverlay?.unmounted,
      ...Object.values(spec.cargoOverlay?.mountedByImage || {}),
      ...Object.values(spec.cargoOverlay?.mountedForegroundByImage || {}),
    ]).filter(Boolean),
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

  syncFoodResourceCellIndexForCell(cell);
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
    syncFoodResourceCellIndexForCell(cell);
    return;
  }

  cell.foodType = null;
  cell.foodCapacity = 0;
  cell.foodAmount = 0;
  syncFoodResourceCellIndexForCell(cell);
}

function createCell(x, y, type) {
  const cell = {
    x,
    y,
    type,
    variant: chooseTerrainVariant(type),
    season: defaultCellSeason,
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
    syncPathRenderableCellIndexForCell(cell);
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

function getVehicleMountedMovementTerrains(vehicle, context = getRuleContext()) {
  return getEffectiveConstructibleRules("vehicle", vehicle?.type, context)?.mounted?.movementTerrains;
}

function canVehicleTraverseCell(vehicle, cell, context = getRuleContext()) {
  return doesMovementRuleListAllowCell(getVehicleMountedMovementTerrains(vehicle, context), cell);
}

function canMountedUnitTraverseTerrain(currentUnit, cell, alternativeTerrain = null) {
  if (!cell || !currentUnit) {
    return false;
  }

  return doesMovementRuleListAllowCell(getMountedVehicleRules(currentUnit)?.movementTerrains, cell, alternativeTerrain);
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
  const mountedSurfaceTerrain = constructibleState.walkableBuilding
    ? getConstructibleRules("building", constructibleState.walkableBuilding.type)?.mountedSurfaceTerrain
    : null;
  const mountedTerrainAllowed = Boolean(effectiveMountedVehicleId) &&
    canMountedUnitTraverseTerrain(effectiveUnit, cell, mountedSurfaceTerrain);

  let terrainOrStructurePassable = false;

  if (constructibleState.blockingBuilding || constructibleState.blockingVehicle || (effectiveMountedVehicleId && !mountedTerrainAllowed)) {
    terrainOrStructurePassable = false;
  } else if (constructibleState.walkableBuilding) {
    terrainOrStructurePassable = true;
  } else if (constructibleState.walkableVehicle) {
    if (effectiveMountedVehicleId && constructibleState.walkableVehicle.id !== effectiveMountedVehicleId) {
      terrainOrStructurePassable = false;
    } else if (!canTransferUnitCargoToVehicle(effectiveUnit, constructibleState.walkableVehicle)) {
      terrainOrStructurePassable = false;
    } else if (
      constructibleState.walkableVehicle.riderUnitId &&
      constructibleState.walkableVehicle.riderUnitId !== effectiveUnit?.id
    ) {
      terrainOrStructurePassable = false;
    } else {
      terrainOrStructurePassable = true;
    }
  } else if (mountedTerrainAllowed) {
    terrainOrStructurePassable = true;
  } else {
    terrainOrStructurePassable = cell.type !== "water" || isSeasonallyWalkableWaterCell(cell);
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

    if (getUnitCellPassabilityState(neighbor).canOccupy) {
      return neighbor;
    }
  }

  return findNearestPassableCell(x, y);
}

function getUnitPopulationCap() {
  return getPopulationCap(unitSpawnConfig.pool);
}

function isPopulationAtCapacity() {
  const cap = getUnitPopulationCap();
  return cap > 0 && getUnits().length >= cap;
}

function getUnitSpawnPoolEntryRemainingQuantity(entry, context = getRuleContext()) {
  if (!entry || typeof entry !== "object") {
    return 0;
  }

  return Math.max(0, Math.floor(Number(entry.quantity) || 0) - getCountForRuleMap(context.livingUnitCountsByType, entry.id));
}

function getEligibleUnitSpawnPoolEntries(context = getRuleContext(), allowedTypeIds = null) {
  const allowedTypeIdSet = Array.isArray(allowedTypeIds) && allowedTypeIds.length > 0
    ? new Set(
      allowedTypeIds
        .map((typeId) => (typeof typeId === "string" ? normalizeUnitTypeId(typeId) : ""))
        .filter(Boolean),
    )
    : null;

  return (unitSpawnConfig.pool || []).filter((entry) =>
    hasDefinedUnitType(entry?.id) &&
    (!allowedTypeIdSet || allowedTypeIdSet.has(entry.id)) &&
    isUnitTypeAvailable(entry.id, context) &&
    getUnitSpawnPoolEntryRemainingQuantity(entry, context) > 0,
  );
}

function getActiveUnitSpawnGuarantee(context = getRuleContext()) {
  for (const guarantee of unitSpawnConfig.ensurePresentByUnitCount || []) {
    if (!Number.isFinite(guarantee?.unitCount) || context.nextUnitNumber < guarantee.unitCount) {
      continue;
    }

    const guaranteedTypes = (guarantee.types || []).filter((typeId) =>
      hasDefinedUnitType(typeId) && isUnitTypeAvailable(typeId, context),
    );

    if (guaranteedTypes.length === 0) {
      continue;
    }

    const isSatisfied = guaranteedTypes.some((typeId) => getCountForRuleMap(context.livingUnitCountsByType, typeId) > 0);

    if (!isSatisfied) {
      return {
        ...guarantee,
        types: guaranteedTypes,
      };
    }
  }

  return null;
}

function chooseQuantityPoolId(items) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const totalQuantity = items.reduce((sum, item) => sum + Math.max(0, Math.floor(Number(item?.quantity) || 0)), 0);

  if (!(totalQuantity > 0)) {
    return items[0]?.id || null;
  }

  let roll = Math.floor(Math.random() * totalQuantity);

  for (const item of items) {
    roll -= Math.max(0, Math.floor(Number(item?.quantity) || 0));

    if (roll < 0) {
      return item?.id || null;
    }
  }

  return items[items.length - 1]?.id || null;
}

function getNextHouseSpawnUnitTypeId() {
  const context = getRuleContext();
  const eligiblePoolEntries = getEligibleUnitSpawnPoolEntries(context);

  if (eligiblePoolEntries.length === 0) {
    return (unitSpawnConfig.pool || []).length === 0 ? getDefaultUnitTypeId() : null;
  }

  const activeGuarantee = getActiveUnitSpawnGuarantee(context);
  const restrictedPoolEntries = activeGuarantee ? getEligibleUnitSpawnPoolEntries(context, activeGuarantee.types) : [];
  const chosenTypeId = chooseQuantityPoolId(restrictedPoolEntries.length > 0 ? restrictedPoolEntries : eligiblePoolEntries);

  return chosenTypeId ? normalizeUnitTypeId(chosenTypeId) : null;
}

function spawnUnitFromHouse(building, unitTypeId = getNextHouseSpawnUnitTypeId()) {
  if (!building || isPopulationAtCapacity() || !unitTypeId || !hasDefinedUnitType(unitTypeId)) return null;

  const spawnCell = findAdjacentSpawnCell(building.x, building.y);
  const unitType = normalizeUnitTypeId(unitTypeId);

  if (!spawnCell || !unitType) {
    return null;
  }

  const spawnedUnit = {
    id: createUnitId(),
    unitType,
    x: spawnCell.x,
    y: spawnCell.y,
    facing: "west",
    homeBuildingId: building.id,
    staminaMax: getDefaultUnitStamina(unitType),
    stamina: getDefaultUnitStamina(unitType),
    cargo: null,
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

function findNearestPassableCell(startX, startY, currentUnit = null, occupiedKeys = null) {
  const startCell = getCell(startX, startY);

  if (!startCell) {
    return null;
  }

  return findNearestMatchingCellByAdjacency(startCell, {
    getNeighbors: getAdjacentCells,
    isMatch: (cell) => canUnitEnter(cell, currentUnit, occupiedKeys),
    getKey: (cell) => createCellKey(cell.x, cell.y),
    score: (cell) => distance(cell.x, cell.y, startX, startY),
  });
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

  return canTransferUnitCargoToVehicle(currentUnit, vehicle) &&
    vehicleOccupiesCell(vehicle, currentUnit.x, currentUnit.y);
}

function canTransferUnitCargoToVehicle(currentUnit, vehicle) {
  const capacity = getVehicleCargoCapacity(vehicle);
  if (capacity <= 0) return true;

  const unitCargo = normalizeUnitCargo(currentUnit?.cargo, currentUnit);
  if (!unitCargo) return true;

  return !normalizeVehicleCargo(vehicle.cargo, vehicle) && unitCargo.amount <= capacity + quantityEpsilon;
}

function transferUnitCargoToVehicle(currentUnit, vehicle) {
  const cargo = normalizeUnitCargo(currentUnit?.cargo, currentUnit);
  if (!cargo || getVehicleCargoCapacity(vehicle) <= 0) return true;
  if (!canTransferUnitCargoToVehicle(currentUnit, vehicle)) return false;

  vehicle.cargo = cargo;
  currentUnit.cargo = null;
  return true;
}

function mountUnitOnVehicle(currentUnit, vehicle, { refreshPresentation = true } = {}) {
  if (!canMountVehicle(currentUnit, vehicle)) {
    return false;
  }

  if (currentUnit.mountedVehicleId === vehicle.id && vehicle.riderUnitId === currentUnit.id) {
    return true;
  }

  if (!transferUnitCargoToVehicle(currentUnit, vehicle)) {
    return false;
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
  if (!isReplayPhase()) {
    unloadActiveCargoAtCell(currentUnit, destinationCell);
  }

  if (updateSelectedAction) {
    selectedUnitAction = null;
  }

  invalidateStaticLayer();
  invalidateStaticUnitsLayer();

  if (refreshPresentation) {
    refreshUnitAndTurnPresentationAndDraw({ autoAdvance: true });
  }

  return true;
}

function updateUnitReadout() {
  const selectedUnit = getSelectedUnit();
  const displayedUnit = selectedUnit || unit;
  const cargo = displayedUnit ? getActiveCargo(displayedUnit) : null;
  const showCargo = Boolean(displayedUnit && (selectedUnit || getUnits().length === 1));
  setTextContent(unitCargoReadouts, showCargo
    ? strings.readouts.cargo(
      formatDisplayedQuantity(cargo?.amount),
      formatDisplayedQuantity(getActiveCargoCapacity(displayedUnit)),
      cargo ? getResourceLabel(cargo.resourceType) : "",
    )
    : "");
  const setCenterButtonState = (currentUnit = null, unitName = "") => {
    const label = unitName
      ? `${strings.actions.centerUnitOnMap}: ${unitName}`
      : strings.actions.centerUnitOnMap;

    for (const button of centerUnitOnMapButtons) {
      button.disabled = !currentUnit;
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  };
  const setCancelButtonState = (visible, disabled = false) => {
    for (const button of cancelUnitTaskButtons) {
      button.hidden = !visible;
      button.disabled = disabled || isReplayPhase();
    }
  };
  const setLoopIndicatorVisible = (visible) => {
    for (const indicator of gatherLoopIndicators) {
      indicator.hidden = !visible;
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
    setLoopIndicatorVisible(false);
    setCancelButtonState(false, true);
  };
  const showTaskRow = (
    imagePath,
    progressText = "",
    {
      cancelVisible = false,
      cancelDisabled = false,
      loopVisible = false,
    } = {},
  ) => {
    setActionSprite(imagePath);
    setTextContent(unitActionProgressReadouts, progressText);
    for (const row of unitTaskRows) {
      row.hidden = false;
    }
    setLoopIndicatorVisible(loopVisible);
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
    setCenterButtonState(null);
    updateUnitBookPageButtons(null);
    hideTaskRow();
    updateTileInspectorReadout();
    updateUnitActionControls();
    return;
  }

  if (!selectedUnit && getUnits().length > 1) {
    setUnitTitle(strings.readouts.unitTitleNone);
    setCenterButtonState(null);
    updateUnitBookPageButtons(null);
    hideTaskRow();
    updateTileInspectorReadout();
    updateUnitActionControls();
    return;
  }

  const unitName = getDefaultUnitName(getUnitTypeId(displayedUnit));
  setUnitTitle(unitName);
  setCenterButtonState(displayedUnit, unitName);
  updateUnitBookPageButtons(displayedUnit, unitName);

  if (displayedUnit.move) {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), "", {
      loopVisible: isGatherTask(displayedUnit.task) && !displayedUnit.task.stopAfterDelivery,
    });
    return;
  }

  if (displayedUnit.task) {
    setTaskAndRefresh(
      getUnitInspectorSpriteImage(displayedUnit),
      getUnitTaskInspectorProgressText(displayedUnit),
      {
        cancelVisible: true,
        loopVisible: isGatherTask(displayedUnit.task) && !displayedUnit.task.stopAfterDelivery,
      },
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
  unitActionBar.hidden = true;

  if (!shouldShow || selectedUnit?.move || isReplayPhase() ||
    (unitTileActionTarget && unitTileActionTarget.unitId !== selectedUnit.id)) {
    closeUnitTileActionMenu();
  }

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

  closeUnitTileActionMenu();
  pendingFoundationPlacement = null;

  let didChange = false;

  for (const candidate of getUnits()) {
    const shouldSelect = candidate === currentUnit;

    if (candidate.selected !== shouldSelect) {
      candidate.selected = shouldSelect;
      didChange = true;
    }
  }

  unit = currentUnit;
  selectedUnitAction = getPreferredUnitAction(currentUnit, defaultAction);
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
  appShell?.classList.toggle("standalone-book-mode", bookOverlayIntroMode || Boolean(bookOverlayRestoreState));
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
  const mode = interactionMode || "";
  canvas.dataset.mode = mode;
  overlayCanvas.dataset.mode = mode;
  updateEditInspector();
  updatePlayOverlayLayout();

  updateSituationMessagePanel();
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
  pendingFoundationPlacement = null;
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
  closeUnitTileActionMenu();
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

function shouldOfferFirstVisitIntro() {
  try {
    return window.localStorage.getItem(storageKeys.introPromptAnswered) === null;
  } catch {
    return false;
  }
}

function answerFirstVisitIntro(playIntro) {
  if (!firstVisitIntroDialog?.open) return;

  firstVisitIntroDialog.close();
  try {
    window.localStorage.setItem(storageKeys.introPromptAnswered, "1");
  } catch {
    // Storage may be disabled; the current choice still applies.
  }

  if (playIntro) {
    void playBookSequence(bookIntroSequenceId, mainMenuItems.watchIntro);
  } else {
    mainMenuItems.watchIntro?.focus({ preventScroll: true });
  }
}

function offerFirstVisitIntro() {
  if (!firstVisitIntroDialog || !mainMenuOpen || mainMenuOverlay.hidden || !shouldOfferFirstVisitIntro()) return;

  setTextContent([firstVisitIntroQuestion], strings.menu.firstVisitIntroQuestion);
  setTextContent([firstVisitIntroYesButton], strings.menu.firstVisitIntroYes);
  setTextContent([firstVisitIntroNoButton], strings.menu.firstVisitIntroNo);
  const selector = firstVisitIntroDialog.querySelector('[data-role="language-selector"]');
  selector?.setAttribute("aria-label", strings.language.selectorLabel);
  for (const button of selector?.querySelectorAll('[data-action="set-language"]') || []) {
    const language = button.dataset.language;
    const label = strings.language?.[language] || language || "";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.setAttribute("aria-pressed", language === currentLanguage ? "true" : "false");
    button.classList.toggle("is-selected", language === currentLanguage);
  }
  firstVisitIntroYesButton.disabled = true;
  firstVisitIntroDialog.showModal();
}

function prepareFirstVisitIntro() {
  if (!firstVisitIntroDialog?.open) return;

  void Promise.all([ensureBookContentLoaded(), ensureTechnologyCatalogLoaded()])
    .then(() => {
      if (!firstVisitIntroDialog.open) return;

      const sequencePages = bookDocument?.sequences?.[bookIntroSequenceId];
      if (!bookDocument?.loaded || !Array.isArray(sequencePages) || sequencePages.length < 2) {
        firstVisitIntroDialog.close();
        mainMenuItems.watchIntro?.focus({ preventScroll: true });
        return;
      }

      firstVisitIntroYesButton.disabled = false;
    })
    .catch((error) => {
      console.error("Could not prepare the intro.", error);
      if (firstVisitIntroDialog.open) firstVisitIntroDialog.close();
    });
}

function setInteractionMode(nextMode, { drawNow = true } = {}) {
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
  refreshAfterModeStateTransition({ drawNow: drawNow && didChange });
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

async function activateMode(nextMode) {
  const shouldRevealAfterLoad = mainMenuOpen;

  if (!shouldRevealAfterLoad) {
    setInteractionMode(nextMode, { drawNow: false });
  }

  let resumedAutosave = false;
  if (nextMode === interactionModes.play) {
    const autosaveState = await readSaveFile(autosaveSlotName);
    const currentFileName = getCurrentFileName(nextMode);
    if (
      isCompatibleSaveState(autosaveState) &&
      (!currentFileName || currentFileName === autosaveSlotName ||
        sanitizeFileName(autosaveState.activeFileName) === currentFileName)
    ) {
      resumedAutosave = await loadFileIntoMode(autosaveSlotName, nextMode, undefined, autosaveState);
    }
  }

  if (!resumedAutosave) {
    await loadCurrentFileForMode(nextMode);
  }

  if (shouldRevealAfterLoad) {
    setInteractionMode(nextMode);
  }

  schedulePostModeActivationLayoutRefresh(nextMode);
}

function startNewGeneratedState(
  mode,
  buildCells = buildGeneratedMapCells,
  generationSettings = mapGenerationSettings,
  generationSize = mapGenerationSize,
) {
  if (!mode) return false;

  writeCurrentFileName(mode, null);
  setInteractionMode(mode);
  applyStateSnapshot(createGeneratedState(mode, buildCells, generationSettings, generationSize), mode);

  if (mode === interactionModes.play) {
    void autosavePlayState();
    return true;
  }

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

  if (action === unitActions.layFoundation && getPendingFoundationPlacement(selectedUnit)) {
    return getHoveredFoundationPlacementCells(selectedUnit);
  }

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

  if (action === unitActions.gatherFood) {
    return getGatherFoodCells(selectedUnit);
  }

  if (action === unitActions.plant) {
    return getPlantCells(selectedUnit);
  }

  if (action === unitActions.gatherMaterials) {
    return getGatherMaterialsCells(selectedUnit);
  }

  return [];
}

function getUnitTargetStyle() {
  const action = getCurrentSelectedUnitAction();

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

  if (action === unitActions.plant) {
    return {
      fill: "rgba(134, 184, 95, 0.2)",
      stroke: "rgba(197, 234, 145, 0.8)",
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
  if (!cell) {
    return false;
  }

  if (!isPlayMode()) {
    return true;
  }

  return visibleCellKeys.has(createCellKey(cell.x, cell.y));
}

function isCellVisibleByExploration(cell) {
  if (!cell) {
    return false;
  }

  if (cell.visited) {
    return true;
  }

  for (const direction of getMovementDirections()) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (neighbor?.visited) {
      return true;
    }
  }

  return false;
}

function resetVisibleCellIndex(rowCount = map.height) {
  visibleCellKeys = new Set();
  visibleCellsByRow = Array.from(
    { length: Math.max(0, clampInteger(rowCount, 0, 999999, 0)) },
    () => [],
  );
}

function addVisibleCellToIndex(cell) {
  if (!cell) {
    return false;
  }

  const key = createCellKey(cell.x, cell.y);

  if (visibleCellKeys.has(key)) {
    return false;
  }

  visibleCellKeys.add(key);

  if (!Array.isArray(visibleCellsByRow[cell.y])) {
    visibleCellsByRow[cell.y] = [];
  }

  const row = visibleCellsByRow[cell.y];
  let insertIndex = row.length;

  while (insertIndex > 0 && row[insertIndex - 1].x > cell.x) {
    insertIndex -= 1;
  }

  row.splice(insertIndex, 0, cell);
  return true;
}

function syncVisibleCellIndexForVisibleCell(cell) {
  if (!isCellVisibleByExploration(cell)) {
    return false;
  }

  return addVisibleCellToIndex(cell);
}

function syncVisibleCellIndexForVisitedCell(cell) {
  if (!cell?.visited) {
    return false;
  }

  let changed = syncVisibleCellIndexForVisibleCell(cell);

  for (const direction of getMovementDirections()) {
    if (syncVisibleCellIndexForVisibleCell(getNeighborByDirection(cell, direction))) {
      changed = true;
    }
  }

  return changed;
}

function rebuildVisibleCellIndex(cells = map.cells) {
  const rowCount = Array.isArray(cells) ? cells.length : map.height;
  resetVisibleCellIndex(rowCount);

  if (!Array.isArray(cells)) {
    return visibleCellsByRow;
  }

  for (const row of cells) {
    if (!Array.isArray(row)) {
      continue;
    }

    for (const cell of row) {
      if (isCellVisibleByExploration(cell)) {
        addVisibleCellToIndex(cell);
      }
    }
  }

  return visibleCellsByRow;
}

function isCurrentMapCellInstance(cell) {
  return Boolean(cell) && getCell(cell.x, cell.y) === cell;
}

function syncFoodResourceCellIndexForCell(cell) {
  if (!isCurrentMapCellInstance(cell)) {
    return false;
  }

  const key = createCellKey(cell.x, cell.y);
  const shouldTrack = hasFoodResource(cell);
  const hadEntry = foodResourceCells.has(key);
  const previousCell = hadEntry ? foodResourceCells.get(key) : null;

  if (shouldTrack) {
    foodResourceCells.set(key, cell);
    return !hadEntry || previousCell !== cell;
  }

  if (hadEntry) {
    foodResourceCells.delete(key);
    return true;
  }

  return false;
}

function rebuildFoodResourceCellIndex(cells = map.cells) {
  foodResourceCells = new Map();

  if (!Array.isArray(cells)) {
    return foodResourceCells;
  }

  for (const row of cells) {
    if (!Array.isArray(row)) {
      continue;
    }

    for (const cell of row) {
      if (hasFoodResource(cell)) {
        foodResourceCells.set(createCellKey(cell.x, cell.y), cell);
      }
    }
  }

  return foodResourceCells;
}

function markCellVisited(cell, { invalidate = true } = {}) {
  if (!cell || cell.visited) {
    return false;
  }

  cell.visited = true;
  syncVisibleCellIndexForVisitedCell(cell);

  if (invalidate) {
    invalidateStaticLayer();
  }

  return true;
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

function findNearestMatchingCellByAdjacency(
  startCell,
  {
    getNeighbors,
    isMatch,
    getKey,
    score = null,
  } = {},
) {
  if (!startCell || typeof getNeighbors !== "function" || typeof isMatch !== "function" || typeof getKey !== "function") {
    return null;
  }

  let frontier = [startCell];
  const visitedKeys = new Set([getKey(startCell)]);

  while (frontier.length > 0) {
    const matches = [];

    for (const cell of frontier) {
      if (isMatch(cell)) {
        matches.push(cell);
      }
    }

    if (matches.length > 0) {
      if (matches.length === 1 || typeof score !== "function") {
        return matches[0];
      }

      matches.sort((left, right) => {
        const scoreDelta = score(left) - score(right);

        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        if (left.y !== right.y) {
          return left.y - right.y;
        }

        return left.x - right.x;
      });

      return matches[0];
    }

    const nextFrontier = [];

    for (const cell of frontier) {
      for (const neighbor of getNeighbors(cell)) {
        if (!neighbor) {
          continue;
        }

        const key = getKey(neighbor);

        if (!key || visitedKeys.has(key)) {
          continue;
        }

        visitedKeys.add(key);
        nextFrontier.push(neighbor);
      }
    }

    frontier = nextFrontier;
  }

  return null;
}

function areCellsAdjacent(fromX, fromY, toX, toY) {
  const cell = getCell(fromX, fromY);

  if (!cell) return false;

  return getAdjacentCells(cell).some((neighbor) => neighbor.x === toX && neighbor.y === toY);
}

function canPlaceNewHouseConstructionOnCell(cell) {
  return canPlaceNewBuildingConstructionOnCell(cell, "house");
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

function getBuildHouseTargetMode(cell, { ignoreAffordability = false } = {}) {
  const constructionEntity = getConstructionEntityAtCell(cell);

  if (constructionEntity?.state === "construction") {
    if (constructionEntity.type === "house" && constructionEntity.riderUnitId === undefined && isPopulationAtCapacity()) {
      return null;
    }

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

function canGatherFoodFromCell(cell, currentUnit = unit) {
  if (!cell || !currentUnit) return false;

  return hasCollectibleFoodResource(cell)
    && getActiveCargoRoom(currentUnit, "food") > quantityEpsilon
    && areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
}

function canAssignGatherFoodTarget(cell, currentUnit = unit) {
  return Boolean(cell && currentUnit && hasCollectibleFoodResource(cell)
    && getActiveCargoRoom(currentUnit, "food") > quantityEpsilon
    && (areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y)
      || getAdjacentCells(cell).some((neighbor) => canUseCollectionDestination(currentUnit, neighbor))));
}

function canPlantAtCell(cell, currentUnit = unit) {
  if (!cell || !currentUnit) {
    return false;
  }

  if (!areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y)) {
    return false;
  }

  if (cell.type !== "grass") {
    return false;
  }

  if (isWinter2SeasonCell(cell)) {
    return false;
  }

  if (getBuildingAtCell(cell.x, cell.y) || getVehicleAtCell(cell.x, cell.y) || getUnitAtCell(cell.x, cell.y)) {
    return false;
  }

  if (!hasSufficientQuantity(getCurrentStockpileAmount("food"), 1)) {
    return false;
  }

  if (!cell.foodType) {
    return getUnitPlantedFoodCapacity("grain", currentUnit) > 0;
  }

  return cell.foodType === "grain"
    && clampNonNegativeNumber(cell.foodAmount, 999999, 0) + quantityEpsilon < getCellFoodMaxAmount(cell);
}

function canGatherMaterialsFromCell(cell, currentUnit = unit) {
  if (!cell || !currentUnit) return false;

  return hasMaterialResource(cell)
    && getActiveCargoRoom(currentUnit, getCellMaterialResourceType(cell)) > quantityEpsilon
    && areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
}

function canAssignGatherMaterialsTarget(cell, currentUnit = unit) {
  const resourceType = getCellMaterialResourceType(cell);
  return Boolean(currentUnit && resourceType
    && getActiveCargoRoom(currentUnit, resourceType) > quantityEpsilon
    && (areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y)
      || getAdjacentCells(cell).some((neighbor) => canUseCollectionDestination(currentUnit, neighbor))));
}

function getGatherFoodCells(currentUnit = unit) {
  if (!currentUnit) return [];

  const originCell = getCell(currentUnit.x, currentUnit.y);
  const candidates = originCell ? getAdjacentCells(originCell) : [];

  return candidates.filter((cell) => canGatherFoodFromCell(cell, currentUnit));
}

function getPlantCells(currentUnit = unit) {
  if (!currentUnit) return [];

  const originCell = getCell(currentUnit.x, currentUnit.y);
  const candidates = originCell ? getAdjacentCells(originCell) : [];

  return candidates.filter((cell) => canPlantAtCell(cell, currentUnit));
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

function getPlannerAccessibleCellKeys(plannerUnit, cell, destinationCell) {
  const accessibleKeys = new Set([createCellKey(cell.x, cell.y)]);

  for (const neighbor of getAdjacentCells(cell)) {
    if (canUnitEnter(neighbor, plannerUnit)) {
      accessibleKeys.add(createCellKey(neighbor.x, neighbor.y));
    }
  }

  if (plannerUnit.mountedVehicleId && !canUnitEnter(destinationCell, plannerUnit)) {
    for (const dismountCell of getUnitDismountTargetCells(plannerUnit, cell)) {
      accessibleKeys.add(createCellKey(dismountCell.x, dismountCell.y));
    }
  }

  return accessibleKeys;
}

function isPlannerDeadEndStep(currentUnit, cell, mountedVehicleId, destinationCell, accessibleFromCurrent) {
  if (cell.x === destinationCell.x && cell.y === destinationCell.y) {
    return false;
  }

  const nextPlannerUnit = createPlannerUnitState(currentUnit, cell, mountedVehicleId);

  for (const neighbor of getAdjacentCells(cell)) {
    if (
      !accessibleFromCurrent.has(createCellKey(neighbor.x, neighbor.y)) &&
      canUnitEnter(neighbor, nextPlannerUnit)
    ) {
      return false;
    }
  }

  if (nextPlannerUnit.mountedVehicleId && !canUnitEnter(destinationCell, nextPlannerUnit)) {
    for (const dismountCell of getUnitDismountTargetCells(nextPlannerUnit, cell)) {
      if (!accessibleFromCurrent.has(createCellKey(dismountCell.x, dismountCell.y))) {
        return false;
      }
    }
  }

  return true;
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

  const accessibleFromCurrent = getPlannerAccessibleCellKeys(plannerUnit, cell, destinationCell);

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

      if (isPlannerDeadEndStep(currentUnit, dismountCell, null, destinationCell, accessibleFromCurrent)) {
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
      neighbor.y === currentUnit.lastStepFromY &&
      walkingDistance(neighbor.x, neighbor.y, destinationCell.x, destinationCell.y) >=
        walkingDistance(cell.x, cell.y, destinationCell.x, destinationCell.y)
    ) {
      continue;
    }

    const nextMountedVehicleId = getPlannerMountedVehicleIdAfterEnteringCell(currentUnit, neighbor, normalizedMountedVehicleId);
    const neighborKey = createTurnRouteStateKey(neighbor, nextMountedVehicleId);

    if (visitedKeys.has(neighborKey)) {
      continue;
    }

    if (isPlannerDeadEndStep(currentUnit, neighbor, nextMountedVehicleId, destinationCell, accessibleFromCurrent)) {
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

const diagonalTurnStepDirections = new Set(["northEast", "northWest", "southEast", "southWest"]);

function compareTurnRouteDirectionPreference(steps, otherSteps, previousDirection) {
  if (previousDirection) {
    const directions = getMovementDirections();
    const previousIndex = directions.indexOf(previousDirection);
    const stepIndex = directions.indexOf(steps[0].direction);
    const otherStepIndex = directions.indexOf(otherSteps[0].direction);
    const stepTurn = Math.abs(stepIndex - previousIndex);
    const otherStepTurn = Math.abs(otherStepIndex - previousIndex);
    const difference = Math.min(otherStepTurn, directions.length - otherStepTurn)
      - Math.min(stepTurn, directions.length - stepTurn);

    if (difference !== 0) return difference;
  }

  for (let index = 0; index < Math.min(steps.length, otherSteps.length); index += 1) {
    const difference = Number(diagonalTurnStepDirections.has(steps[index].direction))
      - Number(diagonalTurnStepDirections.has(otherSteps[index].direction));
    if (difference !== 0) return difference;
  }

  return 0;
}

function chooseBestTurnRoute(routes, destinationCell, previousDirection) {
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
        route.steps.length < bestStepCount
      ) ||
      (
        finalDistance === bestDistance &&
        firstStepDistance === bestFirstStepDistance &&
        route.steps.length === bestStepCount &&
        bestRoute && compareTurnRouteDirectionPreference(route.steps, bestRoute, previousDirection) > 0
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
    const previousDirection = Number.isInteger(currentUnit.lastStepFromX)
      && Number.isInteger(currentUnit.lastStepFromY)
      && areCellsAdjacent(currentUnit.lastStepFromX, currentUnit.lastStepFromY, originCell.x, originCell.y)
      ? getMoveDirection(currentUnit.lastStepFromX, currentUnit.lastStepFromY, originCell.x, originCell.y)
      : null;
    const context = getRuleContext();
    const routes = buildTurnRoutes(
      currentUnit,
      originCell,
      destinationCell,
      getUnitStamina(currentUnit),
      context,
      new Set([createTurnRouteStateKey(originCell, currentUnit?.mountedVehicleId)]),
    );
    currentUnit.turnRoute = chooseBestTurnRoute(routes, destinationCell, previousDirection) || null;
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
  closeUnitTileActionMenu();
  hideTileMenu();

  if (isReplayPhase()) {
    return;
  }

  const movingUnit = getMovingUnit();

  if (movingUnit) return;

  const selectedUnit = getSelectedUnit();
  const selectedConstructible = getPendingFoundationPlacement(selectedUnit);
  if (
    selectedUnit && cell &&
    getCurrentSelectedUnitAction(selectedUnit) === unitActions.layFoundation &&
    isMultiTileConstructible(selectedConstructible) &&
    getHoveredFoundationPlacementCells(selectedUnit, cell).length > 0
  ) {
    queueLayFoundationUnitAction({ currentUnit: selectedUnit, destinationCell: cell, constructible: selectedConstructible });
    return;
  }

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
    cargoOnArrival: options.cargoOnArrival || null,
    vehicleIdOnArrival: options.vehicleIdOnArrival || null,
    vehicleCargoOnArrival: options.vehicleCargoOnArrival || null,
  };
  unit = currentUnit;

  if (!shouldAnimateUnitMoveStep(currentUnit)) {
    completeUnitMove(currentUnit);
    return;
  }

  refreshAfterUnitTaskChange({ scheduleAnimationPlayback: true });
}

function getViewportCanvasBounds({ marginX = 0, marginY = 0 } = {}) {
  if (!viewport) {
    return null;
  }

  return {
    left: viewport.scrollLeft - marginX,
    top: viewport.scrollTop - marginY,
    right: viewport.scrollLeft + viewport.clientWidth + marginX,
    bottom: viewport.scrollTop + viewport.clientHeight + marginY,
  };
}

function isScreenPointNearViewport(screen, { marginX = tile.width * 1.5, marginY = tile.height * 3 } = {}) {
  if (!screen) {
    return false;
  }

  const bounds = getViewportCanvasBounds({ marginX, marginY });

  if (!bounds || viewport.clientWidth <= 0 || viewport.clientHeight <= 0) {
    return true;
  }

  return (
    screen.x >= bounds.left &&
    screen.x <= bounds.right &&
    screen.y >= bounds.top &&
    screen.y <= bounds.bottom
  );
}

function shouldAnimateUnitMoveStep(currentUnit = unit) {
  if (!currentUnit?.move || interactionMode !== interactionModes.play) {
    return true;
  }

  const fromScreen = getCellScreenPositionForUnitRendering(
    getCell(currentUnit.move.fromX, currentUnit.move.fromY),
  );
  const toScreen = getCellScreenPositionForUnitRendering(
    getCell(currentUnit.move.toX, currentUnit.move.toY),
  );

  if (!fromScreen || !toScreen) {
    return true;
  }

  return (
    isScreenPointNearViewport(fromScreen) ||
    isScreenPointNearViewport(toScreen)
  );
}

function completeUnitMove(currentUnit = unit) {
  if (!currentUnit?.move) {
    return { continuedReplay: false };
  }

  const completedMove = currentUnit.move;
  const moveFromX = completedMove.fromX;
  const moveFromY = completedMove.fromY;

  if (completedMove.mode === "dismount") {
    applyUnitDismount(
      currentUnit,
      getCell(completedMove.toX, completedMove.toY),
      {
        updateSelectedAction: false,
        refreshPresentation: false,
        setLastStepFromOrigin: true,
      },
    );
  } else {
    currentUnit.x = completedMove.toX;
    currentUnit.y = completedMove.toY;
    updateUnitOccupancyEntry(currentUnit, moveFromX, moveFromY);
    currentUnit.facing = completedMove.direction || currentUnit.facing;
    currentUnit.lastStepFromX = moveFromX;
    currentUnit.lastStepFromY = moveFromY;
    const mountedVehicle = getMountedVehicle(currentUnit);

    if (mountedVehicle) {
      mountedVehicle.x = currentUnit.x;
      mountedVehicle.y = currentUnit.y;
    } else {
      maybeMountUnitAtCurrentCell(currentUnit);
    }
  }

  currentUnit.cargo = completedMove.cargoOnArrival ? { ...completedMove.cargoOnArrival } : null;
  const cargoVehicle = getVehicleById(completedMove.vehicleIdOnArrival);
  if (cargoVehicle && getVehicleCargoCapacity(cargoVehicle) > 0) {
    cargoVehicle.cargo = completedMove.vehicleCargoOnArrival
      ? { ...completedMove.vehicleCargoOnArrival }
      : null;
  }
  currentUnit.move = null;

  syncActiveUnit(currentUnit.id);
  refreshAfterWorldAndUnitTaskChange({ drawNow: false });

  if (isReplayPhase()) {
    startNextReplayEvent();
    return { continuedReplay: true };
  }

  maybeAutoAdvanceTurn();
  return { continuedReplay: false };
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
  let needsFullDraw = staticLayerDirty || staticUnitsLayerDirty;

  if (movingUnit?.move) {
    const progress = getUnitMoveProgress(movingUnit, now);

    if (progress >= 1) {
      const { continuedReplay } = completeUnitMove(movingUnit);
      needsFullDraw = true;

      if (continuedReplay) {
        return;
      }
    } else {
      needsAnotherFrame = true;
    }
  }

  if (needsFullDraw) {
    draw(now);
  } else {
    drawAnimatedFrame(now, { redrawInteraction: Boolean(movingUnit?.move) });
  }

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
      !currentUnit.move,
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

function drawUnitTargets(drawContext = ctx) {
  if (interactionMode !== interactionModes.play || !getSelectedUnit()) {
    return;
  }

  const style = getUnitTargetStyle();

  for (const cell of getUnitTargetCells()) {
    const screen = isoToScreen(cell.x, cell.y);
    drawDiamondPath(screen.x, screen.y, 0, drawContext);
    drawContext.fillStyle = style.fill;
    drawContext.fill();
    drawContext.strokeStyle = style.stroke;
    drawContext.lineWidth = Number.isFinite(style.lineWidth) ? style.lineWidth : 1.6;
    drawContext.stroke();
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
    const constructible = getPendingFoundationPlacement(currentUnit);

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

function drawRoundedRectPath(x, y, width, height, radius, drawContext = ctx) {
  const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));

  drawContext.beginPath();
  drawContext.moveTo(x + clampedRadius, y);
  drawContext.lineTo(x + width - clampedRadius, y);
  drawContext.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  drawContext.lineTo(x + width, y + height - clampedRadius);
  drawContext.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  drawContext.lineTo(x + clampedRadius, y + height);
  drawContext.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  drawContext.lineTo(x, y + clampedRadius);
  drawContext.quadraticCurveTo(x, y, x + clampedRadius, y);
  drawContext.closePath();
}

function drawBuildHouseCostHint(drawContext = ctx) {
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

  drawContext.save();
  drawContext.font = `${quantityFontSize}px "Oldania ADF Std", Georgia, serif`;
  drawContext.textAlign = "center";
  drawContext.textBaseline = "middle";
  const quantityMetrics = costStatus.entries.map((entry) => ({
    text: formatDisplayedQuantity(entry.required),
    color: entry.affordable ? "rgba(247, 231, 181, 0.96)" : "rgba(255, 126, 122, 0.98)",
    width: drawContext.measureText(formatDisplayedQuantity(entry.required)).width,
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
    Math.max(8, drawContext.canvas.width - boxWidth - 8),
  );
  const boxY = clamp(
    Math.round(screen.y - boxHeight - 5),
    8,
    Math.max(8, drawContext.canvas.height - boxHeight - 8),
  );
  const contentStartX = boxX + paddingX;
  const iconCenterY = boxY + paddingY + iconRowHeight / 2;
  const quantityY = boxY + paddingY + iconRowHeight + rowGap + quantityFontSize / 2;

  drawRoundedRectPath(boxX, boxY, boxWidth, boxHeight, Math.max(8, Math.round(10 * zoomLevels[zoomIndex])), drawContext);
  drawContext.fillStyle = "rgba(18, 17, 14, 0.88)";
  drawContext.fill();
  drawContext.strokeStyle = costStatus.affordable ? "rgba(244, 220, 149, 0.72)" : "rgba(236, 125, 118, 0.82)";
  drawContext.lineWidth = 1.4;
  drawContext.stroke();

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

      drawContext.drawImage(image, drawX, drawY, resolvedDrawWidth, resolvedDrawHeight);
      return;
    }

    if (fallbackText) {
      drawContext.save();
      drawContext.font = `${symbolFontSize}px "Oldania ADF Std", Georgia, serif`;
      drawContext.fillStyle = "rgba(247, 231, 181, 0.96)";
      drawContext.fillText(fallbackText, x + width / 2, y + height / 2);
      drawContext.restore();
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

  drawContext.save();
  drawContext.font = `${symbolFontSize}px "Oldania ADF Std", Georgia, serif`;
  drawContext.fillStyle = "rgba(247, 231, 181, 0.96)";
  drawContext.fillText("=", cursorX + symbolWidth / 2, iconCenterY);
  drawContext.fillText("+", cursorX + symbolWidth / 2 + symbolWidth + iconGap + resourceBlockWidth + iconGap + symbolWidth / 2, iconCenterY);
  drawContext.restore();

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
  drawContext.fillStyle = quantityMetrics[0].color;
  drawContext.fillText(quantityMetrics[0].text, firstResourceCenterX, quantityY);

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
  drawContext.fillStyle = quantityMetrics[1].color;
  drawContext.fillText(quantityMetrics[1].text, secondResourceCenterX, quantityY);

  drawContext.restore();
}

function drawInspectedPlayCellMarker(drawContext = ctx) {
  if (!isPlayTileInspectionActive()) {
    return;
  }

  const inspectedCell = getInspectedPlayCell();

  if (!inspectedCell) {
    return;
  }

  const screen = isoToScreen(inspectedCell.x, inspectedCell.y);

  drawContext.save();
  drawDiamondPath(screen.x, screen.y, 0, drawContext);
  drawContext.strokeStyle = "rgb(102, 171, 255)";
  drawContext.lineWidth = Math.max(2, 2.4 * zoomLevels[zoomIndex]);
  drawContext.stroke();
  drawContext.restore();
}

function getUnitMoveTaskLineTarget(currentUnit, selectedUnit = getSelectedUnit()) {
  if (!currentUnit) return null;

  const task = currentUnit.task;
  const isWalk = isTaskAction(task, unitActions.walk);
  const isSelectedCollection = currentUnit === selectedUnit && isGatherTask(task)
    && (task.phase === "deliver" || task.phase === "return");

  if (!isWalk && !isSelectedCollection) return null;

  const replaying = isReplayPhase();
  let target = replaying ? turnReplayMoveTargets.get(currentUnit.id) || null : null;

  if (!replaying) {
    if (isWalk) {
      target = task;
    } else {
      const toX = task.phase === "deliver" ? task.deliveryX : task.returnX;
      const toY = task.phase === "deliver" ? task.deliveryY : task.returnY;
      if (Number.isInteger(toX) && Number.isInteger(toY)) target = { toX, toY };
    }
  }

  return target && (target.toX !== currentUnit.x || target.toY !== currentUnit.y || currentUnit.move)
    ? target
    : null;
}

function drawUnitMoveTaskLines(now = performance.now(), drawContext = ctx) {
  if (interactionMode !== interactionModes.play) {
    return;
  }

  const selectedUnit = getSelectedUnit();
  const movingUnits = [];
  for (const currentUnit of getUnits()) {
    const moveTarget = getUnitMoveTaskLineTarget(currentUnit, selectedUnit);
    if (moveTarget) movingUnits.push({ currentUnit, moveTarget });
  }

  if (movingUnits.length === 0) {
    return;
  }

  drawContext.save();
  drawContext.setLineDash([8, 6]);
  drawContext.lineCap = "round";
  drawContext.lineJoin = "round";

  for (const { currentUnit, moveTarget } of movingUnits) {
    const fromScreen = getUnitScreenPosition(currentUnit, now);
    const destinationCell = getCell(moveTarget.toX, moveTarget.toY);

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

    drawContext.strokeStyle = "rgba(18, 22, 20, 0.45)";
    drawContext.lineWidth = Math.max(2.5, 3 * zoomLevels[zoomIndex]);
    drawContext.beginPath();
    drawContext.moveTo(fromGround.x, fromGround.y);
    drawContext.lineTo(toPoint.x, toPoint.y);
    drawContext.stroke();

    drawContext.strokeStyle = "rgba(239, 224, 170, 0.8)";
    drawContext.lineWidth = Math.max(1.2, 1.5 * zoomLevels[zoomIndex]);
    drawContext.beginPath();
    drawContext.moveTo(fromGround.x, fromGround.y);
    drawContext.lineTo(toPoint.x, toPoint.y);
    drawContext.stroke();
  }

  drawContext.restore();
}

function getSelectedUnitMarkerState() {
  const selectedUnit = getSelectedUnit();

  if (interactionMode !== interactionModes.play || !selectedUnit) return null;
  if (isReplayPhase() || getMovingUnit()?.move) return null;

  const screen = getUnitScreenPosition(selectedUnit);

  if (!screen) return null;

  const centerY = screen.y + tile.height * 0.66;
  const radiusX = tile.width * 0.34;
  const radiusY = tile.height * 0.132;
  const fillAlpha = 0.61;
  const lineWidth = Math.max(1.5, 2 * zoomLevels[zoomIndex]);

  return {
    screen,
    centerY,
    radiusX,
    radiusY,
    fillAlpha,
    lineWidth,
  };
}

function getSelectedUnitMarkerBounds(markerState) {
  if (!markerState) {
    return null;
  }

  const padding = Math.max(6, markerState.lineWidth * 2 + 2);

  return {
    x: Math.floor(markerState.screen.x - markerState.radiusX - padding),
    y: Math.floor(markerState.centerY - markerState.radiusY - padding),
    width: Math.ceil(markerState.radiusX * 2 + padding * 2),
    height: Math.ceil(markerState.radiusY * 2 + padding * 2),
  };
}

function mergeCanvasRects(firstRect, secondRect) {
  if (!firstRect) {
    return secondRect;
  }

  if (!secondRect) {
    return firstRect;
  }

  const minX = Math.min(firstRect.x, secondRect.x);
  const minY = Math.min(firstRect.y, secondRect.y);
  const maxX = Math.max(firstRect.x + firstRect.width, secondRect.x + secondRect.width);
  const maxY = Math.max(firstRect.y + firstRect.height, secondRect.y + secondRect.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function drawSelectedUnitMarker(markerState, drawContext) {
  if (!markerState) {
    return;
  }

  drawContext.save();
  drawContext.fillStyle = `rgba(68, 98, 178, ${markerState.fillAlpha})`;
  drawContext.beginPath();
  drawContext.ellipse(
    markerState.screen.x,
    markerState.centerY,
    markerState.radiusX,
    markerState.radiusY,
    0,
    0,
    Math.PI * 2,
  );
  drawContext.fill();

  drawContext.strokeStyle = "rgb(102, 171, 255)";
  drawContext.lineWidth = markerState.lineWidth;
  drawContext.beginPath();
  drawContext.ellipse(
    markerState.screen.x,
    markerState.centerY,
    markerState.radiusX,
    markerState.radiusY,
    0,
    0,
    Math.PI * 2,
  );
  drawContext.stroke();

  drawContext.restore();
}

function drawMovingUnit(now = performance.now(), drawContext = ctx) {
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

  let cargoForeground = null;
  if (movingUnit.move?.mode === "dismount" && dismountVehicleScreen) {
    const mountedVehicle = getMountedVehicle(movingUnit);

    if (mountedVehicle) {
      drawConstructibleForKind("vehicle", mountedVehicle, drawContext);
    } else {
      drawMountedVehicleAtScreen(dismountVehicleScreen, movingUnit, drawContext, { now });
    }
  } else {
    cargoForeground = drawMountedVehicleAtScreen(screen, movingUnit, drawContext, { now });
  }
  drawUnitAtScreen(
    screen,
    drawContext,
    imagePath,
    shouldMirrorUnitImage(imagePath, movingUnit),
    movingUnit,
  );
  drawMountedVehicleCargoForegroundAtScreen(screen, cargoForeground, drawContext);
}

function drawStationaryUnits(drawContext = ctx, frameIndex = 0) {
  const stationaryUnits = getStationaryUnits().slice().sort(compareUnitsByDrawOrder);

  for (const stationaryUnit of stationaryUnits) {
    const imagePath = getStationaryUnitImage(stationaryUnit, undefined, frameIndex);
    const screen = getStationaryUnitDrawScreenPosition(stationaryUnit, imagePath);

    if (!screen) {
      continue;
    }

    const cargoForeground = drawMountedVehicleAtScreen(screen, stationaryUnit, drawContext, { frameIndex });

    drawUnitAtScreen(
      screen,
      drawContext,
      imagePath,
      shouldMirrorUnitImage(imagePath, stationaryUnit),
      stationaryUnit,
    );
    drawMountedVehicleCargoForegroundAtScreen(screen, cargoForeground, drawContext);
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

  const mirrorX = shouldMirrorSpriteImage(imagePath, currentUnit, mountedVehicleSpriteConfig);
  const cargoOverlay = mountedVehicle.cargo?.amount > 0
    ? getConstructibleSpecForKind("vehicle", mountedVehicle.type)?.cargoOverlay
    : null;
  const cargoSpriteConfig = cargoOverlay ? {
    ...mountedVehicleSpriteConfig,
    offsetY: (mountedVehicleSpriteConfig.offsetY || 0) + cargoOverlay.mountedOffsetYAt100Zoom,
  } : null;
  if (cargoOverlay) {
    const overlayPath = cargoOverlay?.mountedByImage?.[imagePath];
    if (overlayPath && vehicleImages[overlayPath]?.complete) {
      drawSpriteAtScreen(
        screen,
        drawContext,
        overlayPath,
        vehicleImages,
        cargoSpriteConfig,
        mirrorX,
      );
    }
  }
  drawSpriteAtScreen(
    screen,
    drawContext,
    imagePath,
    vehicleImages,
    mountedVehicleSpriteConfig,
    mirrorX,
  );
  const foregroundPath = cargoOverlay?.mountedForegroundByImage?.[imagePath];
  return foregroundPath && vehicleImages[foregroundPath]?.complete
    ? { foregroundPath, spriteConfig: cargoSpriteConfig, mirrorX }
    : null;
}

function drawMountedVehicleCargoForegroundAtScreen(screen, foreground, drawContext = ctx) {
  if (!foreground) return;

  drawSpriteAtScreen(
    screen,
    drawContext,
    foreground.foregroundPath,
    vehicleImages,
    foreground.spriteConfig,
    foreground.mirrorX,
  );
}

function getGatherTaskProgressText(task) {
  if (task?.phase === "deliver") return "→";
  if (task?.phase === "return") return "←";
  const gatherDurationTurns = getGatherTaskDurationTurns();
  const completedTurns = clampInteger(
    gatherDurationTurns - clampInteger(task?.turnsRemaining, 0, gatherDurationTurns, gatherDurationTurns),
    0,
    gatherDurationTurns,
    0,
  );

  return `${completedTurns}/${gatherDurationTurns}`;
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

function resizeVisibleCanvasLayer(layerCanvas, layerContext, canvasSize, dpr) {
  layerCanvas.style.width = `${canvasSize.width}px`;
  layerCanvas.style.height = `${canvasSize.height}px`;
  layerCanvas.width = Math.round(canvasSize.width * dpr);
  layerCanvas.height = Math.round(canvasSize.height * dpr);
  layerContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setCanvasLayerVisible(layerCanvas, isVisible) {
  if (!layerCanvas) {
    return;
  }

  layerCanvas.classList.toggle("map-layer-hidden", !isVisible);
}

function layoutCanvas({ preserveCenter = false } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const center = preserveCenter ? getViewportCenterRatio() : null;

  applyZoom();

  const canvasSize = getCanvasSize();
  const mapPixelSize = getMapPixelSize();
  const leftInset = Math.max(canvasPadding, (canvasSize.width - mapPixelSize.width) / 2);
  const topInset = Math.max(canvasPadding, (canvasSize.height - mapPixelSize.height) / 2);

  if (canvasStack) {
    canvasStack.style.width = `${canvasSize.width}px`;
    canvasStack.style.height = `${canvasSize.height}px`;
  }

  resizeVisibleCanvasLayer(canvas, ctx, canvasSize, dpr);
  resizeVisibleCanvasLayer(interactionCanvas, interactionCtx, canvasSize, dpr);
  resizeVisibleCanvasLayer(selectionCanvas, selectionCtx, canvasSize, dpr);
  for (let index = 0; index < staticUnitsLayerCanvases.length; index += 1) {
    resizeVisibleCanvasLayer(
      staticUnitsLayerCanvases[index],
      staticUnitsLayerContexts[index],
      canvasSize,
      dpr,
    );
  }
  resizeVisibleCanvasLayer(actorsCanvas, actorsCtx, canvasSize, dpr);
  resizeVisibleCanvasLayer(overlayCanvas, overlayCtx, canvasSize, dpr);
  currentDpr = dpr;
  visibleStaticUnitsFrameIndex = null;
  interactionLayerHadContent = false;
  actorsLayerHadContent = false;
  overlayLayerHadContent = false;
  selectionRingBounds = null;

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

function drawDiamondPath(cx, cy, lift = 0, drawContext = ctx) {
  const halfW = tile.width / 2;
  const halfH = tile.height / 2;
  const topY = cy - lift;

  drawContext.beginPath();
  drawContext.moveTo(cx, topY);
  drawContext.lineTo(cx + halfW, topY + halfH);
  drawContext.lineTo(cx, topY + tile.height);
  drawContext.lineTo(cx - halfW, topY + halfH);
  drawContext.closePath();
}

function drawTileOverlays(cell) {
  if (!cell) {
    return;
  }

  const screen = isoToScreen(cell.x, cell.y);
  const lift = 0;

  drawCellResourceOverlay(cell, screen, lift);
  drawFogBorders(cell, screen, lift);
}

function drawVillageBoundary() {
  if (!isPlayMode()) {
    return;
  }

  const villageCells = getVillageVicinityCells();
  if (villageCells.size === 0) {
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "#5b2d86";
  ctx.lineWidth = Math.max(1.5, 3 * zoomLevels[zoomIndex]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const cell of villageCells.values()) {
    if (!isCellVisibleToPlayer(cell)) {
      continue;
    }

    for (const edge of getTileEdges(isoToScreen(cell.x, cell.y), 0)) {
      const neighbor = getEdgeNeighbor(cell, edge.direction);
      if (neighbor && (villageCells.has(createCellKey(neighbor.x, neighbor.y)) || !isCellVisibleToPlayer(neighbor))) {
        continue;
      }

      ctx.moveTo(edge.start.x, edge.start.y);
      ctx.lineTo(edge.end.x, edge.end.y);
    }
  }

  ctx.stroke();
  ctx.restore();
}

function recordTileHitArea(cell) {
  if (!cell) {
    return;
  }

  const screen = isoToScreen(cell.x, cell.y);
  const lift = 0;

  tileHitAreas.push({
    cell,
    points: [
      { x: screen.x, y: screen.y - lift },
      { x: screen.x + tile.width / 2, y: screen.y + tile.height / 2 - lift },
      { x: screen.x, y: screen.y + tile.height - lift },
      { x: screen.x - tile.width / 2, y: screen.y + tile.height / 2 - lift },
    ],
  });
}

function drawInteractiveTileOverlays(drawContext = ctx) {
  if (!isEditMode()) return;

  if (hoverCell) {
    drawTileOverlay(hoverCell, {
      fillStyle: "rgba(255, 239, 158, 0.28)",
      strokeStyle: "#ffe886",
      lineWidth: 2,
    }, drawContext);
  }

  if (activeCell) {
    drawTileOverlay(activeCell, {
      fillStyle: "rgba(215, 180, 91, 0.16)",
      strokeStyle: "#d7b45b",
      lineWidth: 2.5,
    }, drawContext);
  }
}

function drawTileOverlay(cell, style, drawContext = ctx) {
  if (!cell) return;

  const screen = isoToScreen(cell.x, cell.y);

  drawDiamondPath(screen.x, screen.y, 0, drawContext);
  drawContext.fillStyle = style.fillStyle;
  drawContext.fill();
  drawContext.strokeStyle = style.strokeStyle;
  drawContext.lineWidth = style.lineWidth;
  drawContext.stroke();
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function invalidateStaticLayer() {
  staticLayerDirty = true;
  villageVicinityCells = null;
}

function invalidateStaticUnitsLayer() {
  staticUnitsLayerDirty = true;
  visibleStaticUnitsFrameIndex = null;
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
  visibleStaticUnitsFrameIndex = null;
}

function clearCanvasContext(drawContext) {
  const targetCanvas = drawContext.canvas;

  drawContext.save();
  drawContext.setTransform(1, 0, 0, 1, 0, 0);
  drawContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  drawContext.restore();
}

function clearCanvasRect(drawContext, rect) {
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const dpr = currentDpr || 1;

  drawContext.save();
  drawContext.setTransform(1, 0, 0, 1, 0, 0);
  drawContext.clearRect(
    rect.x * dpr,
    rect.y * dpr,
    rect.width * dpr,
    rect.height * dpr,
  );
  drawContext.restore();
}

function renderStaticLayerToMain() {
  clearCanvasContext(ctx);
  tileHitAreas = [];
  const renderRows = isPlayMode() ? visibleCellsByRow : map.cells;

  for (const row of renderRows) {
    if (!Array.isArray(row)) {
      continue;
    }

    for (const cell of row) {
      drawTileTerrain(cell);
      recordTileHitArea(cell);
    }
  }

  drawPaths();

  for (const row of renderRows) {
    if (!Array.isArray(row)) {
      continue;
    }

    for (const cell of row) {
      drawTileOverlays(cell);
    }
  }

  drawVillageBoundary();
  drawVisibleConstructibles("building", buildings);
  drawVisibleConstructibles("vehicle", vehicles);
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

function syncVisibleStaticUnitsLayer(frameIndex = 0) {
  const normalizedFrameIndex =
    ((frameIndex % staticUnitsLayerCanvases.length) + staticUnitsLayerCanvases.length) %
    staticUnitsLayerCanvases.length;

  if (visibleStaticUnitsFrameIndex === normalizedFrameIndex) {
    return;
  }

  staticUnitsLayerCanvases.forEach((layerCanvas, index) => {
    setCanvasLayerVisible(layerCanvas, index === normalizedFrameIndex);
  });
  visibleStaticUnitsFrameIndex = normalizedFrameIndex;
}

function hasVisibleUnitMoveTaskLines() {
  if (interactionMode !== interactionModes.play) {
    return false;
  }

  const selectedUnit = getSelectedUnit();
  return getUnits().some((currentUnit) => Boolean(getUnitMoveTaskLineTarget(currentUnit, selectedUnit)));
}

function hasInteractionLayerContent() {
  if (interactionMode === interactionModes.edit) {
    return Boolean(hoverCell || activeCell);
  }

  if (interactionMode === interactionModes.play) {
    return Boolean(
      isPlayTileInspectionActive() ||
      getUnitTargetCells().length > 0 ||
      hasVisibleUnitMoveTaskLines(),
    );
  }

  return false;
}

function drawInteractionLayer(now = performance.now()) {
  const hasContent = hasInteractionLayerContent();

  if (!hasContent) {
    if (interactionLayerHadContent) {
      clearCanvasContext(interactionCtx);
      interactionLayerHadContent = false;
    }
    return;
  }

  clearCanvasContext(interactionCtx);

  if (interactionMode === interactionModes.edit) {
    drawInteractiveTileOverlays(interactionCtx);
  } else if (interactionMode === interactionModes.play) {
    drawInspectedPlayCellMarker(interactionCtx);
    drawUnitMoveTaskLines(now, interactionCtx);
    drawUnitTargets(interactionCtx);
  }

  interactionLayerHadContent = true;
}

function drawSelectionRingLayer() {
  const markerState = getSelectedUnitMarkerState();
  const nextBounds = getSelectedUnitMarkerBounds(markerState);
  const clearBounds = mergeCanvasRects(selectionRingBounds, nextBounds);

  if (clearBounds) {
    clearCanvasRect(selectionCtx, clearBounds);
  }

  if (!markerState) {
    selectionRingBounds = null;
    return;
  }

  drawSelectedUnitMarker(markerState, selectionCtx);
  selectionRingBounds = nextBounds;
}

function drawActorsLayer(now = performance.now()) {
  const hasContent = interactionMode === interactionModes.play && Boolean(getMovingUnit());

  if (!hasContent) {
    if (actorsLayerHadContent) {
      clearCanvasContext(actorsCtx);
      actorsLayerHadContent = false;
    }
    return;
  }

  clearCanvasContext(actorsCtx);
  drawMovingUnit(now, actorsCtx);
  actorsLayerHadContent = true;
}

function drawOverlayLayer() {
  const hasContent = canShowBuildHouseCostHint(playHoverCell);

  if (!hasContent) {
    if (overlayLayerHadContent) {
      clearCanvasContext(overlayCtx);
      overlayLayerHadContent = false;
    }
    return;
  }

  clearCanvasContext(overlayCtx);
  drawBuildHouseCostHint(overlayCtx);
  overlayLayerHadContent = true;
}

function drawAnimatedFrame(now = performance.now(), { redrawInteraction = false } = {}) {
  ensureStaticUnitsLayerSize();
  syncVisibleStaticUnitsLayer(
    interactionMode === interactionModes.play ? getWorkingUnitFrameIndex(now) : 0,
  );
  const selectedUnit = getSelectedUnit();
  const shouldRedrawSelectionRing = shouldAnimateSelectionMarker() || Boolean(selectedUnit?.move);

  if (redrawInteraction) {
    drawInteractionLayer(now);
  }

  if (shouldRedrawSelectionRing) {
    drawSelectionRingLayer();
  }

  drawActorsLayer(now);
}

function draw(now = performance.now()) {
  ensureStaticUnitsLayerSize();

  if (staticLayerDirty) {
    renderStaticLayerToMain();
  }

  if (staticUnitsLayerDirty) {
    renderStaticUnitsLayer();
  }

  syncVisibleStaticUnitsLayer(
    interactionMode === interactionModes.play ? getWorkingUnitFrameIndex(now) : 0,
  );
  drawInteractionLayer(now);
  drawSelectionRingLayer();
  drawActorsLayer(now);
  drawOverlayLayer();
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
  const rect = overlayCanvas.getBoundingClientRect();
  const point = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };

  for (let i = tileHitAreas.length - 1; i >= 0; i -= 1) {
    const candidate = tileHitAreas[i];
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
    currentUnit.staminaMax = getDefaultUnitStamina(currentUnit.unitType);
    currentUnit.stamina = clampNumber(currentUnit.stamina, 0, 999, currentUnit.staminaMax);
    currentUnit.cargo = normalizeUnitCargo(currentUnit.cargo, currentUnit);

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
    x: cell.x,
    y: cell.y,
    facing: "west",
    homeBuildingId: null,
    mountedVehicleId: null,
    staminaMax,
    stamina: staminaMax,
    cargo: null,
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

overlayCanvas.addEventListener("mousemove", (event) => {
  if (isPlayMode()) {
    handlePlayCanvasMove(event);
    return;
  }

  if (!isEditMode()) return;

  handleEditCanvasMove(event);
});

overlayCanvas.addEventListener("click", (event) => {
  const clickedCell = pickTile(event.clientX, event.clientY);

  if (isPlayMode()) {
    handlePlayModeClick(clickedCell);
    return;
  }

  if (!isEditMode()) return;

  handleEditCanvasClick(event, clickedCell);
});

overlayCanvas.addEventListener("contextmenu", (event) => {
  if (!isPlayMode() || event.button !== 2) return;

  event.preventDefault();
  closeUnitTileActionMenu();
  if (mainMenuOpen || isReplayPhase() || getMovingUnit() || (bookOverlay && !bookOverlay.hidden)) return;

  const selectedUnit = getSelectedUnit();
  const clickedCell = pickTile(event.clientX, event.clientY);
  if (!selectedUnit || !clickedCell) return;

  const options = getUnitTileActionOptions(selectedUnit, clickedCell);
  if (options.actions.length === 1 && options.actions[0].action === unitActions.walk && options.construction.length === 0) {
    queueUnitMoveTask(clickedCell, selectedUnit);
    return;
  }

  if (options.actions.length > 0 || options.construction.length > 0) {
    openUnitTileActionMenu(selectedUnit, clickedCell, event.clientX, event.clientY, options);
  }
});

overlayCanvas.addEventListener("mouseleave", () => {
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

function applyEditorSeasonSelection(season) {
  if (!activeCell) {
    return;
  }

  const previousSnapshot = JSON.stringify(serializeCell(activeCell));
  activeCell.season = normalizeCellSeason(season);
  applySeasonStateToCell(activeCell);
  refreshAfterEditorMutation({
    invalidateWorld: true,
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
    clearGeneratedCellFood(activeCell);
  } else {
    const definition = getFoodDefinition(foodType);

    if (!definition || definition.terrain !== activeCell.type || definition.terrain === "water") {
      return;
    }

    setGeneratedFoodResource(activeCell, foodType);
  }

  applySeasonStateToCell(activeCell);

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
    syncPathRenderableCellIndexForCell(activeCell);
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
  applySeasonStateToCell(activeCell);

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
  syncFoodResourceCellIndexForCell(activeCell);
  applySeasonStateToCell(activeCell);

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
    mapGenerationOverlay &&
    !mapGenerationOverlay.hidden &&
    !mapGenerationPanel.contains(event.target)
  ) {
    closeMapGenerationPanel();
    return;
  }

  if (
    unitTileActionMenu &&
    !unitTileActionMenu.hidden &&
    !unitTileActionMenu.contains(event.target)
  ) {
    closeUnitTileActionMenu();
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

  if (!activeCell || (editInspector && editInspector.contains(event.target)) || canvasStack?.contains(event.target)) {
    return;
  }

  hideTileMenu();
});

document.addEventListener("keydown", (event) => {
  if (situationMessageOverlay && !situationMessageOverlay.hidden) {
    if (event.key === "Tab") {
      event.preventDefault();
      acknowledgeSituationMessageButton?.focus({ preventScroll: true });
    } else if (event.key === "Escape") {
      event.preventDefault();
    }
    return;
  }

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

  if (mapGenerationOverlay && !mapGenerationOverlay.hidden) {
    closeMapGenerationPanel({ restoreFocus: true });
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

  if (unitTileActionMenu && !unitTileActionMenu.hidden) {
    closeUnitTileActionMenu();
    overlayCanvas.focus({ preventScroll: true });
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

  if (techWidget && bookOverlay && !bookOverlay.hidden && !bookOverlayRestoreState) {
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
      await activateMode(interactionModes.play);
    });
    return;
  }

  if (action === "start-new-game") {
    openMapGenerationPanel({
      targetMode: interactionModes.play,
      returnFocusButton: button,
    });
    return;
  }

  if (action === "quick-start") {
    void runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      startNewGeneratedState(
        interactionModes.play,
        buildGeneratedMapCells,
        defaultMapGenerationSettings,
        defaultMapGenerationSize,
      );
    });
    return;
  }

  if (action === "load-game") {
    loadState(interactionModes.play);
    return;
  }

  if (action === "open-book") {
    void runMainMenuLoadingAction(() => openBookFromMainMenu(button));
    return;
  }

  if (action === "import-export") {
    openSaveSlotPanel("export", { targetMode: interactionMode || interactionModes.play });
    return;
  }

  if (action === "edit") {
    void runMainMenuLoadingAction(async () => {
      await ensureVisualAssetsLoaded();
      await activateMode(interactionModes.edit);
    });
  }
});

firstVisitIntroYesButton?.addEventListener("click", () => answerFirstVisitIntro(true));
firstVisitIntroNoButton?.addEventListener("click", () => answerFirstVisitIntro(false));
firstVisitIntroDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  answerFirstVisitIntro(false);
});

for (const button of gameMenuToggleButtons) {
  button.addEventListener("click", () => {
    toggleGameActionMenu(button);
  });
}

for (const button of newRandomMapButtons) {
  button.addEventListener("click", () => {
    if (!isEditMode()) return;

    const returnFocusButton = activeGameMenuButton || button;
    closeGameActionMenu();
    openMapGenerationPanel({
      targetMode: interactionModes.edit,
      returnFocusButton,
      generationKind: "random",
    });
  });
}

for (const button of newEmptyMapButtons) {
  button.addEventListener("click", () => {
    if (!isEditMode()) return;

    const returnFocusButton = activeGameMenuButton || button;
    closeGameActionMenu();
    openMapGenerationPanel({
      targetMode: interactionModes.edit,
      returnFocusButton,
      generationKind: "empty",
    });
  });
}

for (const button of nextTurnButtons) {
  button.addEventListener("click", () => {
    advanceTurn({ userInitiated: true });
  });
}

for (const button of nextUnitButtons) {
  button.addEventListener("click", () => {
    if (isReplayPhase()) return;
    selectNextIdleUnit({
      scrollIntoView: true,
    });
  });
}

for (const button of centerUnitOnMapButtons) {
  button.addEventListener("click", () => {
    const currentUnit = getSelectedUnit() || unit;

    if (!currentUnit) {
      return;
    }

    centerViewportOnUnit(currentUnit);
  });
}

for (const button of unitBookPageButtons) {
  button.addEventListener("click", async () => {
    const pageId = button.dataset.bookPageId || "";

    if (!pageId) {
      return;
    }

    await openBookOverlayPanel(button);

    if (!pageId || (bookOverlay && bookOverlay.hidden)) {
      return;
    }

    if (!jumpBookToPageId(pageId)) {
      updateUnitReadout();
    }
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
      selectedUnitAction = null;
      pendingFoundationPlacement = null;
      updateUnitActionControls();
      draw();
      return;
    }

    selectedUnitAction = action;
    pendingFoundationPlacement = null;
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

if (unitTileActionMenu) {
  unitTileActionMenu.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    const target = unitTileActionTarget;
    if (!button || !target || button.disabled) return;

    if (button.dataset.toggleConstruction) {
      const submenu = unitTileActionMenu.querySelector(".unit-tile-action-submenu");
      submenu.hidden = !submenu.hidden;
      button.setAttribute("aria-expanded", submenu.hidden ? "false" : "true");
      positionUnitTileActionMenu(target.clientX, target.clientY);
      if (!submenu.hidden) submenu.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }

    const currentUnit = getSelectedUnit();
    const cell = getCell(target.x, target.y);
    const option = button.dataset.constructionIndex !== undefined
      ? target.options.construction[Number(button.dataset.constructionIndex)]
      : target.options.actions[Number(button.dataset.contextIndex)];
    closeUnitTileActionMenu();
    if (!currentUnit || currentUnit.id !== target.unitId || !cell || !option ||
      currentUnit.move || isReplayPhase()) return;
    queueUnitTileAction(option, currentUnit, cell);
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

acknowledgeSituationMessageButton?.addEventListener("click", acknowledgeSituationMessage);

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
    void saveState(interactionMode);
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

for (const button of closeMapGenerationButtons) {
  button.addEventListener("click", () => {
    closeMapGenerationPanel({ restoreFocus: true });
  });
}

for (const button of confirmMapGenerationButtons) {
  button.addEventListener("click", () => {
    void commitMapGenerationPanel();
  });
}

for (const input of mapGenerationSizePresetInputs) {
  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }

    const preset = mapGenerationSizePresets[input.value];

    if (!preset) {
      return;
    }

    syncMapGenerationSizeInputs(preset);
  });
}

for (const input of [
  mapGenerationWidthInput,
  mapGenerationHeightInput,
].filter(Boolean)) {
  input.addEventListener("change", () => {
    syncMapGenerationSizeInputs(getMapGenerationSizeFromInputs());
  });
}

for (const input of [
  mapGenerationWaterInput,
  mapGenerationForestInput,
  mapGenerationMountainInput,
  mapGenerationFoodInput,
].filter(Boolean)) {
  input.addEventListener("input", () => {
    updateMapGenerationPanelValueReadouts();
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

for (const button of deleteSlotPanelButtons) {
  button.addEventListener("click", () => {
    void deleteSaveFile(saveSlotInput?.value || slotPanelState?.value || "");
  });
}

saveSlotInput?.addEventListener("input", () => {
  if (!slotPanelState) return;

  slotPanelState.value = sanitizeFileName(saveSlotInput.value);
  void renderSaveSlotList();
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
  const entries = [];
  for (const item of saveSlotList.querySelectorAll(".slot-panel-item")) {
    const itemName = item.dataset.slotName || "";
    const isSelected = itemName === slotName;
    entries.push({ name: itemName });
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
  }
  updateSaveSlotPanelActionStates(entries);
});

for (const button of turnAutoToggleButtons) {
  button.addEventListener("click", () => {
    autoAdvanceTurns = !autoAdvanceTurns;
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
  offerFirstVisitIntro();
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
  prepareFirstVisitIntro();
}

void initializeApp().catch((error) => {
  console.error("Failed to initialize app.", error);
});
