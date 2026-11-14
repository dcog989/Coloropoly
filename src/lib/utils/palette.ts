import { colordx, extend } from "@colordx/core";
import harmonies from "@colordx/core/plugins/harmonies";
import { getMaxSrgbChroma } from "./color-format";

extend([harmonies]);

export type PaletteAxis = "l" | "c" | "h" | "a";

export type HarmonyType = "complementary" | "split-complementary" | "analogous" | "triadic" | "tetradic" | "rectangle";

export type GenerationMode = HarmonyType | PaletteAxis;

export interface PaletteColor {
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

const HARMONY_TYPES: Record<string, true> = {
  complementary: true,
  "split-complementary": true,
  analogous: true,
  triadic: true,
  tetradic: true,
  rectangle: true,
};

const MIN_STEPS = 2;
const MAX_STEPS = 20;
const LIGHTNESS_MIN = 0.08;
const LIGHTNESS_SPAN = 0.89;
const CHROMA_MIN = 0.04;
const CHROMA_MAX = 0.2;
// Floor the chroma span so a near-grey base still produces a visible ramp.
const CHROMA_MIN_SPAN = 0.08;
const CHROMA_BASE_FACTOR = 1.5;

export function isHarmonyMode(mode: GenerationMode): mode is HarmonyType {
  return mode in HARMONY_TYPES;
}

export function generateHarmony(baseColor: PaletteColor, type: HarmonyType): string[] {
  return colordx(baseColor)
    .harmonies(type)
    .map((color) => color.toHex());
}

export function generatePalette(baseColor: PaletteColor, axis: PaletteAxis, steps: number): string[] {
  if (steps < MIN_STEPS) steps = MIN_STEPS;
  if (steps > MAX_STEPS) steps = MAX_STEPS;

  return Array.from({ length: steps }, (_, i) => {
    const fraction = i / (steps - 1);

    const l = axis === "l" ? LIGHTNESS_MIN + fraction * LIGHTNESS_SPAN : baseColor.l;
    const h = axis === "h" ? i * (360 / steps) : (baseColor.h ?? 0);
    const c =
      axis === "c"
        ? CHROMA_MIN + fraction * Math.min(CHROMA_MAX, Math.max(CHROMA_MIN_SPAN, baseColor.c * CHROMA_BASE_FACTOR))
        : // Keep non-chroma steps in sRGB; clipped steps collapse into near-copies.
          Math.min(baseColor.c, getMaxSrgbChroma(l, h));
    const alpha = axis === "a" ? fraction : (baseColor.alpha ?? 1);

    // toHex8 keeps every step at a uniform 8-digit width; toHex drops alpha when opaque.
    return colordx({ l, c, h, alpha }).toHex8();
  });
}
