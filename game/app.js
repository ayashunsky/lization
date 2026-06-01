const canvas = document.querySelector("#mapCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.querySelector(".viewport");
const appShell = document.querySelector(".app-shell");
const topBarsContainer = document.querySelector(".top-bars");
const mainMenuOverlay = document.querySelector("#mainMenuOverlay");
const playInspector = document.querySelector("#playInspector");
const bookOverlay = document.querySelector("#bookOverlay");
const unitActionBar = document.querySelector("#unitActionBar");
const gameActionMenu = document.querySelector("#gameActionMenu");
const saveSlotOverlay = document.querySelector("#saveSlotOverlay");
const saveSlotPanel = document.querySelector("#saveSlotPanel");
const saveSlotTitle = document.querySelector("#saveSlotTitle");
const saveSlotInput = document.querySelector("#saveSlotInput");
const saveSlotList = document.querySelector("#saveSlotList");
const saveSlotEmpty = document.querySelector("#saveSlotEmpty");
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

const zoomLevels = [0.5, 1, 2];
const interactionModes = {
  edit: "edit",
  play: "play",
};
const unitActions = {
  walk: "walk",
  play: "play",
  gatherFood: "gatherFood",
  gatherMaterials: "gatherMaterials",
  buildHouse: "buildHouse",
  demolish: "demolish",
};
const unitSprite = {
  idleImage: "assets/units/unit_sprite.png",
  northImage: "assets/units/unit_back_sprite.png",
  southImage: "assets/units/unit_front_sprite.png",
  workFrames: [
    "assets/units/unit_work_sprite.png",
    "assets/units/unit_work_sprite_1.png",
  ],
  landFoodFrames: [
    "assets/units/unit_food_sprite.png",
    "assets/units/unit_food_sprite_1.png",
  ],
  lumberFrames: [
    "assets/units/unit_lumber_sprite.png",
    "assets/units/unit_lumber_sprite_1.png",
  ],
  stoneFrames: [
    "assets/units/unit_stone_sprite.png",
    "assets/units/unit_stone_sprite_1.png",
  ],
  northEastFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  eastFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  southEastFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  southFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  southWestFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  westFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  northWestFishingFrames: [
    "assets/units/unit_fishing_sprite.png",
  ],
  northFishingFrames: [
    "assets/units/unit_fishing_north_sprite.png",
    "assets/units/unit_fishing_north_sprite_1.png",
  ],
  playFrames: [
    "assets/units/unit_play_sprite.png",
    "assets/units/unit_play_sprite_1.png",
  ],
  workFrameDuration: 180,
  northMoveFrames: [
    "assets/units/unit_back_step_sprite.png",
    "assets/units/unit_back_step_sprite_2.png",
  ],
  southMoveFrames: [
    "assets/units/unit_front_step_sprite.png",
    "assets/units/unit_front_step_sprite_2.png",
  ],
  moveFrames: ["assets/units/unit_sprite.png", "assets/units/unit_step_sprite.png"],
  moveFrameSequence: [0, 1, 0, 1, 0, 1, 0, 1, 0],
  width: 36,
  height: 44,
  anchorX: 18,
  anchorY: 44,
  fishingDirections: {
    north: {
      frameSet: "northFishingFrames",
      mirror: false,
    },
    northEast: {
      frameSet: "northEastFishingFrames",
      mirror: false,
    },
    east: {
      frameSet: "eastFishingFrames",
      mirror: false,
    },
    southEast: {
      frameSet: "southEastFishingFrames",
      mirror: false,
    },
    south: {
      frameSet: "southFishingFrames",
      mirror: false,
    },
    southWest: {
      frameSet: "southWestFishingFrames",
      mirror: true,
    },
    west: {
      frameSet: "westFishingFrames",
      mirror: true,
    },
    northWest: {
      frameSet: "northWestFishingFrames",
      mirror: true,
    },
  },
  groundOffset: 0.75,
  moveDuration: 720,
};

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

const buildingCatalog = {
  house: {
    subtypes: [
      { id: "house_01", image: "assets/buildings/house_01.png" },
      { id: "house_02", image: "assets/buildings/house_02.png" },
      { id: "house_03", image: "assets/buildings/house_03.png" },
      { id: "house_04", image: "assets/buildings/house_04.png" },
    ],
    abandonedImage: "assets/buildings/house_abandoned.png",
    constructionImages: {
      initial: "assets/buildings/house_construct.png",
      half: "assets/buildings/house_half.png",
    },
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
let activeCell = null;
let drawList = [];
let didCenterInitialView = false;
let zoomIndex = 1;
let interactionMode = null;
let mainMenuOpen = true;
let units = [];
let unit = null;
let buildings = [];
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
let turnReplayMoveTargets = new Map();
let selectedUnitAction = unitActions.walk;
let inspectedPlayCell = null;
let stockpile = { stone: 0, lumber: 0, food: 0 };
let foodShortageTurns = 0;
let situationMessages = [];
let situationMessageVisible = false;
let situationMessageViewIndex = -1;
let situationMessageTypingTimeoutId = 0;
let situationMessageTypingToken = 0;
let bookOverlayTriggerButton = null;
let activeGameMenuButton = null;
let slotPanelState = null;
const tileImages = {};
const buildingImages = {};
const shoreOverlayImages = {};
const resourceOverlayImages = {};
const resourceIconImages = {};
const unitImages = {};
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
const defaultAudioSettings = {
  musicEnabled: true,
  volume: 0.55,
};
let audioSettings = loadAudioSettings();

backgroundMusic.loop = true;
backgroundMusic.preload = "auto";
backgroundMusic.volume = audioSettings.volume;

const julianTurnEpochJdn = getJulianDayNumber(
  julianTurnEpoch.year,
  julianTurnEpoch.month,
  julianTurnEpoch.day,
);

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

function setCheckedState(elements, checked) {
  for (const element of elements) {
    element.checked = checked;
  }
}

function setAttributeForElements(elements, name, value) {
  for (const element of elements) {
    element.setAttribute(name, value);
  }
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
  return isPlayMode() && !mainMenuOpen && audioSettings.musicEnabled;
}

async function syncBackgroundMusicPlayback() {
  backgroundMusic.volume = audioSettings.volume;

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

function normalizeUnitAction(action) {
  return Object.values(unitActions).includes(action) ? action : unitActions.walk;
}

function normalizePendingUnitAction(action) {
  return Object.values(unitActions).includes(action) ? action : null;
}

function isCellTargetUnitAction(action) {
  return (
    action === unitActions.walk ||
    action === unitActions.gatherFood ||
    action === unitActions.gatherMaterials ||
    action === unitActions.buildHouse ||
    action === unitActions.demolish
  );
}

function getUnitActionLabel(action) {
  if (action === unitActions.play) {
    return strings.actions.play;
  }

  if (action === unitActions.gatherFood) {
    return strings.actions.gatherFood;
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
  setTextContent([variantMenuTitle], strings.menu.visual);
  setAttributeForElements(languageSelectorGroups, "aria-label", strings.language.selectorLabel);
  setAttributeForElements(zoomControlGroups, "aria-label", strings.aria.zoomControls);
  setAttributeForElements(zoomOutButtons, "aria-label", strings.aria.zoomOut);
  setAttributeForElements(zoomInButtons, "aria-label", strings.aria.zoomIn);
  setAttributeForElements(musicEnabledInputs, "aria-label", strings.aria.musicToggle);
  setAttributeForElements(musicVolumeInputs, "aria-label", strings.aria.musicVolume);
  setAttributeForElements(musicEnabledInputs, "title", strings.aria.musicToggle);
  setAttributeForElements(musicVolumeInputs, "title", strings.aria.musicVolume);
  setAttributeForElements(nextUnitButtons, "aria-label", strings.actions.nextUnit);
  setAttributeForElements(nextUnitButtons, "title", strings.actions.nextUnit);
  setAttributeForElements(cancelUnitTaskButtons, "aria-label", strings.actions.cancel);
  setAttributeForElements(cancelUnitTaskButtons, "title", strings.actions.cancel);
  setAttributeForElements(openBookOverlayButtons, "aria-label", strings.actions.openBook);
  setAttributeForElements(openBookOverlayButtons, "title", strings.actions.openBook);
  setAttributeForElements(closeBookOverlayButtons, "aria-label", strings.actions.closeBook);
  setAttributeForElements(closeBookOverlayButtons, "title", strings.actions.closeBook);
  setAttributeForElements(previousSituationMessageButtons, "aria-label", strings.actions.previousMessage);
  setAttributeForElements(previousSituationMessageButtons, "title", strings.actions.previousMessage);
  setAttributeForElements(nextSituationMessageButtons, "aria-label", strings.actions.nextMessage);
  setAttributeForElements(nextSituationMessageButtons, "title", strings.actions.nextMessage);

  for (const button of unitActionButtons) {
    const action = normalizeUnitAction(button.dataset.unitAction);
    const label = getUnitActionLabel(action);

    button.setAttribute("aria-label", label);
    button.title = label;
  }

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
  const capacity = getResourceStorageCapacity();
  const stoneAmount = getCurrentStockpileAmount("stone");
  const lumberAmount = getCurrentStockpileAmount("lumber");
  const foodAmount = getCurrentStockpileAmount("food");
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

  setTextContent(resourceStoneCaptions, `${stoneAmount}/${capacity}`);
  setTextContent(resourceLumberCaptions, `${lumberAmount}/${capacity}`);
  setTextContent(
    resourceFoodCaptions,
    foodShortageTurns > 0
      ? `${foodShortageTurns}/${shortageThreshold}`
      : `${foodAmount}/${capacity}`,
  );
}

function getPathCompletionPercent(cell) {
  return clampInteger(
    Math.round((getCellVisitsCount(cell) / getPathWellKnownVisitsThreshold()) * 100),
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
  const materialType = getCellMaterialResourceType(cell);
  const pathProgressEligible = cell.type === "grass" && getCellVisitsCount(cell) >= getPathPreviewVisitsThreshold();

  if (building) {
    const completeness = Math.round(getBuildingCompleteness(building) * 100);
    entries.push({
      kind: "building",
      cell,
      building,
      label: completeness >= 100 ? "" : `${completeness}%`,
    });
  } else if (hasFoodResource(cell)) {
    entries.push({
      kind: "food",
      cell,
      label: `${Math.max(0, Math.floor(cell.foodAmount))}/${getFoodTypeMaxAmount(cell.foodType)}`,
    });
  }

  if (materialType) {
    entries.push({
      kind: "material",
      cell,
      materialType,
      label: `${Math.max(0, Math.floor(cell.materialAmount))}/${getMaterialAmountForTerrain(cell.type)}`,
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

function drawInspectorBuildingOverlay(context, building) {
  if (!context || !building) {
    return;
  }

  const visual = getBuildingVisual(building);
  const image = visual?.image ? buildingImages[visual.image] : null;

  if (!image?.complete || image.naturalWidth <= 0) {
    return;
  }

  context.save();
  context.globalAlpha = visual.alpha ?? 1;
  context.drawImage(
    image,
    0,
    -baseTile.height * 0.32 + baseTile.height * (visual.yOffsetFactor || 0),
    baseTile.width,
    baseTile.height + baseTile.edge,
  );
  context.restore();
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
    entry.kind === "building"
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

function getDefaultUnitStamina() {
  return Math.max(1, clampInteger(rules.units?.default?.stamina, 1, 999, 2));
}

function getDefaultUnitName() {
  const localized = typeof strings.units?.defaultName === "string" ? strings.units.defaultName.trim() : "";
  const configured = typeof rules.units?.default?.name === "string" ? rules.units.default.name.trim() : "";
  return localized || configured || "Schtroumpf";
}

function normalizeUnitName(name) {
  const normalized = typeof name === "string" ? name.trim() : "";
  return normalized || getDefaultUnitName();
}

function getUnitHomeBuildingId(currentUnit) {
  return typeof currentUnit?.homeBuildingId === "string" && currentUnit.homeBuildingId
    ? currentUnit.homeBuildingId
    : null;
}

function getUnitMaxStamina(currentUnit = unit) {
  return Math.max(1, clampInteger(currentUnit?.staminaMax, 1, 999, getDefaultUnitStamina()));
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

function getCellVisitsCount(cell) {
  if (!cell || cell.type !== "grass") {
    return 0;
  }

  return Math.max(0, clampInteger(cell.visitsCount, 0, getPathWellKnownVisitsThreshold(), 0));
}

function isWellKnownPathCell(cell) {
  return Boolean(cell) && cell.type === "grass" && getCellVisitsCount(cell) >= getPathWellKnownVisitsThreshold();
}

function isPreviewPathCell(cell) {
  return Boolean(cell) && cell.type === "grass" && getCellVisitsCount(cell) >= getPathPreviewVisitsThreshold();
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

function getUnitWorkPointsPerTurn(taskType) {
  const configured = Number(rules.units?.default?.workPointsPerTurn?.[taskType]);

  if (!Number.isFinite(configured)) {
    return 0;
  }

  return Math.max(0, configured);
}

function getGatherTaskDurationTurns() {
  const configured = Number(rules.resources?.gathering?.durationTurns);

  if (!Number.isFinite(configured)) {
    return 3;
  }

  return Math.max(1, Math.floor(configured));
}

function getUnitFoodConsumptionPerTurn(currentUnit = unit) {
  const configured = Number(rules.units?.default?.foodConsumptionPerTurn);

  if (!Number.isFinite(configured)) {
    return 1;
  }

  return Math.max(0, configured);
}

function createEmptyStockpile() {
  const initial = rules.resources?.stockpile?.initial || {};

  return {
    stone: Math.max(0, clampInteger(initial.stone, 0, 999999, 0)),
    lumber: Math.max(0, clampInteger(initial.lumber, 0, 999999, 0)),
    food: Math.max(0, clampInteger(initial.food, 0, 999999, 0)),
  };
}

function getMaterialAmountForTerrain(type) {
  if (type === "mountain") {
    return Math.max(0, clampInteger(rules.resources?.materials?.mountainStonePerTile, 0, 999999, 260));
  }

  if (type === "forest") {
    return Math.max(0, clampInteger(rules.resources?.materials?.forestLumberPerTile, 0, 999999, 220));
  }

  return 0;
}

function getResourceStorageCapacity() {
  const capacityPerHouse = Math.max(
    0,
    clampInteger(rules.resources?.stockpile?.capacityPerHouse, 0, 999999, 120),
  );
  const houseCount = buildings.filter((building) => building?.type === "house" && building.state !== "construction").length;

  return capacityPerHouse * houseCount;
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

function getHouseBuildCost(type = "house") {
  const buildCost = getBuildingRules(type)?.buildCost || {};

  return {
    stone: Math.max(0, clampInteger(buildCost.stone, 0, 999999, 20)),
    lumber: Math.max(0, clampInteger(buildCost.lumber, 0, 999999, 30)),
  };
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
  return Boolean(cell?.foodType) && getFoodTypeMaxAmount(cell.foodType) > 0 && cell.foodAmount > 0;
}

function hasMaterialResource(cell) {
  return Boolean(getCellMaterialResourceType(cell));
}

function getCurrentStockpileAmount(resourceType) {
  return Math.max(0, clampInteger(stockpile?.[resourceType], 0, 999999, 0));
}

function addToStockpile(resourceType, amount) {
  const normalizedAmount = Math.max(0, Math.floor(amount));
  const capacity = getResourceStorageCapacity();
  const currentAmount = getCurrentStockpileAmount(resourceType);
  const nextAmount = clamp(currentAmount + normalizedAmount, 0, capacity);
  const stored = nextAmount - currentAmount;

  stockpile[resourceType] = nextAmount;
  return stored;
}

function clampStockpileToCapacity() {
  const capacity = getResourceStorageCapacity();

  stockpile.stone = clamp(getCurrentStockpileAmount("stone"), 0, capacity);
  stockpile.lumber = clamp(getCurrentStockpileAmount("lumber"), 0, capacity);
  stockpile.food = clamp(getCurrentStockpileAmount("food"), 0, capacity);
}

function spendFromStockpile(resourceType, amount) {
  const normalizedAmount = Math.max(0, Math.floor(amount));
  const currentAmount = getCurrentStockpileAmount(resourceType);

  if (currentAmount < normalizedAmount) {
    return false;
  }

  stockpile[resourceType] = currentAmount - normalizedAmount;
  return true;
}

function canAffordHouseConstruction(type = "house") {
  const buildCost = getHouseBuildCost(type);

  return (
    getCurrentStockpileAmount("stone") >= buildCost.stone &&
    getCurrentStockpileAmount("lumber") >= buildCost.lumber
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

function createUnitId(items = units) {
  let maxIndex = 0;

  for (const currentUnit of items) {
    const match = /^unit_(\d+)$/.exec(currentUnit?.id || "");

    if (!match) continue;
    maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10) || 0);
  }

  return `unit_${String(maxIndex + 1).padStart(2, "0")}`;
}

function getBuildingRules(type) {
  return rules.buildings?.[type] || null;
}

function getBuildingSpec(type) {
  return buildingCatalog[type] || null;
}

function getBuildingSubtypeVariants(type) {
  return getBuildingSpec(type)?.subtypes || [];
}

function chooseBuildingSubtype(type) {
  const variants = getBuildingSubtypeVariants(type);

  if (variants.length === 0) return null;

  const index = Math.floor(Math.random() * variants.length);
  return variants[index].id;
}

function getDefaultBuildingWidth() {
  return Math.max(1, clampInteger(rules.buildings?.default?.width, 1, 16, 1));
}

function getDefaultBuildingHeight() {
  return Math.max(1, clampInteger(rules.buildings?.default?.height, 1, 16, 1));
}

function getBuildingCompleteness(building) {
  const completeness = Number(building?.completeness);

  if (!Number.isFinite(completeness)) {
    return 1;
  }

  return clamp(completeness, 0, 1);
}

function getBuildingConstructionCost(type) {
  return Math.max(1, clampInteger(getBuildingRules(type)?.constructionCost, 1, 999999, 100));
}

function isBuildingWalkable(type) {
  return Boolean(getBuildingRules(type)?.walkable);
}

function getBuildingAbandonedDecay(type) {
  const decay = Number(getBuildingRules(type)?.abandonedDecayPerTurn);

  if (!Number.isFinite(decay)) {
    return 0;
  }

  return clamp(decay, 0, 1);
}

function getBuildingConstructionThresholds(type) {
  const thresholds = getBuildingRules(type)?.constructionVisualThresholds || {};
  const initialValue = Number(thresholds.initialMax);
  const halfValue = Number(thresholds.halfMax);
  const initialMax = Number.isFinite(initialValue) ? clamp(initialValue, 0, 1) : 0.34;
  const halfMax = Number.isFinite(halfValue) ? clamp(halfValue, initialMax, 1) : 0.79;

  return {
    initialMax,
    halfMax,
  };
}

function getBuildingWorkCompletenessDelta(taskType, buildingType) {
  const workPoints = getUnitWorkPointsPerTurn(taskType);
  const cost = getBuildingConstructionCost(buildingType);

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

function closeBookOverlay({ restoreFocus = false } = {}) {
  if (bookOverlay) {
    bookOverlay.hidden = true;
  }

  if (restoreFocus && bookOverlayTriggerButton) {
    bookOverlayTriggerButton.focus({ preventScroll: true });
  }

  bookOverlayTriggerButton = null;
}

function openBookOverlayPanel(triggerButton = null) {
  if (!bookOverlay || !isPlayMode() || mainMenuOpen) {
    return;
  }

  closeGameActionMenu();
  closeSaveSlotPanel();
  hideTileMenu();
  bookOverlayTriggerButton = triggerButton;
  bookOverlay.hidden = false;
  bookOverlay.querySelector('[data-action="close-book-overlay"]')?.focus({ preventScroll: true });
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

function clampInteger(value, min, max, fallback = min) {
  const number = Number.parseInt(value, 10);

  if (!Number.isFinite(number)) return fallback;
  return clamp(number, min, max);
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number.parseFloat(value);

  if (!Number.isFinite(number)) return fallback;
  return clamp(number, min, max);
}

function serializeCell(cell) {
  return {
    type: cell.type,
    variant: ensureCellVariant(cell),
    visited: Boolean(cell.visited),
    visitsCount: Math.max(0, clampInteger(cell.visitsCount, 0, getPathWellKnownVisitsThreshold(), 0)),
    materialAmount: Math.max(0, clampInteger(cell.materialAmount, 0, 999999, 0)),
    foodType: typeof cell.foodType === "string" && cell.foodType ? cell.foodType : null,
    foodAmount: Math.max(0, clampInteger(cell.foodAmount, 0, 999999, 0)),
  };
}

function serializeBuilding(building, width = map.width, height = map.height) {
  if (!building) return null;

  return {
    id: building.id || "building_01",
    type: building.type,
    subtype: building.subtype,
    x: clampInteger(building.x, 0, width - 1, 0),
    y: clampInteger(building.y, 0, height - 1, 0),
    width: Math.max(1, clampInteger(building.width, 1, width, getDefaultBuildingWidth())),
    height: Math.max(1, clampInteger(building.height, 1, height, getDefaultBuildingHeight())),
    state: building.state || "complete",
    walkable: Boolean(building.walkable),
    completeness: getBuildingCompleteness(building),
    constructionCost: getBuildingConstructionCost(building.type),
  };
}

function serializeTask(task) {
  if (!task) return null;

  if (![ "move", "perform", "gatherFood", "gatherMaterials", "buildHouse", "demolish" ].includes(task.type)) {
    return null;
  }

  if (task.type === "perform") {
    return { type: task.type };
  }

  if (task.type === "gatherFood" || task.type === "gatherMaterials") {
    return {
      type: task.type,
      toX: clampInteger(task.toX, 0, map.width - 1, 0),
      toY: clampInteger(task.toY, 0, map.height - 1, 0),
      turnsRemaining: clampInteger(task.turnsRemaining, 1, getGatherTaskDurationTurns(), getGatherTaskDurationTurns()),
    };
  }

  return {
    type: task.type,
    toX: clampInteger(task.toX, 0, map.width - 1, 0),
    toY: clampInteger(task.toY, 0, map.height - 1, 0),
  };
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

function serializeUnit(currentUnit) {
  if (!currentUnit) return null;

  if (currentUnit.move) {
    const didReachDestination =
      currentUnit.task?.type === "move" &&
      currentUnit.task.toX === currentUnit.move.toX &&
      currentUnit.task.toY === currentUnit.move.toY;

    return {
      id: currentUnit.id || "unit_01",
      name: normalizeUnitName(currentUnit.name),
      x: currentUnit.move.toX,
      y: currentUnit.move.toY,
      facing: currentUnit.move.direction || currentUnit.facing || "west",
      homeBuildingId: getUnitHomeBuildingId(currentUnit),
      staminaMax: getUnitMaxStamina(currentUnit),
      stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
      task: didReachDestination ? null : serializeTask(currentUnit.task),
    };
  }

  return {
    id: currentUnit.id || "unit_01",
    name: normalizeUnitName(currentUnit.name),
    x: currentUnit.x,
    y: currentUnit.y,
    facing: currentUnit.facing || "west",
    homeBuildingId: getUnitHomeBuildingId(currentUnit),
    staminaMax: getUnitMaxStamina(currentUnit),
    stamina: clampNumber(getUnitStamina(currentUnit), 0, 999, getUnitMaxStamina(currentUnit)),
    task: serializeTask(currentUnit.task),
  };
}

function serializeCells(cells = map.cells) {
  return cells.map((row) => row.map((cell) => serializeCell(cell)));
}

function serializeBuildings(items = buildings, width = map.width, height = map.height) {
  return items.map((building) => serializeBuilding(building, width, height)).filter(Boolean);
}

function serializeCurrentState() {
  return {
    version: saveVersion,
    map: {
      width: map.width,
      height: map.height,
      cells: serializeCells(),
    },
    buildings: serializeBuildings(),
    units: getUnits().map((currentUnit) => serializeUnit(currentUnit)).filter(Boolean),
    stockpile: serializeStockpileState(),
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

function canEnterUnoccupiedCell(cell) {
  return Boolean(cell) && cell.type !== "water";
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

function createDefaultUnitState(cells, width, height) {
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
          name: getDefaultUnitName(),
          x: spawn.x,
          y: spawn.y,
          facing: "west",
          homeBuildingId: null,
          staminaMax: getDefaultUnitStamina(),
          stamina: getDefaultUnitStamina(),
          task: null,
          turnRoute: null,
        }
    : null;
}

function createBuildingId() {
  let maxIndex = 0;

  for (const building of buildings) {
    const match = /^building_(\d+)$/.exec(building?.id || "");

    if (!match) continue;
    maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10) || 0);
  }

  return `building_${String(maxIndex + 1).padStart(2, "0")}`;
}

function createHouseConstructionAtCell(cell) {
  if (!canStartNewHouseConstructionOnCell(cell)) return null;

  const buildCost = getHouseBuildCost("house");

  if (!spendFromStockpile("stone", buildCost.stone) || !spendFromStockpile("lumber", buildCost.lumber)) {
    return null;
  }

  const building = {
    id: createBuildingId(),
    type: "house",
    subtype: chooseBuildingSubtype("house") || "house_01",
    x: cell.x,
    y: cell.y,
    width: getDefaultBuildingWidth(),
    height: getDefaultBuildingHeight(),
    state: "construction",
    walkable: isBuildingWalkable("house"),
    completeness: 0,
    constructionCost: getBuildingConstructionCost("house"),
  };

  buildings.push(building);
  return building;
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
      getPathWellKnownVisitsThreshold(),
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

    if (!canEnterUnoccupiedCell(neighbor)) continue;
    const key = `${neighbor.x},${neighbor.y}`;

    if (occupied.has(key)) continue;

    occupied.add(key);
    placementCells.push(neighbor);
  }

  if (placementCells.length === 0) return [];

  const previewBuildings = [
    {
      state: "complete",
      subtype: chooseBuildingSubtype("house") || "house_01",
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
        width: getDefaultBuildingWidth(),
        height: getDefaultBuildingHeight(),
        state: preview.state,
        walkable: isBuildingWalkable("house"),
        completeness: preview.completeness,
        constructionCost: getBuildingConstructionCost("house"),
      };
    });
}

function markCellsVisitedByBuildings(cells, buildingsState) {
  if (!Array.isArray(cells) || !Array.isArray(buildingsState)) return;

  for (const building of buildingsState) {
    for (let y = building.y; y < building.y + building.height; y += 1) {
      for (let x = building.x; x < building.x + building.width; x += 1) {
        const cell = cells[y]?.[x];

        if (cell) {
          cell.visited = true;
        }
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
    buildings: serializeBuildings(defaultBuildings, width, height),
    units,
    stockpile: createEmptyStockpile(),
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
      cell.variant = variants.some((variant) => variant.id === sourceCell.variant)
        ? sourceCell.variant
        : chooseTerrainVariant(cell.type);
      cell.visitsCount = Math.max(0, clampInteger(sourceCell.visitsCount, 0, getPathWellKnownVisitsThreshold(), 0));
      cell.materialAmount = Math.max(0, clampInteger(sourceCell.materialAmount, 0, 999999, 0));
      cell.foodType = sourceCell.foodType;
      cell.foodAmount = Math.max(0, clampInteger(sourceCell.foodAmount, 0, 999999, 0));

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

      if (!canEnterUnoccupiedCell(cell)) continue;

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

function normalizeTask(task, currentX, currentY) {
  if (!task) return null;

  const type = task.type;

  if (![ "move", "perform", "gatherFood", "gatherMaterials", "buildHouse", "demolish" ].includes(type)) {
    return null;
  }

  if (type === "perform") {
    return { type };
  }

  const toX = clampInteger(task.toX, 0, map.width - 1, currentX);
  const toY = clampInteger(task.toY, 0, map.height - 1, currentY);
  const destinationCell = getCell(toX, toY);
  const gatherTurnsRemaining = clampInteger(
    task.turnsRemaining,
    1,
    getGatherTaskDurationTurns(),
    getGatherTaskDurationTurns(),
  );

  if (!destinationCell) return null;

  if (type === "move") {
    if (!canUnitEnter(destinationCell)) return null;
    if (toX === currentX && toY === currentY) return null;
  } else if (type === "gatherFood") {
    if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
      return null;
    }
    if (!hasFoodResource(destinationCell)) {
      return null;
    }
  } else if (type === "gatherMaterials") {
    if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
      return null;
    }
    if (!hasMaterialResource(destinationCell)) {
      return null;
    }
  } else if (!areCellsAdjacent(currentX, currentY, toX, toY)) {
    return null;
  } else if (type === "buildHouse") {
    const building = getBuildingAtCell(toX, toY);

    if (!building || building.type !== "house" || building.state !== "construction") {
      return null;
    }
  } else {
    const building = getBuildingAtCell(toX, toY);

    if (!building || building.state !== "abandoned") {
      return null;
    }
  }

  if (type === "gatherFood" || type === "gatherMaterials") {
    return { type, toX, toY, turnsRemaining: gatherTurnsRemaining };
  }

  return { type, toX, toY };
}

function preserveTask(task) {
  if (!task || !["move", "perform", "gatherFood", "gatherMaterials", "buildHouse", "demolish"].includes(task.type)) return null;

  if (task.type === "perform") {
    return { type: task.type };
  }

  if (task.type === "gatherFood" || task.type === "gatherMaterials") {
    return {
      type: task.type,
      toX: clampInteger(task.toX, 0, map.width - 1, 0),
      toY: clampInteger(task.toY, 0, map.height - 1, 0),
      turnsRemaining: clampInteger(task.turnsRemaining, 1, getGatherTaskDurationTurns(), getGatherTaskDurationTurns()),
    };
  }

  return {
    type: task.type,
    toX: clampInteger(task.toX, 0, map.width - 1, 0),
    toY: clampInteger(task.toY, 0, map.height - 1, 0),
  };
}

function normalizeSituationMessage(entry, index = 0) {
  if (!entry || typeof entry.kind !== "string") {
    throw new Error("Missing situation message entry.");
  }

  if (!["intro", "houseStarted", "houseCompleted", "foodShortage", "foodRecovered", "unitLeft"].includes(entry.kind)) {
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
    stone: Math.max(0, clampInteger(rawStockpile?.stone, 0, 999999, 0)),
    lumber: Math.max(0, clampInteger(rawStockpile?.lumber, 0, 999999, 0)),
    food: Math.max(0, clampInteger(rawStockpile?.food, 0, 999999, 0)),
  };
}

function normalizeBuildingState(state) {
  return ["complete", "construction", "abandoned"].includes(state)
    ? state
    : "complete";
}

function normalizeBuildingSubtype(type, subtype) {
  const variants = getBuildingSubtypeVariants(type);

  if (variants.some((variant) => variant.id === subtype)) {
    return subtype;
  }

  return variants[0]?.id || null;
}

function normalizeBuildingsState(rawBuildings) {
  if (!Array.isArray(rawBuildings)) {
    throw new Error("Missing building data.");
  }

  return rawBuildings.map((sourceBuilding, index) => {
    const type = sourceBuilding?.type;

    if (!getBuildingSpec(type)) {
      throw new Error(`Unsupported building type: ${type}`);
    }

    const x = clampInteger(sourceBuilding.x, 0, map.width - 1, 0);
    const y = clampInteger(sourceBuilding.y, 0, map.height - 1, 0);
    const width = Math.max(
      1,
      Math.min(
        map.width - x,
        clampInteger(sourceBuilding.width, 1, map.width, getDefaultBuildingWidth()),
      ),
    );
    const height = Math.max(
      1,
      Math.min(
        map.height - y,
        clampInteger(sourceBuilding.height, 1, map.height, getDefaultBuildingHeight()),
      ),
    );

    return {
      id: typeof sourceBuilding.id === "string" ? sourceBuilding.id : `building_${index + 1}`,
      type,
      subtype: normalizeBuildingSubtype(type, sourceBuilding.subtype),
      x,
      y,
      width,
      height,
      state: normalizeBuildingState(sourceBuilding.state),
      walkable: typeof sourceBuilding.walkable === "boolean"
        ? sourceBuilding.walkable
        : isBuildingWalkable(type),
      completeness: getBuildingCompleteness(sourceBuilding),
      constructionCost: getBuildingConstructionCost(type),
    };
  });
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
    let x = clampInteger(sourceUnit?.x, 0, map.width - 1, Math.floor(map.width / 2));
    let y = clampInteger(sourceUnit?.y, 0, map.height - 1, Math.floor(map.height / 2));
    let cell = getCell(x, y);

    if (!canUnitEnter(cell, null, occupiedKeys)) {
      const fallbackCell = findNearestPassableCell(x, y, null, occupiedKeys);

      if (!fallbackCell) {
        continue;
      }

      x = fallbackCell.x;
      y = fallbackCell.y;
      cell = fallbackCell;
    }

    occupiedKeys.add(createCellKey(cell.x, cell.y));

    const staminaMax = Math.max(
      1,
      clampInteger(sourceUnit?.staminaMax, 1, 999, getDefaultUnitStamina()),
    );

    normalizedUnits.push({
      id: typeof sourceUnit?.id === "string" ? sourceUnit.id : `unit_${index + 1}`,
      name: normalizeUnitName(sourceUnit?.name),
      x: cell.x,
      y: cell.y,
      facing: normalizeDirection(sourceUnit?.facing),
      homeBuildingId:
        typeof sourceUnit?.homeBuildingId === "string" && sourceUnit.homeBuildingId
          ? sourceUnit.homeBuildingId
          : null,
      staminaMax,
      stamina: Math.max(0, clampNumber(sourceUnit?.stamina, 0, 999, staminaMax)),
      selected: false,
      task:
        mode !== interactionModes.play
          ? preserveTask(sourceUnit?.task)
          : normalizeTask(sourceUnit?.task, cell.x, cell.y),
      move: null,
      turnRoute: null,
      lastStepFromX: null,
      lastStepFromY: null,
    });
  }

  return normalizedUnits;
}

function applyStateSnapshot(state, mode, { recenter = true } = {}) {
  clearAnimationSchedule();

  clearPendingAutoAdvance();
  clearEditHoverState();
  hideTileMenu();

  const nextState = state || createDefaultState(mode);
  const nextMap = normalizeMapState(nextState.map);

  map.width = nextMap.width;
  map.height = nextMap.height;
  map.cells = nextMap.cells;
  buildings = normalizeBuildingsState(nextState.buildings);
  units = normalizeUnitsState(nextState.units, mode);
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
  resetTileReadout();
  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateSituationMessagePanel({ restartTyping: true });
  updateTurnControls();
  updateInteractionModeUi();
  layoutCanvas();

  if (recenter) {
    requestAnimationFrame(() => restoreViewportCenter({ x: 0.5, y: 0.5 }));
  }

  draw();
  if (shouldAnimateWorkingUnits()) {
    scheduleAnimation();
  }
  maybeAutoAdvanceTurn();
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

function hasAssignedTask(currentUnit) {
  return Boolean(currentUnit?.task);
}

function getActionForTask(task) {
  if (task?.type === "perform") {
    return unitActions.play;
  }

  if (task?.type === "gatherFood") {
    return unitActions.gatherFood;
  }

  if (task?.type === "gatherMaterials") {
    return unitActions.gatherMaterials;
  }

  if (task?.type === "buildHouse") {
    return unitActions.buildHouse;
  }

  if (task?.type === "demolish") {
    return unitActions.demolish;
  }

  return unitActions.walk;
}

function getDefaultActionForCompletedTask() {
  return unitActions.walk;
}

function applyCompletedTaskDefaultAction(currentUnit) {
  const selectedUnit = getSelectedUnit();

  if (selectedUnit && selectedUnit !== currentUnit) {
    return;
  }

  selectedUnitAction = getDefaultActionForCompletedTask();
}

function getCurrentSelectedUnitAction() {
  return normalizeUnitAction(selectedUnitAction);
}

function isWorkingTask(task) {
  return task?.type === "buildHouse" ||
    task?.type === "demolish" ||
    task?.type === "perform" ||
    task?.type === "gatherFood" ||
    task?.type === "gatherMaterials";
}

function isUnitWorking(currentUnit) {
  return Boolean(currentUnit) && !currentUnit.move && isWorkingTask(currentUnit.task);
}

function hasWorkingUnits() {
  return getUnits().some((currentUnit) => isUnitWorking(currentUnit));
}

function getWorkingUnitFrameIndex(now = performance.now()) {
  if (unitSprite.workFrames.length <= 1) {
    return 0;
  }

  return Math.floor(now / unitSprite.workFrameDuration) % unitSprite.workFrames.length;
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

function getFrameSetPaths(frameSetName) {
  const frameSet = unitSprite?.[frameSetName];
  return Array.isArray(frameSet) ? frameSet : [];
}

function getAllFishingFrameSetNames() {
  return Object.values(unitSprite.fishingDirections || {})
    .map((config) => config?.frameSet)
    .filter((frameSetName) => typeof frameSetName === "string" && frameSetName);
}

function getAllFishingFrameImagePaths() {
  return Array.from(
    new Set(
      getAllFishingFrameSetNames().flatMap((frameSetName) => getFrameSetPaths(frameSetName)),
    ),
  );
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

  if (currentUnit.task?.type === "perform") {
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
  const direction = getRawUnitTaskDirection(currentUnit);

  if (direction === "south") {
    return "southEast";
  }

  return direction;
}

function getUnitTaskTargetCell(currentUnit) {
  const task = currentUnit?.task;

  if (!task || !Number.isInteger(task.toX) || !Number.isInteger(task.toY)) {
    return null;
  }

  return getCell(task.toX, task.toY);
}

function getFishingTaskDirectionConfig(currentUnit) {
  if (!isFishingTask(currentUnit)) {
    return null;
  }

  const direction = getRawUnitTaskDirection(currentUnit);
  return unitSprite.fishingDirections?.[direction] || unitSprite.fishingDirections?.east || null;
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

function createMoveTask(destinationCell) {
  return {
    type: "move",
    toX: destinationCell.x,
    toY: destinationCell.y,
  };
}

function createGatherFoodTask(destinationCell) {
  return {
    type: "gatherFood",
    toX: destinationCell.x,
    toY: destinationCell.y,
    turnsRemaining: getGatherTaskDurationTurns(),
  };
}

function createGatherMaterialsTask(destinationCell) {
  return {
    type: "gatherMaterials",
    toX: destinationCell.x,
    toY: destinationCell.y,
    turnsRemaining: getGatherTaskDurationTurns(),
  };
}

function createPerformTask() {
  return {
    type: "perform",
  };
}

function createBuildHouseTask(destinationCell) {
  return {
    type: "buildHouse",
    toX: destinationCell.x,
    toY: destinationCell.y,
  };
}

function createDemolishTask(destinationCell) {
  return {
    type: "demolish",
    toX: destinationCell.x,
    toY: destinationCell.y,
  };
}

function assignUnitTask(task, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move || !task || isReplayPhase()) return false;

  clearQueuedAutoAdvanceFrame();

  currentUnit.task = task;
  currentUnit.turnRoute = null;
  currentUnit.lastStepFromX = null;
  currentUnit.lastStepFromY = null;
  unit = currentUnit;
  selectedUnitAction = getActionForTask(task);
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateTurnControls();
  if (shouldAnimateWorkingUnits()) {
    scheduleAnimation();
  }
  draw();

  maybeAutoAdvanceTurn();

  return true;
}

function queueUnitMoveTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move) return false;
  if (!canUnitEnter(destinationCell, currentUnit)) return false;
  if (destinationCell.x === currentUnit.x && destinationCell.y === currentUnit.y) return false;

  return assignUnitTask(createMoveTask(destinationCell), currentUnit);
}

function queueUnitPlayTask(currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move) return false;

  return assignUnitTask(createPerformTask(), currentUnit);
}

function queueUnitGatherFoodTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move || !canGatherFoodFromCell(destinationCell, currentUnit)) return false;

  return assignUnitTask(createGatherFoodTask(destinationCell), currentUnit);
}

function queueUnitGatherMaterialsTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move || !canGatherMaterialsFromCell(destinationCell, currentUnit)) return false;

  return assignUnitTask(createGatherMaterialsTask(destinationCell), currentUnit);
}

function queueUnitBuildHouseTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (!currentUnit || currentUnit.move) return false;
  if (!areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)) return false;

  const targetMode = getBuildHouseTargetMode(destinationCell);
  let building = null;

  if (targetMode === "new") {
    building = createHouseConstructionAtCell(destinationCell);
  } else if (targetMode === "construction") {
    building = getBuildingAtCell(destinationCell.x, destinationCell.y);
  }

  if (!building) return false;

  const cell = getCell(destinationCell.x, destinationCell.y);

  if (cell && !cell.visited) {
    cell.visited = true;
  }

  if (targetMode === "new") {
    addSituationMessage("houseStarted");
  }

  invalidateStaticLayer();
  return assignUnitTask(createBuildHouseTask(destinationCell), currentUnit);
}

function queueUnitDemolishTask(destinationCell, currentUnit = getSelectedUnit()) {
  if (
    !currentUnit ||
    currentUnit.move ||
    !areCellsAdjacent(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y)
  ) {
    return false;
  }

  const building = getBuildingAtCell(destinationCell.x, destinationCell.y);

  if (!building || building.state !== "abandoned") return false;

  return assignUnitTask(createDemolishTask(destinationCell), currentUnit);
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

  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateTurnControls();
  maybeAutoAdvanceTurn();
  draw();
  return true;
}

function exhaustFoodResource(cell) {
  if (!cell) return;

  const wasFishOnWater = cell.type === "water" && cell.foodType === "fish";

  cell.foodType = null;
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
    Math.max(0, Math.floor(targetCell.foodAmount)),
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
    Math.max(0, Math.floor(targetCell.materialAmount)),
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

  const building = getBuildingAtCell(targetCell.x, targetCell.y);

  if (!building || building.type !== "house" || building.state !== "construction") {
    clearCompletedTask(currentUnit);
    return;
  }

  const nextCompleteness = clamp(
    getBuildingCompleteness(building) +
      getBuildingWorkCompletenessDelta("buildHouse", building.type),
    0,
    1,
  );

  turnReplayHadWork = true;
  building.state = nextCompleteness >= 1 ? "complete" : "construction";
  building.completeness = nextCompleteness;
  currentUnit.stamina = 0;
  invalidateStaticLayer();

  if (nextCompleteness >= 1) {
    const spawnedUnit = spawnUnitFromHouse(building);
    if (spawnedUnit) {
      addSituationMessage("houseCompleted", { unitName: spawnedUnit.name });
    }
    clearCompletedTask(currentUnit);
  }
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

function resolveUnitTask(currentUnit) {
  if (!currentUnit?.task) return;

  if (currentUnit.task.type === "perform") {
    resolvePerformTask(currentUnit);
    return;
  }

  if (currentUnit.task.type === "gatherFood") {
    resolveGatherFoodTask(currentUnit);
    return;
  }

  if (currentUnit.task.type === "gatherMaterials") {
    resolveGatherMaterialsTask(currentUnit);
    return;
  }

  if (currentUnit.task.type === "buildHouse") {
    resolveBuildHouseTask(currentUnit);
    return;
  }

  if (currentUnit.task.type === "demolish") {
    resolveDemolishTask(currentUnit);
    return;
  }

  if (currentUnit.task.type !== "move") {
    clearCompletedTask(currentUnit);
    return;
  }

  resolveMoveTaskForTurn(currentUnit);
}

function resolveMoveTaskForTurn(currentUnit) {
  while (currentUnit?.task?.type === "move" && getUnitStamina(currentUnit) > 0) {
    if (currentUnit.x === currentUnit.task.toX && currentUnit.y === currentUnit.task.toY) {
      clearCompletedTask(currentUnit);
      return;
    }

    const nextMove = getNextMoveStep(currentUnit, currentUnit.task);

    if (!nextMove) {
      clearCompletedTask(currentUnit);
      return;
    }

    const fromX = currentUnit.x;
    const fromY = currentUnit.y;
    const moveCost = getTerrainMoveCost(nextMove.cell, getCell(fromX, fromY));

    currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - moveCost);
    currentUnit.x = nextMove.cell.x;
    currentUnit.y = nextMove.cell.y;
    currentUnit.facing = nextMove.direction || currentUnit.facing;
    currentUnit.lastStepFromX = fromX;
    currentUnit.lastStepFromY = fromY;
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

      const maxAmount = getFoodTypeMaxAmount(cell.foodType);
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
  units = currentUnits.filter((candidate) => candidate !== removedUnit);

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

    currentUnit.x = state.x;
    currentUnit.y = state.y;
    currentUnit.facing = state.facing;
    currentUnit.lastStepFromX = state.lastStepFromX;
    currentUnit.lastStepFromY = state.lastStepFromY;
    currentUnit.move = null;
  }

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

  applyReplayUnitStates(turnReplayFinalStates);
}

function finishReplay() {
  if (replayPauseTimeoutId) {
    window.clearTimeout(replayPauseTimeoutId);
  }

  commitReplayFinalState();
  resetTurnReplayState();
  updateUnitReadout();
  updateTurnControls();
  maybeAutoAdvanceTurn();
  draw();
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
  applyReplayUnitStates(turnReplayStartStates);
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
  for (const [type, spec] of Object.entries(terrain)) {
    for (const variant of getTerrainVariants(type)) {
      loadImage(variant.image, tileImages);
    }
  }

  for (const imagePath of getBuildingImagePaths()) {
    loadImage(imagePath, buildingImages);
  }

  for (const imagePath of getShoreOverlayPaths()) {
    loadImage(imagePath, shoreOverlayImages);
  }

  for (const imagePath of getFoodOverlayImagePaths()) {
    loadImage(imagePath, resourceOverlayImages);
  }

  for (const imagePath of Object.values(resourceUiIcons)) {
    loadImage(imagePath, resourceIconImages);
  }

  loadImage(unitSprite.idleImage, unitImages);
  loadImage(unitSprite.northImage, unitImages);
  loadImage(unitSprite.southImage, unitImages);

  for (const imagePath of unitSprite.workFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.landFoodFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.lumberFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.stoneFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of getAllFishingFrameImagePaths()) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.playFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.northMoveFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.southMoveFrames) {
    loadImage(imagePath, unitImages);
  }

  for (const imagePath of unitSprite.moveFrames) {
    loadImage(imagePath, unitImages);
  }
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
  const paths = [];

  for (const spec of Object.values(buildingCatalog)) {
    for (const variant of spec.subtypes || []) {
      paths.push(variant.image);
    }

    if (spec.abandonedImage) {
      paths.push(spec.abandonedImage);
    }

    if (spec.constructionImages) {
      paths.push(...Object.values(spec.constructionImages));
    }
  }

  return paths;
}

function getShoreOverlayPaths() {
  return [
    ...Object.values(shoreOverlays.edge),
    ...Object.values(shoreOverlays.corner),
  ];
}

function loadImage(imagePath, registry) {
  if (!imagePath || registry[imagePath]) return;

  const image = new Image();
  image.onload = () => {
    invalidateStaticLayer();
    invalidateStaticUnitsLayer();
    updateStockpileReadout();
    updateTileInspectorReadout();
    draw();
  };
  image.onerror = () => {
    console.warn(`Could not load image: ${imagePath}`);
    invalidateStaticLayer();
    invalidateStaticUnitsLayer();
    updateStockpileReadout();
    updateTileInspectorReadout();
    draw();
  };
  image.src = imagePath;
  registry[imagePath] = image;
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
  cell.foodAmount = 0;

  if (rollFood) {
    const foodType = chooseFoodTypeForCell(cell);

    if (foodType) {
      cell.foodType = foodType;
      cell.foodAmount = getFoodTypeMaxAmount(foodType);
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
      cell.foodAmount = getFoodTypeMaxAmount("fish");
    }
    return;
  }

  cell.foodType = null;
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
  return (
    Boolean(building) &&
    x >= building.x &&
    x < building.x + building.width &&
    y >= building.y &&
    y < building.y + building.height
  );
}

function getBuildingsAtCell(x, y) {
  return buildings.filter((building) => buildingOccupiesCell(building, x, y));
}

function getBuildingAtCell(x, y) {
  return getBuildingsAtCell(x, y)[0] || null;
}

function getUnitAtCell(x, y, { excludeUnitId = null } = {}) {
  return (
    getUnits().find(
      (currentUnit) =>
        currentUnit &&
        currentUnit.id !== excludeUnitId &&
        currentUnit.x === x &&
        currentUnit.y === y,
    ) || null
  );
}

function getBlockingBuildingAtCell(x, y) {
  return (
    buildings.find(
      (building) => buildingOccupiesCell(building, x, y) && !building.walkable,
    ) || null
  );
}

function isBuildingTargetedByDemolishTask(building) {
  if (!building) return false;

  return getUnits().some(
    (currentUnit) =>
      currentUnit?.task?.type === "demolish" &&
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

    if (canUnitEnter(neighbor)) {
      return neighbor;
    }
  }

  return null;
}

function spawnUnitFromHouse(building) {
  if (!building) return null;

  const spawnCell = findAdjacentSpawnCell(building.x, building.y);

  if (!spawnCell) {
    return null;
  }

  const spawnedUnit = {
    id: createUnitId(),
    name: getDefaultUnitName(),
    x: spawnCell.x,
    y: spawnCell.y,
    facing: "west",
    homeBuildingId: building.id,
    staminaMax: getDefaultUnitStamina(),
    stamina: getDefaultUnitStamina(),
    selected: false,
    task: null,
    move: null,
    turnRoute: null,
    lastStepFromX: null,
    lastStepFromY: null,
  };

  units.push(spawnedUnit);
  syncActiveUnit();

  const spawnTile = getCell(spawnCell.x, spawnCell.y);

  markCellVisitedByUnit(spawnTile);

  invalidateStaticUnitsLayer();
  return spawnedUnit;
}

function getBuildingVisual(building) {
  const spec = getBuildingSpec(building?.type);

  if (!spec) return null;

  if (building.state === "abandoned") {
    return {
      image: spec.abandonedImage,
      alpha: clamp(0.28 + getBuildingCompleteness(building) * 0.72, 0.2, 1),
    };
  }

  if (building.state === "construction") {
    const completeness = getBuildingCompleteness(building);
    const thresholds = getBuildingConstructionThresholds(building.type);

    if (completeness < thresholds.initialMax) {
      return {
        image: spec.constructionImages.initial,
        alpha: 1,
        yOffsetFactor: 0.2,
      };
    }

    if (completeness < thresholds.halfMax) {
      return {
        image: spec.constructionImages.half,
        alpha: 1,
      };
    }
  }

  const subtype = spec.subtypes.find((variant) => variant.id === building.subtype) || spec.subtypes[0];

  return subtype
    ? {
        image: subtype.image,
        alpha: 1,
      }
    : null;
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
  return (
    Boolean(cell) &&
    cell.type !== "water" &&
    !getBlockingBuildingAtCell(cell.x, cell.y) &&
    !(
      occupiedKeys instanceof Set
        ? occupiedKeys.has(createCellKey(cell.x, cell.y))
        : Boolean(getUnitAtCell(cell.x, cell.y, { excludeUnitId: currentUnit?.id || null }))
    )
  );
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
  const gatherDurationTurns = getGatherTaskDurationTurns();
  const getGatherProgressText = (task) => {
    const completedTurns = clampInteger(
      gatherDurationTurns - clampInteger(task?.turnsRemaining, 0, gatherDurationTurns, gatherDurationTurns),
      0,
      gatherDurationTurns,
      0,
    );

    return `${completedTurns}/${gatherDurationTurns}`;
  };

  setUnitTitle(unitName);

  if (displayedUnit.move) {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit));
    return;
  }

  if (displayedUnit.task?.type === "move") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), "", { cancelVisible: true });
    return;
  }

  if (displayedUnit.task?.type === "perform") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), "", { cancelVisible: true });
    return;
  }

  if (displayedUnit.task?.type === "gatherFood") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), getGatherProgressText(displayedUnit.task), { cancelVisible: true });
    return;
  }

  if (displayedUnit.task?.type === "gatherMaterials") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), getGatherProgressText(displayedUnit.task), { cancelVisible: true });
    return;
  }

  if (displayedUnit.task?.type === "buildHouse") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), "", { cancelVisible: true });
    return;
  }

  if (displayedUnit.task?.type === "demolish") {
    setTaskAndRefresh(getUnitInspectorSpriteImage(displayedUnit), "", { cancelVisible: true });
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
    return;
  }

  const activeAction = getCurrentSelectedUnitAction();
  const disabled = Boolean(selectedUnit?.move) || isReplayPhase();

  for (const button of unitActionButtons) {
    const action = normalizeUnitAction(button.dataset.unitAction);
    const isSelected = action === activeAction;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.disabled = disabled;
  }
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
  selectedUnitAction = normalizeUnitAction(defaultAction ?? unitActions.walk);
  inspectedPlayCell = null;

  if (scrollIntoView) {
    requestAnimationFrame(() => centerViewportOnUnit(currentUnit));
  }

  invalidateStaticUnitsLayer();
  updateUnitReadout();
  if (shouldAnimateSelectionMarker()) {
    scheduleAnimation();
  }
  draw();
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
  const visibleTopBarMode = getVisibleTopBarMode();

  for (const [mode, topBar] of Object.entries(topBars)) {
    if (!topBar) continue;
    topBar.hidden = mode !== visibleTopBarMode;
  }

  if (playInspector) {
    playInspector.hidden = visibleTopBarMode !== interactionModes.play;
  }

  if (bookOverlay && visibleTopBarMode !== interactionModes.play) {
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
  updatePlayOverlayLayout();

  updateTurnControls();
  updatePersistenceControls();
  updateTileInspectorReadout();
  updateUnitActionControls();
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

function clearEditHoverState() {
  if (!hoverCell && !activeCell && tileMenu.hidden) {
    resetTileReadout();
    return;
  }

  hoverCell = null;
  hideTileMenu();
  resetTileReadout();
}

function clearUnitSelection() {
  let didChange = false;

  for (const currentUnit of getUnits()) {
    if (!currentUnit.selected) continue;
    currentUnit.selected = false;
    didChange = true;
  }

  if (!didChange) return;

  syncActiveUnit();
  selectedUnitAction = null;
  invalidateStaticUnitsLayer();
  updateUnitReadout();
}

function openMainMenu() {
  clearPendingAutoAdvance();
  closeGameActionMenu();
  closeSaveSlotPanel();
  closeBookOverlay();
  clearEditHoverState();
  clearUnitSelection();
  mainMenuOpen = true;
  mainMenuOverlay.hidden = false;
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
  closeGameActionMenu();
  closeSaveSlotPanel();
  closeBookOverlay();
  clearEditHoverState();
  clearUnitSelection();
  invalidateStaticUnitsLayer();

  updateInteractionModeUi();

  if (didChange) {
    draw();
  }

  if (shouldAnimateWorkingUnits()) {
    scheduleAnimation();
  }

  maybeAutoAdvanceTurn();
}

function activateMode(nextMode) {
  setInteractionMode(nextMode);
  loadCurrentFileForMode(nextMode);
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
    action === getActionForTask(selectedUnit.task)
  ) {
    const destinationCell = getCell(selectedUnit.task.toX, selectedUnit.task.toY);
    return destinationCell ? [destinationCell] : [];
  }

  if (action === unitActions.buildHouse) {
    return getBuildableAdjacentCells(selectedUnit);
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

  if (action === unitActions.gatherFood) {
    return {
      fill: "rgba(204, 156, 84, 0.18)",
      stroke: "rgba(243, 207, 127, 0.72)",
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

function canStartNewHouseConstructionOnCell(cell) {
  return (
    Boolean(cell) &&
    cell.type === "grass" &&
    !hasFoodResource(cell) &&
    !getBuildingAtCell(cell.x, cell.y) &&
    !getUnitAtCell(cell.x, cell.y) &&
    canAffordHouseConstruction("house")
  );
}

function canContinueHouseConstructionOnCell(cell) {
  if (!cell) {
    return false;
  }

  const building = getBuildingAtCell(cell.x, cell.y);
  return Boolean(building && building.type === "house" && building.state === "construction");
}

function getBuildHouseTargetMode(cell) {
  if (canContinueHouseConstructionOnCell(cell)) {
    return "construction";
  }

  if (canStartNewHouseConstructionOnCell(cell)) {
    return "new";
  }

  return null;
}

function getBuildableAdjacentCells(currentUnit = unit) {
  const originCell = currentUnit ? getCell(currentUnit.x, currentUnit.y) : null;

  return getAdjacentCells(originCell).filter((cell) => Boolean(getBuildHouseTargetMode(cell)));
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

  return hasFoodResource(cell) && areCellsAdjacent(currentUnit.x, currentUnit.y, cell.x, cell.y);
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

function buildTurnRoutes(currentUnit, cell, destinationCell, remainingStamina, visitedKeys, steps = []) {
  if (!cell || !destinationCell) return [];

  if (steps.length > 0 && cell.x === destinationCell.x && cell.y === destinationCell.y) {
    return [{ steps }];
  }

  if (remainingStamina <= 0) {
    return steps.length > 0 ? [{ steps }] : [];
  }

  const directions = getMovementDirections();
  const routes = [];

  for (const direction of directions) {
    const neighbor = getNeighborByDirection(cell, direction);

    if (!canUnitEnter(neighbor, currentUnit)) continue;
    if (
      steps.length === 0 &&
      neighbor.x === currentUnit.lastStepFromX &&
      neighbor.y === currentUnit.lastStepFromY
    ) {
      continue;
    }

    const neighborKey = createCellKey(neighbor.x, neighbor.y);

    if (visitedKeys.has(neighborKey)) {
      continue;
    }

    const moveCost = getTerrainMoveCost(neighbor, cell);
    const staminaAfterMove = Math.max(0, remainingStamina - moveCost);
    const nextSteps = steps.concat({
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
      nextVisitedKeys,
      nextSteps,
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
    const routes = buildTurnRoutes(
      currentUnit,
      originCell,
      destinationCell,
      getUnitStamina(currentUnit),
      new Set([createCellKey(originCell.x, originCell.y)]),
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

    if (action === unitActions.gatherFood) {
      if (queueUnitGatherFoodTask(cell, selectedUnit)) {
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

    if (action === unitActions.demolish) {
      if (queueUnitDemolishTask(cell, selectedUnit)) {
        return;
      }
    }

    if (action === unitActions.walk && canUnitEnter(cell, selectedUnit)) {
      queueUnitMoveTask(cell, selectedUnit);
      return;
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
) {
  if (!currentUnit) return;

  currentUnit.move = {
    fromX: currentUnit.x,
    fromY: currentUnit.y,
    toX: destinationCell.x,
    toY: destinationCell.y,
    direction: direction || getMoveDirection(currentUnit.x, currentUnit.y, destinationCell.x, destinationCell.y),
    startedAt: performance.now(),
  };
  unit = currentUnit;
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateTurnControls();
  scheduleAnimation();
  draw();
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
      const moveFromX = movingUnit.move.fromX;
      const moveFromY = movingUnit.move.fromY;

      movingUnit.x = movingUnit.move.toX;
      movingUnit.y = movingUnit.move.toY;
      movingUnit.facing = movingUnit.move.direction || movingUnit.facing;
      movingUnit.lastStepFromX = moveFromX;
      movingUnit.lastStepFromY = moveFromY;
      movingUnit.move = null;
      syncActiveUnit(movingUnit.id);
      invalidateStaticUnitsLayer();
      updateUnitReadout();
      updateTurnControls();

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
  return clamp(elapsed / unitSprite.moveDuration, 0, 1);
}

function getUnitScreenPosition(currentUnit = unit, now = performance.now()) {
  if (!currentUnit) return null;
  if (!currentUnit.move) return isoToScreen(currentUnit.x, currentUnit.y);

  const progress = easeInOut(getUnitMoveProgress(currentUnit, now));
  const from = isoToScreen(currentUnit.move.fromX, currentUnit.move.fromY);
  const to = isoToScreen(currentUnit.move.toX, currentUnit.move.toY);

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

  return {
    x: taskGroundPoint.x,
    y: taskGroundPoint.y - tile.height * unitSprite.groundOffset,
  };
}

function getUnitGroundPoint(screen, groundOffset = unitSprite.groundOffset) {
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

function shouldMirrorUnitDirection(direction) {
  return direction === "east" || direction === "northEast" || direction === "southEast";
}

function getTargetBasedWorkTaskGroundPoint(currentUnit) {
  const task = currentUnit?.task;

  if (!task || !isWorkingTask(task) || task.type === "perform") {
    return null;
  }

  const baseScreen = isoToScreen(currentUnit.x, currentUnit.y);
  const direction = getRawUnitTaskDirection(currentUnit);
  const halfW = tile.width / 2;
  const halfH = tile.height / 2;

  switch (direction) {
    case "north":
      return { x: baseScreen.x, y: baseScreen.y };
    case "east":
      return { x: baseScreen.x + halfW, y: baseScreen.y + halfH };
    case "south":
      return { x: baseScreen.x, y: baseScreen.y + tile.height };
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

function shouldMirrorUnitImage(imagePath, direction, currentUnit = null) {
  const fishingConfig = getFishingTaskDirectionConfig(currentUnit);

  if (fishingConfig && getFrameSetPaths(fishingConfig.frameSet).includes(imagePath)) {
    return Boolean(fishingConfig.mirror);
  }

  return shouldMirrorUnitDirection(direction);
}

function usesNorthUnitSprite(direction) {
  return direction === "north";
}

function usesSouthUnitSprite(direction) {
  return direction === "south";
}

function getStationaryUnits() {
  if (interactionMode !== interactionModes.play) {
    return [];
  }

  return getUnits().filter(
    (currentUnit) =>
      currentUnit &&
      !currentUnit.move &&
      !currentUnit.selected,
  );
}

function getMovingUnit() {
  return getUnits().find((currentUnit) => currentUnit?.move) || null;
}

function compareUnitsByDrawOrder(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
}

function compareBuildingsByDrawOrder(a, b) {
  const aRow = a.y + a.height - 1;
  const bRow = b.y + b.height - 1;

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
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
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
      : (currentUnit.task?.type === "move" ? currentUnit.task : null);

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
    const toScreen = isoToScreen(destinationCell.x, destinationCell.y);
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

  if (!screen) return;

  drawUnitAtScreen(screen, ctx, imagePath, shouldMirrorUnitImage(imagePath, direction, movingUnit), !movingUnit.selected);
}

function drawSelectedStationaryUnit(now = performance.now()) {
  const selectedUnit = getSelectedUnit();

  if (interactionMode !== interactionModes.play || !selectedUnit || selectedUnit.move) {
    return;
  }

  const direction = getUnitDisplayDirection(selectedUnit);
  const imagePath = getStationaryUnitImage(selectedUnit, now);
  const screen = getStationaryUnitDrawScreenPosition(selectedUnit, imagePath, now);

  if (!screen) {
    return;
  }

  drawUnitAtScreen(
    screen,
    ctx,
    imagePath,
    shouldMirrorUnitImage(imagePath, direction, selectedUnit),
    false,
  );
}

function drawStationaryUnits(drawContext = ctx, frameIndex = 0) {
  const stationaryUnits = getStationaryUnits().slice().sort(compareUnitsByDrawOrder);

  for (const stationaryUnit of stationaryUnits) {
    const direction = getUnitDisplayDirection(stationaryUnit);
    const imagePath = getStationaryUnitImage(stationaryUnit, undefined, frameIndex);
    const screen = getStationaryUnitDrawScreenPosition(stationaryUnit, imagePath);

    if (!screen) {
      continue;
    }
    drawUnitAtScreen(
      screen,
      drawContext,
      imagePath,
      shouldMirrorUnitImage(imagePath, direction, stationaryUnit),
      !stationaryUnit.selected,
    );
  }
}

function getUnitDisplayDirection(currentUnit) {
  if (isUnitWorking(currentUnit)) {
    return getUnitTaskDirection(currentUnit);
  }

  return currentUnit?.facing || "west";
}

function getWorkingUnitImage(frameIndex = 0) {
  if (unitSprite.workFrames.length === 0) {
    return unitSprite.idleImage;
  }

  return unitSprite.workFrames[frameIndex % unitSprite.workFrames.length] || unitSprite.idleImage;
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

function getFishingTaskFrames(currentUnit) {
  const fishingConfig = getFishingTaskDirectionConfig(currentUnit);
  const frames = getFrameSetPaths(fishingConfig?.frameSet);
  return frames.length > 0 ? frames : unitSprite.workFrames;
}

function getLandFoodTaskFrames() {
  return unitSprite.landFoodFrames.length > 0 ? unitSprite.landFoodFrames : unitSprite.workFrames;
}

function getMaterialGatherTaskFrames(currentUnit) {
  const targetCell = getUnitTaskTargetCell(currentUnit);
  const materialType = getCellMaterialResourceType(targetCell);

  if (materialType === "lumber" && unitSprite.lumberFrames.length > 0) {
    return unitSprite.lumberFrames;
  }

  if (materialType === "stone" && unitSprite.stoneFrames.length > 0) {
    return unitSprite.stoneFrames;
  }

  return unitSprite.workFrames;
}

function getAnimatedTaskUnitImage(currentUnit, frameIndex = 0) {
  let frames = unitSprite.workFrames;

  if (currentUnit?.task?.type === "perform" && unitSprite.playFrames.length > 0) {
    frames = unitSprite.playFrames;
  } else if (isFishingTask(currentUnit)) {
    frames = getFishingTaskFrames(currentUnit);
  } else if (currentUnit?.task?.type === "gatherFood") {
    frames = getLandFoodTaskFrames();
  } else if (currentUnit?.task?.type === "gatherMaterials") {
    frames = getMaterialGatherTaskFrames(currentUnit);
  }

  if (frames.length === 0) {
    return unitSprite.idleImage;
  }

  const offsetFrameIndex = frameIndex + getAnimatedTaskFrameOffset(currentUnit);

  return frames[offsetFrameIndex % frames.length] || unitSprite.idleImage;
}

function getMovePreviewUnitImage(currentUnit) {
  const task = currentUnit?.task;
  const direction = currentUnit?.move?.direction || (
    task?.type === "move"
      ? getMoveDirection(currentUnit.x, currentUnit.y, task.toX, task.toY)
      : (currentUnit?.facing || "west")
  );
  let moveFrames = unitSprite.moveFrames;
  let fallbackImage = unitSprite.idleImage;

  if (usesNorthUnitSprite(direction)) {
    moveFrames = unitSprite.northMoveFrames;
    fallbackImage = unitSprite.northImage;
  } else if (usesSouthUnitSprite(direction)) {
    moveFrames = unitSprite.southMoveFrames;
    fallbackImage = unitSprite.southImage;
  }

  return moveFrames[1] || moveFrames[0] || fallbackImage;
}

function getUnitInspectorSpriteImage(currentUnit) {
  if (!currentUnit) {
    return "";
  }

  if (currentUnit.move || currentUnit.task?.type === "move") {
    return getMovePreviewUnitImage(currentUnit);
  }

  if (currentUnit.task) {
    return getAnimatedTaskUnitImage(currentUnit, 0);
  }

  return getStationaryUnitImage(currentUnit, performance.now(), 0);
}

function getStationaryUnitImage(currentUnit, now = performance.now(), explicitFrameIndex = null) {
  if (isUnitWorking(currentUnit)) {
    const frameIndex =
      explicitFrameIndex === null ? getWorkingUnitFrameIndex(now) : explicitFrameIndex;

    return getAnimatedTaskUnitImage(currentUnit, frameIndex);
  }

  const direction = getUnitDisplayDirection(currentUnit);

  if (usesNorthUnitSprite(direction)) {
    return unitSprite.northImage;
  }

  if (usesSouthUnitSprite(direction)) {
    return unitSprite.southImage;
  }

  return unitSprite.idleImage;
}

function getMovingUnitImage(currentUnit = unit, direction = "west", now = performance.now()) {
  let moveFrames = unitSprite.moveFrames;
  let fallbackImage = unitSprite.idleImage;

  if (usesNorthUnitSprite(direction)) {
    moveFrames = unitSprite.northMoveFrames;
    fallbackImage = unitSprite.northImage;
  } else if (usesSouthUnitSprite(direction)) {
    moveFrames = unitSprite.southMoveFrames;
    fallbackImage = unitSprite.southImage;
  }

  if (
    !currentUnit?.move ||
    moveFrames.length === 0 ||
    unitSprite.moveFrameSequence.length === 0
  ) {
    return fallbackImage;
  }

  const progress = getUnitMoveProgress(currentUnit, now);
  const phaseIndex = Math.min(
    unitSprite.moveFrameSequence.length - 1,
    Math.floor(progress * unitSprite.moveFrameSequence.length),
  );
  const frameIndex = unitSprite.moveFrameSequence[phaseIndex];

  return moveFrames[frameIndex] || fallbackImage;
}

function getUnitSpriteRenderSpec(imagePath) {
  return {
    width: unitSprite.width,
    height: unitSprite.height,
    anchorX: unitSprite.anchorX,
    anchorY: unitSprite.anchorY,
    groundOffset: unitSprite.groundOffset,
  };
}

function drawUnitAtScreen(
  screen,
  drawContext = ctx,
  imagePath = unitSprite.idleImage,
  mirrorX = false,
  showShadow = true,
) {
  const image = unitImages[imagePath];
  const renderSpec = getUnitSpriteRenderSpec(imagePath);
  const drawWidth = renderSpec.width * zoomLevels[zoomIndex];
  const drawHeight = renderSpec.height * zoomLevels[zoomIndex];
  const drawX = screen.x - renderSpec.anchorX * zoomLevels[zoomIndex];
  const ground = getUnitGroundPoint(screen, renderSpec.groundOffset);
  const groundY = ground.y;
  const drawY = groundY - renderSpec.anchorY * zoomLevels[zoomIndex];

  drawContext.save();
  if (showShadow) {
    drawContext.fillStyle = "rgba(5, 8, 10, 0.28)";
    drawContext.beginPath();
    drawContext.ellipse(
      screen.x,
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
      screen.x,
      groundY - tile.height * 0.32,
      tile.width * 0.12,
      0,
      Math.PI * 2,
    );
    drawContext.fill();
  }

  drawContext.restore();
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
  const playInspectorSlack =
    isPlayMode() && !mainMenuOpen
      ? ((playInspector?.offsetWidth || 320) + 40)
      : 0;

  return {
    width: Math.ceil(
      Math.max(
        mapPixelSize.width + canvasPadding * 2 + playInspectorSlack,
        viewport.clientWidth + canvasPadding * 2 + playInspectorSlack,
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

  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(3.4, tile.width * 0.06), 0, Math.PI * 2);
  ctx.fillStyle = isFull ? "rgba(12, 11, 10, 0.92)" : "rgba(12, 11, 10, 0.22)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(1.8, tile.width * 0.04), 0, Math.PI * 2);
  ctx.fillStyle = isFull ? "rgba(254, 232, 111, 1)" : "rgba(151, 124, 82, 0.28)";
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

function drawBuildings() {
  const visibleBuildings = buildings
    .filter((building) => isCellVisibleToPlayer(getCell(building.x, building.y)))
    .slice()
    .sort(compareBuildingsByDrawOrder);

  for (const building of visibleBuildings) {
    drawBuilding(building);
  }
}

function drawBuilding(building) {
  const visual = getBuildingVisual(building);

  if (!visual?.image) return;

  const image = buildingImages[visual.image];

  if (!image?.complete || image.naturalWidth <= 0) return;

  const screen = isoToScreen(building.x, building.y);
  const drawY =
    screen.y - tile.edge - tile.height * 0.32 + tile.height * (visual.yOffsetFactor || 0);

  ctx.save();
  ctx.globalAlpha = visual.alpha ?? 1;
  ctx.drawImage(
    image,
    screen.x - tile.width / 2,
    drawY,
    tile.width,
    tile.height + tile.edge,
  );
  ctx.restore();
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

  return map.cells[y][x];
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

  drawBuildings();
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
    restoreStaticUnitsLayerToMain(getWorkingUnitFrameIndex(now));
    drawSelectedUnitMarker();
    drawSelectedStationaryUnit(now);
    drawMovingUnit(now);
    drawUnitMoveTaskLines(now);
    drawUnitTargets();
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

  hideTileMenu();
  zoomIndex = nextZoomIndex;
  layoutCanvas({ preserveCenter: true });
}

function populateTerrainMenu() {
  for (const [type, spec] of Object.entries(terrain)) {
    const button = document.createElement("button");
    const swatch = document.createElement("span");
    const label = document.createElement("span");

    button.type = "button";
    button.className = "terrain-option";
    button.dataset.terrain = type;
    button.setAttribute("role", "menuitem");
    swatch.className = "terrain-swatch";
    swatch.style.background = spec.top;
    label.textContent = spec.label;
    button.append(swatch, label);
    terrainMenuOptions.append(button);
  }
}

function setTileReadout(cell) {
  const spec = terrain[cell.type];
  const variant = getTerrainVariant(cell.type, ensureCellVariant(cell));
  const variantLabel = getTerrainVariants(cell.type).length > 1 && variant ? variant.label : "";

  setTextContent(hoverReadouts, strings.readouts.tile(cell.x, cell.y, spec.label, variantLabel));
}

function openTileMenu(cell, event) {
  activeCell = cell;
  tileMenuTitle.textContent = strings.readouts.tileMenuTitle(cell.x, cell.y);
  tileMenu.hidden = false;
  updateTerrainMenuSelection(cell.type);
  updateVariantMenu(cell);
  positionTileMenu(event.clientX, event.clientY);
  getSelectedTerrainButton()?.focus({ preventScroll: true });

  draw();
}

function positionTileMenu(clientX, clientY) {
  const viewportRect = viewport.getBoundingClientRect();
  const margin = 8;
  const menuWidth = tileMenu.offsetWidth || 176;
  const menuHeight = tileMenu.offsetHeight || 72;
  const minLeft = viewport.scrollLeft + margin;
  const minTop = viewport.scrollTop + margin;
  const maxLeft = Math.max(
    minLeft,
    viewport.scrollLeft + viewport.clientWidth - menuWidth - margin,
  );
  const maxTop = Math.max(
    minTop,
    viewport.scrollTop + viewport.clientHeight - menuHeight - margin,
  );
  const left = clientX - viewportRect.left + viewport.scrollLeft + 12;
  const top = clientY - viewportRect.top + viewport.scrollTop + 12;

  tileMenu.style.left = `${clamp(left, minLeft, maxLeft)}px`;
  tileMenu.style.top = `${clamp(top, minTop, maxTop)}px`;
}

function hideTileMenu() {
  if (tileMenu.hidden) return;

  tileMenu.hidden = true;
  activeCell = null;
  draw();
}

function updateTerrainMenuSelection(type) {
  for (const button of terrainMenuOptions.querySelectorAll(".terrain-option")) {
    const isSelected = button.dataset.terrain === type;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-current", isSelected ? "true" : "false");
  }
}

function updateVariantMenu(cell) {
  const variants = getTerrainVariants(cell.type);

  variantMenuOptions.replaceChildren();
  variantMenu.hidden = variants.length <= 1;

  if (variantMenu.hidden) return;

  const selectedVariant = ensureCellVariant(cell);

  for (const variant of variants) {
    const button = document.createElement("button");
    const swatch = document.createElement("span");
    const label = document.createElement("span");
    const isSelected = variant.id === selectedVariant;

    button.type = "button";
    button.className = "terrain-option";
    button.classList.toggle("is-selected", isSelected);
    button.dataset.variant = variant.id;
    button.setAttribute("role", "menuitem");
    button.setAttribute("aria-current", isSelected ? "true" : "false");
    swatch.className = "terrain-swatch";
    swatch.style.background = terrain[cell.type].top;
    label.textContent = variant.label;
    button.append(swatch, label);
    variantMenuOptions.append(button);
  }
}

function getSelectedTerrainButton() {
  return terrainMenuOptions.querySelector(".terrain-option.is-selected");
}

function handleEditCanvasMove(event) {
  const nextHover = pickTile(event.clientX, event.clientY);
  const changed =
    (!hoverCell && nextHover) ||
    (hoverCell && !nextHover) ||
    (hoverCell &&
      nextHover &&
      (hoverCell.x !== nextHover.x || hoverCell.y !== nextHover.y));

  if (!changed) return;

  hoverCell = nextHover;

  if (hoverCell) {
    setTileReadout(hoverCell);
  } else {
    resetTileReadout();
  }

  draw();
}

function handleEditCanvasClick(event, clickedCell) {
  if (!clickedCell) {
    hideTileMenu();
    return;
  }

  hoverCell = clickedCell;
  setTileReadout(clickedCell);
  openTileMenu(clickedCell, event);
}

function handleEditCanvasLeave() {
  hoverCell = null;

  if (activeCell) {
    setTileReadout(activeCell);
  } else {
    resetTileReadout();
  }

  draw();
}

canvas.addEventListener("mousemove", (event) => {
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
  if (!isEditMode()) return;

  handleEditCanvasLeave();
});

function applyTerrainSelection(type) {
  if (!activeCell) return;

  setCellTerrain(activeCell, type);
  setTileReadout(activeCell);
  hideTileMenu();
}

terrainMenuOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".terrain-option");

  if (!button) return;

  applyTerrainSelection(button.dataset.terrain);
});

variantMenuOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".terrain-option");

  if (!button || !activeCell) return;

  activeCell.variant = button.dataset.variant;
  syncCellResourcesWithVariant(activeCell, { seedOnWater01: true });
  invalidateStaticLayer();
  setTileReadout(activeCell);
  hideTileMenu();
});

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

  if (tileMenu.hidden || tileMenu.contains(event.target) || event.target === canvas) {
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

  if (gameActionMenu && !gameActionMenu.hidden) {
    closeGameActionMenu({ restoreFocus: true });
    return;
  }

  if (mainMenuOpen) return;

  if (!tileMenu.hidden) {
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
  if (event.target !== bookOverlay) {
    return;
  }

  closeBookOverlay({ restoreFocus: true });
});

mainMenuOverlay.addEventListener("click", (event) => {
  const button = event.target.closest(".main-menu-item");

  if (!button || button.disabled) return;

  const action = button.dataset.menuAction;

  if (action === "play") {
    activateMode(interactionModes.play);
    return;
  }

  if (action === "start-new-game") {
    startNewGeneratedState(interactionModes.play);
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
    activateMode(interactionModes.edit);
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

    const action = normalizeUnitAction(button.dataset.unitAction);
    const currentAction = getCurrentSelectedUnitAction();

    if (action === unitActions.play) {
      queueUnitPlayTask(selectedUnit);
      return;
    }

    if (isCellTargetUnitAction(action) && currentAction === action) {
      selectedUnitAction = unitActions.walk;
      updateUnitActionControls();
      draw();
      return;
    }

    selectedUnitAction = action;
    updateUnitActionControls();
    draw();
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
    openBookOverlayPanel(button);
  });
}

for (const button of closeBookOverlayButtons) {
  button.addEventListener("click", () => {
    closeBookOverlay({ restoreFocus: true });
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

applyStaticText();
populateTerrainMenu();
void requestPersistentStorage();
applyStateSnapshot(createDefaultState(interactionModes.edit), interactionModes.edit, { recenter: false });
resetTileReadout();
updateInteractionModeUi();
loadTileImages();
resizeCanvas();
