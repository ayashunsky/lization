import assert from "node:assert/strict";
import test from "node:test";
import { createSpriteRuntimeApi } from "../game/sprite-runtime.js";

function image(path) {
  return { kind: "image", paths: [path] };
}

function createRuntime(unit, vehicle, mountedUnitConfig) {
  const sources = {
    idle: { W: image("plain-idle") },
    move: { W: { kind: "frames", paths: ["plain-idle", "plain-step"] } },
    cargoIdle: { W: image("bag-idle") },
    cargoMove: { W: { kind: "frames", paths: ["bag-idle", "bag-step"] } },
  };

  return createSpriteRuntimeApi({
    state: {
      getCurrentUnit: () => unit,
      getUnitSpriteConfigs: () => ({ villager: { sources } }),
    },
    manifests: { unitManifestPath: "data/units.json", vehicleManifestPath: "data/vehicles.json" },
    world: {
      getDefaultUnitTypeId: () => "villager",
      normalizeUnitTypeId: (typeId) => typeId,
      getResolvedUnitConfig: () => ({ spriteTypeId: "villager" }),
      getUnitTypeId: (currentUnit) => currentUnit.unitType,
      getMountedVehicle: (currentUnit) => currentUnit.mountedVehicleId ? vehicle : null,
      getConstructibleSpec: () => ({ mountedRenders: { default: { unit: mountedUnitConfig } } }),
      getUnitDisplayDirection: (currentUnit) => currentUnit.facing,
      getUnitMoveProgress: () => 0.5,
      isUnitWorking: () => false,
    },
    render: {},
  });
}

test("a bag-carrying rider uses unit cargo sprites on a boat", () => {
  const unit = {
    unitType: "villager",
    mountedVehicleId: "boat",
    facing: "west",
    cargo: { resourceType: "food", amount: 1 },
  };
  const runtime = createRuntime(unit, { type: "boat" }, { moveSource: "idle", offsetY: -4 });

  assert.equal(runtime.getStationaryUnitImage(unit), "bag-idle");
  unit.move = { direction: "west", mode: "move" };
  assert.equal(runtime.getMovingUnitImage(unit, "west"), "bag-idle");
});

test("mounted cargo sprites take priority when defined", () => {
  const unit = {
    unitType: "villager",
    mountedVehicleId: "boat",
    facing: "west",
    cargo: { resourceType: "food", amount: 1 },
  };
  const runtime = createRuntime(unit, { type: "boat" }, {
    sources: { cargoIdle: { W: image("mounted-bag") } },
  });

  assert.equal(runtime.getStationaryUnitImage(unit), "mounted-bag");
});

test("a loaded wheelbarrow does not put a bag on its rider", () => {
  const unit = { unitType: "villager", mountedVehicleId: "wbarrow", facing: "west", cargo: null };
  const vehicle = { type: "wbarrow", cargo: { resourceType: "food", amount: 1 } };
  const runtime = createRuntime(unit, vehicle, {
    sources: { idle: { W: image("barrow-rider") } },
  });

  assert.equal(runtime.getStationaryUnitImage(unit), "barrow-rider");
});
