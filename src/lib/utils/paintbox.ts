import { colordx } from "@colordx/core";

export type PaintboxColor = {
  id: string;
  css: string;
  timestamp: number;
  oklch: { l: number; c: number; h: number; alpha: number };
};

export function toColorKey(css: string): string {
  const parsed = colordx(css);
  return parsed.isValid() ? parsed.toHex8() : css;
}

export const oklchOf = (css: string): PaintboxColor["oklch"] => {
  const parsed = colordx(css);
  return parsed.isValid() ? parsed.toOklch() : { l: 0, c: 0, h: 0, alpha: 1 };
};

const isSavedColor = (item: unknown): item is Partial<PaintboxColor> =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as PaintboxColor).id === "string" &&
  typeof (item as PaintboxColor).css === "string" &&
  typeof (item as PaintboxColor).timestamp === "number";

const hasOklch = (value: unknown): value is PaintboxColor["oklch"] => {
  if (typeof value !== "object" || value === null) return false;
  const { l, c, h, alpha } = value as Record<string, unknown>;
  return typeof l === "number" && typeof c === "number" && typeof h === "number" && typeof alpha === "number";
};

/** Fill in the cached oklch of colors saved by an older version. */
export function ensureOklch(item: Partial<PaintboxColor>): PaintboxColor {
  if (hasOklch(item.oklch)) return item as PaintboxColor;
  return { ...item, oklch: oklchOf(item.css ?? "") } as PaintboxColor;
}

/** Parse the stored paintbox JSON; throws only when the JSON itself is unreadable. */
export function parsePaintbox(raw: string | null, max: number): PaintboxColor[] {
  if (!raw || max <= 0) return [];

  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isSavedColor).map(ensureOklch).slice(-max);
}

/** How many saved colors adding `incoming` would drop at this cap. */
export function evictedCount(current: readonly PaintboxColor[], incoming: readonly string[], max: number): number {
  const keys = new Set(current.map((item) => toColorKey(item.css)));
  for (const css of incoming) keys.add(toColorKey(css));
  return Math.max(0, keys.size - Math.max(0, max));
}

/** Union two lists by color, newest copy wins, keep the newest `max` items. */
export function mergePaintbox(
  current: readonly PaintboxColor[],
  incoming: readonly PaintboxColor[],
  max: number,
): PaintboxColor[] {
  if (max <= 0) return [];

  const byKey = new Map<string, PaintboxColor>();
  for (const item of [...current, ...incoming]) {
    const key = toColorKey(item.css);
    const previous = byKey.get(key);
    if (!previous || item.timestamp >= previous.timestamp) byKey.set(key, item);
  }

  return [...byKey.values()].sort((a, b) => a.timestamp - b.timestamp).slice(-max);
}
