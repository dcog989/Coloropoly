import { colordx } from "@colordx/core";
import { usesDarkText } from "./text-contrast";

export type SetSortOrder = "name" | "hue" | "lightness" | "chroma";

const nameCollator = new Intl.Collator(undefined, { numeric: true });

export interface SetColor {
  name: string;
  css: string;
  hue: number | null;
  saturation: number;
  lightness: number;
  chroma: number;
  /** True when black text has the stronger APCA contrast against the color. */
  useDarkText: boolean;
}

export function processSetColors(colors: Record<string, string>): SetColor[] {
  return Object.entries(colors).flatMap(([name, value]) => {
    const color = colordx(value);
    if (!color.isValid()) return [];

    const hsl = color.toHsl();
    const oklch = color.toOklch();
    // Null hue sorts achromatic colors after every hue family.
    const hue = hsl.s > 0 ? (Number.isNaN(hsl.h) ? 0 : hsl.h) : null;

    return [
      {
        name,
        css: color.toHex(),
        hue,
        saturation: hsl.s,
        lightness: hsl.l,
        chroma: oklch.c,
        useDarkText: usesDarkText(color.toHex()),
      },
    ];
  });
}

export function filterSetColors(colors: SetColor[], query: string): SetColor[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return colors;
  return colors.filter((color) => color.name.toLowerCase().includes(needle) || color.css.includes(needle));
}

export function sortSetColors(colors: SetColor[], order: SetSortOrder): SetColor[] {
  const sorted = [...colors];
  sorted.sort((a, b) => {
    switch (order) {
      case "lightness":
        return b.lightness - a.lightness;
      case "chroma":
        return b.chroma - a.chroma;
      case "hue":
        if (a.hue === null && b.hue === null) return a.lightness - b.lightness;
        if (a.hue === null) return 1;
        if (b.hue === null) return -1;
        if (a.hue !== b.hue) return a.hue - b.hue;
        if (a.lightness !== b.lightness) return a.lightness - b.lightness;
        return a.saturation - b.saturation;
      default:
        return nameCollator.compare(a.name, b.name);
    }
  });
  return sorted;
}

export function filterAndSortSetColors(
  colors: SetColor[],
  options: { query: string; order: SetSortOrder },
): SetColor[] {
  return sortSetColors(filterSetColors(colors, options.query), options.order);
}
