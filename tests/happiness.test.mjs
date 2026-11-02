import assert from "node:assert/strict";
import test from "node:test";

import {
  getFoodSurvivalDays,
  getHappinessChangeForTurn,
  getStepChange,
  normalizeHappiness,
} from "../game/happiness.js";

const rules = {
  initial: 80,
  minimum: 0,
  maximum: 100,
  foodDaysSteps: [
    { min: 30, deltaPerTurn: 0 },
    { min: 0, deltaPerTurn: -0.8 },
    { min: 60, deltaPerTurn: 0.1 },
  ],
  populationSteps: [
    { min: 5, deltaPerTurn: 0.05 },
    { min: 0, deltaPerTurn: 0 },
  ],
  waitPerUnitPerTurn: 0.05,
};

test("food coverage uses current consumption, including fractional values", () => {
  assert.equal(getFoodSurvivalDays(36, 1.5), 24);
  assert.equal(getFoodSurvivalDays(0, 0), Infinity);
});

test("step changes select the highest matching threshold regardless of order", () => {
  assert.equal(getStepChange(rules.foodDaysSteps, 29.9), -0.8);
  assert.equal(getStepChange(rules.foodDaysSteps, 30), 0);
  assert.equal(getStepChange(rules.foodDaysSteps, 60), 0.1);
});

test("food, population, waiting units, and buildings add one per-turn change", () => {
  assert.equal(getHappinessChangeForTurn(rules, {
    foodDays: 65,
    population: 6,
    waitingUnits: 2,
    buildingBonus: 0.25,
  }), 0.5);
});

test("old saves without happiness use the configured initial value", () => {
  assert.equal(normalizeHappiness(undefined, rules), 80);
  assert.equal(normalizeHappiness(null, rules), 80);
  assert.equal(normalizeHappiness(120, rules), 100);
  assert.equal(normalizeHappiness(-4, rules), 0);
  assert.equal(normalizeHappiness(73.25, rules), 73.25);
});
