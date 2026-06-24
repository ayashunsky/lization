export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function clampInteger(value, min, max, fallback = min) {
  const number = Number.parseInt(value, 10);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return clamp(number, min, max);
}

export function clampNumber(value, min, max, fallback = min) {
  const number = Number.parseFloat(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return clamp(number, min, max);
}

export function clampNonNegativeNumber(value, max = 999999, fallback = 0) {
  return Math.max(0, clampNumber(value, 0, max, fallback));
}
