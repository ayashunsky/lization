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
  "allowedActions": ["walk", "play", "gatherFood"],
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

Supported image fields:

- `idleImage`
- `northImage`
- `southImage`
- `workFrames`
- `landFoodFrames`
- `lumberFrames`
- `stoneFrames`
- `sideFishingFrames`
- `northFishingFrames`
- `southFishingFrames`
- `playFrames`
- `researchFrames`
- `northMoveFrames`
- `southMoveFrames`
- `moveFrames`

Supported numeric fields:

- `workFrameDuration`
- `width`
- `height`
- `anchorX`
- `anchorY`
- `groundOffset`
- `moveDuration`

Supported structured fields:

- `moveFrameSequence`
- `fishingRenderSpec`
- `fishingDirectionRenderOverrides`
- `fishingDirections`

`researchFrames` are used for the stationary `Research` task. If omitted, the game falls back to `workFrames`.

### `fishingDirections`

Maps facing directions to a named frame set and optional mirroring.

Example:

```json
"fishingDirections": {
  "north": {
    "frameSet": "northFishingFrames",
    "mirror": false
  },
  "east": {
    "frameSet": "sideFishingFrames",
    "mirror": true
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
      "idleImage": "../assets/units/unit_sprite.png",
      "moveFrames": [
        "../assets/units/unit_sprite.png",
        "../assets/units/unit_step_sprite.png"
      ],
      "moveFrameSequence": [0, 1, 0, 1, 0],
      "width": 36,
      "height": 44,
      "anchorX": 18,
      "anchorY": 44
    }
  }
}
```
