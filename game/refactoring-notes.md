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
