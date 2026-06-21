# Vehicles Data File

File: `game/data/vehicles.json`

This file defines vehicle types and their data-driven metadata.

Current runtime support includes:
- language-specific labels
- UI icon text
- construction-style rules and visuals
- save/load serialization for placed vehicles
- bidirectional saved links between a vehicle and its rider
- auto-mount when a unit enters a complete vehicle tile
- direct dismount action with nearest on-foot placement
- vehicle-follow movement while mounted
- vehicle-defined mounted movement terrains and mounted action lists
- mounted multipliers for movement stamina cost and action work output
- mounted pair-specific sprite overlays for unit+vehicle rendering

## File Shape

The file currently uses the same schema as `game/data/buildings.json`:

```json
{
  "default": {
    "width": 1,
    "height": 1
  },
  "types": {
    "<vehicleId>": {
      "labels": { ... },
      "ui": { ... },
      "availability": { ... },
      "limits": { ... },
      "modifiers": [ ... ],
      "rules": { ... },
      "visual": { ... }
    }
  }
}
```

All sections inside a vehicle entry except `rules` and `visual` are optional. Missing `availability`, `limits`, and `modifiers` are treated as empty at load time.

## Recommended Starting Point

Use the same field meanings as buildings for now:
- `labels`: localized names
- `ui.icon`: short selector symbol
- `rules.width` / `rules.height`
- `rules.footprint`
- `rules.placementTerrains`
- `rules.walkable`
- `rules.foundationActionAvailable`
- `rules.mounted.allowedActions`
- `rules.mounted.movementTerrains`
- `rules.mounted.multipliers`
- `rules.constructionCost`
- `rules.buildCost`
- `visual.renderMode`
- `visual.subtypes`
- `visual.constructionImages`
- `visual.constructionStages`
- `visual.mountedRenders`

Relative image paths are resolved relative to `game/data/vehicles.json`.

## `rules.mounted.allowedActions`

Optional restriction list for actions available while mounted.

Rules:

- if omitted, the mounted unit keeps its normal unit-type action list
- if present, the mounted unit can use only the intersection of:
  - the unit's normal allowed actions
  - this mounted `allowedActions` list
- `dismount` is added automatically at runtime when a valid dismount tile exists

## `rules.mounted.multipliers`

Optional numeric multipliers applied while a unit is mounted on this vehicle.

Currently supported fields:

- `moveCost`: multiplies stamina cost of mounted movement and mounted dismount steps
- `workPointsPerTurn.<actionId>`: multiplies per-turn output for supported work actions such as `gatherFood` and `gatherMaterials`

Example:

```json
"mounted": {
  "allowedActions": ["walk", "gatherFood", "gatherMaterials"],
  "movementTerrains": ["grass"],
  "multipliers": {
    "moveCost": 0.5,
    "workPointsPerTurn": {
      "gatherFood": 2,
      "gatherMaterials": 2
    }
  }
}
```

## `rules.foundationActionAvailable`

Optional boolean flag controlling whether this vehicle type appears in the `Lay foundations` submenu.

## `visual.mountedRenders`

Optional mounted overlay rendering for specific unit+vehicle pairs.

Shape:

```json
"mountedRenders": {
  "default": {
    "unit": { ... },
    "vehicle": { ... }
  },
  "byUnitType": {
    "<unitTypeId>": {
      "unit": { ... },
      "vehicle": { ... }
    }
  }
}
```

Rules:

- `default` applies to every unit mounted on this vehicle type
- `byUnitType.<unitTypeId>` overrides `default` for one unit type
- `unit` and `vehicle` are separate overlay layers
- the `vehicle` layer is drawn first, then the `unit` layer
- image fields are resolved relative to `game/data/vehicles.json`

Supported fields inside each layer are the same as `spriteTypes.<spriteTypeId>` in `game/data/units.md`, plus:

- `offsetX`
- `offsetY`

`offsetX` and `offsetY` are screen-space offsets expressed at 100% zoom and scaled with zoom at runtime.

Mounted sprite layers also accept `directionRenderOverrides`, using the same direction keys as unit sprite configs. This is the intended way to give east/west or north/south mounted renders different placement offsets.

For the mounted `unit` layer, missing fields fall back to the unit's normal sprite config. This makes it possible to override only the mounted move frames or only the placement offsets.

For the mounted `vehicle` layer, any sprite-style move animation is optional. If no mounted `vehicle` layer is defined, the runtime falls back to the vehicle's normal static visual.

## Minimal Example

```json
{
  "default": {
    "width": 1,
    "height": 1
  },
  "types": {
    "boat": {
      "labels": {
        "fr": "Barque",
        "en": "Boat"
      },
      "ui": {
        "icon": "B"
      },
      "rules": {
        "width": 1,
        "height": 1,
        "walkable": true,
        "mounted": {
          "allowedActions": ["walk"],
          "movementTerrains": ["water"]
        },
        "constructionCost": 120,
        "buildCost": {
          "stone": 0,
          "lumber": 40
        }
      },
      "visual": {
        "renderMode": "singleTile",
        "mountedRenders": {
          "default": {
            "unit": {
              "moveFrames": [
                "../assets/units/boat_rider_01.png",
                "../assets/units/boat_rider_02.png"
              ],
              "moveFrameSequence": [0, 1, 0, 1, 0],
              "offsetX": 0,
              "offsetY": -4
            },
            "vehicle": {
              "idleImage": "../assets/vehicles/boat_mount_01.png",
              "moveFrames": [
                "../assets/vehicles/boat_mount_01.png",
                "../assets/vehicles/boat_mount_02.png"
              ],
              "moveFrameSequence": [0, 1, 0, 1, 0],
              "width": 44,
              "height": 28,
              "anchorX": 22,
              "anchorY": 21
            }
          }
        },
        "subtypes": [
          { "id": "boat_01", "image": "../assets/vehicles/boat_01.png" }
        ]
      }
    }
  }
}
```
