import assert from "node:assert/strict";
import test from "node:test";
import { reconstructPopulationSeries } from "../game/book-stockpile-chart.js";

test("reconstructs population from arrivals and departures", () => {
  const messages = [
    { turn: 8, kind: "houseCompleted" },
    { turn: 10, kind: "houseCompleted" },
    { turn: 10, kind: "unitLeft" },
    { turn: 15, kind: "unitLeft" },
  ];

  assert.deepEqual(reconstructPopulationSeries(messages, 1, 1, 20), [
    { turn: 1, value: 1 },
    { turn: 8, value: 2 },
    { turn: 10, value: 2 },
    { turn: 15, value: 1 },
    { turn: 20, value: 1 },
  ]);
  assert.deepEqual(reconstructPopulationSeries(messages, 1, 10, 20), [
    { turn: 10, value: 2 },
    { turn: 15, value: 1 },
    { turn: 20, value: 1 },
  ]);
});

test("uses current population when no changes are logged", () => {
  assert.deepEqual(reconstructPopulationSeries([], 3, 1, 20), [
    { turn: 1, value: 3 },
    { turn: 20, value: 3 },
  ]);
});
