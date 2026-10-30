import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceGameEndingState,
  getBlockedHouseCompleteness,
  getFullPopulationVictoryTurn,
  getPopulationCap,
} from "../game/game-ending.js";

const dayNumber = (year, month, day) => Math.floor(Date.UTC(year, month - 1, day) / 86400000);
const turnDate = (turn) => {
  const date = new Date(turn * 86400000);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};
const victoryTurnForStart = (turn) => getFullPopulationVictoryTurn(turn, turnDate, dayNumber);

test("population cap is the sum of spawn quantities", () => {
  assert.equal(getPopulationCap([{ quantity: 86 }, { quantity: 1 }, { quantity: 1 }]), 88);
});

test("a competing house remains at least one work step short of completion", () => {
  assert.equal(getBlockedHouseCompleteness(0.99, 0.05), 0.95);
  assert.equal(getBlockedHouseCompleteness(0.8, 0.05), 0.8);
});

test("a full calendar month handles short months and year boundaries", () => {
  assert.equal(victoryTurnForStart(dayNumber(2025, 1, 31)), dayNumber(2025, 2, 28));
  assert.equal(victoryTurnForStart(dayNumber(2024, 1, 31)), dayNumber(2024, 2, 29));
  assert.equal(victoryTurnForStart(dayNumber(2025, 12, 15)), dayNumber(2026, 1, 15));
});

test("a full-population streak resets after a loss and must last a month", () => {
  const start = dayNumber(2025, 3, 4);
  const evaluate = (population, turn, previous = {}) => advanceGameEndingState({
    population,
    populationCap: 100,
    turn,
    victoryTurnForStart,
    ...previous,
  });

  const reachedCap = evaluate(100, start);
  assert.deepEqual(reachedCap, { fullPopulationSinceTurn: start, outcome: null });
  assert.deepEqual(evaluate(99, start + 10, reachedCap), { fullPopulationSinceTurn: null, outcome: null });

  const reachedCapAgain = evaluate(100, start + 11);
  assert.equal(reachedCapAgain.fullPopulationSinceTurn, start + 11);
  assert.equal(evaluate(100, victoryTurnForStart(start + 11) - 1, reachedCapAgain).outcome, null);
  assert.equal(evaluate(100, victoryTurnForStart(start + 11), reachedCapAgain).outcome, "victory");
  assert.equal(evaluate(0, start).outcome, "defeat");
  assert.deepEqual(evaluate(100, start + 100, { fullPopulationSinceTurn: start, outcome: "victory" }), {
    fullPopulationSinceTurn: start,
    outcome: "victory",
  });
  assert.deepEqual(advanceGameEndingState({
    population: 1,
    populationCap: 0,
    turn: start,
    victoryTurnForStart,
  }), { fullPopulationSinceTurn: null, outcome: null });
});
