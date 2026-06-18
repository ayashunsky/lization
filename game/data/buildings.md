# Buildings Data File

File: `game/data/buildings.json`

This file defines:
- building types
- language-specific labels
- construction costs
- structural footprint
- storage capacities
- map/editor UI icon
- render behavior and image paths
- gameplay availability and count limits
- conditional gameplay modifiers

It does **not** define simulation logic such as:
- what the global `Build` action means
- what happens when a house is completed
- turn-by-turn construction behavior

Those still live in `game/app.js`.

## File Shape

```json
{
  "default": {
    "width": 1,
    "height": 1
  },
  "types": {
    "house": {
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

All sections except `rules` and `visual` are optional for a building entry. Missing `availability`, `limits`, and `modifiers` are treated as empty at load time.

## `types.<buildingId>.labels`

Optional localized labels keyed by language id.

Example:

```json
"labels": {
  "fr": "Maison",
  "en": "House",
  "es": "Casa",
  "ru": "Дом"
}
```

These labels are used by runtime UI such as:
- foundation/building selectors
- editor building labels

If omitted, the runtime falls back to older string-table labels and then to the raw building id.

## `default`

Fallback size used when a specific building entry omits `rules.width` / `rules.height`.

## `types.<buildingId>.ui`

Current supported fields:

- `icon`: short text symbol used in:
  - the Grand Schtroumpf foundation submenu
  - the editor building dropdown

Example:

```json
"ui": {
  "icon": "⌂"
}
```

## `types.<buildingId>.availability`

Optional gameplay requirements for **starting** a new building of that type.

Supported fields:

- `requiredTechs`: array of discovered technology ids
- `requiredEvents`: array of event ids
- `requiredBuildingsMin`: object `{ "<buildingId>": <minimum complete count> }`
- `requiredUnitsPresent`: array of unit type ids
- `requiredUnitsAbsent`: array of unit type ids

Example:

```json
"availability": {
  "requiredTechs": ["laboratory_construction"],
  "requiredBuildingsMin": {
    "house": 1
  }
}
```

Notes:
- building counts in requirements currently use **complete** buildings only
- the editor ignores gameplay `availability` and `limits`; all building types remain available there if they fit physically

## `types.<buildingId>.limits`

Optional gameplay limits for how many complete buildings of this type may exist.

Supported fields:

- `maxCount`: absolute maximum number of complete buildings of this type
- `countByBuilding`: derived limit

`countByBuilding` shape:

```json
"countByBuilding": {
  "building": "waterWell",
  "base": 10,
  "perBuilding": 10
}
```

Meaning:

```text
allowedCount = base + perBuilding * completeCount(building)
```

The current building may be started only if:

```text
existingCount(currentType) < allowedCount
```

Notes:
- the provider count (`building`) currently uses **complete** buildings only
- the current type count uses **all existing** buildings of that type, including construction, so limits cannot be bypassed by laying many foundations first

Example for houses:

```json
"limits": {
  "countByBuilding": {
    "building": "waterWell",
    "base": 10,
    "perBuilding": 10
  }
}
```

## `types.<buildingId>.rules`

Supported fields:

- `width`
- `height`
- `footprint`
- `placementTerrains`
- `walkable`
- `foundationActionAvailable`
- `constructionCost`
- `buildCost.stone`
- `buildCost.lumber`
- `resourceStorageCapacities`
- `constructionVisualThresholds.initialMax`
- `constructionVisualThresholds.halfMax`
- `abandonedDecayPerTurn`

### `footprint`

Optional explicit multi-tile footprint.

Each entry is a path from the origin tile using map directions.

Example used by the laboratory:

```json
"footprint": [
  [],
  ["south"],
  ["southEast"],
  ["southWest"]
]
```

### `placementTerrains`

Optional per-tile terrain constraints for placement.

Each entry matches the corresponding occupied tile in the resolved footprint order:

- for explicit `footprint`, the order is the same as the `footprint` array
- for rectangular buildings without `footprint`, the order is left-to-right, then top-to-bottom

Each entry is a list of allowed terrain ids for that occupied tile.

If `placementTerrains` is omitted, or if a specific entry is omitted, that tile defaults to:

```json
["grass"]
```

Example:

```json
"footprint": [
  ["southWest"],
  [],
  ["northEast"]
],
"placementTerrains": [
  ["grass"],
  ["grass", "water"],
  ["grass"]
]
```

This allows a 3-tile bridge-like structure whose middle tile may be on water while both ends must stay on grass.

### `resourceStorageCapacities`

Per-resource stockpile capacity contributed by one **complete** building of this type.

Example:

```json
"resourceStorageCapacities": {
  "stone": 120,
  "lumber": 120,
  "food": 120
}
```

## `types.<buildingId>.modifiers`

Optional ordered list of conditional gameplay overrides.

Each entry can have:

- `when`: requirement block
- `set`: partial rules override

Supported `set` fields:

- `walkable`
- `foundationActionAvailable`
- `constructionCost`
- `buildCost`
- `resourceStorageCapacities`
- `constructionVisualThresholds`
- `abandonedDecayPerTurn`

Example:

```json
"modifiers": [
  {
    "when": {
      "requiredTechs": ["improved_masonry"]
    },
    "set": {
      "resourceStorageCapacities": {
        "stone": 180,
        "lumber": 180,
        "food": 160
      }
    }
  }
]
```

Notes:
- modifiers are applied in order
- they affect gameplay characteristics only
- building shape and visual assets remain defined by `rules` and `visual`, not by modifiers

## `types.<buildingId>.visual`

Supported fields:

- `renderMode`
- `constructionRenderMode`
- `nativeScaleAt100Zoom`
- `nativeOffsetYAt100Zoom`
- `unitRenderOffsets`
- `subtypes`
- `abandonedImage`
- `constructionImages.initial`
- `constructionImages.half`
- `constructionStages.initial`
- `constructionStages.half`

Image paths are resolved relative to `game/data/buildings.json`.

### `renderMode`

Supported values:

- `singleTile`
- `perTile`
- `footprintImage`
- `footprintImageNative`

### `unitRenderOffsets`

Optional per-footprint-tile unit render offsets.

Each entry matches the corresponding occupied tile in the resolved footprint order:

- for explicit `footprint`, the order is the same as the `footprint` array
- for rectangular buildings without `footprint`, the order is left-to-right, then top-to-bottom

Each entry is an object:

```json
{ "x": 0, "y": -10 }
```

Values are measured in screen pixels at 100% zoom and scale automatically with zoom.

If `unitRenderOffsets` is omitted, or if a specific entry is omitted, that tile defaults to:

```json
{ "x": 0, "y": 0 }
```

Example:

```json
"unitRenderOffsets": [
  { "x": 0, "y": -4 },
  { "x": 0, "y": -10 },
  { "x": 0, "y": -4 }
]
```

This is useful for bridges or other walkable multi-tile buildings where units should stand higher or lower than the tile center.

### `constructionStages`

Optional per-stage visual overrides.

Currently supported per stage:

- `renderMode`
- `yOffsetFactor`
- `tileImages`

Example:

```json
"constructionStages": {
  "initial": {
    "renderMode": "perTile",
    "yOffsetFactor": 0.2,
    "tileImages": [
      "../assets/buildings/bridge_foundation_end_a.png",
      "../assets/buildings/bridge_foundation_middle.png",
      "../assets/buildings/bridge_foundation_end_b.png"
    ]
  },
  "half": {
    "renderMode": "footprintImageNative"
  }
}
```

For `renderMode: "perTile"`, `tileImages` is optional and follows the resolved footprint order.

- a string path renders that image on the corresponding tile
- `null`, `""`, or any non-string entry renders nothing on that tile
- if `tileImages` is shorter than the footprint, remaining tiles fall back to the stage `constructionImages.*` image

## Minimal Example

```json
"house": {
  "ui": {
    "icon": "⌂"
  },
  "rules": {
    "width": 1,
    "height": 1,
    "walkable": false,
    "foundationActionAvailable": true,
    "constructionCost": 100,
    "buildCost": {
      "stone": 20,
      "lumber": 30
    }
  },
  "visual": {
    "renderMode": "singleTile",
    "subtypes": [
      { "id": "house_01", "image": "../assets/buildings/house_01.png" }
    ]
  }
}
```
