# Technologies Data File

File: `game/data/technologies.json`

This file defines the canonical technology DAG:
- technology ids
- language-specific labels
- research costs
- icons
- prerequisite technologies
- prerequisite event ids

It does **not** define page layout.  
That still belongs to the localized book HTML pages.

## File Shape

```json
{
  "technologies": [
    {
      "id": "house_construction",
      "labels": {
        "fr": "Construction de maison",
        "en": "House construction"
      },
      "cost": 30,
      "icon": "../assets/buildings/house_01.png",
      "prerequisites": {
        "tech": [],
        "events": []
      }
    }
  ]
}
```

Image paths are resolved relative to `game/data/technologies.json`.

## Fields

Each technology entry supports:

- `id`: unique technology id
- `labels`: optional map of localized labels by language id (`fr`, `en`, `es`, `ru`, ...)
- `cost`: research cost in research units
- `icon`: optional icon path
- `prerequisites.tech`: array of prerequisite technology ids
- `prerequisites.events`: array of prerequisite event ids

## Minimal Example

```json
{
  "technologies": [
    {
      "id": "house_construction",
      "labels": {
        "fr": "Construction de maison",
        "en": "House construction"
      },
      "cost": 30,
      "icon": "../assets/buildings/house_01.png",
      "prerequisites": {
        "tech": [],
        "events": []
      }
    },
    {
      "id": "laboratory_construction",
      "labels": {
        "fr": "Construction de laboratoire",
        "en": "Laboratory construction"
      },
      "cost": 120,
      "icon": "../assets/buildings/laboratory_01.png",
      "prerequisites": {
        "tech": ["house_construction"],
        "events": []
      }
    }
  ]
}
```

## Book Widget Usage

Localized book pages can reference a technology with:

```html
<div data-book-widget="tech" data-tech-id="laboratory_construction">
  Laboratory
</div>
```

The widget label comes from the page HTML, not from `technologies.json`.
The runtime label in `technologies.json` is available for editor tools, fallbacks, and future reuse.

## Current Scope

Current technology data is used for:
- DAG structure
- localized labels
- icons
- widget state in the book

Research progression and technology effects are handled elsewhere in the runtime code.
