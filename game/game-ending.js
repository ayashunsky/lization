export function getPopulationCap(pool) {
  return (Array.isArray(pool) ? pool : []).reduce(
    (total, entry) => total + Math.max(0, Math.floor(Number(entry?.quantity) || 0)),
    0,
  );
}

export function getBlockedHouseCompleteness(currentCompleteness, workDelta) {
  return Math.min(currentCompleteness, Math.max(0, 1 - workDelta));
}

export function getFullPopulationVictoryTurn(startTurn, getTurnDate, getTurnNumberForDate) {
  const { year, month, day } = getTurnDate(startTurn);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const followingYear = nextMonth === 12 ? nextYear + 1 : nextYear;
  const followingMonth = nextMonth === 12 ? 1 : nextMonth + 1;
  const daysInNextMonth = getTurnNumberForDate(followingYear, followingMonth, 1)
    - getTurnNumberForDate(nextYear, nextMonth, 1);

  return getTurnNumberForDate(nextYear, nextMonth, Math.min(day, daysInNextMonth));
}

export function advanceGameEndingState({
  population,
  populationCap,
  turn,
  fullPopulationSinceTurn = null,
  outcome = null,
  victoryTurnForStart,
}) {
  if (outcome) {
    return { fullPopulationSinceTurn, outcome };
  }

  if (population <= 0) {
    return { fullPopulationSinceTurn: null, outcome: "defeat" };
  }

  if (populationCap <= 0 || population < populationCap) {
    return { fullPopulationSinceTurn: null, outcome: null };
  }

  const startTurn = fullPopulationSinceTurn ?? turn;
  return {
    fullPopulationSinceTurn: startTurn,
    outcome: turn >= victoryTurnForStart(startTurn) ? "victory" : null,
  };
}
