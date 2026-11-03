import assert from "node:assert/strict";
import test from "node:test";

import {
  getCountByBuildingAllowedCount,
  getReachedCountByBuildingProvider,
} from "../game/constructibles.js";

test("a completed building announces each reached provider-dependent threshold", () => {
  const limits = { countByBuilding: { building: "well", base: 10, perBuilding: 10 } };

  assert.equal(getCountByBuildingAllowedCount(limits.countByBuilding, 0), 10);
  assert.equal(getReachedCountByBuildingProvider(limits, 9, 0), null);
  assert.equal(getReachedCountByBuildingProvider(limits, 10, 0), "well");

  assert.equal(getCountByBuildingAllowedCount(limits.countByBuilding, 1), 20);
  assert.equal(getReachedCountByBuildingProvider(limits, 10, 1), null);
  assert.equal(getReachedCountByBuildingProvider(limits, 19, 1), null);
  assert.equal(getReachedCountByBuildingProvider(limits, 20, 1), "well");
  assert.equal(getReachedCountByBuildingProvider(limits, 20, 2), null);
});

test("no provider notice is shown when it cannot raise the effective limit", () => {
  const countByBuilding = { building: "well", base: 10, perBuilding: 10 };

  assert.equal(getReachedCountByBuildingProvider({ maxCount: 10, countByBuilding }, 10, 0), null);
  assert.equal(getReachedCountByBuildingProvider({ countByBuilding: { ...countByBuilding, perBuilding: 0 } }, 10, 0), null);
  assert.equal(getReachedCountByBuildingProvider({}, 10, 0), null);
});
