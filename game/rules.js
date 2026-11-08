window.APP_RULES = {
  calendar: {
    seasonTransitions: [
      {
        id: "autumn",
        targetSeason: "autumn",
        start: { month: 8, day: 22 },
        end: { month: 10, day: 21 },
      },
      {
        id: "winter1",
        targetSeason: "winter1",
        start: { month: 10, day: 22 },
        end: { month: 11, day: 21 },
      },
      {
        id: "winter2",
        targetSeason: "winter2",
        start: { month: 11, day: 22 },
        end: { month: 12, day: 21 },
      },
      {
        id: "spring",
        targetSeason: "spring",
        start: { month: 2, day: 22 },
        end: { month: 4, day: 21 },
      },
      {
        id: "summer",
        targetSeason: "summer",
        start: { month: 4, day: 22 },
        end: { month: 5, day: 21 },
      },
    ],
  },
  units: {
    default: {
      typeId: "villager",
    },
    types: {},
  },
  movement: {
    terrainCost: {
      grass: 1,
      forest: 1,
      mountain: 2,
      water: 1,
    },
    paths: {
      wellKnownVisits: 20,
      previewVisits: 10,
      moveCost: 0.7,
    },
  },
  buildings: {
    default: {
      width: 1,
      height: 1,
    },
  },
  buildingPlacement: {
    villageMaxDistance: 3,
  },
  happiness: {
    initial: 100,
    minimum: 0,
    maximum: 500,
    foodDaysSteps: [
      { min: 0, deltaPerTurn: -0.8 },
      { min: 7, deltaPerTurn: -0.3 },
      { min: 14, deltaPerTurn: -0.1 },
      { min: 30, deltaPerTurn: 0 },
      { min: 90, deltaPerTurn: 0.01 },
      { min: 180, deltaPerTurn: 0.05 },
      { min: 360, deltaPerTurn: 0.1 },
    ],
    populationSteps: [
      { min: 0, deltaPerTurn: 0 },
      { min: 10, deltaPerTurn: -0.03 },
      { min: 20, deltaPerTurn: -0.06 },
      { min: 30, deltaPerTurn: -0.12 },
      { min: 40, deltaPerTurn: -0.24 },
      { min: 50, deltaPerTurn: -0.4 },
      { min: 60, deltaPerTurn: -0.5 },
      { min: 70, deltaPerTurn: -0.6 },
      { min: 80, deltaPerTurn: -0.7 },
      { min: 90, deltaPerTurn: -0.8 },
    ],
    waitPerUnitPerTurn: 0.01,
  },
  vehicles: {
    default: {
      width: 1,
      height: 1,
    },
  },
  resources: {
    gathering: {
      durationTurns: 3,
      minimumFoodAmount: 2,
    },
    materials: {
      mountainStonePerTile: 1000,
      forestLumberPerTile: 500,
    },
    stockpile: {
      initial: {
        stone: 0,
        lumber: 0,
        food: 36,
      },
    },
    starvation: {
      thresholdTurns: 7,
      resetAfterUnitLeaves: 0,
    },
    terrainFoodGeneration: {
      grass: {
        chance: 0.2,
        types: [{ id: "grain", weight: 1 }],
      },
      forest: {
        chance: 0.28,
        types: [
          { id: "berries", weight: 3 },
          { id: "mushrooms", weight: 2 },
        ],
      },
    },
    foodTypes: {
      fish: {
        terrain: "water",
        terrainVariants: ["water_01"],
        max: 18,
        regrowthRate: 2 / 18,
      },
      grain: {
        terrain: "grass",
        max: 14,
        regrowthRate: 2 / 14,
        overlayBaseYFactor: 0.62,
        overlayStages: [
          { minFillRatio: 0.66, image: "assets/tiles/resources/grain_overlay.png" },
          { minFillRatio: 0.33, image: "assets/tiles/resources/grain_overlay_1.png" },
          { minFillRatio: 0.01, image: "assets/tiles/resources/grain_overlay_0.png" },
        ],
      },
      berries: {
        terrain: "forest",
        max: 10,
        regrowthRate: 1 / 10,
        overlayStages: [
          { minFillRatio: 0.66, image: "assets/tiles/resources/berries_overlay.png" },
          { minFillRatio: 0.33, image: "assets/tiles/resources/berries_overlay_1.png" },
          { minFillRatio: 0.01, image: "assets/tiles/resources/berries_overlay_0.png" },
        ],
      },
      mushrooms: {
        terrain: "forest",
        max: 8,
        regrowthRate: 1 / 8,
        overlayStages: [
          { minFillRatio: 0.66, image: "assets/tiles/resources/mushrooms_overlay.png" },
          { minFillRatio: 0.33, image: "assets/tiles/resources/mushrooms_overlay_1.png" },
          { minFillRatio: 0.01, image: "assets/tiles/resources/mushrooms_overlay_0.png" },
        ],
      },
    },
  },
};
