window.APP_RULES = {
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
      wellKnownVisits: 10,
      previewVisits: 5,
      moveCost: 0.7,
    },
  },
  buildings: {
    default: {
      width: 1,
      height: 1,
    },
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
    },
    materials: {
      mountainStonePerTile: 260,
      forestLumberPerTile: 220,
    },
    stockpile: {
      initial: {
        stone: 0,
        lumber: 0,
        food: 18,
      },
    },
    starvation: {
      thresholdTurns: 3,
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
        regrowthPerTurn: 2,
      },
      grain: {
        terrain: "grass",
        max: 14,
        regrowthPerTurn: 2,
        overlayImage: "assets/tiles/resources/grain_overlay.png",
        overlayScale: 1.00,
        overlayBaseYFactor: 0.62,
      },
      berries: {
        terrain: "forest",
        max: 10,
        regrowthPerTurn: 1,
        overlayImage: "assets/tiles/resources/berries_overlay.png",
      },
      mushrooms: {
        terrain: "forest",
        max: 8,
        regrowthPerTurn: 1,
        overlayImage: "assets/tiles/resources/mushrooms_overlay.png",
      },
    },
  },
};
