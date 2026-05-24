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
        load: "Load",
        save: "Save",
        saveAs: "Save as...",
        nextTurn: "Next turn",
        cancel: "Cancel",
        close: "Close",
      },
      toggles: {
        autoPass: "Auto pass",
      },
      play: {
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
        slotName: "Save slot",
        existingSlots: "Existing saves",
        empty: "No saves yet.",
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
      },
      tasks: {
        move: "moving",
      },
      readouts: {
        mapSize: (width, height) => `${width} x ${height}`,
        turn: (turnNumber) => `Turn: ${turnNumber}`,
        file: (fileName) => `Game name: ${fileName}`,
        fileNone: "Game name: none",
        tileNone: "Tile: none",
        tile: (x, y, terrainLabel, variantLabel = "") =>
          `Tile: ${x}, ${y} | ${terrainLabel}${variantLabel ? ` | ${variantLabel}` : ""}`,
        tileMenuTitle: (x, y) => `Tile ${x}, ${y}`,
        unitNone: "Unit: none",
        unitMoving: (x, y, stamina, staminaMax) =>
          `Unit: moving to ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitTaskMove: (x, y, stamina, staminaMax) =>
          `Unit: moving to ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        unitState: (stateLabel, x, y, stamina, staminaMax) =>
          `Unit: ${stateLabel} | ${x}, ${y} | stamina ${stamina}/${staminaMax}`,
        zoomLevel: (percent) => `${percent}%`,
      },
      messages: {
        missingSaveName: "Please provide a save slot name.",
        saveNotFound: (fileName) => `No save slot named \"${fileName}\" was found.`,
        obsoleteSave: (fileName) => `Save slot \"${fileName}\" is obsolete and cannot be loaded.`,
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
      },
    },
  },
};
