import { colordx, extend } from "@colordx/core";
import okhsl from "@colordx/core/plugins/okhsl";

extend([okhsl]);

const OKHSL_HUE_STOPS = 24;
const OKHSL_CHANNEL_STOPS = 12;

const RGB_CHANNEL_INDEX: Record<string, number> = { r: 0, g: 1, b: 2 };
const RGB_CHANNEL_MAX = 255;

export function getGradient(channel: string, rgb: { r: number; g: number; b: number }) {
  if (channel === "l" || channel === "c" || channel === "h") {
    return { gradientClass: `gradient-oklch-${channel}` };
  }

  if (channel === "alpha") {
    return {
      gradientStyle: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgba(${rgb.r},${rgb.g},${rgb.b},1))`,
    };
  }

  const index = RGB_CHANNEL_INDEX[channel];
  if (index === undefined) return {};

  // Vary only this channel; the other two stay at the current color's values.
  const low = [rgb.r, rgb.g, rgb.b];
  const high = [...low];
  low[index] = 0;
  high[index] = RGB_CHANNEL_MAX;
  return { gradientStyle: `linear-gradient(to right, rgb(${low.join(",")}), rgb(${high.join(",")}))` };
}

export function okhslGradient(channel: "h" | "s" | "l", base: { h: number; s: number; l: number }) {
  const count = channel === "h" ? OKHSL_HUE_STOPS : OKHSL_CHANNEL_STOPS;
  const stops: string[] = [];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const { h, s, l } =
      channel === "h"
        ? { h: t * 360, s: base.s, l: base.l }
        : channel === "s"
          ? { h: base.h, s: t * 100, l: base.l }
          : { h: base.h, s: base.s, l: t * 100 };
    const { r, g, b } = colordx({ h, s, l, colorSpace: "okhsl" }).toRgb();
    stops.push(`rgb(${r} ${g} ${b}) ${(t * 100).toFixed(2)}%`);
  }

  return { gradientStyle: `linear-gradient(to right, ${stops.join(", ")})` };
}
