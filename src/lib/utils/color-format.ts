import type { Colordx } from "@colordx/core";
import { oklchToLinear } from "@colordx/core";

const CHROMA_SEARCH_UPPER_BOUND = 0.5;
const CHROMA_SEARCH_ITERATIONS = 18;
// Mirrors colordx's in-gamut test, which allows a small linear-sRGB tolerance.
const GAMUT_TOLERANCE = 5e-4;
export const HUE_MAX = 359.999;

// Decimal places per mode, keyed by channel scale. Percent (0..100) carries two
// fewer places than fraction (0..1); hue is coarser than both; rgb is 0..255.
// Sliders reuse these as steps.
const DECIMALS = {
  practical: { channel: 2, percent: 0, hue: 0, rgb: 0 },
  precise: { channel: 4, percent: 2, hue: 1, rgb: 2 },
} as const;

export const decimalsFor = (precise: boolean) => (precise ? DECIMALS.precise : DECIMALS.practical);

export const clampHue = (h: number): number => Math.max(0, Math.min(h, HUE_MAX));

const isInSrgbGamut = (l: number, c: number, h: number): boolean => {
  const [r, g, b] = oklchToLinear(l, c, h);
  return (
    r >= -GAMUT_TOLERANCE &&
    r <= 1 + GAMUT_TOLERANCE &&
    g >= -GAMUT_TOLERANCE &&
    g <= 1 + GAMUT_TOLERANCE &&
    b >= -GAMUT_TOLERANCE &&
    b <= 1 + GAMUT_TOLERANCE
  );
};

export function getMaxSrgbChroma(l: number, h: number): number {
  let low = 0;
  let high = CHROMA_SEARCH_UPPER_BOUND;
  for (let i = 0; i < CHROMA_SEARCH_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    if (isInSrgbGamut(l, mid, h)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

export const round = (value: number, decimals: number): number => parseFloat(value.toFixed(decimals));

const joinColor = (fn: string, channels: (number | string)[], alpha: number, decimals: number): string => {
  const suffix = alpha < 1 ? ` / ${round(alpha, decimals)}` : "";
  return `${fn}(${channels.join(" ")}${suffix})`;
};

export function formatOklch(color: Colordx, precise: boolean): string {
  const { l, c, h, alpha } = color.toOklch();
  const d = decimalsFor(precise);
  return joinColor("oklch", [round(l, d.channel), round(c, d.channel), round(h || 0, d.hue)], alpha, d.channel);
}

// OKHSL/OKHSV native saturation and lightness are 0..1 fractions, but colordx
// reports percentages; the app prints the decimal form, matching its input normalizer.
export function formatOkhsl(color: Colordx, precise: boolean): string {
  const { h, s, l, alpha } = color.toOkhsl();
  const d = decimalsFor(precise);
  return joinColor(
    "okhsl",
    [round(h || 0, d.hue), round(s / 100, d.channel), round(l / 100, d.channel)],
    alpha,
    d.channel,
  );
}

export function formatHsl(color: Colordx, precise: boolean): string {
  const { h, s, l, alpha } = color.toHsl();
  const d = decimalsFor(precise);
  return joinColor(
    "hsl",
    [round(h || 0, d.hue), `${round(s, d.percent)}%`, `${round(l, d.percent)}%`],
    alpha,
    d.channel,
  );
}

export function formatHsv(color: Colordx, precise: boolean): string {
  const { h, s, v, alpha } = color.toHsv();
  const d = decimalsFor(precise);
  return joinColor(
    "hsv",
    [round(h || 0, d.hue), `${round(s, d.percent)}%`, `${round(v, d.percent)}%`],
    alpha,
    d.channel,
  );
}

export function formatHwb(color: Colordx, precise: boolean): string {
  const { h, w, b, alpha } = color.toHwb();
  const d = decimalsFor(precise);
  return joinColor(
    "hwb",
    [round(h || 0, d.hue), `${round(w, d.percent)}%`, `${round(b, d.percent)}%`],
    alpha,
    d.channel,
  );
}

// colordx's toRgbString always rounds to integers, so build the string from
// toRgb(precision) to honour the requested channel digits.
export const formatRgb = (color: Colordx, precise: boolean): string => {
  const d = decimalsFor(precise);
  const { r, g, b } = color.toRgb(d.rgb);
  return joinColor("rgb", [r, g, b], color.alpha(), d.channel);
};
