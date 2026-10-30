# Units Data File

File: `game/data/units.json`

This file currently defines:
- base unit stats
- language-specific labels
- unit type overrides
- sprite type catalogs
- action lists per unit type
- spawn pool and guaranteed-presence rules
- availability requirements
- conditional gameplay modifiers

## File Shape

```json
{
  "default": { ... },
  "types": {
    "<unitTypeId>": { ... }
  },
  "spawnRules": { ... },
  "spriteTypes": {
    "<spriteTypeId>": { ... }
  }
}
```

Image paths are resolved relative to `game/data/units.json`.

## `default`

The default unit configuration. This is also the fallback layer merged into every specific unit type.

Supported fields:

- `typeId`
- `spriteTypeId`
- `bookPageId`
- `name`
- `labels`
- `stamina`
- `carryingCapacity`
- `foodConsumptionPerTurn`
- `researchPointsPerTurn`
- `allowedActions`
- `plantedFoodCapacities`
- `workPointsPerTurn`
- `availability`
- `actionRequirements`
- `modifiers`

Example:

```json
"default": {
  "typeId": "villager",
  "spriteTypeId": "villager",
  "name": "Schtroumpf",
  "labels": {
    "fr": "Schtroumpf",
    "en": "Smurf"
  },
  "stamina": 2,
  "carryingCapacity": 24,
  "foodConsumptionPerTurn": 1,
  "researchPointsPerTurn": 0,
  "allowedActions": ["walk", "play", "gatherFood", "plant"],
  "plantedFoodCapacities": {
    "grain": 14
  },
  "actionRequirements": {
    "buildHouse": {
      "requiredTechs": ["house_construction"]
    }
  },
  "workPointsPerTurn": {
    "gatherFood": 4
  }
}
```

`labels` is an optional map of localized display names by language id (`fr`, `en`, `es`, `ru`, ...).
Unit names are derived from their type when displayed; `name` is the fallback if no localized label exists.
Changing language also changes existing units' displayed names.

The `play` action id is displayed as Wait. It retains the existing `play` sprites and saved-task id.

`carryingCapacity` is the maximum amount a unit can carry at once, regardless of resource type.
It defaults to `24` and can be overridden per unit type or by a matching modifier.
The current load is saved on the unit as `cargo: { "resourceType": "food", "amount": 8 }`;
all food types share one load. Empty loads are saved as `null`.
Gathering fills cargo, not the village stockpile. A loaded unit can walk or gather more of the same
resource category (food, stone, or lumber); a full unit can only walk. Landing adjacent to a completed
building that stores that resource unloads as much as the shared stockpile can accept. Any remainder
stays in cargo. Automatic travel between the resource and storage is not yet implemented.

## `types.<unitTypeId>`

Per-type overrides merged over `default`.

Supported fields:

- `spriteTypeId`
- `bookPageId`
- `name`
- `labels`
- `stamina`
- `carryingCapacity`
- `foodConsumptionPerTurn`
- `researchPointsPerTurn`
- `allowedActions`
- `plantedFoodCapacities`
- `workPointsPerTurn`
- `availability`
- `actionRequirements`
- `modifiers`

Example:

```json
"grandSchtroumpf": {
  "spriteTypeId": "grandSchtroumpf",
  "bookPageId": "grand_schtroumpf",
  "name": "Grand Schtroumpf",
  "labels": {
    "fr": "Grand Schtroumpf",
    "en": "Papa Smurf"
  },
  "allowedActions": ["walk", "layFoundation"],
  "actionRequirements": {
    "layFoundation": {
      "requiredBuildingsMin": {
        "house": 1
      }
    }
  }
}
```

`bookPageId` is optional. When present, UI elements can open the matching unit page directly in the book.
Book portraits are referenced directly from each book page, using paths relative to that page.

## Unit Requirements

`availability` and `actionRequirements.<actionId>` use the same requirement schema as buildings.

Supported fields:

- `requiredTechs`
- `requiredEvents`
- `requiredBuildingsMin`
- `requiredUnitsPresent`
- `requiredUnitsAbsent`
- `nextUnitNumberEquals`

Example:

```json
"availability": {
  "requiredTechs": ["village_elder"]
}
```

To explicitly clear an inherited action requirement for one action, set that action to `null`:

```json
"actionRequirements": {
  "plant": null
}
```

This removes the inherited requirement block for `plant` instead of merging with it.

## `modifiers`

Optional ordered list of conditional gameplay overrides.

Each entry can have:

- `when`: requirement block
- `set`: partial override block
- `addActions`: action ids to add when the modifier matches
- `removeActions`: action ids to remove when the modifier matches

Supported `set` fields:

- `name`
- `stamina`
- `carryingCapacity`
- `foodConsumptionPerTurn`
- `researchPointsPerTurn`
- `allowedActions`
- `plantedFoodCapacities`
- `workPointsPerTurn`
- `actionRequirements`

Inside `set.actionRequirements`, `null` has the same meaning: it clears the inherited requirement
for that action instead of merging with it.

Example:

```json
"modifiers": [
  {
    "when": {
      "requiredBuildingsMin": {
        "laboratory": 1
      }
    },
    "set": {
      "workPointsPerTurn": {
        "gatherMaterials": 16
      }
    },
    "addActions": ["layFoundation"]
  }
]
```

Notes:
- modifiers are applied in order
- `addActions` and `removeActions` act on the currently resolved action list
- these modifiers affect gameplay config, not task implementation

## `plantedFoodCapacities`

Optional per-food-type capacities used when the `plant` action creates a new food resource on an empty tile.

Example:

```json
"plantedFoodCapacities": {
  "grain": 14
}
```

If a unit plants onto an existing matching food resource, the existing tile `foodCapacity` is kept as-is.

## `spawnRules`

Optional spawn configuration used when a house creates a new unit.

Supported fields:

- `pool`: array of spawnable unit types with quantities
- `ensurePresentByUnitCount`: ordered list of guarantees

`pool` entries support:

- `type`
- `quantity`

Drawing a unit reduces its currently available quantity by `1`. Availability is derived from the
configured quantity minus the number of living units of that type, so if a unit leaves the village
it becomes available for spawning again automatically.

The sum of pool quantities is the maximum village population. At that population, no new house
can be started or worked on. Keeping the full population for one calendar month wins the game;
losing every unit ends it in defeat. A house that cannot spawn an eligible unit remains one work
step short of completion.

`ensurePresentByUnitCount` entries support:

- `unitCount`
- `types`

When the village is about to reach `unitCount` living units, the game checks whether at least one
of the listed `types` is already present. If yes, the draw uses the full pool. If no, the draw is
restricted to that listed subset until one of those units is present again.

Example matching the current Grand Schtroumpf behavior:

```json
"spawnRules": {
  "pool": [
    { "type": "villager", "quantity": 999 },
    { "type": "grandSchtroumpf", "quantity": 1 }
  ],
  "ensurePresentByUnitCount": [
    { "unitCount": 5, "types": ["grandSchtroumpf"] }
  ]
}
```

## `spriteTypes.<spriteTypeId>`

Visual catalog for one unit appearance set.

Supported source ids inside `sources`:

- `idle`
- `move`
- `work`
- `play`
- `research`
- `gatherFoodLand`
- `gatherFoodFish`
- `gatherMaterialsLumber`
- `gatherMaterialsStone`
- `cargoIdle`, `cargoMove`, `cargoWork`
- `cargoFoodIdle`, `cargoFoodMove`, `cargoFoodWork`
- `cargoStoneIdle`, `cargoStoneMove`, `cargoStoneWork`
- `cargoLumberIdle`, `cargoLumberMove`, `cargoLumberWork`

Supported numeric fields:

- `workFrameDuration`
- `width`
- `height`
- `anchorX`
- `anchorY`
- `groundOffset`
- `moveDuration`

Supported structured fields:

- `sources`
- `moveFrameSequence`
- `actionContextSourceCandidates`

The same sprite field set is also reused by `game/data/vehicles.json` for `visual.mountedRenders.*.unit` and `visual.mountedRenders.*.vehicle`. Those mounted overlay layers additionally support `offsetX` and `offsetY`.

### `sources`

`sources` maps one semantic source id to a set of directions.

Direction keys are:

- `O`
- `N`
- `E`
- `S`
- `W`
- `NE`
- `NW`
- `SE`
- `SW`

Values can be:

- a single image path string
- an array of frame image paths

Example:

```json
"sources": {
  "idle": {
    "W": "../assets/units/unit_sprite.png",
    "N": "../assets/units/unit_back_sprite.png",
    "S": "../assets/units/unit_front_sprite.png"
  },
  "move": {
    "W": [
      "../assets/units/unit_sprite.png",
      "../assets/units/unit_step_sprite.png"
    ],
    "N": [
      "../assets/units/unit_back_step_sprite.png",
      "../assets/units/unit_back_step_sprite_2.png"
    ]
  },
  "work": {
    "O": [
      "../assets/units/unit_work_sprite.png",
      "../assets/units/unit_work_sprite_1.png"
    ]
  }
}
```

The runtime currently uses this hard-coded fallback chain when a requested direction is missing:

- `W -> O`
- `E -> mirrored W`
- `NW -> W`
- `SW -> W`
- `NE -> E`
- `SE -> E`
- `N -> W`
- `S -> E`

So if you define only `W` for `idle`, east-facing renders will mirror it automatically. If you define only `O`, west-facing renders use `O` directly and east-facing renders mirror that fallback.

If `width` and `height` are omitted, the renderer derives them from the PNG canvas size, treating the asset as authored for 200% zoom. In that case the effective base size is `naturalWidth / 2` by `naturalHeight / 2`.

If `anchorX` and `anchorY` are omitted, they default to bottom-center for the resolved sprite size.

### Cargo sprites

When a unit carries a positive amount, rendering tries the matching resource-specific cargo source first, then the generic cargo source. For movement and work, a cargo idle source is also tried before the usual sprite sources. Missing cargo sources therefore use the existing art. Cargo sources use the same direction fallback, frame arrays, canvas sizing, and image preloading as other sources.

For example, add `sources.cargoFoodIdle.W` and `sources.cargoFoodMove.W` for a unit carrying food. Add `sources.cargoIdle.W` for an image shared by all carried resources. For a mounted unit, cargo sources must be defined in `vehicles.json` under the mounted render's `unit.sources`; normal unit cargo sources do not replace mounted art.

```json
"sources": {
  "cargoIdle": { "W": "../assets/units/unit_cargo.png" },
  "cargoMove": { "W": ["../assets/units/unit_cargo.png", "../assets/units/unit_cargo_step.png"] },
  "cargoFoodIdle": { "W": "../assets/units/unit_cargo_food.png" }
}
```

Add these entries alongside the existing `idle`, `move`, and action sources. The exporter in `tools/export_bacis_unit_batch.py` will need cargo presets once the new SVG layers exist.

### `actionContextSourceCandidates`

Maps action ids to target-context-specific source candidate lists.

The runtime derives target contexts from the active task in this order:

- `subjectKind:<kind>`
- `subjectType:<type>`
- `<subjectKind>:<type>`
- `constructible:building`
- `building:<type>`
- `constructible:vehicle`
- `vehicle:<type>`
- `food:<foodType>`
- `material:<resourceType>`
- `terrain:<terrainType>`

The first matching context key wins. If nothing matches, the runtime uses `default` if present, then `*` if present.

Example:

```json
"actionContextSourceCandidates": {
  "gatherFood": {
    "food:fish": ["gatherFoodFish", "work", "idle"],
    "terrain:water": ["gatherFoodFish", "work", "idle"],
    "default": ["gatherFoodLand", "work", "idle"]
  },
  "gatherMaterials": {
    "material:lumber": ["gatherMaterialsLumber", "work", "idle"],
    "material:stone": ["gatherMaterialsStone", "work", "idle"],
    "default": ["work", "idle"]
  }
}
```

## How Type Resolution Works

Runtime unit config is currently built as:

```text
resolvedUnitConfig = default + types[unitTypeId]
```

Sprite config is resolved separately through `spriteTypeId`.

## Minimal Example

```json
{
  "default": {
    "typeId": "villager",
    "spriteTypeId": "villager",
    "name": "Schtroumpf",
    "labels": {
      "fr": "Schtroumpf",
      "en": "Smurf"
    },
    "stamina": 2,
    "foodConsumptionPerTurn": 1,
    "allowedActions": ["walk"]
  },
  "types": {
    "villager": {
      "spriteTypeId": "villager"
    }
  },
  "spriteTypes": {
    "villager": {
      "sources": {
        "idle": {
          "W": "../assets/units/unit_sprite.png"
        },
        "move": {
          "W": [
            "../assets/units/unit_sprite.png",
            "../assets/units/unit_step_sprite.png"
          ]
        }
      },
      "moveFrameSequence": [0, 1, 0, 1, 0],
      "width": 36,
      "height": 44,
      "anchorX": 18,
      "anchorY": 44
    }
  }
}
```
