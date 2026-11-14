import { beforeEach, describe, expect, it } from "vitest";
import { PAINTBOX } from "../constants";
import { PaintboxStore } from "./paintbox.svelte";

const stored = () => JSON.parse(localStorage.getItem(PAINTBOX.STORAGE_KEY) ?? "[]") as Array<{ css: string }>;

describe("PaintboxStore", () => {
  beforeEach(() => localStorage.clear());

  it("writes every change to storage", () => {
    const store = new PaintboxStore();
    store.init();

    store.add("#ff0000");
    expect(stored().map((item) => item.css)).toEqual(["#ff0000"]);

    store.remove(store.items[0]?.id ?? "");
    expect(stored()).toEqual([]);

    store.add("#00ff00");
    store.clear();
    expect(stored()).toEqual([]);

    store.destroy();
  });

  it("adopts colors written by another tab", () => {
    const store = new PaintboxStore();
    store.init();
    const other = [{ id: "x", css: "#00ff00", timestamp: 1, oklch: { l: 0.5, c: 0.1, h: 120, alpha: 1 } }];

    localStorage.setItem(PAINTBOX.STORAGE_KEY, JSON.stringify(other));
    window.dispatchEvent(new StorageEvent("storage", { key: PAINTBOX.STORAGE_KEY }));

    expect(store.items.map((item) => item.css)).toEqual(["#00ff00"]);
    store.destroy();
  });
});
