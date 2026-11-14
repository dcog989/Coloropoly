import { PAINTBOX } from "../constants";
import { mergePaintbox, oklchOf, type PaintboxColor, parsePaintbox } from "../utils/paintbox";

export type PaintboxSortMode = "newest" | "oldest" | "hue" | "lightness" | "chroma";

// A corrupt value must survive the failed load so the palette can be recovered by hand.
const CORRUPT_KEY = `${PAINTBOX.STORAGE_KEY}.corrupt`;

export class PaintboxStore {
  #colors = $state<PaintboxColor[]>([]);
  #initialized = false;
  sortMode = $state<PaintboxSortMode>("newest");
  saveError = $state<string | null>(null);

  init() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.#colors = this.#readStored();
    window.addEventListener("storage", this.#onStorage);
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
    const raw = this.#readRaw();
    try {
      return parsePaintbox(raw, PAINTBOX.MAX_COLORS);
    } catch (e) {
      console.error("Failed to load paintbox data:", e);
      try {
        if (raw) localStorage.setItem(CORRUPT_KEY, raw);
      } catch {
        /* Nothing left to back the value up with. */
      }
      return [];
    }
  }

  #readRaw(): string | null {
    try {
      return localStorage.getItem(PAINTBOX.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  #saveToStorage() {
    try {
      localStorage.setItem(PAINTBOX.STORAGE_KEY, JSON.stringify(this.#colors));
      this.saveError = null;
    } catch (e) {
      console.error("Failed to save paintbox data:", e);
      this.saveError = "Could not save the paintbox; storage may be full.";
    }
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
    // shortcut: two tabs adding in the same instant can still write the same stale list and lose one color.
    // Upgrade to one storage key per color if multi-tab editing ever matters.
    this.#colors = mergePaintbox([...this.#colors, item], this.#readStored(), PAINTBOX.MAX_COLORS);
    this.#saveToStorage();
  }

  remove(id: string) {
    this.#colors = this.#colors.filter((c) => c.id !== id);
    this.#saveToStorage();
  }

  clear() {
    this.#colors = [];
    this.#saveToStorage();
  }
}
