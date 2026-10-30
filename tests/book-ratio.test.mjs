import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { formatBookRatio } from "../game/book-content.js";

const unitRules = JSON.parse(readFileSync(new URL("../game/data/units.json", import.meta.url), "utf8"));

function resolveRatioReference(reference) {
  const [namespace, unitType, ...path] = reference.split(".");
  let value;

  if (namespace === "rules") {
    value = { units: unitRules };
    path.unshift(unitType);
  } else if (namespace === "unit") {
    const overrides = unitRules.types[unitType === "default" ? unitRules.default.typeId : unitType];
    value = { ...unitRules.default, ...overrides };
    if (path[0] === "workPointsPerTurn" || path[0] === "plantedFoodCapacities") {
      value[path[0]] = { ...unitRules.default[path[0]], ...overrides?.[path[0]] };
    }
  }

  return path.reduce((current, key) => current?.[key], value);
}

test("book ratios are rounded to one localized decimal place", () => {
  assert.equal(formatBookRatio(32, 14, "fr"), "2,3");
  assert.equal(formatBookRatio(1, 4, "en"), "0.3");
  assert.equal(formatBookRatio(2, 2, "en"), "1");
  assert.equal(formatBookRatio(4, 2, "fr"), "2");
});

test("book ratios omit missing or zero-base rule values", () => {
  assert.equal(formatBookRatio(null, 2, "fr"), "");
  assert.equal(formatBookRatio(2, 0, "fr"), "");
  assert.equal(formatBookRatio(Infinity, 2, "fr"), "");
});

test("every localized unit-book ratio refers to valid numeric rules", () => {
  const bookRoot = new URL("../game/book/", import.meta.url);
  let ratioCount = 0;

  for (const language of ["fr", "en", "es", "ru"]) {
    const languageRoot = new URL(`${language}/`, bookRoot);
    for (const filename of readdirSync(languageRoot).filter((name) => name.endsWith(".html"))) {
      const html = readFileSync(new URL(filename, languageRoot), "utf8");
      assert.doesNotMatch(html, /<\/span>×/, `${language}/${filename}: multiplication sign follows factor`);
      for (const match of html.matchAll(/data-book-ratio="([^"]+)" data-book-ratio-base="([^"]+)"/g)) {
        const numerator = resolveRatioReference(match[1]);
        const denominator = resolveRatioReference(match[2]);
        assert.ok(formatBookRatio(numerator, denominator, language), `${language}/${filename}: ${match[0]}`);
        assert.notEqual(formatBookRatio(numerator, denominator, language), "1", `${language}/${filename}: redundant ×1`);
        ratioCount += 1;
      }
    }
  }

  assert.ok(ratioCount > 0);
});
