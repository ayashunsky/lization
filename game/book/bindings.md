# Book Bindings

Book page HTML can pull localized text, rule values, manifest data, and asset paths from the game source of truth.

## Syntax

Text content:

```html
<span data-book-bind="strings.resources.stone"></span>
<span data-book-bind-text="rules.movement.paths.wellKnownVisits"></span>
```

Attribute binding:

```html
<img data-book-bind-src="technology.pottery.icon" data-book-bind-alt="technology.pottery.label">
<a data-book-bind-href="strings.some.bookPageId">...</a>
```

`data-book-bind` is shorthand for `data-book-bind-text`.

Any attribute can be bound with `data-book-bind-<attribute-name>`.

## Supported namespaces

### `strings`

Reads from the current language strings object.

```html
<span data-book-bind="strings.buildings.house"></span>
```

### `rules`

Reads from `rules.js`.

```html
<span data-book-bind="rules.resources.starvation.thresholdTurns"></span>
```

### `technology.<id>`

Localized and manifest-backed technology data.

Common fields:

- `label`
- `name`
- `cost`
- `icon`
- `prerequisites.tech`
- `prerequisites.events`

Example:

```html
<span data-book-bind="technology.pottery.label"></span>
<img data-book-bind-src="technology.pottery.icon" data-book-bind-alt="technology.pottery.label">
<span data-book-bind="technology.pottery.cost"></span>
```

### `building.<id>`

Building rules and visuals.

Common fields:

- `label`
- `name`
- `constructionCost`
- `buildCost.stone`
- `buildCost.lumber`
- `resourceStorageCapacities.food`
- `image`
- `icon`
- `iconText`

`icon` and `image` both resolve to the first building subtype image.
`iconText` resolves to the symbolic building icon used in some UI controls.

Example:

```html
<span data-book-bind="building.house.label"></span>
<span data-book-bind="building.laboratory.buildCost.stone"></span>
<img data-book-bind-src="building.laboratory.image" data-book-bind-alt="building.laboratory.label">
```

### `unit.<id>`

Unit rules merged with the default unit config.

Common fields:

- `label`
- `name`
- `stamina`
- `foodConsumptionPerTurn`
- `researchPointsPerTurn`
- `allowedActions`
- `icon`
- `image`
- `sprite`

`unit.default` resolves to the configured default unit type.

Example:

```html
<span data-book-bind="unit.default.label"></span>
<span data-book-bind="unit.grandSchtroumpf.researchPointsPerTurn"></span>
<img data-book-bind-src="unit.grandSchtroumpf.icon" data-book-bind-alt="unit.grandSchtroumpf.label">
```

### `resource.<id>`

Localized resource names and icon paths.

Common fields:

- `label`
- `name`
- `icon`

Example:

```html
<img data-book-bind-src="resource.stone.icon" data-book-bind-alt="resource.stone.label">
<span data-book-bind="resource.stone.label"></span>
```

## Notes

- Bindings are applied when a book page is rendered.
- `data-book-bind` / `data-book-bind-text` set `textContent`, so they replace any existing child elements inside the bound node.
- Array values are joined with `, ` when inserted as text.
- Object values are JSON-stringified when inserted as text.
