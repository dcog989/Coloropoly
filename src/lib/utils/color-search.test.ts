import { colordx } from "@colordx/core";
import { describe, expect, it } from "vitest";
import { buildColorIndex, filterColors, findClosestName, getPage } from "./color-search";

const list = [
  { name: "Red", hex: "#ff0000" },
  { name: "Green", hex: "#00ff00" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Deep Sea", hex: "#123456" },
];

const index = buildColorIndex(list);

describe("buildColorIndex", () => {
  it("keeps names and hex values aligned with the coordinate triples", () => {
    expect(index.names).toEqual(["Red", "Green", "Blue", "Deep Sea"]);
    expect(index.hexValues).toEqual(["#ff0000", "#00ff00", "#0000ff", "#123456"]);
    expect(index.coordinates).toHaveLength(12);
  });
});

describe("findClosestName", () => {
  it("returns the nearest named color", () => {
    const red = colordx("#ff0000").toOklch();
    expect(findClosestName({ l: red.l, c: red.c, h: red.h }, index)).toBe("Red");
  });

  it("distinguishes nearby colors", () => {
    const blue = colordx("#0000ff").toOklch();
    expect(findClosestName({ l: blue.l, c: blue.c, h: blue.h }, index)).toBe("Blue");
  });

  it("falls back to Custom Color for an empty index", () => {
    expect(findClosestName({ l: 0.5, c: 0.1, h: 20 }, buildColorIndex([]))).toBe("Custom Color");
  });
});

describe("filterColors", () => {
  it("matches names case-insensitively", () => {
    expect(filterColors(index, "DE", 10).map((entry) => entry.name)).toEqual(["Deep Sea"]);
  });

  it("returns nothing for an empty query", () => {
    expect(filterColors(index, "   ", 10)).toEqual([]);
  });

  it("stops at the limit", () => {
    expect(filterColors(index, "e", 2)).toHaveLength(2);
  });
});

describe("getPage", () => {
  it("slices the list without overlaps", () => {
    expect(getPage(index, 0, 2).map((entry) => entry.name)).toEqual(["Red", "Green"]);
    expect(getPage(index, 2, 2).map((entry) => entry.name)).toEqual(["Blue", "Deep Sea"]);
  });

  it("clamps past the end of the list", () => {
    expect(getPage(index, 10, 5)).toEqual([]);
  });
});
