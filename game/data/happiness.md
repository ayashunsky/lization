# Happiness rules

Edit `game/rules.js` under `happiness` to balance this system. Happiness is a
floating-point percentage, shown rounded in the sidebar. Its default range is
0-100, and building, collection, and research output are multiplied by
`happiness / 100`. All units use the same value during a turn. Happiness changes
after the turn's actions and food consumption, so the new value affects the
following turn.

- `initial`: starting happiness; also used when loading an older save that has
  no happiness field.
- `minimum`, `maximum`: clamp applied after every happiness change.
- `foodDaysSteps`: one daily change based on food in the stockpile divided by
  the village's current daily food consumption. With zero consumption, coverage
  is unlimited.
- `populationSteps`: one daily change based on the current number of units.
- `waitPerUnitPerTurn`: daily change for each unit assigned the Wait action.
  Research without any goals left counts as waiting too.

Each step has `min` and `deltaPerTurn`. The highest `min` not exceeding the
current value wins; steps are not cumulative. They may be listed in any order.
The changes from both steps, Wait, and buildings are added before clamping.

Buildings may define `rules.happinessPerTurn` in `game/data/buildings.json`.
Each complete building contributes that amount per turn; construction and
abandoned buildings do not. Future game events can use `changeHappiness(delta)`
to apply immediate changes.

Happiness is saved with the game and sampled every ten turns alongside the
stockpile for the statistics page. Older stockpile samples have no happiness
value and are not invented by the graph.
