const canvas = document.querySelector("#mapCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.querySelector(".viewport");
const mainMenuOverlay = document.querySelector("#mainMenuOverlay");
const playInspector = document.querySelector("#playInspector");
const gameActionMenu = document.querySelector("#gameActionMenu");
const saveSlotOverlay = document.querySelector("#saveSlotOverlay");
const saveSlotPanel = document.querySelector("#saveSlotPanel");
const saveSlotTitle = document.querySelector("#saveSlotTitle");
const saveSlotInput = document.querySelector("#saveSlotInput");
const saveSlotList = document.querySelector("#saveSlotList");
const saveSlotEmpty = document.querySelector("#saveSlotEmpty");
const appTitleElements = [...document.querySelectorAll('[data-role="app-title"]')];
const appSubtitleElements = [...document.querySelectorAll('[data-role="app-subtitle"]')];
const inspectorTitleElements = [...document.querySelectorAll('[data-role="inspector-title"]')];
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
const zoomOutButtons = [...document.querySelectorAll('[data-action="zoom-out"]')];
const zoomInButtons = [...document.querySelectorAll('[data-action="zoom-in"]')];
const zoomLevelReadouts = [...document.querySelectorAll('[data-role="zoom-level"]')];
const unitReadouts = [...document.querySelectorAll('[data-role="unit-readout"]')];
const turnReadouts = [...document.querySelectorAll('[data-role="turn-readout"]')];
const fileReadouts = [...document.querySelectorAll('[data-role="file-readout"]')];
const nextTurnButtons = [...document.querySelectorAll('[data-action="next-turn"]')];
const autoPassInputs = [...document.querySelectorAll('[data-action="auto-pass"]')];
const autoPassLabels = [...document.querySelectorAll('[data-role="auto-pass-label"]')];
const slotNameLabels = [...document.querySelectorAll('[data-role="slot-name-label"]')];
const slotListTitles = [...document.querySelectorAll('[data-role="slot-list-title"]')];
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
const staticUnitsLayerCanvas = document.createElement("canvas");
const staticUnitsLayerCtx = staticUnitsLayerCanvas.getContext("2d");

const rules = window.APP_RULES;
const localization = window.APP_LOCALIZATION;
const currentLanguage = localization?.defaultLanguage || "en";
const strings = localization?.languages?.[currentLanguage];

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
const unitSprite = {
  idleImage: "assets/units/unit_sprite.png",
  northImage: "assets/units/unit_back_sprite.png",
  southImage: "assets/units/unit_front_sprite.png",
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
let unit = null;
let animationFrameId = 0;
let staticLayerDirty = true;
let staticUnitsLayerDirty = true;
let currentDpr = 1;
let currentTurn = 1;
let autoAdvanceTurns = true;
let autoAdvanceQueued = false;
let turnResolutionActive = false;
let activeGameMenuButton = null;
let slotPanelState = null;
const tileImages = {};
const shoreOverlayImages = {};
const unitImages = {};
const saveVersion = 2;
const storageKeys = {
  filePrefix: "schtroumpfilization:save-file:v1:",
  currentFile: {
    edit: "schtroumpfilization:current-file:edit:v1",
    play: "schtroumpfilization:current-file:play:v1",
  },
};
const currentFileNames = {
  edit: null,
  play: null,
};
const autosaveSlotName = "autosave";

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

function applyStaticText() {
  document.documentElement.lang = currentLanguage;
  document.title = strings.app.title;
  viewport.setAttribute("aria-label", strings.aria.viewport);
  terrainMenuOptions.setAttribute("aria-label", strings.aria.terrainMenu);
  variantMenuOptions.setAttribute("aria-label", strings.aria.variantMenu);
  gameActionMenu?.setAttribute("aria-label", strings.aria.gameMenu);
  saveSlotPanel?.setAttribute("aria-label", strings.aria.saveSlots);
  mainMenuOverlay?.setAttribute("aria-label", strings.aria.mainMenu);
  setTextContent(appTitleElements, strings.app.title);
  setTextContent(inspectorTitleElements, strings.play.inspectorTitle);
  setTextContent(gameMenuToggleButtons, strings.actions.menu);
  setTextContent(newRandomMapButtons, strings.actions.newRandomMap);
  setTextContent(newEmptyMapButtons, strings.actions.newEmptyMap);
  setTextContent(loadStateButtons, strings.actions.load);
  setTextContent(saveStateButtons, strings.actions.save);
  setTextContent(saveStateAsButtons, strings.actions.saveAs);
  setTextContent(openMainMenuButtons, strings.actions.mainMenu);
  setTextContent(nextTurnButtons, strings.actions.nextTurn);
  setTextContent(autoPassLabels, strings.toggles.autoPass);
  setTextContent(slotNameLabels, strings.saveSlots.slotName);
  setTextContent(slotListTitles, strings.saveSlots.existingSlots);
  setTextContent(confirmSlotPanelButtons, strings.actions.save);
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
  setAttributeForElements(zoomControlGroups, "aria-label", strings.aria.zoomControls);
  setAttributeForElements(zoomOutButtons, "aria-label", strings.aria.zoomOut);
  setAttributeForElements(zoomInButtons, "aria-label", strings.aria.zoomIn);
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

function getAppSubtitleText() {
  if (mainMenuOpen || !interactionMode) return "";
  if (interactionMode === interactionModes.edit) return strings.app.editorSubtitle;
  return "";
}

function updatePersistenceControls() {
  const disabled =
    !interactionMode ||
    turnResolutionActive ||
    getUnits().some((currentUnit) => isUnitAnimating(currentUnit));

  setDisabledState(loadStateButtons, disabled);
  setDisabledState(saveStateButtons, disabled);
  setDisabledState(saveStateAsButtons, disabled);
  updateFileReadout();
}

function getDefaultUnitStamina() {
  return Math.max(1, clampInteger(rules.units?.default?.stamina, 1, 999, 2));
}

function getUnitMaxStamina(currentUnit) {
  return Math.max(1, clampInteger(currentUnit?.staminaMax, 1, 999, getDefaultUnitStamina()));
}

function getUnitStamina(currentUnit) {
  return Math.max(0, clampInteger(currentUnit?.stamina, 0, 999, getUnitMaxStamina(currentUnit)));
}

function getTerrainMoveCost(cell) {
  if (!cell) return Number.POSITIVE_INFINITY;

  const configuredCost = rules.movement?.terrainCost?.[cell.type];

  if (!Number.isFinite(configuredCost)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(1, configuredCost);
}

function getSaveSlotNames() {
  const names = [];

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (!key || !key.startsWith(storageKeys.filePrefix)) continue;

      names.push(decodeURIComponent(key.slice(storageKeys.filePrefix.length)));
    }
  } catch (error) {
    console.warn("Could not enumerate save slots.", error);
  }

  return names.sort((a, b) => a.localeCompare(b, currentLanguage));
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

function renderSaveSlotList() {
  if (!saveSlotList || !saveSlotEmpty) return;

  const saveNames = getSaveSlotNames();
  saveSlotList.replaceChildren();
  saveSlotEmpty.hidden = saveNames.length > 0;

  for (const saveName of saveNames) {
    const button = document.createElement("button");
    const isSelected = slotPanelState?.value === saveName;

    button.type = "button";
    button.className = "slot-panel-item";
    button.textContent = saveName;
    button.dataset.slotName = saveName;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", isSelected ? "true" : "false");
    saveSlotList.append(button);
  }
}

function updateSaveSlotPanel() {
  if (!slotPanelState || !saveSlotOverlay || !saveSlotTitle || !saveSlotInput) return;

  saveSlotTitle.textContent =
    slotPanelState.mode === "load" ? strings.saveSlots.loadTitle : strings.saveSlots.saveAsTitle;
  setTextContent(
    confirmSlotPanelButtons,
    slotPanelState.mode === "load" ? strings.actions.load : strings.actions.save,
  );
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

function commitSaveSlotPanel() {
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

function serializeCell(cell) {
  return {
    type: cell.type,
    variant: ensureCellVariant(cell),
    visited: Boolean(cell.visited),
  };
}

function serializeTask(task) {
  if (!task || task.type !== "move") return null;

  return {
    type: "move",
    toX: clampInteger(task.toX, 0, map.width - 1, 0),
    toY: clampInteger(task.toY, 0, map.height - 1, 0),
  };
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
      x: currentUnit.move.toX,
      y: currentUnit.move.toY,
      facing: currentUnit.move.direction || currentUnit.facing || "west",
      staminaMax: getUnitMaxStamina(currentUnit),
      stamina: getUnitStamina(currentUnit),
      task: didReachDestination ? null : serializeTask(currentUnit.task),
    };
  }

  return {
    id: currentUnit.id || "unit_01",
    x: currentUnit.x,
    y: currentUnit.y,
    facing: currentUnit.facing || "west",
    staminaMax: getUnitMaxStamina(currentUnit),
    stamina: getUnitStamina(currentUnit),
    task: serializeTask(currentUnit.task),
  };
}

function serializeCells(cells = map.cells) {
  return cells.map((row) => row.map((cell) => serializeCell(cell)));
}

function serializeCurrentState(mode = interactionMode) {
  return {
    version: saveVersion,
    map: {
      width: map.width,
      height: map.height,
      cells: serializeCells(),
    },
    units: unit ? [serializeUnit(unit)] : [],
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

function saveStateToFile(fileName, mode = interactionMode) {
  const normalizedName = sanitizeFileName(fileName);

  if (!normalizedName) return false;

  const didSave = writeSaveFile(normalizedName, serializeCurrentState(mode));

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

function isCompatibleSaveState(state) {
  return Boolean(state) && state.version === saveVersion;
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
      row.push(createCell(x, y, "grass"));
    }

    cells.push(row);
  }

  return cells;
}

function markCellsVisitedByUnits(cells, units) {
  if (!Array.isArray(cells) || !Array.isArray(units)) return;

  for (const currentUnit of units) {
    if (!currentUnit) continue;

    const cell = cells[currentUnit.y]?.[currentUnit.x];

    if (cell) {
      cell.visited = true;
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
        x: spawn.x,
        y: spawn.y,
        facing: "west",
        staminaMax: getDefaultUnitStamina(),
        stamina: getDefaultUnitStamina(),
        task: null,
        turnRoute: null,
      }
    : null;
}

function createGeneratedState(mode, buildCells = buildGeneratedMapCells) {
  const width = defaultMapConfig.width;
  const height = defaultMapConfig.height;
  const cells = buildCells(width, height);
  const defaultUnit = createDefaultUnitState(cells, width, height);
  const units = defaultUnit ? [defaultUnit] : [];

  markCellsVisitedByUnits(cells, units);

  return {
    version: saveVersion,
    map: {
      width,
      height,
      cells: serializeCells(cells),
    },
    units,
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
    const sourceRow = Array.isArray(rawMap.cells[y]) ? rawMap.cells[y] : [];

    for (let x = 0; x < width; x += 1) {
      const sourceCell = sourceRow[x];

      if (!sourceCell || !terrain[sourceCell.type]) continue;

      const cell = generatedCells[y][x];
      cell.type = sourceCell.type;
      if (typeof sourceCell.visited !== "boolean") {
        throw new Error("Missing explored state in map cell.");
      }
      cell.visited = sourceCell.visited;

      const variants = getTerrainVariants(cell.type);
      cell.variant = variants.some((variant) => variant.id === sourceCell.variant)
        ? sourceCell.variant
        : chooseTerrainVariant(cell.type);
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

      if (!canUnitEnter(cell)) continue;

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
  if (!task || task.type !== "move") return null;

  const toX = clampInteger(task.toX, 0, map.width - 1, currentX);
  const toY = clampInteger(task.toY, 0, map.height - 1, currentY);
  const destinationCell = getCell(toX, toY);

  if (!canUnitEnter(destinationCell)) return null;
  if (toX === currentX && toY === currentY) return null;

  return {
    type: "move",
    toX,
    toY,
  };
}

function preserveTask(task) {
  if (!task || task.type !== "move") return null;

  return {
    type: "move",
    toX: clampInteger(task.toX, 0, map.width - 1, 0),
    toY: clampInteger(task.toY, 0, map.height - 1, 0),
  };
}

function normalizeUnitsState(rawUnits, mode) {
  const sourceUnit = Array.isArray(rawUnits) ? rawUnits[0] : null;

  if (!sourceUnit) {
    if (mode !== interactionModes.play) return [];

    const fallbackUnit = createDefaultUnitState(map.cells, map.width, map.height);
    return fallbackUnit ? [{ ...fallbackUnit, selected: false, move: null, turnRoute: null }] : [];
  }

  if (mode !== interactionModes.play) {
    return [
      {
        id: typeof sourceUnit.id === "string" ? sourceUnit.id : "unit_01",
        x: clampInteger(sourceUnit.x, 0, map.width - 1, Math.floor(map.width / 2)),
        y: clampInteger(sourceUnit.y, 0, map.height - 1, Math.floor(map.height / 2)),
        facing: normalizeDirection(sourceUnit.facing),
        staminaMax: Math.max(1, clampInteger(sourceUnit.staminaMax, 1, 999, getDefaultUnitStamina())),
        stamina: Math.max(
          0,
          clampInteger(sourceUnit.stamina, 0, 999, clampInteger(sourceUnit.staminaMax, 1, 999, getDefaultUnitStamina())),
        ),
        selected: false,
        task: preserveTask(sourceUnit.task),
        move: null,
        turnRoute: null,
        lastStepFromX: null,
        lastStepFromY: null,
      },
    ];
  }

  let x = clampInteger(sourceUnit.x, 0, map.width - 1, Math.floor(map.width / 2));
  let y = clampInteger(sourceUnit.y, 0, map.height - 1, Math.floor(map.height / 2));
  let cell = getCell(x, y);

  if (!canUnitEnter(cell)) {
    const fallbackCell = findNearestPassableCell(x, y);

    if (!fallbackCell) return [];

    x = fallbackCell.x;
    y = fallbackCell.y;
    cell = fallbackCell;
  }

  return [
    {
      id: typeof sourceUnit.id === "string" ? sourceUnit.id : "unit_01",
      x: cell.x,
      y: cell.y,
      facing: normalizeDirection(sourceUnit.facing),
      staminaMax: Math.max(1, clampInteger(sourceUnit.staminaMax, 1, 999, getDefaultUnitStamina())),
      stamina: Math.max(
        0,
        clampInteger(sourceUnit.stamina, 0, 999, clampInteger(sourceUnit.staminaMax, 1, 999, getDefaultUnitStamina())),
      ),
      selected: false,
      task: normalizeTask(sourceUnit.task, cell.x, cell.y),
      move: null,
      turnRoute: null,
      lastStepFromX: null,
      lastStepFromY: null,
    },
  ];
}

function applyStateSnapshot(state, mode, { recenter = true } = {}) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  autoAdvanceQueued = false;
  clearEditHoverState();
  hideTileMenu();

  const nextState = state || createDefaultState(mode);
  const nextMap = normalizeMapState(nextState.map);

  map.width = nextMap.width;
  map.height = nextMap.height;
  map.cells = nextMap.cells;
  unit = normalizeUnitsState(nextState.units, mode)[0] || null;
  currentTurn = Math.max(1, clampInteger(nextState.turn, 1, 999999, 1));
  autoAdvanceTurns =
    typeof nextState.autoAdvanceTurns === "boolean" ? nextState.autoAdvanceTurns : true;

  setTextContent(mapSizeReadouts, strings.readouts.mapSize(map.width, map.height));
  resetTileReadout();
  invalidateStaticLayer();
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateTurnControls();
  updateInteractionModeUi();
  layoutCanvas();

  if (recenter) {
    requestAnimationFrame(() => restoreViewportCenter({ x: 0.5, y: 0.5 }));
  }

  draw();
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

  openSaveSlotPanel("load");
  return true;
}

function saveStateAs(mode = interactionMode) {
  if (!mode) return false;

  openSaveSlotPanel("saveAs");
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
  return unit ? [unit] : [];
}

function hasAssignedTask(currentUnit) {
  return Boolean(currentUnit?.task);
}

function isUnitAnimating(currentUnit) {
  return Boolean(currentUnit?.move);
}

function isUnitIdle(currentUnit) {
  return Boolean(currentUnit) && !hasAssignedTask(currentUnit) && !isUnitAnimating(currentUnit);
}

function everyUnitHasOngoingTask() {
  const units = getUnits();

  return units.length > 0 && units.every((currentUnit) => hasAssignedTask(currentUnit));
}

function canAdvanceTurn() {
  return (
    !mainMenuOpen &&
    isPlayMode() &&
    !turnResolutionActive &&
    !getUnits().some((currentUnit) => isUnitAnimating(currentUnit))
  );
}

function updateTurnReadout() {
  setTextContent(turnReadouts, strings.readouts.turn(currentTurn));
}

function updateTurnControls() {
  updateTurnReadout();
  setCheckedState(autoPassInputs, autoAdvanceTurns);
  setDisabledState(nextTurnButtons, !canAdvanceTurn());
  updatePersistenceControls();
}

function createMoveTask(destinationCell) {
  return {
    type: "move",
    toX: destinationCell.x,
    toY: destinationCell.y,
  };
}

function queueUnitMoveTask(destinationCell) {
  if (!unit || unit.move) return;
  if (!canUnitEnter(destinationCell)) return;
  if (destinationCell.x === unit.x && destinationCell.y === unit.y) return;

  unit.task = createMoveTask(destinationCell);
  unit.turnRoute = null;
  unit.lastStepFromX = null;
  unit.lastStepFromY = null;
  updateUnitReadout();
  updateTurnControls();
  draw();
  maybeAutoAdvanceTurn();
}

function resolveUnitTask(currentUnit) {
  if (!currentUnit?.task) return false;
  if (currentUnit.task.type !== "move") {
    currentUnit.task = null;
    currentUnit.turnRoute = null;
    return false;
  }

  if (currentUnit.x === currentUnit.task.toX && currentUnit.y === currentUnit.task.toY) {
    currentUnit.task = null;
    currentUnit.turnRoute = null;
    return false;
  }

  const nextMove = getNextMoveStep(currentUnit, currentUnit.task);

  if (!nextMove) {
    currentUnit.task = null;
    currentUnit.turnRoute = null;
    return false;
  }

  const moveCost = getTerrainMoveCost(nextMove.cell);
  currentUnit.stamina = Math.max(0, getUnitStamina(currentUnit) - moveCost);

  startUnitMove(nextMove.cell, nextMove.direction);
  return true;
}

function resetUnitsForTurn() {
  for (const currentUnit of getUnits()) {
    currentUnit.stamina = getUnitMaxStamina(currentUnit);
    currentUnit.turnRoute = null;
  }
}

function continueTurnResolution() {
  let startedAnimatedTask = false;

  for (const currentUnit of getUnits()) {
    if (!currentUnit.task || currentUnit.move) {
      continue;
    }

    if (getUnitStamina(currentUnit) <= 0) {
      continue;
    }

    startedAnimatedTask = resolveUnitTask(currentUnit) || startedAnimatedTask;

    if (startedAnimatedTask) {
      break;
    }
  }

  updateUnitReadout();
  updateTurnControls();
  draw();

  if (startedAnimatedTask) {
    return;
  }

  turnResolutionActive = false;
  autosavePlayState();
  updateTurnControls();

  if (!startedAnimatedTask) {
    maybeAutoAdvanceTurn();
  }
}

function advanceTurn() {
  if (!canAdvanceTurn()) return;

  currentTurn += 1;
  turnResolutionActive = true;
  resetUnitsForTurn();
  continueTurnResolution();
}

function maybeAutoAdvanceTurn() {
  if (autoAdvanceQueued) return;
  if (!autoAdvanceTurns || !canAdvanceTurn() || !everyUnitHasOngoingTask()) {
    updateTurnControls();
    return;
  }

  autoAdvanceQueued = true;
  requestAnimationFrame(() => {
    autoAdvanceQueued = false;

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

  for (const imagePath of getShoreOverlayPaths()) {
    loadImage(imagePath, shoreOverlayImages);
  }

  loadImage(unitSprite.idleImage, unitImages);
  loadImage(unitSprite.northImage, unitImages);
  loadImage(unitSprite.southImage, unitImages);

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
    draw();
  };
  image.onerror = () => {
    console.warn(`Could not load image: ${imagePath}`);
    invalidateStaticLayer();
    invalidateStaticUnitsLayer();
    draw();
  };
  image.src = imagePath;
  registry[imagePath] = image;
}

function createCell(x, y, type) {
  return {
    x,
    y,
    type,
    variant: chooseTerrainVariant(type),
    visited: false,
  };
}

function setCellTerrain(cell, type) {
  if (cell.type !== type) {
    cell.type = type;
    cell.variant = chooseTerrainVariant(type);
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

function makeMap() {
  map.cells = buildGeneratedMapCells(map.width, map.height);
  setTextContent(mapSizeReadouts, strings.readouts.mapSize(map.width, map.height));
  invalidateStaticLayer();
}

function initializeUnit() {
  const spawn = createDefaultUnitState(map.cells, map.width, map.height);

  unit = spawn ? { ...spawn, selected: false, move: null, turnRoute: null } : null;

  invalidateStaticUnitsLayer();
  updateUnitReadout();
}

function findNearestPassableCell(startX, startY) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = getCell(x, y);

      if (!canUnitEnter(cell)) continue;

      const cellDistance = distance(x, y, startX, startY);

      if (cellDistance >= bestDistance) continue;

      best = cell;
      bestDistance = cellDistance;
    }
  }

  return best;
}

function canUnitEnter(cell) {
  return Boolean(cell) && cell.type !== "water";
}

function updateUnitReadout() {
  if (!unit) {
    setTextContent(unitReadouts, strings.readouts.unitNone);
    return;
  }

  const stamina = getUnitStamina(unit);
  const staminaMax = getUnitMaxStamina(unit);

  if (unit.move) {
    setTextContent(unitReadouts, strings.readouts.unitMoving(unit.move.toX, unit.move.toY, stamina, staminaMax));
    return;
  }

  if (unit.task?.type === "move") {
    setTextContent(
      unitReadouts,
      strings.readouts.unitTaskMove(unit.task.toX, unit.task.toY, stamina, staminaMax),
    );
    return;
  }

  const state = unit.selected ? strings.unitStates.selected : strings.unitStates.idle;
  setTextContent(unitReadouts, strings.readouts.unitState(state, unit.x, unit.y, stamina, staminaMax));
}

function getVisibleTopBarMode() {
  if (mainMenuOpen || !interactionMode) return "menu";
  return interactionMode;
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

  for (const button of newRandomMapButtons) {
    button.hidden = !isEditMode();
  }

  for (const button of newEmptyMapButtons) {
    button.hidden = !isEditMode();
  }

  setTextContent(appSubtitleElements, getAppSubtitleText());
  canvas.dataset.mode = interactionMode || "";

  updateTurnControls();
  updatePersistenceControls();
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
  if (!unit?.selected) return;

  unit.selected = false;
  invalidateStaticUnitsLayer();
  updateUnitReadout();
}

function openMainMenu() {
  closeGameActionMenu();
  closeSaveSlotPanel();
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

  interactionMode = nextMode;
  mainMenuOpen = false;
  mainMenuOverlay.hidden = true;
  closeGameActionMenu();
  closeSaveSlotPanel();
  clearEditHoverState();
  clearUnitSelection();
  invalidateStaticUnitsLayer();

  updateInteractionModeUi();

  if (didChange) {
    draw();
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

function getUnitMoveTargets() {
  if (!unit || !unit.task) return [];

  const destinationCell = getCell(unit.task.toX, unit.task.toY);

  if (!destinationCell) return [];

  return [destinationCell];
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

    if (!canUnitEnter(neighbor)) continue;
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

    const moveCost = getTerrainMoveCost(neighbor);
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

  if (!unit || unit.move) return;

  if (!cell) {
    unit.selected = false;
    invalidateStaticUnitsLayer();
    updateUnitReadout();
    draw();
    return;
  }

  if (cell.x === unit.x && cell.y === unit.y) {
    unit.selected = !unit.selected;
    invalidateStaticUnitsLayer();
    updateUnitReadout();
    draw();
    return;
  }

  if (unit.selected && canUnitEnter(cell)) {
    queueUnitMoveTask(cell);
    return;
  }

  unit.selected = false;
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  draw();
}

function startUnitMove(destinationCell, direction = getMoveDirection(unit.x, unit.y, destinationCell.x, destinationCell.y)) {
  if (!unit) return;

  unit.move = {
    fromX: unit.x,
    fromY: unit.y,
    toX: destinationCell.x,
    toY: destinationCell.y,
    direction,
    startedAt: performance.now(),
  };
  invalidateStaticUnitsLayer();
  updateUnitReadout();
  updateTurnControls();
  scheduleAnimation();
  draw();
}

function scheduleAnimation() {
  if (animationFrameId) return;

  animationFrameId = requestAnimationFrame(stepAnimations);
}

function stepAnimations(now) {
  animationFrameId = 0;
  let needsAnotherFrame = false;

  if (unit?.move) {
    const progress = getUnitMoveProgress(now);

    if (progress >= 1) {
      const moveToX = unit.move.toX;
      const moveToY = unit.move.toY;
      const moveFromX = unit.move.fromX;
      const moveFromY = unit.move.fromY;

      unit.x = unit.move.toX;
      unit.y = unit.move.toY;
      unit.facing = unit.move.direction || unit.facing;
      unit.lastStepFromX = moveFromX;
      unit.lastStepFromY = moveFromY;
      unit.move = null;
      const destinationCell = getCell(unit.x, unit.y);

      if (destinationCell && !destinationCell.visited) {
        destinationCell.visited = true;
        invalidateStaticLayer();
      }

      if (unit.task?.type === "move" && unit.task.toX === moveToX && unit.task.toY === moveToY) {
        unit.task = null;
        unit.turnRoute = null;
      }

      invalidateStaticUnitsLayer();
      updateUnitReadout();
      updateTurnControls();

      if (turnResolutionActive) {
        continueTurnResolution();
        return;
      }

      maybeAutoAdvanceTurn();
    } else {
      needsAnotherFrame = true;
    }
  }

  draw();

  if (needsAnotherFrame) {
    scheduleAnimation();
  }
}

function getUnitMoveProgress(now = performance.now()) {
  if (!unit?.move) return 1;

  const elapsed = now - unit.move.startedAt;
  return clamp(elapsed / unitSprite.moveDuration, 0, 1);
}

function getUnitScreenPosition(now = performance.now()) {
  if (!unit) return null;
  if (!unit.move) return isoToScreen(unit.x, unit.y);

  const progress = easeInOut(getUnitMoveProgress(now));
  const from = isoToScreen(unit.move.fromX, unit.move.fromY);
  const to = isoToScreen(unit.move.toX, unit.move.toY);

  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
  };
}

function getUnitGroundPoint(screen) {
  return {
    x: screen.x,
    y: screen.y + tile.height * unitSprite.groundOffset,
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

function usesNorthUnitSprite(direction) {
  return direction === "north";
}

function usesSouthUnitSprite(direction) {
  return direction === "south";
}

function getStationaryUnits() {
  if (interactionMode !== interactionModes.play || !unit || unit.move || unit.selected) {
    return [];
  }

  return [unit];
}

function getMovingUnit() {
  return unit?.move ? unit : null;
}

function compareUnitsByDrawOrder(a, b) {
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
}

function drawUnitTargets() {
  if (interactionMode !== interactionModes.play || !unit || !unit.selected) {
    return;
  }

  for (const cell of getUnitMoveTargets()) {
    const screen = isoToScreen(cell.x, cell.y);
    drawDiamondPath(screen.x, screen.y);
    ctx.fillStyle = "rgba(98, 198, 136, 0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(152, 236, 185, 0.62)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawSelectedUnitMarker() {
  if (interactionMode !== interactionModes.play || !unit?.selected) return;

  const screen = getUnitScreenPosition();

  if (!screen) return;

  const centerY = screen.y + tile.height * 0.66;

  ctx.save();
  ctx.fillStyle = "rgba(232, 145, 190, 0.5)";
  ctx.beginPath();
  ctx.ellipse(
    screen.x,
    centerY,
    tile.width * 0.28,
    tile.height * 0.11,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(240, 171, 209, 0.96)";
  ctx.lineWidth = Math.max(1.5, 2 * zoomLevels[zoomIndex]);
  ctx.beginPath();
  ctx.ellipse(
    screen.x,
    centerY,
    tile.width * 0.28,
    tile.height * 0.11,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  ctx.restore();
}

function drawMovingUnit() {
  if (interactionMode !== interactionModes.play) return;

  const movingUnit = getMovingUnit();

  if (!movingUnit) return;

  const screen = getUnitScreenPosition();
  const direction = movingUnit.move?.direction || movingUnit.facing || "west";
  const imagePath = getMovingUnitImage(direction);

  if (!screen) return;

  drawUnitAtScreen(screen, ctx, imagePath, shouldMirrorUnitDirection(direction), !movingUnit.selected);
}

function drawSelectedStationaryUnit() {
  if (interactionMode !== interactionModes.play || !unit || unit.move || !unit.selected) {
    return;
  }

  drawUnitAtScreen(
    isoToScreen(unit.x, unit.y),
    ctx,
    getStationaryUnitImage(unit.facing),
    shouldMirrorUnitDirection(unit.facing),
    false,
  );
}

function drawStationaryUnits(drawContext = ctx) {
  const stationaryUnits = getStationaryUnits().slice().sort(compareUnitsByDrawOrder);

  for (const stationaryUnit of stationaryUnits) {
    drawUnitAtScreen(
      isoToScreen(stationaryUnit.x, stationaryUnit.y),
      drawContext,
      getStationaryUnitImage(stationaryUnit.facing),
      shouldMirrorUnitDirection(stationaryUnit.facing),
      !stationaryUnit.selected,
    );
  }
}

function getStationaryUnitImage(direction = "west") {
  if (usesNorthUnitSprite(direction)) {
    return unitSprite.northImage;
  }

  if (usesSouthUnitSprite(direction)) {
    return unitSprite.southImage;
  }

  return unitSprite.idleImage;
}

function getMovingUnitImage(direction = "west", now = performance.now()) {
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
    !unit?.move ||
    moveFrames.length === 0 ||
    unitSprite.moveFrameSequence.length === 0
  ) {
    return fallbackImage;
  }

  const progress = getUnitMoveProgress(now);
  const phaseIndex = Math.min(
    unitSprite.moveFrameSequence.length - 1,
    Math.floor(progress * unitSprite.moveFrameSequence.length),
  );
  const frameIndex = unitSprite.moveFrameSequence[phaseIndex];

  return moveFrames[frameIndex] || fallbackImage;
}

function drawUnitAtScreen(
  screen,
  drawContext = ctx,
  imagePath = unitSprite.idleImage,
  mirrorX = false,
  showShadow = true,
) {
  const image = unitImages[imagePath];
  const drawWidth = unitSprite.width * zoomLevels[zoomIndex];
  const drawHeight = unitSprite.height * zoomLevels[zoomIndex];
  const drawX = screen.x - unitSprite.anchorX * zoomLevels[zoomIndex];
  const ground = getUnitGroundPoint(screen);
  const groundY = ground.y;
  const drawY = groundY - unitSprite.anchorY * zoomLevels[zoomIndex];

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

  return {
    width: Math.ceil(
      Math.max(
        mapPixelSize.width + canvasPadding * 2,
        viewport.clientWidth + canvasPadding * 2,
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

function drawTile(cell) {
  if (!isCellVisibleToPlayer(cell)) {
    return;
  }

  const screen = isoToScreen(cell.x, cell.y);
  const spec = terrain[cell.type];
  const lift = 0;

  drawTileBase(cell, screen, lift, spec);
  drawTerrainTransitions(cell, screen, lift);
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
  if (
    staticUnitsLayerCanvas.width === canvas.width &&
    staticUnitsLayerCanvas.height === canvas.height
  ) {
    return;
  }

  staticUnitsLayerCanvas.width = canvas.width;
  staticUnitsLayerCanvas.height = canvas.height;
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
      drawTile(map.cells[y][x]);
    }
  }
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
  staticUnitsLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  staticUnitsLayerCtx.clearRect(0, 0, staticUnitsLayerCanvas.width, staticUnitsLayerCanvas.height);
  staticUnitsLayerCtx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
  drawStationaryUnits(staticUnitsLayerCtx);
  staticUnitsLayerDirty = false;
}

function restoreStaticLayerToMain() {
  clearMainCanvas();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(staticLayerCanvas, 0, 0);
  ctx.restore();
}

function restoreStaticUnitsLayerToMain() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(staticUnitsLayerCanvas, 0, 0);
  ctx.restore();
}

function drawDynamicLayer() {
  drawInteractiveTileOverlays();

  if (interactionMode === interactionModes.play) {
    restoreStaticUnitsLayerToMain();
    drawSelectedUnitMarker();
    drawUnitTargets();
    drawSelectedStationaryUnit();
    drawMovingUnit();
  }
}

function draw() {
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

  drawDynamicLayer();
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
  return {
    x: (viewport.scrollLeft + viewport.clientWidth / 2) / Math.max(1, canvas.offsetWidth),
    y: (viewport.scrollTop + viewport.clientHeight / 2) / Math.max(1, canvas.offsetHeight),
  };
}

function restoreViewportCenter(center) {
  const maxLeft = Math.max(0, canvas.offsetWidth - viewport.clientWidth);
  const maxTop = Math.max(0, canvas.offsetHeight - viewport.clientHeight);

  viewport.scrollLeft = clamp(
    canvas.offsetWidth * center.x - viewport.clientWidth / 2,
    0,
    maxLeft,
  );
  viewport.scrollTop = clamp(
    canvas.offsetHeight * center.y - viewport.clientHeight / 2,
    0,
    maxTop,
  );
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
  invalidateStaticLayer();
  setTileReadout(activeCell);
  hideTileMenu();
});

document.addEventListener("pointerdown", (event) => {
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
  if (event.key !== "Escape") return;

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

  if (interactionMode === interactionModes.play && unit?.selected) {
    clearUnitSelection();
    draw();
    return;
  }

  openMainMenu();
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
    openSaveSlotPanel("load", { targetMode: interactionModes.play });
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
    commitSaveSlotPanel();
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
  commitSaveSlotPanel();
});

saveSlotList?.addEventListener("click", (event) => {
  const button = event.target.closest(".slot-panel-item");

  if (!button || !slotPanelState) return;

  const slotName = button.dataset.slotName || "";
  slotPanelState.value = slotName;
  saveSlotInput.value = slotName;
  renderSaveSlotList();

  if (slotPanelState.mode === "load") {
    commitSaveSlotPanel();
  }
});

for (const input of autoPassInputs) {
  input.addEventListener("change", (event) => {
    autoAdvanceTurns = event.target.checked;
    updateTurnControls();
    maybeAutoAdvanceTurn();
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
