# Refactoring Notes

## 2026-06-25

### Current simplification priorities

1. Simplify the spatial/passability layer before adding the unit occupancy cache.
   - Current logic is split across unit occupancy checks, building/vehicle blocking checks, mounted movement rules, and route planning.
   - Best direction: one internal query for "what occupies this cell and can this unit occupy it in this state?"
   - Then add the unit occupancy cache on top of that simplified path.

2. Unify the unit action/task model.
   - Action normalization, labels, task creation, task-to-action mapping, task resolution, and task serialization are currently spread across several parallel branches.
   - Best direction: a descriptor/registry table per action-task pair.

3. Collapse repetitive presentation refresh sequences.
   - Many mutations manually call some variation of:
     - `updateUnitReadout()`
     - `updateTurnControls()`
     - `updateTileInspectorReadout()`
     - `draw()`
   - Best direction: a few explicit refresh profiles instead of open-coded update bundles.

4. Reduce remaining building/vehicle wrapper duplication in `app.js`.
   - The constructibles module already holds much of the shared logic, but `app.js` still has many paired wrappers that could be pushed further toward a `kind`-based model.

5. Consider simplifying the sprite override model later.
   - Current config resolution is powerful but structurally complex:
     - direction overrides
     - source overrides
     - source+direction overrides
     - action overrides
     - action+direction overrides
     - fishing-specific direction handling
   - Not urgent, but a future cleanup candidate if sprite behavior becomes expensive to maintain.

6. Consider eventual rule-evaluation unification.
   - Availability, limits, and conditional modifiers are currently normalized and evaluated through separate paths.
   - Not an immediate target, but worth keeping in mind.

### Recommended next refactoring step

1. Simplify spatial/passability queries.
2. Add the unit occupancy cache.
3. Then choose between:
   - action/task registry cleanup
   - refresh batching cleanup

### Explicit non-priorities for now

- Genericizing manifest normalizers further
- Another immediate book split
- Purely cosmetic helper deduplication

## 2026-06-26

### Completed since the previous note

1. Simplified the spatial/passability layer.
   - Consolidated occupancy/passability queries enough to support cleaner movement checks.

2. Added the unit occupancy cache.
   - The cache is now maintained incrementally instead of relying on full recomputation after every change.

3. Unified the unit action/task model.
   - Action normalization, task creation, task serialization, task-to-action mapping, and task resolution now go through a registry/descriptor table.

4. Collapsed repetitive presentation refresh sequences further.
   - Added shared refresh helpers for unit/task presentation, mode/state transitions, and editor mutations.
   - Editor `removeEditor*` / `placeEditor*` helpers are now mutation-only and no longer perform hidden refresh work.

5. Reduced another building/vehicle duplication slice in `app.js`.
   - Shared kind-based helpers now cover constructible availability, labels/icons, construction lookup, editor constructible mutations, and visible constructible draw ordering.
   - Several now-dead building/vehicle wrappers were removed.

6. Reduced the remaining constructible gameplay/serialization duplication further.
   - Generic constructible helpers now cover build costs, affordability, normalization, serialization, and book binding views.
   - The remaining building/vehicle wrappers are mostly convenience/public API shims rather than duplicated internal logic.

### Practical remaining agenda

1. Consider simplifying the sprite override model next.
   - Current override resolution is still structurally complex and is a maintenance risk, but it is not the next target.

2. Consider eventual rule-evaluation unification.
   - Availability, limits, and conditional modifiers still run through separate evaluation paths.

3. Optionally trim the remaining constructible convenience wrappers later.
   - What remains is mostly public/API-facing building/vehicle naming, lookup, and label helpers rather than duplicated internal behavior.

### Immediate next step

1. Consider simplifying the sprite override model.

### Additional progress

1. Mounted sprite rendering no longer falls back to constructible visuals.
   - Ridden vehicles now render only through mounted sprite layers.

2. Mounted unit and mounted vehicle layers now share the same internal sprite-config resolution path.
   - The unit layer inherits from the unit sprite config.
   - The vehicle layer remains layer-defined only.

3. Sprite source selection is now candidate-based for movement, stationary rendering, and task rendering.
   - Task specs provide source candidates instead of each action owning separate frame/source selector helpers.
   - The current manifest field names stay unchanged; the cleanup is internal only.

4. Sprite manifests now support a direction-keyed `sources` catalog.
   - Runtime lookup now resolves `O/N/E/S/W/NE/NW/SE/SW` with a hard-coded fallback chain.
   - Checked-in unit and mounted-vehicle manifests have been migrated to `sources`.
