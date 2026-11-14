import { describe, expect, it } from "vitest";
import { mergePaintbox, type PaintboxColor, toColorKey } from "./paintbox";

const swatch = (css: string, timestamp: number): PaintboxColor => ({
  id: css,
  css,
  timestamp,
  oklch: { l: 0.5, c: 0.1, h: 120, alpha: 1 },
});

describe("toColorKey", () => {
  it("normalizes equivalent color strings to the same key", () => {
    expect(toColorKey("#aabbcc")).toBe(toColorKey("#aabbccff"));
    expect(toColorKey("rgb(170 187 204)")).toBe(toColorKey("#aabbcc"));
    expect(toColorKey("#ABC")).toBe(toColorKey("#aabbcc"));
  });

  it("passes unparseable values through", () => {
    expect(toColorKey("not-a-color")).toBe("not-a-color");
  });
});

describe("mergePaintbox", () => {
  it("keeps one copy of a color, preferring the newer timestamp", () => {
    const merged = mergePaintbox([swatch("#ff0000", 1)], [swatch("#f00", 2)], 24);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.css).toBe("#f00");
    expect(merged[0]?.timestamp).toBe(2);
  });

  it("keeps a color that another tab added", () => {
    const merged = mergePaintbox([swatch("#ff0000", 1)], [swatch("#00ff00", 2)], 24);

    expect(merged.map((item) => item.css)).toEqual(["#ff0000", "#00ff00"]);
  });

  it("drops the oldest colors over the cap", () => {
    const colors = Array.from({ length: 5 }, (_, i) => swatch(`#00000${i}`, i));

    expect(mergePaintbox([], colors, 3).map((item) => item.css)).toEqual(["#000002", "#000003", "#000004"]);
  });

  it("returns nothing when the cap is zero", () => {
    expect(mergePaintbox([swatch("#ff0000", 1)], [], 0)).toEqual([]);
  });
});
