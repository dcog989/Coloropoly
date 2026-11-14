import { describe, expect, it } from "vitest";
import { ColorStore } from "./color.svelte";

describe("ColorStore", () => {
  it("keeps an explicitly set hue on a neutral color", () => {
    const store = new ColorStore();
    expect(store.set("#808080")).toBe(true);
    expect(store.c).toBeLessThanOrEqual(0.001);

    store.h = 200;

    expect(store.h).toBeCloseTo(200);
    expect(store.c).toBeLessThanOrEqual(0.001);
  });

  it("keeps the chroma when lightness is dragged to either end", () => {
    const store = new ColorStore();
    store.set("#ff0000");
    const chroma = store.c;

    store.l = 0;
    expect(store.c).toBeCloseTo(chroma);

    store.l = 1;
    expect(store.c).toBeCloseTo(chroma);

    store.l = 0.5;
    expect(store.hex).not.toBe("#000000");
    expect(store.hex).not.toBe("#ffffff");
  });

  it("lets an explicit chroma replace the retained one", () => {
    const store = new ColorStore();
    store.set("#ff0000");

    store.l = 0;
    store.c = 0;

    expect(store.c).toBe(0);
  });

  it("rejects an unreadable value and keeps the current color", () => {
    const store = new ColorStore();
    store.set("#123456");

    expect(store.set("not-a-color")).toBe(false);
    expect(store.hex).toBe("#123456");
  });

  it("mirrors the color and alpha into cssVar", () => {
    const store = new ColorStore();

    store.set("#ff0000");
    store.alpha = 0.5;

    expect(store.cssVar).toMatch(/^oklch\([\d.]+% [\d.]+ [\d.]+ \/ 0\.5\)$/);
  });

  it("maps an out-of-gamut color into sRGB", () => {
    const store = new ColorStore();
    store.set("oklch(0.7 0.4 150)");

    expect(store.isOutOfGamut).toBe(true);
    store.mapToSrgb();
    expect(store.isOutOfGamut).toBe(false);
  });

  it("sets RGB and Okhsl channels", () => {
    const store = new ColorStore();

    store.setRgbValues(0, 128, 255);
    expect(store.hex).toBe("#0080ff");

    store.setOkhslValues(120, 50, 60);
    const { h, s, l } = store.okhslComp;

    expect(h).toBeCloseTo(120, 0);
    expect(s).toBeCloseTo(50, 0);
    expect(l).toBeCloseTo(60, 0);
  });

  it("formats a color for the active mode", () => {
    const store = new ColorStore();
    store.set("#ff0000");

    store.mode = "rgb";
    expect(store.formatColor("#ff8040")).toBe("rgb(255 128 64)");

    store.mode = "okhsl";
    expect(store.formatColor("#ff8040")).toMatch(/^okhsl\(/);
  });
});
