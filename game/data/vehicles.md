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
- optional vehicle-owned cargo, with capacity and load retained after dismount

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
- `rules.cargoCapacity`
- `rules.constructionCost`
- `rules.buildCost`
- `visual.renderMode`
- `visual.subtypes`
- `visual.constructionImages`
- `visual.constructionStages`
- `visual.mountedRenders`
- `visual.cargoOverlay`

Relative image paths are resolved relative to `game/data/vehicles.json`.

## `rules.cargoCapacity`

Optional positive number. A vehicle with this rule carries its own cargo; a vehicle without it (such as the boat) leaves cargo on the unit. Wheelbarrows currently have a capacity of 96, compared with the default unit capacity of 24.

Mounting an empty carrier transfers a unit's load into it. A carrying unit cannot mount a carrier that already has cargo, or one with insufficient capacity. A unit without cargo can mount a loaded carrier and then gathers into that vehicle's remaining capacity. Dismounting leaves the cargo in the vehicle and removes the unit's cargo-based action restrictions. Vehicle cargo is saved with the vehicle.

Older saves with a loaded rider on a wheelbarrow transfer that load to the wheelbarrow when loaded. Vehicles without `cargoCapacity` do not gain a cargo field in saves.

## `rules.mounted.allowedActions`

Optional restriction list for actions available while mounted.

Rules:

- if omitted, the mounted unit keeps its normal unit-type action list
- if present, the mounted unit can use only the intersection of:
  - the unit's normal allowed actions
  - this mounted `allowedActions` list
- `dismount` is added automatically at runtime when a valid dismount tile exists; vehicle-owned cargo does not hide it

## `rules.mounted.movementTerrains`

Optional list of allowed mounted movement terrain/season rules.

Supported entry forms:

- `"grass"`: shorthand for this terrain in any season
- `["water", "winter2"]`: one explicit `(terrain, season)` pair

Rules:

- movement is allowed only when the current cell matches at least one entry
- season names must be one of: `summer`, `autumn`, `winter1`, `winter2`, `spring`
- use explicit pairs when one terrain is allowed only in some seasons, for example boats on non-frozen water

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
- `moveSource` (`"move"` or `"idle"`, for the mounted unit layer)

`offsetX` and `offsetY` are screen-space offsets expressed at 100% zoom and scaled with zoom at runtime.

Mounted `unit` and mounted `vehicle` layers now run through the same sprite resolution path. The only difference is fallback: the mounted `unit` layer inherits from the unit's normal sprite config, while the mounted `vehicle` layer only uses what is defined in its own layer config.

For the mounted `unit` layer, missing fields fall back to the unit's normal sprite config. This makes it possible to override only the mounted move frames or only the placement offsets.

Set `default.unit.moveSource` to `"idle"` to render each rider's own directional idle sprite while the vehicle moves, without repeating those sprites under `byUnitType`. Omitted or `"move"` uses movement frames. A `byUnitType` entry can override this choice.

For the mounted `vehicle` layer, any sprite-style move animation is optional.

If a mounted vehicle should remain visible while ridden, define a mounted `vehicle` layer for it. The mounted rendering path no longer falls back to the vehicle's normal constructible visual.

## `visual.cargoOverlay`

Optional bag-only images for cargo-carrying vehicles. `unmounted` is drawn behind a complete, unmounted vehicle using the normal single-tile asset alignment. `mountedByImage` maps each mounted vehicle-frame path to an overlay path; the overlay is drawn behind the vehicle and unit, using the mounted vehicle's anchor and mirroring. Keep each overlay canvas aligned with its corresponding mounted image. Both map keys and values are paths relative to `vehicles.json`.

`mountedOffsetYAt100Zoom` optionally shifts all mounted cargo overlays vertically, scaled with zoom. The wheelbarrow uses it to reveal the bag above south-facing work sprites whose cart reaches the image's top edge.

`mountedForegroundByImage` is an optional second overlay map drawn after the unit. Use only artwork already clipped to the visible portion of the load, for a mounted unit sprite that itself contains the vehicle foreground (the wheelbarrow's south-facing idle frame).

The wheelbarrow overlays are generated from `vec/bacis.svg` by `tools/export_wheelbarrow_cargo.py`. Vehicles without this section have no cargo overlay.

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
          "movementTerrains": [
            ["water", "summer"],
            ["water", "autumn"],
            ["water", "winter1"],
            ["water", "spring"]
          ]
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
              "sources": {
                "move": {
                  "W": [
                    "../assets/units/boat_rider_01.png",
                    "../assets/units/boat_rider_02.png"
                  ]
                }
              },
              "moveFrameSequence": [0, 1, 0, 1, 0],
              "offsetX": 0,
              "offsetY": -4
            },
            "vehicle": {
              "sources": {
                "idle": {
                  "W": "../assets/vehicles/boat_mount_01.png"
                },
                "move": {
                  "W": [
                    "../assets/vehicles/boat_mount_01.png",
                    "../assets/vehicles/boat_mount_02.png"
                  ]
                }
              },
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
