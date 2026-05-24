window.APP_RULES = {
  units: {
    default: {
      name: "Schtroumpf",
      stamina: 2,
      workPointsPerTurn: {
        buildHouse: 20,
        demolish: 25,
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
      constructionVisualThresholds: {
        initialMax: 0.34,
        halfMax: 0.79,
      },
      abandonedDecayPerTurn: 0.025,
    },
  },
};
