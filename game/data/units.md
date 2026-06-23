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
- `directionRenderOverrides`
- `sourceRenderOverrides`
- `sourceDirectionRenderOverrides`
- `actionRenderOverrides`
- `actionDirectionRenderOverrides`
- `fishingDirections`

The same sprite field set is also reused by `game/data/vehicles.json` for `visual.mountedRenders.*.unit` and `visual.mountedRenders.*.vehicle`. Those mounted overlay layers additionally support `offsetX` and `offsetY`.

`researchFrames` are used for the stationary `Research` task. If omitted, the game falls back to `workFrames`.

If `width` and `height` are omitted, the renderer derives them from the PNG canvas size, treating the asset as authored for 200% zoom. In that case the effective base size is `naturalWidth / 2` by `naturalHeight / 2`.

If `anchorX` and `anchorY` are omitted, they default to bottom-center for the resolved sprite size.

### `directionRenderOverrides`

Maps draw directions to render-spec overrides. This is the preferred way to adjust facing-specific placement, including mirrored east/west variants that need different `offsetX` values.

Example:

```json
"directionRenderOverrides": {
  "west": { "offsetX": -3 },
  "east": { "offsetX": 3 },
  "north": { "offsetY": -4 },
  "south": { "offsetY": 2 }
}
```

### `sourceRenderOverrides`

Maps sprite source field names to render-spec overrides. This is useful when a specific frame set needs different placement than the rest, such as fishing frames or a special move set.

Example:

```json
"sourceRenderOverrides": {
  "southFishingFrames": { "anchorY": 34.5 },
  "researchFrames": { "offsetY": -3 }
}
```

### `sourceDirectionRenderOverrides`

Maps sprite source field names to per-direction render-spec overrides. This is the preferred way to handle source-specific placement that must still vary by facing.

Example:

```json
"sourceDirectionRenderOverrides": {
  "sideFishingFrames": {
    "west": { "offsetX": 20 },
    "east": { "offsetX": -20 }
  }
}
```

### `actionRenderOverrides`

Maps action ids to render-spec overrides. Use this for action-wide placement changes such as shifting all `gatherFood` renders without touching idle or movement.

Example:

```json
"actionRenderOverrides": {
  "gatherFood": { "offsetY": -6 },
  "research": { "offsetX": 2, "offsetY": -4 }
}
```

### `actionDirectionRenderOverrides`

Maps action ids to per-direction render-spec overrides. This is the most specific placement layer short of the legacy fishing-specific fields.

Example:

```json
"actionDirectionRenderOverrides": {
  "gatherFood": {
    "west": { "offsetX": -5 },
    "east": { "offsetX": 5 },
    "south": { "offsetY": 4 }
  }
}
```

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
