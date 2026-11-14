import { describe, expect, it } from "vitest";
import {
  ensureOklch,
  evictedCount,
  mergePaintbox,
  oklchOf,
  type PaintboxColor,
  parsePaintbox,
  toColorKey,
} from "./paintbox";

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

describe("oklchOf", () => {
  it("caches the color's oklch and falls back for unparseable values", () => {
    expect(oklchOf("#ff0000").h).toBeCloseTo(29.2, 1);
    expect(oklchOf("not-a-color")).toEqual({ l: 0, c: 0, h: 0, alpha: 1 });
  });
});

describe("ensureOklch", () => {
  it("keeps a cached oklch and recomputes a missing one", () => {
    const cached = swatch("#ff0000", 1);

    expect(ensureOklch(cached)).toBe(cached);
    expect(ensureOklch({ id: "x", css: "#00ff00", timestamp: 1 }).oklch.c).toBeGreaterThan(0);
  });
});

describe("parsePaintbox", () => {
  it("drops invalid entries and keeps the newest items", () => {
    const raw = JSON.stringify([{ id: "a", css: "#ff0000", timestamp: 1 }, "junk", swatch("#00ff00", 3)]);

    const parsed = parsePaintbox(raw, 1);

    expect(parsed.map((item) => item.css)).toEqual(["#00ff00"]);
  });

  it("returns an empty list for empty, non-array and over-cap input", () => {
    expect(parsePaintbox(null, 24)).toEqual([]);
    expect(parsePaintbox("{}", 24)).toEqual([]);
    expect(parsePaintbox("[]", 0)).toEqual([]);
  });

  it("throws when the stored JSON is unreadable so the caller can keep it", () => {
    expect(() => parsePaintbox("{oops", 24)).toThrow();
  });
});

describe("evictedCount", () => {
  it("counts only colors that the cap would drop", () => {
    const current = [swatch("#ff0000", 1), swatch("#00ff00", 2)];

    expect(evictedCount(current, ["#0000ff"], 4)).toBe(0);
    expect(evictedCount(current, ["#0000ff"], 2)).toBe(1);
    expect(evictedCount(current, ["#f00"], 2)).toBe(0);
    expect(evictedCount([], ["#ff0000", "#ff0000"], 1)).toBe(0);
  });
});
