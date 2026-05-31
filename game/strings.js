window.APP_LOCALIZATION = {
  defaultLanguage: "en",
  languages: {
    en: {
      app: {
        title: "Schtroumpfilization",
        editorSubtitle: "Editor",
      },
      actions: {
        menu: "Menu",
        mainMenu: "Main menu",
        newRandomMap: "New random map",
        newEmptyMap: "New empty map",
        wait: "Wait",
        walk: "Walk",
        play: "Play",
        gatherFood: "Gather food",
        gatherMaterials: "Gather materials",
        buildHouse: "Build house",
        demolish: "Demolish",
        load: "Load",
        save: "Save",
        saveAs: "Save as...",
        export: "Export",
        importFile: "Import file...",
        nextTurn: "Next turn",
        cancel: "Cancel",
        close: "Close",
      },
      toggles: {
        autoPass: "Auto pass",
      },
      play: {
        storesTitle: "Stores",
        tileInspectorTitle: "Tile",
        inspectorTitle: "Unit",
      },
      modes: {
        menu: "Menu",
        play: "Play",
        edit: "Edit map",
      },
      menu: {
        watchIntro: "Watch intro",
        startNewGame: "Start new game",
        play: "Play!",
        loadGame: "Load game",
        edit: "Editor",
        importExport: "Import/Export",
        visual: "Visual",
      },
      saveSlots: {
        loadTitle: "Load Save",
        saveAsTitle: "Save As",
        importExportTitle: "Import / Export",
        slotName: "Save slot",
        existingSlots: "Existing saves",
        empty: "No saves yet.",
        obsoleteTag: "obsolete",
        invalidTag: "invalid",
      },
      terrain: {
        water: "Water",
        grass: "Grass",
        forest: "Forest",
        mountain: "Mountains",
      },
      terrainVariants: {
        water_01: "Water 1",
        water_02: "Water 2",
        grass_01: "Grass 1",
        grass_02: "Grass 2",
        forest_01: "Forest 1",
        forest_02: "Forest 2",
        mountain_01: "Mountains 1",
        mountain_02: "Mountains 2",
      },
      unitStates: {
        idle: "idle",
        selected: "selected",
        busy: "busy",
        done: "done",
      },
      resources: {
        stone: "Stone",
        lumber: "Lumber",
        food: "Food",
        grain: "Grain",
        berries: "Berries",
        mushrooms: "Mushrooms",
        fish: "Fish",
      },
      tasks: {
        move: "moving",
        play: "playing",
        gatherFood: "gathering food",
        gatherMaterials: "gathering materials",
        buildHouse: "building house",
        demolish: "demolishing",
      },
      readouts: {
        mapSize: (width, height) => `${width} x ${height}`,
        turn: (turnNumber) => `Turn: ${turnNumber}`,
        file: (fileName) => `Game name: ${fileName}`,
        fileNone: "Game name: none",
        stockpile: (stone, lumber, food, capacity, shortageTurns, shortageLimit) =>
          `Stores: stone ${stone}/${capacity} | lumber ${lumber}/${capacity} | food ${food}/${capacity} | shortage ${shortageTurns}/${shortageLimit}`,
        coords: (x, y) => `Coords: ${x}, ${y}`,
        tileNone: "Tile: none",
        tile: (x, y, terrainLabel, variantLabel = "") =>
          `Tile: ${x}, ${y} | ${terrainLabel}${variantLabel ? ` | ${variantLabel}` : ""}`,
        tileInspectNone: "Tile: none",
        tileInspect: (x, y, terrainLabel, details = "") =>
          details ? `Tile: ${x}, ${y} | ${terrainLabel} | ${details}` : `Tile: ${x}, ${y} | ${terrainLabel}`,
        visits: (count, threshold) => `Visits ${count}/${threshold}`,
        tileMenuTitle: (x, y) => `Tile ${x}, ${y}`,
        unitNone: "Unit: none",
        unitUnselected: (count) =>
          count > 1 ? `Units: ${count} | none selected` : "Unit: none selected",
        unitMoving: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | moving to ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskMove: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | moving to ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskPlay: (name, stamina, staminaMax) =>
          `Unit: ${name} | playing | stamina ${stamina}/${staminaMax}`,
        unitTaskGatherFood: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | gathering food at ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskGatherMaterials: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | gathering materials at ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskBuildHouse: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | building at ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskDemolish: (name, x, y, stamina, staminaMax) =>
          `Unit: ${name} | demolishing at ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitState: (name, stateLabel, x, y, stamina, staminaMax) =>
          `Unit: ${name} | ${stateLabel} | ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        zoomLevel: (percent) => `${percent}%`,
      },
      messages: {
        missingSaveName: "Please provide a save slot name.",
        saveNotFound: (fileName) => `No save slot named \"${fileName}\" was found.`,
        obsoleteSave: (fileName) => `Save slot \"${fileName}\" is obsolete and cannot be loaded.`,
        invalidImportFile: "The selected file is not valid JSON.",
        invalidSaveData: "The selected file does not contain a valid save object.",
      },
      aria: {
        viewport: "Isometric map canvas",
        mainMenu: "Main menu",
        gameMenu: "Game menu",
        saveSlots: "Save slots",
        zoomControls: "Zoom controls",
        zoomOut: "Zoom out",
        zoomIn: "Zoom in",
        terrainMenu: "Terrain",
        variantMenu: "Visual variant",
        unitActions: "Unit actions",
      },
    },
  },
};
