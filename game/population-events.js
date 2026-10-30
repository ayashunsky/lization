export function normalizePopulationEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("Missing population event data.");
  }

  return events.map((entry) => {
    if (!Number.isInteger(entry?.turn) || entry.turn < 1 || ![-1, 1].includes(entry.change)) {
      throw new Error("Invalid population event data.");
    }

    return {
      turn: entry.turn,
      change: entry.change,
      ...(typeof entry.unitType === "string" && entry.unitType.trim()
        ? { unitType: entry.unitType.trim() }
        : {}),
    };
  });
}
