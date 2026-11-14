import { colordx } from "@colordx/core";
import { parseHex, rgbToOklab } from "@colordx/core/fn";

export interface ColorEntry {
  name: string;
  hex: string;
}

export interface ColorIndex {
  /** Oklab triplets, three floats per color. */
  coordinates: Float32Array;
  names: string[];
  hexValues: string[];
  lowerNames: string[];
}

export function buildColorIndex(list: ReadonlyArray<ColorEntry>): ColorIndex {
  const coords = new Float32Array(list.length * 3);
  const names: string[] = [];
  const hexValues: string[] = [];
  const lowerNames: string[] = [];

  for (const entry of list) {
    let l = 0;
    let a = 0;
    let b = 0;
    const rgb = parseHex(entry.hex);
    if (rgb) {
      const oklab = rgbToOklab(rgb);
      l = oklab.l;
      a = oklab.a;
      b = oklab.b;
    }

    // Index by names.length so a skipped entry can never leave a hole.
    const ptr = names.length * 3;
    coords[ptr] = l;
    coords[ptr + 1] = a;
    coords[ptr + 2] = b;
    names.push(entry.name);
    hexValues.push(entry.hex);
    lowerNames.push(entry.name.toLowerCase());
  }

  // Dense, aligned arrays: a skipped entry can no longer leave a gap.
  return {
    coordinates: coords.subarray(0, names.length * 3),
    names,
    hexValues,
    lowerNames,
  };
}

export function findClosestName(current: { l: number; c: number; h: number }, index: ColorIndex): string {
  if (!index.names.length || !index.coordinates.length) {
    return "Custom Color";
  }

  let tL: number, ta: number, tb: number;
  try {
    const target = colordx({ l: current.l, c: current.c, h: current.h }).toOklab();
    tL = target.l;
    ta = target.a;
    tb = target.b;
  } catch {
    return "Custom Color";
  }

  let minDistSq = Infinity;
  let bestIndex = -1;
  const coords = index.coordinates;
  const len = index.names.length;

  for (let i = 0; i < len; i++) {
    const ptr = i * 3;
    const dL = (coords[ptr] as number) - tL;
    const da = (coords[ptr + 1] as number) - ta;
    const db = (coords[ptr + 2] as number) - tb;
    const distSq = dL * dL + da * da + db * db;

    if (distSq < minDistSq) {
      minDistSq = distSq;
      bestIndex = i;
    }
  }

  return bestIndex === -1 ? "Custom Color" : (index.names[bestIndex] as string);
}

export function filterColors(index: ColorIndex, query: string, limit: number): ColorEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const cap = Math.max(0, limit);
  const results: ColorEntry[] = [];
  for (let i = 0; i < index.names.length && results.length < cap; i++) {
    if (index.lowerNames[i]?.includes(needle)) {
      results.push({ name: index.names[i] as string, hex: index.hexValues[i] as string });
    }
  }
  return results;
}

export function getPage(index: ColorIndex, offset: number, limit: number): ColorEntry[] {
  const start = Math.max(0, offset);
  const end = Math.min(start + Math.max(0, limit), index.names.length);
  const results: ColorEntry[] = [];
  for (let i = start; i < end; i++) {
    results.push({ name: index.names[i] as string, hex: index.hexValues[i] as string });
  }
  return results;
}
