# Units Data File

File: `game/data/units.json`

This file currently defines:
- base unit stats
- language-specific labels
- unit type overrides
- sprite type catalogs
- action lists per unit type
- spawn rules
- availability requirements
- conditional gameplay modifiers

## File Shape

```json
{
  "default": { ... },
  "types": {
    "<unitTypeId>": { ... }
  },
  "spawnRules": [
    { ... }
  ],
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
- `name`
- `labels`
- `stamina`
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

`labels` is an optional map of localized default names by language id (`fr`, `en`, `es`, `ru`, ...).
It is used for generated/default unit names. Explicit saved unit names still stay as they were saved.

## `types.<unitTypeId>`

Per-type overrides merged over `default`.

Supported fields:

- `spriteTypeId`
- `name`
- `labels`
- `stamina`
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
- `foodConsumptionPerTurn`
- `researchPointsPerTurn`
- `allowedActions`
- `plantedFoodCapacities`
- `workPointsPerTurn`
- `actionRequirements`

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

Optional ordered list of spawn rules used when a house creates a new unit.

Each rule can have:

- `when`: optional requirement block
- `choices`: weighted unit choices

Each choice supports:

- `type`
- `weight`
- `requirements`

Rules are evaluated in order. The first rule with at least one eligible choice is used.

Example matching the current Grand Schtroumpf behavior:

```json
"spawnRules": [
  {
    "when": {
      "nextUnitNumberEquals": 5
    },
    "choices": [
      {
        "type": "grandSchtroumpf",
        "weight": 1,
        "requirements": {
          "requiredUnitsAbsent": ["grandSchtroumpf"]
        }
      }
    ]
  },
  {
    "choices": [
      {
        "type": "villager",
        "weight": 1
      }
    ]
  }
]
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
