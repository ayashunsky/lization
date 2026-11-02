export function normalizeHappiness(value, rules = {}) {
  const minimum = Number.isFinite(rules.minimum) ? rules.minimum : 0;
  const maximum = Number.isFinite(rules.maximum) ? Math.max(minimum, rules.maximum) : 100;
  const fallback = Number.isFinite(rules.initial) ? rules.initial : 100;
  const amount = Number.isFinite(value) ? value : fallback;
  return Math.min(maximum, Math.max(minimum, amount));
}

export function getStepChange(steps, value) {
  if (!Array.isArray(steps)) return 0;

  let threshold = -Infinity;
  let change = 0;
  for (const step of steps) {
    if (!Number.isFinite(step?.min) || !Number.isFinite(step?.deltaPerTurn)) continue;
    if (step.min <= value && step.min >= threshold) {
      threshold = step.min;
      change = step.deltaPerTurn;
    }
  }
  return change;
}

export function getFoodSurvivalDays(foodAmount, dailyConsumption) {
  if (!(dailyConsumption > 0)) return Infinity;
  return Math.max(0, foodAmount) / dailyConsumption;
}

export function getHappinessChangeForTurn(rules, { foodDays, population, waitingUnits, buildingBonus = 0 }) {
  return getStepChange(rules.foodDaysSteps, foodDays)
    + getStepChange(rules.populationSteps, population)
    + (Number(rules.waitPerUnitPerTurn) || 0) * waitingUnits
    + buildingBonus;
}
