import { colordx } from "@colordx/core";
import { PAINTBOX } from "../constants";
import { mergePaintbox, type PaintboxColor } from "../utils/paintbox";

export type PaintboxSortMode = "newest" | "oldest" | "hue" | "lightness" | "chroma";

const oklchOf = (css: string): PaintboxColor["oklch"] => {
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

export class PaintboxStore {
  #colors = $state<PaintboxColor[]>([]);
  #initialized = false;
  sortMode = $state<PaintboxSortMode>("newest");

  init() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.#colors = this.#readStored();
    window.addEventListener("storage", this.#onStorage);

    $effect(() => {
      this.#saveToStorage();
    });
  }

  #onStorage = (event: StorageEvent) => {
    if (event.key === PAINTBOX.STORAGE_KEY || event.key === null) {
      this.#colors = this.#readStored();
    }
  };

  destroy() {
    window.removeEventListener("storage", this.#onStorage);
  }

  #readStored(): PaintboxColor[] {
    try {
      const stored = localStorage.getItem(PAINTBOX.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(isSavedColor)
        .map((item) => this.#ensureOklch(item))
        .slice(-PAINTBOX.MAX_COLORS);
    } catch (e) {
      console.error("Failed to load paintbox data:", e);
      try {
        localStorage.removeItem(PAINTBOX.STORAGE_KEY);
      } catch {
        /* Storage removal failed, continue */
      }
      return [];
    }
  }

  #saveToStorage() {
    try {
      localStorage.setItem(PAINTBOX.STORAGE_KEY, JSON.stringify(this.#colors));
    } catch (e) {
      console.error("Failed to save paintbox data:", e);
    }
  }

  #ensureOklch(item: Partial<PaintboxColor>): PaintboxColor {
    if (hasOklch(item.oklch)) {
      return item as PaintboxColor;
    }
    return { ...item, oklch: oklchOf(item.css ?? "") } as PaintboxColor;
  }

  #items = $derived.by((): PaintboxColor[] => {
    const list = [...this.#colors];

    switch (this.sortMode) {
      case "hue":
        return list.sort((a, b) => (a.oklch.h || 0) - (b.oklch.h || 0));
      case "lightness":
        return list.sort((a, b) => b.oklch.l - a.oklch.l);
      case "chroma":
        return list.sort((a, b) => b.oklch.c - a.oklch.c);
      case "newest":
        return list.sort((a, b) => b.timestamp - a.timestamp);
      default:
        return list.sort((a, b) => a.timestamp - b.timestamp);
    }
  });

  get items(): PaintboxColor[] {
    return this.#items;
  }

  add(css: string) {
    const item: PaintboxColor = {
      id: crypto.randomUUID(),
      css,
      timestamp: Date.now(),
      oklch: oklchOf(css),
    };

    // Merge with storage so a color added by another tab in the same moment is not overwritten.
    this.#colors = mergePaintbox([...this.#colors, item], this.#readStored(), PAINTBOX.MAX_COLORS);
  }

  remove(id: string) {
    this.#colors = this.#colors.filter((c) => c.id !== id);
  }

  clear() {
    this.#colors = [];
  }
}
