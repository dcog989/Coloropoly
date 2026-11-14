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
