import { describe, expect, it } from "vitest";
import { filterAndSortSetColors, filterSetColors, processSetColors, sortSetColors } from "./palette-sets";

const set = processSetColors({
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  blue: "#0000ff",
  gray: "#808080",
  invalid: "not-a-color",
});

describe("processSetColors", () => {
  it("drops invalid colors and normalizes values to hex", () => {
    expect(set).toHaveLength(5);
    expect(set.find((color) => color.name === "red")?.css).toBe("#ff0000");
    expect(set.some((color) => color.name === "invalid")).toBe(false);
  });

  it("marks achromatic colors with a null hue", () => {
    expect(set.find((color) => color.name === "gray")?.hue).toBeNull();
    expect(set.find((color) => color.name === "red")?.hue).toBe(0);
  });

  it("picks dark text on light swatches and light text on dark ones", () => {
    expect(set.find((color) => color.name === "white")?.useDarkText).toBe(true);
    expect(set.find((color) => color.name === "black")?.useDarkText).toBe(false);
  });
});

describe("filterSetColors", () => {
  it("matches names and hex values, case-insensitively", () => {
    expect(filterSetColors(set, "RE").map((color) => color.name)).toEqual(["red"]);
    expect(filterSetColors(set, "#0000ff").map((color) => color.name)).toEqual(["blue"]);
  });

  it("returns the input untouched for an empty query", () => {
    expect(filterSetColors(set, "  ")).toBe(set);
  });
});

describe("sortSetColors", () => {
  it("sorts names with numeric segments in order", () => {
    const named = processSetColors({ a10: "#ff0000", a2: "#00ff00", a1: "#0000ff" });
    expect(sortSetColors(named, "name").map((color) => color.name)).toEqual(["a1", "a2", "a10"]);
  });

  it("sorts by lightness, lightest first", () => {
    const names = sortSetColors(set, "lightness").map((color) => color.name);
    expect(names[0]).toBe("white");
    expect(names.at(-1)).toBe("black");
  });

  it("sorts by chroma, most saturated first", () => {
    const names = sortSetColors(set, "chroma").map((color) => color.name);
    expect(names.slice(0, 2)).toEqual(expect.arrayContaining(["red", "blue"]));
    expect(names.at(-1)).toBe("gray");
  });

  it("sorts hue families first and achromatic colors last", () => {
    const names = sortSetColors(set, "hue").map((color) => color.name);
    expect(names.slice(0, 2)).toEqual(["red", "blue"]);
    expect(names.slice(2)).toEqual(["black", "gray", "white"]);
  });

  it("does not mutate the input", () => {
    const before = set.map((color) => color.name);
    sortSetColors(set, "lightness");
    expect(set.map((color) => color.name)).toEqual(before);
  });
});

describe("filterAndSortSetColors", () => {
  it("filters before sorting", () => {
    const names = filterAndSortSetColors(set, { query: "l", order: "lightness" }).map((color) => color.name);
    expect(names).toEqual(["blue", "black"]);
  });
});
