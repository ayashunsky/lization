window.APP_RULES = {
  units: {
    default: {
      name: "Schtroumpf",
      stamina: 2,
      foodConsumptionPerTurn: 1,
      workPointsPerTurn: {
        buildHouse: 20,
        demolish: 25,
        gatherFood: 4,
        gatherMaterials: 12,
      },
    },
  },
  movement: {
    terrainCost: {
      grass: 1,
      forest: 1,
      mountain: 2,
    },
  },
  buildings: {
    default: {
      width: 1,
      height: 1,
    },
    house: {
      walkable: false,
      constructionCost: 100,
      buildCost: {
        stone: 20,
        lumber: 30,
      },
      constructionVisualThresholds: {
        initialMax: 0.34,
        halfMax: 0.79,
      },
      abandonedDecayPerTurn: 0.025,
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
      capacityPerHouse: 120,
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
