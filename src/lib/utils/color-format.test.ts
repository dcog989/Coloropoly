import { colordx, extend, inGamutSrgb } from "@colordx/core";
import hsv from "@colordx/core/plugins/hsv";
import hwb from "@colordx/core/plugins/hwb";
import okhsl from "@colordx/core/plugins/okhsl";
import { describe, expect, it } from "vitest";
import {
  clampHue,
  decimalsFor,
  formatHsl,
  formatHsv,
  formatHwb,
  formatOkhsl,
  formatOklch,
  formatRgb,
  getMaxSrgbChroma,
  HUE_MAX,
} from "./color-format";

extend([okhsl, hsv, hwb]);

const orange = colordx("#ff8040");

describe("formatOklch", () => {
  it("rounds to the practical precision and keeps hue", () => {
    expect(formatOklch(orange, false)).toBe("oklch(0.73 0.17 45)");
  });

  it("keeps four channel places in precise mode", () => {
    expect(formatOklch(orange, true)).toBe("oklch(0.7349 0.1726 45.1)");
  });

  it("appends alpha below one", () => {
    expect(formatOklch(colordx({ l: 0.5, c: 0.1, h: 20, alpha: 0.5 }), false)).toBe("oklch(0.5 0.1 20 / 0.5)");
  });
});

describe("formatOkhsl", () => {
  it("prints saturation and lightness as 0..1 fractions", () => {
    expect(formatOkhsl(orange, false)).toBe("okhsl(45 1 0.69)");
    expect(formatOkhsl(orange, true)).toBe("okhsl(45.1 1 0.6918)");
  });

  it("keeps alpha", () => {
    expect(formatOkhsl(colordx({ l: 0.5, c: 0.1, h: 20, alpha: 0.5 }), false)).toBe("okhsl(20 0.52 0.42 / 0.5)");
  });
});

describe("formatHsl / formatHsv / formatHwb", () => {
  it("print percent channels with the mode's decimals", () => {
    expect(formatHsl(orange, false)).toBe("hsl(20 100% 63%)");
    expect(formatHsl(orange, true)).toBe("hsl(20.1 100% 62.55%)");
    expect(formatHsv(orange, false)).toBe("hsv(20 75% 100%)");
    expect(formatHwb(orange, false)).toBe("hwb(20 25% 0%)");
  });
});

describe("formatRgb", () => {
  it("rounds to whole channels in practical mode", () => {
    expect(formatRgb(colordx({ r: 127.4, g: 12.6, b: 0 }), false)).toBe("rgb(127 13 0)");
  });

  it("keeps two channel places in precise mode", () => {
    expect(formatRgb(colordx({ r: 127.4, g: 12.6, b: 0 }), true)).toBe("rgb(127.4 12.6 0)");
  });
});

describe("getMaxSrgbChroma", () => {
  it("finds a chroma that is inside sRGB and whose next step is outside", () => {
    const max = getMaxSrgbChroma(0.5, 0);
    expect(max).toBeGreaterThan(0.2);
    expect(inGamutSrgb(colordx({ l: 0.5, c: max, h: 0 }))).toBe(true);
    expect(inGamutSrgb(colordx({ l: 0.5, c: max + 0.01, h: 0 }))).toBe(false);
  });

  it("gives lighter colors less available chroma", () => {
    expect(getMaxSrgbChroma(0.9, 0)).toBeLessThan(getMaxSrgbChroma(0.5, 0));
  });
});

describe("clampHue and decimalsFor", () => {
  it("keeps hue inside the slider range", () => {
    expect(clampHue(-5)).toBe(0);
    expect(clampHue(120)).toBe(120);
    expect(clampHue(400)).toBe(HUE_MAX);
  });

  it("picks the decimal set for the mode", () => {
    expect(decimalsFor(false)).toEqual({ channel: 2, percent: 0, hue: 0, rgb: 0 });
    expect(decimalsFor(true)).toEqual({ channel: 4, percent: 2, hue: 1, rgb: 2 });
  });
});
