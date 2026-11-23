import { colordx } from "@colordx/core";
import { describe, expect, it } from "vitest";
import { generateHarmony, generatePalette, isHarmonyMode } from "./palette";

const toOklch = (hex: string) => colordx(hex).toOklch();

describe("isHarmonyMode", () => {
  it("separates harmony names from channel axes", () => {
    expect(isHarmonyMode("triadic")).toBe(true);
    expect(isHarmonyMode("split-complementary")).toBe(true);
    expect(isHarmonyMode("l")).toBe(false);
  });
});

describe("generatePalette", () => {
  it("clamps the step count between two and twenty", () => {
    expect(generatePalette({ l: 0.5, c: 0.1, h: 100 }, "l", 0)).toHaveLength(2);
    expect(generatePalette({ l: 0.5, c: 0.1, h: 100 }, "l", 99)).toHaveLength(20);
  });

  it("keeps a visible chroma ramp for a near-grey base", () => {
    const steps = generatePalette({ l: 0.5, c: 0.001, h: 100 }, "c", 20);

    expect(new Set(steps).size).toBeGreaterThan(10);
  });

  it("keeps a visible hue ramp for a neutral base", () => {
    const steps = generatePalette({ l: 0.5, c: 0, h: 100 }, "h", 8);

    expect(new Set(steps).size).toBe(8);
  });

  it("keeps every lightness step distinct at high chroma", () => {
    const steps = generatePalette({ l: 0.5, c: 0.37, h: 270 }, "l", 20);
    const parsed = steps.map(toOklch);

    expect(new Set(steps).size).toBe(20);
    for (let i = 1; i < parsed.length; i++) {
      expect(parsed[i]?.l).toBeGreaterThan(parsed[i - 1]?.l ?? 0);
    }
    for (const step of parsed) {
      expect(step.c).toBeLessThanOrEqual(0.38);
    }
  });

  it("holds the untouched channels for the hue and alpha scales", () => {
    const base = { l: 0.5, c: 0.1, h: 100 };

    for (const hex of generatePalette(base, "h", 6)) {
      const step = toOklch(hex);
      expect(step.l).toBeCloseTo(base.l, 2);
      expect(step.c).toBeCloseTo(base.c, 1);
    }

    for (const hex of generatePalette(base, "a", 5)) {
      const step = toOklch(hex);
      expect(step.l).toBeCloseTo(base.l, 2);
      expect(step.c).toBeCloseTo(base.c, 2);
      expect(step.h).toBeCloseTo(base.h, 1);
    }
  });

  it("holds lightness and hue on the chroma scale", () => {
    const base = { l: 0.5, c: 0.05, h: 100 };
    const parsed = generatePalette(base, "c", 5).map(toOklch);

    for (const step of parsed) {
      expect(step.l).toBeCloseTo(base.l, 2);
      expect(Math.abs(step.h - base.h)).toBeLessThan(5);
    }
    expect(parsed.at(-1)?.c).toBeGreaterThan(parsed[0]?.c ?? 0);
  });

  it("spreads alpha across the eight digit hex range", () => {
    const alpha = generatePalette({ l: 0.5, c: 0.1, h: 100 }, "a", 3);

    expect(alpha[0]).toMatch(/^#[0-9a-f]{8}$/);
    expect(alpha[2]?.slice(7)).toBe("ff");
  });
});

describe("generateHarmony", () => {
  it("returns the harmony set and keeps the base alpha", () => {
    const triadic = generateHarmony({ l: 0.5, c: 0.1, h: 100, alpha: 0.5 }, "triadic");

    expect(triadic).toHaveLength(3);
    for (const hex of triadic) {
      expect(hex).toMatch(/^#[0-9a-f]{8}$/);
    }
  });

  it("returns the expected size for each harmony", () => {
    const base = { l: 0.5, c: 0.1, h: 100 };

    expect(generateHarmony(base, "complementary")).toHaveLength(2);
    expect(generateHarmony(base, "tetradic")).toHaveLength(4);
    expect(generateHarmony(base, "rectangle")).toHaveLength(4);
  });

  it("keeps lightness and hue when a high chroma step lands outside sRGB", () => {
    const base = { l: 0.5, c: 0.37, h: 270 };
    const steps = generateHarmony(base, "tetradic").map(toOklch);

    steps.forEach((step, i) => {
      const expectedHue = (base.h + i * 90) % 360;
      const hueDistance = Math.abs(step.h - expectedHue);
      expect(step.l).toBeCloseTo(base.l, 1);
      expect(Math.min(hueDistance, 360 - hueDistance)).toBeLessThan(2);
    });
  });
});
